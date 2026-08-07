#!/usr/bin/env node

/**
 * ZapMenu Scout — Orquestrador Principal
 *
 * Fluxo: lock → Tavily → compact → Groq → validate → dedup →
 *        storage → Supabase → Telegram → unlock
 *
 * Modos:
 *   real    — execução completa (padrão)
 *   dry-run — busca e processa, mas NÃO salva nem envia
 *   test    — usa dados mockados (sem APIs externas)
 */

import "dotenv/config";
import { getConfig } from "./config.js";
import { createLogger } from "./logger.js";
import { generateRunId, formatDuration } from "./utils.js";
import { acquireLock, releaseLock, setupLockCleanup } from "./lock.js";
import {
  createInitialState,
  saveState,
  updateState,
  readState,
  clearState,
} from "./state.js";
import { searchBatch } from "./tavily.js";
import { qualificarComGroq } from "./groq.js";
import { validateLeads } from "./validation.js";
import { deduplicateLeads } from "./deduplication.js";
import { mergeIntoMaster, saveDuplicates, saveRejected, readMasterLeads } from "./storage.js";
import { readLeadHistory, recordLeadHistory } from "./history.js";
import { reserveTavilyCredits } from "./budget.js";
import { saveToSupabase } from "./supabase.js";
import { sendScoutReport } from "./telegram.js";

// Exit codes
const EXIT = {
  SUCCESS: 0,
  GENERAL_ERROR: 1,
  INVALID_CONFIG: 2,
  LOCK_ACTIVE: 3,
  TAVILY_FAIL: 4,
  GROQ_FAIL: 5,
  VALIDATION_FAIL: 6,
  LOCAL_PERSIST_FAIL: 7,
  SUPABASE_PARTIAL: 8,
  CANCELLED: 9,
};

/**
 * Main scout execution.
 */
