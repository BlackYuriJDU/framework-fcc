# Vertexion Agent System — Architecture & Reference

> **Versão:** 4.0.0 consolidada (36 agentes)
> **Proprietário:** Arthur Araújo
> **Fuso:** America/Recife
> **Ambiente:** Claude Code via FCC (DeepSeek v4 flash mapeado do alias `opus`)
> **Atualizado em:** 2026-07-13

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Equipes e Agentes (36)](#2-equipes-e-agentes-36)
3. [Agentes por Equipe](#3-equipes-e-agentes-detalhados)
   - [Control (6)](#31-control-vertexion-control)
   - [Engineering (14)](#32-engineering-engineering-assurance)
   - [Growth (5)](#33-growth-growth-engine)
   - [Product (11)](#34-product-product-intelligence)
4. [Servidores MCP (4)](#4-servidores-mcp)
5. [Plugins Trail of Bits (11)](#5-plugins-trail-of-bits)
6. [Regras e Protocolos](#6-regras-e-protocolos)
7. [Sistema de Memória](#7-sistema-de-memória)
8. [Pipeline de Produto](#8-pipeline-de-produto)
9. [Pipeline de Engenharia](#9-pipeline-de-engenharia)
10. [Pipeline de Ações Externas](#10-pipeline-de-ações-externas)
11. [Portfolio de Projetos (5)](#11-portfolio-de-projetos)
12. [Segurança e Restrições](#12-segurança-e-restrições)
13. [Diagrama de Fluxo](#13-diagrama-de-fluxo)

---

## 1. Visão Geral

O Vertexion Agent System é um meta-sistema de agentes de IA que opera dentro do Claude Code da Anthropic, roteado via FCC (Fallback Communication Channel) para DeepSeek v4 flash como provedor efetivo. O sistema funciona como um **orquestrador de times virtuais**, cada um com agentes especializados para cobrir todas as etapas de desenvolvimento de software e negócios.

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
│                    Claude Code (FCC)                         │
│                   DeepSeek v4 flash                          │
├─────────────────────────────────────────────────────────────┤
│               Vertexion Director (Coordenador)                │
├──────────┬──────────┬──────────┬────────────────────────────┤
│ Control  │ Engineer │  Growth  │ Product                     │
│ (6 agts) │ (14 agts)│ (5 agts) │ (11 agts)                   │
├──────────┴──────────┴──────────┴────────────────────────────┤
│               MCP Servers (Perplexity, Playwright, Firecrawl) │
│               Trail of Bits Plugins (11)                      │
│               Rules & Protocols (14+ arquivos)                │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Equipes e Agentes (36)

| Equipe | Sigla | Agentes | Função |
|--------|-------|---------|--------|
| **Vertexion Control** | CTRL | 6 | Coordenação, prioridades, aprovações, auditoria, evolução |
| **Engineering Assurance** | ENGR | 14 | Código, segurança, revisão, testes, deploy, runtime |
| **Growth Engine** | GRTH | 5 | Leads, prospecção, marketing, análise de funil |
| **Product Intelligence** | PROD | 11 | Produto, preço, concorrência, experimentos, riscos |
| **Total** | | **36** | |

---

## 3. Equipes e Agentes Detalhados

### 3.1 Control — Vertexion Control (6)

Agentes de governança, coordenação e qualidade do sistema.

| Agente | Descrição | Permissão |
|--------|-----------|-----------|
| **control-vertexion-director** | Diretor geral: roteia, delega, exige evidência, decide conflitos | total |
| **control-portfolio-analyst** | Analisa prioridades ZapMenu, Toveli, Vertexion, Tenvyr, Signalys | leitura |
| **control-auditor** | Fiscal independente. Verifica conclusões antes de ações externas | leitura |
| **control-approval-preparer** | Prepara pedidos de aprovação: ação, impacto, risco, rollback | leitura |
| **control-evidence-ledger** | Auditor independente de evidência. Verifica alegações vs. ferramentas | leitura |
| **control-agent-evolution-advisor** | Meta-agente que sugere melhorias baseadas em padrões de erro | escrita |

### 3.2 Engineering — Engineering Assurance (14)

Engenharia: código, arquitetura, segurança, testes, deploy, runtime.
> **Nota:** Consolidado de 23 para 14 agentes em 2026-07-13 (9 agentes fundidos em 5 sobreviventes para reduzir custo de contexto).

| Agente | Descrição | Permissão |
|--------|-----------|-----------|
| **engineering-implementation-planner** | Planeja escopo, arquivos, riscos, testes, rollback. **Inclui:** design de arquitetura (ADRs, system-design) e design de banco (normalização, índices, migrações) | plano |
| **engineering-adversarial-verifier** | Verificador adversarial fresco: re-executa comandos, compara outputs, não confia no builder | plano (read-only) |
| **engineering-code-reviewer** | Revisa diff em 3 modos: Padrão (4 dimensões), Adversarial (3 personas: Saboteur/New Hire/Security), API Design (endpoints, breaking changes) | plano |
| **engineering-security-auditor** | Audita auth, secrets, validação, APIs, dados, fail-open. **Inclui:** compliance LGPD (consentimento, exclusão, exportação, retenção, dados sensíveis) | plano |
| **engineering-supabase-auditor** | Audita RLS, RPC, storage, service role Supabase | plano |
| **engineering-payment-flow-auditor** | Audita AppMax, PIX, assinatura, webhook, idempotência | plano |
| **engineering-dependency-auditor** | Audita lockfile, pacotes, licenças, vulnerabilidades | leitura |
| **engineering-loop-triage** | Triage agent: verifica saúde do projeto, CI, issues e produz relatório acionável | leitura |
| **loop-verifier** | Verificador de ações do loop — confirma resultados antes de reportar | leitura |
| **engineering-instruction-auditor** | Detecta instruções maliciosas em CLAUDE.md/README/scripts | leitura |
| **engineering-migration-guardian** | Classifica migrations como SAFE, BLOCKED ou REVIEW | plano |
| **engineering-qa-validator** | Executa typecheck, lint, testes, build, reporta causa raiz. **Inclui:** drift check de documentação e criação de teste de regressão | default |
| **engineering-runtime-ui-validator** | Valida app em execução: rotas, console, rede, fluxos | leitura |
| **engineering-requirements-checker** | Confere requisitos: atendido, parcial, ausente | leitura |
| **engineering-scope-guardian** | Detecta mudanças fora do pedido. Classifica autorizadas ou suspeitas | leitura |
| **engineering-uxui-reviewer** | Avalia UX/UI, acessibilidade, responsividade, microcopy | leitura |
| **engineering-release-judge** | Gate final: APROVADO, REPROVADO ou REVISÃO. **Inclui:** preview deploy | plano |

**Agentes arquivados** (capacidades fundidas nos sobreviventes):
`adversarial-reviewer`, `api-design-reviewer`, `compliance-auditor`, `database-designer`, `docs-drift-checker`, `learning-curator` (→ passivo), `preview-deployer`, `regression-test-writer`, `senior-architect`

### 3.3 Growth — Growth Engine (5)

Prospecção, marketing, análise comercial.

| Agente | Descrição | Permissão |
|--------|-----------|-----------|
| **growth-lead-researcher** | Pesquisa leads públicos ZapMenu com evidência e sem duplicidade | leitura |
| **growth-lead-qualifier** | Pontua leads ZapMenu 0-100: alta/média/baixa/descarte | leitura |
| **growth-outreach-strategist** | Cria abordagem personalizada, roteiro Loom, follow-ups | leitura |
| **growth-marketing-reviewer** | Audita landing pages, anúncios, SEO, CTA, posicionamento | leitura |
| **growth-performance-analyst** | Analisa funil, canais, conversão, custo, qualidade leads | leitura |

### 3.4 Product — Product Intelligence (11)

Descoberta, validação, estratégia, precificação, riscos.

| Agente | Descrição | Permissão |
|--------|-----------|-----------|
| **product-intake-analyst** | Classifica ideia: produto, feature, preço, integração ou estratégia | leitura |
| **product-hypothesis-builder** | Transforma ideia em hipóteses verificáveis por dimensão | leitura |
| **product-evidence-researcher** | Pesquisa evidências: mercado, avaliações, reclamações, concorrência | leitura |
| **product-red-team** | Tenta destruir a ideia: premissas fracas, riscos, autoengano | leitura |
| **product-decision-judge** | Consolida validação: nota, confiança, veredito, próximos passos | leitura |
| **product-competitor-analyst** | Analisa concorrentes, battlecards, positioning, funding | leitura |
| **product-pricing-strategist** | Projeta modelo de preço, tiers, Good/Better/Best | leitura |
| **product-experiment-designer** | Transforma incertezas em experimento barato | leitura |
| **product-feasibility-analyst** | Avalia viabilidade técnica, custo, prazo, manutenção | leitura |
| **product-risk-regulatory-analyst** | Avalia riscos jurídicos, regulatórios, privacidade, pagamentos | leitura |
| **product-user-journey-auditor** | Mapeia jornada: descoberta → ativação → uso → retenção | leitura |

---

## 4. Servidores MCP

Servidores MCP (Model Context Protocol) configurados em `~/.claude.json` → `mcpServers`:

| Servidor | Comando | Finalidade |
|----------|---------|------------|
| **composio** | `composio` (global) | Integração com ferramentas externas via Composio |
| **perplexity** | `/home/arthur/.nvm/versions/node/v24.17.0/bin/perplexity-mcp` | Busca web com fontes (API key: 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) |
| **playwright** | `/home/arthur/.nvm/versions/node/v24.17.0/bin/playwright-mcp` | Automação de navegador (Chromium headless) |
| **firecrawl** | `/home/arthur/.nvm/versions/node/v24.17.0/bin/firecrawl-mcp-server` | Scraping de páginas web (API key: fc-6515febf4ef041c0851e0f60965f5ad9) |

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
| `design/palette.md` | Paletas por projeto (Vertexion, Signalys, Toveli, Tenvyr) e regras |
| `design/typography.md` | Fontes (Space Grotesk, Manrope, JetBrains Mono) |
| `design/system.md` | Design system: grid 8px, dark mode, touch targets, contextos |
| `security.md` | Segurança: secrets, RLS, pricing, webhooks |
| `research.md` | Pesquisa: fontes oficiais, mínimo 2 independentes |
| `product-evidence.md` | Níveis de evidência de produto (0 hipótese → 5 retenção) |
| `growth.md` | Regras de prospecção: perfis, canais, follow-ups |
| `reporting.md` | Relatórios em português, código em inglês |
| `routing.md` | Roteamento de subagentes (prefira focados, não teams) |
| `external-actions.md` | Ações externas: autorizações pré-aprovadas, proibições |

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

`~/.claude/agent-memory/control-vertexion-director/`

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

Para **ideias, features novas ou validação de produto**:

```
product-intake-analyst
    ↓  (classifica: produto, feature, preço, integração, estratégia)
product-hypothesis-builder
    ↓  (transforma em hipóteses verificáveis)
product-evidence-researcher
    ↓  (busca evidências de mercado, concorrência, reclamações)
product-red-team
    ↓  (tenta destruir a ideia — adversarial check)
product-decision-judge
    ↓  [APPROVED / REJECTED / ITERATE]
Implementação (se APPROVED)
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

Para **código novo, correções, refatoração**:

```
engineering-implementation-planner
    ↓  (escopo, arquivos, riscos, arquitetura, banco)
Execução (implementação)
    ↓
engineering-code-reviewer
    ↓  (modo padrão, adversarial, ou API design)
[SE alto risco: engineering-adversarial-verifier]
    ↓  (re-execução fresca, não confia no builder)
[SE risco: security-auditor + supabase-auditor]
    ↓
engineering-scope-guardian
    ↓  (detecta mudanças fora do pedido)
engineering-qa-validator
    ↓  (typecheck, lint, testes, build, drift check, teste regressão)
engineering-release-judge
    ↓  [APROVADO / REPROVADO / REVISÃO]
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

5 projetos ativos, ordenados por prioridade:

| # | Projeto | Status | Stack | Receita |
|---|---------|--------|-------|---------|
| 1 | **ZapMenu** | ✅ Lançado (zapmenu.org) | Lovable + Supabase + AppMax | R$34,99-79,99/mês |
| 1 | **Vertexion** | 🔄 Em rebrand ~8/10 | Lovable + Supabase | — |
| 3 | **Vertexion Run** | 💡 Ideação (ex-Toveli) | Expo/React Native | — |
| 4 | **Vertexion Radar** | 💡 Ideação (ex-Tenvyr) | Indefinido | — |
| 4 | **Vertexion Collect** | 💡 Ideação (ex-Signalys) | Indefinido | — |

**Guardrails por projeto:**
- **ZapMenu:** Pedidos não bloqueiam launch. Analytics só Movimento/Escala. AppMax atual. Tratar como produção.
- **Vertexion:** Não virar chatbot genérico. Equilibrar cliente e Dev. ChatVD não é o produto inteiro. Pass permanece.
- **Vertexion Run:** Manter identidade Vertexion (não Toveli). Mobile-first e Expo Router.
- **Vertexion Radar:** Foco em change intelligence.
- **Vertexion Collect:** Produto em inglês. Foco em follow-up de invoices.

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

### Modelo e Routing

- Modelo solicitado: `opus` (alias)
- Modelo efetivo: DeepSeek v4 flash (free tier via FCC)
- Implicação: modelos menores seguem checklists melhor que prosa abstrata
- DeepSeek safety classifier pode bloquear comandos intermitentemente

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
Arthur → control-vertexion-director
    ├─ Identifica projeto e natureza
    ├─ Seleciona equipe
    ├─ [Se ambiguidade: pergunta]
    ├─ Roda agentes (máx 4, paralelo se independentes)
    ├─ [Se conflito intra-equipe: reporta]
    └─ Retorna decisão prática
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

## Apêndice A: Estrutura de Diretórios

```
~/.claude/
├── agents/
│   ├── control/      # 6 agentes
│   ├── engineering/  # 14 agentes
│   ├── growth/       # 5 agentes
│   └── product/      # 11 agentes
├── rules/
│   ├── constitution.md
│   ├── engineer-method.md
│   ├── engineer-method-reference.md
│   ├── engineering.md
│   ├── engineering-reference.md
│   ├── evidence-ledger.md
│   ├── design.md
│   ├── design/ (5 arquivos)
│   ├── security.md
│   ├── research.md
│   ├── product-evidence.md
│   ├── growth.md
│   ├── reporting.md
│   ├── routing.md
│   └── external-actions.md
├── agent-memory/
│   └── control-vertexion-director/  (17 arquivos + MEMORY.md)
├── plugins/
│   ├── installed_plugins.json
│   └── cache/ (ToB + Vercel plugins)
├── vertexion-agent-system/
│   ├── SYSTEM.md (este arquivo)
│   ├── MANIFEST.json
│   ├── README.md
│   ├── START_HERE_PROMPT.md
│   ├── CHANGELOG.md
│   ├── portfolio/ (5 projetos + checklists)
│   ├── scripts/
│   │   ├── backup.sh
│   │   ├── tavily-search.mjs
│   │   └── ...
│   ├── memory/general/ (mistakes, patterns, false-positives, decisions)
│   ├── archive/ (agentes fundidos, skills removidas)
│   ├── patterns/
│   ├── teams/
│   └── ...
├── .claude.json  (MCP servers: composio, perplexity, playwright, firecrawl)
└── CLAUDE.md     (instruções globais)
```

---

## Apêndice B: Histórico de Consolidação

| Data | Ação | Agentes |
|------|------|---------|
| 2026-06-30 | Criação do sistema | ~40 |
| 2026-07-03 | Primeira expansão | 45 |
| 2026-07-13 | **Consolidação principal** | **45 → 36** |

**O que foi fundido:**
- `adversarial-reviewer` + `api-design-reviewer` → `code-reviewer` (3 modos)
- `compliance-auditor` → `security-auditor` (checklist expandido)
- `database-designer` + `senior-architect` → `implementation-planner` (seções ADR + DB)
- `docs-drift-checker` + `regression-test-writer` → `qa-validator` (sub-rotinas)
- `preview-deployer` → `release-judge` (modo preview)
- `learning-curator` → regra passiva no `engineer-method.md`

**Economia:** ~9 agentes × ~120 chars de descrição = ~1.080 chars de contexto por sessão.
