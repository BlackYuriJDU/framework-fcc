# Versões do Framework FCC

> Histórico de versões do framework `~/.claude/` — o que mudou entre v5, v6, v7 e v7.1.
> Este arquivo é a fonte de verdade do contexto de versão. **Versão atual: v7.1.**

---

## v7.1 — Três orquestradores de domínio (2026-08-08)

**Cabeçalho SYSTEM.md:** `7.1.0 (6 leads + 9 control + 3 orquestradores de domínio)`. Repositório oficial: `BlackYuriJDU/framework-fcc`.

### Arquitetura
- **3 orquestradores de domínio** (nomes de inventores + cores + níveis de uso):
  - `vertexion-director` → **Tesla** (🔵 azul, agent `control-tesla`) — engenharia de código + auto-melhoria; opera SEMPRE em ultrathink2; dono do `/autoloop` (Karpathy Loop).
  - `zapmenu-activity` → **Einstein** (🟡 amarelo, agent `control-einstein`) — growth + jurídico + marketing; absorve pipeline de prospecção ZapMenu + Founder's Playbook (Anthropic).
  - `da-vinci` (🔴 vermelho) — mantido, design front-end; ganhou conhecimento (superdesign, awesome-design-md).
- **Modo merge** (`/orq all`): protocolo no chat principal coordenando os 3 orqs em `reports/merge-<ts>/<dominio>/DELIVERABLE.md` + `INTEGRATED.md`; nada sai sem aprovação.
- **Níveis de uso** (baixo/médio/alto/máximo, default médio) por orq em `registry.json` (version 3); semântica em `docs/levels.md`.
- **Ativação mid-chat por nome** (tags Tesla/Einstein/Da Vinci no texto) + invocação direta `/tesla`, `/einstein`, `/da-vinci`, `/autoloop`.
- **Nenhum agente sem orq**: `loop-verifier` movido de `vertexion-agent-system/.claude/agents/` para `agents/control/` (dono: Tesla).
- Skills: dirs `skills/vertexion-director`→`tesla`, `skills/zapmenu-activity`→`einstein`; nova `skills/autoloop/`; subpipelines remapeados por domínio.

### Conhecimento
- `knowledge/{tesla,einstein,da-vinci}/` com repos curados (shallow clone) + `pointers.md` por URL para repositórios grandes (semgrep, codeql, biome, oxc) e já-downloadados (superpowers, claude-audit, minimal-diff).
- `scripts/sync-knowledge.sh` — idempotente, `--check` (dry-run R$0); clone real requer aprovação.

### Registry e wiring
- `orchestrators/registry.json` version 3 com schema por orq (`level` incluso).
- `scripts/orq.sh` estendido: `<id> [nivel]`, `all`, `--focus <id> [nivel]`.
- `agent-memory/control-vertexion-director/` → `agent-memory/control-tesla/` (preserva linhagem).
- `~/.claude/agents/*.md` (6 leads) atualizados para apontar ao orq correto.
- `CLAUDE.md` ≤ 60 linhas com skills tesla/einstein/autoloop + keywords mid-chat.

### Invariante de identidade (4 pontos de sincronia)
`registry.json` id ↔ dir da skill ↔ stem do control agent file ↔ campo `agent` do settings.json. Após cada mudança, os 4 devem concordar.

---

## v5 — Vertexion Agent System 5.0.0 (legado)

**Cabeçalho SYSTEM.md:** `5.0.0 (42 agentes + 3 sub-diretores)`.

### Arquitetura
- **3 sub-diretores (leads):** `engineering-lead`, `growth-lead`, `product-lead` (em `agents/`)
- **33 agentes** organizados em diretórios por equipe: `engineering/`, `growth/`, `product/`
- **4 equipes** documentadas em `teams/` (diretório `teams/` existe no v5)
- **6 skills on-demand** listadas no AGENTS.md

### Portfólio
- 5 projetos ativos no `projects.json`: **Vertexion** (produto), **Run**, **Radar**, **Collect**, **ZapBot** — além de nomes legados (Owlar, Infynest, Toveli, Tenvyr, Signalys) citados no CLAUDE.md
- Prioridade documentada: Run como desenvolvimento principal

### Problemas conhecidos (corrigidos na v7)
- Chaves de API **hardcoded** em arquivos `.md` (Perplexity/Firecrawl no SYSTEM.md; Resend/Tavily no zapmenu-activity.md) — expostas no histórico git
- Modelo efetivo declarado como **DeepSeek v4 flash exclusivo** (único provedor) → **superado na v7**: framework multi-modelo, agnóstico a provedor
- Conflito: SYSTEM.md dizia `42 agentes` mas o sistema real já divergia
- Apêndice A referenciava `teams/` (inconsistente)

---

