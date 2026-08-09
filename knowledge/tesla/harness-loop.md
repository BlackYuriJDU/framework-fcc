# Engineering Harness — Sistema Loop

> Inspirado no sistema de loop-engineering do Claude Code e no arXiv 2607.13683.

## Estrutura

Cada tarefa de engenharia segue um ciclo de 5 estágios:

```
Goal → Plan → Act → Verify → Schedule
```

### Goal Spec (PROMPT.md)
- Critério de "done" explícito antes de começar
- Métricas de sucesso
- Restrições (tempo, recursos, segurança)

### Plan
- Arquivos envolvidos
- Passos discretos
- Riscos previstos
- Rollback planejado

### Act (Execute)
- Execução isolada (worktree)
- State on disk (checkpoint)
- Cada passo verificado antes do próximo

### Verify (Verifier Sub-agent)
- Usar agente separado para verificar resultado
- Nunca auto-verificar sem evidência independente
- Evidência Ledger obrigatório

### Schedule
- Próxima execução? (cron / loop / manual)
- O que mudou que requer re-execução?

---

## State on Disk

Progresso salvo em `data/` entre execuções:

```
data/
  state.json        — Checkpoint atual (fase, resultados parciais)
  state.json.tmp    — Atomic write (nunca corrompe)
  logs/             — Logs por execução (runId)
```

### Formato de state.json

```json
{
  "runId": "run-20260719-abc123",
  "phase": "plan|act|verify",
  "goal": "Descrição do objetivo",
  "startedAt": "ISO timestamp",
  "artifacts": ["caminho/para/arquivo"],
  "errors": [],
  "status": "running|done|error"
}
```

---

## Context Pruning

- Cada execução gasta ~2k tokens de contexto
- Após 5 execuções consecutivas no mesmo tópico, compactar:
  1. Manter: Goal, último Plan, último Verify, estado atual
  2. Remover: Act logs detalhados, execuções intermediárias bem-sucedidas
  3. Arquivo: histórico completo em `logs/` com runId

---

## Isolamento via Worktree

Para tarefas com risco de quebrar o repositório principal:

```bash
git worktree add ../task-temp
cd ../task-temp
# ... work ...
git commit -m "task result"
cd ..
git worktree remove ../task-temp
```

---

## Thresholds e Limites

- Timeout por execução: configurável (default 120s)
- Retry: 3 tentativas com exponential backoff (1s, 2s, 4s)
- Máximo de execuções consecutivas sem verificação: 1
- Se 3 verificações consecutivas falharem → PARE e relate
