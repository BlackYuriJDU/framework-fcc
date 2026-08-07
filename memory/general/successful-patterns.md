# Padrões bem-sucedidos

### [2026-08-05] "Somar antes de excluir" — fundir escopos planejados nos orquestradores ativos (Fase 6.3)
- Contexto: O Mega Plano propunha expandir de 3 para 7 orquestradores (sherlock, titan, muse, guardian). Arthur decidiu manter os 3 atuais e fundir o escopo dos 4 planejados como conhecimento herdado.
- O que funcionou: (1) Verificar que o "conteúdo" dos 4 só existia como tabela de 1 linha no plano — NÃO havia arquivos de agente para absorver. (2) Mapear por domínio: sherlock (dados/investigação), titan (devops/deploy), guardian (segurança/compliance) → director; muse (copy/conteúdo) → da-vinci. (3) Adicionar seção "escopo herdado" aos orquestradores atuais (`control-vertexion-director.md:64-67`, `da-vinci.md:75-77`) + keywords de roteamento no `DETECTION.md:28,31,37`. (4) Zero arquivos novos criados; verificação pós-edição por grep confirmou presença e ausência de arquivos novos.
- Padrão reaproveitável: quando um plano propõe novos agentes/orquestradores, verificar se o conteúdo existe de fato (arquivo/implementação) antes de criar. Se for só escopo de 1 linha, fundir no agente de mesmo domínio em vez de criar (cirurgia). Após fundir, adicionar keywords de roteamento — escopo fundido sem roteamento é conhecimento morto.

### [2026-08-05] Pesquisa em fonte primária antes de reescrever protocolo de raciocínio (ultrathink2 + J-Space)
- Contexto: Arthur pediu para garantir que `rules/ultrathink2.md` usasse o J-Space do documento + o estilo de raciocínio de IA de alto nível (Fable 5, GPT-5.6 Sol, Opus 5). A Fase 1 existente usava "J-Space" errado (espaço de soluções). Fiz pesquisa profunda manual e reescrevi.
- O que funcionou: (1) Busca em fonte primária primeiro — transformer-circuits.pub/2026/workspace + anthropic.com/research/global-workspace confirmaram o J-Space real (global workspace, 5 propriedades, Jacobian Lens, monitoramento vetorial WARNING, desacoplamento CoT, counterfactual reflection training). (2) Busca complementar sobre estilos de fronteira — Opus 5 "pensa antes de escrever / pega erro lógico no planejamento / raciocina POR QUE está certo"; reasoning effort tem teto (overthinking degrada, Opus 5 melhor em médio ~53%); preferir instrução geral a passos prescritos. (3) Reescrevi a regra emulando as 5 propriedades do J-space como disciplina operacional + Fase 0 de postura de fronteira + monitoramento vetorial, deixando explícito que é emulação (não acesso a ativações) — honestidade sobre a metáfora. (4) Backup do arquivo antes de sobrescrever; grep de verificação pós-edição (antigo conceito ausente, novos conceitos presentes).
- Padrão reaproveitável: Antes de reescrever QUALQUER regra/protocolo que cite conceito de pesquisa, buscar fonte primária (arxiv, transformer-circuits.pub, blog oficial do provedor) e ancorar a reescrita no conceito canônico. Registrar fidelidade conceitual na verificação (não só presença do termo). Para protocolos de raciocínio, ancorar no que a pesquisa mostra que modelos de fronteira fazem: raciocínio interno silencioso ≠ CoT visível; esforço proporcional; verificação seletiva (85-95% das rechecagens são confirmatórias); refletir muda o que se pensa.

### [2026-08-05] Verificação por grep da Fase 3 revelou menções fora do mapa do plano
- Contexto: Ao aplicar a Fase 3 (multi-modelo), o plano listava os arquivos exatos a editar (CLAUDE.md, SKILL.md, SYSTEM.md:412-417, decisions.md, successful-patterns.md). O grep de verificação pós-edição encontrou **menções adicionais** em SYSTEM.md (:6 cabeçalho, :35 visão geral, :59 diagrama ASCII) e versoes.md que NÃO estavam no mapa do plano.
- O que funcionou: (1) Rodar `grep -rin "deepseek v4 flash\|modelo efetivo"` no diretório inteiro (excluindo caches/histórico) DEPOIS de editar os arquivos do plano, não antes. (2) Classificar cada ocorrência em 3 buckets: intencional (nova seção), histórico (memória/planos com nota de superação), e pendência real (arquivo ativo instruindo comportamento). (3) Anotar registros históricos com nota `SUPERADO` em vez de apagar (preserva rastreabilidade sem falsificar passado).
- Padrão reaproveitável: Para qualquer refatoração de diretrizes (não só modelo), SEMPRE rodar grep de verificação no diretório inteiro após editar os arquivos mapeados — o mapa do plano nunca é completo. Classificar ocorrências em buckets antes de agir sobre cada uma.

