import axios from "axios";
import { getConfig } from "./config.js";
import { sleep, jitter } from "./utils.js";

/**
 * Execute a Tavily search via the /search endpoint.
 * Returns raw results from the API.
 */
export async function searchTavily(query, options = {}) {
  const config = getConfig();

  const maxResults = options.maxResults ?? config.TAVILY_MAX_RESULTS;
  const searchDepth = options.searchDepth ?? config.TAVILY_SEARCH_DEPTH;
  const includeRaw = options.includeRaw ?? config.TAVILY_INCLUDE_RAW;

  const payload = {
    api_key: config.TAVILY_API_KEY,
    query,
    search_depth: searchDepth,
    max_results: maxResults,
    include_answer: false,
    include_images: false,
    include_raw_content: includeRaw,
  };

  let lastError = null;

  for (let attempt = 1; attempt <= config.MAX_RETRIES; attempt++) {
    try {
      const response = await axios.post(`${config.TAVILY_API_URL}/search`, payload, {
        headers: { "Content-Type": "application/json" },
        timeout: 30_000,
      });

      return response.data;
    } catch (error) {
      lastError = error;
      const status = error?.response?.status;
      const msg = error?.response?.data?.detail || error?.message || "Erro desconhecido";

      if (status === 429 || (status >= 500 && status < 600)) {
        const wait = jitter(2000 * attempt, 0.3);
        console.warn(`[TAVILY] Tentativa ${attempt}/${config.MAX_RETRIES} falhou (${status}). Aguardando ${wait}ms...`);
        await sleep(wait);
        continue;
      }

      if (attempt < config.MAX_RETRIES) {
        const wait = jitter(1000 * attempt, 0.5);
        console.warn(`[TAVILY] Tentativa ${attempt}/${config.MAX_RETRIES}: ${msg}. Tentando novamente em ${wait}ms...`);
        await sleep(wait);
        continue;
      }

      throw new Error(`Tavily search failed after ${config.MAX_RETRIES} attempts: ${msg}`);
    }
  }

  throw lastError;
}

/**
 * Compact search results for Groq consumption (avoids 413).
 * Strips raw_content, truncates content, limits results.
 */
export function compactResults(results, options = {}) {
  const config = getConfig();
  const maxChars = options.maxChars ?? config.MAX_CHARS_PER_RESULT;
  const maxResults = options.maxResults ?? config.MAX_RESULTS_PER_BATCH;

  if (!results?.results || !Array.isArray(results.results)) {
    return { results: [], totalResults: 0 };
  }

  const compacted = results.results
    .slice(0, maxResults)
    .map((r) => ({
      title: (r.title || "").slice(0, maxChars),
      url: r.url || "",
      content: (r.content || "").slice(0, maxChars),
      score: r.score ?? null,
      published_date: r.published_date || null,
    }))
    .filter((r) => r.title || r.url);

  return {
    results: compacted,
    totalResults: results.totalResults ?? compacted.length,
    query: results.query,
  };
}

/**
 * Search and compact in one call.
 */
export async function searchAndCompact(query, options = {}) {
  const raw = await searchTavily(query, options);
  return compactResults(raw, options);
}

/**
 * Search multiple queries and return all compacted results merged.
 */
export async function searchBatch(queries, options = {}) {
  const config = getConfig();
  const allResults = [];

  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];
    console.log(`[TAVILY] Busca ${i + 1}/${queries.length}: "${query.slice(0, 80)}..."`);

    try {
      const compacted = await searchAndCompact(query, options);
      allResults.push(...compacted.results);
    } catch (error) {
      console.error(`[TAVILY] Falha na busca "${query.slice(0, 50)}": ${error.message}`);
    }

    if (i < queries.length - 1) {
      const wait = jitter(1500, 0.3);
      await sleep(wait);
    }
  }

  console.log(`[TAVILY] Total de resultados brutos: ${allResults.length}`);
  return allResults;
}

export default { searchTavily, compactResults, searchAndCompact, searchBatch };
