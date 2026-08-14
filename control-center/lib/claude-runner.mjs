import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { appendJsonl, id, systemHome } from './store.mjs';
import { resolveOrchestrator, assertTaskPermission } from './policy.mjs';

function resolveCommand() {
  if (process.env.VERTEXION_CLAUDE_COMMAND) return process.env.VERTEXION_CLAUDE_COMMAND;
  const result = spawnSync('bash', ['-c', 'command -v fcc-claude || command -v claude || true'], { encoding: 'utf8' });
  return result.stdout.trim() || null;
}

function safeMode(mode) {
  return ['analyze', 'deep', 'implement', 'routine'].includes(mode) ? mode : 'analyze';
}

export function runClaude({ prompt, cwd, mode = 'analyze', projectId = 'general', domain = 'engineering', orchestratorId = null, action = '', approval = false, onEvent, onComplete }) {
  const executionId = id('run');
  const command = resolveCommand();
  if (!command) throw new Error('Nem fcc-claude nem claude foram encontrados no PATH do WSL.');

  const selectedMode = safeMode(mode);
  const orchestrator = orchestratorId || resolveOrchestrator(domain)?.id || 'tesla';
  assertTaskPermission({orchestratorId:orchestrator, action, approval});
  const turns = selectedMode === 'deep' || selectedMode === 'routine' ? 64 : selectedMode === 'implement' ? 48 : 32;
  const permissionMode = selectedMode === 'implement' ? 'acceptEdits' : selectedMode === 'routine' ? 'default' : 'plan';
  const fullPrompt = [
    `Orquestrador v8: ${orchestrator}.`,
    'Você está sendo executado pelo Vertexion Control Center.',
    `Projeto selecionado: ${projectId}.`,
    `Modo: ${selectedMode}.`,
    'Siga o agente principal control-vertexion-director e as regras globais.',
    'Mostre equipe e agentes acionados. Não faça ação externa, deploy, push, PR, envio, migration remota, gasto, preço, checkout, pagamento ou alteração em produção sem aprovação explícita.',
    'Quando uma ação exigir aprovação, apenas prepare a solicitação e encerre antes de executá-la.',
    '',
    'Tarefa:',
    prompt,
  ].join('\n');

  const args = [
    '-p', fullPrompt,
    '--agent', 'control-vertexion-director',
    '--output-format', 'stream-json',
    '--verbose',
    '--model', 'opus',
    '--effort', 'high',
    '--max-turns', String(turns),
    '--permission-mode', permissionMode,
  ];
  if (process.env.VERTEXION_ENABLE_PERMISSION_TOOL === '1') {
    args.push('--permission-prompt-tool', `node ${path.join(systemHome, 'control-center', 'lib', 'permission-prompt.mjs')}`);
  }

  const startedAt = new Date().toISOString();
  const meta = { executionId, projectId, mode: selectedMode, domain, orchestrator, action, approval, cwd, command, requestedModel: 'opus', startedAt, status: 'running' };
  appendJsonl('executions.jsonl', meta);
  onEvent?.({ type: 'execution-start', ...meta });

  const child = spawn(command, args, {
    cwd,
    env: { ...process.env, TZ: 'America/Recife', VERTEXION_CONTROL_CENTER: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let stdoutBuffer = '';
  let stderr = '';
  let sessionId = null;
  let effectiveModel = null;

  function recordEvent(event) {
    if (event && typeof event === 'object') {
      sessionId ||= event.session_id || event.sessionId || null;
      effectiveModel ||= event.model || event.message?.model || event.result?.model || null;
    }
    appendJsonl('execution-events.jsonl', { executionId, at: new Date().toISOString(), event });
    onEvent?.({ type: 'claude-event', executionId, event });
  }

  child.stdout.setEncoding('utf8');
  child.stdout.on('data', chunk => {
    stdoutBuffer += chunk;
    const lines = stdoutBuffer.split('\n');
    stdoutBuffer = lines.pop() || '';
    for (const line of lines) {
      if (!line.trim()) continue;
      try { recordEvent(JSON.parse(line)); }
      catch { recordEvent({ type: 'text', text: line.slice(0, 20000) }); }
    }
  });

  child.stderr.setEncoding('utf8');
  child.stderr.on('data', chunk => {
    stderr = (stderr + chunk).slice(-16000);
    onEvent?.({ type: 'stderr', executionId, text: String(chunk).slice(0, 3000) });
  });

  let completed = false;
  function finish(status, extra = {}) {
    if (completed) return;
    completed = true;
    if (stdoutBuffer.trim()) {
      try { recordEvent(JSON.parse(stdoutBuffer)); }
      catch { recordEvent({ type: 'text', text: stdoutBuffer.slice(0, 20000) }); }
    }
    const result = {
      executionId,
      status,
      sessionId,
      requestedModel: 'opus',
      effectiveModel,
      stderr: stderr.slice(-5000),
      endedAt: new Date().toISOString(),
      ...extra,
    };
    appendJsonl('executions.jsonl', result);
    onEvent?.({ type: 'execution-end', ...result });
    onComplete?.(result);
  }

  child.on('error', error => finish('error', { error: error.message }));
  child.on('close', (code, signal) => finish(code === 0 ? 'completed' : signal ? 'stopped' : 'failed', { exitCode: code, signal }));

  return { executionId, child, meta };
}
