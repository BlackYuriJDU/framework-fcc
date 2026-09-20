#!/usr/bin/env node
import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
const root=path.join(os.homedir(),'.claude','vertexion-agent-system'); const file=path.join(root,'state','control-center','score.json');
const src=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{};
const weights={taskCompletion:15,evaluationPass:15,safety:15,recovery:10,routing:10,contextEfficiency:10,memoryReuse:10,regressionResistance:10,toolEfficiency:5};
let score=0; const metrics={}; for(const [k,w] of Object.entries(weights)){const v=Math.max(0,Math.min(100,Number(src[k]??0))); metrics[k]=v; score+=v*w/100;}
const out={at:new Date().toISOString(),score:Number(score.toFixed(2)),weights,metrics}; console.log(JSON.stringify(out,null,2));
