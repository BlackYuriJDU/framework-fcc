const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
let state = { projects: [], routines: [], executions: [], approvals: [], active: [], ideas: [], reports: [], bestLead: null, leads: [], health: [], metrics: {}, backups: [], csrfToken: '' };
let view = 'home';
let events = [];
let selectedExecution = null;
let reportSelected = null;
let reportContent = '';
let selectedIdea = null;
let ideaDetail = null;
let ideaTab = 'summary.md';

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
function toast(message) { const el = $('#toast'); el.textContent = message; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 2800); }
async function api(path, options = {}) { const headers = { ...(options.body ? { 'content-type': 'application/json' } : {}), ...(options.headers || {}) }; if (options.method && options.method !== 'GET') headers['x-vertexion-csrf'] = state.csrfToken; const response = await fetch(path, { ...options, headers }); const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.error || response.statusText); return data; }
function statusBadge(status) { const s = String(status || 'desconhecido').toLowerCase(); const color = /completed|aprovado|ativo|pronto|success|lançamento/.test(s) ? 'green' : /failed|reprovado|erro|critical/.test(s) ? 'red' : /ideia|análise|running|pending|pausado|mvp|quebrado/.test(s) ? 'purple' : /prioridade|revisão/.test(s) ? 'yellow' : 'blue'; return `<span class="badge ${color}">${esc(status || 'desconhecido')}</span>`; }
function formatDate(value) { try { return new Date(value).toLocaleString('pt-BR'); } catch { return value || '—'; } }
function navTitle() { return { home: 'Visão geral', run: 'Nova tarefa', projects: 'Projetos', leads: 'Leads', ideas: 'Ideias', routines: 'Rotinas', approvals: 'Aprovações', reports: 'Relatórios', activity: 'Atividade', system: 'Sistema' }[view]; }
function eventText(item) { const event = item?.event ?? item; if (!event) return ''; if (typeof event === 'string') return event; if (event.type === 'assistant' && Array.isArray(event.message?.content)) return event.message.content.map(x => x.text || `[${x.type}]`).join('\n'); if (event.type === 'result') return event.result || JSON.stringify(event); if (event.type === 'text') return event.text || ''; if (event.type === 'tool_use') return `Ferramenta: ${event.name || event.tool_name || ''}`; if (event.type === 'execution-start') return `Execução iniciada: ${event.executionId}`; if (event.type === 'execution-end') return `Execução encerrada: ${event.status}`; if (event.type === 'stderr') return `ERRO: ${event.text}`; return JSON.stringify(event); }
function summaryMetric(title, value, sub) { return `<div class="card metric"><div class="metric-kicker">${esc(title)}</div><strong>${esc(value)}</strong><small>${esc(sub)}</small></div>`; }
function bestLeadData() { return state.bestLead?.best || state.bestLead || null; }
function bestLeadCard(full = false) {
  const wrapper = full ? 'card full' : 'card side';
  const item = bestLeadData();
  if (!item) return `<div class="${wrapper}"><h2>Melhor lead do dia</h2><div class="empty">Ainda não há um lead selecionado. Rode a rotina diária ou o Growth Engine.</div></div>`;
  const score = Math.max(0, Math.min(100, Number(item._score ?? item.score ?? item.pontuacao ?? 0)));
  return `<div class="${wrapper}"><div class="live-head"><h2>Melhor lead do dia</h2><button class="btn secondary" id="generateBestLeadAssets">Gerar mensagem</button></div><div class="lead-hero"><div class="score-ring" style="--score:${score}"><strong>${score}</strong></div><div><h3>${esc(item.nome || item.name || 'Lead')}</h3><p class="muted">${esc(item.cidade || '')}${item.estado ? ` · ${esc(item.estado)}` : ''}</p><p>${esc(item.problemaObservado || item.resumo || 'Contexto comercial será aprofundado pela rotina.')}</p></div></div><div class="stat-grid"><div class="stat"><span>Canal</span><b>${esc(item.whatsapp ? 'WhatsApp' : item.instagram ? 'Instagram' : 'a definir')}</b></div><div class="stat"><span>Instagram</span><b>${esc(item.instagram || 'não encontrado')}</b></div><div class="stat"><span>Status</span><b>${esc(item.status || 'prioritário')}</b></div></div><label>Mensagem personalizada</label><textarea id="bestLeadMessage">${esc(state.bestLead?.message || item.message || '')}</textarea><label>Roteiro Loom</label><textarea id="bestLeadLoom">${esc(state.bestLead?.loomScript || item.loomScript || '')}</textarea><div class="actions"><button class="btn" id="saveBestLeadAssets">Salvar</button><button class="btn secondary" id="copyBestLeadMessage">Copiar mensagem</button></div></div>`;
}
function home() {
  const m = state.metrics || {};
  return `<div class="grid">
    ${summaryMetric('Projetos', m.projects ?? state.projects.length, `${state.projects.filter(x => !x.path).length} caminho(s) pendente(s)`)}
    ${summaryMetric('Execuções ativas', m.activeExecutions ?? state.active.length, state.active.length ? 'há uma análise em andamento' : 'sistema disponível')}
    ${summaryMetric('Aprovações', m.pendingApprovals ?? state.approvals.filter(x => x.status === 'pending').length, 'ações externas pendentes')}
    ${summaryMetric('Ideias', m.ideas ?? state.ideas.length, 'histórico local e validações')}
    <div class="card wide"><h2>Portfólio e prioridade</h2>${state.projects.map((p, i) => `<div class="project-row"><div class="row-main"><b>${esc(p.name)}</b><p>${esc(p.description)}</p></div><div>${i===0 ? '<span class="badge yellow">prioridade 1</span> ' : ''}${statusBadge(p.status)}</div></div>`).join('')}</div>
    <div class="card side"><h2>Equipes</h2><div class="teams"><div class="team"><i style="background:var(--brand)"></i><b>Vertexion Control</b><span>direção</span></div><div class="team"><i style="background:var(--yellow)"></i><b>Growth Engine</b><span>aquisição</span></div><div class="team"><i style="background:var(--purple)"></i><b>Product Intelligence</b><span>ideias</span></div><div class="team"><i style="background:var(--cyan)"></i><b>Engineering Assurance</b><span>produto</span></div></div></div>
    ${bestLeadCard(true)}
    <div class="card third"><h2>Rotinas</h2><div class="teams">${state.routines.slice(0,4).map(r => `<div class="team"><i style="background:${r.enabled ? 'var(--green)' : 'var(--red)'}"></i><b>${esc(r.name)}</b><span>${esc(r.frequency)}</span></div>`).join('')}</div></div>
    <div class="card third"><h2>Saúde</h2>${state.health.slice(0,4).map(item => `<div class="health-item ${item.ok ? 'ok' : ''}"><div><b>${esc(item.name)}</b><div class="muted">${esc(item.detail)}</div></div><i></i></div>`).join('')}</div>
    <div class="card third"><h2>Resumo de atividade</h2><div class="kpi-row"><div class="kpi"><span>Leads</span><strong>${esc(m.leads ?? state.leads.length)}</strong></div><div class="kpi"><span>Top score</span><strong>${esc(m.topLeadScore ?? 0)}</strong></div><div class="kpi"><span>Concluídas</span><strong>${esc(m.completedExecutions ?? 0)}</strong></div><div class="kpi"><span>Falhas</span><strong>${esc(m.failedExecutions ?? 0)}</strong></div></div></div>
    <div class="card wide"><div class="live-head"><h2>Atividade transmitida</h2><button class="btn secondary" data-go="activity">Abrir histórico</button></div><div class="log">${events.length ? esc(events.slice(-50).map(x => eventText(x)).join('\n')) : 'Nenhuma atividade transmitida nesta sessão.'}</div></div>
    <div class="card side"><h2>Execuções recentes</h2>${state.executions.slice(0,7).map(item => `<div class="execution-row"><div class="row-main"><b>${esc(item.projectId || 'general')}</b><p>${esc(item.executionId || '')}</p></div><div>${statusBadge(item.status || 'running')}</div></div>`).join('')}</div>
  </div>`;
}
function run() {
  return `<div class="grid"><div class="card wide"><h2>Nova tarefa</h2><label>Projeto</label><select id="project"><option value="general">Geral / Vertexion Control</option>${state.projects.map(p => `<option value="${esc(p.id)}">${esc(p.name)}${p.path ? '' : ' — caminho pendente'}</option>`).join('')}</select><label>Modo</label><select id="mode"><option value="analyze">Analisar com segurança</option><option value="deep">Análise profunda</option><option value="implement">Implementar no escopo</option></select><label>O que você quer fazer?</label><textarea id="prompt" placeholder="Ex.: investigue por que o cardápio do ZapMenu não abre, faça todas as perguntas necessárias e crie um plano antes de alterar arquivos."></textarea><div class="actions"><button class="btn" id="start">Executar</button><button class="btn danger" id="stop" disabled>Parar execução</button></div></div><div class="card side"><h2>Proteções ativas</h2><p class="muted">O diretor escolhe a equipe e mostra os agentes usados.</p><p class="muted">Análises usam modo somente leitura. Implementação aceita edições locais, mas ações externas continuam protegidas.</p><div class="notice">Na versão 5.0 há base para aprovações programáticas, mas a integração final depende da ativação consciente do permission tool no seu ambiente.</div></div><div class="card full"><div class="live-head"><h2>Execução ao vivo</h2><span id="liveStatus" class="badge">aguardando</span></div><div class="log" id="live">Aguardando tarefa.</div></div></div>`;
}
function projects() {
  return `<div class="grid"><div class="card full"><div class="live-head"><h2>Projetos detectados</h2><button class="btn secondary" id="discover">Descobrir caminhos</button></div><p class="muted">Os caminhos devem ser absolutos no WSL, como <span class="code">/mnt/c/Users/Arthur Araújo/Downloads/...</span>.</p></div>${state.projects.map(p => `<div class="card half"><h2>${esc(p.name)}</h2><p>${esc(p.description)}</p><p>${statusBadge(p.status)} <span class="badge">prioridade ${esc(p.priority)}</span></p><label>Caminho local</label><input class="input project-path" data-id="${esc(p.id)}" value="${esc(p.path || '')}" placeholder="/mnt/c/.../"><div class="actions"><button class="btn secondary save-path" data-id="${esc(p.id)}">Salvar caminho</button><button class="btn quick" data-id="${esc(p.id)}" data-prompt="Analise o estado atual deste projeto, riscos, pendências e próximo passo seguro. Não altere arquivos.">Analisar</button></div><p class="muted">${esc(p.publicUrl || '')} · ${esc(p.provider || '')}</p></div>`).join('')}</div>`;
}
function leads() {
  const top = state.leads.slice(0, 6);
  return `<div class="grid"><div class="card wide"><h2>Leads</h2><div class="kpi-row"><div class="kpi"><span>Total local</span><strong>${state.leads.length}</strong></div><div class="kpi"><span>Melhor score</span><strong>${Math.max(0,...state.leads.map(x => x.score || 0))}</strong></div><div class="kpi"><span>Canais com WhatsApp</span><strong>${state.leads.filter(x => x.whatsapp).length}</strong></div><div class="kpi"><span>Com Instagram</span><strong>${state.leads.filter(x => x.instagram).length}</strong></div></div><div class="mini-chart">${top.map((lead, index) => `<div class="bar" style="height:${Math.max(16, lead.score || 10)}%"><span>${esc(String(index+1))}</span></div>`).join('')}</div><div class="filter-row"><input class="input" id="leadSearch" placeholder="Buscar por nome, cidade, Instagram..."></div><div class="table-wrap"><table><thead><tr><th>Lead</th><th>Cidade</th><th>Segmento</th><th>Contato</th><th>Score</th><th>Status</th></tr></thead><tbody id="leadsTable">${renderLeadsRows(state.leads)}</tbody></table></div></div>${bestLeadCard(false)}</div>`;
}
function renderLeadsRows(items) {
  if (!items.length) return `<tr><td colspan="6"><div class="empty">Nenhum lead encontrado.</div></td></tr>`;
  return items.map(item => `<tr><td><b>${esc(item.name)}</b><div class="muted">${esc(item.observedProblem || '')}</div></td><td>${esc(item.city || '')}${item.state ? `/${esc(item.state)}` : ''}</td><td>${esc(item.segment || '—')}</td><td>${esc(item.whatsapp || item.instagram || item.email || '—')}</td><td>${esc(item.score || 0)}</td><td>${statusBadge(item.status)}</td></tr>`).join('');
}
function ideas() {
  const selected = selectedIdea || state.ideas[0]?.id;
  const cards = state.ideas.map(item => `<div class="idea-row"><div class="row-main"><b>${esc(item.title)}</b><p>${esc(item.summary || '')}</p></div><div><div>${statusBadge(item.status)}</div><div class="actions"><button class="btn secondary open-idea" data-id="${esc(item.id)}">Abrir</button></div></div></div>`).join('') || '<div class="empty">Nenhuma ideia validada ainda.</div>';
  return `<div class="grid"><div class="card half"><div class="live-head"><h2>Ideias</h2><button class="btn secondary" id="newIdeaPrompt">Nova ideia</button></div>${cards}</div><div class="card half">${selected ? ideaPanel() : '<div class="empty">Selecione uma ideia para ver detalhes.</div>'}</div></div>`;
}
function ideaPanel() {
  if (!ideaDetail) return `<div class="empty">Carregando detalhes...</div>`;
  const meta = ideaDetail.meta || {};
  const tabs = ['summary.md','hypotheses.md','evidence.md','competitors.md','experiment.md','decision.md','result.md'].filter(key => ideaDetail.sections?.[key]);
  const current = ideaTab in (ideaDetail.sections || {}) ? ideaTab : tabs[0];
  const content = ideaDetail.sections?.[current] || 'Sem conteúdo.';
  return `<h2>${esc(meta.title || selectedIdea || 'Ideia')}</h2><div class="kpi-row"><div class="kpi"><span>Score</span><strong>${esc(meta.score ?? '—')}</strong></div><div class="kpi"><span>Confiança</span><strong>${esc(meta.confidence ?? '—')}</strong></div><div class="kpi"><span>Evidência</span><strong>${esc(meta.evidenceLevel ?? '—')}</strong></div><div class="kpi"><span>Status</span><strong>${esc(meta.status ?? '—')}</strong></div></div><div class="tabbar">${tabs.map(tab => `<button class="idea-tab ${tab===current ? 'active' : ''}" data-tab="${esc(tab)}">${esc(tab.replace('.md',''))}</button>`).join('')}</div><div class="viewer">${esc(content)}</div>`;
}
function routines() {
  return `<div class="grid"><div class="card full"><h2>Rotinas</h2><p class="muted">As rotinas podem ser ligadas/desligadas e executadas manualmente. A 5.0 também adiciona base para snapshots mensais e rotação de logs.</p></div>${state.routines.map(item => `<div class="card half"><div class="live-head"><div><h3>${esc(item.name)}</h3><p class="muted">${esc(item.frequency)} · ${esc(item.hour ?? '')}:${String(item.minute ?? 0).padStart(2,'0')}</p></div><span>${statusBadge(item.enabled ? 'ativo' : 'pausado')}</span></div><div class="notice">${esc(item.prompt.slice(0, 220))}...</div><div class="actions"><button class="btn secondary routine-run" data-id="${esc(item.id)}">Executar agora</button><button class="btn secondary" data-toggle-routine="${esc(item.id)}">${item.enabled ? 'Pausar' : 'Ativar'}</button></div></div>`).join('')}</div>`;
}
function approvals() {
  const items = state.approvals;
  return `<div class="grid"><div class="card full"><h2>Aprovações</h2><p class="muted">Esta tela registra aprovações locais e já está preparada para futura integração programática de permissões.</p>${items.length ? items.map(item => `<div class="project-row"><div class="row-main"><b>${esc(item.title || item.action || item.type || item.id)}</b><p>${esc(item.note || item.description || '')}</p></div><div><div>${statusBadge(item.status)}</div>${item.status === 'pending' ? `<div class="actions"><button class="btn approve" data-id="${esc(item.id)}">Aprovar</button><button class="btn danger reject" data-id="${esc(item.id)}">Recusar</button></div>` : ''}</div></div>`).join('') : '<div class="empty">Nenhuma aprovação local.</div>'}</div></div>`;
}
function reports() {
  const list = state.reports.map(item => `<div class="report-row"><div class="row-main"><b>${esc(item.relative)}</b><p>${formatDate(item.modifiedAt)} · ${item.size} bytes</p></div><div class="actions"><button class="btn secondary open-report" data-id="${encodeURIComponent(item.relative)}">Abrir</button></div></div>`).join('') || '<div class="empty">Nenhum relatório encontrado.</div>';
  return `<div class="grid split"><div class="card"><h2>Relatórios</h2>${list}</div><div class="card"><div class="live-head"><h2>${reportSelected ? esc(reportSelected) : 'Visualizador'}</h2></div><div class="viewer">${esc(reportContent || 'Selecione um relatório para visualizar o conteúdo.')}</div></div></div>`;
}
function activity() {
  const recent = events.slice().reverse().slice(0, 120);
  return `<div class="grid"><div class="card full"><div class="live-head"><h2>Atividade e eventos</h2><button class="btn secondary" id="clearEvents">Limpar buffer local</button></div><div class="log">${recent.length ? esc(recent.map(x => eventText(x)).join('\n')) : 'Nenhum evento nesta sessão.'}</div></div><div class="card half"><h2>Execuções recentes</h2>${state.executions.slice(0,20).map(item => `<div class="execution-row"><div class="row-main"><b>${esc(item.executionId || '')}</b><p>${esc(item.projectId || 'general')} · ${formatDate(item.startedAt || item.endedAt)}</p></div><div>${statusBadge(item.status || 'running')}</div></div>`).join('')}</div><div class="card half"><h2>Ativas agora</h2>${state.active.length ? state.active.map(item => `<div class="execution-row"><div class="row-main"><b>${esc(item.executionId)}</b><p>${esc(item.projectId || '')} · ${esc(item.mode || '')}</p></div><div>${statusBadge('running')}</div></div>`).join('') : '<div class="empty">Nenhuma execução ativa.</div>'}</div></div>`;
}
function system() {
  return `<div class="grid"><div class="card half"><h2>Saúde do sistema</h2>${state.health.map(item => `<div class="health-item ${item.ok ? 'ok' : ''}"><div><b>${esc(item.name)}</b><div class="muted">${esc(item.detail)}</div></div><i></i></div>`).join('')}</div><div class="card half"><h2>Backups</h2>${(state.backups || []).length ? state.backups.map(item => `<div class="project-row"><div class="row-main"><b>${esc(item.name)}</b><p>${esc(item.path)}</p></div><div>${statusBadge('backup')}</div></div>`).join('') : '<div class="empty">Nenhum backup listado.</div>'}</div><div class="card full"><h2>Notas operacionais</h2><div class="notice">A versão 5.0 adiciona scripts de backup/restauração, rotação de logs e preparação para aprovações programáticas. O uso continua restrito ao localhost.</div></div></div>`;
}

