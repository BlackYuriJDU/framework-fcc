import { z } from "zod";
import { normalizeLead } from "./normalize.js";

const BUSINESS_TYPES = [
  "hamburgueria", "pizzaria", "restaurante", "lanchonete",
  "cafeteria", "doceria", "confeitaria", "sorveteria",
  "pastelaria", "churrascaria", "bar", "petiscaria",
  "padaria", "food_truck", "marmitaria", "bistro",
  "creperia", "acaiteria", "esfiharia", "sushi",
  "espetinho", "cervejaria", "galeteria", "peixaria",
  "quentinha", "buffet", "self_service", "cafe",
  "outros",
];

const VALID_UFS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA",
  "MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN",
  "RS","RO","RR","SC","SP","SE","TO",
];

const PLACEHOLDER_PATTERNS = [
  /^nome\s*(do\s*)?(restaurante|estabelecimento|negocio)?$/i,
  /^@?instagram/i,
  /^(\(\d{2}\)\s*)?\d{4,5}[\s-]?\d{4}$/i,
  /^exemplo/i,
  /^(11\s*)?9?\d{4}-?\d{4}$/i,
  /^(sem|sem\s+informacao|nao\s+informado|n\/i)/i,
  /^[0-9]{4,}$/,
];

/**
 * Check if a value is a placeholder placeholder.
 */
function isPlaceholder(value) {
  if (!value) return false;
  const str = String(value).trim();
  return PLACEHOLDER_PATTERNS.some((p) => p.test(str));
}

/**
 * Lead validation schema.
 */
export const leadSchema = z.object({
  nome: z
    .string()
    .min(2, "Nome muito curto")
    .max(200, "Nome muito longo")
    .refine((v) => !isPlaceholder(v), "Nome parece placeholder"),

  instagram: z
    .string()
    .nullable()
    .optional()
    .refine((v) => !v || (v.startsWith("@") && v.length >= 3), "Instagram inválido"),

  telefone: z
    .string()
    .nullable()
    .optional()
    .refine((v) => !v || /^\d{10,13}$/.test(v.replace(/\D/g, "")), "Telefone inválido"),

  whatsapp: z
    .string()
    .nullable()
    .optional(),

  cidade: z
    .string()
    .nullable()
    .optional(),

  estado: z
    .string()
    .nullable()
    .optional()
    .refine(
      (v) => !v || VALID_UFS.includes(v.toUpperCase()),
      "Estado deve ser UF válida (SP, RJ, MG, ...)"
    ),

  tipo: z
    .string()
    .optional()
    .refine((v) => !v || BUSINESS_TYPES.includes(v.toLowerCase()), "Tipo inválido"),

  fonte: z.string().nullable().optional(),
  resumo: z.string().default(""),
  confianca: z.number().min(0).max(1).optional(),
});

/**
 * Validate a single lead.
 * Returns { valid, data, errors }.
 */
export function validateLead(lead) {
  const normalized = normalizeLead(lead);

  const result = leadSchema.safeParse(normalized);

  if (result.success) {
    return {
      valid: true,
      data: result.data,
      errors: [],
    };
  }

  return {
    valid: false,
    data: normalized,
    errors: result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    })),
  };
}

/**
 * Validate an array of leads.
 */
export function validateLeads(leads) {
  const results = leads.map((lead, index) => {
    const validation = validateLead(lead);

    return {
      index,
      ...validation,
      original: lead,
    };
  });

  return {
    valid: results.filter((r) => r.valid),
    rejected: results.filter((r) => !r.valid),
    total: leads.length,
    validCount: results.filter((r) => r.valid).length,
    rejectedCount: results.filter((r) => !r.valid).length,
  };
}

export default { validateLead, validateLeads, leadSchema };
