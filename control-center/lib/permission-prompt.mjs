#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';

const systemHome = process.env.VERTEXION_SYSTEM_HOME || path.join(os.homedir(), '.claude', 'vertexion-agent-system');
const approvalsFile = path.join(systemHome, 'state', 'control-center', 'approvals.json');
fs.mkdirSync(path.dirname(approvalsFile), { recursive: true });

function readApprovals(){ try { return JSON.parse(fs.readFileSync(approvalsFile,'utf8')); } catch { return []; } }
function writeApprovals(data){ const temp=`${approvalsFile}.${process.pid}.tmp`; fs.writeFileSync(temp, JSON.stringify(data,null,2)+'\n'); fs.renameSync(temp, approvalsFile); }

const input = await new Promise(resolve => {
  let data=''; process.stdin.setEncoding('utf8'); process.stdin.on('data', chunk => data += chunk); process.stdin.on('end', () => resolve(data.trim()));
});
let payload = { raw: input };
try { payload = JSON.parse(input || '{}'); } catch {}
const list = readApprovals();
const item = { id: `approval_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`, status: 'pending', createdAt: new Date().toISOString(), title: payload.tool_name || payload.action || 'External action', description: payload.command || payload.raw || JSON.stringify(payload).slice(0, 400) };
list.unshift(item); writeApprovals(list);
const timeoutMs = Number(process.env.VERTEXION_APPROVAL_TIMEOUT_MS || 600000);
const start = Date.now();
while (Date.now() - start < timeoutMs) {
  await new Promise(r => setTimeout(r, 1500));
  const current = readApprovals().find(x => x.id === item.id);
  if (!current) continue;
  if (current.status === 'approved') { process.stdout.write(JSON.stringify({ decision: 'approve', reason: current.note || '' })); process.exit(0); }
  if (current.status === 'rejected') { process.stdout.write(JSON.stringify({ decision: 'deny', reason: current.note || '' })); process.exit(0); }
}
process.stdout.write(JSON.stringify({ decision: 'deny', reason: 'approval timeout' }));