function render() {
  $('#title').textContent = navTitle();
  $('#activeCount').textContent = `${state.active.length} execução(ões) ativa(s)`;
  const content = $('#content');
  content.innerHTML = ({ home, run, projects, leads, ideas, routines, approvals, reports, activity, system }[view] || home)();
  bind();
}

async function refresh() {
  const data = await api('/api/bootstrap');
  state = { ...state, ...data };
  if (!selectedIdea && state.ideas[0]?.id) { selectedIdea = state.ideas[0].id; await loadIdea(selectedIdea); }
  render();
}
async function loadIdea(id) { selectedIdea = id; ideaDetail = await api(`/api/ideas/${id}`); render(); }
async function loadReport(relative) { const data = await api(`/api/reports/${encodeURIComponent(relative)}`); reportSelected = relative; reportContent = data.content || ''; render(); }
function go(next) { view = next; $$('nav button').forEach(button => button.classList.toggle('active', button.dataset.view === next)); render(); }
async function startTask(projectId, prompt, mode = 'analyze') { try { const result = await api('/api/tasks', { method: 'POST', body: JSON.stringify({ projectId, prompt, mode }) }); selectedExecution = result.executionId; const live = $('#live'); const stop = $('#stop'); if (live) live.textContent = `Execução ${result.executionId} iniciada...`; if (stop) stop.disabled = false; toast('Tarefa iniciada'); } catch (error) { toast(error.message); } }
async function updateApproval(approvalId, status) { try { await api(`/api/approvals/${approvalId}`, { method: 'PATCH', body: JSON.stringify({ status }) }); await refresh(); toast(`Aprovação ${status === 'approved' ? 'aprovada' : 'rejeitada'}`); } catch (error) { toast(error.message); } }

