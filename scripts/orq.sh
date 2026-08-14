#!/usr/bin/env bash
# /orq — Orchestrator Switcher
# Uso: orq.sh [orchestrator-id]
#   Com argumento: ativa o orquestrador diretamente (non-interactive)
#   Sem argumento: usa fzf interativo (se TTY disponível) ou lista opções
#
# Também atualiza ~/.claude/settings.json com o agent correspondente
# para que o nome/cor apareçam corretamente no chat na próxima sessão.

set -euo pipefail

ORCH_DIR="$HOME/.claude/vertexion-agent-system/orchestrators"
REGISTRY="$ORCH_DIR/registry.json"
SKILLS_DIR="$HOME/.claude/skills"
SETTINGS="$HOME/.claude/settings.json"

if [ ! -f "$REGISTRY" ]; then
  echo "❌ Registry não encontrado: $REGISTRY"
  exit 1
fi

# Extrair lista de orquestradores do registry (agora com cor e agent)
mapfile -t NAMES < <(jq -r '.orchestrators[] | "\(.name)|\(.id)|\(.description)|\(.color // "blue")|\(.agent // .id)"' "$REGISTRY")

if [ ${#NAMES[@]} -eq 0 ]; then
  echo "❌ Nenhum orquestrador encontrado no registry."
  exit 1
fi

# --- Modo 0: casos especiais (NÃO tocam settings/registry) ---
if [ "${1:-}" = "all" ]; then
  ORQ_DIR="$HOME/.claude/skills/orq"
  if [ -f "$ORQ_DIR/docs/merge.md" ]; then
    cat "$ORQ_DIR/docs/merge.md"
  else
    echo "❌ docs/merge.md não encontrado em $ORQ_DIR/docs/merge.md"
    exit 1
  fi
  if [ -f "$ORQ_DIR/merge-mode.md" ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  companion do coordenador: skills/orq/merge-mode.md"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  fi
  echo ""
  echo "ℹ️  /orq all NÃO mudou o active agent nem o settings.json."
  exit 0
fi

if [ "${1:-}" = "council" ]; then
  QUESTION="${*:2}"
  node "$HOME/.claude/vertexion-agent-system/scripts/orq-council.mjs" "$QUESTION"
  exit 0
fi

if [ "${1:-}" = "--focus" ]; then
  FOCUS_ID="${2:-}"
  FOCUS_LEVEL="${3:-}"
  if [ -z "$FOCUS_ID" ]; then
    echo "❌ Uso: orq.sh --focus <id> [nivel]"
    exit 1
  fi
  FOUND=""
  for entry in "${NAMES[@]}"; do
    id=$(echo "$entry" | cut -d"|" -f2)
    if [ "$id" = "$FOCUS_ID" ]; then FOUND=1; break; fi
  done
  if [ -z "${FOUND:-}" ]; then
    echo "❌ Orquestrador não encontrado: '$FOCUS_ID'"
    exit 1
  fi
  if [ -n "$FOCUS_LEVEL" ]; then
    case "$FOCUS_LEVEL" in
      baixo|médio|alto|máximo) ;;
      *) echo "❌ Nível inválido: '$FOCUS_LEVEL' (use baixo|médio|alto|máximo)"; exit 1 ;;
    esac
  fi
  if [ -f "$SKILLS_DIR/$FOCUS_ID/SKILL.md" ]; then
    echo "📄 Skill de $FOCUS_ID (--focus, nada foi gravado)..."
    echo ""
    awk 'BEGIN{count=0} /^---$/{count++;next} count>=2' "$SKILLS_DIR/$FOCUS_ID/SKILL.md" | head -80
    exit 0
  else
    echo "❌ SKILL.md não encontrado para '$FOCUS_ID'."
    exit 1
  fi
fi

# --- Modo 1: argumento direto (non-interactive) ---
if [ $# -ge 1 ]; then
  TARGET_ID="$1"
  TARGET_LEVEL="${2:-}"
  FOUND=""
  FOUND_NAME=""
  FOUND_AGENT=""
  FOUND_COLOR=""
  for entry in "${NAMES[@]}"; do
    id=$(echo "$entry" | cut -d"|" -f2)
    if [ "$id" = "$TARGET_ID" ]; then
      FOUND="$entry"
      FOUND_NAME=$(echo "$entry" | cut -d"|" -f1)
      FOUND_COLOR=$(echo "$entry" | cut -d"|" -f4)
      FOUND_AGENT=$(echo "$entry" | cut -d"|" -f5)
      break
    fi
  done

  if [ -z "$FOUND" ]; then
    echo "❌ Orquestrador não encontrado: '$TARGET_ID'"
    echo ""
    echo "Disponíveis:"
    for entry in "${NAMES[@]}"; do
      name=$(echo "$entry" | cut -d"|" -f1)
      id=$(echo "$entry" | cut -d"|" -f2)
      desc=$(echo "$entry" | cut -d"|" -f3)
      echo "  $id  — $name  ($desc)"
    done
    exit 1
  fi

  if [ -n "$TARGET_LEVEL" ]; then
    case "$TARGET_LEVEL" in
      baixo|médio|alto|máximo) ;;
      *) echo "❌ Nível inválido: '$TARGET_LEVEL' (use baixo|médio|alto|máximo)"; exit 1 ;;
    esac
  fi

  ORCH_ID="$TARGET_ID"
  ORCH_NAME="$FOUND_NAME"
  ORCH_AGENT="$FOUND_AGENT"
