import fs from "node:fs";
import path from "node:path";
import { getConfig } from "./config.js";

/**
 * Read the current state from disk.
 * Returns null if no state exists.
 */
export function readState() {
  const config = getConfig();
  try {
    const content = fs.readFileSync(config.STATE_FILE, "utf-8").trim();
    return content ? JSON.parse(content) : null;
  } catch {
    return null;
  }
}

/**
 * Save a checkpoint to disk (atomic write).
 */
export function saveState(state) {
  const config = getConfig();
  const dir = path.dirname(config.STATE_FILE);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const tmp = config.STATE_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2), "utf-8");
  fs.renameSync(tmp, config.STATE_FILE);
}

/**
 * Create initial state for a new run.
 */
export function createInitialState(runId) {
  return {
    runId,
    status: "starting",
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    phase: "init",
    totalLeadsFound: 0,
    totalProcessed: 0,
    totalValid: 0,
    totalRejected: 0,
    totalDuplicates: 0,
    batchesCompleted: 0,
    lastQuery: null,
    errors: [],
  };
}

/**
 * Update state with partial fields.
 */
export function updateState(state, partial) {
  Object.assign(state, partial, { updatedAt: new Date().toISOString() });
  saveState(state);
  return state;
}

/**
 * Clear/reset state (intended for new run after prior crash).
 */
export function clearState() {
  const config = getConfig();
  try {
    if (fs.existsSync(config.STATE_FILE)) {
      fs.unlinkSync(config.STATE_FILE);
    }
  } catch {
    // ignore
  }
}

export default { readState, saveState, createInitialState, updateState, clearState };
