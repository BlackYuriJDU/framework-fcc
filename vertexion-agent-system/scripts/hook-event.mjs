#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => { if (raw.length < 100_000) raw += chunk; });
process.stdin.on('end', () => {
  let event = {};
  try { event = JSON.parse(raw || '{}'); } catch {}
  const safe = {
    at: new Date().toISOString(),
    event: event.hook_event_name || event.event_name || 'unknown',
    sessionId: event.session_id || null,
    agent: event.agent_type || event.agent_name || null,
    cwd: event.cwd || null,
    notificationType: event.notification_type || null,
    toolName: event.tool_name || null,
  };
  const dir = path.join(os.homedir(), '.claude', 'vertexion-agent-system', 'state');
  fs.mkdirSync(dir, { recursive: true });
  fs.appendFileSync(path.join(dir, 'hook-events.jsonl'), JSON.stringify(safe) + '\n', { mode: 0o600 });
  const request = http.request({ host: '127.0.0.1', port: 3741, path: '/api/hooks', method: 'POST', headers: { 'content-type': 'application/json' } }, response => response.resume());
  request.on('error', () => {}); request.setTimeout(500, () => request.destroy()); request.end(JSON.stringify(safe));
});
