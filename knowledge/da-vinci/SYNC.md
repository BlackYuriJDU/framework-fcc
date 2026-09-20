# Sync de Conhecimento — Da Vinci

Sincronize os repositórios curados deste orquestrador:

```bash
# Dry-run (R$0, lista o que seria clonado) — SEMPRE o primeiro passo
bash ~/.claude/vertexion-agent-system/scripts/sync-knowledge.sh --check da-vinci

# Clone real — ação externa → requer aprovação explícita de o proprietário
bash ~/.claude/vertexion-agent-system/scripts/sync-knowledge.sh da-vinci
```

- Clones são `shallow --depth 1`, idempotentes (não reclona se o dir já existir).
- Sem `--check`, o script lista o plano e pede confirmação explícita antes de qualquer clone.
