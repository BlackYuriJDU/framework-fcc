#!/bin/bash
# resolve-claude.sh — encontra o binário Claude (fcc-claude || claude)
# Uso: CLAUDE_CMD=$(bash "$(dirname "$0")/lib/resolve-claude.sh")
# Retorna caminho absoluto do binário ou string vazia se não encontrado.

# 1. Priority: explicit env var (set by user or vertexion-doctor)
if [ -n "$VERTEXION_CLAUDE_COMMAND" ]; then
  if command -v "$VERTEXION_CLAUDE_COMMAND" &>/dev/null; then
    command -v "$VERTEXION_CLAUDE_COMMAND"
    exit 0
  fi
fi

# 2. fcc-claude (FCC proxy)
if command -v fcc-claude &>/dev/null; then
  command -v fcc-claude
  exit 0
fi

# 3. claude (bare Claude Code)
if command -v claude &>/dev/null; then
  command -v claude
  exit 0
fi

# 4. Common install paths as fallback
for path in /home/arthur/.local/bin/claude /usr/local/bin/claude /usr/bin/claude; do
  if [ -x "$path" ]; then
    echo "$path"
    exit 0
  fi
done

# 5. Not found
exit 1