export async function runScout() {
  const config = getConfig();
  const runId = process.env.RUN_ID || generateRunId();
  process.env.RUN_ID = runId;

  const logger = createLogger(runId);
  const startTime = Date.now();

  logger.info("========================================");
  logger.info("ZapMenu Scout iniciado");
  logger.info(`Execução: ${runId}`);
  logger.info(`Modo: ${config.SCOUT_MODE}`);
  logger.info(`País: ${config.LEAD_COUNTRY}`);
  logger.info(`Limite: ${config.LEAD_LIMIT} leads`);
  logger.info("========================================");

  // --- State & Lock ---
  const state = createInitialState(runId);
  state.mode = config.SCOUT_MODE;
  saveState(state);

  if (!config.IS_TEST) {
    acquireLock();
    setupLockCleanup();
  }

  // --- Phase tracking ---
  let currentPhase = "init";
  let tavilyResults = [];
  let groqLeads = [];
  let validatedLeads = [];
  let uniqueLeads = [];
  let duplicates = [];
  let rejectedLeads = [];

  const report = {
    runId,
    mode: config.SCOUT_MODE,
    startTime: new Date().toISOString(),
    duration: null,
    totalFound: 0,
    valid: 0,
    rejected: 0,
    duplicates: 0,
    supabase: null,
    error: null,
  };

  try {
    // ─── PHASE 1: Tavily Search ────────────────────────────
    currentPhase = "tavily";
    updateState(state, { phase: currentPhase });

    if (config.IS_TEST) {
      logger.info("[TEST] Usando leads mockados (pulando Tavily + Groq)");
      groqLeads = getMockLeads();
      logger.info(`[TEST] ${groqLeads.length} leads mock carregados`);
    } else {
      // Build search queries from lead-finder's SEARCH_TERMS
      const searchTerms = buildSearchQueries(config);
      logger.info(`Consultas planejadas: ${searchTerms.length}`);

      const budget = reserveTavilyCredits(searchTerms.length, config.TAVILY_SEARCH_DEPTH);
      logger.info(`[TAVILY] Orçamento reservado: ${budget.cost} créditos (${budget.used}/${budget.limit} hoje)`);

      // --- Batch Tavily searches ---
      tavilyResults = await searchBatch(searchTerms, {
        maxResults: config.TAVILY_MAX_RESULTS,
        searchDepth: config.TAVILY_SEARCH_DEPTH,
      });

      if (tavilyResults.length === 0) {
        logger.warn("[SCOUT] Nenhum resultado do Tavily. Encerrando.");
        releaseLock();
        process.exit(EXIT.TAVILY_FAIL);
      }

      // ─── PHASE 2: Groq Qualification (batched) ──────────────
      currentPhase = "groq";
      updateState(state, { phase: currentPhase });

      // Split results into small batches to avoid Groq 413
      const BATCH_SIZE = config.MAX_RESULTS_PER_BATCH || 20;
      const resultBatches = [];
      for (let i = 0; i < tavilyResults.length; i += BATCH_SIZE) {
        resultBatches.push(tavilyResults.slice(i, i + BATCH_SIZE));
      }

      logger.info(`[GROQ] ${tavilyResults.length} resultados em ${resultBatches.length} lotes de ${BATCH_SIZE}`);

      groqLeads = [];
      for (let batchIdx = 0; batchIdx < resultBatches.length; batchIdx++) {
        const batch = resultBatches[batchIdx];
        logger.info(`[GROQ] Lote ${batchIdx + 1}/${resultBatches.length} (${batch.length} resultados)`);

        try {
          const batchLeads = await qualificarComGroq({ results: batch });
          if (Array.isArray(batchLeads)) {
            groqLeads.push(...batchLeads);
            logger.info(`[GROQ] Lote ${batchIdx + 1}: +${batchLeads.length} leads`);
          }
        } catch (batchError) {
          logger.error(`[GROQ] Lote ${batchIdx + 1} falhou: ${batchError.message}`);
          // Continue with other batches — partial success is acceptable
        }
      }

      logger.info(`[GROQ] Total: ${groqLeads.length} leads extraídos de ${resultBatches.length} lotes`);
    }

    // ─── PHASE 3: Validation ────────────────────────────────
    currentPhase = "validation";
    updateState(state, { phase: currentPhase });

    const validationResult = validateLeads(groqLeads);
    validatedLeads = validationResult.valid.map((r) => r.data);
    rejectedLeads = validationResult.rejected.map((r) => ({
      ...r.original,
      errosValidacao: r.errors,
    }));

    logger.info(
      `[VALIDATION] ${validatedLeads.length} válidos, ${rejectedLeads.length} rejeitados`
    );

    // ─── PHASE 4: Deduplication ────────────────────────────
    currentPhase = "dedup";
    updateState(state, { phase: currentPhase });

    const knownLeads = [...readMasterLeads(), ...readLeadHistory()];
    const dedupResult = deduplicateLeads(validatedLeads, knownLeads);
    uniqueLeads = dedupResult.unique;
    duplicates = dedupResult.duplicates;

    logger.info(
      `[DEDUP] ${uniqueLeads.length} únicos, ${duplicates.length} duplicatas`
    );

    // ─── PHASE 5: Storage ──────────────────────────────────
    currentPhase = "storage";
    updateState(state, { phase: currentPhase });

    if (config.IS_DRY_RUN) {
      logger.info("[DRY-RUN] Resultados processados, mas leads, histórico e relatórios não serão persistidos.");
    } else {
      if (uniqueLeads.length > 0) {
        const storageResult = mergeIntoMaster(uniqueLeads, runId);
        logger.info(
          `[STORAGE] ${storageResult.added} adicionados, ${storageResult.updated} atualizados`
        );
      }
      if (duplicates.length > 0) saveDuplicates(duplicates, runId);
      if (rejectedLeads.length > 0) saveRejected(rejectedLeads, runId);
      const historyResult = recordLeadHistory({ unique: uniqueLeads, duplicates, rejected: rejectedLeads, runId });
      logger.info(`[HISTORY] ${historyResult.total} empresas conhecidas; rejeitados e duplicatas não serão pesquisados novamente.`);
    }

    // ─── PHASE 6: Supabase (optional) ──────────────────────
    currentPhase = "supabase";
    updateState(state, { phase: currentPhase });

    const supabaseResult = await saveToSupabase(uniqueLeads, runId, logger);
    report.supabase = supabaseResult;

    // ─── PHASE 7: Telegram (optional) ──────────────────────
    currentPhase = "telegram";
    updateState(state, { phase: currentPhase });

    const endTime = Date.now();
    const duration = formatDuration(endTime - startTime);

    report.duration = duration;
    report.totalFound = tavilyResults.length || groqLeads.length;
    report.valid = uniqueLeads.length;
    report.rejected = rejectedLeads.length;
    report.duplicates = duplicates.length;

    if (!config.IS_DRY_RUN) {
      await sendScoutReport(report, logger);
    }

    // ─── Final Report ──────────────────────────────────────
    updateState(state, {
      phase: "done",
      status: "success",
      totalProcessed: validatedLeads.length,
      totalValid: uniqueLeads.length,
      totalRejected: rejectedLeads.length,
      totalDuplicates: duplicates.length,
    });

    logger.info("");
    logger.info("========================================");
    logger.info("RELATÓRIO FINAL");
    logger.info("========================================");
    logger.info(`Execução: ${runId}`);
    logger.info(`Modo: ${config.SCOUT_MODE}`);
    logger.info(`Duração: ${duration}`);
    logger.info("");
    logger.info(`Leads encontrados: ${tavilyResults.length || groqLeads.length}`);
    logger.info(`Válidos: ${uniqueLeads.length}`);
    logger.info(`Rejeitados: ${rejectedLeads.length}`);
    logger.info(`Duplicatas: ${duplicates.length}`);
    if (supabaseResult?.enabled) {
      logger.info(`Supabase: ${supabaseResult.saved} salvos, ${supabaseResult.errors} erros`);
    }
    logger.info("========================================");

    // Cleanup
    logger.close();

    if (config.IS_DRY_RUN) {
      console.log("\n[DRY-RUN] Nada foi salvo. Execute sem --dry-run para persistir.");
    }

    return { ...report, state };
  } catch (error) {
    const endTime = Date.now();
    report.duration = formatDuration(endTime - startTime);
    report.error = error.message || String(error);

    logger.error(`[SCOUT] Erro fatal na fase "${currentPhase}":`, error.message);
    logger.error(error.stack);

    updateState(state, {
      phase: currentPhase,
      status: "error",
      errors: [...state.errors, { phase: currentPhase, message: error.message }],
    });

    await sendScoutReport(report, logger).catch(() => {});

    logger.close();

    // Map phase to exit code
    const phaseExitCodes = {
      tavily: EXIT.TAVILY_FAIL,
      groq: EXIT.GROQ_FAIL,
      validation: EXIT.VALIDATION_FAIL,
      storage: EXIT.LOCAL_PERSIST_FAIL,
      supabase: EXIT.SUPABASE_PARTIAL,
    };

    const exitCode = phaseExitCodes[currentPhase] || EXIT.GENERAL_ERROR;
    releaseLock();
    process.exit(exitCode);
  } finally {
    releaseLock();
  }
}

