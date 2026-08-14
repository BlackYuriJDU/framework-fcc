import { spawn } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import { taskPath } from './task-store.mjs';
import { appendJsonl, systemHome } from './store.mjs';

export function runEvaluator({taskId,projectId,cwd,orchestrator,contract,result}) {
  return new Promise((resolve,reject)=>{
    const prompt=[
      'FCC v8 independent evaluation.',
      `Task ID: ${taskId}`,
      `Project: ${projectId}`,
      `Orchestrator: ${orchestrator}`,
      'Do not implement changes. Evaluate outcome only.',
      'Read the task artifacts and determine PASS, PARTIAL or FAIL.',
      `Task state: ${fs.readFileSync(taskPath(taskId,'STATE.json'),'utf8')}`,
      `Contract: ${JSON.stringify(contract||{})}`,
      `Execution result: ${JSON.stringify(result)}`
    ].join('\n');
    const child=spawn('bash',['-lc',`command -v fcc-claude || command -v claude || true`],{encoding:'utf8'});
    let cmd=''; child.stdout.on('data',d=>cmd+=d); child.on('close',()=>{
      cmd=cmd.trim()||null; if(!cmd)return reject(new Error('Claude Code/FCC não encontrado para evaluator'));
      const p=spawn(cmd,['-p',prompt,'--agent','control-evaluator','--model','sonnet','--effort','high','--max-turns','24','--permission-mode','plan'],{cwd,env:{...process.env,TZ:'America/Recife'},stdio:['ignore','pipe','pipe']});
      let out='',err=''; p.stdout.on('data',d=>out+=d); p.stderr.on('data',d=>err+=d); p.on('close',code=>{
        const status=code===0 && /\bPASS\b/i.test(out) ? 'PASS' : code===0 && /\bPARTIAL\b/i.test(out) ? 'PARTIAL' : 'FAIL';
        const evaluation={taskId,status,code,output:out.slice(-30000),stderr:err.slice(-5000),evaluatedAt:new Date().toISOString()};
        appendJsonl('evaluations.jsonl',evaluation);
        fs.writeFileSync(taskPath(taskId,'EVALUATION.md'),`# Evaluation\n\nStatus: ${status}\n\n${out.slice(-30000)}\n`);
        resolve(evaluation);
      });
    });
  });
}
