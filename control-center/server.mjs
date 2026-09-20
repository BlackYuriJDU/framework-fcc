#!/usr/bin/env node
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import os from 'node:os';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { runClaude } from './lib/claude-runner.mjs';
import { readJson, writeJson, listJsonl, appendJsonl, systemHome, id, listFiles } from './lib/store.mjs';
import { routines, saveRoutines, startScheduler } from './lib/scheduler.mjs';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, 'public');
const clients = new Set();
const active = new Map();
const csrfToken = crypto.randomBytes(24).toString('hex');
const port = Number(process.env.VERTEXION_PORT || 3741);

function isLoopback(address = '') { return ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(address); }
function allowedHost(host = '') { return host === `localhost:${port}` || host === `127.0.0.1:${port}` || host === `[::1]:${port}`; }
function sendEvent(data) { const message = `data: ${JSON.stringify(data)}\n\n`; for (const client of clients) { try { client.write(message); } catch { clients.delete(client); } } }
function json(res, status, data) { res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' }); res.end(JSON.stringify(data)); }
function body(req, max = 1_000_000) { return new Promise((resolve, reject) => { let data = ''; req.on('data', chunk => { data += chunk; if (data.length > max) reject(new Error('Payload excede o limite')); }); req.on('end', () => { try { resolve(JSON.parse(data || '{}')); } catch { reject(new Error('JSON inválido')); } }); req.on('error', reject); }); }
function readFile(file, fallback = '') { try { return fs.readFileSync(file, 'utf8'); } catch { return fallback; } }
function readFileJson(file, fallback) { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; } }
function safeStaticPath(requestPath) { const relative = requestPath === '/' ? 'index.html' : decodeURIComponent(requestPath.slice(1)); const target = path.resolve(publicDir, relative); const relation = path.relative(publicDir, target); if (relation.startsWith('..') || path.isAbsolute(relation)) return null; return target; }
function serveStatic(res, pathname) {
  const file = safeStaticPath(pathname);
  if (!file || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); return res.end('Not found'); }
  const type = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json' }[path.extname(file)] || 'application/octet-stream';
  res.writeHead(200, { 'content-type': `${type}; charset=utf-8`, 'cache-control': file.endsWith('index.html') ? 'no-store' : 'public, max-age=300', 'x-content-type-options': 'nosniff', 'content-security-policy': "default-src 'self'; style-src 'self'; script-src 'self'; connect-src 'self'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'" });
  fs.createReadStream(file).pipe(res);
}
function loadPortfolio() { try { return JSON.parse(fs.readFileSync(path.join(systemHome, 'portfolio', 'projects.json'), 'utf8')); } catch { return { projects: [] }; } }
function savePortfolio(data) { const file = path.join(systemHome, 'portfolio', 'projects.json'); fs.mkdirSync(path.dirname(file), { recursive: true }); const temp = `${file}.tmp`; fs.writeFileSync(temp, JSON.stringify(data, null, 2) + '\n'); fs.renameSync(temp, file); }
function projects() { return loadPortfolio().projects || []; }
function cwdFor(projectId) { if (projectId === 'general') return systemHome; const project = projects().find(item => item.id === projectId); if (!project) throw new Error('Projeto desconhecido'); if (!project.path || !fs.existsSync(project.path)) throw new Error(`Caminho do projeto ${project.name} ainda não foi descoberto ou não existe.`); return project.path; }
function launch(payload) { const cwd = cwdFor(payload.projectId || 'general'); const result = runClaude({ ...payload, cwd, onEvent: sendEvent, onComplete: () => active.delete(result.executionId) }); active.set(result.executionId, { child: result.child, meta: result.meta }); return result.executionId; }
function listIdeas() {
  const root = path.join(systemHome, 'state', 'product-intelligence', 'ideas');
  let dirs = []; try { dirs = fs.readdirSync(root, { withFileTypes: true }).filter(x => x.isDirectory()); } catch { return []; }
  return dirs.map(entry => {
    const dir = path.join(root, entry.name);
    const meta = readFileJson(path.join(dir, 'meta.json'), {});
    const summary = readFile(path.join(dir, 'summary.md'), '').slice(0, 500);
    const stat = fs.statSync(dir);
    return { id: entry.name, title: meta.title || entry.name.replaceAll('-', ' '), status: meta.status || 'em análise', score: meta.score ?? null, confidence: meta.confidence ?? null, evidenceLevel: meta.evidenceLevel ?? null, modifiedAt: stat.mtime.toISOString(), summary };
  }).sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
}
function ideaDetail(ideaId) {
  const root = path.join(systemHome, 'state', 'product-intelligence', 'ideas', ideaId);
  if (!fs.existsSync(root)) return null;
  const files = listFiles(root, { extensions: ['.json', '.md', '.txt'], limit: 40 });
  const meta = readFileJson(path.join(root, 'meta.json'), {});
  const sections = {};
  for (const section of ['summary.md', 'hypotheses.md', 'evidence.md', 'competitors.md', 'experiment.md', 'decision.md', 'result.md']) {
    const full = path.join(root, section); if (fs.existsSync(full)) sections[section] = readFile(full, '');
  }
  return { id: ideaId, meta, sections, files };
}
function reports() { const root = path.join(systemHome, 'reports'); return listFiles(root, { extensions: ['.md', '.json', '.csv'], limit: 120 }).map(file => ({ ...file, path: undefined })); }
function reportContent(relative) { const root = path.join(systemHome, 'reports'); const full = path.resolve(root, relative); if (!full.startsWith(root)) throw new Error('Caminho inválido'); if (!fs.existsSync(full)) throw new Error('Relatório não encontrado'); return { relative, content: readFile(full, ''), ext: path.extname(full).toLowerCase() } }
function bestLeadFile() { return path.join(systemHome, 'state', 'growth', 'best-lead.json'); }
function bestLead() { return readFileJson(bestLeadFile(), null) || readJson('best-lead.json', null); }
function leadDirectories() { return [path.join(systemHome, 'state', 'growth', 'leads'), path.join(systemHome, 'teams', 'growth-engine', 'data', 'leads')]; }
function listLeads() {
  const out = [];
  const seen = new Set();
  for (const dir of leadDirectories()) {
    let entries = []; try { entries = fs.readdirSync(dir); } catch { continue; }
    for (const entry of entries) {
      const full = path.join(dir, entry); if (!entry.endsWith('.json')) continue;
      const item = readFileJson(full, null); if (!item) continue;
      const key = item.id || item.whatsapp || item.instagram || item.nome || entry;
      if (seen.has(key)) continue;
      seen.add(key);
      const score = Number(item._score ?? item.score ?? item.pontuacao ?? 0) || 0;
      out.push({
        id: item.id || entry.replace(/\.json$/, ''),
        name: item.nome || item.name || item.estabelecimento || 'Lead',
        city: item.cidade || '',
        state: item.estado || '',
        segment: item.segmento || item.nicho || item.tipo || '',
        instagram: item.instagram || '',
        whatsapp: item.whatsapp || '',
        email: item.email || '',
        source: item.source || item.fonte || 'local',
        status: item.status || 'novo',
        score,
        observedProblem: item.problemaObservado || item.resumo || item.observacoes || '',
        message: item.message || item.outreachMessage || '',
        loomScript: item.loomScript || '',
        createdAt: item.createdAt || item.generatedAt || new Date().toISOString(),
      });
    }
  }
  const best = bestLead();
  if (best?.best) {
    const b = best.best;
    const exists = out.some(x => x.name === (b.nome || b.name) && x.instagram === (b.instagram || ''));
    if (!exists) out.unshift({ id: 'best-lead-inline', name: b.nome || b.name || 'Lead', city: b.cidade || '', state: b.estado || '', segment: b.segmento || '', instagram: b.instagram || '', whatsapp: b.whatsapp || '', email: b.email || '', source: 'best-lead', status: 'prioritário', score: Number(b._score ?? b.score ?? 0) || 0, observedProblem: b.problemaObservado || b.resumo || '', message: best.message || b.message || '', loomScript: best.loomScript || b.loomScript || '', createdAt: best.generatedAt || new Date().toISOString() });
  }
  return out.sort((a,b) => (b.score||0) - (a.score||0)).slice(0, 500);
}
function persistBestLeadMessage(payload) {
  const current = bestLead() || { best: {} };
  const next = { ...current, ...payload, updatedAt: new Date().toISOString() };
  fs.mkdirSync(path.dirname(bestLeadFile()), { recursive: true });
  fs.writeFileSync(bestLeadFile(), JSON.stringify(next, null, 2) + '\n');
  return next;
}
function defaultLeadMessage(lead) {
  const name = lead?.name || lead?.nome || 'pessoal';
  const channel = lead?.whatsapp ? 'WhatsApp' : lead?.instagram ? 'Instagram' : 'contato';
  return `Olá, ${name}! Tudo bem? Vi o seu negócio e percebi que vocês parecem ativos e com boa presença, mas ainda podem melhorar a experiência de cardápio e atendimento digital. Trabalho com o seu-projeto, uma solução para cardápio digital pensada para restaurantes no Brasil. Se fizer sentido, posso te mostrar rapidamente como isso poderia ficar no seu caso. Posso te mandar um exemplo por ${channel}?`;
}
function defaultLoomScript(lead) {
  return `Roteiro Loom (até 2 min)\n1. Apresentação rápida e contextualizada para ${lead?.name || 'o lead'}.\n2. Mostrar a dor observada: ${lead?.observedProblem || 'ausência de cardápio digital/organização de informações'}.\n3. Mostrar como o seu-projeto resolveria isso de forma prática.\n4. Encerrar com convite simples para conversar.`;
}
function metrics() {
  const leads = listLeads();
  const approvals = readJson('approvals.json', []);
  const ideas = listIdeas();
  const executions = listJsonl('executions.jsonl', 600);
  const completed = executions.filter(x => x.status === 'completed').length;
  const failed = executions.filter(x => x.status === 'failed').length;
  return {
    projects: projects().length,
    activeExecutions: active.size,
    pendingApprovals: approvals.filter(x => x.status === 'pending').length,
    ideas: ideas.length,
    leads: leads.length,
    topLeadScore: Math.max(0, ...leads.map(x => x.score || 0)),
    completedExecutions: completed,
    failedExecutions: failed,
  };
}
function systemHealth() {
  const checks = [];
  function command(name, shellCommand) {
    const result = spawnSync('bash', ['-c', shellCommand], { encoding: 'utf8', timeout: 5000 });
    checks.push({ name, ok: result.status === 0 && Boolean((result.stdout || '').trim()), detail: (result.stdout || result.stderr || '').trim().split('\n')[0] || 'não encontrado' });
  }
  command('node', 'node --version'); command('npm', 'npm --version'); command('git', 'git --version'); command('claude', 'command -v claude'); command('fcc-claude', 'command -v fcc-claude');
  checks.push({ name: 'system-home', ok: fs.existsSync(systemHome), detail: systemHome });
  checks.push({ name: 'projects-resolved', ok: projects().some(p => p.path && fs.existsSync(p.path)), detail: `${projects().filter(p => p.path && fs.existsSync(p.path)).length}/${projects().length}` });
  const latestBackup = (() => { try { return readFile(path.join(os.homedir(), '.claude', 'backups', 'vertexion-last-backup.txt'), '').trim() || 'não encontrado'; } catch { return 'não encontrado'; }})();
  checks.push({ name: 'latest-backup', ok: latestBackup !== 'não encontrado', detail: latestBackup });
  return checks;
}
function backups() {
  const root = path.join(os.homedir(), '.claude', 'backups');
  try { return fs.readdirSync(root, { withFileTypes: true }).filter(x => x.isDirectory()).map(x => ({ name: x.name, path: path.join(root, x.name) })).sort((a,b) => b.name.localeCompare(a.name)).slice(0, 20); } catch { return []; }
}
function requireMutationAuth(req, res) { const origin = req.headers.origin; if (origin && ![`http://localhost:${port}`, `http://127.0.0.1:${port}`].includes(origin)) { json(res, 403, { error: 'Origem recusada' }); return false; } if (req.headers['x-vertexion-csrf'] !== csrfToken) { json(res, 403, { error: 'Token local inválido' }); return false; } return true; }