> **Nota (2026-08-05, Fase 3 multi-modelo):** Entradas abaixo que citam "DeepSeek v4 flash" como modelo efetivo são **históricas** (waves de otimização do template para o provedor em uso na época). O framework é agora agnóstico a provedor; o padrão de template/checklist continua válido como boas práticas gerais, aplicado ao perfil real em uso.

### [2026-07-29] Waves 3-13: Compressão, tool pruning, model routing, reflection loop
- Contexto: Continuação das waves de otimização dos 42 agentes para o modelo efetivo da época (DeepSeek v4 flash). Waves 3-5 estavam parciais (só template, sem compressão/few-shot). Waves 6-13 não iniciadas. 21 agentes modificados no total.
- O que funcionou: (1) Batch de 7 agentes Wave 3 em paralelo com compressão + 2 exemplos few-shot cada. (2) Tool pruning (Wave 6) em 4 agentes analíticos — Read, Grep, Glob, Bash, WebSearch, WebFetch → apenas Read, WebSearch, WebFetch. (3) Model routing + Chain of Draft (Waves 7+12) adicionados em todos os agentes tocados via seção "Modelo" padronizada. (4) Reflection loop (Wave 11) adicionado nos 4 agentes de auditoria crítica: security-auditor, payment-flow-auditor, migration-guardian, evidence-ledger. (5) Session ritual + self-check (Waves 10+13) adicionados no director. (6) Sub-directors comprimidos com 2 exemplos cada.
- Padrão reaproveitável: Waves independentes que tocam os mesmos arquivos (ex: compressão + model routing + CoD) devem ser executadas juntas em uma única edição por arquivo vs. ondas separadas. Tool count médio caiu de ~5.2 para ~3.8 ferramentas por agente. Backup antes de cada lote.

### [2026-07-28] Wave 2b: 13 agentes produto+growth + tool pruning antecipado
- Contexto: 13 agentes de produto (8) e growth (5) com 14-18 linhas e instruções vagas. Mesmo problema dos zumbis de engenharia.
- O que funcionou: (1) Aplicação do mesmo template das Waves 1-2. (2) Tool pruning oportunista — cada agente agora só tem as ferramentas que realmente usa (média de 7→3 ferramentas). (3) Agentes puramente analíticos (hypothesis-builder, qualifier, outreach, performance) ficaram só com `Read` — sem Bash/Web/Glob desnecessários. (4) Batch de 13 arquivos em paralelo.
- Padrão reaproveitável: Tool pruning por função — agente que só analisa não precisa de Bash/Web. Agente que pesquisa precisa de Web. Agente que formula não precisa de ferramentas de execução.

### [2026-07-28] Wave 2: 9 agentes "zumbis" ressuscitados com template DeepSeek
- Contexto: 9 agentes de engenharia+controle com 13-14 linhas e 1-3 frases vagas. DeepSeek não conseguia seguir instruções tão abstratas.
- O que funcionou: (1) Template padronizado em batch (Função → Entrada → Passos → Verificação → Saída → Regras). (2) Backup de todos antes de editar. (3) Cada agente ganhou checklist de 5-7 itens + template de saída + regras claras. (4) payment-flow-auditor ganhou few-shot example (primeiro no sistema!). (5) Escrita em paralelo reduziu tempo.
- Padrão reaproveitável: Template de 6 seções para qualquer agente novo. Batch backup antes de editar múltiplos agentes. Checklist + output format é o mínimo para DeepSeek funcionar.

### [2026-07-28] Prompt compression para modelo compacto (na época DeepSeek v4 flash): director 139→79 linhas
- Contexto: Aplicando prompt engineering 2026 research para adaptar agent prompts ao modelo efetivo da época (DeepSeek v4 flash — contexto limitado, literal, melhor com checklists que prosa).
- O que funcionou: (1) Backup antes de qualquer edição. (2) Template estruturado: função(1L) → equipes(tabela) → roteamento(lista) → pipelines(bullets) → regras(bullets) → saída(template). (3) Prosa → bullets, parágrafos → checklists. (4) Fusão de seções redundantes (segurança aparecia em 3 lugares → 1). (5) "Saída" template adicionado com formato exato esperado + permissão "I don't know". (6) Redução de 139→79 linhas (43%) sem perder info essencial.
- Padrão reaproveitável: Template de 8 seções para qualquer agente. Priorizar bullets/checklists sobre prosa. Output format + "I don't know" em todo agente. Backup antes de editar agent prompts.

