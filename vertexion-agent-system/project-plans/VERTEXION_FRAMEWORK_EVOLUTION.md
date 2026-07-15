# Vertexion Framework Evolution — Plano de Implementação Consolidado

**Data:** 2026-07-10
**Autor:** Vertexion Director (após análise de ~30 sugestões ChatGPT + auto-auditoria)
**Modelo:** DeepSeek v4 flash via FCC (alias opus)

---

## Filosofia do Plano

Este plano consolida **todas as ideias** da conversa de 2026-07-10:
- Primeiro lote ChatGPT (14 itens — engines 1-14)
- Auto-auditoria (A01-A10)
- Segundo lote ChatGPT (15 itens — engines 1-15)
- Pedidos diretos de Arthur (Memory.md automático, discordar ativamente)

**Cada item é classificado como:**
- 🟢 **Faz agora** — impacto alto, esforço baixo, sem dependências
- 🟡 **Faz em sequência** — impacto médio, depende de item anterior
- 🔴 **Faz com cuidado** — impacto alto MAS requer preparação ou é arriscado
- ⚫ **Não faz agora** — descartado ou adiado

---

## FASE 0 — Fundação (hoje, < 1h)

### 0.1 ✅ Perfil Arthur salvo na memória
- `user-arthur-profile.md` criado com dados autorizados
- Gatilho automático ativado: aprender a cada prompt, perguntar antes de inferir

### 0.2 🟢 Learning Loop (A01 + ChatGPT Learning Engine)
**O que:** `mistakes.md` vazio, `successful-patterns.md` com 1 entrada. A autoavaliação do engineer-method.md não está sendo executada.

**O que fazer:**
1. Adicionar no `control-vertexion-director.md` instrução obrigatória de registro pós-tarefa
2. Adicionar no início do workflow: "leia `mistakes.md` buscando por entradas relacionadas ao projeto antes de começar"

**Arquivos:** `~/.claude/agents/control/control-vertexion-director.md`
**Esforço:** 15 minutos
**Dependências:** Nenhuma

### 0.3 🟢 Engineering Constitution (ChatGPT #8)
**O que:** Extrair princípios fundamentais do `engineer-method.md` para um `constitution.md` de ~10 linhas. Os 4 Princípios Karpathy + Padrões de Código.

**Por que:** O `engineer-method.md` tem 203 linhas e carrega sempre. Uma constituição de 10 linhas carrega SEMPRE, o resto vira referência opcional.

**Arquivos:** 
- Criar `~/.claude/rules/constitution.md` (10 linhas)
- Reduzir `engineer-method.md` para 30 linhas (resumo + link para `engineer-method-reference.md`)
- Criar `~/.claude/rules/engineer-method-reference.md` com o conteúdo completo

**Esforço:** 20 minutos
**Dependências:** Nenhuma

### 0.4 🟢 Context Bloat (A06 + ChatGPT Context Engine)
**O que:** `problemas-de-melhora-de-contexto.md` (223 linhas!) carregado como regra quando é documentação interna. `engineer-method.md` carregado completo. `design.md` monolítico.

**O que fazer:**
1. Mover `problemas-de-melhora-de-contexto.md` → `~/.claude/vertexion-agent-system/docs/internal/`
2. Já feito na rodada anterior: `engineering.md` comprimido ✅
3. `design.md` — separar em `rules/design/` (comprimido, por componente)
4. `engineer-method.md` — comprimido como parte da 0.3

**Arquivos:** 
- Mover: `~/.claude/rules/problemas-de-melhora-de-contexto.md`
- Separar: `~/.claude/rules/design.md` → `~/.claude/rules/design/`

**Esforço:** 30 minutos
**Dependências:** Nenhuma (pode rodar em paralelo com 0.2)

### 0.5 🟢 Disagree Behavior + Memory.md Automático
**O que:** Já registrado como feedback. A partir de agora:
- A cada prompt: "aprendi algo novo?"
- Se explícito → salva direto
- Se inferido → pergunta antes
- Registrar no MEMORY.md

**Arquivos:** Apenas o processo mental (já implementado com `feedback_disagree_and_push_back.md`)
**Esforço:** Já feito ✅

---

## FASE 1 — Pipeline e Processo (1-2h)

### 1.1 🟢 Pipelines Obrigatórios (A05)
**O que:** Hoje todos os agentes são invocados manualmente. Não há fluxo obrigatório. Adicionar no director:

```
## Pipelines obrigatórios
### Produto (ideia/feature)
intake → hypothesis → evidence → red team → decision judge

### Engenharia (código)
implementation planner → [execução] → code review → scope guardian

### Risco (security/payment/auth)
security auditor + supabase auditor → release judge

### Ação externa
control auditor → approval preparer → aprovação Arthur
```

