# Growth Engine

Baseado apenas no Scout moderno do antigo `zapmenu-agents`. Os diretórios legados `agents/` e `mcp/` foram removidos por sobreposição.

## Migração

1. Copie apenas dados válidos para um banco privado.
2. Não copie `.env`, logs ou arquivos de leads para Git.
3. Rode `npm install` somente após aprovação.
4. Teste com `npm test` e `npm run scout:test`.
5. Rode dry-run antes de ativar APIs.
6. Configure Supabase e Telegram somente depois da rotação de credenciais.
