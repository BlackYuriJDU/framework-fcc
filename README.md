# Vertexion Agent System 7.1

Sistema global e visual para Arthur Araújo coordenar produtos, leads, validação de ideias e engenharia pelo Claude Code no WSL, com **três orquestradores de domínio** — Tesla (engenharia), Einstein (growth/jurídico/marketing) e Da Vinci (design) — ativáveis por `/orq`, por nome no meio do chat e fundíveis num trabalho único via `/orq all` (modo merge).

Repositório oficial: `BlackYuriJDU/framework-fcc` (branch `master`).

## Orquestradores

| ID | Nome | Cor | Foco | Substitui | Agent |
|----|------|-----|------|-----------|-------|
| `tesla` | Tesla | 🔵 azul | engenharia de código + auto-melhoria (SEMPRE ultrathink2) | `vertexion-director` | `control-tesla` |
| `einstein` | Einstein | 🟡 amarelo | growth + jurídico + marketing | `zapmenu-activity` | `control-einstein` |
| `da-vinci` | Da Vinci | 🔴 vermelho | design front-end | da-vinci (mantido) | `da-vinci` |
| `all` | Merge | — | coordena os 3 num job único | (novo) | chat principal |

**Nenhum agente sem orq responsável.** 6 leads + 9 control agents, todos sob pelo menos um orquestrador (matriz em `SYSTEM.md` §4).

## Ativação

```bash
/orq tesla            # ativa Tesla (engenharia) — azul
/orq einstein         # ativa Einstein (growth/jurídico/marketing) — amarelo
/orq da-vinci         # ativa Da Vinci (design) — vermelho
/orq tesla alto       # ativa com nível de uso (baixo|médio|alto|máximo, default médio)
/orq all              # modo merge — imprime o protocolo, NÃO muda o agente ativo
/orq --focus einstein # imprime a skill do orq para a tarefa, sem trocar o ativo
```

- **Mid-chat:** mencionar Tesla/Einstein/Da Vinci no texto ativa a skill correspondente para a tarefa (como as tags ultrathink2). Invocação direta: `/tesla`, `/einstein`, `/da-vinci`, `/autoloop`.
- **Níveis de uso:** semântica em `docs/levels.md`.

## Projetos conhecidos

| Prioridade | Projeto | Estado | Direção |
|---:|---|---|---|
| 1 | ZapMenu | lançado (zapmenu.org) | obter 3 clientes pagantes, reter 2 |
| 2 | Firmis | validação de mercado | laudos técnicos de engenharia com IA |

Detalhes ficam em `portfolio/` e `project-plans/`.

## Segurança

Este framework não contém:

- chaves, tokens ou senhas (credenciais vivem em `~/.claude/.env`, chmod 600);
- dados pessoais de leads;
- deploy automático de produção;
- migration remota automática;
- envio automático de mensagens;
- gasto autônomo (orçamento R$0).

Ação externa (deploy, envio, preço, compra, migration, produção) passa por `control-approval-preparer` + aprovação explícita de Arthur. Antes de ativar integrações, siga `docs/SECURITY_ROTATION_CHECKLIST.md`.

## FCC e multi-modelo

O sistema é agnóstico a provedor (perfis fronteira/padrão/compacto). Todos os agentes solicitam um modelo de referência, mas FCC/Claude pode redirecionar o alias para outro modelo/provedor; o sistema diferencia `requestedModel` de `effectiveModel`. Não afirme que um modelo específico foi usado sem confirmação. Comportamento por perfil: `docs/model-guide.md`.

## Estrutura principal (v7.1)

```text
~/.claude/
├── agents/                6 leads (dev, design, marketing, financas, juridico, operacoes)
├── skills/                tesla, einstein, da-vinci, autoloop, orq, zapmenu, design-lead, find-skills
├── rules/                 protocolos sob demanda (MANDATORY, cognition, security, growth, ...)
├── agent-memory/          memória histórica por agente (control-tesla preserva linhagem)
└── vertexion-agent-system/
    ├── SYSTEM.md          arquitetura e orquestradores (autoridade)
    ├── MANIFEST.json      v7.1.0 — 15 agents, 8 skills
    ├── agents/control/    9 control agents (incl. loop-verifier)
    ├── orchestrators/registry.json   version 3 (tesla/einstein/da-vinci + level)
    ├── knowledge/{tesla,einstein,da-vinci}/   repos curados + pointers.md
    ├── docs/              versoes.md (autoridade), levels.md, merge.md, ...
    ├── reports/merge-*/   artefatos do modo merge
    ├── scripts/           backup.sh, orq.sh, sync-knowledge.sh, ...
    ├── memory/general/    mistakes, patterns, false-positives, decisions
    ├── portfolio/         ZapMenu + Firmis
    ├── control-center/    dashboard localhost (loopback, CSRF)
    └── archive/           agentes fundidos, skills removidas
```

## Validação local

```bash
node scripts/validate-package.mjs   # quando presente
jq -e . orchestrators/registry.json  # registry v3 válido
```

O validador verifica estrutura, frontmatter, nomes, modelo, Skills, JSON, sintaxe e segredos prováveis.

## Limitações honestas

A estrutura pode ser validada localmente, mas instalação real, autenticação FCC/Claude, Supabase, AppMax e deploys só podem ser confirmados no seu computador e nas contas correspondentes. Versão anterior do ZIP (v5) usava instalação via `install.ps1`; a v7.1 vive instalada em `~/.claude` e segue versionada no repo `BlackYuriJDU/framework-fcc`.
