import axios from "axios";
import { getConfig } from "./config.js";
import { sleep, jitter } from "./utils.js";

const SYSTEM_PROMPT = `Você é um analisor de leads para restaurantes brasileiros.

Sua função: analisar resultados de busca e extrair LEADS de restaurantes, hamburguerias, pizzarias, lanchonetes, cafeterias, docerias, sorveterias, pastelarias, churrascarias, bares, petiscarias, padarias, food trucks, marmitarias, bistrôs, creperias, acaiterias e similares **do Brasil inteiro**.

REGRAS ABSOLUTAS:
1. Retorne APENAS JSON válido. NADA de markdown, nada de texto explicativo.
2. Extraia leads SOMENTE de resultados com Instagram, WhatsApp ou site de cardápio.
3. NUNCA invente informações. Se não encontrar, deixe o campo como null.
4. Foque em estabelecimentos PEQUENOS e MÉDIOS — food trucks, marmitarias, restaurantes de bairro.
5. DESCONSIDERE perfis de curadoria (guias, listas, "melhores restaurantes de...").
6. DESCONSIDERE grandes redes/franquias (McDonald's, BK, Subway, Outback, etc.).
7. DESCONSIDERE resultados internacionais (fora do Brasil).
8. Extraia Instagram mesmo que apareça no texto/nome do resultado.
9. Telefone: extraia apenas números com DDD brasileiro válido (11-99).
10. Cidade e estado: extraia do conteúdo do resultado.
11. Se um resultado NÃO parecer um restaurante brasileiro válido, NÃO o inclua.
12. Para o campo "tipo", use um destes: hamburgueria, pizzaria, restaurante, lanchonete, cafeteria, doceria, congeitaria, sorveteria, pastelaria, churrascaria, bar, petiscaria, padaria, food_truck, marmitaria, bistro, creperia, acaiteria, esfiharia, sushi, espetinho, cervejaria, galeteria, peixaria, quentinha, buffet, self_service, cafe, outros.

Formato de resposta (array JSON):
[
  {
    "nome": "Nome do estabelecimento",
    "instagram": "@username ou null",
    "telefone": "número com DDD ou null",
    "cidade": "cidade ou null",
    "estado": "UF (SP/RJ/MG/etc) ou null",
    "tipo": "hamburgueria|pizzaria|...",
    "fonte": "URL do resultado",
    "resumo": "breve descrição do que foi encontrado",
    "confianca": 0.0 a 1.0
  }
]`;

/**
 * Call Groq with structured output via JSON mode.
 */
export async function qualificarComGroq(compactedResults, options = {}) {
  const config = getConfig();

  const model = options.model ?? config.GROQ_MODEL;
  const maxTokens = options.maxTokens ?? config.GROQ_MAX_TOKENS;
  const temperature = options.temperature ?? config.GROQ_TEMPERATURE;

  const content = JSON.stringify(compactedResults.results || compactedResults, null, 2);

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: `Analise estes resultados de busca e extraia os leads de restaurantes brasileiros válidos:\n\n${content}`,
    },
  ];

  const payload = {
    model,
    messages,
    max_tokens: maxTokens,
    temperature,
    response_format: { type: "json_object" },
  };

  let lastError = null;

  for (let attempt = 1; attempt <= config.MAX_RETRIES; attempt++) {
    try {
      const response = await axios.post(
        `${config.GROQ_API_URL}/chat/completions`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${config.GROQ_API_KEY}`,
          },
          timeout: 60_000,
        }
      );

      const choice = response.data?.choices?.[0];
      const text = choice?.message?.content || "";

      if (!text) {
        throw new Error("Groq retornou resposta vazia");
      }

      // Parse the JSON response
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        // Try to extract JSON from response
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Resposta do Groq não é JSON válido: " + text.slice(0, 200));
        }
      }

      // Groq JSON mode wraps in object with "leads" key sometimes
      let leads = Array.isArray(parsed) ? parsed : parsed?.leads || parsed?.resultados || [];

      if (!Array.isArray(leads)) {
        leads = [leads];
      }

      console.log(`[GROQ] ${leads.length} leads extraídos (modelo: ${model})`);
      return leads;
    } catch (error) {
      lastError = error;
      const status = error?.response?.status;
      const msg =
        error?.response?.data?.error?.message || error?.message || "Erro desconhecido";

      // 413 = payload too large → compact more aggressively
      if (status === 413) {
        const reducedResults = (compactedResults.results || compactedResults).slice(0, 4);
        const reducedContent = JSON.stringify(reducedResults, null, 2);

        if (reducedContent.length < content.length) {
          console.warn("[GROQ] Payload muito grande (413). Reduzindo para 4 resultados...");
          return qualificarComGroq({ results: reducedResults }, { ...options, attempt: 1 });
        }

        throw new Error(`Groq 413 mesmo com payload reduzido: ${msg}`);
      }

      if (status === 429 || status === 503) {
        const wait = jitter(5000 * attempt, 0.3);
        console.warn(`[GROQ] Rate limit (${status}). Aguardando ${wait}ms...`);
        await sleep(wait);
        continue;
      }

      if (attempt < config.MAX_RETRIES) {
        const wait = jitter(2000 * attempt, 0.5);
        console.warn(`[GROQ] Tentativa ${attempt}/${config.MAX_RETRIES}: ${msg}. Tentando novamente em ${wait}ms...`);
        await sleep(wait);
        continue;
      }

      throw new Error(`Groq falhou após ${config.MAX_RETRIES} tentativas: ${msg}`);
    }
  }

  throw lastError;
}

export default { qualificarComGroq };
