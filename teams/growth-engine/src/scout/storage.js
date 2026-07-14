import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { getConfig } from "./config.js";

/**
 * Ensure a directory exists.
 */
export function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Atomic JSON write: write to .tmp, then rename.
 */
export function writeJSON(filePath, data, pretty = true) {
  const dir = path.dirname(filePath);
  ensureDir(dir);

  const tmp = filePath + ".tmp";
  const serialized = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
  fs.writeFileSync(tmp, serialized, "utf-8");
  fs.renameSync(tmp, filePath);
}

/**
 * Read JSON file, returning default if missing/corrupt.
 */
export function readJSON(filePath, defaultValue = null) {
  try {
    const content = fs.readFileSync(filePath, "utf-8").trim();
    return content ? JSON.parse(content) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Append a lead as a newline-delimited JSON row.
 */
export function appendJSONL(filePath, lead) {
  const dir = path.dirname(filePath);
  ensureDir(dir);
  fs.appendFileSync(filePath, JSON.stringify(lead) + "\n", "utf-8");
}

/**
 * Write leads to CSV file.
 */
export function writeCSV(filePath, leads) {
  if (!Array.isArray(leads) || leads.length === 0) {
    writeJSON(filePath, []);
    return;
  }

  const dir = path.dirname(filePath);
  ensureDir(dir);

  // Collect all keys across all leads
  const allKeys = new Set(["id", "nome", "instagram", "telefone", "whatsapp"]);
  leads.forEach((l) => {
    if (l && typeof l === "object") Object.keys(l).forEach((k) => allKeys.add(k));
  });

  const headers = [...allKeys];

  // Escape CSV values
  const esc = (v) => {
    const s = v == null ? "" : String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };

  const lines = [
    headers.join(","),
    ...leads.map((l) => headers.map((h) => esc(l?.[h])).join(",")),
  ];

  const tmp = filePath + ".tmp";
  fs.writeFileSync(tmp, lines.join("\n") + "\n", "utf-8");
  fs.renameSync(tmp, filePath);
}

/**
 * Generate a deterministic lead ID.
 */
export function generateLeadId(lead) {
  const insta = lead?.instagram || "";
  if (insta && insta.startsWith("@")) {
    const clean = insta.replace(/^@/, "").toLowerCase();
    return `insta:${clean}`;
  }

  const phone = String(lead?.telefone || lead?.whatsapp || "").replace(/\D/g, "");
  if (phone && phone.length >= 10) {
    return `phone:${phone}`;
  }

  const site = lead?.site || "";
  if (site) {
    try {
      const u = new URL(site);
      const host = u.hostname.replace(/^www\./, "").toLowerCase();
      return `site:${host}`;
    } catch {
      // fall through
    }
  }

  const nome = (lead?.nome || "").trim();
  const cidade = (lead?.cidade || "").trim();
  const estado = (lead?.estado || "").trim();
  if (nome && nome.length >= 3) {
    const key = `${nome}|${cidade}|${estado}`;
    const hash = crypto.createHash("md5").update(key.toLowerCase()).digest("hex").slice(0, 8);
    return `name:${hash}`;
  }

  return `hash:${crypto.randomUUID().slice(0, 8)}`;
}

/**
 * Save leads — master JSON, CSV backup, and JSONL log.
 */
export function saveLeads(leads, runId) {
  const config = getConfig();
  const now = new Date().toISOString();
  const enriched = leads.map((lead) => ({
    ...lead,
    id: lead.id || generateLeadId(lead),
    salvoEm: now,
    origem: lead.origem || "scout",
  }));

  // Main JSON file
  writeJSON(config.LEADS_FILE, enriched);

  // CSV export
  const csvPath = config.LEADS_FILE.replace(/\.json$/, ".csv");
  writeCSV(csvPath, enriched);

  // JSONL log per run
  const jsonlPath = path.join(
    config.DATA_DIR,
    "runs",
    `leads-${runId}.jsonl`
  );
  enriched.forEach((l) => appendJSONL(jsonlPath, l));

  console.log(`[STORAGE] ${enriched.length} leads salvos em ${config.LEADS_FILE}`);
  console.log(`[STORAGE] CSV: ${csvPath}`);
  console.log(`[STORAGE] JSONL: ${jsonlPath}`);

  return { filePath: config.LEADS_FILE, count: enriched.length };
}

/**
 * Save duplicate leads to separate file.
 */
export function saveDuplicates(duplicates, runId) {
  const config = getConfig();
  const data = {
    runId,
    savedAt: new Date().toISOString(),
    count: duplicates.length,
    duplicates,
  };

  writeJSON(config.DUPLICATES_FILE, data);
  console.log(`[STORAGE] ${duplicates.length} duplicatas em ${config.DUPLICATES_FILE}`);
}

/**
 * Save rejected leads.
 */
export function saveRejected(rejected, runId) {
  const config = getConfig();
  const data = {
    runId,
    savedAt: new Date().toISOString(),
    count: rejected.length,
    rejected,
  };

  writeJSON(config.REJECTED_FILE, data);
  console.log(`[STORAGE] ${rejected.length} rejeitados em ${config.REJECTED_FILE}`);
}

/**
 * Save raw Tavily response to raw/ directory.
 */
export function saveRawResponse(query, response, runId) {
  const config = getConfig();
  const dir = config.RAW_DIR;
  ensureDir(dir);

  const datePrefix = new Date().toISOString().slice(0, 10);
  const safeName = query
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .slice(0, 40);
  const filePath = path.join(dir, `${datePrefix}_${safeName}_${runId}.json`);

  writeJSON(filePath, response);
  return filePath;
}

/**
 * Save checkout state (temp data) to temp/ directory.
 */
export function saveTemp(runId, phase, data) {
  const config = getConfig();
  const dir = config.TEMP_DIR;
  ensureDir(dir);

  const filePath = path.join(dir, `${runId}_${phase}.json`);
  writeJSON(filePath, data);
  return filePath;
}

/**
 * Read the master leads file.
 */
export function readMasterLeads() {
  const config = getConfig();
  return readJSON(config.LEADS_FILE, []);
}

/**
 * Merge new leads into the master list (dedup-aware).
 */
export function mergeIntoMaster(newLeads, runId) {
  const config = getConfig();
  const existing = readMasterLeads();
  const existingMap = new Map(existing.map((l) => [l.id, l]));

  let added = 0;
  let updated = 0;
  let skipped = 0;

  for (const lead of newLeads) {
    const id = lead.id || generateLeadId(lead);
    const existingLead = existingMap.get(id);

    if (existingLead) {
      // Merge: keep existing fields, fill in blanks from new
      const merged = { ...existingLead };
      let changed = false;

      for (const [key, value] of Object.entries(lead)) {
        if (value != null && (existingLead[key] == null || value !== existingLead[key])) {
          if (key === "resumo" && typeof value === "string") {
            if (value.length > (existingLead.resumo || "").length) {
              merged[key] = value;
              changed = true;
            }
          } else if (key === "score") {
            if (Number(value) > Number(existingLead.score || 0)) {
              merged[key] = value;
              changed = true;
            }
          } else if (!["id", "salvoEm", "origem", "historico"].includes(key)) {
            merged[key] = value;
            changed = true;
          }
        }
      }

      if (changed) {
        merged.ultimaAtualizacao = new Date().toISOString();
        merged.historico = [
          ...(Array.isArray(merged.historico) ? merged.historico : []),
          { data: new Date().toISOString(), acao: "atualizado", runId },
        ];
        existingMap.set(id, merged);
        updated++;
      } else {
        skipped++;
      }
    } else {
      const newLead = {
        ...lead,
        id,
        encontradoEm: new Date().toISOString(),
        salvoEm: new Date().toISOString(),
        origem: "scout",
        historico: [
          { data: new Date().toISOString(), acao: "adicionado", runId },
        ],
      };
      existingMap.set(id, newLead);
      added++;
    }
  }

  const merged = [...existingMap.values()];
  writeJSON(config.LEADS_FILE, merged);

  // Also write CSV
  const csvPath = config.LEADS_FILE.replace(/\.json$/, ".csv");
  writeCSV(csvPath, merged);

  console.log(`[STORAGE] Master atualizado: +${added} novos, ${updated} atualizados, ${skipped} sem alterações (total: ${merged.length})`);

  return { added, updated, skipped, total: merged.length };
}

export default {
  ensureDir,
  writeJSON,
  readJSON,
  writeCSV,
  appendJSONL,
  generateLeadId,
  saveLeads,
  saveDuplicates,
  saveRejected,
  saveRawResponse,
  saveTemp,
  readMasterLeads,
  mergeIntoMaster,
};
