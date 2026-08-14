import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { appendJsonl, id, systemHome } from './store.mjs';
import { resolveOrchestrator, assertTaskPermission } from './policy.mjs';
import { createTask, updateTask, appendTaskEvent } from './task-store.mjs';
import { runEvaluator } from './evaluator-runner.mjs';
import { buildContext } from './context.mjs';
import { startExperiment, finishExperiment } from './experiment-store.mjs';

function resolveCommand() {
  if (process.env.VERTEXION_CLAUDE_COMMAND) return process.env.VERTEXION_CLAUDE_COMMAND;
  const result = spawnSync('bash', ['-c', 'command -v fcc-claude || command -v claude || true'], { encoding: 'utf8' });
  return result.stdout.trim() || null;
}
function safeMode(mode) {
  const allowed = ['research','deep','fix','feature','implement','incident','review','routine','audit','experiment','visual-qa','analyze'];
  return allowed.includes(mode) ? mode : 'analyze';
}
function getOrchestratorAgent(id) {
  const r = resolveOrchestrator(id === 'tesla' ? 'engineering' : id === 'einstein' ? 'growth' : 'design');
  return r?.agent || 'control-tesla';
}

export async function runClaude({ prompt, cwd, mode='analyze', projectId='general', domain='engineering', orchestratorId=null, action='', approval=false, taskIdInput=null, contract=null, evaluate=true, onEvent, onComplete }) {
  const executionId = id('run');
  const taskId = taskIdInput || id('task');
  const command = resolveCommand();
  if (!command) throw new Error('Nenhum fcc-claude/claude encontrado no PATH do WSL.');
  const selectedMode = safeMode(mode);
  const orchestrator = orchestratorId || resolveOrchestrator(domain)?.id || 'tesla';
  assertTaskPermission({orchestratorId: orchestrator, action, approval});
  const turns = selectedMode === 'deep' || selectedMode === 'routine' ? 64 : selectedMode === 'implement' ? 48 : 32;
  const permissionMode = selectedMode === 'implement' ? 'acceptEdits' : selectedMode === 'routine' ? 'default' : 'plan';
  const task = createTask({taskId, projectId, domain, orchestratorId: orchestrator, mode:selectedMode, prompt, contract});
  appendTaskEvent(taskId, {type:'phase',phase:'CONTEXT',executionId});
  const context = buildContext({systemHome,taskId,domain,projectId,mode:selectedMode});
  let experiment = null;
  if (['experiment','autonomous'].includes(selectedMode)) {
    experiment = startExperiment({taskId,projectId,orchestrator,hypothesis:prompt,mode:selectedMode});
    appendTaskEvent(taskId,{type:'experiment-start',experiment});
  }
  appendTaskEvent(taskId,{type:'phase',phase:'EXECUTE',executionId,context});
  const fullPrompt = [
    `Orquestrador v8: ${orchestrator}.`,
    'Você está sendo executado pelo Vertexion Control Center.',
    `Projeto selecionado: ${projectId}.`,
    `Modo: ${selectedMode}.`,
    'Siga o orquestrador ativo e as regras globais.',
    'Mostre equipe e agentes acionados. Não faça ação externa, deploy, push, PR, envio, migração remota, gasto, preço, checkout, pagamento ou alteração em produção sem aprovação explícita.',
    'Quando uma ação exigir aprovação, apenas prepare a solicitação e encerre antes de executá-la.',
    `Context manifest (JIT): ${JSON.stringify(context)}`,
    'Tarefa:',
    prompt,
  ].join('\n');
  const args = ['-p', fullPrompt,'--agent',getOrchestratorAgent(orchestrator),'--output-format','stream-json','--verbose','--model','opus','--effort','high','--max-turns',String(turns),'--permission-mode',permissionMode];
  const startedAt = new Date().toISOString();
  const meta = { executionId,taskId,projectId,mode:selectedMode,domain,orchestrator,action,approval,cwd,command,requestedModel:'opus',startedAt,status:'running' };
  appendJsonl('executions.jsonl',meta);
  onEvent?.({type:'execution-start',executionId,...meta});
  const child = spawn(command,args,{cwd,env:{...process.env,TZ:'America/Recife',VERTEXION_CONTROL_CENTER:'1'},stdio:['ignore','pipe','pipe']});
  let stdoutBuffer='', stderr=''; let sessionId=null; let effectiveModel=null; let completed=false;
  function recordEvent(event){ if(event&&typeof event==='object'){ sessionId ||= event.session_id || event.sessionId || null; effectiveModel ||= event.model || event.message?.model || event.result?.model || null; } appendJsonl('execution-events.jsonl',{executionId,at:new Date().toISOString(),event}); onEvent?.({type:'claude-event',executionId,event}); }
  child.stdout.setEncoding('utf8'); child.stdout.on('data',chunk=>{ stdoutBuffer+=chunk; const lines=stdoutBuffer.split('\n'); stdoutBuffer=lines.pop()||''; for(const line of lines){ if(!line.trim()) continue; try{recordEvent(JSON.parse(line));}catch{recordEvent({type:'text',text:line.slice(0,20000)});} } });
  child.stderr.setEncoding('utf8'); child.stderr.on('data',chunk=>{ stderr=(stderr+chunk).slice(-16000); onEvent?.({type:'stderr',executionId,text:String(chunk).slice(0,3000)}); });
  function finish(status,extra={}) { if(completed) return null; completed=true; if(stdoutBuffer.trim()){try{recordEvent(JSON.parse(stdoutBuffer));}catch{recordEvent({type:'text',text:stdoutBuffer.slice(0,20000)});}} const result={executionId,taskId,status,sessionId,requestedModel:'opus',effectiveModel,stderr:stderr.slice(-5000),endedAt:new Date().toISOString(),...extra}; appendJsonl('executions.jsonl',result); updateTask(taskId,{status:status==='completed'?'EVALUATE':'FAILED',executionId,resultArtifact:result}); appendTaskEvent(taskId,{type:'execution-end',status,result}); if(status==='completed'&&experiment) finishExperiment(experiment,{status:'COMPLETED',resultStatus:status}); return result; }
  return await new Promise((resolve)=>{
    child.on('error',error=>{ const result=finish('error',{error:error.message}); resolve(result); });
    child.on('close',(code,signal)=>{ const result=finish(code===0?'completed':signal?'stopped':'failed',{exitCode:code,signal});
      (async()=>{
        let finalResult=result;
        if(result?.status==='completed' && evaluate){
          try{
            const evaluation=await runEvaluator({taskId,projectId,cwd,orchestrator,contract,result});
            updateTask(taskId,{status:evaluation?.status==='PASS'?'FINALIZE':'REVIEW',evaluationArtifact:evaluation});
            appendTaskEvent(taskId,{type:'evaluation',evaluation});
            finalResult={...result,evaluation};
          }catch(error){
            if(experiment) finishExperiment(experiment,{status:'ERROR',error:error.message});
            updateTask(taskId,{status:'REVIEW',evaluationError:error.message});
            appendTaskEvent(taskId,{type:'evaluation-error',error:error.message});
            finalResult={...result,evaluationError:error.message};
          }
        }
        onComplete?.(finalResult); resolve(finalResult);
      })();
    });
  });
}
