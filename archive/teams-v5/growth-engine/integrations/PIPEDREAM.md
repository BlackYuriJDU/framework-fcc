# Pipedream

Pipedream pode continuar executando descoberta externa, mas não é fonte de verdade única.

Fluxo recomendado:

1. Tavily coleta resultados dentro da quota.
2. Groq/LLM estrutura e qualifica em lotes pequenos.
3. O resultado passa por normalização e deduplicação do Growth Engine.
4. Supabase guarda dados pessoais e o estado comercial.
5. Telegram recebe apenas resumo útil.
6. O Control Center seleciona o melhor lead e prepara copy; nunca envia automaticamente.

Não coloque chaves no código do step. Use Secrets/Environment Variables do Pipedream. O payload deve incluir fonte e timestamp; dado sem fonte é rejeitado ou marcado como não verificado.
