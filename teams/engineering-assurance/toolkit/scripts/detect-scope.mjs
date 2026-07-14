#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const stateRun = spawnSync(process.execPath, ['.claude/scripts/pipeline-state.mjs'], {
  cwd: process.cwd(),
  encoding: 'utf8',
  maxBuffer: 16 * 1024 * 1024,
});

if (stateRun.status !== 0) {
  process.stderr.write(stateRun.stderr || stateRun.stdout);
  process.exit(1);
}

const state = JSON.parse(stateRun.stdout);
const files = state.changedFiles.map(path => path.replaceAll('\\', '/'));

const match = regex => files.some(path => regex.test(path));
const categories = {
  ui: match(/(^|\/)(src\/)?(app|pages|routes|components|ui|styles)\/|\.(tsx|jsx|css|scss|sass|less|html)$/i),
  supabase: match(/(^|\/)supabase\/|(^|\/)database\/|\.sql$|rls|postgres/i),
  migrations: match(/(^|\/)(migrations?|supabase\/migrations)\/|migration|\.sql$/i),
  payments: match(/payment|billing|checkout|subscription|appmax|stripe|pix|invoice|webhook/i),
  dependencies: match(/(^|\/)(package\.json|package-lock\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lockb?|deno\.lock|requirements\.txt|pyproject\.toml|poetry\.lock|go\.mod|go\.sum)$/i),
  instructions: match(/(^|\/)(CLAUDE|AGENTS|README|CONTRIBUTING)\.md$|(^|\/)\.claude\/|(^|\/)\.github\/workflows\/|(^|\/)scripts\//i),
  auth: match(/auth|session|login|signup|permission|role|policy|token|middleware/i),
  api: match(/(^|\/)(api|server|backend|functions|edge-functions)\/|route\.(ts|js)$|handler/i),
  tests: match(/(^|\/)(__tests__|tests?|e2e)\/|\.(test|spec)\.[^.]+$/i),
};

const suggestedAgents = [
  'code-reviewer',
  'security-auditor',
  'scope-guardian',
  'requirements-checker',
];
if (categories.ui) suggestedAgents.push('uxui-reviewer');
if (categories.supabase) suggestedAgents.push('supabase-auditor');
if (categories.migrations) suggestedAgents.push('migration-guardian');
if (categories.payments) suggestedAgents.push('payment-flow-auditor');
if (categories.dependencies) suggestedAgents.push('dependency-auditor');
if (categories.instructions) suggestedAgents.push('instruction-auditor');

const highRisk = categories.supabase || categories.migrations || categories.payments || categories.auth;

process.stdout.write(`${JSON.stringify({
  ...state,
  categories,
  riskLevel: highRisk ? 'HIGH' : categories.ui || categories.api ? 'MEDIUM' : 'LOW',
  suggestedAgents: [...new Set(suggestedAgents)],
}, null, 2)}\n`);