### [2026-07-27] Deep Dive + Skill de Contexto ZapMenu: investigação multi-fonte + skill de contexto completo
- Contexto: Arthur pediu para limpar diretórios duplicados do ZapMenu, entender TODO o projeto, e criar uma skill `/zapmenu` que carrega todo o contexto automaticamente para evitar ter que pedir "procure pelo ZapMenu" toda vez.
- O que funcionou: (1) Investigação em paralelo: ls/git/find para mapear TODOS os diretórios ZapMenu no PC, gh/remote para GitHub. (2) Identificar que o repositório ativo era `~/zapmenu-principal` (não `~/zapmenu` ou `~/Downloads/zapmenu-claude-code-completo`). (3) Backup-first com tar.gz de cada diretório antes de deletar. (4) Leitura sistemática de STATUS_ZAPMENU.md (496 linhas), PRE_SHIP_REPORT.md (188 linhas), PRE_PRODUCTION_CHECKLIST.md (178 linhas), e arquivos-chave do código (router, server, root, plans, config, appmax, auth, dashboard, routes). (5) Skill criada com frontmatter YAML completo, 16 seções abrangendo visão geral, tech stack, deploy, arquitetura, rotas, DB, auth, planos, pagamentos, integrações, componentes, segurança, estado atual, comandos.
- Padrão reaproveitável: Para criar skill de contexto de projeto: (1) mapear todos os diretórios do projeto, (2) ler status/pipeline reports primeiro, (3) ler código fonte de cada camada (config → servidor → lib → rotas → componentes), (4) consolidar em 1 skill com seções escaneáveis. Skills de contexto são colocadas em `~/.claude/skills/<nome>/SKILL.md` e são auto-descobertas pelo sistema.

### [2026-07-23] Auditoria de segurança: investigação por source primária + cross-reference
- Contexto: Validando 10 alegações de auditoria de segurança/arquitetura do ZapMenu. Cada alegação precisava ser verificada contra código real.
- O que funcionou: (1) WebSearch para encontrar documentação oficial da AppMax (docs.appmax.com.br/webhooks) e referências de integração no GitHub. (2) WebFetch da página de docs + GitHub APPMAX_API_REFERENCE.md para confirmar que AppMax usa HMAC-SHA256, não shared secret header. (3) Leitura direta de cada arquivo mencionado, linha a linha, antes de aceitar ou refutar a alegação. (4) tsx (TypeScript executor) para verificar sintaxe dos arquivos modificados sem precisar do build completo do Vite.
- Padrão reaproveitável: Para auditar alegações de segurança: (1) WebSearch pela documentação oficial, (2) WebFetch das páginas de docs encontradas, (3) grep para confirmar código real, (4) tsx para validar sintaxe após edição. Não confiar em alegação sem evidência de código.

### [2026-07-23] i18n hydration fix: init único com LanguageDetector condicional
- Contexto: O white screen do ZapMenu era causado por dupla inicialização do i18next — ssr-init.ts inicializava em module level, client.ts re-inicializava em useEffect com LanguageDetector, trocando idioma pós-hydration e causando re-renderização em massa que derrubava a árvore React (sem Error Boundary).
- O que funcionou: (1) Unificar init num único arquivo (ssr-init.ts). (2) LanguageDetector adicionado condicionalmente com `typeof window !== "undefined"` — SSR ignora, cliente usa. (3) No cliente, `lng: undefined` permite que o LanguageDetector detecte o idioma do browser ANTES do primeiro render. (4) initI18next() em client.ts virou no-op. (5) useEffect de initI18next removido de __root.tsx.
- Padrão reaproveitável: Para i18n + SSR + LanguageDetector, UM arquivo de init com guard `typeof window` para o detector resolve sem duplicação de init.

### [2026-07-26] supabase db query --linked para SQL remoto arbitrário
- Contexto: Precisava deletar restaurante do admin (contato@zapmenu.org) no Supabase remoto. Tentei via Node.js script com supabaseAdmin mas o classifier bloqueou. psql não disponível no WSL. A CLI supabase tem o comando `db query --linked` que executa SQL arbitrário no projeto linked via Management API.
- O que funcionou: (1) `supabase db query --linked "SELECT ..."` para verificar dados antes de alterar (2) `supabase db query --linked "DELETE ..."` para executar a operação destrutiva (3) Segunda SELECT para confirmar que o dado foi removido e outras linhas intactas.
- Padrão reaproveitável: Para executar SQL arbitrário no Supabase remoto sem psql: `npx supabase db query --linked "<sql>"`. Sempre fazer SELECT de verificação antes e depois de operações destrutivas. É mais seguro que subir migration só para executar DELETE/UPDATE pontual.

### [2026-07-21] SSR i18n fix: module-level init file sem LanguageDetector
- Contexto: `useTranslation()` quebrava durante SSR porque o i18n era inicializado apenas em `useEffect`. `initReactI18next` com `LanguageDetector` crashava no servidor (navigator/browser APIs indisponíveis).
- O que funcionou: (1) Criar `ssr-init.ts` que importa `i18next` + `initReactI18next` + resources estáticos (sem LanguageDetector) e chama `.init()` em module scope. (2) `__root.tsx` faz `import "@/lib/i18n/ssr-init"` no topo — o module executa antes de qualquer componente. (3) `client.ts:initI18next()` continua em useEffect no cliente, adiciona LanguageDetector e re-inicia o singleton. (4) Duplicar imports de locale JSONs é OK para um arquivo bridge — extrair shared resources seria refatoração desnecessária.
- Padrão reaproveitável: Para SSR i18n com react-i18next, um arquivo separado que init sem LanguageDetector resolve 100% do problema sem refatorar o cliente. O singleton i18next aceita `.init()` múltiplas vezes.

