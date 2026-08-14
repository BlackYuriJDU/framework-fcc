#!/usr/bin/env node
import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
const home=path.join(os.homedir(),'.claude'); const root=path.join(home,'vertexion-agent-system'); const checks=[]; const add=(name,ok,detail='')=>checks.push({name,ok,detail}); const exists=p=>fs.existsSync(path.join(root,p));
let registry=null; try{registry=JSON.parse(fs.readFileSync(path.join(root,'orchestrators/registry.json'),'utf8')); add('registry-v4',registry.version>=4,`v${registry.version}`);}catch(e){add('registry-v4',false,e.message);}
for(const id of ['tesla','einstein','da-vinci']) add(`orchestrator-${id}`,Boolean(registry?.orchestrators?.find(x=>x.id===id)));
for(const p of ['contracts/task-contract.schema.json','contracts/delegation-contract.schema.json','tasks/TEMPLATE/CONTRACT.yaml','tasks/TEMPLATE/STATE.yaml','agents/control/control-evaluator.md','knowledge/index.json','knowledge/source.schema.json','experiments/ledger-schema.json','scripts/autoloop-v2.mjs','scripts/orq-council.mjs','scripts/visual-qa.mjs','scripts/worktree-check.mjs','scripts/fcc-score.mjs']) add(`exists:${p}`,exists(p));
const active=fs.readFileSync(path.join(root,'scripts/run-routine.mjs'),'utf8'); add('legacy-runtime-free',!active.includes('control-vertexion-director'));
const runner=fs.readFileSync(path.join(root,'control-center/lib/claude-runner.mjs'),'utf8'); add('policy',runner.includes('assertTaskPermission')); add('context',runner.includes('buildContext')); add('experiments',runner.includes('startExperiment'));
const failed=checks.filter(x=>!x.ok); console.table(checks.map(x=>({check:x.name,status:x.ok?'PASS':'FAIL',detail:x.detail}))); process.exit(failed.length?1:0);
