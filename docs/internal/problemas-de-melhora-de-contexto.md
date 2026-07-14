# Problemas de Melhora de Contexto

## O que é este arquivo

Este arquivo documenta **limitações, conflitos e riscos** identificados durante a integração de skills e agentes no sistema Vertexion Director. Cada entrada explica de onde veio o problema, por que ele existe e como corrigi-lo.

A manutenção é manual: ao identificar novo problema, adicione aqui. Ao resolvê-lo, mova para a seção "Resolvidos" com data.

---

## Sessão de Problemas Ativos

---

### P001 — Tamanho excessivo dos arquivos de regras

**O quê:** `engineer-method.md` (158 linhas), `engineering.md` (269 linhas) e `design.md` (76 linhas) somam **503 linhas** de regras carregadas a cada sessão.

**Origem:** Rodada 1 da integração. O usuário pediu 10 skills + protocolo mestre + UI/UX Pro Max como regras passivas (sem `/skill`), o que exigiu que cada skill fosse expandida para texto completo.

**Risco:** Alto. Cada sessão carrega ~500 linhas de regras + CLAUDE.md + agent definitions + memória. Se o modelo tiver limite de contexto (especialmente via FCC com provedores alternativos), o espaço útil para o trabalho real encolhe significativamente.

**Sugestão de correção:**
1. Extrair `engineer-method.md` para referência condicional (carregar via skill ou só quando o usuário pedir). O CLAUDE.md já referencia ele, mas o arquivo ainda é lido.
2. Comprimir `engineering.md`: cada protocolo pode ser um bullet de 3-5 linhas em vez de seção expandida. A expansão detalhada vai para `engineering-reference.md` que só é carregada sob demanda.
3. `design.md` pode ser comprimido removendo anti-patterns detalhados e mantendo só o checklist e as regras de design system.

---

### P002 — Sobreposição entre agente e protocolo (system-design / senior-architect)

**O quê:** O protocolo `system-design` em `engineering.md` e o agente `engineering-senior-architect` têm escopo quase idêntico.

**Origem:** O protocolo system-design foi criado na Rodada 1 como parte dos 10 protocolos de engenharia. O agente senior-architect foi criado na Rodada 2 para lidar com decisões de arquitetura do claude-skills. Ambos usam ADR, trade-off analysis e design de sistema.

**Risco:** Médio. Quando o Vertexion Director rotear uma tarefa de arquitetura, pode escolher o agente OU seguir o protocolo diretamente, criando inconsistência.

**Sugestão de correção:**
1. Remover o protocolo `system-design` de `engineering.md` (seções 3 e 10) e deixar apenas o agente `senior-architect` como executor.
2. Ou remover o agente e deixar o protocolo como única fonte.
3. Recomendação: manter o protocolo (porque é carregado sempre) e eliminar o agente redundante.

---

### P003 — Sobreposição entre agente e protocolo (code-review)

**O quê:** O protocolo `code-review` em `engineering.md` tem formato de saída e dimensões de revisão. O agente `engineering-code-reviewer` tem instruções similares. O novo `engineering-adversarial-reviewer` adiciona outra camada.

**Origem:** code-review é uma skill que existe tanto como protocolo (Rodada 1) quanto como agente dedicado (já existente). O adversarial-reviewer foi adicionado na Rodada 2.

**Risco:** Médio. Revisões de PR podem ser feitas por 3 caminhos diferentes, com formatos de saída diferentes.

**Sugestão de correção:**
1. Unificar: o protocolo `code-review` define o formato de saída padrão, e os agentes `code-reviewer` e `adversarial-reviewer` usam esse formato.
2. Adicionar no protocolo uma nota: "Para revisão adversarial, use o agente engineering-adversarial-reviewer."
3. Ou simplificar: remover o protocolo code-review do engineering.md e deixar só os agentes.

---

### P004 — Falta de validação prática

**RESOLVIDO em 2026-07-10**

**O quê:** Nenhuma das novas regras ou novos agentes (5) havia sido testada em tarefa real.

**Origem e riscos:** (mantido) vide entrada ativa original.

**Testes executados:**
1. ✅ `engineering-api-design-reviewer`: Revisou 4 endpoints do Vertexion. Verdict: NEEDS DISCUSSION (falta versionamento, erro inconsistente)
2. ✅ `engineering-database-designer`: Analisou 17 migrações. Verdict: SAFE (schema sólido, recomendações são otimizações)
3. ✅ `engineering-senior-architect`: Produziu ADR-001 (Monólito SSR vs Backend separado vs Edge Functions)
4. ✅ `engineering-adversarial-reviewer`: Revisou commit e3ddeee. Verdict: CLEAN (apenas sugestões cosméticas)
5. ✅ `product-pricing-strategist`: Analisou pricing ZapMenu (R$34,99-79,99). 4 recomendações com trade-offs