## v6 — Transição (6 equipes)

**Sistema real v6.1, 6 equipes.**

### Arquitetura
- **6 leads stub** em `~/.claude/agents/`: `dev-lead`, `design-lead`, `marketing-lead`, `financas-lead`, `juridico-lead`, `operacoes-lead`
- **8 control agents** em `~/.claude/vertexion-agent-system/agents/control/` (control-auditor, control-approval-preparer, control-evidence-ledger, control-portfolio-analyst, control-agent-evolution-advisor + orquestradores)
- `additionalAgentDirectories` no `settings.json` apontando para `agents/control/`
- **3 orquestradores:** `vertexion-director`, `zapmenu-activity`, `da-vinci` (registry.json, version 2)

### Problemas conhecidos
- **Agentes de equipe v6** (dev-planner, dev-reviewer, mkt-researcher, etc.) **NÃO existem como arquivos** — os leads stub referenciavam agentes fantasmas
- Leads v5 (engineering/growth/product-lead) **ainda existiam** ao lado dos leads v6 → arquitetura duplicada competindo
- Orquestradores ainda delegavam aos leads **v5** (`tools: Agent(...engineering-lead, growth-lead, product-lead)`)

---

## v7 — Versão Atual (em andamento)

**Plano:** `~/.claude/plans/vamos-trabalhar-no-framework-bubbly-kettle.md` — 8 fases de limpeza + correção + nova versão.

### Objetivos
- Portfólio **só ZapMenu + Firmis** (remove Vertexion produto, Run, Radar, Collect, ZapBot e todos os nomes antigos)
- Framework multi-modelo — agnóstico a provedor
- Orquestradores enriquecidos absorvendo conhecimento das versões anteriores
- Segurança de credenciais: `.env` exclusivo do framework
- Skills novas (`ultraask`, `ultrathink2`) e eficiência de tokens

### Alterações realizadas (com evidência)

**Fase 0 — Backup:**
- Backup do sistema em `~/.claude/backups/framework-pre-v2-20260805.tar.gz` (ou equivalente gerado pela Fase 0)

**Fase 1 — Limpeza de portfólio:**
- `portfolio/projects.json` — removidos vertexion, run, radar, collect, zapbot; adicionado **firmis**
- `CLAUDE.md` — seção Portfólio/Produtos reescrita: só ZapMenu + Firmis
- `SYSTEM.md` — tabela de 5 projetos → tabela de 2
- `portfolio/PRODUCT_DECISIONS.md` — removidas menções a Run/Radar/Collect/Vertexion/ZapBot
- `scripts/sync-framework.py` — removido rebrand Toveli/Tenvyr/Signalys
- `skills/vertexion-director/SKILL.md` — "ecossistema de 2 projetos"
- `skills/zapmenu/SKILL.md` — removida seção de outros projetos
- `orchestrators/registry.json` — só ZapMenu + Firmis

**Fase 2 — Correção de contradições (em andamento):**
- **Segurança de credenciais:**
  - Criado `~/.claude/.env` **exclusivo do framework** (chmod 600) com: PERPLEXITY_API_KEY, FIRECRAWL_API_KEY, RESEND_API_KEY, TAVILY_API_KEY
  - `SYSTEM.md` linhas 181/183 — chaves hardcoded substituídas por referência `(chave: NOME — ver ~/.claude/.env)`
  - `zapmenu-activity.md` — credenciais Resend/Tavily removidas do corpo do arquivo, agora referenciam `~/.claude/.env` por nome de variável
  - `.gitignore` já excluía `*.env`
- **6 leads v6 enriquecidos** (somar antes de excluir): cada lead stub agora herda o conhecimento do lead v5 correspondente:
  - `dev-lead` ← engineering-lead v5 (matriz de roteamento, critérios de risco)
  - `design-lead` ← engineering-uxui-reviewer v5 (checklist UX/UI) + design-lead v6
  - `marketing-lead` ← growth-lead v5 (matriz de qualificação, ofertas, canais)
  - `financas-lead` ← product-lead v5 (evidência de mercado, níveis) + pricing v6
  - `juridico-lead` ← product-lead v5 (guardrails) + compliance/LGPD v6
  - `operacoes-lead` ← Vertexion Control v5 (6 agentes de controle) + pipeline v6
