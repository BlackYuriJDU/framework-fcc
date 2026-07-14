# ZapMenu — lançamento seguro

## Objetivo

Publicar o produto já pronto, obter três clientes independentes pagantes e manter pelo menos dois após o primeiro ciclo. Pedidos são futuros e não bloqueiam o lançamento.

## Gate 0 — segurança

- Rotacionar credenciais expostas nos pacotes antigos.
- Confirmar `.env*` ignorados e histórico Git verificado.
- Identificar banco, domínio e projeto Lovable de produção.
- Proibir testes destrutivos até essa identificação.

## Gate 1 — produto e planos

Confirmar código, banco e copy para:

- Esquina: 1 unidade, 35 produtos, banner básico, sem analytics/equipe, integrações parciais.
- Movimento: 1 unidade, 50 produtos, analytics, equipe, integrações e banners.
- Escala: 3+ unidades, 80 produtos ainda ambíguos, analytics/equipe/integrações avançadas.

Bloqueadores comerciais:

- 80 produtos do Escala: por unidade ou total?
- limite máximo de unidades;
- recursos “em breve”;
- integração Vertexion realmente ativa;
- descontos trimestral/anual consistentes.

## Gate 2 — onboarding e fluxo principal

Testar:

1. landing;
2. cadastro/login;
3. nome, logo e categoria;
4. produtos opcionais;
5. descrição e horários;
6. criação e edição posterior;
7. menu público;
8. QR code;
9. comportamento mobile;
10. loading, erro e retomada após interrupção.

## Gate 3 — AppMax e assinatura

Auditar:

- autenticação/assinatura do webhook;
- idempotência;
- eventos duplicados e fora de ordem;
- authorized/approved, boleto, expired, chargeback, cancelamento e falha;
- vínculo entre pagamento, usuário, restaurante e plano;
- preço calculado no backend;
- trials e ciclos;
- bloqueio por inadimplência;
- recuperação após falha parcial;
- logs sem dados sensíveis.

Criar testes de regressão para estados críticos. O bloqueio por inadimplência permanece “não validado” até teste real ou simulado confiável.

## Gate 4 — release

- typecheck/lint/test/build conforme scripts reais;
- validação em execução;
- documentação e política comercial alinhadas;
- preview separado de produção;
- checklist de rollback;
- aprovação de Arthur.

## Pós-lançamento

- rotina de uptime e checkout;
- acompanhamento dos primeiros clientes;
- registro de onboarding e objeções;
- não construir pedidos antes de evidência suficiente;
- validar retenção após o primeiro ciclo.
