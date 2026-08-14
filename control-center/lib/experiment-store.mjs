import { appendJsonl, id } from './store.mjs';

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
