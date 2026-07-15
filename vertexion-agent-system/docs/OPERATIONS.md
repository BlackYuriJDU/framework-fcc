# Operação

```bash
vertexion-doctor
vertexion-discover
vertexion-start
vertexion-stop
vertexion-routine daily
vertexion-routine weekly
vertexion-routine monthly
```

## Recuperação

Os backups ficam em `~/.claude/backups/vertexion-pre-<timestamp>`.

Para depurar configuração do Claude, inicie uma sessão com `claude --safe-mode` e compare.

## Dashboard

- Bind somente em `127.0.0.1`.
- Porta padrão 3741.
- Estado em `~/.claude/vertexion-agent-system/state/control-center`.
- Não exponha a porta para a internet.