**Arquivos:** `~/.claude/agents/control/control-vertexion-director.md`
**Esforço:** 30 minutos
**Dependências:** FASE 0

### 1.2 🟢 Simulation Checklist (ChatGPT #1)
**O que:** Não criar um agente novo, mas adicionar no pipeline de engenharia um passo de simulação mental antes de codificar:

```
## Simulação pré-código
Antes de implementar, simule mentalmente:
1. Fluxo completo (happy path)
2. O que pode falhar em cada etapa
3. Cenários: sucesso, pendente, recusado, timeout, servidor fora
4. Impacto em outros componentes
```

**Arquivos:** Adicionar ao `engineering-implementation-planner` ou ao pipeline no director
**Esforço:** 15 minutos
**Dependências:** 1.1

### 1.3 🟢 User Journey Engine (ChatGPT #4)
**O que:** O único dos 15 itens do segundo lote que é genuinamente novo. Criar agente leve que mapeia a jornada completa do usuário antes de implementar features.

**Agente novo:** `product-user-journey-auditor`
- Descrição: "Mapeia a jornada completa do usuário (descoberta → ativação → uso → retenção) e identifica pontos de abandono, fricção e oportunidades de conversão antes da implementação."
- Instruções: mapa de jornada, pontos de abandono, frustrações, etapas desnecessárias, oportunidades
- ~20 linhas, leve

**Arquivos:** Criar `~/.claude/agents/product/product-user-journey-auditor.md`
**Esforço:** 30 minutos
**Dependências:** 1.1 (para integrar no pipeline de produto)

---

## FASE 2 — Fortalecimento dos Agentes (2-4h)

### 2.1 🟢 Expandir Agent Definitions Críticos (A03)
**O que:** Agentes com 14 linhas e 1 parágrafo não são especialistas — são lembretes. Expandir os críticos com checklists específicos.

**Prioridade:**
1. `control-auditor.md` — o fiscal do sistema. Precisa de critérios de rejeição claros.
2. `engineering-security-auditor.md` — checklist OWASP + RLS + secrets + auth
3. `engineering-supabase-auditor.md` — checklist RLS, policies, functions, storage
4. `engineering-code-reviewer.md` — checklist por dimensão (security, perf, corretude, manutenibilidade)
5. `engineering-payment-flow-auditor.md` — checklist AppMax, webhook, idempotência

**Formato padrão expandido:**
```markdown
## Domínio
[descrição do que este agente cobre]

## Checklist obrigatório
- [ ] item 1
- [ ] item 2
...

## Critérios de rejeição
- Se X → REJECT
- Se Y → FLAG FOR REVIEW

## Formato de saída
[estrutura esperada]
```

**Arquivos:** `~/.claude/agents/control/control-auditor.md`, `~/.claude/agents/engineering/engineering-security-auditor.md`, etc.
**Esforço:** 2-3 horas para os 5 críticos
**Dependências:** Nenhuma (pode rodar em paralelo com FASE 1)

### 2.2 🟢 Fix control-auditor.md (A07)
**O que:** O auditor é o agente mais crítico do sistema mas tem 23 linhas genéricas. Precisa de critérios de rejeição automática.

**Adicionar:**
```
## Critérios de rejeição automática
- Ação sem rollback documentado → REJECT
- Ação que expõe dados de terceiros → REJECT
- Ação com escopo vago → REJECT
- Ação que modifica produção sem staging → REJECT
- Deploy sem smoke test → REJECT

## Critérios de aprovação condicional
- Migration destrutiva → APPROVE apenas com backup + rollback
- Mudança de preço → APPROVE apenas com confirmação Arthur
- Gasto → APPROVE apenas com orçamento explícito
```

**Arquivos:** `~/.claude/agents/control/control-auditor.md`
**Esforço:** 20 minutos
**Dependências:** 2.1 (faz parte da expansão)

### 2.3 🔴 Agent Evolution Advisor (ChatGPT #12)
**O que:** Um meta-agente que MONITORA os outros agentes e SUGERE melhorias.

**Importante:** Modo SUGESTÃO apenas. Nunca modifica agentes automaticamente.

```yaml
name: control-agent-evolution-advisor
description: "Monitora a performance dos agentes do sistema e sugere melhorias baseadas em padrões de erro. APENAS SUGERE — nunca modifica agentes automaticamente."
```

**Funcionamento:**
1. Examina `mistakes.md`, `false-positives.md`, `successful-patterns.md`
2. Identifica padrões: "security-auditor errou RLS 3 vezes"
3. Sugere: "Adicionar checklist RLS obrigatório no security-auditor"
4. Arthur aprova ou rejeita

