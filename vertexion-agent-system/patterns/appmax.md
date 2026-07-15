# AppMax Patterns (Vertexion Ecosystem)

## Configuração
- Single source of truth em `appmax/config.ts`
- Amounts em centavos internamente, formatado no display
- Plan limits em `PLAN_LIMITS` constant

## Checkout
- Preço determinado no backend, NUNCA confiar no frontend
- `createServerFn` com `.middleware([requireSupabaseAuth])`
- Validação de ownership antes de criar checkout

## Webhooks
- Idempotência: mesmo event id processado mais de uma vez = resultado igual
- Verificação de assinatura HMAC no webhook
- Log sem expor dados financeiros completos (últimos 4 dígitos OK)

## Planos
- 3 tiers: Good (Esquina) / Better (Movimento) / Best (Escala)
- Plano recomendado (Better) destacado visualmente
- Upgrade/downgrade com rateio proporcional

## Segurança
- PCI SAQ A (cartão tokenizado, redirect)
- NUNCA armazenar número completo de cartão
- Dados de pagamento só no backend
