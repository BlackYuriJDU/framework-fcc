import { appendJsonl, id, listJsonl } from './store.mjs';

export function startExperiment({ taskId, projectId, orchestrator, hypothesis, baseline, mode }) {
  const experimentId = id('exp');
  const item = { experimentId, taskId, projectId, orchestrator, mode, hypothesis: hypothesis || '', baseline: baseline || null, startedAt: new Date().toISOString(), status: 'RUNNING' };
  appendJsonl('experiments.jsonl', item);
  return item;
}
export function finishExperiment(experiment, patch={}) {
  const item = { ...experiment, ...patch, finishedAt: new Date().toISOString(), status: patch.status || 'RECORDED' };
  appendJsonl('experiments.jsonl', item);
  return item;
}
export function appendExperiment(experiment) { return appendJsonl('experiments.jsonl', { ...experiment, recordedAt: new Date().toISOString() }); }
export function listExperiments(limit=100) { return listJsonl('experiments.jsonl', limit); }
export function decideExperiment(experimentId, decision, patch={}) {
  if (!['KEEP','REVERT','ITERATE'].includes(decision)) throw new Error(`Invalid experiment decision: ${decision}`);
  const item={experimentId,decision,...patch,decidedAt:new Date().toISOString()}; appendJsonl('experiments.jsonl',item); return item;
}
