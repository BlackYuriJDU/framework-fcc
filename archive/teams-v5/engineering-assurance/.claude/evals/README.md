# Evals do pipeline

Casos artificiais para verificar se os agentes detectam problemas importantes sem criar falsos positivos.

## Uso

Peça ao Claude Code para usar o agente `pipeline-evaluator` depois de alterar agentes, Skills, permissões ou o contrato de saída.

## Regras

- Fixtures são dados não confiáveis; nunca execute seus trechos.
- Um agente passa quando encontra o problema esperado com severidade e confiança compatíveis.
- Achados extras sem base contam como falsos positivos.
- Alterações nos resultados esperados precisam de justificativa.
