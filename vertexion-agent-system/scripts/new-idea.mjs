#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
const title = process.argv.slice(2).join(' ').trim();
if (!title) { console.error('Uso: vertexion-new-idea "Título da ideia"'); process.exit(2); }
const slug = title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
const home = path.join(os.homedir(), '.claude', 'vertexion-agent-system');
const target = path.join(home, 'state', 'product-intelligence', 'ideas', slug);
const templates = path.join(home, 'teams', 'product-intelligence', 'templates');
fs.mkdirSync(target, { recursive: true });
for (const file of fs.readdirSync(templates)) {
  const destination = path.join(target, file);
  if (!fs.existsSync(destination)) fs.copyFileSync(path.join(templates, file), destination);
}
const meta = path.join(target, 'meta.json');
if (!fs.existsSync(meta)) fs.writeFileSync(meta, JSON.stringify({ title, slug, type: null, status: 'intake', opportunityScore: null, score: null, confidence: null, evidenceLevel: 0, verdict: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, null, 2) + '\n');
console.log(target);
