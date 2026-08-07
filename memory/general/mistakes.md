# Erros confirmados

### [2026-08-06] Validação i18n com falso positivo (ZapMenu 1C)
- Contexto: validei legal.json após trocar emails hardcoded por `SITE_CONFIG.contact.*`. Meu script marcou `terms.section2Body`/`terms.section6Body`/`refund.section6Body` como "resíduo" em en/es/fr.
- O que eu assumi errado: que toda chave `sectionXBody` deveria existir em todos os locales.
- Como devo verificar da próxima vez: checar se o `t()` tem `defaultValue` antes de tratar chave ausente como bug. `termos.tsx` e `politica-de-reembolso.tsx` usam `t("...", { defaultValue })` — chave ausente cai no defaultValue (gap de tradução, NÃO vazamento). Vazamento real = `t("chave")` SEM defaultValue renderizando a string literal.


### [2026-08-05] False negative em grep de fidelidade por `$` não escapado na shell (Fase 5)
- Contexto: Verificando fidelidade do CLAUDE.md comprimido (Fase 5, 111→48 linhas), rodei `grep -q "orçamento autônomo R$0"` e retornou false — parecia que a regra tinha sido perdida na compressão. A string EXISTIA no arquivo (CLAUDE.md:29); o grep é que estava errado.
- O que eu assumi errado: Em aspas duplas, a shell expande `$0` (nome do processo/script) ANTES de o grep ver o padrão — o padrão real virava `R<bash>` e não correspondia a `R$0` literal. False negativo gerado pelo meu comando, não pelo arquivo.
- Como devo verificar da próxima vez: Em grep de padrões com `$`, SEMPRE escapar `\$` (`grep -n 'R\$0'`) ou usar aspas simples para padrão literal. Antes de aceitar um grep false como "conteúdo ausente", confirmar que o padrão não foi mutado pela shell.

### [2026-08-05] Fase 4 ultrathink2: confundi "J-Space" com "explorar espaço de soluções"
- Contexto: Criei `rules/ultrathink2.md` (Fase 4) com uma Fase 1 chamada "J-Space Reasoning" que na verdade descrevia exploração de espaço de decisão (dimensões, espectro de valores, zonas não exploradas). Arthur pediu para verificar se o ultrathink2 usava os conteúdos de J-Space do documento + estilo de raciocínio de IA de alto nível. Verificação revelou que NÃO usava — o nome "J-Space" foi aplicado a um conceito genérico de busca, não ao conceito canônico.
- O que eu assumi errado: Que "J-Space" era uma metáfora minha reutilizável para "explorar o espaço de soluções". Na verdade, J-Space é um termo técnico específico da pesquisa da Anthropic (jul/2026): o "global workspace" interno que Claude criou sem querer no treinamento — padrões neurais verbais que operam em silêncio, descobertos via Jacobian Lens, com 5 propriedades (Relato, Modulação Dirigida, Raciocínio Interno Não-Verbal, Generalização Flexível, Seletividade) + monitoramento vetorial (WARNING/dangerous) + desacoplamento CoT vs raciocínio interno + counterfactual reflection training.
- Como devo verificar da próxima vez: (1) Quando o usuário citar um termo técnico que veio de pesquisa/documento ("J-Space", "Fable", "global workspace"), NUNCA reutilizar o nome com significado próprio — buscar o significado canônico em fonte primária (transformer-circuits.pub, anthropic.com/research) antes de escrever. (2) Após criar regra que referencia conceito externo, verificar fidelidade conceitual (não só presença do termo). (3) Fonte primária ancorada: https://www.anthropic.com/research/global-workspace + https://transformer-circuits.pub/2026/workspace/index.html.

### [2026-08-05] run-loop.sh: `claude: command not found` por PATH ausente + agente v5 arquivado
- Contexto: Loop diário de triagem (L1) registrou no STATE.md: `run-loop.sh: line 21: claude: command not found` às 08:00. O binário `claude` existe em `~/.local/bin/claude` (v2.1.220), mas cron/systemd não herdam `~/.local/bin` no PATH. Além disso, o script invocava `--agent engineering-loop-triage`, que era um agente v5 (agora arquivado em `archive/agents-v5/`).
- O que eu assumi errado: Assumi que o binário `claude` estaria no PATH de qualquer executor. Scripts invocados por cron/timer não herdam o PATH interativo do usuário.
- Como devo verificar da próxima vez: (1) Em scripts que rodam via cron/systemd, SEMPRE `export PATH="$HOME/.local/bin:$PATH"` no topo antes de `command -v`. (2) Ao arquivar agentes, grep por referências ao agente em scripts/LOOP: `grep -rn "engineering-loop-triage\|run-loop" --include="*.sh" --include="*.md" .`. (3) Após mover agentes para archive, validar que nenhum `--agent <nome>` aponte para nome arquivado.