/**
 * Build search queries from config.
 */
function buildSearchQueries(config) {
  // SEARCH_TERMS completos para prospecção nacional
  const ALL_TERMS = [
    "hamburguerias artesanais", "hamburguerias delivery",
    "pizzarias delivery", "pizzarias artesanais",
    "restaurantes familiares", "restaurantes caseiros",
    "restaurantes nordestinos", "restaurantes regionais",
    "marmitarias", "marmitex delivery",
    "lanchonetes de bairro", "cafeterias independentes",
    "docerias", "confeitarias", "acaiterias",
    "sushis delivery", "restaurantes japoneses",
    "temakerias", "churrascarias", "espetinhos",
    "pastelarias", "salgaderias", "padarias com delivery",
    "restaurantes veganos", "restaurantes vegetarianos",
    "alimentacao saudavel", "food trucks",
    "creperias", "tapiocarias", "sorveterias", "bistros",
    "comida fitness delivery", "comida saudavel delivery",
    "marmita fit delivery", "comida congelada delivery",
    "comida low carb", "comida sem gluten",
    "comida detox", "sucos naturais delivery",
    "restaurantes italianos", "restaurantes de massas",
    "restaurantes arabes", "comida mineira delivery",
    "comida baiana delivery", "restaurantes de peixe",
    "frutos do mar restaurante",
    "quentinhas delivery", "prato feito delivery",
    "disk comida", "comida caseira congelada",
    "petiscarias", "botecos com comida",
    "bares com petiscos", "cervejarias artesanais",
    "cachorro quente delivery", "batata recheada delivery",
    "esfiharias", "pastel delivery", "acai delivery",
    "caldos delivery", "sopas delivery",
    "frango assado delivery", "galeteria",
    "cafe colonial", "brunch delivery",
    "hamburguer artesanal", "massas caseiras delivery",
    "buffet infantil delivery", "comida por kilo",
    "restaurante self service",
    "jantar delivery", "almoco delivery",
    "comida vegetariana delivery", "comida vegana delivery",
  ];

  const count = Math.min(config.SEARCHES_PER_RUN, ALL_TERMS.length);
  const startIndex = Math.floor(Date.now() / 1000) % ALL_TERMS.length;
  const selected = [];

  for (let i = 0; i < count; i++) {
    const idx = (startIndex + i) % ALL_TERMS.length;
    selected.push(ALL_TERMS[idx]);
  }

  // Interleave with geographic queries
  const MAJOR_CITIES = [
    "São Paulo", "Rio de Janeiro", "Belo Horizonte", "Salvador",
    "Fortaleza", "Curitiba", "Recife", "Porto Alegre",
    "Brasília", "Goiânia", "Manaus", "Belém",
    "Florianópolis", "Campinas", "Ribeirão Preto",
    "Londrina", "Joinville", "Cuiabá", "São Luís",
  ];

  const queries = [];
  for (let i = 0; i < selected.length; i++) {
    const term = selected[i];

    // Every 3rd term: add geographic query instead
    if (i % 3 === 2) {
      const city = MAJOR_CITIES[i % MAJOR_CITIES.length];
      const geoQuery = `${term} em ${city} delivery Instagram`;
      queries.push(geoQuery);
    }

    // Rotate between query patterns
    const patterns = [
      `${term} Instagram WhatsApp delivery Brasil`,
      `${term} delivery WhatsApp Instagram`,
      `${term} cardapio delivery Instagram WhatsApp`,
      `${term} delivery Instagram`,
      `${term} Instagram delivery cardapio digital`,
    ];

    const pattern = patterns[i % patterns.length];
    queries.push(`"${term}" ${pattern}`);
  }

  return [...new Set(queries)];
}

