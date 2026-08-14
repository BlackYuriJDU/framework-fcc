import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
const systemHome = process.env.VERTEXION_SYSTEM_HOME || path.join(os.homedir(), '.claude', 'vertexion-agent-system');
const tasksRoot = path.join(systemHome, 'tasks');
fs.mkdirSync(tasksRoot, { recursive: true });

function dir(taskId){ const d=path.join(tasksRoot,String(taskId)); fs.mkdirSync(d,{recursive:true}); return d; }
function writeJson(file,data){ const tmp=`${file}.${process.pid}.tmp`; fs.writeFileSync(tmp, JSON.stringify(data,null,2)+'\n',{mode:0o600}); fs.renameSync(tmp,file); }
export function createTask({taskId,projectId,domain,orchestratorId,mode,prompt,contract}){
  const d=dir(taskId);
  const task={task_id:taskId,project_id:projectId,domain,orchestrator:orchestratorId,mode,objective:prompt,status:'CONTRACT',created_at:new Date().toISOString(),contract:contract||null};
  writeJson(path.join(d,'task.json'),task);
  writeJson(path.join(d,'STATE.json'),{task_id:taskId,current_phase:'CONTRACT',status:'active',updated_at:new Date().toISOString()});
  return task;
}
export function updateTask(taskId,patch){ const d=dir(taskId); const f=path.join(d,'STATE.json'); let s={task_id:taskId}; try{s=JSON.parse(fs.readFileSync(f,'utf8'));}catch{} Object.assign(s,patch,{updated_at:new Date().toISOString()}); writeJson(f,s); return s; }
export function appendTaskEvent(taskId,event){ const f=path.join(dir(taskId),'events.jsonl'); fs.appendFileSync(f,JSON.stringify({at:new Date().toISOString(),task_id:taskId,...event})+'\n',{mode:0o600}); }
export function taskPath(taskId,file='STATE.json'){ return path.join(dir(taskId),file); }
