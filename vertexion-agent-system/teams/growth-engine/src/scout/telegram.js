import { getConfig } from "./config.js";

const TELEGRAM_API = "https://api.telegram.org";

/**
 * Send a message via Telegram bot (optional integration).
 * Silently skips if not enabled or misconfigured.
 */
export async function sendTelegram(message, logger) {
  const config = getConfig();

  if (!config.ENABLE_TELEGRAM) {
    logger?.info("[TELEGRAM] Integração desabilitada. Pulando.");
    return { enabled: false, sent: false };
  }

  if (!config.TELEGRAM_BOT_TOKEN || !config.TELEGRAM_CHAT_ID) {
    logger?.warn("[TELEGRAM] Configuração incompleta (TELEGRAM_BOT_TOKEN ou TELEGRAM_CHAT_ID ausente). Pulando.");
    return { enabled: false, sent: false };
  }

  try {
    const response = await fetch(
      `${TELEGRAM_API}/bot${config.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: config.TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      }
    );

    if (!response.ok) {
      const text = await response.text().catch(() => "sem corpo");
      logger?.warn(`[TELEGRAM] Erro ${response.status}: ${text.slice(0, 200)}`);
      return { enabled: true, sent: false, error: text.slice(0, 200) };
    }

    logger?.info("[TELEGRAM] Mensagem enviada com sucesso.");
    return { enabled: true, sent: true };
  } catch (error) {
    logger?.error(`[TELEGRAM] Exceção ao enviar mensagem: ${error.message}`);
    return { enabled: true, sent: false, error: error.message };
  }
}

/**
 * Format a scout report as a Telegram message.
 */
export function formatScoutReport(report) {
  const lines = [
    `<b>🤖 ZapMenu Scout — Relatório</b>`,
    `<b>Execução:</b> ${report.runId}`,
    `<b>Modo:</b> ${report.mode}`,
    `<b>Duração:</b> ${report.duration}`,
    ``,
    `<b>📊 Resultados</b>`,
    `• Leads encontrados: ${report.totalFound}`,
    `• Leads válidos: ${report.valid}`,
    `• Lead rejeitados: ${report.rejected}`,
    `• Duplicatas: ${report.duplicates}`,
    ``,
  ];

  if (report.error) {
    lines.push(`<b>⚠️ Erro:</b> ${report.error}`);
  }

  if (report.supabase) {
    lines.push(`<b>🗄 Supabase:</b> ${report.supabase.saved} salvos, ${report.supabase.errors} erros`);
  }

  lines.push(`<i>${new Date().toLocaleString("pt-BR")}</i>`);

  return lines.join("\n");
}

/**
 * Send a scout completion report via Telegram.
 */
export async function sendScoutReport(report, logger) {
  const message = formatScoutReport(report);
  return sendTelegram(message, logger);
}

export default { sendTelegram, sendScoutReport, formatScoutReport };