/**
 * Mock leads for test mode.
 */
function getMockLeads() {
  return [
    { nome: "Hamburgueria do João", instagram: "@hambjoao", cidade: "São Paulo", estado: "SP", tipo: "hamburgueria", fonte: "https://instagram.com/hambjoao", confianca: 0.9 },
    { nome: "Pizzaria da Maria", instagram: "@pizzamaria", cidade: "Rio de Janeiro", estado: "RJ", tipo: "pizzaria", fonte: "https://instagram.com/pizzamaria", telefone: "11987654321", confianca: 0.85 },
    { nome: "Açaí do Rodrigo", instagram: "@acairodrigo", cidade: "Belo Horizonte", estado: "MG", tipo: "acaiteria", fonte: "https://instagram.com/acairodrigo", confianca: 0.8 },
    { nome: "Padaria do Bairro", instagram: "@padariabairro", cidade: "Curitiba", estado: "PR", tipo: "padaria", fonte: "https://instagram.com/padariabairro", confianca: 0.75 },
    { nome: "Food Truck do Tonho", instagram: "@ftonho", cidade: "Salvador", estado: "BA", tipo: "food_truck", fonte: "https://instagram.com/ftonho", confianca: 0.7 },
    { nome: "Esfiharia do Farid", instagram: "@esfifarid", cidade: "São Paulo", estado: "SP", tipo: "esfiharia", fonte: "https://instagram.com/esfifarid", confianca: 0.85 },
    { nome: "Pastelaria da Feira", instagram: "@pastelfeira", cidade: "Recife", estado: "PE", tipo: "pastelaria", fonte: "https://instagram.com/pastelfeira", confianca: 0.65 },
    { nome: "Churrascaria do Gaúcho", instagram: "@churrasgaucho", cidade: "Porto Alegre", estado: "RS", tipo: "churrascaria", fonte: "https://instagram.com/churrasgaucho", confianca: 0.8 },
    { nome: "Sushi do Kenji", instagram: "@sushikenji", cidade: "São Paulo", estado: "SP", tipo: "sushi", fonte: "https://instagram.com/sushikenji", confianca: 0.9 },
    { nome: "Cafeteria Central", instagram: "@cafecentral", cidade: "Brasília", estado: "DF", tipo: "cafeteria", fonte: "https://instagram.com/cafecentral", confianca: 0.75 },
    { nome: "Marmitaria da Dona", instagram: "@marmdona", cidade: "Fortaleza", estado: "CE", tipo: "marmitaria", fonte: "https://instagram.com/marmdona", confianca: 0.7 },
    { nome: "Boteco do Zé", instagram: "@boteco_ze", cidade: "São Paulo", estado: "SP", tipo: "bar", fonte: "https://instagram.com/boteco_ze", confianca: 0.8 },
    // Duplicatas (devem ser filtradas)
    { nome: "Hamburgueria do João", instagram: "@hambjoao", cidade: "São Paulo", estado: "SP", tipo: "hamburgueria", confianca: 0.9 },
    // Rejeitados (sem nome válido)
    { nome: "", instagram: "@sem_nome", tipo: "hamburgueria", confianca: 0.3 },
  ];
}

// ─── CLI Entry Point ──────────────────────────────────────────
const isMainModule = process.argv[1] && (
  process.argv[1].endsWith("scout.js") ||
  process.argv[1].endsWith("scout")
);

if (isMainModule) {
  runScout().catch((error) => {
    console.error("Erro fatal não tratado:", error);
    releaseLock();
    process.exit(1);
  });
}

export default runScout;
