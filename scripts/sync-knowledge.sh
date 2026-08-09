#!/usr/bin/env bash
# sync-knowledge.sh — sincroniza repositórios curados de conhecimento (shallow --depth 1)
#
# Uso:
#   sync-knowledge.sh --check [orq]   # dry-run R$0: lista o que seria clonado (default)
#   sync-knowledge.sh [orq]           # clone real: lista plano e pede confirmação explícita
#
# orq = tesla | einstein | da-vinci | all (default: all)
# Ação externa: clone real requer aprovação explícita. Sem confirmação, não clona nada.
# Idempotente: não reclona se o dir de destino já existir e tiver conteúdo.

set -euo pipefail

ROOT="$HOME/.claude/vertexion-agent-system"
KNOW="$ROOT/knowledge"

# --- Parse de args ---
CHECK=""
ORQ="all"
while [ $# -gt 0 ]; do
  case "$1" in
    --check) CHECK=1; shift ;;
    tesla|einstein|da-vinci|all) ORQ="$1"; shift ;;
    *) echo "❌ Argumento desconhecido: '$1'"; echo "Uso: sync-knowledge.sh [--check] [tesla|einstein|da-vinci|all]"; exit 1 ;;
  esac
done

# --- Coleta de repos do(s) manifest(s) ---
MANIFESTS=()
if [ "$ORQ" = "all" ]; then
  for o in tesla einstein da-vinci; do MANIFESTS+=("$KNOW/$o/manifest.json"); done
else
  MANIFESTS+=("$KNOW/$ORQ/manifest.json")
fi

declare -a URLS DIRS NOTES
for m in "${MANIFESTS[@]}"; do
  if [ ! -f "$m" ]; then
    echo "❌ manifest não encontrado: $m"
    exit 1
  fi
  while IFS=$'\t' read -r url dir note; do
    URLS+=("$url"); DIRS+=("$dir"); NOTES+=("$note")
  done < <(jq -r '.repos[] | [.url, .dir, (.note // "")] | @tsv' "$m")
done

if [ ${#URLS[@]} -eq 0 ]; then
  echo "ℹ️  Nenhum repo no manifest de '$ORQ'."
  exit 0
fi

# --- Helper: resolve o diretório de destino de um repo ---
resolve_target() {
  local dir="$1"
  if [ "$ORQ" = "all" ]; then
    local o
    for o in tesla einstein da-vinci; do
      if jq -e --arg d "$dir" '.repos[] | select(.dir==$d)' "$KNOW/$o/manifest.json" >/dev/null 2>&1; then
        echo "$KNOW/$o/$dir"
        return 0
      fi
    done
  else
    echo "$KNOW/$ORQ/$dir"
  fi
}

# --- Plano (dry-run ou pré-visualização) ---
echo "📦 Plano de sincronização — orq: $ORQ"
echo "   (clones shallow --depth 1, idempotentes)"
echo ""
NEED=0
for i in "${!URLS[@]}"; do
  target="$(resolve_target "${DIRS[$i]}")"
  if [ -d "$target" ] && [ -n "$(ls -A "$target" 2>/dev/null)" ]; then
    echo "  ✅ já presente  ${DIRS[$i]}  → $target"
  else
    echo "  ⬇️  clonar       ${DIRS[$i]}  → $target"
    echo "        ${URLS[$i]}   ${NOTES[$i]}"
    NEED=$((NEED+1))
  fi
done

echo ""
echo "  Resumo: $NEED repo(s) a clonar, $((${#URLS[@]}-NEED)) já presente(s)."

# --- Modo --check: dry-run, sai aqui (R$0) ---
if [ -n "$CHECK" ]; then
  echo "  (dry-run R\$0 — nada foi clonado. Clone real = ação externa, requer aprovação de Arthur.)"
  exit 0
fi

# --- Clone real: exige confirmação explícita ---
if [ "$NEED" -eq 0 ]; then
  echo "✅ Tudo em dia. Nada a fazer."
  exit 0
fi

echo ""
echo "⚠️  Clone real = ação externa. Requer aprovação explícita de Arthur."
if [ -t 0 ]; then
  read -r -p "Clonar $NEED repo(s)? [y/N] " ans
else
  ans=""
  echo "ℹ️  Sem TTY: abortado. Rode com '--check' para dry-run ou rode em terminal interativo."
  exit 0
fi

case "$ans" in
  y|Y|yes|YES)
    for i in "${!URLS[@]}"; do
      target="$(resolve_target "${DIRS[$i]}")"
      if [ -d "$target" ] && [ -n "$(ls -A "$target" 2>/dev/null)" ]; then
        echo "  ✅ skip (já existe) ${DIRS[$i]}"
        continue
      fi
      echo "  ⬇️  clonando ${URLS[$i]} → $target"
      mkdir -p "$(dirname "$target")"
      git clone --depth 1 --quiet "${URLS[$i]}" "$target" || {
        echo "  ❌ falha ao clonar ${URLS[$i]}"
        continue
      }
    done
    echo ""
    echo "✅ Sincronização concluída."
    ;;
  *)
    echo "❌ Não aprovado. Nada foi clonado."
    exit 0
    ;;
esac
