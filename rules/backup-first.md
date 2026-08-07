# Backup-First Policy
Ativado por: ação destrutiva (delete, overwrite, migration, rm -rf).

## Protocolo
```bash
bash ~/.claude/vertexion-agent-system/scripts/backup.sh <arquivo>
```
Copia para `~/.claude/backups/[data]/[horario]_[arquivo].bak`

Rollback: `cp <backup> <local-original>`
