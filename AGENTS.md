# Vertexion Agent System v8.0 — Contract-Driven Agent Operating System

## Visão geral
Meta-sistema de agentes com **6 leads (equipes) + 10 agentes de controle + 3 orquestradores de domínio** (Tesla, Einstein, Da Vinci). Portfólio: **ZapMenu** e **Firmis** apenas. **Nenhum agente sem orq responsável** — matriz de propriedade em `SYSTEM.md` §4.

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
- `control-evaluator` — avaliador independente de resultado contra o Task Contract
- `control-portfolio-analyst` — prioridades ZapMenu e Firmis
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
`tesla`, `einstein`, `da-vinci`, `autoloop`, `orq`, `zapmenu`, `design-lead`, `find-skills` (+ plugins instalados).

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
- **v7** → 6 leads enriquecidos, 3 orquestradores reescritos, `.env` centralizado, multi-modelo, keywords ultrathink2/ultraask
- **v7.1 (atual)** → 3 orquestradores de domínio: `vertexion-director`→**Tesla**, `zapmenu-activity`→**Einstein**, Da Vinci mantido; `/autoloop` (Karpathy Loop); modo merge (`/orq all`); níveis de uso; `loop-verifier` movido para `agents/control/`; conhecimento curado em `knowledge/{tesla,einstein,da-vinci}/`. Contexto completo em `docs/versoes.md`

## Test commands
N/A — sistema de agentes, não biblioteca de código.


## v8 runtime contract

- Task Contract is the unit of work; lifecycle `INTAKE → CONTRACT → CONTEXT → PLAN → EXECUTE → VERIFY → EVALUATE → FINALIZE`.
- Tesla = Engineering & Reliability; Einstein = Business Intelligence & Growth; Da Vinci = Product Experience.
- Builder, Reviewer and Evaluator are distinct. `control-evaluator` validates outcome.
- Task state belongs in `tasks/`; durable learning remains in `memory/`; runtime events remain in `state/control-center/`.
- Active runtime resolves orchestration through `orchestrators/registry.json`; legacy `control-vertexion-director` must not be hardcoded in runtime paths.
