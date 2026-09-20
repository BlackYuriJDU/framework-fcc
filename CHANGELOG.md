# Changelog

## 7.1.0 — 2026-08-08

### Três orquestradores de domínio
- **Tesla** (azul) substitui o orquestrador legado — engenharia de código + auto-melhoria; opera SEMPRE em ultrathink2; dono do `/autoloop` (Karpathy Loop).
- **Einstein** (amarelo) substitui `seu-projeto-activity` — growth + jurídico + marketing; absorve pipeline de prospecção seu-projeto + Founder's Playbook.
- **Da Vinci** (vermelho) mantido — design front-end; só ganhou conhecimento (superdesign, awesome-design-md).
- **Modo merge** (`/orq all`): protocolo no chat principal coordenando os 3 orqs em `reports/merge-<ts>/<dominio>/DELIVERABLE.md` + `INTEGRATED.md`; nada sai sem aprovação.
- **Níveis de uso** (baixo/médio/alto/máximo, default médio) por orq em `registry.json`.
- **Ativação mid-chat por nome** (tags Tesla/Einstein/Da Vinci no texto) + invocação direta `/tesla`, `/einstein`, `/da-vinci`, `/autoloop`.
- **Nenhum agente sem orq**: `loop-verifier` movido para `agents/control/` (dono: Tesla).

### Conhecimento
- `knowledge/{tesla,einstein,da-vinci}/` com repos curados (shallow clone) + `pointers.md` por URL para repositórios grandes (semgrep, codeql, biome, oxc) e já-downloadados.
- `scripts/sync-knowledge.sh` — idempotente, `--check` (dry-run R$0); clone real requer aprovação.

### Registry
- `registry.json` version 3 com schema por orq (`level` incluso).

## 7.0.0 — 2026-08-05

### Limpeza v5→v7
- Portfólio reduzido a **seu-projeto + seu-projeto-2** (remove Vertexion produto, Run, Radar, Collect, ZapBot).
- Framework **multi-modelo**, agnóstico a provedor (perfis fronteira/padrão/compacto).
- Credenciais movidas para `~/.claude/.env` exclusivo do framework (chmod 600); chaves removidas de SYSTEM.md/seu-projeto-activity.md.
- 6 leads v6 enriquecidos (somar antes de excluir); 3 orquestradores reescritos delegando aos leads v6.
- Keywords de protocolo `ultraask` (ask-mode) + `ultrathink2` (tags no texto, NÃO skills).
- CLAUDE.md 111 → 48 linhas (< 60); escopos de 4 orqs planejados fundidos nos 3 ativos.

## 6.0.0 — 2026-07-20

### Transição
- 6 leads stub em `~/.claude/agents/` (dev, design, marketing, financas, juridico, operacoes).
- 8 control agents em `agents/control/` + `additionalAgentDirectories`.
- 3 orquestradores: o orquestrador legado, `seu-projeto-activity`, `da-vinci` (registry v2).

## 5.0.0 — 2026-07-15

### Fase 1 — Correções Críticas
- 5 agentes mortos removidos do director (compliance-auditor, docs-drift-checker, learning-curator, preview-deployer, regression-test-writer)
- 4 agentes faltantes adicionados (control-evidence-ledger, engineering-adversarial-verifier, engineering-loop-triage, loop-verifier)
- 2 frontmatters corrigidos (control-evidence-ledger, loop-verifier)
- Agentes totais: 36 → 39 (17 engineering)

### Fase 2 — Desinflar Contexto
- `CORE-DISCIPLINE.md` — 6 regras sempre-ativas (rotulagem, reexecução, gate de risco, não adivinhar, evidência, fechamento)
- 8 skills on-demand em `~/.claude/skills/`: constitution, evidence-ledger, gcot-tot, security-checklist, backup-first, cognition-rules, turn-based-loop, risk-classification
- Documentação pré-rebrand corrigida: README, PRODUCT_DECISIONS, schedule.json, START_HERE_PROMPT, SYSTEM.md
- AGENTS.md atualizado com informações reais do sistema

### Fase 3 — Loop e Risco
- Loop baseado em turnos com 5 fases (Prompt → Context → Action → Check → Response)
- Classificação de risco em 3 níveis (Trivial/Padrão/Arriscado)
- TDD com red testemunhado obrigatório em tarefas Arriscadas
- Evidence Ledger com níveis de confiança (🔵 Estática / 🟢 Runtime / 🟡 Diff / 🔴 Contradito)

### Fase 4 — Arquitetura de Sub-Diretores
- 3 sub-diretores criados: engineering-lead, growth-lead, product-lead
- Director reduzido de 38 agentes diretos para 9 (6 control + 3 leads)
- Sub-diretores gerenciam seus próprios pipelines com maxTurns:48
- FCC nativo confirmado como API proxy, sem suporte a hooks/workflows
- Agentes totais: 39 → 42

### Prévio (2026-07-01)
- Complemento operacional do 4.0.0.
- UI do dashboard refeita em tema claro glassmorphism.
- Instalação com merge, clean e dry-run.
- Scripts de backup e restauração no WSL e Windows.
- Logs com rotação automática (1.5MB, mantém 8).
- `disableBypassPermissionsMode` no settings.json.

## 4.0.0 — 2026-06-30

### Arquitetura

- Criado o Vertexion Director como agente principal global real.
- Integradas três equipes: Growth Engine, Product Intelligence e Engineering Assurance.
- Adicionada camada Vertexion Control para portfólio, auditoria e aprovações.
- Reduzidas as Skills visíveis para `/revisar`, `/validar` e `/preview`.
- Todos os agentes solicitam Opus com esforço alto.

### Control Center

- Dashboard localhost sem dependências externas.
- Streaming `stream-json`, interrupção de execução e retomada de estado operacional.
- Projetos, leads, ideias, rotinas, aprovações, relatórios e saúde do sistema.
- Bind loopback, CSRF e ausência de endpoint para shell arbitrário.
- Scheduler interno diário, semanal e mensal sem duplicação pelo Task Scheduler.

### Growth Engine

- Preservado o Scout moderno e removida a arquitetura legada duplicada.
- Chaves opcionais em modo teste e validação condicional por integração.
- Histórico de aceitos, rejeitados e duplicados para nunca repetir empresas.
- Orçamento local Tavily.
- Melhor lead do dia e artefato para o dashboard.
- Fluxo interno diário, Pipedream/n8n documentados e nenhum envio a leads.

### Product Intelligence

- Equipe construída do zero.
- Hipóteses falsificáveis, fontes, concorrência, viabilidade, regulação, red team e experimento.
- Nota, confiança e evidência separadas.
- Escada de evidência 0–5 e validação apenas a partir de pagamento.
- Workspaces por ideia e avaliações artificiais.

### Engineering Assurance

- Pipeline v3 migrado para agentes prefixados e roteamento condicional.
- Toolkit de escopo, fingerprint, scanner e avaliações preservado.
- Correções de permission mode para build, runtime, regressão, memória e preview.
- Planos específicos para seu-projeto e seu-projeto-2.

### Segurança e instalação

- Removidos tokens, `.env`, caches, históricos e dados pessoais.
- Criados instaladores Windows/WSL com backup e desinstalação segura.
- Instalação padrão somente no WSL; Windows é opcional.
- Criado checklist de rotação, scanner e migração segura de MCPs.
- Adicionados self-tests e validador final do pacote.
