# React Patterns (Vertexion Ecosystem)

## Componentes
- Server components por padrão, `'use client'` só quando necessário (eventos, estado, effects)
- Shadcn/ui de `@/components/ui/`
- `@/` path alias, nunca `../../`
- Loading + error + empty states para TODO componente que depende de dados

## Data Fetching
- Server Functions (TanStack Start), NUNCA `useEffect` para dados
- TanStack Query para cache no cliente quando necessário
- `createServerFn` com `.middleware([requireSupabaseAuth])` + `.inputValidator()`

## Roteamento (TanStack Router)
- File-based em `src/routes/`
- Route guards via `beforeLoad` com auth check
- `<Link>` para navegação, não `<a>`
- Lazy routes para code-splitting

## Performance
- Evitar N+1: busque dados relacionais em uma query só
- Memo apenas em renders pesados (listas grandes, charts)
- Windowed lists (react-window/ virtuoso) para 100+ itens