**Resultados registrados em:** `agent-memory/control-vertexion-director/test-p004-*.md`
**Padrão registrado em:** `memory/general/successful-patterns.md`

---

### P005 — Scripts Python não copiados das skills

**O quê:** Várias skills do claude-skills (competitive-intel, pricing-strategist, database-designer, api-design-reviewer) têm scripts Python no repositório original que automatizam análise. Apenas os conceitos foram extraídos.

**Origem:** Decisão de design na Rodada 2. Os repositórios clonados foram temporários e eu não copiei os assets e scripts.

**Risco:** Baixo-Médio. Os agentes funcionam com pesquisa web e análise textual, mas sem as ferramentas automatizadas perdem precisão (ex: `schema_analyzer.py`, `wtp_analyzer.py`).

**Sugestão de correção:**
1. Clonar o repositório claude-skills permanentemente em `~/.claude/references/claude-skills/`
2. Adicionar nos agentes relevantes um caminho para os scripts
3. Ou aceitar a limitação e manter apenas análise textual (recomendado para simplicidade)

---

### P006 — decision-log e learning-curator sem integração

**O quê:** O `engineering-learning-curator` existe como agente mas não é invocado automaticamente pelo director. Decisões e aprendizados não são persistidos entre sessões de forma estruturada.

**Origem:** O agente learning-curator já existia antes das rodadas de integração. O ruflo trouxe o conceito de "memory store" que poderia alimentá-lo. Nada foi conectado.

**Risco:** Médio. Decisões tomadas em uma sessão (ex: "por que escolhemos essa abordagem?") são perdidas na próxima.

**Sugestão de correção:**
1. No protocolo mestre (engineer-method.md), adicionar passo obrigatório ao final de tarefas relevantes: "Registre a decisão via engineering-learning-curator"
2. Ou criar hook pós-tarefa que invoca o learning-curator automaticamente
3. Ou simplificar: abandonar learning-curator e depender apenas dos arquivos de memória existentes

---

### P007 — coordination-patterns.md sem uso real

**O quê:** O arquivo `coordination-patterns.md` com topologias de swarm do ruflo foi criado, mas o runtime atual do Vertexion Director não suporta troca dinâmica de topologia — ele sempre roda agents em paralelo simples.

**Origem:** Extração conceitual do ruflo na Rodada 2. O ruflo usa Rust + `npx claude-flow` para orquestração real, o que não temos.

**Risco:** Baixo. O arquivo é referência conceitual, não um protocolo ativo. Não causa dano, mas ocupa contexto sem benefício imediato.

**Sugestão de correção:**
1. Manter como referência para quando o sistema evoluir
2. Ou remover e só reintroduzir quando houver implementação concreta
3. Ou converter em protocolo ativo no `control-vertexion-director.md` para escolher topologia baseada no escopo da tarefa (mais útil)

---

### P008 — Adversarial-reviewer pode gerar falsos positivos

**O quê:** O `engineering-adversarial-reviewer` usa 3 personas que DEVEM encontrar problemas. Isso incentiva a criação de issues artificiais quando não há problemas reais, gerando ruído.

**Origem:** Design da skill original do claude-skills (por ekreloff). A premissa é que "sempre há algo a melhorar", mas isso pode levar a reports inchados.

**Risco:** Médio. Desenvolvedores podem ignorar o agente se ele reportar problemas triviais com frequência.

**Sugestão de correção:**
1. Adicionar threshold no agente: "Se após análise genuína não houver issue crítico/sério, reporte CLEAN com 'nenhum issue significativo encontrado' em vez de inventar"
2. Ou usar apenas o adversarial-reviewer em conjunto com o code-reviewer padrão, como segunda opinião

---

### P009 — Multi-repo thinking sem testes cross-repo

**O quê:** O protocolo mestre (engineer-method.md) tem uma seção "Múltiplos Repositórios" que orienta tratar o ecossistema como sistema distribuído. Mas nenhum teste ou validação cross-repo foi configurada.

**Origem:** Adicionado na Rodada 1 como parte do engineer-method.md, baseado no padrão de trabalho com ZapMenu, Toveli, Vertexion.

**Risco:** Médio. O protocolo orienta verificar contratos entre repositórios, mas sem testes concretos, mudanças em um repo podem quebrar outro silenciosamente.

