# Sync de Conhecimento — Einstein

Sincronize os repositórios curados deste orquestrador:

```bash
# Dry-run (R$0, lista o que seria clonado) — SEMPRE o primeiro passo
bash ~/.claude/vertexion-agent-system/scripts/sync-knowledge.sh --check einstein

# Clone real — ação externa → requer aprovação explícita de Arthur
bash ~/.claude/vertexion-agent-system/scripts/sync-knowledge.sh einstein
```

- Clones são `shallow --depth 1`, idempotentes (não reclona se o dir já existir).
- A coleção curada (claude-seo, pricing, contract-review, etc.) é lida por URL em `pointers.md` — curar URLs reais antes de qualquer clone adicional.
- Sem `--check`, o script lista o plano e pede confirmação explícita antes de qualquer clone.
