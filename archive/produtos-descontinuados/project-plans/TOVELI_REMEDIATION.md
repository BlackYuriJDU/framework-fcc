# Toveli — correção e retomada segura

## Estado identificado no pacote recebido

- Expo SDK 56 e React Native.
- Expo Router esperado pelas rotas em `app/`.
- SQLite, Secure Store, notificações e RevenueCat preparados.
- `package.json` usa `main: index.ts`.
- `index.ts` registra o `App.tsx` padrão, podendo ignorar todas as rotas reais.
- `app.json` e `app.config.ts` divergem.
- Assets referenciados podem não existir.
- Não há `eas.json`.
- Não há scripts explícitos de typecheck, lint, testes e build.
- Há artefatos de build e um arquivo de nome corrompido no pacote.

## Objetivo da primeira rodada

Fazer o aplicativo abrir na rota correta sem alterar escopo de produto, banco ou UX além do necessário.

## Sequência

1. Criar branch ou worktree isolado.
2. Executar scanner de segredos sem ler valores.
3. Registrar árvore, versões, `expo-doctor` e estado Git.
4. Confirmar compatibilidade do SDK com Expo Router.
5. Trocar a entrada para `expo-router/entry` ou configuração equivalente da versão instalada.
6. Remover a entrada padrão somente após provar que não é usada.
7. Consolidar `app.json` e `app.config.ts` numa fonte principal.
8. Corrigir nome, slug, package, scheme, plugins e caminhos de assets.
9. Confirmar existência e dimensões de ícone, splash e adaptive icon.
10. Adicionar scripts de `typecheck`, diagnóstico e build sem instalar dependências não aprovadas.
11. Criar `eas.json` com:
    - `development` para desenvolvimento;
    - `preview` para APK interno;
    - `production` para AAB.
12. Executar `npx expo-doctor` e TypeScript.
13. Iniciar localmente e verificar login/navegação/telas.
14. Gerar preview EAS somente após aprovação.

## Persistência

- Manter SQLite/local no MVP.
- Não mostrar ao usuário aviso de armazenamento provisório.
- Preservar repositories/abstrações para migração futura ao Supabase.
- Não iniciar migração de banco durante a correção do boot.

## Critérios de aceitação

- App abre sem tela padrão do Expo.
- Rota inicial real é carregada.
- Não há crash imediato no Android.
- Configuração Expo possui uma fonte de verdade.
- `expo-doctor` sem erro bloqueador.
- Typecheck aprovado ou lista objetiva de erros legados.
- APK de preview instalável, após autorização.
- Nenhum segredo, dado real ou mudança comercial introduzido.

## Rollback

Manter branch original intacta. Se a entrada nova falhar, restaurar `package.json`, `index.ts` e configurações Expo a partir do commit/checkpoint, sem apagar mudanças não relacionadas.
