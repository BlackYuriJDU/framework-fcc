import "dotenv/config";
import { z } from "zod";
import path from "node:path";

const BOOLEAN_MAP = {
  true: true, "1": true, yes: true, sim: true,
  false: false, "0": false, no: false,
};

function parseBool(value) {
  if (typeof value === "boolean") return value;
  if (value === undefined || value === null || value === "") return undefined;
  return BOOLEAN_MAP[String(value).toLowerCase().trim()] ?? undefined;
}

const optionalSecret = z.string().trim().min(1).optional();

const configSchema = z.object({
  TAVILY_API_KEY: optionalSecret,
  GROQ_API_KEY: optionalSecret,

  SCOUT_MODE: z.enum(["real", "dry-run", "test"]).default("real"),
  LEAD_COUNTRY: z.string().default("Brasil"),
  LEAD_LIMIT: z.coerce.number().int().positive().max(1000).default(60),
  SEARCHES_PER_RUN: z.coerce.number().int().positive().max(100).default(10),
  MAX_RETRIES: z.coerce.number().int().min(0).max(10).default(3),

  GROQ_MODEL: z.string().default("llama-3.3-70b-versatile"),
  GROQ_MAX_TOKENS: z.coerce.number().int().positive().max(32000).default(8000),
  GROQ_TEMPERATURE: z.coerce.number().min(0).max(2).default(0.1),

  TAVILY_SEARCH_DEPTH: z.enum(["basic", "advanced"]).default("basic"),
  TAVILY_MAX_RESULTS: z.coerce.number().int().positive().max(20).default(20),
  TAVILY_INCLUDE_RAW: z.boolean().default(false),
  TAVILY_DAILY_CREDIT_LIMIT: z.coerce.number().int().positive().max(1000).default(30),

  MAX_CHARS_PER_RESULT: z.coerce.number().int().positive().default(900),
  MAX_RESULTS_PER_BATCH: z.coerce.number().int().positive().max(50).default(8),

  DATA_DIR: z.string().default("data"),
  LOG_DIR: z.string().default("logs"),
  LEADS_FILE: z.string().default("leads-master.json"),
  HISTORY_FILE: z.string().default("lead-history.json"),
  BUDGET_FILE: z.string().default("tavily-budget.json"),
  DUPLICATES_FILE: z.string().default("duplicates.json"),
  REJECTED_FILE: z.string().default("rejected.json"),
  RAW_DIR: z.string().default("raw"),
  TEMP_DIR: z.string().default("temp"),
  LOCK_FILE: z.string().default("scout.lock"),
  STATE_FILE: z.string().default("scout-state.json"),

  ENABLE_SUPABASE: z.boolean().default(false),
  SUPABASE_URL: optionalSecret,
  SUPABASE_SERVICE_KEY: optionalSecret,

  ENABLE_TELEGRAM: z.boolean().default(false),
  TELEGRAM_BOT_TOKEN: optionalSecret,
  TELEGRAM_CHAT_ID: optionalSecret,
});

function resolvePath(baseDir, relativePath) {
  return path.isAbsolute(relativePath) ? relativePath : path.resolve(baseDir, relativePath);
}

function validateConditional(config) {
  const errors = [];
  if (config.SCOUT_MODE !== "test") {
    if (!config.TAVILY_API_KEY) errors.push("TAVILY_API_KEY é obrigatória nos modos real e dry-run");
    if (!config.GROQ_API_KEY) errors.push("GROQ_API_KEY é obrigatória nos modos real e dry-run");
  }
  if (config.ENABLE_SUPABASE) {
    if (!config.SUPABASE_URL) errors.push("SUPABASE_URL é obrigatória quando ENABLE_SUPABASE=true");
    if (!config.SUPABASE_SERVICE_KEY) errors.push("SUPABASE_SERVICE_KEY é obrigatória quando ENABLE_SUPABASE=true");
  }
  if (config.ENABLE_TELEGRAM) {
    if (!config.TELEGRAM_BOT_TOKEN) errors.push("TELEGRAM_BOT_TOKEN é obrigatória quando ENABLE_TELEGRAM=true");
    if (!config.TELEGRAM_CHAT_ID) errors.push("TELEGRAM_CHAT_ID é obrigatória quando ENABLE_TELEGRAM=true");
  }
  if (errors.length) {
    throw new Error(`Configuração inválida:\n  - ${errors.join("\n  - ")}`);
  }
}

export function loadConfig() {
  const raw = { ...process.env };
  ["TAVILY_INCLUDE_RAW", "ENABLE_SUPABASE", "ENABLE_TELEGRAM"].forEach((key) => {
    if (raw[key] !== undefined) raw[key] = parseBool(raw[key]);
  });

  const result = configSchema.safeParse(raw);
  if (!result.success) {
    const messages = result.error.issues.map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`);
    throw new Error(`Configuração inválida:\n${messages.join("\n")}`);
  }

  const cfg = result.data;
  validateConditional(cfg);
  const baseDir = process.cwd();
  const DATA_DIR = path.resolve(baseDir, cfg.DATA_DIR);
  const LOG_DIR = path.resolve(baseDir, cfg.LOG_DIR);

  return {
    ...cfg,
    DATA_DIR,
    LOG_DIR,
    RAW_DIR: resolvePath(DATA_DIR, cfg.RAW_DIR),
    TEMP_DIR: resolvePath(DATA_DIR, cfg.TEMP_DIR),
    LEADS_FILE: resolvePath(DATA_DIR, cfg.LEADS_FILE),
    HISTORY_FILE: resolvePath(DATA_DIR, cfg.HISTORY_FILE),
    BUDGET_FILE: resolvePath(DATA_DIR, cfg.BUDGET_FILE),
    DUPLICATES_FILE: resolvePath(DATA_DIR, cfg.DUPLICATES_FILE),
    REJECTED_FILE: resolvePath(DATA_DIR, cfg.REJECTED_FILE),
    LOCK_FILE: resolvePath(DATA_DIR, cfg.LOCK_FILE),
    STATE_FILE: resolvePath(DATA_DIR, cfg.STATE_FILE),
    TELEGRAM_ENABLED: cfg.ENABLE_TELEGRAM,
    SUPABASE_ENABLED: cfg.ENABLE_SUPABASE,
    IS_DRY_RUN: cfg.SCOUT_MODE === "dry-run",
    IS_TEST: cfg.SCOUT_MODE === "test",
    TAVILY_API_URL: "https://api.tavily.com",
    GROQ_API_URL: "https://api.groq.com/openai/v1",
  };
}

let cachedConfig = null;
export function getConfig() {
  if (!cachedConfig) cachedConfig = loadConfig();
  return cachedConfig;
}
export function resetConfigForTests() { cachedConfig = null; }
export default getConfig;