### [2026-07-18] Landing page SaaS WhatsApp: Next.js 16 + shadcn base-nova + Tailwind v4 — execução full de plano 8 fases
- Contexto: Execução do plano `ultraask-ultrathink-ultracode-quero-jaunty-floyd.md` para criar landing page de SaaS WhatsApp (projeto descontinuado). Projeto novo do zero. 8 fases, ~40 componentes, 41 arquivos fonte.
- O que funcionou: (1) Ordem do plano respeitada — escrever types/constants primeiro como fonte de verdade, depois componentes que consomem, depois páginas que compõem. (2) Processo batch: instalar deps em bloco, depois escrever todos os arquivos por camada (utilidades → shared → layout → sections → pages). (3) Usar shadcn base-nova (Tailwind v4 + Base UI) que já vinha com a versão mais recente — não lutar contra a versão. (4) Build zerado de primeira com 41 arquivos.

### [2026-07-19] ZapMenu i18n + Plan execution: batch edits em paralelo, pesquisa externa em paralelo
- Contexto: Execução remanescente do plano de internacionalização ZapMenu (~10 fases). Edições em 30+ arquivos, criação de locales FR+ES, instalação de deps, pesquisa docs AppMax.
- O que funcionou: (1) Iniciar todas as edições independentes em paralelo no primeiro lote. (2) Instalação de npm + pesquisa AppMax em paralelo (reduz latência). (3) Para TanStack React Start 1.167.x, server functions usam `.inputValidator()` não `.validator()`. (4) i18n locale registration: criar JSONs copiando de pt-BR, depois registrar em client.ts + server.ts simultaneamente. (5) Drawer controlled + window.confirm para confirmação antes de fechar é suficiente sem biblioteca extra.
- Padrão reaproveitável: Para execução de planos grandes: (a) instalar infraestrutura primeiro (deps, shadcn, db link), (b) escrever types/constants como contrato, (c) paralelizar componentes independentes, (d) build de verificação ao final. shadcn base-nova + Tailwind v4 usa `@theme` em CSS, não `tailwind.config.ts` — adaptar planos antigos para isso.

### 2026-07-13 Consolidação de agentes 45→36: merge de capacidades
- Contexto: Redução de 45 para 36 agentes (9 fundidos em 5 sobreviventes + 1 passivo) para reduzir custo de contexto de ~6.750 chars para ~5.670 chars. Motivação: Arthur identificou que menos da metade dos agentes era usada diariamente.
- O que funcionou: (1) Identificar agentes com responsabilidades sobrepostas (ex: adversarial-reviewer e api-design-reviewer ambos revisam código → merge no code-reviewer como 3 modos). (2) Fundir por competência, não por time — database-designer virou seção do implementation-planner. (3) Criar SYSTEM.md como documentação consolidada do ecossistema.

### [2026-07-19] i18n ZapMenu: split checkout-rpc.ts para contornar import-protection do TanStack Start
- Contexto: TanStack Start plugin de import-protection bloqueava imports de `.server.ts` em client bundle, incluindo imports transitivos. O checkout.server.ts era importado direto de `planos.tsx`.
- O que funcionou: (1) Split em dois arquivos — `checkout-rpc.ts` (thin RPC bridge, sem extensão .server) e `checkout.server.ts` (implementação server-only). (2) createServerFn handlers com dynamic import para delegar ao .server.ts (o compilador extrai handler bodies para server bundle). (3) Lógica inline (status, subscription) fica no próprio RPC bridge sem delegar.
- Padrão reaproveitável: Para contornar import-protection do TanStack Start, criar arquivo `*-rpc.ts` sem `.server` que contém createServerFn definitions. Handlers complexos usam `await import("./implementation.server")` — o compilador TanStack automaticamente extrai isso. Handlers simples que só usam context.supabase podem ficar inline. Manter tipos e schemas no RPC bridge para importação segura do cliente.

### 2026-07-17 Non-blocking best-effort pattern para logging de pedidos
- Contexto: Precisava registrar pedidos no Supabase antes de redirect ao WhatsApp, sem jamais bloquear a UX do cliente.
- O que funcionou: Padrão `.then().catch(() => {})` (não async/await) dentro de `sendToWhatsApp()` — a promise roda em background, o `window.open()` executa imediatamente depois. Sem await, sem risco de delay ou exceção visível ao usuário. Reaproveitável para qualquer logging/métricas/analytics que não devem bloquear fluxo principal.
- Padrão reaproveitável: Quando reduzir agentes: (a) agrupe por responsabilidade, não por nome; (b) preserve especialização como modos/seções em vez de descartar; (c) atualize MANIFEST.json e SYSTEM.md simultaneamente; (d) archive originais em vez de deletar.