**Arquivos:** Criar `~/.claude/agents/control/control-agent-evolution-advisor.md`
**Esforço:** 45 minutos
**Dependências:** FASE 0 (learning loop precisa estar funcionando primeiro — senão não há dados para analisar)

---

## FASE 3 — Estrutura e Organização (2-3h)

### 3.1 🟢 Design Memory (ChatGPT #4 original)
**O que:** Separar `rules/design.md` (76 linhas monolíticas) em componentes:

```
rules/design/
├── README.md          ← índice
├── palette.md         ← cores por marca, contraste
├── typography.md      ← Space Grotesk, Manrope, JetBrains Mono
├── buttons.md         ← altura 44px, hover 200ms, radius
├── cards.md           ← sombra sutil, padding
├── spacing.md         ← 8px grid, breakpoints
├── accessibility.md   ← contraste 4.5:1, focus states, reduced-motion
└── anti-patterns.md   ← por indústria
```

**E o `design.md` original vira um índice de 5 linhas + link para a pasta.**

**Esforço:** 1 hora
**Dependências:** Nenhuma

### 3.2 🟢 Decision History Format (ChatGPT #13)
**O que:** Criar formato padrão para registrar decisões. Substituir o `decisions.md` atual (que é um ponteiro) por decisões reais com formato consistente.

**Formato:**
```markdown
## [AAAA-MM-DD] [Título da Decisão]
**Contexto:** ...
**Decisão:** ...
**Alternativas:** ...
**Consequências:** ...
**Quem decidiu:** Arthur (ou agente)
```

**Arquivos:** `~/.claude/vertexion-agent-system/memory/general/decisions.md`
**Esforço:** 15 minutos
**Dependências:** Nenhuma

### 3.3 🟢 Orphan Docs Cleanup (A02)
**O que:** 17 arquivos em `docs/`, muitos de versões antigas (VERSION_5_0, DASHBOARD_UI_SPEC_5_0). Revisar cada um.

**Ação:**
- Docs ativos → manter em `docs/`
- Docs de versões antigas → mover para `docs/archive/`
- Docs irrelevantes → excluir
- Adicionar `README.md` na pasta docs

**Esforço:** 30 minutos
**Dependências:** Nenhuma

### 3.4 🟢 Pattern Files por Tecnologia (ChatGPT item 10 original)
**O que:** Criar `~/.claude/vertexion-agent-system/patterns/` com arquivos específicos:

```
patterns/
├── react.md        ← Server Functions, TanStack Router, `use client`
├── supabase.md     ← RLS, migrations, service role, storage
├── tailwind.md     ← v4, @theme, design tokens
├── appmax.md       ← fluxo de pagamento, webhook, idempotência
├── cloudflare.md   ← deploy, workers, env vars
└── typescript.md   ← strict mode, z.infer, discriminated unions
```

**Esforço:** 1-2 horas
**Dependências:** Nenhuma

### 3.5 ⚫ Knowledge Graph (ChatGPT #13 original)
**Decisão:** ❌ **ADIADO.** Conceito interessante mas impraticável sem um runtime de grafo. Quando o sistema tiver 50+ agentes e 10+ projetos, revisitar. Hoje: 37 agentes, 5 projetos — um grafo manual em Markdown é mais custo que benefício.

---

## FASE 4 — Avançado (4-8h, fazer apenas após Fases 0-3)

### 4.1 🔴 Vision MCP (ChatGPT #5 + Visão)
**O que:** Criar um MCP que traduz imagens em Design Spec textual, já que DeepSeek não vê imagens.

**Arquitetura recomendada (Opção 2 do ChatGPT):**
- Servidor MCP em Node.js/Python
- Usa Gemini API (camada gratuita) ou Qwen2.5-VL como backend
- Ferramenta: `analyze_design(image)` → retorna `design_spec.json` estruturado
- DeepSeek nunca vê a imagem, só o spec

**Ferramentas do MCP:**
- `analyze_ui(image)` → paleta, layout, componentes, tipografia
- `analyze_brand(image)` → mood, estilo, emoção, referências
- `generate_tailwind_spec(image)` → configuração Tailwind v4 direto

**Esforço:** 3-4 horas (servidor MCP + integração API)
**Dependências:** Fases 0-3 completas
**Risco:** Depende de API externa gratuita que pode mudar ou ter rate limit

### 4.2 🟡 Performance Engine (ChatGPT #8)
**O que:** Expandir a dimensão de performance do `code-reviewer` para incluir análise de bundle, lazy loading, cache, queries N+1.

**Não criar agente novo** — expandir o `engineering-code-reviewer.md` com checklist de performance.

**Esforço:** 30 minutos
**Dependências:** 2.1 (code-reviewer expansion)

