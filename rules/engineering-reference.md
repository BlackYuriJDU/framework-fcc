# Engineering — Referência Detalhada dos Protocolos

> Arquivo de consulta, não carregado por padrão. Contém a versão expandida de cada protocolo listado em `engineering.md`. Carregue apenas quando precisar executar um protocolo específico em profundidade.

---

## 1. code-review — Detalhamento

### Dimensões de revisão

- **Segurança:** SQL injection, XSS, CSRF, auth falho, secrets no código, deserialização insegura, path traversal, SSRF.
- **Performance:** N+1 queries, alocações desnecessárias, complexidade O(n²) em hot paths, índices faltantes, queries sem limite, resource leaks.
- **Corretude:** Edge cases (vazio, null, overflow), race conditions, error handling, off-by-one, type safety.
- **Manutenibilidade:** Clareza de nomes, single responsibility, duplicação, cobertura de testes, documentação de lógica não óbvia.

### Formato de saída

```markdown
## Code Review: [arquivo/PR]

### Summary
[visão geral em 1-2 frases]

### Critical Issues
| # | File | Line | Issue | Severity |
|---|------|------|-------|----------|

### Suggestions
[por categoria: Performance | Segurança | Corretude | Estilo]

### What Looks Good
[observações positivas]

### Verdict
[Approve / Request Changes / Needs Discussion]
```

---

## 2. debug — Detalhamento

### Fluxo completo

1. **Reproduzir** — Comportamento esperado vs. real. Passos exatos. Escopo (quando começou? quem é afetado?).
2. **Isolar** — Restringir componente/serviço/caminho. Mudanças recentes. Logs.
3. **Diagnosticar** — Hipóteses e testes. Traçar caminho do código. Causa raiz.
4. **Corrigir** — Propor correção. Efeitos colaterais e edge cases. Testes de regressão.
5. **Validar** — Confirmar resolução e não quebra cenários adjacentes.

### Classificação
lógica • estado • integração • contrato • configuração • ambiente • dados • concorrência • auth • cache/sincronização • UI/UX • regressão

---

## 3. system-design / architecture — Detalhamento

**Nota:** Decisões de arquitetura devem usar o agente `engineering-senior-architect`. Este detalhamento é referência.

### Framework
1. **Requirements** — Funcionais + Não-funcionais (escala, latência, disponibilidade, custo) + Restrições
2. **High-Level Design** — Diagrama de componentes, fluxo de dados, contratos de API, escolhas de storage
3. **Deep Dive** — Modelo de dados, endpoints, cache, filas/eventos, retry/error handling
4. **Scale & Reliability** — Estimativa de carga, scaling, failover, monitoring
5. **Trade-off Analysis** — Complexidade, custo, familiaridade, time-to-market, manutenibilidade

### ADR
```markdown
# ADR-[number]: [Title]
**Status:** Proposed | Accepted | Deprecated | Superseded
**Date:** [Date]
**Deciders:** [Who needs to sign off]

## Context
## Decision
## Options Considered
## Trade-off Analysis
## Consequences
## Action Items
```

---

## 4. deploy-checklist — Detalhamento

**Pré-deploy:** Testes em CI ✓ Código aprovado ✓ Sem bugs críticos ✓ Migrations testadas ✓ Feature flags ✓ Rollback documentado ✓ Plantão notificado

**Deploy:** Staging + smoke ✓ Produção (canário) ✓ Monitorar error rate/latência 15min ✓ Fluxos críticos

**Pós-deploy:** Métricas nominais ✓ Release notes ✓ Stakeholders ✓ Tickets

**Rollback triggers:** Error rate > X% | P50 > Xms | Fluxo crítico falha

---

## 5. documentation — Detalhamento

- **README:** O que é, por que existe, quick start < 5min, configuração, contribuição
- **API Docs:** Endpoints com request/response, auth, error codes, rate limits, paginação, SDK examples
- **Runbook:** Quando usar, pré-requisitos, passo-a-passo, rollback, escalation path
- **Architecture Doc:** Contexto, goals, high-level design, decisões, fluxo de dados
- **Onboarding Guide:** Setup, sistemas chave, tarefas comuns, contatos

**Princípios:** (1) Escreva para o leitor (2) Informação mais útil primeiro (3) Mostre, não conte (4) Mantenha atualizado (5) Link, não duplique

---

## 6. incident-response — Detalhamento

### Fases
1. **Triage** — Severidade (SEV1-4), sistemas/usuários afetados, papéis
2. **Comunicar** — Status interno, cliente (se necessário), war room, cadência
3. **Mitigar** — Passos, timeline, confirmar resolução
4. **Postmortem** — Blameless, timeline, RCA (5 whys), action items com owners

### Severidade
| Level | Critério | Response |
|-------|----------|----------|
| SEV1 | Serviço fora, todos afetados | Imediato |
| SEV2 | Feature degradada, muitos afetados | 15 min |
| SEV3 | Feature menor, alguns afetados | 1 hora |
| SEV4 | Cosmético ou baixo impacto | Próximo dia útil |

---

## 7. standup — Detalhamento

```markdown
## Standup — [Date]

### Yesterday
- [item with context]

### Today
- [planned item]

### Blockers
- [blocker with context]
```

---

## 8. tech-debt — Detalhamento

### Categorias
| Tipo | Exemplos | Risco |
|------|----------|-------|
| Code debt | Lógica duplicada, abstrações pobres, magic numbers | Bugs |
| Architecture debt | Monólito que devia ser dividido, data store errado | Escala |
| Test debt | Baixa cobertura, testes flaky | Regressões |
| Dependency debt | Libs desatualizadas, deps não mantidas | Vulnerabilidades |
| Documentation debt | Runbooks ausentes, READMEs desatualizados | Onboarding |
| Infrastructure debt | Deploy manual, sem monitoring, sem IaC | Incidentes |

### Priorização
Score = Impacto (1-5) + Risco (1-5) × (6 - Esforço)

---

## 9. testing-strategy — Detalhamento

```
        /  E2E  \         Poucos, lentos, alta confiança
       / Integration \     Alguns, velocidade média
      /    Unit Tests  \   Muitos, rápidos, focados
```

**Foco:** business-critical paths, error handling, edge cases, security boundaries, data integrity.
**Pule:** getters/setters triviais, código de framework, scripts descartáveis.

---

## 10. architecture — Detalhamento

Integrado ao protocolo system-design (#3). Decisões de arquitetura → usar agente `engineering-senior-architect`.

---

## Notas

- Protocolos não são comandos `/skill`, são comportamentos default ativados por contexto.
- O protocolo mestre (`engineer-method.md`) coordena quando e como cada protocolo é ativado.
- Em caso de conflito, o protocolo mais específico ao contexto vence.
- Análise é textual; scripts automatizados (schema_analyzer.py, wtp_analyzer.py etc.) não estão disponíveis neste ambiente.
