#!/usr/bin/env node
import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
const root=path.join(os.homedir(),'.claude','vertexion-agent-system');
const store=path.join(root,'state','control-center','experiments.jsonl'); fs.mkdirSync(path.dirname(store),{recursive:true});
const arg=process.argv[2]||'plan'; const id=process.argv[3]||`exp_${Date.now()}`;
const decision=arg==='keep'?'KEEP':arg==='revert'?'REVERT':'ITERATE';
const rec={experimentId:id,at:new Date().toISOString(),action:arg,decision}; fs.appendFileSync(store,JSON.stringify(rec)+'\n');
console.log(JSON.stringify(rec,null,2));
