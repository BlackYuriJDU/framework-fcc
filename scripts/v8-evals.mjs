#!/usr/bin/env node
import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
const root=path.join(os.homedir(),'.claude','vertexion-agent-system'); const failures=[];
const registry=JSON.parse(fs.readFileSync(path.join(root,'orchestrators','registry.json'),'utf8'));
if(registry.version<4) failures.push('registry version < 4');
if(new Set(registry.orchestrators.map(x=>x.id)).size!==3) failures.push('orchestrator count != 3');
const routing=JSON.parse(fs.readFileSync(path.join(root,'evals','cases','routing.json'),'utf8'));
for(const c of routing) if(!['tesla','einstein','da-vinci'].includes(c.expectedOrchestrator)) failures.push(`invalid routing target: ${c.expectedOrchestrator}`);
const routine=fs.readFileSync(path.join(root,'scripts','run-routine.mjs'),'utf8'); if(routine.includes('control-vertexion-director')) failures.push('legacy runtime reference remains');
const runner=fs.readFileSync(path.join(root,'control-center','lib','claude-runner.mjs'),'utf8'); if(!runner.includes('resolveOrchestrator')||!runner.includes('assertTaskPermission')) failures.push('policy not wired');
if(!fs.existsSync(path.join(root,'agents','control','control-evaluator.md'))) failures.push('evaluator missing');
console.log(JSON.stringify({ok:failures.length===0,failures,routingCases:routing.length},null,2)); process.exit(failures.length?1:0);
