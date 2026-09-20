# Vertexion Agent System v7.1

## Visão geral
Meta-sistema de agentes com **6 leads (equipes) + control agents + 3 orquestradores de domínio** (Tesla, Einstein, Da Vinci). O portfólio de projetos é definido por você em `portfolio/projects.json`. **Nenhum agente sem orq responsável** — matriz de propriedade em `SYSTEM.md` §4.

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

- `control-tesla` — orquestrador Tesla (engenharia + auto-melhoria; SEMPRE ultrathink2)
- `control-einstein` — orquestrador Einstein (growth + jurídico + marketing)
- `da-vinci` — orquestrador Da Vinci (design front-end)
- `loop-verifier` — verificador independente do `/autoloop` (dono: Tesla)
- `control-portfolio-analyst` — prioridades dos seus projetos (le portfolio/projects.json)
- `control-auditor` — fiscal independente de conclusões antes de ações externas
- `control-approval-preparer` — prepara pedidos de aprovação (ação, impacto, risco, rollback, validade)
- `control-evidence-ledger` — auditor independente de evidência
- `control-agent-evolution-advisor` — melhorias baseadas em padrões de erro

## Orquestradores (switch via `/orq`)

| Orquestrador | Foco | Cor | Agent |
|--------------|------|-----|-------|
| `tesla` | Engenharia de código + auto-melhoria | 🔵 azul | `control-tesla` |
| `einstein` | Growth, jurídico, marketing | 🟡 amarelo | `control-einstein` |
| `da-vinci` | Design front-end (UI/UX, animações, design systems) | 🔴 vermelho | `da-vinci` |
| `all` | Modo merge — coordena os 3 num job único | — | chat principal |

Níveis de uso (`baixo|médio|alto|máximo`, default `médio`): semântica em `docs/levels.md`. Ativação mid-chat por nome (Tesla/Einstein/Da Vinci no texto) + invocação direta `/tesla`, `/einstein`, `/da-vinci`, `/autoloop`.

## Skills principais
`tesla`, `einstein`, `da-vinci`, `autoloop`, `orq`, `design-lead`, `find-skills` (+ plugins instalados).

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
- **v5** → 3 leads + 33 agentes em dirs (consolidado)
- **v6** → 6 leads stub
- **v7** → 6 leads enriquecidos, 3 orquestradores reescritos, .env centralizado, multi-modelo, keywords ultrathink2/ultraask
- **v7.1** → 3 orquestradores de domínio (Tesla/Einstein/Da Vinci); /autoloop; modo merge; níveis de uso
- **v8** → runtime dirigido por contrato (Task Contract, ciclo INTAKE-CONTRACT-CONTEXT-PLAN-EXECUTE-VERIFY-EVALUATE-FINALIZE, control-evaluator, autoloop v2, registry v4, FCC Score)

## Test commands
N/A — sistema de agentes, não biblioteca de código.
