import { getConfig } from "./config.js";
import { readJSON, writeJSON } from "./storage.js";

function today() { return new Date().toISOString().slice(0, 10); }
function costForDepth(depth) { return depth === "advanced" ? 2 : 1; }

export function reserveTavilyCredits(searchCount, depth) {
  const config = getConfig();
  const date = today();
  const state = readJSON(config.BUDGET_FILE, { date, used: 0, reservations: [] });
  const normalized = state.date === date ? state : { date, used: 0, reservations: [] };
  const cost = Math.max(0, Number(searchCount) || 0) * costForDepth(depth);
  const projected = normalized.used + cost;

  if (projected > config.TAVILY_DAILY_CREDIT_LIMIT) {
    throw new Error(`Orçamento Tavily excedido: ${projected}/${config.TAVILY_DAILY_CREDIT_LIMIT} créditos planejados hoje.`);
  }

  normalized.used = projected;
  normalized.reservations.push({ at: new Date().toISOString(), searches: searchCount, depth, cost });
  writeJSON(config.BUDGET_FILE, normalized);
  return { cost, used: normalized.used, limit: config.TAVILY_DAILY_CREDIT_LIMIT };
}
