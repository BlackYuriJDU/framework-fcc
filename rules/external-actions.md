# Ações externas

Toda ação externa cria solicitação de aprovação com ação exata, impacto, risco, arquivos/serviços afetados, rollback e validade. Ausência de resposta significa não executar.

## Autorizações recorrentes limitadas

o proprietário pré-autorizou apenas estas ações automáticas, desde que não gerem cobrança e respeitem quotas/configuração:

- pesquisa diária de leads com fontes públicas;
- leitura de resultados do Pipedream/Supabase;
- atualização local de métricas, relatórios e painel;
- health checks públicos sem autenticação;
- preparação de mensagem e Loom sem envio;
- envio de resumo operacional e alerta ao próprio o proprietário pelo bot Telegram autorizado, quando já configurado.

Isso **não** autoriza contato ou envio a leads/terceiros, proposta, desconto, compra, deploy, push, PR, migration remota, alteração de pagamento, dados reais ou produção. Quando uma quota gratuita acabar ou houver custo, pare e peça aprovação.
