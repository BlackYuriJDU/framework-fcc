#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
const root=path.join(os.homedir(),'.claude','vertexion-agent-system','knowledge');
const now=new Date(); const rows=[];
function walk(dir){ if(!fs.existsSync(dir)) return; for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name); if(e.isDirectory()) walk(p); else if(e.name.endsWith('.json') && e.name!=='source.schema.json'){ try{const x=JSON.parse(fs.readFileSync(p,'utf8')); if(x.verifiedAt&&x.expiresAt){const v=new Date(x.verifiedAt), ex=new Date(x.expiresAt); const window=Math.max(1,ex-v); let status=now<ex?'fresh':now<new Date(v.getTime()+2*window)?'stale':'expired'; rows.push({file:p,status,verifiedAt:x.verifiedAt,expiresAt:x.expiresAt});}}catch{} } } }
walk(root); console.log(JSON.stringify({checked:rows.length,rows},null,2)); if(rows.some(r=>r.status==='expired')) process.exitCode=2;
