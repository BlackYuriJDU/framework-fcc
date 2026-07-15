#!/usr/bin/env bash
set -euo pipefail
CLAUDE_HOME="$HOME/.claude"
BACKUPS_ROOT="$CLAUDE_HOME/backups"
TARGET="${1:-latest}"
if [[ "$TARGET" == "latest" ]]; then
  mapfile -t dirs < <(find "$BACKUPS_ROOT" -maxdepth 1 -mindepth 1 -type d | sort)
  [[ ${#dirs[@]} -gt 0 ]] || { echo "Nenhum backup encontrado." >&2; exit 1; }
  TARGET_DIR="${dirs[-1]}"
else
  TARGET_DIR="$TARGET"
  [[ -d "$TARGET_DIR" ]] || TARGET_DIR="$BACKUPS_ROOT/$TARGET"
fi
[[ -d "$TARGET_DIR" ]] || { echo "Backup não encontrado: $TARGET" >&2; exit 1; }
for item in CLAUDE.md settings.json agents skills rules commands vertexion-agent-system; do
  rm -rf "$CLAUDE_HOME/$item"
  [[ -e "$TARGET_DIR/$item" ]] && cp -a "$TARGET_DIR/$item" "$CLAUDE_HOME/"
done
echo "Backup restaurado: $TARGET_DIR"
