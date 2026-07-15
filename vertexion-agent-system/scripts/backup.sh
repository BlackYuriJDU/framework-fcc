#!/usr/bin/env bash
# backup.sh — Cria backup de arquivo antes de ação destrutiva
# Uso: ./backup.sh <arquivo>
# Cria: ~/.claude/backups/YYYYMMDD_HHMMSS_<arquivo>.bak

set -euo pipefail

FILE="$1"
if [ ! -f "$FILE" ]; then
  echo "ERRO: Arquivo '$FILE' não encontrado"
  exit 1
fi

BACKUP_DIR="$HOME/.claude/backups/$(date +%Y%m%d)"
mkdir -p "$BACKUP_DIR"

BASENAME=$(basename "$FILE")
TIMESTAMP=$(date +%H%M%S)
BACKUP_PATH="$BACKUP_DIR/${TIMESTAMP}_${BASENAME}.bak"

cp "$FILE" "$BACKUP_PATH"
echo "BACKUP: $FILE → $BACKUP_PATH"
