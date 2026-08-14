# Vertexion Agent System — Architecture & Reference

> **Versão:** 8.0.0 (migration branch; v7.1 compatibility retained) (6 leads + 10 control + 3 orquestradores de domínio)
> **Proprietário:** Arthur Araújo
> **Fuso:** America/Recife
> **Ambiente:** Claude Code multi-modelo (provedor varia por sessão; FCC/`/model`)
> **Atualizado em:** 2026-08-08
> **Orquestradores:** Tesla 🔵 (engenharia) · Einstein 🟡 (growth/jurídico/marketing) · Da Vinci 🔴 (design) · Merge (`/orq all`)

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Agentes Reais (16)](#2-agentes-reais-15)
3. [Orquestradores de Domínio](#3-orquestradores-de-domínio)
   - [Tesla (engenharia + auto-melhoria)](#31-tesla-engenharia--auto-melhoria)
   - [Einstein (growth + jurídico + marketing)](#32-einstein-growth--jurídico--marketing)
   - [Da Vinci (design)](#33-da-vinci-design)
   - [Modo Merge](#34-modo-merge)
4. [Servidores MCP (4)](#4-servidores-mcp)
5. [Plugins Trail of Bits (11)](#5-plugins-trail-of-bits)
6. [Regras e Protocolos](#6-regras-e-protocolos)
7. [Sistema de Memória](#7-sistema-de-memória)
8. [Pipeline de Produto](#8-pipeline-de-produto)
9. [Pipeline de Engenharia](#9-pipeline-de-engenharia)
10. [Pipeline de Ações Externas](#10-pipeline-de-ações-externas)
11. [Portfolio de Projetos (2)](#11-portfolio-de-projetos)
12. [Segurança e Restrições](#12-segurança-e-restrições)
13. [Diagrama de Fluxo](#13-diagrama-de-fluxo)

---

## 1. Visão Geral

O Vertexion Agent System é um meta-sistema de agentes de IA que opera dentro do Claude Code da Anthropic. É **agnóstico a provedor**: o modelo efetivo varia por sessão (via `/model` ou fallback do FCC), com perfis de comportamento conforme a capacidade do modelo em uso. O sistema funciona como um **orquestrador de times virtuais**, cada um com agentes especializados para cobrir todas as etapas de desenvolvimento de software e negócios.

### Filosofia Operacional

- **Nada é concluído sem evidência verificável** (Evidence Ledger Protocol)
- **Cirurgia, não amputação** — menor alteração correta
- **Simplicidade primeiro** — sem abstração especulativa
- **Fato, não suposição** — tudo é verificado no código real
- **Discordar ativamente** — Arthur não quer yes-man, exige opinião crítica

### Princípios da Constituição

1. Pense antes de codificar
2. Simplicidade primeiro
3. Cirurgia, não amputação
4. Fato, não suposição
5. Aprendizado contínuo
6. Evidência antes de conclusão

### Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│              Claude Code (multi-modelo)                       │
│        provedor varia por sessão (/model | FCC)               │
├─────────────────────────────────────────────────────────────┤
│    Orquestradores de domínio (via /orq)                       │
│    ┌────────┐ ┌────────┐ ┌────────┐  ┌────────────────┐      │
│    │ Tesla  │ │Einstein│ │Da Vinci│  │  MERGE /orq all│      │
│    │ 🔵 eng │ │🟡 growth│ │🔴 des │  │  3 orqs juntos │      │
│    │auto-mel│ │jur/mkt │ │  sign  │  │  (protocolo)   │      │
│    └────────┘ └────────┘ └────────┘  └────────────────┘      │
├──────────┬──────────┬──────────┬────────────────────────────┤
│ 6 leads  │ 9 control│ plugins  │  (nenhum agente sem orq)    │
├──────────┴──────────┴──────────┴────────────────────────────┤
│               MCP Servers (Perplexity, Playwright, Firecrawl) │
│               Plugins (Vercel, Trail of Bits, superpowers)    │
│               Rules & Protocols (rules/)                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Agentes Reais (16)

Inventário real no disco (6 leads + 9 control agents). Os agentes de equipe v5/v6 (engineering-*, growth-*, product-*) **não existem como arquivos** — foram arquivados em `archive/agents-v5/`. Os orquestradores delegam exclusivamente aos leads e control agents listados abaixo.

### 2.1 Leads (equipes) — `~/.claude/agents/`

| Lead | Equipe | Escopo |
|------|--------|--------|
| `dev-lead` | DEV | Código, arquitetura, segurança, deploy, QA, Supabase, pagamentos |
| `design-lead` | Design | UI/UX, design system, branding, acessibilidade, protótipos |
| `marketing-lead` | Marketing | Prospecção, conteúdo, campanhas, growth, funil |
| `financas-lead` | Finanças | Pricing, custos, receita, modelo financeiro, evidência |
| `juridico-lead` | Jurídico | Compliance, contratos, LGPD, riscos legais |
| `operacoes-lead` | Operações | Portfólio, prioridades, aprovações, auditoria, evolução |

### 2.2 Control — `agents/control/`

| Agente | Descrição | Permissão |
|--------|-----------|-----------|
| **control-tesla** | Orquestrador Tesla: engenharia de código + auto-melhoria (sempre ultrathink2) | total |
| **control-einstein** | Orquestrador Einstein: growth + jurídico + marketing | total |
| **da-vinci** | Orquestrador Da Vinci: design front-end | total |
| **control-portfolio-analyst** | Analisa prioridades ZapMenu e Firmis | leitura |
| **control-auditor** | Fiscal independente. Verifica conclusões antes de ações externas | leitura |
| **control-approval-preparer** | Prepara pedidos de aprovação: ação, impacto, risco, rollback | leitura |
| **control-evidence-ledger** | Auditor independente de evidência. Verifica alegações vs. ferramentas | leitura |
| **control-agent-evolution-advisor** | Meta-agente que sugere melhorias baseadas em padrões de erro | escrita |
| **loop-verifier** | Verificador de ações do loop (autoloop) — confirmador independente (CHECKER) | leitura |
| **control-evaluator** | Avalia o resultado final contra o Task Contract; não implementa | leitura |

> **v7.1:** `loop-verifier` foi movido para `agents/control/` (antes em `vertexion-agent-system/.claude/agents/`) — era a única exceção de agente sem orq. Agora é propriedade primária do Tesla via `/autoloop`.

---

## 3. Orquestradores de Domínio

Switch via `/orq <id> [nivel]`; ativação mid-chat por menção ao nome no texto; nível default `médio`. Detalhe: `docs/levels.md`, `skills/orq/`.

### 3.1 Tesla — engenharia + auto-melhoria

- **Cor:** 🔵 azul. **ID/skill/agent:** `tesla` / `tesla` / `control-tesla`.
- **Substitui** `vertexion-director`. Foco: engenharia de código, segurança, revisão, QA, deploy, Supabase, pagamentos **e auto-melhoria** (Karpathy Loop via `/autoloop`).
- **Opera SEMPRE em ultrathink2** (`~/.claude/rules/ultrathink2.md`).
- Delegáveis: `dev-lead`, `operacoes-lead`, `control-agent-evolution-advisor`, `control-approval-preparer`, `control-auditor`, `control-evidence-ledger`, `control-portfolio-analyst`, `loop-verifier`.

### 3.2 Einstein — growth + jurídico + marketing

- **Cor:** 🟡 amarelo. **ID/skill/agent:** `einstein` / `einstein` / `control-einstein`.
- **Substitui** `zapmenu-activity`. Foco: prospecção (pipeline ZapMenu RESEARCH→QUALIFY→CRAFT→SEND), marketing, jurídico (compliance, LGPD, contratos), finanças de produto (pricing).
- Absorve o **Founder's Playbook** (Anthropic) + awesome-gtm-engineering.
- Delegáveis: `marketing-lead`, `financas-lead`, `juridico-lead`, `operacoes-lead`, `dev-lead` + 5 control agents.

### 3.3 Da Vinci — design

- **Cor:** 🔴 vermelho. **ID/skill/agent:** `da-vinci` / `da-vinci` / `da-vinci`.
- **Mantido** da v7. Foco: UI/UX, animações, design systems, prototipação. Sem back-end, sem lógica de servidor.
- Ganhou conhecimento: `superdesigndev/superdesign` + `VoltAgent/awesome-design-md` (passo REFERENCE).

### 3.4 Modo Merge

- **Ativação:** `/orq all`. **NÃO muda o active agent** — imprime o protocolo (`docs/merge.md` + `skills/orq/merge-mode.md`).
- A sessão principal coordena: parseia o job em escopos por domínio (com métrica de sucesso por domínio) → despacha `Agent(control-tesla)`, `Agent(control-einstein)`, `Agent(da-vinci)` em paralelo → cada um escreve `reports/merge-<ts>/<dominio>/DELIVERABLE.md` → auditoria de costuras → integra em `INTEGRATED.md` → nada sai sem aprovação de Arthur.

---

## 4. Servidores MCP

Servidores MCP (Model Context Protocol) configurados em `~/.claude.json` → `mcpServers`:

| Servidor | Comando | Finalidade |
|----------|---------|------------|
| **composio** | `composio` (global) | Integração com ferramentas externas via Composio |
| **perplexity** | `/home/arthur/.nvm/versions/node/v24.17.0/bin/perplexity-mcp` | Busca web com fontes (chave: PERPLEXITY_API_KEY — ver ~/.claude/.env) |
| **playwright** | `/home/arthur/.nvm/versions/node/v24.17.0/bin/playwright-mcp` | Automação de navegador (Chromium headless) |
| **firecrawl** | `/home/arthur/.nvm/versions/node/v24.17.0/bin/firecrawl-mcp-server` | Scraping de páginas web (chave: FIRECRAWL_API_KEY — ver ~/.claude/.env) |

**Nota:** Node.js via nvm em `/home/arthur/.nvm/versions/node/v24.17.0/bin/`. Playwright Chromium instalado em `~/.cache/ms-playwright/chromium-1228/` com dependências de sistema parcialmente disponíveis (sem sudo para libnspr4 etc., mas headless funciona).

---

## 5. Plugins Trail of Bits

11 plugins de segurança instalados via `claude plugin install` do marketplace Trail of Bits. Foco em análise de segurança complementar aos auditores nativos.

| Plugin | Versão | Função |
|--------|--------|--------|
| **constant-time-analysis** | 0.1.1 | Análise de tempo constante (side-channel) |
| **static-analysis** | 1.2.2 | Análise estática geral |
| **semgrep-rule-creator** | 1.2.2 | Criação de regras Semgrep para o código |
| **differential-review** | 1.1.1 | Revisão diferencial de segurança |
| **variant-analysis** | 1.0.1 | Análise de variantes de vulnerabilidades |
| **supply-chain-risk-auditor** | 1.0.1 | Auditoria de risco de supply chain |
| **sharp-edges** | 1.1.1 | Detecção de bordas afiadas (edge cases perigosos) |
| **insecure-defaults** | 1.0.1 | Identificação de defaults inseguros |
| **fp-check** | 1.0.3 | Checagem de falsos positivos |
| **audit-context-building** | 1.1.1 | Construção de contexto para auditoria |
| **testing-handbook-skills** | 1.0.2 | Habilidades do handbook de testes |

---

## 6. Regras e Protocolos

### 6.1 Arquivos de Regras em `~/.claude/rules/`

| Arquivo | Conteúdo |
|---------|----------|
| `constitution.md` | 6 princípios fundamentais de engenharia |
| `engineer-method.md` | Protocolo Mestre: verificação de impulso, 10 passos, 5 camadas, GCOT, ToT, Evidence Ledger, aprendizado contínuo |
| `engineer-method-reference.md` | Referência detalhada: decisões, tarefas grandes, Karpathy, padrões |
| `engineering.md` | 10 protocolos passivos (code-review, debug, deploy, docs, incident, standup, tech-debt, testing) |
| `engineering-reference.md` | Detalhamento dos 10 protocolos |
| `evidence-ledger.md` | Protocolo de evidência: fontes, níveis de confiança 🔵🟢🟡🔴, falsificação adversarial |
| `design.md` | Decisões de UI/UX (aponta para `design/` sub-arquivos) |
| `design/checklist.md` | Checklist pré-delivery (SVG, cursor, contraste, focus, reduced-motion, breakpoints) |
| `design/anti-patterns.md` | Anti-patterns por indústria (tech, finanças, saúde, e-commerce, beleza, restaurantes) |
| `design/palette.md` | Paletas por projeto (ZapMenu, Firmis) e regras |
| `design/typography.md` | Fontes (Space Grotesk, Manrope, JetBrains Mono) |
| `design/system.md` | Design system: grid 8px, dark mode, touch targets, contextos |
| `security.md` | Segurança: secrets, RLS, pricing, webhooks |
| `research.md` | Pesquisa: fontes oficiais, mínimo 2 independentes |
| `product-evidence.md` | Níveis de evidência de produto (0 hipótese → 5 retenção) |
| `growth.md` | Regras de prospecção: perfis, canais, follow-ups |
| `reporting.md` | Relatórios em português, código em inglês |
| `routing.md` | Roteamento de subagentes (prefira focados, não teams) |
| `external-actions.md` | Ações externas: autorizações pré-aprovadas, proibições |
| `ask-mode.md` | Protocolo `ultraask` — perguntas exaustivas antes de agir |
| `ultrathink2.md` | Protocolo `ultrathink2` — raciocínio profundo (J-Space, GCOT expandido, verificação multi-camada) |

### 6.2 Protocolos Comportamentais

- **GCOT** (Guided Chain of Thought): `<plan>` → `<execute>` → `<verify>` tags para tarefas complexas
- **Tree of Thoughts**: 3 opções distintas antes de decisão arquitetural
- **Evidence Ledger**: fonte exata + nível de confiança + falsificação adversarial
- **Karpathy 4 Princípios**: think first, simplicity, surgical changes, goal-driven
- **Análise em 5 Camadas**: literal → estrutural → comportamental → risco → solução
- **Aprendizado Contínuo**: ler mistakes.md antes, registrar aprendizado depois

---

## 7. Sistema de Memória

O sistema mantém 3 camadas de memória persistente:

### 7.1 Agente-Memória (Cross-Session)

`~/.claude/agent-memory/control-tesla/` (movido de `control-vertexion-director` na v7.1 — preserva linhagem)

Memórias de longo prazo sobre Arthur e o projeto. Indexadas por `MEMORY.md`.

| Arquivo | Tipo | Conteúdo |
|---------|------|----------|
| `user-arthur-profile.md` | user | Perfil: 16 anos, PE, estilo direto, excepcional tecnicamente |
| `feedback_batch_execution_detailed_report.md` | feedback | Execução batch com relatório final |
| `feedback_deepseek_strict_execution.md` | feedback | Protocolo obrigatório em pedidos grandes |
| `feedback_disagree_and_push_back.md` | feedback | Discordar ativamente, não ser yes-man |
| `feedback-skill-to-agent-conversion.md` | feedback | Converter skills em agentes ou regras passivas |
| `project_zapmenu_mega_correcao_jul2026.md` | project | 29 arquivos, rede→escala, boleto removido |
| `project_agent_system_expansion.md` | project | 5 novos agentes, coordination-patterns |
| `project-evidence-ledger.md` | project | Evidence Ledger, constitution #6, GCOT, ToT |
| `project-mcp-tob-setup.md` | project | Perplexity, Playwright, Firecrawl MCPs + 11 ToB plugins |
| `reference-agent-consolidation-plan.md` | reference | Consolidação 45→34 agentes |
| `auth-audit-env-cleanup-success.md` | project | 5 problemas de auth, 4 corrigidos |

### 7.2 Memória Geral (Técnica)

`~/.claude/vertexion-agent-system/memory/general/`

Erros, acertos e decisões técnicas.

| Arquivo | Conteúdo |
|---------|----------|
| `mistakes.md` | Erros cometidos (para não repetir) |
| `successful-patterns.md` | Padrões que funcionaram bem |
| `false-positives.md` | Falsos positivos de segurança/revisão |
| `decisions.md` | Decisões arquiteturais importantes |
| `tanstack-start-server-functions.md` | Notas sobre TanStack Start |

### 7.3 Memória de Projeto (Contexto de Sessão)

`~/.claude/projects/-mnt-c-Users-Arthur-Ara-jo/memory/`

Memórias do escopo do projeto atual. Inclui migrações, resultados de prospecção, planos.

---

## 8. Pipeline de Produto

Para **ideias, features novas ou validação de produto** — orquestrado pelo **Einstein** (delega a `financas-lead` / `juridico-lead` / `marketing-lead`):

```
Einstein (control-einstein)
    ↓  (parseia o pedido; identifica natureza do produto)
financas-lead (evidência de mercado, pricing, viabilidade)
    ↓  (níveis de evidência 0–5)
juridico-lead (riscos jurídicos, LGPD, compliance)
    ↓
marketing-lead (posicionamento, concorrência, funil)
    ↓  [evidência + aprovação antes de qualquer ação]
```

**Níveis de Evidência de Produto:**
- Nível 0: Hipótese
- Nível 1: Sinais web
- Nível 2: Problema confirmado
- Nível 3: Compromisso
- Nível 4: **Pagamento** (único que valida)
- Nível 5: Retenção

---

## 9. Pipeline de Engenharia

Para **código novo, correções, refatoração** — orquestrado pelo **Tesla** (sempre ultrathink2; delega a `dev-lead`, verificação a `control-auditor`/`loop-verifier`):

```
Tesla (control-tesla)  — ultrathink2
    ↓  (define escopo, arquivos, riscos, testes, rollback)
dev-lead  (implementação)
    ↓
control-auditor / loop-verifier  (revisão fresca, não confia no builder)
    ↓  [SE risco: security checklist + plugins ToB/semgrep]
control-evidence-ledger  (evidência file:line)
    ↓  [SE ação externa: control-approval-preparer + Arthur]
Aprovação explícita → execução

### v8 Evaluation Gate

Após uma execução bem-sucedida, o runtime cria/atualiza `tasks/<task-id>/STATE.json`, registra eventos e dispara o `control-evaluator` em contexto separado. Resultado: PASS → FINALIZE; PARTIAL/FAIL → REVIEW.
```

**Simulação pré-código (parte do planner):**
1. Happy path completo
2. Falhas possíveis em cada etapa
3. Cenários: sucesso / pendente / recusado / erro servidor
4. Impacto em outros componentes
5. State inconsistente (processo morre no meio)

---

## 10. Pipeline de Ações Externas

Para **deploy, PR, migration remota, envio, gasto, dados reais**:

```
control-auditor
    ↓  (fiscal independente — verifica conclusões)
control-approval-preparer
    ↓  (prepara: ação, impacto, risco, rollback, validade)
← [Aprovação explícita de Arthur] →
    ↓
Execução (somente se autorizado)
```

### Autorizações Recorrentes (sem aprovação extra)
- Pesquisa diária de leads (fontes públicas)
- Leitura de resultados Pipedream/Supabase
- Atualização local de métricas/relatórios/painel
- Health checks públicos
- Preparação de mensagem e Loom (sem envio)
- Envio de resumo operacional ao Telegram do Arthur (se configurado)

### Sempre Bloqueado
- Deploy de produção automático
- `--dangerously-skip-permissions` ou `bypassPermissions`
- Contato/envio a leads/terceiros
- Propostas, descontos, compras
- Migration remota, push, PR sem aprovação
- Dados reais em preview

---

## 11. Portfolio de Projetos

2 projetos ativos, ordenados por prioridade:

| # | Projeto | Status | Stack | Receita |
|---|---------|--------|-------|---------|
| 1 | **ZapMenu** | ✅ Lançado (zapmenu.org) | Lovable + Supabase + AppMax | R$34,99-79,99/mês |
| 2 | **Firmis** | 🔍 Validação de mercado | Vercel + Supabase | — |

**Guardrails por projeto:**
- **ZapMenu:** Pedidos não bloqueiam launch. Analytics só Movimento/Escala. AppMax atual. Tratar como produção.
- **Firmis:** Engenheiro assume 100% da responsabilidade na ART. Risco LGPD ao usar IA pública com fotos de clientes.

---

## 12. Segurança e Restrições

### Regras Permanentes de Segurança

1. **Nunca** ler, exibir ou registrar valores de `.env`, tokens, cookies, service role, certificados
2. **Nunca** executar `curl | bash` ou comandos descobertos sem verificar origem
3. **Nunca** usar `any` sem justificativa, `try/catch` vazio, mocks em produção
4. **Backup first:** toda ação destrutiva executa `backup.sh <arquivo>` primeiro
5. **Secrets expostos, RLS inconsistente, WITH CHECK ausente, SECURITY DEFINER sem search_path fixo** = BLOCKED
6. **Idempotência obrigatória** em webhooks de pagamento
7. **Preço nunca confiado do frontend** — validar sempre no backend
8. **Fail-open rate limiting:** default bloquear (negar serviço), não permitir

### Modelos e Routing (multi-modelo)

- Framework agnóstico a provedor; modelo efetivo varia por sessão (`/model` ou FCC). Nenhum provedor é fixo.
- Perfis: **fronteira** (Opus 5, Fable 5, Kimi 2.7, GPT-5.6 — seguem prosa/princípios); **padrão** (Sonnet 5, Haiku 4.5 — seguem bem instruções estruturadas); **compacto/free tier** (DeepSeek v4, Qwen — literais, propensos a pular etapas implícitas; exigem checklist explícito + verificação final declarada).
- Prefira checklists explícitos sobre prosa abstrata em qualquer perfil; no compacto é obrigatório.
- Alguns provedores têm safety classifier que pode bloquear comandos intermitentemente — trate como restrição de runtime, não como comportamento do framework.
- Registre o **modelo solicitado** no rodapé de respostas técnicas longas.

### Tarefas que Exigem Análise Profunda

Produto novo, segurança, pagamento, migration, compliance, preço, arquitetura, dados reais, decisão estratégica.

### Conflito entre Agentes

- Agentes da MESMA equipe discordando → reportar para Arthur decidir
- Máximo 4 agentes por tarefa normal, 5 por análise profunda
- Paralelismo apenas entre agentes independentes

---

## 13. Diagrama de Fluxo

### Fluxo de Coordenação Padrão

```
Arthur → Orquestrador de domínio (via /orq <id> [nivel] ou menção no texto)
    ├─ Identifica domínio: engenharia (Tesla) | growth/jur/mkt (Einstein) | design (da-vinci)
    ├─ [Multi-domínio → /orq all (modo merge)]
    ├─ Seleciona leads/control agents dentro do domínio
    ├─ [Se ambiguidade: pergunta]
    ├─ Roda agentes (máx conforme nível, paralelo se independentes)
    ├─ [Se conflito intra-equipe: reporta]
    └─ Retorna decisão prática com evidência file:line
```

### GCOT para Tarefas Complexas

```
<plan>     → Estado atual, abordagem, arquivos-alvo, riscos
<execute>  → Implementação exata do plano
<verify>   → Validação contra evidência real
[Se falhar → voltar ao <plan>]
```

### Tree of Thoughts

```
Problema → Opção A / Opção B / Opção C
    ↓ (avaliar cada por: simplicidade, risco, impacto, manutenção)
    ↓
Melhor ramo → Executar
[Se impasse → expandir o mais promissor]
```

### Evidence Ledger

```
Conclusão técnica
    ↓
[Evidência: arquivo:linha] afirmação
[Evidência: comando: saída] confirmação
[Confiança: 🔵🟢🟡]
    ↓
Tentar FALSIFICAR a conclusão
[Se contradito: 🔴 + atualizar]
    ↓
Reportar
```

---

## Apêndice A: Estrutura de Diretórios (v7.1)

```
~/.claude/
├── agents/                 # 6 leads reais (dev, design, marketing, financas, juridico, operacoes)
├── agent-memory/           # memória histórica por agente
│   ├── control-tesla/      # (renomeado de control-vertexion-director — preserva linhagem)
│   └── ...                 # control-einstein, design-lead, control-evidence-ledger, leads
├── rules/                  # protocolos sob demanda (MANDATORY, cognition, security, growth, ...)
├── skills/                 # 8 skills de domínio
│   ├── tesla/              # engenharia + auto-melhoria (SEMPRE ultrathink2)
│   ├── einstein/           # growth + jurídico + marketing
│   ├── da-vinci/           # design front-end
│   ├── autoloop/           # Karpathy Loop (dono: Tesla)
│   ├── orq/                # ativação de orquestradores (+ merge-mode.md)
│   ├── zapmenu/            # pipeline de prospecção ZapMenu
│   ├── design-lead/
│   └── find-skills/
├── vertexion-agent-system/
│   ├── SYSTEM.md (este arquivo)
│   ├── MANIFEST.json       # v7.1.0 (15 agents, 8 skills)
│   ├── README.md
│   ├── START_HERE_PROMPT.md
│   ├── CHANGELOG.md
│   ├── AGENTS.md
│   ├── agents/control/     # 9 control agents (incl. loop-verifier movido)
│   ├── orchestrators/
│   │   └── registry.json   # version 3 (tesla/einstein/da-vinci + level)
│   ├── knowledge/
│   │   ├── tesla/          # repos curados + pointers.md
│   │   ├── einstein/
│   │   └── da-vinci/
│   ├── docs/               # versoes.md (autoridade), levels.md, merge.md, ...
│   ├── reports/merge-*/    # artefatos do modo merge (DELIVERABLE/INTEGRATED)
│   ├── scripts/
│   │   ├── backup.sh
│   │   ├── orq.sh          # ativação + níveis + `all` + `--focus`
│   │   ├── sync-knowledge.sh  # clone curado (--check = dry-run R$0)
│   │   └── ...
│   ├── memory/general/     # mistakes, patterns, false-positives, decisions
│   ├── portfolio/          # ZapMenu + Firmis
│   ├── patterns/
│   ├── teams/
│   └── archive/            # agentes fundidos, skills removidas
├── plugins/
│   ├── installed_plugins.json
│   └── cache/ (ToB + Vercel plugins)
├── .claude.json  (MCP servers: composio, perplexity, playwright, firecrawl)
└── CLAUDE.md     (instruções globais)
```

---

## Apêndice B: Histórico de Consolidação

| Data | Ação | Agentes |
|------|------|---------|
| 2026-06-30 | Criação do sistema | ~40 |
| 2026-07-03 | Primeira expansão | 45 |
| 2026-07-13 | Consolidação principal | 45 → 36 |
| 2026-07-15 | **Correção 5.0.0 Fases 1-4** | **36 → 42** (+3 correção dead refs, +3 sub-diretores) |

**O que foi fundido:**
- `adversarial-reviewer` + `api-design-reviewer` → `code-reviewer` (3 modos)
- `compliance-auditor` → `security-auditor` (checklist expandido)
- `database-designer` + `senior-architect` → `implementation-planner` (seções ADR + DB)
- `docs-drift-checker` + `regression-test-writer` → `qa-validator` (sub-rotinas)
- `preview-deployer` → `release-judge` (modo preview)
- `learning-curator` → regra passiva no `engineer-method.md`

**Economia:** ~9 agentes × ~120 chars de descrição = ~1.080 chars de contexto por sessão.


---

# FCC v8 — Contract-Driven Agent Operating System

The v8 migration changes the operational unit from an agent prompt to a **Task Contract**. The v7.1 orchestrators remain the domain identity, while runtime state, evaluation and policy become first-class.

`INTAKE → CONTRACT → CONTEXT → PLAN → EXECUTE → VERIFY → EVALUATE → FINALIZE`

- Tesla: Engineering & Reliability.
- Einstein: Business Intelligence & Growth.
- Da Vinci: Product Experience.
- Builder ≠ Reviewer ≠ Evaluator.
- `tasks/` stores task state; `memory/` stores durable learning; `knowledge/` stores references; `state/control-center/` stores runtime events.
- Active runtime must resolve orchestrators from `orchestrators/registry.json`, not hardcode legacy agents.
