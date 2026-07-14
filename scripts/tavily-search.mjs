#!/usr/bin/env node
const args = process.argv.slice(2);
const queryIndex = args.indexOf('--query');
const query = queryIndex >= 0 ? args[queryIndex + 1] : args.join(' ');
const maxIndex = args.indexOf('--max-results');
const maxResults = Math.min(20, Math.max(1, Number(maxIndex >= 0 ? args[maxIndex + 1] : 8) || 8));
const depth = args.includes('--advanced') ? 'advanced' : 'basic';
if (!query) { console.error('Uso: tavily-search --query "consulta" [--max-results 8] [--advanced]'); process.exit(2); }
if (!process.env.TAVILY_API_KEY) { console.error('TAVILY_API_KEY não está configurada no ambiente.'); process.exit(3); }
const response = await fetch('https://api.tavily.com/search', {
  method: 'POST', headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ api_key: process.env.TAVILY_API_KEY, query, search_depth: depth, max_results: maxResults, include_answer: false, include_raw_content: false }),
});
if (!response.ok) { console.error(`Tavily HTTP ${response.status}`); process.exit(4); }
const data = await response.json();
const safe = { query, searchDepth: depth, results: (data.results || []).map(item => ({ title: item.title, url: item.url, content: String(item.content || '').slice(0, 1400), score: item.score })) };
console.log(JSON.stringify(safe, null, 2));