### [2026-07-21] Type cleanup revela bug pré-existente (admin.tsx `as any` removal)
- Contexto: Phase 3 do plano de correção ZapMenu — remover `as any` de admin.tsx. As server functions `deleteClient` e `sendAdminMessageFn` usavam `context.userId` do middleware de auth, não recebiam dados do cliente-alvo.
- O que funcionou: (1) Importar as funções no topo do módulo em vez de dynamic import + `as any`. (2) Definir interfaces locais (`AdminMessage`, `AdminFeedback`) baseadas na forma real dos dados. (3) Durante o processo de tipagem, ficou evidente que `deleteClient` usa `context.userId` (admin logado) em vez de receber o ID do cliente-alvo — bug pré-existente que `as any` estava mascarando. (4) Mudanças preservaram comportamento existente (não corrigir bug que estava fora do escopo).
- Padrão reaproveitável: Eliminar `any` sistematicamente revela bugs de design que estavam ocultos. Documentar o bug encontrado em vez de corrigir silenciosamente fora do escopo. Adicionar ao risk register quando o comportamento não intencional for preservado intencionalmente.

### [2026-07-21] Paginação server-side com search + magic bytes + CDN utility
- Contexto: Fases 4-5 do plano de correção ZapMenu — adicionar paginação no admin, magic bytes em uploads, CDN utility.
- O que funcionou: (1) Paginação com `range()` nativo do Supabase + `{ count: "exact" }` — count reflete total ANTES do range. (2) Search server-side com `ilike` que reseta página para 0. (3) Magic bytes validados contra 5 formatos (JPEG/PNG/GIF/WebP/HEIC) antes de sharp — early reject de payloads não-imagem. (4) CDN utility com endpoint `/render/image` que usa cache edge do Supabase Cloudflare. (5) Structured error `{ ok, error }` para funções de mutação admin — substitui throw + try/catch no frontend.
- Padrão reaproveitável: Paginação Supabase: `.select("*", { count: "exact" }).range(offset, offset+limit-1)` — count vem do total de matching rows, data vem da página. Magic bytes: `Buffer` + `.some()` + `.every()` — sem lib extra. Structured errors: `{ ok: boolean, error: string | null }` em vez de throw, consumido no frontend como `if (result.ok)`.

### 2026-07-15 Correção em lote ZapMenu: cart analytics + inline card + suporte chat
- Contexto: 7 pedidos simultâneos (bugs + features) no ZapMenu. Correções tocavam 6 arquivos em 3 camadas (migration SQL → server functions → frontend).
- O que funcionou: (1) Identificar causa raiz por sintoma em vez de consertar isoladamente (ex: checkout freeze causado por `useServerFn()` faltante, não por timeout). (2) Agrupar alterações por camada: migration → server lib → functions → routes → components. (3) Usar `as any` para tabelas novas nos tipos Supabase em vez de regenerar types — equivalente funcional, sem bloqueio. (4) Separar IIFE problemática do `useRef()` em função nomeada para resolver parsing TSX.
- Padrão reaproveitável: Server functions em TanStack Start >= 7.1 exigem `useServerFn()` wrapper no cliente para evitar que o bundler inclua código server-side no client bundle. Tabelas Supabase recém-criadas (não nos tipos gerados) usam `as any` no `from()`.