### 4.3 🟡 Dependency Intelligence (ChatGPT #3)
**O que:** Mapa de dependências entre componentes. Só faz sentido QUANDO os projetos crescerem.

**Gatilho para implementar:** Quando ZapMenu ou Vertexion ultrapassarem 200 arquivos de código OU quando houver primeiro incidente cross-repo não detectado.

**Forma leve:** Uma seção em `CROSS-REPO.md` ou em cada projeto listando dependências conhecidas.

**Esforço:** 1-2 horas (quando chegar a hora)
**Status:** ⏳ AGUARDANDO

### 4.4 ⚫ Taste Engine (ChatGPT #6)
**Decisão:** ❌ **DESCARTADO.** Prematuro. Exigiria alimentar manualmente specs de marca, manter atualizado, e ter um formato padrão. O ROI não justifica.

### 4.5 ⚫ Psychology Engine (ChatGPT #11)
**Decisão:** ❌ **DESCARTADO.** Impracticável sem modelo multimodal e dados de UX research.

### 4.6 ⚫ Failure Prediction Engine (ChatGPT #10)
**Decisão:** ❌ **ADIADO.** Sem dados históricos de produção, é chute. Quando houver métricas reais de custo, crescimento e churn, revisitar.

### 4.7 ⚫ Code Archaeology (ChatGPT #6)
**Decisão:** ⏳ **AGUARDANDO.** Útil apenas para projetos legado de terceiros ou após meses sem tocar no código.

---

## Cronograma Recomendado

| Fase | Itens | Esforço | Quando fazer |
|------|-------|---------|-------------|
| **FASE 0** | 0.2 a 0.5 (learning loop, constitution, context bloat, disagree) | ~1h | **Agora** — maior impacto, menor esforço |
| **FASE 1** | 1.1 a 1.3 (pipelines, simulation, user journey) | ~2h | **Depois da Fase 0** |
| **FASE 2** | 2.1 a 2.3 (expandir agentes, auditor, evolution advisor) | ~3h | **Depois da Fase 1** |
| **FASE 3** | 3.1 a 3.4 (design memory, decisions, docs cleanup, patterns) | ~2h | **Paralelo à Fase 2** |
| **FASE 4** | 4.1 a 4.3 (vision MCP, performance, dependency) | ~4h | **Só após Fases 0-3** |

## Resumo do que VALE e NÃO VALE

### Vale a pena (fazer)
| Item | Fase | Por quê |
|------|------|---------|
| Learning Loop | 0 | Sistema não aprende com erros — crítico |
| Engineering Constitution | 0 | Reduz contexto em 200+ linhas, impacto imediato |
| Context Bloat | 0 | Libera ~400 linhas de contexto por sessão |
| Pipelines Obrigatórios | 1 | Transforma agentes avulsos em sistema |
| Simulation Checklist | 1 | Prevê erros antes de codificar |
| User Journey Auditor | 1 | Único conceito genuinamente novo |
| Expandir Agentes | 2 | Agentes de 14 linhas são inúteis |
| Evolution Advisor | 2 | Auto-melhoria supervisionada |
| Design Memory | 3 | Contexto sob demanda |
| Pattern Files | 3 | Consistência cross-projeto |

### Vale com ressalvas (fazer com critério)
| Item | Fase | Ressalva |
|------|------|----------|
| Vision MCP | 4 | Só se você converter imagem em UI com frequência |
| Performance Engine | 4 | Só quando houver métricas de performance |
| Dependency Intelligence | 4 | Só quando projetos crescerem |

### Não vale agora (descartado/adiado)
| Item | Motivo |
|------|--------|
| Taste Engine | Prematuro, trabalho manual > benefício |
| Psychology Engine | Impracticável sem multimodal |
| Knowledge Graph | Overengineering para 37 agentes |
| Failure Prediction | Especulativo sem dados |
| Code Archaeology | Útil só para projetos legados de terceiros |
| Reality Check | Já existe como red-team |
| Competitive Intel | Já existe como competitor-analyst |
| Experiment Engine | Já existe como experiment-designer |
| Quality Gate | Já existe como release-judge |

---

## Ações Imediatas (o que fazer AGORA)

Se você aprovar este plano, começo pela **FASE 0** na seguinte ordem:

1. ✅ Perfil salvo (já feito)
2. 🟢 **Learning Loop** — adicionar instrução no director
3. 🟢 **Constitution** — extrair princípios, comprimir engineer-method.md
4. 🟢 **Context Bloat** — mover problemas-de-melhora-de-contexto.md
5. 🟢 **Memory.md automático** — ativado

Depois da Fase 0, partimos para Fase 1, 2, 3 em paralelo onde possível.

Quer que eu comece a executar a FASE 0?
