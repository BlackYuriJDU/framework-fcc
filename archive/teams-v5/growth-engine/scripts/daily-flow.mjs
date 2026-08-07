#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';

const growthRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const systemHome = process.env.VERTEXION_SYSTEM_HOME || path.join(os.homedir(), '.claude', 'vertexion-agent-system');
const reportDir = path.join(systemHome, 'reports', 'growth');
fs.mkdirSync(reportDir, { recursive: true });

if (!fs.existsSync(path.join(growthRoot, 'node_modules'))) {
  console.error('Growth Engine não configurado. Execute vertexion-setup-growth explicitamente.');
  process.exit(3);
}

const scout = spawnSync(process.execPath, [path.join(growthRoot, 'src', 'scout', 'scout.js')], {
  cwd: growthRoot,
  env: { ...process.env, VERTEXION_SYSTEM_HOME: systemHome },
  encoding: 'utf8',
  timeout: 30 * 60 * 1000,
});

const best = scout.status === 0 ? spawnSync(process.execPath, [path.join(growthRoot, 'src', 'growth', 'best-lead.js')], {
  cwd: growthRoot,
  env: { ...process.env, VERTEXION_SYSTEM_HOME: systemHome },
  encoding: 'utf8',
  timeout: 30_000,
}) : null;

const result = {
  at: new Date().toISOString(),
  scout: { ok: scout.status === 0, exitCode: scout.status, stdoutTail: (scout.stdout || '').slice(-8000), stderrTail: (scout.stderr || '').slice(-4000) },
  bestLead: best ? { ok: best.status === 0, exitCode: best.status, stdout: (best.stdout || '').slice(-12000), stderr: (best.stderr || '').slice(-2000) } : null,
};
const date = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(reportDir, `daily-${date}.json`), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(result, null, 2));
process.exit(scout.status ?? 1);
