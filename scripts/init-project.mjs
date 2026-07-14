#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const target = process.argv[2] ? path.resolve(process.argv[2]) : null;
const force = process.argv.includes('--force');
if (!target) { console.error('Uso: vertexion-init-project <caminho> [--force]'); process.exit(2); }
if (!fs.existsSync(target) || !fs.statSync(target).isDirectory()) { console.error('O caminho precisa ser um diretório existente.'); process.exit(2); }
const template = path.join(os.homedir(), '.claude', 'vertexion-agent-system', 'project-template');
function copy(source, destination) {
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const src = path.join(source, entry.name); const dst = path.join(destination, entry.name);
    if (entry.isDirectory()) { fs.mkdirSync(dst, { recursive: true }); copy(src, dst); }
    else if (force || !fs.existsSync(dst)) fs.copyFileSync(src, dst);
  }
}
copy(template, target);
console.log(`Estrutura técnica criada em ${target}. Arquivos existentes ${force ? 'podem ter sido sobrescritos' : 'foram preservados'}.`);
