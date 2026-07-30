# Erros confirmados

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
