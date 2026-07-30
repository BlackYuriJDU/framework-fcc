# Limitações conhecidas

1. O dashboard usa o CLI em modo não interativo. Ações que exigem uma pergunta de permissão interativa podem falhar e devem ser concluídas numa sessão normal do Claude Code.
2. A central de aprovações registra decisões; ela não substitui ainda o callback oficial de permissões via MCP/Agent SDK.
3. **Proxy FCC/DeepSeek — Risco aceito.** O sistema roteia o alias `opus` via FCC (Fallback Communication Channel) para DeepSeek v4 flash. A Anthropic detecta e bloqueia contas que usam proxies para provedores chineses desde jan/2026 (confirmado publicamente). Arthur Araújo aceitou este risco em 2026-07-30. Se a conta for suspensa, todo o sistema para — incluindo ZapMenu (produção). **Plano de contingência:** definir `VERTEXION_CLAUDE_COMMAND` para um binário alternativo compatível (ex.: Anthropic API direta).
4. A pesquisa web nativa pode não existir em alguns provedores FCC; Tavily ou outro conector deve ser configurado por ambiente.
5. Rotinas locais dependem de notebook ligado, WSL funcional e Claude/FCC autenticado.
6. O instalador PowerShell foi validado estruturalmente, mas deve ser executado no Windows real para confirmar política do Task Scheduler e distribuição WSL.
7. Caminhos dos projetos são descobertos por nome e `package.json`; confirme no dashboard antes de editar.
