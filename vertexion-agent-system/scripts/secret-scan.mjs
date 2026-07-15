#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const target = path.resolve(process.argv[2] || '.');
const ignored = new Set(['node_modules', '.git', 'dist', 'build', '.next', '.expo', 'coverage']);
const patterns = [
  ['private-key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ['generic-secret', /\b(?:api[_-]?key|secret|token|service[_-]?role|client[_-]?secret)\b\s*[:=]\s*["'][A-Za-z0-9_\-\.]{20,}["']/i],
  ['tavily', /tvly-[A-Za-z0-9_-]{20,}/],
  ['groq', /gsk_[A-Za-z0-9]{20,}/],
  ['openai-like', /\bsk-[A-Za-z0-9_-]{24,}/],
  ['jwt', /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}/],
];
const findings = [];
function walk(dir) {
  let entries; try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const entry of entries) {
    if (ignored.has(entry.name) || entry.isSymbolicLink()) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else {
      let stat; try { stat = fs.statSync(full); } catch { continue; }
      if (stat.size > 2_000_000) continue;
      let text; try { text = fs.readFileSync(full, 'utf8'); } catch { continue; }
      text.split('\n').forEach((line, index) => {
        for (const [type, regex] of patterns) if (regex.test(line)) { findings.push({ file: path.relative(target, full), line: index + 1, type }); break; }
      });
    }
  }
}
walk(target);
console.log(JSON.stringify({ target, findings, note: 'Valores nunca são exibidos.' }, null, 2));
process.exit(findings.length ? 1 : 0);
