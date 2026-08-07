import { getConfig } from "./config.js";
import { generateLeadId, readJSON, writeJSON } from "./storage.js";

function compactLead(lead, status, runId, reason = null) {
  const now = new Date().toISOString();
  return {
    id: generateLeadId(lead),
    nome: lead?.nome || null,
    cidade: lead?.cidade || null,
    estado: lead?.estado || null,
    instagram: lead?.instagram || null,
    telefone: lead?.telefone || lead?.whatsapp || null,
    site: lead?.site || null,
    fonte: lead?.fonte || null,
    status,
    motivo: reason,
    firstSeenAt: now,
    lastSeenAt: now,
    lastRunId: runId,
  };
}

export function readLeadHistory() {
  const config = getConfig();
  const data = readJSON(config.HISTORY_FILE, { version: 1, updatedAt: null, leads: [] });
  return Array.isArray(data?.leads) ? data.leads : [];
}

export function recordLeadHistory({ unique = [], duplicates = [], rejected = [], runId }) {
  const config = getConfig();
  const current = readLeadHistory();
  const index = new Map(current.map((lead) => [lead.id, lead]));

  const upsert = (lead, status, reason = null) => {
    const candidate = compactLead(lead, status, runId, reason);
    const previous = index.get(candidate.id);
    index.set(candidate.id, previous ? {
      ...previous,
      ...candidate,
      firstSeenAt: previous.firstSeenAt || candidate.firstSeenAt,
      lastSeenAt: candidate.lastSeenAt,
    } : candidate);
  };

  unique.forEach((lead) => upsert(lead, "accepted"));
  duplicates.forEach((entry) => upsert(entry.lead || entry.original || entry, "duplicate", entry.reason || entry.matchType || null));
  rejected.forEach((lead) => upsert(lead, "rejected", Array.isArray(lead.errosValidacao) ? JSON.stringify(lead.errosValidacao) : null));

  const leads = [...index.values()].sort((a, b) => String(a.id).localeCompare(String(b.id)));
  writeJSON(config.HISTORY_FILE, { version: 1, updatedAt: new Date().toISOString(), leads });
  return { total: leads.length };
}