**Sugestão de correção:**
1. Criar um `contract-tests/` por projeto ou um arquivo `CROSS-REPO.md` listando contratos compartilhados
2. Adicionar passo de validação cross-repo no `engineering-release-judge`
3. Ou, quando surgir o primeiro incidente cross-repo, documentar e criar teste então

---

### P010 — Ausência de teste de consistência entre agentes

**O quê:** Cada agente tem seu próprio arquivo .md com instruções. Não há verificação se as instruções de agentes diferentes (ex: `security-auditor` e `supabase-auditor`) são consistentes entre si ou com os protocolos em `rules/`.

**Origem:** O sistema de agentes cresceu organicamente: 37 agentes pré-existentes + 5 novos. Nunca houve uma revisão cruzada de consistência.

**Risco:** Médio. Agentes podem dar recomendações conflitantes (ex: security-auditor bloqueia o que supabase-auditor permite).

**Sugestão de correção:**
1. Criar script de validação que extrai `description` e `disallowedTools` de todos os agentes e identifica sobreposições
2. Revisão manual trimestral dos agentes
3. Ou adicionar no `control-vertexion-director.md` a instrução: "quando 2 agentes discordarem, reporte o conflito e peça decisão de Arthur"

---

## Problemas Resolvidos

### P001 — Tamanho excessivo dos arquivos de regras

**Resolvido em:** 2026-07-10
**Correção:** `engineering.md` comprimido de 269 para ~85 linhas (cada protocolo virou bullet de 3-5 linhas). Detalhamento movido para `engineering-reference.md` (carregado sob demanda). `design.md` (76 linhas) mantido porque é UI/UX específico e tem formato de checklist que já é otimizado.

### P002 — Sobreposição system-design / senior-architect

**Resolvido em:** 2026-07-10
**Correção:** Seções 3 (system-design) e 10 (architecture) removidas de `engineering.md`. Substituídas por: "REDIRECIONADO → use o agente `engineering-senior-architect`". Detalhamento do framework mantido em `engineering-reference.md` para consulta.

### P003 — Sobreposição code-review triplicado

**Resolvido em:** 2026-07-10
**Correção:** `engineering.md` mantém apenas o formato de saída padrão + regra de roteamento: "Revisão padrão → `engineering-code-reviewer`. Revisão adversarial → `engineering-adversarial-reviewer`."

### P005 — Scripts Python não copiados

**Resolvido em:** 2026-07-10
**Correção:** Aceita a limitação. Documentado em ambas as engenharias: "Análise é textual, sem scripts automatizados externos."

### P007 — coordination-patterns sem uso real

**Resolvido em:** 2026-07-10
**Correção:** Arquivo movido de `rules/coordination-patterns.md` para `docs/internal/coordination-patterns.md` — não carrega mais no contexto, mas preservado como referência para futuro design de orquestração.

### P008 — Adversarial-reviewer pode forçar falso positivo

**Resolvido em:** 2026-07-10
**Correção:** Threshold explícito adicionado ao agente: "se após análise genuína das 3 personas não houver issue crítico ou sério, reporte CLEAN."

### P009 — Multi-repo thinking sem testes cross-repo

**Resolvido em:** 2026-07-10
**Correção:** `docs/internal/CROSS-REPO.md` criado com contratos conhecidos entre ZapMenu, Toveli, Vertexion. Evolui conforme surgem novas integrações.

### P010 — Sem verificação de consistência entre agentes

**Resolvido em:** 2026-07-10
**Correção:** `control-vertexion-director.md` atualizado: "Quando 2 agentes da MESMA equipe discordarem, pare e reporte o conflito para Arthur decidir — nunca escolha silenciosamente um dos dois."

### P006 — learning-curator sem integração

**Resolvido em:** 2026-07-10
**Correção:** Substituído por autoavaliação embutida no protocolo mestre (`engineer-method.md` — Disciplina de Revisão Final). O próprio agente que executou a tarefa registra erros/acertos com contexto fresco. O curator vira "consolidador mensal" opcional.

---

## Como usar este arquivo

1. **Adicionar:** ao encontrar limitação, conflito ou risco novo, crie entrada com ID sequencial (P011, P012...)
2. **Resolver:** quando a correção for implementada, mova a entrada para "Problemas Resolvidos" com data
3. **Revisar:** a cada nova rodada de integração, releia os problemas ativos para evitar criar novos iguais
4. **Priorizar:** problemas com risco "Alto" devem ser endereçados antes de nova funcionalidade