const server = http.createServer(async (req, res) => {
  if (!allowedHost(req.headers.host || '') || !isLoopback(req.socket.remoteAddress)) { res.writeHead(403); return res.end('Localhost only'); }
  const requestUrl = new URL(req.url, `http://localhost:${port}`);
  const pathname = requestUrl.pathname;

  if (req.method === 'GET' && pathname === '/api/events') {
    res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache', connection: 'keep-alive', 'x-accel-buffering': 'no' });
    res.write(`data: ${JSON.stringify({ type: 'connected', at: new Date().toISOString() })}\n\n`);
    clients.add(res); const heartbeat = setInterval(() => res.write(': heartbeat\n\n'), 20_000);
    req.on('close', () => { clearInterval(heartbeat); clients.delete(res); }); return;
  }
  if (req.method === 'GET' && pathname === '/api/health') return json(res, 200, { ok: true, at: new Date().toISOString(), checks: systemHealth(), active: active.size });
  if (req.method === 'GET' && pathname === '/api/bootstrap') return json(res, 200, { csrfToken, projects: projects(), routines: routines(), executions: listJsonl('executions.jsonl', 120), approvals: readJson('approvals.json', []), active: [...active.entries()].map(([executionId, value]) => ({ executionId, ...value.meta })), ideas: listIdeas(), reports: reports(), bestLead: bestLead(), leads: listLeads(), health: systemHealth(), metrics: metrics(), backups: backups() });
  if (req.method === 'GET' && pathname === '/api/leads') return json(res, 200, { items: listLeads(), bestLead: bestLead() });
  if (req.method === 'GET' && pathname.startsWith('/api/ideas/')) return json(res, 200, ideaDetail(pathname.split('/').pop()) || { error: 'Ideia não encontrada' });
  if (req.method === 'GET' && pathname.startsWith('/api/reports/')) { try { return json(res, 200, reportContent(decodeURIComponent(pathname.replace('/api/reports/', '')))); } catch (e) { return json(res, 404, { error: e.message }); } }
  if (req.method === 'GET' && pathname === '/api/backups') return json(res, 200, { items: backups() });

  if (req.method === 'POST' && pathname === '/api/hooks') {
    try { const payload = await body(req, 100_000); appendJsonl('dashboard-hooks.jsonl', payload); sendEvent({ type: 'hook', event: payload }); return json(res, 200, { ok: true }); } catch { return json(res, 200, { ok: false }); }
  }
  if (['POST', 'PATCH', 'DELETE'].includes(req.method) && !requireMutationAuth(req, res)) return;

  try {
    if (req.method === 'POST' && pathname === '/api/tasks') {
      const payload = await body(req);
      if (typeof payload.prompt !== 'string' || payload.prompt.trim().length < 3) return json(res, 400, { error: 'Descreva a tarefa' });
      if (payload.prompt.length > 30_000) return json(res, 400, { error: 'Tarefa longa demais' });
      const executionId = launch({ prompt: payload.prompt.trim(), projectId: payload.projectId || 'general', mode: ['analyze', 'deep', 'implement'].includes(payload.mode) ? payload.mode : 'analyze' });
      return json(res, 202, { executionId });
    }
    if (req.method === 'POST' && /^\/api\/executions\/[^/]+\/stop$/.test(pathname)) {
      const executionId = pathname.split('/')[3]; const running = active.get(executionId); if (!running) return json(res, 404, { error: 'Execução não está ativa' });
      running.child.kill('SIGTERM'); setTimeout(() => { if (!running.child.killed) running.child.kill('SIGKILL'); }, 5000).unref(); return json(res, 202, { ok: true });
    }
    if (req.method === 'POST' && pathname === '/api/approvals') {
      const payload = await body(req); const list = readJson('approvals.json', []); const item = { id: id('approval'), status: 'pending', createdAt: new Date().toISOString(), ...payload };
      list.unshift(item); writeJson('approvals.json', list); sendEvent({ type: 'approval', item }); return json(res, 201, item);
    }
    if (req.method === 'PATCH' && pathname.startsWith('/api/approvals/')) {
      const approvalId = pathname.split('/').pop(); const payload = await body(req); const list = readJson('approvals.json', []); const item = list.find(x => x.id === approvalId); if (!item) return json(res, 404, { error: 'Aprovação não encontrada' });
      item.status = payload.status || item.status; item.updatedAt = new Date().toISOString(); if (payload.note) item.note = payload.note; writeJson('approvals.json', list); sendEvent({ type: 'approval-update', item }); return json(res, 200, item);
    }
    if (req.method === 'PATCH' && pathname.startsWith('/api/projects/')) {
      const projectId = pathname.split('/').pop(); const payload = await body(req); const data = loadPortfolio(); const project = (data.projects || []).find(x => x.id === projectId); if (!project) return json(res, 404, { error: 'Projeto não encontrado' });
      if (typeof payload.path === 'string') project.path = payload.path.trim(); savePortfolio(data); return json(res, 200, project);
    }
    if (req.method === 'PATCH' && pathname.startsWith('/api/routines/')) {
      const routineId = pathname.split('/').pop(); const payload = await body(req); const list = routines(); const routine = list.find(x => x.id === routineId); if (!routine) return json(res, 404, { error: 'Rotina não encontrada' }); Object.assign(routine, payload); saveRoutines(list); return json(res, 200, routine);
    }
    if (req.method === 'POST' && pathname.endsWith('/run') && pathname.startsWith('/api/routines/')) {
      const routineId = pathname.split('/')[3]; const routine = routines().find(x => x.id === routineId); if (!routine) return json(res, 404, { error: 'Rotina não encontrada' });
      const executionId = launch({ prompt: routine.prompt, projectId: 'general', mode: 'deep' }); return json(res, 202, { executionId, routine });
    }
    if (req.method === 'PATCH' && pathname === '/api/best-lead') {
      const payload = await body(req); const next = persistBestLeadMessage(payload); return json(res, 200, next);
    }
    if (req.method === 'POST' && pathname === '/api/best-lead/generate') {
      const current = bestLead() || { best: {} }; const lead = current.best || current; current.message = current.message || defaultLeadMessage(lead); current.loomScript = current.loomScript || defaultLoomScript({ ...lead, observedProblem: lead.problemaObservado || lead.resumo || current.observedProblem }); current.generatedAt = new Date().toISOString(); persistBestLeadMessage(current); return json(res, 200, current);
    }
  } catch (error) { return json(res, 500, { error: error.message || 'Erro interno' }); }

  return serveStatic(res, pathname);
});

const stopScheduler = startScheduler(routine => { const executionId = launch({ prompt: routine.prompt, projectId: 'general', mode: 'deep' }); return Promise.resolve(executionId); });
process.on('SIGTERM', () => { stopScheduler(); server.close(() => process.exit(0)); });
server.listen(port, '127.0.0.1', () => { console.log(`Vertexion Control Center em http://localhost:${port}`); });
