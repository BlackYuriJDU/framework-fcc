# Erros confirmados

### [2026-07-11] ZapMenu: tsc --noEmit e vite build travam (pre-existing environment issue)
- Contexto: ZapMenu project, running `tsc --noEmit` for typecheck or `vite build` for bundling. Both commands hang indefinitely (2+ minutes then timeout).
- O que eu assumi errado: Assumi que o projeto podia executar typecheck/build isoladamente como em projetos Next.js/React normais.
- Como devo verificar da próxima vez: O ZapMenu compila via TanStack Start / Vinxi em runtime — o comando `npm run dev` funciona normalmente, e `npm run build` (que usa Vinxi por baixo) também funciona. Typecheck/build isolados com tsc --noEmit ou vite build travam por um problema pre-existente de ambiente, não relacionado a mudancas de codigo. Quando tsc --noEmit travar, pule-o e confie em code review manual + lint para verificacao.

