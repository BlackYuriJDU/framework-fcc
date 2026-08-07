#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const inputFile = process.env.LEADS_FILE || path.resolve("data/leads-master.json");
const defaultOutput = path.join(os.homedir(), ".claude", "vertexion-agent-system", "state", "growth", "best-lead.json");
const outputFile = process.env.BEST_LEAD_OUTPUT || defaultOutput;

function readLeads() {
  try {
    const parsed = JSON.parse(fs.readFileSync(inputFile, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
function number(value) { return Number(value) || 0; }
function computeScore(lead) {
  let score = number(lead.score || lead.pontuacao);
  if (!score) {
    if (lead.cardapioVirtual === false || /não|inexist|pdf|imagem/i.test(lead.cardapio || lead.problema || "")) score += 30;
    if (lead.ativo !== false) score += 20;
    const followers = number(lead.seguidores);
    if (followers >= 1000 && followers <= 9000) score += 20;
    else if (followers > 0 && followers < 50000) score += 8;
    if (lead.whatsapp || lead.telefone) score += 15;
    if (lead.instagram) score += 10;
    if (lead.site && /cardapio|menu/i.test(lead.site)) score -= 12;
  }
  return Math.max(0, Math.min(100, score));
}
function channelFor(lead) {
  if (lead.instagram) return "Instagram";
  if (lead.whatsapp || lead.telefone) return "WhatsApp";
  if (lead.facebook) return "Facebook";
  return "E-mail";
}

const eligible = readLeads()
  .filter((lead) => !lead.descartado && !lead.contatado && !["perdido", "dormante"].includes(String(lead.status || "").toLowerCase()))
  .map((lead) => ({ ...lead, computedScore: computeScore(lead) }))
  .sort((a, b) => b.computedScore - a.computedScore);

const result = eligible.length ? {
  generatedAt: new Date().toISOString(),
  best: eligible[0],
  reason: "Maior pontuação entre leads válidos, não contatados e não descartados.",
  outreachBrief: {
    channel: channelFor(eligible[0]),
    constraints: ["personalizar com evidência real", "não informar preço no primeiro contato", "não enviar automaticamente", "não prometer resultado"],
    maxLoomSeconds: 120,
  },
} : { generatedAt: new Date().toISOString(), best: null, reason: "Nenhum lead elegível." };

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, `${JSON.stringify(result, null, 2)}\n`, "utf8");
console.log(JSON.stringify(result, null, 2));
