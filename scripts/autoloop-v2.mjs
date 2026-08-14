#!/usr/bin/env node
import { appendExperiment } from '../control-center/lib/experiment-store.mjs';
import { getTask } from '../control-center/lib/task-store.mjs';
const taskId=process.argv[2];
if(!taskId){console.error('Usage: autoloop-v2.mjs <task-id>');process.exit(2)}
const task=getTask(taskId); if(!task){console.error('Task not found');process.exit(2)}
const experimentId=`exp_${taskId}_${Date.now()}`;
const rec={experimentId,taskId,hypothesis:task.objective||'improve task outcome',baseline:task.baseline||null,metric:task.success?.criteria||[],change:task.change||null,result:null,decision:'ITERATE',evidence:[]};
appendExperiment(rec); console.log(JSON.stringify(rec,null,2));
