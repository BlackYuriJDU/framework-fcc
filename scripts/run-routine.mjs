#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

const routineId = process.argv[2] || 'daily';
const defaults = {
  daily: 'Execute a rotina diária do Vertexion Control. Tente vertexion-growth-daily se configurado; caso Pipedream/Supabase já tenha resultados, ingira sem duplicar. Verifique follow-ups e incidentes, atualize o painel, selecione o melhor lead e prepare mensagem personalizada e Loom. Não envie, não gere custo e silencie sem ação útil.',
  weekly: 'Execute a rotina semanal: compliance, disponibilidade, Marketing Review, documentação, reavaliação de leads, falsos positivos, bloqueios e resumo das equipes.',
  monthly: 'Crie a cápsula do tempo mensal comparando o início, fim e mês anterior, incluindo impactos positivos, negativos, regressões, resultados e incertezas.',
};
if (!defaults[routineId]) { console.error('Rotina válida: daily, weekly ou monthly'); process.exit(2); }

try {
  const bootstrap = await fetch('http://127.0.0.1:3741/api/bootstrap').then(r => r.json());
  const response = await fetch(`http://127.0.0.1:3741/api/routines/${routineId}/run`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-vertexion-csrf': bootstrap.csrfToken }, body: '{}' });
  if (response.ok) { console.log(JSON.stringify(await response.json(), null, 2)); process.exit(0); }
} catch {}

const detected = spawnSync('bash', ['-c', 'command -v fcc-claude || command -v claude || true'], { encoding: 'utf8' }).stdout.trim();
if (!detected) { console.error('Claude Code/FCC não encontrado.'); process.exit(3); }
const systemHome = path.join(os.homedir(), '.claude', 'vertexion-agent-system');
const registry = JSON.parse(fs.readFileSync(path.join(systemHome,'orchestrators','registry.json'),'utf8'));
const routineAgent = routineId === 'daily' || routineId === 'weekly' ? registry.orchestrators.find(x=>x.id==='einstein')?.agent : registry.orchestrators.find(x=>x.id==='tesla')?.agent;
if (!routineAgent) throw new Error('Orchestrator registry missing required routine agent');
const child = spawn(detected, ['-p', defaults[routineId] + '\nCreate/update the Task Contract and persist STATE.yaml before substantial work.', '--agent', 'control-tesla', '--model', 'opus', '--effort', 'high', '--permission-mode', 'default', '--output-format', 'stream-json', '--verbose', '--max-turns', '64'], { cwd: systemHome, stdio: 'inherit', env: { ...process.env, TZ: 'America/Recife' } });
child.on('close', code => process.exit(code ?? 1));