- **3 orquestradores reescritos** (conteúdo v5/v6 somado):
  - `control-vertexion-director` — agora delega aos **6 leads v6** (antes v5); somou matriz de roteamento v5; pipelines por equipe
  - `da-vinci` — removido produto "Vertexion" (#14151C) do design system (fora do portfólio); somou checklist UX/UI + anti-patterns v5; design system só ZapMenu + Firmis
  - `zapmenu-activity` — credenciais → `.env`; somou growth v5 (matriz de qualificação, ofertas, canais) + marketing v6 (funil); passo APROVAÇÃO explícito antes de SEND
- **Leads v6 e control agents: `tools:` corrigidos** — orquestradores não referenciam mais leads v5

**Fase 3 — Multi-modelo (concluída):**
- `CLAUDE.md` — seção `## Modelo` → `## Modelos e Provedores (multi-modelo)`: perfis (fronteira / padrão / compacto), regras por perfil, "registrar modelo solicitado" no lugar de "provedor efetivo fixo"
- `skills/vertexion-director/SKILL.md` — seção `## Modelo Efetivo` → `## Modelos (multi-modelo)`
- `SYSTEM.md` — cabeçalho v7.0.0 multi-modelo, visão geral e diagrama ASCII atualizados; seção `### Modelo e Routing` → `### Modelos e Routing (multi-modelo)`
- `memory/general/decisions.md` — decisão "Modelo efetivo DeepSeek v4 flash" marcada **SUPERADO**
- `memory/general/successful-patterns.md` — nota de topo: entradas citando DeepSeek v4 flash são **históricas**
- `settings.json` — `model` mantido conforme escolha de Arthur; **não** adicionado `modelFallbacks` (schema do harness não confirmado)

**Fase 4 — Keywords de protocolo `ultraask` + `ultrathink2` (concluída):**
> **Correção de Arthur durante a fase:** as duas NÃO devem ser skills convencionais (`skills/*/SKILL.md`) e sim **tags detectadas no texto enviado**, estilo `ultrathink`/`ultracode` nativos.
- `rules/ask-mode.md` — expandido: ativação por tag no texto; **8–15 perguntas por categoria** (objetivo, público, design, estrutura, tecnologia, funcionalidade, entrega); plano salvo em `~/.claude/plans/plano-<data>-<hora>-<nome>-<contexto>.md`; nada executado antes de aprovação
- `rules/ultrathink2.md` — **NOVO**: J-Space reasoning, Counterfactual Reflection, GCOT expandido (`<plan>→<think>→<execute>→<verify>→<reflect>`), ToT com 5 opções, verificação multi-camada (self/adversarial/evidence), log em `~/.claude/logs/ultrathink2-<timestamp>.md`, detecção combinada (`ultraask`+`ultrathink2`, `ultrathink`+`ultrathink2`, `ultracode`+`ultrathink2`)
- `CLAUDE.md` — seção de skills: nota "Keywords de protocolo (tags, NÃO skills invocáveis)"; lista de regras: adicionado `ultrathink2.md`
- `AGENTS.md` — seção "Keywords de protocolo (tags no texto — NÃO são skills)"
- `settings.json` — `ultrathink2.md` adicionado ao `claudeMdExcludes` (carregado sob demanda, consistente com `ask-mode.md`)

### Pendências da v7 (restantes do plano)
- [x] Arquivar v5: mover `agents/{engineering-lead.md, growth-lead.md, product-lead.md}` + dirs `engineering/`, `growth/`, `product/` → `archive/agents-v5/`
- [x] AGENTS.md reescrito para v7 (6 equipes, leads reais)
- [x] Resolver `run-loop.sh` (`claude: command not found`) — PATH export + `fcc-claude`/`claude` + agente `operacoes-lead` v6
- [x] Fase 3: multi-modelo (remover DeepSeek v4 flash exclusivo)
- [x] Fase 4: keywords `ultraask` + `ultrathink2` (tags no texto, NÃO skills convencionais)
- [x] Fase 5: eficiência de tokens (CLAUDE.md 111 → 48 linhas, < 60)
- [x] Fase 6: orquestrador (3 orquestradores resolvem; orq.sh lê registry)
- [x] Fase 6.3: mantidos os 3 ativos; **escopos dos 4 planejados (sherlock/titan/muse/guardian) fundidos** nos atuais: director ← sherlock+titan+guardian (`control-vertexion-director.md:64-67`), da-vinci ← muse (`da-vinci.md:75-77`); keywords adicionadas ao `DETECTION.md:28,31,37`. Nenhum arquivo de orquestrador novo criado.
- [x] Fase 7: CHANGELOG + revisão final (`CHANGELOG.md` v2.0.0; memória atualizada; MANDATORY.md 34→24 linhas; 4 dirs vazios v5 removidos de `~/.claude/agents/`; greps limpos)

### Riscos de segurança conhecidos (v7)
- **Chaves API ainda no histórico git** (commit `220fe8e v5.0.0 — Fases 1-4 completas` contém Perplexity/Firecrawl no SYSTEM.md). Recomendação: rotação de chaves + limpeza de histórico (git filter-repo / BFG).
- Chaves podem existir em paste-cache/jobs/telemetry (fora de escopo desta limpeza).
