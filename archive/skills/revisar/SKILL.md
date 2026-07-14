---
name: revisar
description: Revisa alterações atuais com escopo, código, segurança e especialistas condicionais, sem deploy.
disable-model-invocation: true
argument-hint: "[escopo opcional]"
allowed-tools: Read, Grep, Glob, Bash, Agent
model: opus
effort: high
---
Revise o diff atual e considere $ARGUMENTS.

1. Detecte projeto, Git, branch-base, arquivos modificados e requisitos.
2. Rode em paralelo `engineering-scope-guardian`, `engineering-code-reviewer`, `engineering-security-auditor` e `engineering-requirements-checker`.
3. Acione somente quando aplicável: Supabase, pagamentos, migration, dependências, instruções externas, UI, documentação ou compliance.
4. Deduplicate achados e reavalie CRITICAL/HIGH com evidência.
5. Corrija automaticamente apenas CRITICAL confirmado. Demais mudanças exigem pedido explícito.
6. Execute testes relacionados já existentes.
7. Salve relatório. Não faça deploy, push, PR, commit, instalação ou migration remota.
