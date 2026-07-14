# Checklist de rotação de credenciais

Os pacotes antigos continham credenciais reais. Antes de ativar integrações:

- [ ] Rotacionar Tavily.
- [ ] Rotacionar Groq.
- [ ] Rotacionar Supabase Service Role do ZapMenu.
- [ ] Rotacionar AppMax Token.
- [ ] Rotacionar AppMax Webhook Secret.
- [ ] Rotacionar Vertexion OIDC Client Secret.
- [ ] Rotacionar ZAPMENU_PROJECT_SECRET.
- [ ] Revogar tokens encontrados em `settings.local.json` antigo.
- [ ] Verificar histórico Git com gitleaks.
- [ ] Confirmar que `.env*` está ignorado.
- [ ] Confirmar que nenhum backup contém chaves válidas.

Nunca cole novas credenciais em prompts, agentes, READMEs ou configurações versionadas.
