import { getConfig } from "./config.js";

const SUPABASE_TABLE = "leads";

/**
 * Save leads to Supabase (optional integration).
 * Uses service_role key for server-side writes.
 * Silently skips if not enabled or misconfigured.
 */
export async function saveToSupabase(leads, runId, logger) {
  const config = getConfig();

  if (!config.ENABLE_SUPABASE) {
    logger?.info("[SUPABASE] Integração desabilitada. Pulando.");
    return { enabled: false, saved: 0, errors: 0 };
  }

  if (!config.SUPABASE_URL || !config.SUPABASE_SERVICE_KEY) {
    logger?.warn("[SUPABASE] Configuração incompleta (SUPABASE_URL ou SUPABASE_SERVICE_KEY ausente). Pulando.");
    return { enabled: false, saved: 0, errors: 0 };
  }

  if (!leads || leads.length === 0) {
    logger?.info("[SUPABASE] Nenhum lead para salvar.");
    return { enabled: true, saved: 0, errors: 0 };
  }

  let saved = 0;
  let errors = 0;

  for (const lead of leads) {
    try {
      const response = await fetch(
        `${config.SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": config.SUPABASE_SERVICE_KEY,
            "Authorization": `Bearer ${config.SUPABASE_SERVICE_KEY}`,
            "Prefer": "return=minimal",
          },
          body: JSON.stringify({
            id: lead.id,
            nome: lead.nome,
            instagram: lead.instagram,
            telefone: lead.telefone,
            whatsapp: lead.whatsapp,
            cidade: lead.cidade,
            estado: lead.estado,
            site: lead.site,
            tipo: lead.tipo,
            status: lead.status || "pendente",
            score: lead.score ?? null,
            nivel: lead.nivel || null,
            fonte: lead.fonte,
            resumo: lead.resumo || "",
            origem: lead.origem || "scout",
            run_id: runId,
            encontrado_em: lead.encontradoEm || new Date().toISOString(),
          }),
        }
      );

      if (response.ok || response.status === 201) {
        saved++;
      } else if (response.status === 409) {
        // Conflict — already exists, try update
        const upsertResponse = await fetch(
          `${config.SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?id=eq.${encodeURIComponent(lead.id)}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "apikey": config.SUPABASE_SERVICE_KEY,
              "Authorization": `Bearer ${config.SUPABASE_SERVICE_KEY}`,
            },
            body: JSON.stringify({
              nome: lead.nome,
              instagram: lead.instagram,
              telefone: lead.telefone,
              cidade: lead.cidade,
              estado: lead.estado,
              status: lead.status || "pendente",
              ultima_verificacao: new Date().toISOString(),
            }),
          }
        );

        if (upsertResponse.ok) {
          saved++;
        } else {
          errors++;
          logger?.warn(`[SUPABASE] Falha ao atualizar lead ${lead.id}: ${upsertResponse.status}`);
        }
      } else {
        errors++;
        const text = await response.text().catch(() => "sem corpo");
        logger?.warn(`[SUPABASE] Erro ${response.status} ao salvar lead ${lead.id}: ${text.slice(0, 200)}`);
      }
    } catch (error) {
      errors++;
      logger?.error(`[SUPABASE] Exceção ao salvar lead ${lead?.id}: ${error.message}`);
    }
  }

  logger?.info(`[SUPABASE] ${saved} leads salvos, ${errors} erros`);
  return { enabled: true, saved, errors };
}

export default { saveToSupabase };