else
  # --- Modo 2: interativo (fzf) se TTY, senão lista opções ---
  if [ -t 0 ] && command -v fzf &>/dev/null; then
    CURRENT=$(jq -r '.active // ""' "$REGISTRY")

    # Preview com cor ANSI
    PREVIEW_CMD='entry={};
      name=$(echo "{}" | cut -d"|" -f1);
      id=$(echo "{}" | cut -d"|" -f2);
      desc=$(echo "{}" | cut -d"|" -f3);
      color=$(echo "{}" | cut -d"|" -f4);
      agent=$(echo "{}" | cut -d"|" -f5);
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";
      echo "  Orquestrador: $name";
      echo "  ID: $id";
      echo "  Cor: $color";
      echo "  Agente: $agent";
      echo "  Descrição: $desc";
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";
      if [ -f "'"$SKILLS_DIR"'/$id/SKILL.md" ]; then
        echo "";
        head -30 "'"$SKILLS_DIR"'/$id/SKILL.md" | grep -v "^---" | head -20;
      fi'

    SELECTED=$(printf "%s\n" "${NAMES[@]}" | fzf \
      --delimiter="|" \
      --with-nth=1 \
      --preview="$PREVIEW_CMD" \
      --preview-window=right:60% \
      --header="╔══════════════════════════════════╗
║  🎯 Selecione um Orquestrador     ║
║  ↑↓ navegar  Enter confirmar     ║
╚══════════════════════════════════╝" \
      --prompt="🎯 Orquestrador > " \
      --height=70% \
      --border=double \
      --color=header:italic:cyan,pointer:green,border:cyan)

    if [ -z "$SELECTED" ]; then
      echo "❌ Nenhum orquestrador selecionado."
      exit 0
    fi

    ORCH_ID=$(echo "$SELECTED" | cut -d"|" -f2)
    ORCH_NAME=$(echo "$SELECTED" | cut -d"|" -f1)
    ORCH_AGENT=$(echo "$SELECTED" | cut -d"|" -f5)
  else
    echo "🎯 Orquestradores disponíveis:"
    echo ""
    for entry in "${NAMES[@]}"; do
      name=$(echo "$entry" | cut -d"|" -f1)
      id=$(echo "$entry" | cut -d"|" -f2)
      desc=$(echo "$entry" | cut -d"|" -f3)
      echo "  $id  — $name"
      echo "            $desc"
      echo ""
    done
    echo "💡 Para ativar: /orq <id>  (ex: /orq tesla)"
    echo "💡 Ou no terminal: bash orq.sh  (menu interativo com ↑↓ setas)"
    exit 0
  fi
fi

# Backup settings.json e registry.json antes de modificar
if [ -f "$SETTINGS" ]; then
  cp "$SETTINGS" "$SETTINGS.bak.$(date +%s)"
fi
if [ -f "$REGISTRY" ]; then
  cp "$REGISTRY" "$REGISTRY.bak.$(date +%s)"
fi

# Atualizar active (e level, se informado) no registry
if [ -n "${TARGET_LEVEL:-}" ]; then
  jq --arg id "$ORCH_ID" --arg lvl "$TARGET_LEVEL" \
    '(.orchestrators[] | select(.id == $id) | .level) = $lvl | .active = $id' \
    "$REGISTRY" > "$REGISTRY.tmp" && mv "$REGISTRY.tmp" "$REGISTRY"
else
  jq --arg id "$ORCH_ID" '.active = $id' "$REGISTRY" > "$REGISTRY.tmp" && mv "$REGISTRY.tmp" "$REGISTRY"
fi

# Atualizar agent no settings.json (para refletir nome/cor na próxima sessão)
if [ -n "${ORCH_AGENT:-}" ]; then
  # Usa jq para atualizar o campo agent no settings.json
  jq --arg agent "$ORCH_AGENT" '.agent = $agent' "$SETTINGS" > "$SETTINGS.tmp" 2>/dev/null && mv "$SETTINGS.tmp" "$SETTINGS"
fi

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║  ✅ Orquestrador ativado: $ORCH_NAME"
echo "║  📌 Agente: ${ORCH_AGENT:-$ORCH_ID}"
if [ -n "${TARGET_LEVEL:-}" ]; then
  echo "║  🎚️  Nível: $TARGET_LEVEL"
fi
echo "║  💡 Efeito visível na PRÓXIMA sessão"
echo "╚══════════════════════════════════════════════╝"
echo ""

# Mostrar instruções do orquestrador selecionado
if [ -f "$SKILLS_DIR/$ORCH_ID/SKILL.md" ]; then
  echo "📄 Carregando instruções do orquestrador..."
  echo ""
  awk 'BEGIN{count=0} /^---$/{count++;next} count>=2' "$SKILLS_DIR/$ORCH_ID/SKILL.md" | head -80
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  📌 Orquestrador ativo: $ORCH_NAME"
  echo "  💡 Digite /orq a qualquer momento para trocar"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
fi
