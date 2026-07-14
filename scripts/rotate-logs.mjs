#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const systemHome = process.env.VERTEXION_SYSTEM_HOME || path.join(os.homedir(), '.claude', 'vertexion-agent-system');
const stateDir = path.join(systemHome, 'state', 'control-center');
const archiveDir = path.join(systemHome, 'state', 'archives', 'logs');
const maxBytes = Number(process.env.VERTEXION_LOG_MAX_BYTES || 1_500_000);
const keepFiles = Number(process.env.VERTEXION_LOG_KEEP || 8);

fs.mkdirSync(archiveDir, { recursive: true });
const files = ['execution-events.jsonl', 'executions.jsonl', 'dashboard-hooks.jsonl', 'control-center.log'];
const now = new Date().toISOString().replaceAll(':', '-');
let rotated = 0;
for (const file of files) {
  const full = path.join(stateDir, file);
  if (!fs.existsSync(full)) continue;
  const stat = fs.statSync(full);
  if (stat.size < maxBytes) continue;
  const target = path.join(archiveDir, `${file}.${now}.bak`);
  fs.copyFileSync(full, target);
  fs.truncateSync(full, 0);
  rotated++;
}
for (const basename of files) {
  const entries = fs.readdirSync(archiveDir).filter(x => x.startsWith(`${basename}.`)).sort().reverse();
  entries.slice(keepFiles).forEach(x => fs.rmSync(path.join(archiveDir, x), { force: true }));
}
console.log(JSON.stringify({ ok: true, rotated, archivedAt: now, stateDir, archiveDir }));
