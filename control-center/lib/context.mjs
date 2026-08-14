import fs from 'node:fs';
import path from 'node:path';

const MAX_BUDGET = { system: 6000, task: 5000, memory: 4000, knowledge: 7000, tools: 5000, reserve: 5000 };
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

export function buildContext({ systemHome, taskId, domain='engineering', projectId='general', mode='analyze' }) {
  const taskDir = path.join(systemHome,'tasks',String(taskId));
  const memoryIndex = path.join(systemHome,'memory','general','INDEX.md');
  const taskFiles = [];
  try { for (const name of fs.readdirSync(taskDir)) taskFiles.push(path.relative(systemHome,path.join(taskDir,name))); } catch {}
  const relevant = pointers[domain] || pointers.engineering;
  return {
    budget: MAX_BUDGET,
    task: { taskId, projectId, domain, mode },
    memory: [path.relative(systemHome,memoryIndex)],
    knowledge: [`knowledge/${domain}/`],
    rules: relevant,
    taskArtifacts: taskFiles,
    retrieval: 'pointer-first; load full content only when directly relevant'
  };
}
