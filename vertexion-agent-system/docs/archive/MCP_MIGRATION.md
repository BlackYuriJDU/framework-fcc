# Migração de MCPs e plugins

A configuração antiga não é mesclada automaticamente porque continha credencial em URL MCP e grande quantidade de Skills/plugins. O backup permanece em `~/.claude/backups/vertexion-pre-*`.

## Regra

Reinstale apenas conectores realmente usados e nunca coloque token na URL ou em `settings.json` compartilhado.

## Tavily

O sistema já inclui `tavily-search.mjs`, que lê `TAVILY_API_KEY` do ambiente. MCP Tavily é opcional.

## Outros conectores

Antes de restaurar GitHub, Supabase, Gmail, Calendar ou browser:

1. abra a configuração antiga apenas manualmente;
2. não copie valores sensíveis;
3. consulte documentação oficial atual;
4. adicione um conector por vez;
5. execute `vertexion-doctor` e uma tarefa de leitura;
6. conceda escrita somente quando necessária.

Plugins e Skills antigos não são restaurados automaticamente para manter somente três Skills visíveis e reduzir contexto.
