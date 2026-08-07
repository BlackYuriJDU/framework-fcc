# Vertexion Agent System v7

## Visão geral
Meta-sistema de agentes com **6 leads (equipes) + 8 agentes de controle + 3 orquestradores**. O `control-vertexion-director` é o orquestrador principal que roteia tarefas por linguagem natural para os leads. Portfólio: **ZapMenu** e **Firmis** apenas.

## Leads (equipes) — `~/.claude/agents/`

| Lead | Equipe | Escopo |
|------|--------|--------|
| `dev-lead` | DEV | Código, arquitetura, segurança, deploy, QA, Supabase, pagamentos |
| `design-lead` | Design | UI/UX, design system, branding, acessibilidade, protótipos |
| `marketing-lead` | Marketing | Prospecção, conteúdo, campanhas, growth, funil |
| `financas-lead` | Finanças | Pricing, custos, receita, modelo financeiro, evidência |
| `juridico-lead` | Jurídico | Compliance, contratos, LGPD, riscos legais |
| `operacoes-lead` | Operações | Portfólio, prioridades, aprovações, auditoria, evolução |

## Agentes de controle — `agents/control/`

- `control-portfolio-analyst` — prioridades ZapMenu e Firmis
- `control-auditor` — fiscal independente de conclusões antes de ações externas
- `control-approval-preparer` — prepara pedidos de aprovação (ação, impacto, risco, rollback, validade)
- `control-evidence-ledger` — auditor independente de evidência
- `control-agent-evolution-advisor` — melhorias baseadas em padrões de erro

## Orquestradores (switch via `/orq`)

| Orquestrador | Foco | Cor |
|--------------|------|-----|
| `control-vertexion-director` | Diretor do ecossistema — roteia para os 6 leads | 🔵 azul |
| `zapmenu-activity` | Prospecção e growth ZapMenu | 🟡 amarelo |
| `da-vinci` | Design front-end (UI/UX, animações, design systems) | 🔴 vermelho |

## Skills principais
`vertexion-director`, `orq`, `zapmenu`, `zapmenu-activity`, `da-vinci`, `design-lead` (+ plugins instalados).

## Keywords de protocolo (tags no texto — NÃO são skills)
- `ultraask` — perguntas exaustivas antes de agir (`rules/ask-mode.md`)
- `ultrathink2` — raciocínio profundo avançado (`rules/ultrathink2.md`)

## Regras fundamentais
- Evidência antes de conclusão (arquivo:linha, output, URL)
- Cirurgia, não amputação — menor alteração que resolve
- Aprovação explícita antes de ação externa (deploy, envio, PR, migration, gasto)
- Backup first antes de ação destrutiva
- Nunca ler/exibir/registrar valores de credenciais — referenciar `~/.claude/.env` por nome de variável
- Credenciais de API centralizadas em `~/.claude/.env` (chmod 600)

## Histórico
- **v5** → 3 leads (engineering/growth/product) + 33 agentes em dirs; arquivado em `archive/agents-v5/`
- **v6** → 6 leads stub; agentes de equipe não existiam como arquivos
- **v7 (atual)** → 6 leads enriquecidos, 3 orquestradores reescritos, `.env` centralizado. Contexto completo em `docs/versoes.md`

## Test commands
N/A — sistema de agentes, não biblioteca de código.
