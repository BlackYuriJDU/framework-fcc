#!/bin/bash
# Loop Runner — executa triagem diária via Claude Code
# Uso: ./run-loop.sh [--notify]
# --notify: envia relatório via webhook (quando configurado)

set -e
# Garante PATH do usuário — cron/systemd não herdam ~/.local/bin
export PATH="$HOME/.local/bin:$PATH"
cd "$(dirname "$0")/.."

LOOP_DIR="/home/arthur/.claude/vertexion-agent-system"
STATE_FILE="$LOOP_DIR/STATE.md"
LOG_FILE="$LOOP_DIR/loop-run-log.md"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S %z')

# Detecta binário disponível (fcc-claude tem prioridade)
CLD_CMD=""
if command -v fcc-claude >/dev/null 2>&1; then
  CLD_CMD="fcc-claude"
elif command -v claude >/dev/null 2>&1; then
  CLD_CMD="claude"
fi

if [ -z "$CLD_CMD" ]; then
  echo "[$TIMESTAMP] ERRO: Nenhum binário Claude Code encontrado (fcc-claude ou claude)" >> "$LOG_FILE"
  exit 1
fi

echo "[$TIMESTAMP] Iniciando loop triagem (usando: $CLD_CMD)..."

# Executa Claude Code em modo não-interativo com o agente de triagem
# NOTA: Requer ANTHROPIC_API_KEY ou FCC configurado para non-interactive
OUTPUT=$($CLD_CMD -p "Run the Einstein daily triage (L1, report-only). Delegate operations work to operacoes-lead as needed. Leia LOOP.md e STATE.md primeiro. Produza relatório." \
  --agent control-einstein \
  --allowedTools "Read,Grep,Glob,Bash,WebFetch" \
  --print 2>&1) || true

if [ -z "$OUTPUT" ]; then
  echo "[$TIMESTAMP] AVISO: Nenhum output do Claude Code (pode precisar de setup FCC)" >> "$LOG_FILE"
  exit 1
fi

# v8: persistir artefatos e manter STATE.md apenas como ponteiro operacional
TASK_DIR="$LOOP_DIR/tasks/loop/$(( $(date '+%Y') ))/$((10#$(date '+%m')))"
mkdir -p "$TASK_DIR"
printf '%s\n' "$OUTPUT" > "$TASK_DIR/RESULT.md"
cat > "$TASK_DIR/STATE.yaml" <<EOF
task_id: loop-daily
objective: daily-triage
current_phase: EVALUATE
updated_at: $TIMESTAMP
orchestrator: einstein
agent: operacoes-lead
status: completed
result_artifact: $TASK_DIR/RESULT.md
next_action: review-result
EOF
cat > "$STATE_FILE" <<EOF
# Loop State v8

Last run: $TIMESTAMP
State artifact: $TASK_DIR/STATE.yaml
Result artifact: $TASK_DIR/RESULT.md
EOF

# Atualiza run log
echo "## [$TIMESTAMP]" >> "$LOG_FILE"
echo "Status: COMPLETED" >> "$LOG_FILE"
echo "---" >> "$LOG_FILE"

echo "[$TIMESTAMP] Loop concluído. STATE.md atualizado."
