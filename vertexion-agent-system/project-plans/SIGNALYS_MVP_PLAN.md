# Signalys — MVP internacional de invoice follow-up

## Base identificada

Autenticação, dashboard, invoices, workspaces, equipe, convites, políticas, exclusão de conta, auditoria, migrations e integração Vertexion. O nome oficial atual é **Signalys**.

## Primeiro resultado de valor

O usuário registra/importa uma invoice vencida, define contexto e o Signalys prepara ou envia um follow-up adequado, registra o histórico e mostra o próximo passo.

## Escopo a confirmar por auditoria

- cadastro manual/importação;
- aging e status;
- template e sequência de follow-up;
- envio real de e-mail;
- promise-to-pay;
- disputes;
- owner/responsável;
- histórico e próxima ação;
- rate limiting;
- integrações com Stripe, QuickBooks ou Xero;
- mocks ainda presentes.

## ICP inicial a pesquisar

Agências, consultores, freelancers, contractors e pequenos negócios de serviço nos EUA, Canadá e Reino Unido. A equipe deve escolher um primeiro nicho, não todos ao mesmo tempo.

## Gate técnico

- migrations e RLS;
- proteção de workspaces;
- envio seguro e reputação de e-mail;
- consentimento e unsubscribe quando aplicável;
- logs e auditoria;
- limites por plano;
- fila/retry;
- proteção contra envio duplicado;
- i18n en-US/en-GB;
- políticas de privacidade adequadas ao mercado.

## Critério MVP

- fluxo real completo, sem resposta simulada;
- pelo menos uma forma de entrada de invoice;
- follow-up verificável;
- estados promise/dispute;
- histórico e próximos passos;
- testes de autorização e envio duplicado;
- piloto com usuários do ICP selecionado.
