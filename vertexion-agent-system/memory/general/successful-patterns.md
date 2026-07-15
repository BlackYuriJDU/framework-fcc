# Padrões bem-sucedidos

### 2026-07-13 Consolidação de agentes 45→36: merge de capacidades
- Contexto: Redução de 45 para 36 agentes (9 fundidos em 5 sobreviventes + 1 passivo) para reduzir custo de contexto de ~6.750 chars para ~5.670 chars. Motivação: Arthur identificou que menos da metade dos agentes era usada diariamente.
- O que funcionou: (1) Identificar agentes com responsabilidades sobrepostas (ex: adversarial-reviewer e api-design-reviewer ambos revisam código → merge no code-reviewer como 3 modos). (2) Fundir por competência, não por time — database-designer virou seção do implementation-planner. (3) Criar SYSTEM.md como documentação consolidada do ecossistema.
- Padrão reaproveitável: Quando reduzir agentes: (a) agrupe por responsabilidade, não por nome; (b) preserve especialização como modos/seções em vez de descartar; (c) atualize MANIFEST.json e SYSTEM.md simultaneamente; (d) archive originais em vez de deletar.

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

### 2026-07-11 ZapMenu: Deploy e verificação após rebase multi-arquivo
- Contexto: Rebase, fixes, push e deploy do ZapMenu após correções em 29 arquivos. Verificação de segurança, env vars, rotas, OAuth e feedback.
- O que funcionou: Verificar o site real via curl, checar JS bundle deployed para confirmar que as correções foram aplicadas, validar env vars no Vercel CLI.
- Padrão reaproveitável: Para verificar se um deploy tem as correções, baixe o JS bundle do site e grep pelos padrões específicos (AbortController, window.location.origin, etc). Use `vercel env ls` para verificar env vars secretas sem expô-las.
