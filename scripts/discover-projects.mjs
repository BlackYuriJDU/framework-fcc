#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const systemHome = path.join(os.homedir(), '.claude', 'vertexion-agent-system');
const portfolioPath = path.join(systemHome, 'portfolio', 'projects.json');
const portfolio = JSON.parse(fs.readFileSync(portfolioPath, 'utf8'));
const requestedRoots = process.argv.slice(2).filter(x => !x.startsWith('--'));
const roots = requestedRoots.length ? requestedRoots : portfolio.workspaceRoots;
const ignored = new Set(['node_modules', '.git', 'dist', 'build', '.expo', '.next', '.cache', '.turbo', '.vite', 'coverage', 'backups']);
const nameTokens = {
  zapmenu: ['zapmenu'], firmis: ['firmis', 'novo-projeto-construcao-civil', 'construcao-civil'],
};
const candidates = [];

function inspect(dir) {
  const files = new Set();
  try { for (const entry of fs.readdirSync(dir)) files.add(entry.toLowerCase()); } catch { return null; }
  if (!files.has('package.json') && !files.has('pyproject.toml') && !files.has('cargo.toml')) return null;
  let packageName = '';
  try { packageName = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8')).name || ''; } catch {}
  return { dir, files, packageName: String(packageName).toLowerCase() };
}
function walk(dir, depth = 0) {
  if (depth > 6) return;
  let entries; try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  const inspected = inspect(dir); if (inspected) candidates.push(inspected);
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.isSymbolicLink() || ignored.has(entry.name.toLowerCase())) continue;
    walk(path.join(dir, entry.name), depth + 1);
  }
}
for (const root of roots) if (root && fs.existsSync(root)) walk(root);

const report = [];
for (const project of portfolio.projects) {
  const tokens = nameTokens[project.id] || [project.id];
  const ranked = candidates.map(candidate => {
    const lower = candidate.dir.toLowerCase();
    let score = 0;
    for (const token of tokens) {
      if (path.basename(lower).includes(token)) score += 8;
      if (lower.includes(token)) score += 4;
      if (candidate.packageName.includes(token)) score += 10;
    }
    if (candidate.files.has('supabase')) score += 1;
    if (candidate.files.has('app.json') || candidate.files.has('app.config.ts')) score += 4;
    return { path: candidate.dir, score, packageName: candidate.packageName };
  }).filter(x => x.score > 0).sort((a, b) => b.score - a.score || a.path.length - b.path.length);
  const best = ranked[0];
  const ambiguous = best && ranked[1] && ranked[1].score === best.score;
  if (best && !ambiguous) project.path = best.path;
  report.push({ id: project.id, selected: best && !ambiguous ? best.path : null, ambiguous: Boolean(ambiguous), candidates: ranked.slice(0, 5) });
}

const temp = `${portfolioPath}.tmp`;
fs.writeFileSync(temp, JSON.stringify(portfolio, null, 2) + '\n');
fs.renameSync(temp, portfolioPath);
const reportPath = path.join(systemHome, 'reports', 'project-discovery.json');
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, JSON.stringify({ at: new Date().toISOString(), roots, report }, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
