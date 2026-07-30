# ADR-006: Arquitetura de Memória Persistente (Obsidian + agentmemory + Graphiti)

**Status:** Proposed
**Date:** 2026-07-16
**Deciders:** Arthur Araújo (Owner), Vertexion Director (Executor)

---

## Context

O Vertexion Director (eu) opera em sessões longas de raciocínio complexo via Claude Code (FCC/DeepSeek v4 flash). O sistema atual tem três problemas críticos:

1. **Sobrecarga de contexto:** `CLAUDE.md` + `rules/` (14 arquivos) + `portfolio/` + `memory/` = ~50KB+ carregados **sempre** no system prompt, mesmo quando irrelevantes.

2. **Memória entre sessões perdida:** O `agent-memory/control-vertexion-director/` (17 arquivos .md) é **passivo** — eu leio no início se lembrado, mas não há recall automático cross-session. Sessão nova = contexto zero.

3. **Conhecimento desestruturado:** Portfolio, regras, decisões, learnings espalhados em arquivos .md sem links navegáveis, sem grafo semântico, sem temporalidade (o que era verdade antes vs. agora).

---

## Decision

Implementar **arquitetura de 3 camadas** com progressive disclosure real:

### Camada 1: Obsidian Vault (`~/vertexion-brain/`) — Base Humano-Legível
- **Ferramenta:** `claude-obsidian` (AgriciDaniel) + MCP filesystem (`@bitbonsai/mcpvault`)
- **Estrutura:** PARA + Zettelkasten + wiki skeleton (hot.md, index.md, projects/, areas/, resources/, archive/)
- **Vantagem:** Git history nativo, wikilinks, legível por humano, plugins Obsidian (Git, REST API, Web Clipper)
- **Minha responsabilidade:** Atualizar `hot.md` fim de sessão, popular `projects/`, `areas/`, `resources/` via MCP

### Camada 2: agentmemory MCP — Cross-Session Recall Automático
- **Ferramenta:** `rohitg00/agentmemory` (MCP stdio)
- **Função:** Persistir contexto entre sessões do Claude Code automaticamente
- **Protocolo:** `session_start` (carrega contexto relevante) → `session_end` (grava learnings, decisões, hot context)
- **Vantagem:** Zero config manual por sessão, recall semântico não só textual

### Camada 3: Graphiti (Futuro, Fase 2) — Temporal Knowledge Graph
- **Ferramenta:** Graphiti (temporal KG) — self-hosted (Docker: Neo4j/PostgreSQL+AGE)
- **Schema-first:** 10 Entity Types + 10 Relationship Types (aprovados)
- **Temporal resolution:** `valid_from` / `valid_to` em todas relações
- **Queries precisas:** "Quais decisões sobre ZapMenu eram válidas em Jul/2026?"
- **MCP bridge:** Custom ou `graphiti-mcp` quando disponível

---

## Options Considered

### Option A: Apenas agentmemory MCP
| Prós | Contras |
|------|---------|
| Simples, nativo MCP, cross-session imediato | Sem estrutura semântica, busca só textual, sem temporalidade, sem vault humano-legível |

### Option B: Apenas Graphiti
| Prós | Contras |
|------|---------|
| Schema-first, temporal, queries precisas | Precisa infra (Neo4j/PostgreSQL), setup complexo, sem MCP nativo, não legível por humano |

### Option C: Apenas Obsidian Vault
| Prós | Contras |
|------|---------|
| Humano-legível, Git, wikilinks, plugins, PARA/Zettelkasten | Sem recall cross-session automático, busca só textual/grep, sem temporalidade estruturada |

### Option D: **Híbrido (RECOMENDADO)** — Obsidian + agentmemory + Graphiti (Fase 2)
| Prós | Contras |
|------|---------|
| Cada camada resolve falha da anterior. Vault = base sólida legível. agentmemory = recall automático hoje. Graphiti = queries complexas futuro. MCP filesystem = ponte única. | 3 sistemas para manter. Graphiti precisa infra. |

---

## Schema Graphiti (Aprovado — 10 Entities + 10 Relationships)

### Entities
1. `Project` — ZapMenu, Vertexion, Run, Radar, Collect
2. `Feature` — Funcionalidade específica
3. `Decision` — Decisão arquitetural/negócio (status, rationale, valid_from/to)
4. `Person` — Lead, stakeholder, usuário, concorrente
5. `Company` — Cliente, concorrente, parceiro, fornecedor
6. `Metric` — KPI, target, valor atual
7. `Risk` — Risco identificado (severidade, mitigação)
8. `Experiment` — Hipótese, variante, resultado
9. `Rule` — Regra do sistema (constituição, security, design)
10. `Incident` — Bug, outage, falha segurança

