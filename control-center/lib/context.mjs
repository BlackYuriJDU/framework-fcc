import fs from 'node:fs';
import path from 'node:path';

const MAX_BUDGET = { system: 6000, task: 5000, memory: 4000, knowledge: 7000, tools: 5000, reserve: 5000 };
const CHARS_PER_TOKEN = 4;
const pointers = {
  engineering: ['rules/engineering.md','rules/security.md','rules/evidence-ledger.md'],
  reliability: ['rules/engineering.md','rules/security-checklist.md','rules/evidence-ledger.md'],
  security: ['rules/security.md','rules/security-checklist.md','rules/evidence-ledger.md'],
  growth: ['rules/growth.md','rules/research.md','rules/product-evidence.md'],
  marketing: ['rules/growth.md','rules/research.md'],
  finance: ['rules/product-evidence.md','rules/growth.md'],
  legal: ['rules/research.md','rules/external-actions.md'],
  design: ['rules/design.md','rules/design/checklist.md','rules/design/system.md'],
  experience: ['rules/design.md','rules/design/checklist.md','rules/design/system.md']
};

function readText(file) { try { return fs.readFileSync(file, 'utf8'); } catch { return null; } }
function budgetText(text, tokens) {
  if (!text) return null;
  const maxChars = tokens * CHARS_PER_TOKEN;
  if (text.length <= maxChars) return text;
  return `${text.slice(0, Math.max(0, maxChars - 80))}\n\n[TRUNCATED_BY_CONTEXT_BUDGET]`;
}
function loadBlocks(systemHome, entries, budget) {
  const per = Math.max(1, Math.floor(budget / Math.max(1, entries.length)));
  const blocks = []; let used = 0;
  for (const rel of entries) {
    const text = readText(path.join(systemHome, rel));
    if (!text) continue;
    const snippet = budgetText(text, per);
    blocks.push({ path: rel, content: snippet });
    used += Math.ceil(snippet.length / CHARS_PER_TOKEN);
  }
  return { blocks, estimatedTokens: used, budget };
}

export function buildContext({ systemHome, taskId, domain='engineering', projectId='general', mode='analyze' }) {
  const taskDir = path.join(systemHome,'tasks',String(taskId));
  const memoryIndexRel = 'memory/general/INDEX.md';
  const memoryIndex = path.join(systemHome,memoryIndexRel);
  const taskFiles = [];
  try { for (const name of fs.readdirSync(taskDir)) taskFiles.push(path.relative(systemHome,path.join(taskDir,name))); } catch {}
  const relevant = pointers[domain] || pointers.engineering;
  const taskEntries = taskFiles.filter(f => /^(CONTRACT|STATE|PLAN|DECISIONS|EVIDENCE|RESULT|NEXT|EVALUATION)\./.test(path.basename(f)));
  const task = loadBlocks(systemHome, taskEntries, MAX_BUDGET.task);
  const rules = loadBlocks(systemHome, relevant, MAX_BUDGET.system);
  const memoryText = readText(memoryIndex);
  const memory = {
    blocks: memoryText ? [{ path: memoryIndexRel, content: budgetText(memoryText, MAX_BUDGET.memory) }] : [],
    estimatedTokens: memoryText ? Math.min(Math.ceil(memoryText.length / CHARS_PER_TOKEN), MAX_BUDGET.memory) : 0,
    budget: MAX_BUDGET.memory
  };
  const knowledgeIndexRel = 'knowledge/index.json';
  let knowledgeItems = [];
  try { knowledgeItems = JSON.parse(readText(path.join(systemHome, knowledgeIndexRel)) || '[]'); } catch {}
  const domainKnowledge = knowledgeItems.filter(x => !x.domain || x.domain === domain || (Array.isArray(x.domains) && x.domains.includes(domain))).slice(0, 12);
  const knowledge = {
    sources: domainKnowledge.map(x => ({ id: x.id, title: x.title, url: x.url, verifiedAt: x.verifiedAt, expiresAt: x.expiresAt })),
    estimatedTokens: Math.min(Math.ceil(JSON.stringify(domainKnowledge).length / CHARS_PER_TOKEN), MAX_BUDGET.knowledge),
    budget: MAX_BUDGET.knowledge
  };
  const manifest = {
    budget: MAX_BUDGET,
    enforced: true,
    task: { taskId, projectId, domain, mode },
    taskArtifacts: task,
    memory,
    knowledge,
    rules,
    tools: { budget: MAX_BUDGET.tools, note: 'tool selection is enforced by orchestrator policy' },
    retrieval: 'pointer-first; full content is bounded by per-category token budgets'
  };
  const total = task.estimatedTokens + memory.estimatedTokens + knowledge.estimatedTokens + rules.estimatedTokens;
  const contextBudget = MAX_BUDGET.system + MAX_BUDGET.task + MAX_BUDGET.memory + MAX_BUDGET.knowledge + MAX_BUDGET.tools;
  manifest.usageEstimate = { contextTokens: total, contextBudget, reserve: MAX_BUDGET.reserve, withinBudget: total <= contextBudget };
  return manifest;
}
