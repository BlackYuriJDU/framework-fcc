import crypto from "node:crypto";

/**
 * Generate a unique run ID.
 */
export function generateRunId() {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = crypto.randomBytes(3).toString("hex");
  return `${datePart}-${randomPart}`;
}

/**
 * Async sleep/delay.
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Jitter: random delay between base and base * (1 + factor).
 * Default factor 0.5 => [base, base*1.5]
 */
export function jitter(base = 1000, factor = 0.5) {
  return Math.floor(base + base * factor * Math.random());
}

/**
 * Format current date/time in Brazilian locale.
 */
export function formatDateTime(date = new Date()) {
  return date.toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * Format a duration in ms to human-readable string.
 */
export function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

/**
 * Normalize text: lowercase, remove accents, trim.
 */
export function normalizeText(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Pick random items from an array (Fisher-Yates partial shuffle).
 */
export function pickRandom(arr, count) {
  const copy = [...arr];
  const result = [];
  const n = Math.min(count, copy.length);
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(Math.random() * (copy.length - i)) + i;
    [copy[i], copy[idx]] = [copy[idx], copy[i]];
    result.push(copy[i]);
  }
  return result;
}

/**
 * Rotate through items based on time, for consistent but varying selection.
 */
export function rotateSelection(arr, count) {
  const index = Math.floor(Date.now() / (1000 * 60 * 60)) % arr.length;
  const selected = [];
  for (let i = 0; i < count; i++) {
    selected.push(arr[(index + i) % arr.length]);
  }
  return [...new Set(selected)];
}

export default {
  generateRunId,
  sleep,
  jitter,
  formatDateTime,
  formatDuration,
  normalizeText,
  pickRandom,
  rotateSelection,
};