### Relationships
1. `HAS_FEATURE` (Project → Feature)
2. `MADE_DECISION` (Project/Person → Decision)
3. `OWNS` (Person/Company → Project/Feature)
4. `TRACKS_METRIC` (Project → Metric)
5. `HAS_RISK` (Project/Feature → Risk)
6. `RAN_EXPERIMENT` (Project → Experiment)
7. `FOLLOWS_RULE` (Agent/Process → Rule)
8. `CAUSED_INCIDENT` (Change/Deploy → Incident)
9. `DEPENDS_ON` (Feature → Feature, Project → Project)
10. `SUPERSEDES` (Decision → Decision, Rule → Rule)

**Temporal:** Todas relações têm `valid_from` / `valid_to` (ISO 8601).

---

## Implementation Plan

### Fase 1 (Hoje — Concluída Parcial)
- [x] Skills Director com progressive disclosure (`~/.claude/skills/vertexion-director/`)
- [x] Design-lead skill criado
- [x] Vault structure criada (`~/vertexion-brain/wiki/resources/` com symlinks)
- [x] Symlinks: `rules/`, `portfolio/`, `memory/`, `patterns/` → vault
- [ ] **Arthur:** Clone `claude-obsidian`, `bash bin/setup-vault.sh`, plugins Obsidian
- [ ] **Arthur:** `claude mcp add-json obsidian-vault` (MCP filesystem)
- [ ] **Arthur:** `claude plugin install obsidian@obsidian-skills` (kepano)
- [ ] **Eu:** Popular vault via MCP (projects.json → wiki/projects/, PRODUCT_DECISIONS.md, memory/, rules/)

### Fase 2 (Esta Semana)
- [ ] **Arthur:** Instalar `agentmemory` MCP (`claude mcp add-json agentmemory ...`)
- [ ] **Eu:** Testar recall cross-session (nova sessão → carrega hot.md + contexto relevante)
- [ ] **Eu:** Implementar `session_end` hook → atualiza `hot.md` + grava agentmemory

### Fase 3 (Próximas Semanas — Graphiti)
- [ ] Infra: Docker Compose (Neo4j 5.x + Graphiti service)
- [ ] MCP bridge Graphiti (custom ou wrapper)
- [ ] Popular KG a partir do vault + agentmemory
- [ ] Queries temporais em tarefas complexas (red team, pricing, compliance)

---

## Consequences

### Positivas
- **Progressive disclosure real:** Skills carregam `when_to_use.md` (Level 1) → `references/` só quando necessário
- **Memória cross-session:** agentmemory elimina "começar do zero" toda sessão
- **Base humano-legível:** Vault Obsidian serve como documentação viva, onboarding, backup
- **Queries temporais futuras:** Graphiti permite "o que era verdade em X?" — crítico para compliance, pricing, arquitetura
- **Single source of truth:** Vault = fonte primária; agentmemory/Graphiti = índices derivados

### Negativas/Riscos
| Risco | Mitigação |
|-------|-----------|
| 3 sistemas = complexidade | Faseamento: Vault hoje, agentmemory esta semana, Graphiti mês que vem |
| Symlinks WSL → Windows quebram | Usar `~/vertexion-brain` (WSL native). Fallback: copiar se falhar |
| agentmemory MCP instável | Testar em sessão isolada antes de confiar; fallback = memory system atual |
| Graphiti precisa infra pesada | Docker Compose local; só subir quando necessário; não bloqueia Fase 1-2 |

---

## Rollback Plan
Se agentmemory falhar consistentemente:
1. Desabilitar MCP agentmemory
2. Voltar ao memory system atual (`agent-memory/control-vertexion-director/`) + leitura manual `wiki/hot.md` no início de sessão
3. Reavaliar em 30 dias

---

## References
- [claude-obsidian](https://github.com/AgriciDaniel/claude-obsidian) — LLM Wiki pattern (Karpathy)
- [agentmemory](https://github.com/rohitg00/agentmemory) — Persistent memory MCP
- [Graphiti](https://github.com/getzep/graphiti) — Temporal Knowledge Graph
- [AI Agent Book (Bojie Li)](https://github.com/bojieli/ai-agent-book) — Cap 2 Context Engineering, Cap 3 Memory, Cap 8 Self-Improvement
- [Agent Harness (Alex Prompter)](https://arxiv.org/abs/2607.13104) — 5 layers: Context, Tool/Permission, Verification, Memory/State, Safety/Sandbox

---

**Próxima Ação:** Arthur executa setup Obsidian + MCP filesystem. Eu populo vault via MCP.