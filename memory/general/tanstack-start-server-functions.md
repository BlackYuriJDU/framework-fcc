# TanStack Start: Como testar server functions

> Criado: 2026-07-11
> Projeto: ZapMenu
> Stack: TanStack Start (TanStack Router + Vinxi + Vite)

## Arquitetura RPC

TanStack Start usa **Seroval** para serializar/deserializar dados entre server functions e o cliente. A comunicação RPC é gerenciada automaticamente pelo runtime do TanStack Start, não por chamadas HTTP diretas.

## Como NÃO testar

- **curl ou Postman com JSON body**: Falha com `"Seroval Error (step: 3)"`.
- **Chamada fetch direta ao endpoint**: O endpoint espera payload serializado no formato Seroval, nao plain JSON.
- **Teste unitario isolado da server function**: A funcao depende do contexto Vinxi/request do TanStack Start.

## Como testar corretamente

### 1. Pelo navegador (recomendado)

A forma mais simples e fiel:

```bash
# Iniciar dev server
npm run dev
```

Depois navegue ate a pagina que chama a server function e verifique o resultado no UI ou pelo DevTools > Network.

### 2. Teste E2E com Playwright (recomendado para CI)

```bash
npx playwright test
```

O Playwright executa no browser real, entao a serializacao Seroval acontece automaticamente.

### 3. Teste a camada de dados isoladamente

Se precisar testar a logica de negocios sem depender do runtime TanStack:

1. Extraia a logica para uma funcao pura separada.
2. Teste essa funcao pura com Jest/Vitest.
3. A server function se torna um wrapper fino que chama a funcao pura.

Exemplo:

```typescript
// server-functions.ts
import { createServerFn } from '@tanstack/start'
import { processOrder } from './lib/order-logic'

export const submitOrder = createServerFn({ method: 'POST' })
  .validator((data: unknown) => data as OrderInput)
  .handler(async ({ data }) => {
    return processOrder(data)
  })

// lib/order-logic.ts (testavel unitariamente)
export function processOrder(data: OrderInput) {
  // logica pura aqui
}
```

### 4. Inspecao visual do bundle (deploy)

Para verificar se uma correcao em server function foi deployed:

```bash
# Baixar JS bundle do site e buscar por padrao
curl -s https://zapmenu.com.br/assets/...js | grep -o 'seu-padrao-aqui'
```

## Resumo

| Metodo | Server Functions | Recomendado |
|--------|-----------------|-------------|
| curl / Postman | Falha (Seroval Error) | Nao |
| Teste unitario direto | Falha (falta contexto) | Nao |
| Navegador manual | Funciona | Sim |
| Playwright E2E | Funciona | Sim |
| Teste de logica extraida | Funciona | Sim (cobertura) |