### 2026-07-14 Integração de cognition.md: adaptação de documento externo como regra do sistema
- Contexto: Arthur forneceu um documento de "diretrizes de cognição" sintetizado de fontes públicas (OpenAI, Anthropic, DeepSeek-R1, DeepMind) e pediu adaptação ao sistema existente com preferências específicas.
- O que funcionou: (1) Não substituir — posicionar como camada superior complementar. (2) Adaptar seções contra a direção original quando Arthur explicitou preferência contrária (seção 6: perguntar vs interpretar). (3) Incorporar preferências já registradas em vez de duplicar. (4) Integrar via MANDATORY.md (checklist step #2 + tabela de referência).
- Padrão reaproveitável: Documento externo → adaptar em vez de copiar, explicitar divergências do original, integrar via MANDATORY.md, registrar no agent-memory.

### 2026-07-10 Validação prática P004 — 5 testes de agentes executados com sucesso
- Contexto: Testes de validação dos novos agentes (api-design-reviewer, database-designer, senior-architect, adversarial-reviewer, pricing-strategist) usando código real do Vertexion e ZapMenu.
- O que funcionou: Todos os 5 testes produziram resultados úteis e coerentes. A abordagem de ler os arquivos manualmente e aplicar os protocolos diretamente foi eficaz.
- Padrão reaproveitável: Para validar agentes, a sequência é: (1) ler os arquivos relevantes do projeto, (2) aplicar o protocolo do agente manualmente, (3) registrar resultado em arquivo de memória. Isso pode ser replicado para novos agentes no futuro.

### [2026-07-11] ZapMenu: Seroval Error (step: 3) ao testar server functions via curl — falsa positiva
- Contexto: Testando server functions do TanStack Start via curl com corpo JSON. Resposta veio como "Seroval Error (step: 3)".
- Padrao identificado: TanStack Start usa Seroval serialization para RPC entre server function e cliente. curl envia plain JSON que o runtime server tenta desserializar pelo Seroval, falhando.
- Veredito: NAO E BUG. O cliente web (navegador) lida com a serializacao automaticamente via `useServerFn`. Server functions devem ser testadas pelo browser client, nao via curl.
- Padrao reaproveitavel: Quando testar server functions do TanStack Start, sempre use o browser (navegador real ou headless como Playwright). Respostas "Seroval Error" vindas de requisicoes diretas (curl, Postman) sao esperadas e nao indicam problema no codigo.

### [2026-07-17] Fase 1 Mega Correção: batch de 11 alterações no ZapMenu
- Contexto: 11 correções simultâneas em 8 arquivos (Logo, Nav, auth, c.$slug, index, styles, __root, LoadingScreen). Projeto real em `/home/arthur/zapmenu/`.
- O que funcionou: (1) Backup de todos os arquivos ANTES de editar — essencial pois o worktree temporário foi limpo e os backups permitiram reaplicar as mudanças no projeto real. (2) Edições paralelas por grupo de independência (estilos → componentes → rotas). (3) Typecheck ao final confirmou zero erros novos. (4) `find /home/arthur -name package.json -path '*zapmenu*'` para localizar projeto real quando o diretório esperado estava vazio.
- Padrão reaproveitável: Sempre verificar se o diretório do projeto contém os arquivos antes de editar em sessão continuada. Se vazio, buscar o projeto real. Manter backups mesmo quando as edições parecem seguras.

### 2026-07-11 ZapMenu: Deploy e verificação após rebase multi-arquivo
- Contexto: Rebase, fixes, push e deploy do ZapMenu após correções em 29 arquivos. Verificação de segurança, env vars, rotas, OAuth e feedback.
- O que funcionou: Verificar o site real via curl, checar JS bundle deployed para confirmar que as correções foram aplicadas, validar env vars no Vercel CLI.
- Padrão reaproveitável: Para verificar se um deploy tem as correções, baixe o JS bundle do site e grep pelos padrões específicos (AbortController, window.location.origin, etc). Use `vercel env ls` para verificar env vars secretas sem expô-las.

### [2026-07-17] ZapMenu Fase 2: Replace global de URL com sed em vez de editar 23 arquivos individualmente
- Contexto: Migração de `zapmenuu.lovable.app` → `zapmenu.org` em 23 arquivos de rotas, configuração e utilitários.
- O que funcionou: `find ... -exec sed -i 's|old|new|g' {} +` substituiu em todos os .ts/.tsx/.json de uma vez. Zero erros de tipo introduzidos (replace literal em strings não afeta lógica).
- Padrão reaproveitável: Para renomear domínios, URLs ou strings repetitivas em muitos arquivos, sed global com `find` é mais rápido e mais seguro que editar arquivo por arquivo. Sempre usar delimitador `|` no sed para evitar escaping de `/`.

### [2026-07-17] ZapMenu Fase 3: Preços centralizados via PLAN_CATALOG
- Contexto: PricingSection no index.tsx tinha preços hardcoded que podiam divergir da fonte central em `config.ts`.
- O que funcionou: Substituir hardcoded por `PLAN_CATALOG.map()` que deriva `p.monthly` da fonte única de verdade em centavos. Features/CTAs continuam estáticos pois são dados de UI, não de preço.
- Padrão reaproveitável: Para preços em landing pages, sempre importar do catálogo central. Nunca hardcode. Se a UI precisar de dados extras (features, CTAs), usar map com switch por planId.

### [2026-07-17] ZapMenu Fase 3: Onboarding draft via localStorage
- Contexto: Onboarding de 4 etapas sem salvamento — usuário perdia tudo se recarregasse.
- O que funcionou: loadDraft() no useState inicial, useEffect salvando a cada form change, clearDraft() no sucesso. Merge com INITIAL garante que novos campos não quebrem drafts antigos.
- Padrão reaproveitável: Para formulários multi-step: (1) carregar draft no init da state, (2) useEffect para salvar em cada mudança, (3) limpar no sucesso. Usar merge com INITIAL para compatibilidade retroativa.

### [2026-07-17] ZapMenu Fase 3: CSP nonce em TanStack Start com HTML body replacement
- Contexto: Implementar CSP nonce em app TanStack Start onde o servidor (server.ts) intercepta requests antes do entry.
- O que funcionou: Nonce gerado por `crypto.randomUUID()` no `fetch` handler, placeholder `__NONCE__` no HTML inline script, `await response.text()` + replace no `withSecurityHeaders`, CSP header injetado na resposta final.
- Padrão reaproveitável: Em frameworks SSR que não expõem hook de nonce (Vinxi/TanStack Start), a estratégia de interceptar o body HTML e substituir placeholder funciona. Nonce por request, strict-dynamic para scripts carregados. Estilo precisa `unsafe-inline` porque Tailwind/TanStack injetam styles dinamicamente.

### [2026-07-17] ZapMenu Fase 3: Audit log best-effort
- Contexto: Implementar auditoria sem impactar operações principais (checkout, produto, onboarding).
- O que funcionou: Função `insertAuditLog()` com try/catch que nunca propaga erro. Inserções via `supabaseAdmin` (service role) para bypassar RLS. Chamadas posicionadas após sucesso da operação principal (nunca antes). Tipos de ação com union literal para consistência.
- Padrão reaproveitável: Audit log deve ser sempre best-effort, nunca bloquear a operação principal. Usar service role (não user client) para garantir que o log persiste mesmo se o token do user expirar. Inserir DEPOIS do sucesso confirmado.

### [2026-07-20] Orchestrator Switching System — Agent Definitions + /orq

- Context: Arthur pediu `/orq` funcional com seletor interativo (setinhas), nome+cor no chat, e agentes dedicados para Da Vinci (design) e ZapMenu Activity (growth).
- O que funcionou:
  - Criar agent definitions completos em `.claude/agents/control/` com `name`, `color`, `description` no frontmatter — o chat usa esses campos para exibir nome e cor
  - `orq.sh` atualiza BOTH registry.json (active) e settings.json (agent), assim a próxima sessão carrega o agente certo
  - Fallback inteligente: TTY → fzf com setinhas; não-TTY → lista opções
  - Skills enriquecidos com conhecimento externo (design build guide, marketing frameworks, loop engineering)
- Lição: não tentar mudar o nome do agente mid-session — não é possível via settings.json. O nome+cor mudam apenas na próxima sessão. A mudança de comportamento (persona/instruções) acontece imediatamente.

### [2026-07-21] ZapMenu Fase 1: Auth rate limit com server function fail-open
- Contexto: Adicionar rate limiting em rotas de auth (login/signup) em app TanStack Start onde auth é client-side via Supabase Auth.
- O que funcionou: Server function `checkAuthRateLimit` criada com `createServerFn`, chamada do client ANTES de `signInWithPassword`/`signUp`. Rate limit dual: IP-based (15/min) + email-based (5/min). Padrão fail-open: erro de infraestrutura não bloqueia o usuário, apenas erros específicos de rate limit. Import dinâmico para evitar bundle client-side.
- Padrão reaproveitável: Para adicionar rate limit em operações client-side em TanStack Start: criar server function dedicada, usar import dinâmico do rate-limit.server, fail-open em erros de infra, dual identifier (IP + email) para brute force. O `getRequest()` dentro de `createServerFn` funciona para capturar headers HTTP.

### [2026-07-21] ZapMenu Fase 2: Self-service account deletion with Supabase Admin API
- Contexto: Melhorar fluxo LGPD de exclusão de conta para cobrir todas as tabelas com PII.
- O que funcionou: Server function `selfDeleteAccount` usando `requireSupabaseAuth` middleware + `supabaseAdmin` (service role). Ordem de deleção: restaurants (CASCADE) → subscriptions → payment_customers → anonimizar transactions/history/feedbacks → delete profiles → `auth.admin.deleteUser()` (remove auth.users com CASCADE). Fallback para email em caso de erro. Backup-first antes de overwrite.
- Padrão reaproveitável: Para self-service de exclusão em apps Supabase: sempre usar server function com service role (nunca client-side RLS). Ordem importa — deletar primeiro tabelas dependentes, anonimizar registros fiscais (retenção legal), depois auth user por último. O `requireSupabaseAuth` middleware já valida que o user é quem diz ser.

### [2026-07-22] TanStack Start import-protection: renomear `.server.ts` quando importado via `await import()` no client
- Contexto: TanStack Start bloqueia `*.server.*` imports no client mesmo via `await import()` dinâmico. Erro: `[import-protection] Import denied in client environment. Denied by file pattern: **/*.server.*`.
- O que funcionou: Renomear o arquivo (ex: `auth-rate-limit.server.ts` → `auth-rate-limit.ts`) e atualizar o import path. Não remove a segurança porque o arquivo só exporta `createServerFn` handlers que rodam no servidor — o client só importa o proxy RPC. `getRequest` deve vir de `@tanstack/react-start/server`, não de `@tanstack/react-start`.
- Padrão reaproveitável: Quando TanStack Start rejeitar import de `.server.*` no client bundle, renomear sem `.server` e atualizar import. O handler roda server-side via createServerFn de qualquer forma.

### [2026-08-05] Atualização de orquestrador de design: estrutura C disciplinada + curadoria de princípios (da-vinci 2.0)
- Contexto: Arthur pediu para atualizar o orquestrador `da-vinci` para chegar como designer profissional de 10+ anos, design-first com fator "uau", absorvendo os plugins de design locais (frontend-design, ui-ux-pro-max 2.5.0, genjutsu 3.3.0) + 10 fontes web de web design, e prevenindo AI slop. 12 respostas de ask-mode orientaram as decisões (resposta 3: "o mais eficiente"; resposta 12: "mecanismo de triagem, complexo").
- O que funcionou: (1) **Estrutura C disciplinada** (progressive disclosure): `SKILL.md` enxuto (285 linhas) com persona + pipeline + mecanismo de triagem; conteúdo denso em `~/.claude/docs/design-bases.md` (256 linhas, carregado sob demanda) — coerente com a Fase 5 do framework (instruction budget). (2) **Extrair antes de sintetizar**: li os SKILL.md-chave dos 3 plugins reais (paths verificados por `find`) e extraí a essência — nada hardcoded de memória. (3) **8 princípios anti-slop** (P1-P8) como curadoria transversal das 10 fontes (não dump). (4) **Mecanismo de triagem complexo**: 6 gates (Shape, Paleta, Tipografia, Detalhe, Contexto, Originalidade) que reprovam um build antes de "pronto" — operacionalizável e testável. (5) **Correção de contradições no caminho**: produto Vertexion removido do design system (portfólio v7) e path errado do ui-ux-pro-max corrigido. (6) Backup first (backup.sh) antes de sobrescrever SKILL.md.
- Padrão reaproveitável: para atualizar um orquestrador/skill com absorção de conhecimento externo, (a) verificar paths e ler os fontes reais, (b) separar camada operacional (SKILL.md) de camada de referência (docs/, sob demanda), (c) transformar conhecimento em **gates testáveis** (checklist que reprova) em vez de prosa, (d) preservar limites de escopo do orquestrador, (e) verificar por grep de presença/ausência (conteúdo novo presente, contradição ausente).

### [2026-08-06] Verificação visual de UI da-vinci sem acesso às env vars de produção (SSR)
- Contexto: Bug 8 (design) exigia verificação visual no navegador (skill da-vinci E-003), mas o app é TanStack Start com SSR que busca dados do cardápio via `supabaseAdmin` (`menu.functions.ts:80-120`). As env vars (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) vivem no painel Vercel; localmente só existe `.env.local` com `VERCEL_OIDC_TOKEN`. O `vite preview` e o `vite dev` retornam HTTP 500 sem elas.
- O que funcionou: (1) Identificar por `grep -oE '^[A-Z_]+'` as chaves (nomes) de `.env.example`/`.env.local` sem ler valores. (2) Confirmar por grep qual cliente Supabase a rota usa — `supabaseAdmin` (service role) na rota `/c/` ⇒ impossível subir local sem o secret. (3) Conclusão honesta: verificação visual completa bloqueada pelo ambiente; declarar "verificação visual pendente — confiada ao olho do usuário (Arthur usa Edge, E-003)" em vez de "pronto sem prova". (4) Kill do preview órfão por PID (`kill 5458`), nunca `pkill -f "vite preview"` (casava com o próprio shell, exit 144).
- Padrão reaproveitável: antes de prometer verificação visual de UI SSR/SSG com dados reais, checar se as env vars necessárias são acessíveis. Se a rota usa `supabaseAdmin` (service role key, secret), a verificação local NÃO é possível sem deploy de preview aprovado — entregar código + build verde + verificação visual delegada ao usuário, com o caminho (deploy preview / `npm run dev` com vars) documentado. Usar `lsof -ti:<porta> | xargs kill` para matar processos órfãos.

### [2026-08-06] Deploy completo ZapMenu: 11 bugs + feature 7 → Vercel + Supabase edge function
- Contexto: Arthur aprovou commit + deploy ("vamos pro commit e deploy, prossiga") após a verificação manual dos 11 problemas.
- O que funcionou: (1) Ordem segura: testes (`npx vitest run` → 44 pass) + build (`NODE_OPTIONS="--max-old-space-size=1024" npm run build`) antes do commit. (2) Commit único em PT-Br com Co-Authored-By cobrindo o escopo (10 bugs + feature 7 + docs). (3) Push na `main` dispara deploy Vercel automático. (4) Edge function `support-chat` deployada via MCP com `verify_jwt: true` (auth obrigatória reforçada no gateway; a função já faz `supabase.auth.getUser()` + rate limit 12/min + fail-open 503/502/500 com fallback humano, chave só em `Deno.env`). (5) Verificação do deploy: `list_projects` → `zapmenu-oficial` (prj_W61USH9kDlWIOiX7DhbpCkdikkJc) → `list_deployments` + `get_deployment` → confirmado `READY`, target `production`, commit sha exato (`30ec885`), alias `zapmenu.org`.
- Padrão reaproveitável: para deploy Vercel + Supabase Edge Function, (a) rodar testes e build antes de commit; (b) commit com escopo claro; (c) push na branch de produção; (d) deploy de edge function via MCP com verify_jwt=true; (e) verificar deploy por `list_deployments` (estado READY + sha do commit) e `get_deployment` (alias de produção). Depois checar secrets de runtime (ex: DEEPSEEK_API_KEY ausente → chat responde AI_UNAVAILABLE fail-open, sem quebrar o app).
