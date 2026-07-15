---
name: preview
description: Cria preview manual somente após validação aprovada e estado do código intacto.
disable-model-invocation: true
argument-hint: "[projeto]"
allowed-tools: Read, Grep, Glob, Bash, Agent
model: opus
effort: high
---
Prepare preview de $ARGUMENTS.

1. Confirme `/validar` aprovado, fingerprint e ausência de mudança posterior.
2. Reexecute verificações essenciais se o relatório estiver desatualizado.
3. Acione `control-auditor` e `engineering-preview-deployer`.
4. Mostre comando, provedor, ambiente, custo, dados usados, rollback e riscos.
5. Peça aprovação explícita imediatamente antes do deploy.
6. Nunca use produção, `--prod`, dados reais ou migration remota.
7. Retorne URL, validade, status de verificação e como remover o preview.
