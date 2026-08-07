# Engineering — Protocolos Passivos de Engenharia

Estes protocolos são ativados por contexto, NÃO por comando `/skill`. Para detalhamento completo de cada um, consulte `engineering-reference.md`.

## Regra base

Correção automática em `/revisar` apenas para CRITICAL confirmado. Pedido explícito de correção permite editar no escopo. Refatoração fora do pedido somente quando estritamente necessária. Migration aplicada nunca é editada. Testes destrutivos nunca em ambiente desconhecido.

---

## 1. Protocolo: code-review

**Quando:** Revisar PRs, diffs, patches antes de merge/deploy.

**Dimensões:** Segurança (injection, auth, secrets) • Performance (N+1, leaks, O(n²)) • Corretude (edge cases, race, off-by-one) • Manutenibilidade (nomes, duplicação, cobertura).

**Formato de saída obrigatório:**
```
## Code Review: [arquivo/PR]
### Summary — 1-2 frases
### Critical Issues — Tabela | # | File | Line | Issue | Severity |
### Suggestions — Por categoria
### What Looks Good
### Verdict — Approve / Request Changes / Needs Discussion
```

**Roteamento:** Revisão padrão → agente `engineering-code-reviewer`. Revisão adversarial (quebra auto-revisão) → agente `engineering-adversarial-reviewer`.

---

## 2. Protocolo: debug

**Quando:** Erro, stack trace, comportamento inesperado, regressão.

**Fluxo:** Reproduzir → Isolar → Diagnosticar (classifique: lógica • estado • integração • contrato • configuração • ambiente • dados • concorrência • auth • cache • UI/UX • regressão) → Corrigir → Validar.

---

## 3. Protocolo: system-design / architecture

**REDIRECIONADO.** Decisões de arquitetura (componentes, tecnologia, ADRs, trade-offs) → use o agente **`engineering-senior-architect`**. Consulte `engineering-reference.md` seção 3 para detalhamento do framework.

---

## 4. Protocolo: deploy-checklist

**Quando:** Deploy em produção, migração remota, release.

**Pré:** Testes ✓ Código aprovado ✓ Sem bugs críticos ✓ Migrations testadas ✓ Feature flags ✓ Rollback ✓ Plantão.
**Deploy:** Staging + smoke → Produção (canário) → Monitorar 15min → Fluxos críticos.
**Pós:** Métricas ✓ Release notes ✓ Stakeholders ✓ Tickets.
**Rollback se:** Error rate > X% | P50 > Xms | Fluxo crítico falha.

---

## 5. Protocolo: documentation

**Quando:** README, API docs, runbook, onboarding, arquitetura.

**Tipos:** README (o que é + quick start) • API Docs (endpoints + auth + errors) • Runbook (procedimento + rollback) • Architecture Doc (decisões + fluxos) • Onboarding Guide (setup + contatos).
**Princípios:** Leitor primeiro • Info útil primeiro • Mostre (exemplos) • Atualizado • Link, não duplique.

---

## 6. Protocolo: incident-response

**Quando:** Alerta de incidente, falha em produção, degradação.

**Fases:** Triage (SEV1-4, sistemas afetados) → Comunicar (status, war room) → Mitigar (passos, timeline) → Postmortem (blameless, RCA 5 whys).
**SEV1:** Serviço fora, todos afetados — resposta imediata.
**SEV2:** Feature degradada — 15min. **SEV3:** Feature menor — 1h. **SEV4:** Cosmético — próximo dia útil.

---

## 7. Protocolo: standup

**Quando:** Reportar progresso, resumo diário.

```
## Standup — [Date]
### Yesterday — [item with context]
### Today — [planned item]
### Blockers — [blocker with context]
```

---

## 8. Protocolo: tech-debt

**Quando:** Código problemático, refatoração, saúde do código.

**Categorias:** Code • Architecture • Test • Dependency • Documentation • Infrastructure.
**Priorização:** Score = Impacto (1-5) + Risco (1-5) × (6 - Esforço).

---

## 9. Protocolo: testing-strategy

**Quando:** Planejar testes, sugerir cobertura, avaliar qualidade.

**Pirâmide:** Unit (muitos, rápidos) → Integration (alguns, média velocidade) → E2E (poucos, lentos, alta confiança).
**Foco:** Business-critical paths, error handling, edge cases, security, data integrity.
**Pule:** Getters/setters triviais, código de framework, scripts descartáveis.

---

## 10. Protocolo: architecture

Integrado ao protocolo #3. **REDIRECIONADO** → agente `engineering-senior-architect`.

---

## Notas de implementação passiva

- Protocolos ativados por contexto, não por comando.
- `engineer-method.md` coordena quando e como cada protocolo é ativado.
- Conflito → protocolo mais específico ao contexto vence.
- Análise é textual, sem scripts automatizados externos.
