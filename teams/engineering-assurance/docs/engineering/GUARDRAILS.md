# Guardrails de engenharia

Regras permanentes aprovadas para o projeto.

## Escopo

- Alterar somente o necessário para cumprir o pedido.
- Efeitos colaterais inevitáveis precisam ser explicados no relatório.
- Refatorações amplas, redesigns e mudanças de arquitetura não são correções automáticas.

## Segredos

- Nunca versionar `.env`, tokens, chaves privadas, service role ou credenciais de provedor.
- Nunca imprimir segredo em logs, relatórios, erros ou respostas.
- Arquivos `.env.example` devem conter somente nomes e valores fictícios.

## Backend e autorização

- Regras de acesso, preços, planos, papéis e status financeiro são validados no backend.
- Falha de validação deve negar a operação, não liberar acesso.
- O cliente nunca é fonte de verdade para ownership ou autorização.

## Supabase

- Ativar RLS em tabelas expostas.
- Validar leitura com `USING` e gravação com `WITH CHECK` quando aplicável.
- RPCs e funções `SECURITY DEFINER` precisam validar usuário e fixar `search_path`.
- Service role somente em ambiente servidor protegido.
- Testar acesso cruzado entre pelo menos dois usuários quando houver dados privados.

## Pagamentos

- Preço, desconto e plano são resolvidos no backend.
- Webhooks exigem autenticidade, idempotência e transições válidas de status.
- Eventos duplicados, atrasados e fora de ordem não podem corromper a assinatura.
- Falha parcial entre provedor e banco precisa de reconciliação segura.

## Migrations

- Nenhuma migration destrutiva sem impacto, backup ou estratégia de rollback.
- Preservar compatibilidade durante rollout quando aplicação e banco puderem ficar em versões diferentes.
- Não aplicar migration remota automaticamente.

## Qualidade

- Não declarar sucesso somente por build.
- Adicionar teste de regressão para bugs confirmados quando tecnicamente viável.
- Validar fluxo afetado em execução e registrar limitações reais.
