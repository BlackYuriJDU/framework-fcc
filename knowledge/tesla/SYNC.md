# Sync de Conhecimento — Tesla

Sincronize os repositórios curados deste orquestrador:

```bash
# Dry-run (R$0, lista o que seria clonado) — SEMPRE o primeiro passo
bash ~/.claude/vertexion-agent-system/scripts/sync-knowledge.sh --check tesla

# Clone real — ação externa → requer aprovação explícita de o proprietário
bash ~/.claude/vertexion-agent-system/scripts/sync-knowledge.sh tesla
```

- Clones são `shallow --depth 1`, idempotentes (não reclona se o dir já existir).
- Repos gigantes (semgrep, codeql, biome, oxc, matomo) NÃO são clonados — estão em `pointers.md` por URL.
- Sem `--check`, o script lista o plano e pede confirmação explícita antes de qualquer clone.
