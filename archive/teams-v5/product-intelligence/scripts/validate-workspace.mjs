#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const target = path.resolve(process.argv[2] || ".");
const required = ["brief.md", "questions.md", "hypotheses.md", "evidence.md", "competitors.md", "experiment.md", "decision.md", "sources.json", "outcome.md"];
const errors = [];
for (const name of required) {
  const file = path.join(target, name);
  if (!fs.existsSync(file)) errors.push(`ausente: ${name}`);
  else if (fs.statSync(file).size === 0) errors.push(`vazio: ${name}`);
}
try {
  const sources = JSON.parse(fs.readFileSync(path.join(target, "sources.json"), "utf8"));
  if (!Array.isArray(sources.sources)) errors.push("sources.json: sources deve ser array");
} catch (error) { errors.push(`sources.json inválido: ${error.message}`); }
const decision = fs.existsSync(path.join(target, "decision.md")) ? fs.readFileSync(path.join(target, "decision.md"), "utf8") : "";
for (const marker of ["Oportunidade", "Confiança", "Nível de evidência", "Sugestão dos Próximos 3 Passos", "Critério de abandono"]) {
  if (!decision.includes(marker)) errors.push(`decision.md sem seção: ${marker}`);
}
console.log(JSON.stringify({ ok: errors.length === 0, workspace: target, errors }, null, 2));
process.exit(errors.length ? 1 : 0);
