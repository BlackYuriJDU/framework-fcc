# FCC v8 Policy Model

Permissões críticas são propriedades do harness, não apenas texto de prompt. Deploy, produção, push, PR, migration remota, envio a terceiros, gasto, preço/checkout/pagamento e dados reais exigem approval gate.

Orquestradores declararam capacidade no registry; o runner deve negar ações externas quando `allowedExternalActions=false`.
