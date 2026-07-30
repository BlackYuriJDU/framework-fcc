#!/usr/bin/env node
/**
 * Google Maps Scraper Wrapper
 *
 * Wrapper para github.com/gosom/google-maps-scraper.
 * Busca restaurantes no Google Maps e estrutura resultados para lead gen.
 *
 * Uso:
 *   node maps-scraper-wrapper.mjs --query "restaurantes em Recife" --max 20
 *
 * Dependência (Go): go install github.com/gosom/google-maps-scraper@latest
 * Alternativa: usar Tavily search como fallback
 */

import { execSync } from "child_process";
import { existsSync } from "fs";

const args = process.argv.slice(2);
const queryIndex = args.indexOf("--query");
const query = queryIndex >= 0 ? args[queryIndex + 1] : null;
const maxIndex = args.indexOf("--max");
const maxResults = Math.min(50, Math.max(1, Number(maxIndex >= 0 ? args[maxIndex + 1] : 20) || 20));

if (!query) {
  console.error(`Uso: node maps-scraper-wrapper.mjs --query "restaurantes em [cidade]" [--max 20]`);
  process.exit(1);
}

async function searchTavily(query) {
  try {
    const tavilyScript = process.env.HOME + "/.claude/vertexion-agent-system/scripts/tavily-search.mjs";
    if (!existsSync(tavilyScript)) {
      console.error("Tavily script not found at:", tavilyScript);
      return [];
    }
    const out = execSync(`node "${tavilyScript}" --query "${query}" --max-results ${maxResults}`, {
      encoding: "utf-8",
      env: { ...process.env },
    });
    return JSON.parse(out).results || [];
  } catch (err) {
    console.error("Tavily search failed:", err.message);
    return [];
  }
}

function tryMapsScraper(query) {
  try {
    const out = execSync(`google-maps-scraper --query "${query}" --max ${maxResults} --format json`, {
      encoding: "utf-8",
      timeout: 60000,
    });
    return JSON.parse(out);
  } catch (err) {
    console.error("Google Maps scraper not available or failed:", err.message);
    return null;
  }
}

// Try maps scraper first, fallback to Tavily
let results = tryMapsScraper(query);
let source = "google-maps-scraper";

if (!results || results.length === 0) {
  console.error("Maps scraper unavailable, falling back to Tavily...");
  results = await searchTavily(query + " restaurante");
  source = "tavily";
}

// Structure results for lead gen
const leads = (results || []).map((r, i) => ({
  id: `lead-${Date.now()}-${i}`,
  source,
  name: r.title || r.name || "Unknown",
  address: r.address || r.location || "",
  phone: r.phone || r.phone_number || "",
  website: r.website || r.url || "",
  rating: r.rating || null,
  reviews: r.reviews || r.reviews_count || null,
  category: r.category || r.type || "Restaurante",
  city: extractCity(query, r),
  raw: r,
  foundAt: new Date().toISOString(),
}));

console.log(JSON.stringify({ query, source, total: leads.length, leads }, null, 2));

function extractCity(query, result) {
  const address = (result.address || result.location || "").toLowerCase();
  const queryParts = query.toLowerCase().split(/\s+(?:em|no|na|de)\s+/);
  if (queryParts.length > 1) return queryParts[queryParts.length - 1].trim();
  return address.split(",").slice(-2, -1)[0]?.trim() || "";
}
