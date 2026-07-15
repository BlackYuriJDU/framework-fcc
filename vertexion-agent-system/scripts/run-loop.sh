#!/bin/bash
# Loop Runner — executa triagem diária via Claude Code
# Uso: ./run-loop.sh [--notify]
# --notify: envia relatório via webhook (quando configurado)

set -e
cd "$(dirname "$0")/.."

LOOP_DIR="/home/arthur/.claude/vertexion-agent-system"
STATE_FILE="$LOOP_DIR/STATE.md"
LOG_FILE="$LOOP_DIR/loop-run-log.md"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S %z')

echo "[$TIMESTAMP] Iniciando loop triage..."

# Executa Claude Code em modo não-interativo com o agente de triagem
# NOTA: Requer ANTHROPIC_API_KEY ou FCC configurado para non-interactive
OUTPUT=$(claude -p "Run engineering-loop-triage. Leia LOOP.md e STATE.md primeiro. Produza relatório." \
  --agent engineering-loop-triage \
  --allowedTools "Read,Grep,Glob,Bash,WebFetch" \
  --print 2>&1) || true

if [ -z "$OUTPUT" ]; then
  echo "[$TIMESTAMP] AVISO: Nenhum output do Claude Code (pode precisar de setup FCC)" >> "$LOG_FILE"
  exit 1
fi

# Atualiza STATE.md com o output
echo "# Loop State — $(date '+%Y-%m-%d')" > "$STATE_FILE"
echo "" >> "$STATE_FILE"
echo "Last run: $TIMESTAMP" >> "$STATE_FILE"
echo "" >> "$STATE_FILE"
echo "$OUTPUT" >> "$STATE_FILE"

# Atualiza run log
echo "## [$TIMESTAMP]" >> "$LOG_FILE"
echo "Status: COMPLETED" >> "$LOG_FILE"
echo "---" >> "$LOG_FILE"

echo "[$TIMESTAMP] Loop concluído. STATE.md atualizado."
