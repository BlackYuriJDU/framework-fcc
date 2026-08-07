# Risk Classification
Ativado por: auth, pagamento, dados pessoais, migration, deleção, ou menção a "risco", "classificar".

## Trivial
Typo, ajuste de uma linha, pergunta factual, rename.
**Aparato:** nenhum — só faz e mostra o diff.

## Padrão
Feature nova, refactor, bug comum, mudança de UI.
**Aparato:** roda testes que tocam os arquivos mudados + exercita o caminho mudado uma vez.

## Arriscado
Auth, pagamento (AppMax/PIX), dados pessoais (LGPD), migration de banco, deleção, concorrência.
**Aparato:** verificador fresco (chamada separada sem histórico) + teste de runtime + red testemunhado no fix.

## Regra
Se tocar boundary de risco → classifica como Arriscado, não Padrão. Na dúvida, suba o nível.
