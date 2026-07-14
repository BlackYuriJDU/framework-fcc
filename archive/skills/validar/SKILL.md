---
name: validar
description: Valida completamente uma funcionalidade ou release antes de qualquer preview.
disable-model-invocation: true
argument-hint: "[fluxo ou release]"
allowed-tools: Read, Grep, Glob, Bash, Agent
model: opus
effort: high
---
Valide $ARGUMENTS.

1. Execute o fluxo de `/revisar` sem assumir que relatório antigo continua válido.
2. Rode typecheck, lint, testes e build conforme scripts reais do projeto; não invente comando.
3. Verifique o programa em execução e o fluxo principal quando possível.
4. Crie teste de regressão para bug confirmado quando tecnicamente adequado.
5. Verifique documentação e compliance condicionais.
6. Faça `engineering-release-judge` decidir de forma independente.
7. Registre fingerprint do estado aprovado e relatório final.
8. Não faça deploy. Pergunte se Arthur deseja criar preview.
