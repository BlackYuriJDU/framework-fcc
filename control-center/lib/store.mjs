import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';

export const systemHome = process.env.VERTEXION_SYSTEM_HOME || path.join(os.homedir(), '.claude', 'vertexion-agent-system');
export const dataDir = path.join(systemHome, 'state', 'control-center');
const archiveDir = path.join(systemHome, 'state', 'archives', 'logs');
fs.mkdirSync(dataDir, { recursive: true });
fs.mkdirSync(archiveDir, { recursive: true });
const MAX_BYTES = Number(process.env.VERTEXION_LOG_MAX_BYTES || 1_500_000);
const KEEP_FILES = Number(process.env.VERTEXION_LOG_KEEP || 8);

function safePath(name) {
  const full = path.resolve(dataDir, name);
  if (!full.startsWith(path.resolve(dataDir) + path.sep)) throw new Error('Nome de arquivo inválido');
  return full;
}
function rotateIfNeeded(target) {
  try {
    if (!fs.existsSync(target)) return;
    const stat = fs.statSync(target);
    if (stat.size < MAX_BYTES) return;
    const stamp = new Date().toISOString().replaceAll(':', '-');
    const backup = path.join(archiveDir, `${path.basename(target)}.${stamp}.bak`);
    fs.copyFileSync(target, backup);
    fs.truncateSync(target, 0);
    const files = fs.readdirSync(archiveDir).filter(x => x.startsWith(path.basename(target))).sort().reverse();
    files.slice(KEEP_FILES).forEach(file => fs.rmSync(path.join(archiveDir, file), { force: true }));
  } catch {}
}

export function readJson(name, fallback) { try { return JSON.parse(fs.readFileSync(safePath(name), 'utf8')); } catch { return fallback; } }
export function writeJson(name, data) { const target = safePath(name); fs.mkdirSync(path.dirname(target), { recursive: true }); const temp = `${target}.${process.pid}.tmp`; fs.writeFileSync(temp, JSON.stringify(data, null, 2) + '\n', { mode: 0o600 }); fs.renameSync(temp, target); }
export function appendJsonl(name, data) { const target = safePath(name); rotateIfNeeded(target); fs.appendFileSync(target, JSON.stringify(data) + '\n', { mode: 0o600 }); rotateIfNeeded(target); }
export function id(prefix = 'id') { return `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`; }
export function listJsonl(name, limit = 100) { try { const content = fs.readFileSync(safePath(name), 'utf8').trim(); if (!content) return []; return content.split('\n').filter(Boolean).slice(-limit).reverse().map(line => JSON.parse(line)); } catch { return []; } }
export function listFiles(root, options = {}) {
  const { extensions = [], limit = 100 } = options; const out = [];
  function walk(dir, depth = 0) {
    if (depth > 6 || out.length >= limit) return; let entries = [];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      if (out.length >= limit) break;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full, depth + 1);
      else if (!extensions.length || extensions.includes(path.extname(entry.name).toLowerCase())) {
        const stat = fs.statSync(full); out.push({ name: entry.name, path: full, relative: path.relative(root, full), modifiedAt: stat.mtime.toISOString(), size: stat.size });
      }
    }
  }
  walk(root); return out.sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
}