function bind() {
  $('[data-go]') && $('[data-go]').addEventListener('click', e => go(e.target.dataset.go));
  if ($('#start')) $('#start').onclick = () => startTask($('#project').value, $('#prompt').value, $('#mode').value);
  if ($('#stop')) $('#stop').onclick = async () => { if (!selectedExecution) return; try { await api(`/api/executions/${selectedExecution}/stop`, { method: 'POST', body: '{}' }); toast('Sinal de parada enviado'); } catch (error) { toast(error.message); } };
  if ($('#discover')) $('#discover').onclick = () => startTask('general', 'Descubra e sugira os caminhos absolutos WSL para os projetos do portfólio. Não altere arquivos.', 'analyze');
  $$('.save-path').forEach(button => button.onclick = async () => { const input = $(`.project-path[data-id="${button.dataset.id}"]`); try { await api(`/api/projects/${button.dataset.id}`, { method: 'PATCH', body: JSON.stringify({ path: input.value }) }); await refresh(); toast('Caminho salvo'); } catch (e) { toast(e.message); } });
  $$('.quick').forEach(button => button.onclick = () => startTask(button.dataset.id, button.dataset.prompt, 'analyze'));
  $$('.routine-run').forEach(button => button.onclick = async () => { try { await api(`/api/routines/${button.dataset.id}/run`, { method: 'POST', body: '{}' }); toast('Rotina iniciada'); } catch (e) { toast(e.message); } });
  $$('[data-toggle-routine]').forEach(button => button.onclick = async () => { const routine = state.routines.find(x => x.id === button.dataset.toggleRoutine); try { await api(`/api/routines/${routine.id}`, { method: 'PATCH', body: JSON.stringify({ enabled: !routine.enabled }) }); await refresh(); toast(routine.enabled ? 'Rotina pausada' : 'Rotina ativada'); } catch (e) { toast(e.message); } });
  $$('.approve').forEach(button => button.onclick = () => updateApproval(button.dataset.id, 'approved'));
  $$('.reject').forEach(button => button.onclick = () => updateApproval(button.dataset.id, 'rejected'));
  if ($('#leadSearch')) $('#leadSearch').oninput = e => { const value = e.target.value.toLowerCase(); const filtered = state.leads.filter(item => `${item.name} ${item.city} ${item.instagram} ${item.segment}`.toLowerCase().includes(value)); $('#leadsTable').innerHTML = renderLeadsRows(filtered); };
  if ($('#generateBestLeadAssets')) $('#generateBestLeadAssets').onclick = async () => { try { await api('/api/best-lead/generate', { method: 'POST', body: '{}' }); await refresh(); toast('Mensagem e Loom gerados'); } catch (e) { toast(e.message); } };
  if ($('#saveBestLeadAssets')) $('#saveBestLeadAssets').onclick = async () => { try { await api('/api/best-lead', { method: 'PATCH', body: JSON.stringify({ message: $('#bestLeadMessage').value, loomScript: $('#bestLeadLoom').value }) }); await refresh(); toast('Melhor lead atualizado'); } catch (e) { toast(e.message); } };
  if ($('#copyBestLeadMessage')) $('#copyBestLeadMessage').onclick = async () => { try { await navigator.clipboard.writeText($('#bestLeadMessage').value); toast('Mensagem copiada'); } catch { toast('Não foi possível copiar'); } };
  $$('.open-report').forEach(button => button.onclick = () => loadReport(decodeURIComponent(button.dataset.id)));
  $$('.open-idea').forEach(button => button.onclick = () => loadIdea(button.dataset.id));
  $$('.idea-tab').forEach(button => button.onclick = () => { ideaTab = button.dataset.tab; render(); });
  if ($('#clearEvents')) $('#clearEvents').onclick = () => { events = []; render(); };
  if ($('#newIdeaPrompt')) $('#newIdeaPrompt').onclick = () => go('run');
}

$$('nav button').forEach(button => button.onclick = () => go(button.dataset.view));
setInterval(() => { const clock = $('#clock'); if (clock) clock.textContent = new Date().toLocaleString('pt-BR'); }, 1000);
const source = new EventSource('/api/events');
source.onmessage = message => {
  const event = JSON.parse(message.data); events.push(event); if (events.length > 500) events.shift();
  if (event.type === 'execution-start') { selectedExecution = event.executionId; state.active.push(event); }
  if (event.type === 'execution-end') { state.active = state.active.filter(x => x.executionId !== event.executionId); if (event.executionId === selectedExecution) { const status = $('#liveStatus'); if (status) status.textContent = event.status; const stop = $('#stop'); if (stop) stop.disabled = true; } refresh().catch(()=>{}); }
  if (view === 'run') { const log = $('#live'); if (log && (!selectedExecution || event.executionId === selectedExecution || !event.executionId)) { log.textContent += `\n${eventText(event)}`; log.scrollTop = log.scrollHeight; } }
  if (view === 'home') render();
};
source.onerror = () => { const active = $('#activeCount'); if (active) active.textContent = 'conexão local interrompida'; };
refresh().catch(error => toast(error.message));
