# TypeScript Patterns (Vertexion Ecosystem)

## Configuração
- `strict: true` — sempre. Nada de `strict: false` ou `strict: null`
- `noUncheckedIndexedAccess` — tratar array access como `T | undefined`

## Tipos
- `interface` para APIs públicas (props, services, configs)
- `type` para unions, utility types, e tipos derivados
- `z.infer<typeof schema>` para tipos derivados de schemas de validação

## Regras
- `any` NUNCA sem justificativa comentada (`// eslint-disable-next-line @typescript-eslint/no-explicit-any — motivo:`)
- Async functions SEMPRE retornam `Promise<T>` tipado (nunca `Promise<any>`)
- Null/undefined: `??` (nullish coalescing), nunca `||` para defaults
- Discriminated unions para estado complexo (loading | success | error)
- Enums para string columns no banco (const enums preferidos)
