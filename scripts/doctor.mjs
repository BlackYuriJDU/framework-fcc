#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';

const jsonMode = process.argv.includes('--json');
const home = path.join(os.homedir(), '.claude');
const systemHome = path.join(home, 'vertexion-agent-system');
const checks = [];

function add(name, ok, detail, severity = 'required') { checks.push({ name, ok: Boolean(ok), detail: String(detail || ''), severity }); }
function command(name, args = ['--version'], severity = 'required') {
  const result = spawnSync(name, args, { encoding: 'utf8', timeout: 8000 });
  add(name, result.status === 0, (result.stdout || result.stderr || '').trim().split('\n')[0] || 'não encontrado', severity);
  return result;
}

const nodeResult = command('node');
const major = Number((nodeResult.stdout || '').match(/v(\d+)/)?.[1] || 0);
if (major && major < 20) add('node-version', false, `Node ${major}; necessário >=20`);
command('npm', ['--version'], 'recommended');
command('git', ['--version']);
const claude = spawnSync('bash', ['-c', 'command -v claude || true'], { encoding: 'utf8' }).stdout.trim();
const fcc = spawnSync('bash', ['-c', 'command -v fcc-claude || true'], { encoding: 'utf8' }).stdout.trim();
add('claude', Boolean(claude), claude || 'não encontrado');
add('fcc-claude', Boolean(fcc), fcc || 'não encontrado; o sistema usará claude', 'optional');
add('system-home', fs.existsSync(systemHome), systemHome);
add('default-agent', fs.existsSync(path.join(home, 'agents', 'control', 'control-tesla.md')), 'control-tesla');
const skillsDir = path.join(home, 'skills');
let skills = []; try { skills = fs.readdirSync(skillsDir).filter(name => fs.existsSync(path.join(skillsDir, name, 'SKILL.md'))); } catch {}
add('visible-skills', skills.length === 3 && ['revisar', 'validar', 'preview'].every(x => skills.includes(x)), skills.join(', '));
try {
  const settings = JSON.parse(fs.readFileSync(path.join(home, 'settings.json'), 'utf8'));
  add('settings-agent', settings.agent === 'control-tesla', settings.agent || 'não configurado');
  add('settings-model', settings.model === 'opus', settings.model || 'não configurado', 'recommended');
} catch (error) { add('settings-json', false, error.message); }
add('tavily-env', Boolean(process.env.TAVILY_API_KEY), process.env.TAVILY_API_KEY ? 'configurada' : 'não configurada; pesquisa usará outras ferramentas', 'optional');
add('groq-env', Boolean(process.env.GROQ_API_KEY), process.env.GROQ_API_KEY ? 'configurada' : 'não configurada; Growth Engine real ficará desativado', 'optional');

const serverCheck = await new Promise(resolve => {
  const socket = net.createConnection({ host: '127.0.0.1', port: 3741 });
  socket.setTimeout(700);
  socket.on('connect', () => { socket.destroy(); resolve(true); });
  socket.on('timeout', () => { socket.destroy(); resolve(false); });
  socket.on('error', () => resolve(false));
});
add('control-center', serverCheck, serverCheck ? 'http://localhost:3741' : 'parado; use vertexion-start', 'optional');

const registryFile = path.join(systemHome, 'orchestrators', 'registry.json');
try { const registry = JSON.parse(fs.readFileSync(registryFile, 'utf8')); const ids = (registry.orchestrators || []).map(x => x.id); add('orchestrator-registry', registry.version >= 4 && ids.includes('tesla') && ids.includes('einstein') && ids.includes('da-vinci'), `v${registry.version} / ${ids.join(', ')}`); } catch (error) { add('orchestrator-registry', false, error.message); }
add('task-contract-schema', fs.existsSync(path.join(systemHome, 'contracts', 'task-contract.schema.json')), 'contracts/task-contract.schema.json');
add('control-evaluator', fs.existsSync(path.join(home, 'agents', 'control', 'control-evaluator.md')), 'control-evaluator');

const failedRequired = checks.filter(x => !x.ok && x.severity === 'required');
if (jsonMode) console.log(JSON.stringify({ ok: failedRequired.length === 0, checks }, null, 2));
else {
  console.log('\nVertexion Doctor\n');
  console.table(checks.map(x => ({ item: x.name, status: x.ok ? 'OK' : x.severity === 'required' ? 'FALHA' : 'AVISO', detalhe: x.detail })));
  console.log(failedRequired.length ? `\n${failedRequired.length} falha(s) obrigatória(s).` : '\nAmbiente essencial aprovado.');
}
process.exit(failedRequired.length ? 1 : 0);
