# Vertexion Agent System 5.0

## Visão geral
Sistema de 39 agentes organizados em 4 equipes: Vertexion Control (6), Engineering Assurance (17), Growth Engine (5), Product Intelligence (11). O `control-vertexion-director` é o agente principal que roteia tarefas por linguagem natural.

## Equipes
- **Vertexion Control:** portfólio, prioridades, aprovações, auditoria, evolução, evidence ledger
- **Engineering Assurance:** código, segurança, Supabase, pagamentos, QA, deploy, preview
- **Growth Engine:** leads, qualificação, marketing, abordagem, follow-up, métricas
- **Product Intelligence:** validação, hipóteses, concorrência, preço, experimentos, riscos

## Skills visíveis
6 skills on-demand em `~/.claude/skills/`: constitution, evidence-ledger, gcot-tot, security-checklist, backup-first, cognition-rules. A disciplina operacional base está em `~/.claude/CORE-DISCIPLINE.md` (sempre carregada).

## Regras fundamentais
- Evidência antes de conclusão (arquivo:linha, output, URL)
- Cirurgia, não amputação — menor alteração que resolve
- Aprovação explícita antes de ação externa
- Backup first antes de ação destrutiva

## Test commands
N/A — sistema de agentes, não biblioteca de código.
