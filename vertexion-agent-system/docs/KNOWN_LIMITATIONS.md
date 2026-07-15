# Limitações conhecidas

1. O dashboard usa o CLI em modo não interativo. Ações que exigem uma pergunta de permissão interativa podem falhar e devem ser concluídas numa sessão normal do Claude Code.
2. A central de aprovações registra decisões; ela não substitui ainda o callback oficial de permissões via MCP/Agent SDK.
3. O FCC pode mapear `opus` para outro modelo. O sistema não consegue garantir o provedor real sem dados do FCC.
4. A pesquisa web nativa pode não existir em alguns provedores FCC; Tavily ou outro conector deve ser configurado por ambiente.
5. Rotinas locais dependem de notebook ligado, WSL funcional e Claude/FCC autenticado.
6. O instalador PowerShell foi validado estruturalmente, mas deve ser executado no Windows real para confirmar política do Task Scheduler e distribuição WSL.
7. Caminhos dos projetos são descobertos por nome e `package.json`; confirme no dashboard antes de editar.
