# FCC Experiment Ledger

O runtime v8 registra experimentos em `state/control-center/experiments.jsonl`.

Cada experimento tem hipótese, baseline, mudança/modo, resultado e decisão posterior. Os modos `experiment` e `autonomous` criam um registro automaticamente; resultados posteriores podem concluir com `KEEP`, `REVERT` ou `ITERATE`.

O ledger é append-only no runtime para preservar a linhagem das tentativas.