### [2026-08-05] jq `del()` com chave de hífen zerou known_marketplaces.json (0 bytes)
- Contexto: Removendo obsidian-skills de `~/.claude/plugins/known_marketplaces.json`. Primeiro usei `jq 'del(.obsidian-skills)'` → erro "skills/0 is not defined" (jq interpreta o hífen como subtração de campos). A correção `del(.["obsidian-skills"])` foi executada, mas a sequência com `set -e` + redirecionamento deixou o arquivo em **0 bytes (corrompido)**. Backup pré-existente em `~/.claude/backups/` salvou.
- O que eu assumi errado: (1) Que chave com hífen em jq não precisa de aspas no filtro. Na verdade, `del(.a-b)` = `del(.a - .b)`, subtração — SEMPRE usar `.["a-b"]` com aspas. (2) Que `set -e` protegeria o arquivo original — mas o redirecionamento `> arquivo` é truncado pela shell ANTES de jq rodar; com pipeline intermediário, o `mv`/redirecionamento final pode sobrescrever com arquivo vazio se o jq falhou silenciosamente.
- Como devo verificar da próxima vez: (1) SEMPRE `del(.["chave-com-hifen"])` com aspas na chave. (2) Para edição de JSON in-place: gerar em `/tmp/` → `test -s` + `jq -e .` → só então `mv`. Nunca redirecionar `> arquivo` direto. (3) Confirmar `wc -c` > 0 e `jq -e .` passou ANTES e DEPOIS de qualquer mv.

### [2026-07-11] ZapMenu: tsc --noEmit e vite build travam (pre-existing environment issue)
- Contexto: ZapMenu project, running `tsc --noEmit` for typecheck or `vite build` for bundling. Both commands hang indefinitely (2+ minutes then timeout).
- O que eu assumi errado: Assumi que o projeto podia executar typecheck/build isoladamente como em projetos Next.js/React normais.
- Como devo verificar da próxima vez: O ZapMenu compila via TanStack Start / Vinxi em runtime — o comando `npm run dev` funciona normalmente, e `npm run build` (que usa Vinxi por baixo) também funciona. Typecheck/build isolados com tsc --noEmit ou vite build travam por um problema pre-existente de ambiente, não relacionado a mudancas de codigo. Quando tsc --noEmit travar, pule-o e confie em code review manual + lint para verificacao.


### [2026-07-22] Auditoria de segurança: subestimei severidade do i18n e errei OAuth dead code
- Contexto: Validando auditoria de segurança do ZapMenu (10 alegações). Classifiquei i18n como 🟡 "só flash" e OAuth dead code como 🟢 falso positivo.
- O que eu assumi errado: (1) Assumi que hydration mismatch nunca causa white screen — sem Error Boundary, uma re-renderização em massa do i18n + Framer Motion pode derrubar a árvore React. (2) Não percebi que o bloco `access_denied` em auth.callback.tsx era inalcançável — o `if (oauthError)` anterior já capturava TODOS os erros e dava return.
- Como verificar da próxima vez: (1) Em alegações de hydration/white screen, verificar se existe Error Boundary. Sem ele, QUALQUER erro de renderização vira tela branca. (2) Em dead code de handler: verificar se condições anteriores já capturam o mesmo case com return — não confiar apenas na leitura linear. (3) Validar severidade assumindo pior caso quando não há fallbacks.

### [2026-07-22] Reescrita checkout: não verifiquei todas as rotas que usam o contrato antigo
- Contexto: Reescrita do checkout AppMax. Atualizei planos.tsx mas esqueci de dashboard.tsx e onboarding.tsx, que também têm checkout modal. Auditor detectou.
- O que eu assumi errado: Assumi que só planos.tsx usava o checkout modal. Na verdade, 3 rotas usam appmaxCheckout.
- Como verificar da próxima vez: Antes de mudar contrato de server function, grep por todas as referências da função: `grep -rn "appmaxCheckout\|paymentMethod" src/routes/`.


