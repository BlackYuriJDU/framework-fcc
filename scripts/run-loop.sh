#!/bin/bash
# Loop Runner — executa triagem diária via Claude Code
# Uso: ./run-loop.sh [--notify]
# --notify: envia relatório via webhook/Telegram (quando configurado)

set -e
cd "$(dirname "$0")/.."

LOOP_DIR="/home/arthur/.claude/vertexion-agent-system"
STATE_FILE="$LOOP_DIR/STATE.md"
LOG_FILE="$LOOP_DIR/loop-run-log.md"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S %z')
NOTIFY="${1:-}"

echo "[$TIMESTAMP] Iniciando loop triage..."

# Resolve binário Claude (fcc-claude || claude || env var)
CLAUDE_CMD=$(bash "$LOOP_DIR/scripts/lib/resolve-claude.sh") || true

if [ -z "$CLAUDE_CMD" ]; then
  MSG="[LOOP FAIL] $TIMESTAMP — Binário claude/fcc-claude não encontrado.
Verifique:
1. FCC está instalado? (~/.local/bin/fcc-claude)
2. Claude Code está instalado? (~/.local/bin/claude)
3. Ou defina VERTEXION_CLAUDE_COMMAND no .bashrc"
  echo "[$TIMESTAMP] $MSG" >> "$LOG_FILE"
  echo "# Loop State — $(date '+%Y-%m-%d')" > "$STATE_FILE"
  echo "" >> "$STATE_FILE"
  echo "Last run: $TIMESTAMP" >> "$STATE_FILE"
  echo "Status: FAILED — claude/fcc-claude not found" >> "$STATE_FILE"
  echo "" >> "$STATE_FILE"
  echo "## Diagnóstico" >> "$STATE_FILE"
  echo "$MSG" >> "$STATE_FILE"
  # Notificação via Telegram se configurado
  if [ -n "$TELEGRAM_BOT_TOKEN" ] && [ -n "$TELEGRAM_CHAT_ID" ] && [ "$NOTIFY" = "--notify" ]; then
    curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
      -d "chat_id=${TELEGRAM_CHAT_ID}&text=${MSG}" &>/dev/null || true
  fi
  exit 1
fi

echo "[$TIMESTAMP] Binário encontrado: $CLAUDE_CMD"

# Executa Claude Code em modo não-interativo com o agente de triagem
OUTPUT=$($CLAUDE_CMD -p "Run engineering-loop-triage. Leia LOOP.md e STATE.md primeiro. Produza relatório." \
  --agent engineering-loop-triage \
  --allowedTools "Read,Grep,Glob,Bash,WebFetch" \
  --print 2>&1) || true

if [ -z "$OUTPUT" ]; then
  MSG="[LOOP FAIL] $TIMESTAMP — Claude Code executou mas não produziu output.
Binário: $CLAUDE_CMD
Possíveis causas: FCC sem autenticação, non-interactive mode falhando, --print sem suporte."
  echo "[$TIMESTAMP] $MSG" >> "$LOG_FILE"
  echo "# Loop State — $(date '+%Y-%m-%d')" > "$STATE_FILE"
  echo "" >> "$STATE_FILE"
  echo "Last run: $TIMESTAMP" >> "$STATE_FILE"
  echo "Status: FAILED — empty output" >> "$STATE_FILE"
  echo "" >> "$STATE_FILE"
  echo "## Diagnóstico" >> "$STATE_FILE"
  echo "$MSG" >> "$STATE_FILE"
  # Notificação via Telegram se configurado
  if [ -n "$TELEGRAM_BOT_TOKEN" ] && [ -n "$TELEGRAM_CHAT_ID" ] && [ "$NOTIFY" = "--notify" ]; then
    curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
      -d "chat_id=${TELEGRAM_CHAT_ID}&text=${MSG}" &>/dev/null || true
  fi
  exit 1
fi

# Atualiza STATE.md com o output
echo "# Loop State — $(date '+%Y-%m-%d')" > "$STATE_FILE"
echo "" >> "$STATE_FILE"
echo "Last run: $TIMESTAMP" >> "$STATE_FILE"
echo "Binário: $CLAUDE_CMD" >> "$STATE_FILE"
echo "Status: COMPLETED" >> "$STATE_FILE"
echo "" >> "$STATE_FILE"
echo "## Output" >> "$STATE_FILE"
echo "$OUTPUT" >> "$STATE_FILE"

# Atualiza run log
echo "## [$TIMESTAMP]" >> "$LOG_FILE"
echo "Binário: $CLAUDE_CMD" >> "$LOG_FILE"
echo "Status: COMPLETED" >> "$LOG_FILE"
echo "---" >> "$LOG_FILE"

echo "[$TIMESTAMP] Loop concluído. STATE.md atualizado."

# Notificação de sucesso (se --notify)
if [ -n "$TELEGRAM_BOT_TOKEN" ] && [ -n "$TELEGRAM_CHAT_ID" ] && [ "$NOTIFY" = "--notify" ]; then
  SUMMARY=$(echo "$OUTPUT" | head -20)
  curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
    -d "chat_id=${TELEGRAM_CHAT_ID}&text=[LOOP OK] $TIMESTAMP — Triage concluída.
Primeiras linhas:
$SUMMARY" &>/dev/null || true
fi
