
# Vertexion Agent System

Meta-sistema de agentes de IA para o Claude Code. Organiza produtos, leads, validacao de ideias e engenharia com **tres orquestradores de dominio** - Tesla (engenharia), Einstein (growth/juridico/marketing) e Da Vinci (design) - ativaveis por `/orq`, por mencao no meio do chat, e fundiveis num trabalho unico via `/orq all` (modo merge).

## Orquestradores

| ID | Nome | Cor | Foco | Agent |
|----|------|-----|------|-------|
| `tesla` | Tesla | azul | engenharia de codigo + auto-melhoria (SEMPRE ultrathink2) | `control-tesla` |
| `einstein` | Einstein | amarelo | growth + juridico + marketing | `control-einstein` |
| `da-vinci` | Da Vinci | vermelho | design front-end | `da-vinci` |
| `all` | Merge | - | coordena os 3 num job unico | chat principal |

**Nenhum agente sem orq responsavel.** 6 leads + control agents, todos sob pelo menos um orquestrador (matriz em `SYSTEM.md`).

## Ativacao

```bash
/orq tesla            # ativa Tesla (engenharia)
/orq einstein         # ativa Einstein (growth/juridico/marketing)
/orq da-vinci         # ativa Da Vinci (design)
/orq tesla alto       # nivel de uso (baixo|medio|alto|maximo, default medio)
/orq all              # modo merge - coordena os 3, NAO muda o agente ativo
```

- **Mid-chat:** mencionar Tesla/Einstein/Da Vinci no texto ativa a skill correspondente. Invocacao direta: `/tesla`, `/einstein`, `/da-vinci`, `/autoloop`.
- **Niveis de uso:** semantica em `docs/levels.md`.

## Seus projetos

O framework e agnostico a projeto. Cadastre os seus em `portfolio/projects.json` (veja o exemplo ja incluido). O orquestrador le esse arquivo para saber o que priorizar.

## Seguranca

Este framework nao contem:

- chaves, tokens ou senhas (credenciais vivem em `~/.claude/.env`, chmod 600);
- dados pessoais;
- deploy automatico de producao;
- migration remota automatica;
- envio automatico de mensagens;
- gasto autonomo (orcamento zero).

Acao externa (deploy, envio, preco, compra, migration, producao) passa por `control-approval-preparer` + aprovacao explicita do proprietario.

## Multi-modelo

Agnostico a provedor: o modelo efetivo varia por sessao (`/model`). Comportamento por perfil em `docs/model-guide.md`.

## Estrutura

```text
~/.claude/
  agents/      6 leads (dev, design, marketing, financas, juridico, operacoes)
  skills/      tesla, einstein, da-vinci, autoloop, orq, design-lead, find-skills
  rules/       protocolos sob demanda (MANDATORY, cognition, security, growth, ...)
  vertexion-agent-system/
    SYSTEM.md            arquitetura (autoridade)
    MANIFEST.json
    agents/control/      control agents (tesla, einstein, da-vinci, evaluator, ...)
    orchestrators/       registry.json
    contracts/           Task Contract + delegation (v8)
    tasks/               estado/artefatos de tarefa (v8)
    evals/ experiments/  avaliacao e experimentos (v8)
    memory/general/      mistakes, patterns, false-positives, decisions
    portfolio/           seus projetos (template)
    control-center/      dashboard localhost
```

## Validacao local

```bash
node scripts/validate-v8.mjs
jq -e . orchestrators/registry.json
```