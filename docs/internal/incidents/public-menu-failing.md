# Menu público indisponível

## Sintoma

## Como confirmar

- Reproduzir de forma não destrutiva.
- Registrar horário, URL/fluxo, status e evidência redigida.
- Conferir se é incidente geral ou usuário isolado.

## Diagnóstico inicial

Verificar slug, consulta pública, RLS, cache, domínio e assets. Preservar admin e dados.

## Ação segura permitida

- health checks;
- leitura de logs sem segredos;
- reprodução local/staging;
- correção em branch;
- testes e preview após aprovação.

## Ações proibidas sem o proprietário

- produção;
- migration remota;
- alteração de pagamento ou dados reais;
- rotação de segredo;
- exclusão/reset;
- deploy/rollback.

## Rollback

## Validação da recuperação

## Quando escalar

Escalar imediatamente em perda de dados, cobrança incorreta, exposição de segredo, indisponibilidade ampla ou risco legal.
