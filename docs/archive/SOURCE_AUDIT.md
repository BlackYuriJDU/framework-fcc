# Auditoria dos pacotes recebidos

## Configuração Claude antiga

- 28 Skills e 15 comandos, além de caches, históricos e backups.
- O README citava agentes que não estavam presentes na pasta global.
- Havia credencial Tavily em URL de MCP e tokens em configuração local.
- Decisão: não migrar caches, históricos, backups, comandos antigos ou credenciais. Substituir apenas componentes autorais globais, mantendo backup.

## seu-projeto-agents

- A implementação moderna em `src/scout/` possui lock, estado, Tavily, Groq em lotes, validação, deduplicação, persistência atômica, Supabase e Telegram opcionais.
- A implementação antiga em `agents/` e `mcp/` duplica responsabilidades.
- Decisão: preservar apenas Scout moderno; remover legado, logs e dados pessoais do pacote.

## seu-projeto

- Aplicação TanStack Start/React 19/Supabase/seu-gateway-de-pagamento.
- Ambiente enviado continha segredos reais.
- Não há script de typecheck ou testes no package.json analisado.
- seu-gateway-de-pagamento, inadimplência, limites dos planos e ambiente de produção ainda exigem validação.

## Toveli

- Expo SDK 56, React Native, Expo Router, SQLite, Secure Store, notificações e RevenueCat.
- Entrada `main: index.ts` registra o App padrão e provavelmente ignora `app/`.
- Configurações Expo divergentes, sem `eas.json`, assets possivelmente ausentes e sem scripts de validação.

## Tenvyr

- Template Vite/React/Tailwind quase sem implementação funcional.
- Definição oficial consolidada como change intelligence.

## Signalys

- TanStack Start, Supabase, invoices, workspaces, equipe, políticas, migrations e integrações.
- Documento antigo usava “Signaly”; decisão atual é **Signalys**.
- Follow-up real, integrações, rate limit e mocks precisam de confirmação.

## Vertexion

- Plataforma avançada com cliente, Dev, ChatVD, Idea Score, Launch Score, projetos, planos, seu-gateway-de-pagamento, tokens e integrações.
- Risco principal: desenvolvimento concentrado no lado Dev, esquecendo o cliente.
