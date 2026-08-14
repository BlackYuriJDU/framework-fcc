#!/usr/bin/env node
import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
const root=path.join(os.homedir(),'.claude','vertexion-agent-system'); const failures=[];
const must=['contracts/task-contract.schema.json','contracts/delegation-contract.schema.json','agents/control/control-evaluator.md','tasks/TEMPLATE/CONTRACT.yaml','tasks/TEMPLATE/STATE.yaml','control-center/lib/context.mjs','control-center/lib/experiment-store.mjs','control-center/lib/task-store.mjs','scripts/autoloop-v2.mjs','scripts/orq-council.mjs','scripts/visual-qa.mjs','scripts/worktree-check.mjs','scripts/fcc-score.mjs','knowledge/index.json','knowledge/source.schema.json','experiments/ledger-schema.json'];
for(const p of must) if(!fs.existsSync(path.join(root,p))) failures.push(`missing:${p}`);
const registry=JSON.parse(fs.readFileSync(path.join(root,'orchestrators','registry.json'),'utf8'));
if(registry.version<4) failures.push('registry version < 4');
if(new Set(registry.orchestrators.map(x=>x.id)).size!==3) failures.push('orchestrator count != 3');
for(const o of registry.orchestrators) { if(!o.modes?.length) failures.push(`modes missing:${o.id}`); if(!o.requiredEvaluators?.includes('control-evaluator')) failures.push(`evaluator missing:${o.id}`); }
const routing=JSON.parse(fs.readFileSync(path.join(root,'evals','cases','routing.json'),'utf8'));
for(const c of routing) if(!['tesla','einstein','da-vinci'].includes(c.expectedOrchestrator)) failures.push(`invalid routing:${c.expectedOrchestrator}`);
const runner=fs.readFileSync(path.join(root,'control-center','lib','claude-runner.mjs'),'utf8');
if(runner.includes('control-vertexion-director')) failures.push('legacy runner reference');
if(!runner.includes('assertTaskPermission')) failures.push('policy not wired');
if(!runner.includes('buildContext')) failures.push('context not wired');
if(!runner.includes('startExperiment')) failures.push('experiment not wired');
const knowledge=JSON.parse(fs.readFileSync(path.join(root,'knowledge','index.json'),'utf8'));
for(const x of knowledge) if(!x.verifiedAt||!x.expiresAt) failures.push(`freshness missing:${x.id}`);
console.log(JSON.stringify({ok:failures.length===0,failures,orchestrators:registry.orchestrators.map(x=>x.id),knowledgeSources:knowledge.length},null,2)); process.exit(failures.length?1:0);