### [2026-07-17] ZapMenu Fase 3: Duplicação de variável após múltiplos Edits no mesmo arquivo
- Contexto: Em `c.$slug.tsx`, após várias edições, adicionei `let hours: DayHours[] = ...` que colidiu com declaração existente, e em `index.tsx` um Edit composto criou linha `className` duplicada.
- O que eu assumi errado: Assumi que cada Edit é independente e não preciso verificar o estado final do arquivo após múltiplas operações.
- Como devo verificar da próxima vez: Após 3+ Edits no mesmo arquivo (especialmente adicionando declarações novas), faça grep rápido para confirmar sem duplicatas: `grep -n "let hours\|const.*=" arquivo.tsx | head -20`. Edit opera por string match, então Edits compostos podem criar duplicatas silenciosas.

### [2026-07-17] ZapMenu Fase 2: Status "abandoned" não existe no enum do tipo Supabase
- Contexto: Adicionando expiração de pagamentos pendentes em `checkout.server.ts`. Usei o status "abandoned" como novo estado para transações expiradas.
- O que eu assumi errado: Assumi que qualquer string valeria como status de transação. Na verdade, o tipo Supabase gerado restringe para um enum específico.
- Como devo verificar da próxima vez: Antes de usar um valor de enum/status novo, verificar o tipo da coluna no schema Supabase ou no código (grep por `status.*=.*"pending"` próximo à definição do tipo). Neste caso, "expired" já existia e era a escolha correta.

### [2026-07-17] Migration SQL: "column does not exist" por tabela Lovable pré-existente
- Contexto: Criando migration SQL com CREATE TABLE IF NOT EXISTS para orders no ZapMenu. Supabase já tinha a tabela (gerada pelo Lovable) mas sem as colunas novas (role, status etc).
- O que eu assumi errado: Assumi que a tabela orders não existia remotamente ou que CREATE TABLE IF NOT EXISTS adicionaria colunas novas. Na verdade, IF NOT EXISTS pula a tabela inteira se ela já existe — colunas novas nunca são criadas.
- Como devo verificar da próxima vez: (1) Em projetos Lovable, considerar que TODAS as tabelas do schema atual já existem remotamente. (2) Para colunas novas EM QUALQUER tabela que pode existir, usar ALTER TABLE ADD COLUMN IF NOT EXISTS como fallback — nunca confiar só em CREATE TABLE IF NOT EXISTS. (3) Rodar `supabase db pull` primeiro para ver schema real.

### [2026-08-06] ZapMenu Bug 8: tentei `vite preview` para verificação visual sem as env vars de produção
- Contexto: A skill da-vinci (E-003) exige verificação visual antes de "pronto". Para o bug 8 (cardápio), subi `npx vite preview --port 4173` e recebi HTTP 500 porque o SSR não encontra `SUPABASE_URL`/`SUPABASE_PUBLISHABLE_KEY`.
- O que eu assumi errado: Assumi que as env vars estariam em `.env`/`.env.local` local (não existem) ou que a rota `/c/` não precisaria de secrets. Na verdade a rota usa `supabaseAdmin` (`menu.functions.ts:80-120`) e o service role key vive no painel Vercel — inacessível.
- Como devo verificar da próxima vez: ANTES de tentar preview/dev para verificação visual, checar (1) `ls .env*` e `grep -oE '^[A-Z_]+' .env.example` para saber quais vars existem localmente; (2) qual cliente Supabase a rota-alvo usa (grep `supabaseAdmin`); (3) se a rota precisa de service role key, PULAR a tentativa local e declarar "verificação visual pendente — confiada ao olho do usuário". Para matar processos órfãos usar `lsof -ti:<porta> | xargs kill`, nunca `pkill -f` com padrão que case com o próprio shell.

### [2026-08-06] `supabase secrets list` exibiu valores de secrets no output
- Contexto: Para verificar se o secret DEEPSEEK_API_KEY existia antes do deploy da edge function support-chat, rodei `supabase secrets list --project-ref fecqfbvpifpirdjinhes`.
- O que eu assumi errado: Assumi que `supabase secrets list` listaria apenas nomes. Na verdade, a CLI do Supabase retorna os VALORES dos secrets no output (formato JSON com campo "value"), que caíram no transcript — violando a regra "nunca ler/exibir/registrar valores de credenciais".
- Como verificar da próxima vez: NUNCA rodar `supabase secrets list` (expõe valores). Para checar a existência de um secret, (1) tentar via painel/API com resposta mascarada, ou (2) confirmar indiretamente (ex: deploy da edge function e testar runtime — sem a env, ela responde 503/AI_UNAVAILABLE), ou (3) pedir ao usuário para confirmar. Se o output vazar valores, NÃO repetir, NÃO registrar, NÃO usar; documentar apenas a conclusão (presença/ausência).
