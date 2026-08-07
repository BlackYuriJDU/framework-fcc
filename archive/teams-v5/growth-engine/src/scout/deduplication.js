import { normalizeInstagram, normalizePhone, normalizeUrl } from "./normalize.js";
import { normalizeText } from "./utils.js";

/**
 * Lead deduplication with 6 criteria, ordered by strength.
 *
 * Criteria (strongest first):
 * 1. Instagram ID (exact match)
 * 2. Phone number (digits-only match)
 * 3. Website URL (normalized domain + path)
 * 4. Name + City + State (fuzzy normalized)
 * 5. Name + Phone (partial)
 * 6. Source URL (same result URL)
 */

function prepInstagram(value) {
  return (normalizeInstagram(value) || "").toLowerCase();
}

function prepPhone(value) {
  return normalizePhone(value) || "";
}

function prepUrl(value) {
  return normalizeUrl(value) || "";
}

function prepKey(...parts) {
  return parts
    .filter(Boolean)
    .map((p) => normalizeText(String(p)))
    .join(":");
}

/**
 * Generate all dedup keys for a lead.
 */
export function getDedupKeys(lead) {
  if (!lead) return [];

  const keys = [];

  // 1. Instagram
  const insta = prepInstagram(lead.instagram || lead.fonte);
  if (insta) keys.push({ type: "instagram", key: insta });

  // 2. Phone
  const phone = prepPhone(lead.telefone || lead.whatsapp);
  if (phone) keys.push({ type: "phone", key: phone });

  // 3. Website
  const site = prepUrl(lead.site);
  if (site) keys.push({ type: "site", key: site });

  // 4. Name + City + State
  const name = typeof lead.nome === "string" ? lead.nome.trim() : "";
  const city = lead.cidade || "";
  const state = lead.estado || "";
  if (name && name.length >= 3) {
    keys.push({ type: "name_city_state", key: prepKey(name, city, state) });
  }

  // 5. Name + Phone (partial — use last 8 digits of phone)
  const phonePartial = phone ? phone.slice(-8) : "";
  if (name && name.length >= 3 && phonePartial) {
    keys.push({ type: "name_phone", key: prepKey(name, phonePartial) });
  }

  // 6. Source URL
  const fonte = prepUrl(lead.fonte || lead.url);
  if (fonte) keys.push({ type: "source_url", key: fonte });

  return keys;
}

/**
 * Build a dedup index from an array of known leads.
 * Returns a Map of keyType -> Map(key -> leadId).
 */
export function buildDedupIndex(knownLeads) {
  const index = new Map();

  if (!Array.isArray(knownLeads)) return index;

  for (const lead of knownLeads) {
    if (!lead || !lead.id) continue;

    const keys = getDedupKeys(lead);
    for (const { type, key } of keys) {
      if (!key) continue;

      let typeMap = index.get(type);
      if (!typeMap) {
        typeMap = new Map();
        index.set(type, typeMap);
      }

      // Keep the first association
      if (!typeMap.has(key)) {
        typeMap.set(key, lead.id);
      }
    }
  }

  return index;
}

/**
 * Check if a lead is a duplicate against the dedup index.
 * Returns { isDuplicate, matchedBy, matchedId }.
 */
export function isDuplicate(lead, dedupIndex) {
  const keys = getDedupKeys(lead);

  for (const { type, key } of keys) {
    if (!key) continue;

    const typeMap = dedupIndex.get(type);
    if (typeMap && typeMap.has(key)) {
      return {
        isDuplicate: true,
        matchedBy: type,
        matchedKey: key,
        matchedId: typeMap.get(key),
      };
    }
  }

  return { isDuplicate: false, matchedBy: null, matchedKey: null, matchedId: null };
}

/**
 * Deduplicate a list of new leads against known leads.
 * Returns { unique, duplicates }.
 */
export function deduplicateLeads(newLeads, knownLeads) {
  const index = buildDedupIndex(knownLeads);
  const unique = [];
  const duplicates = [];

  for (const lead of newLeads) {
    const result = isDuplicate(lead, index);

    if (result.isDuplicate) {
      duplicates.push({
        lead,
        matchedBy: result.matchedBy,
        matchedId: result.matchedId,
      });
    } else {
      unique.push(lead);

      // Add to index so subsequent leads in the same batch also dedup
      const keys = getDedupKeys(lead);
      for (const { type, key } of keys) {
        if (!key) continue;
        let typeMap = index.get(type);
        if (!typeMap) {
          typeMap = new Map();
          index.set(type, typeMap);
        }
        if (!typeMap.has(key)) {
          typeMap.set(key, lead.id || `new:${unique.length}`);
        }
      }
    }
  }

  return { unique, duplicates };
}

/**
 * Merge an old lead with new data, preserving existing info.
 */
export function mergeLeads(existing, incoming) {
  const now = new Date().toISOString();

  return {
    ...existing,
    nome: existing.nome || incoming.nome || null,
    instagram: existing.instagram || incoming.instagram || null,
    telefone: existing.telefone || incoming.telefone || null,
    whatsapp: existing.whatsapp || incoming.whatsapp || null,
    cidade: existing.cidade || incoming.cidade || null,
    estado: existing.estado || incoming.estado || null,
    site: existing.site || incoming.site || null,
    fonte: existing.fonte || incoming.fonte || null,
    tipo: existing.tipo || incoming.tipo || null,
    resumo:
      (incoming.resumo || "").length > (existing.resumo || "").length
        ? incoming.resumo
        : existing.resumo || incoming.resumo || "",
    status: existing.status || incoming.status || "pendente",
    score: Math.max(Number(existing.score || 0), Number(incoming.score || 0)),
    nivel:
      Number(incoming.score || 0) > Number(existing.score || 0)
        ? incoming.nivel
        : existing.nivel || "ruim",
    ultimaVerificacaoEm: now,
    historico: [
      ...(Array.isArray(existing.historico) ? existing.historico : []),
      { data: now, acao: "encontrado-novamente", origem: "scout" },
    ],
  };
}

export default {
  getDedupKeys,
  buildDedupIndex,
  isDuplicate,
  deduplicateLeads,
  mergeLeads,
};
