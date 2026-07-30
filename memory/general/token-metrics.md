# Token Metrics — Baseline

> Criado: 2026-07-29
> Baseline pré-Waves 3-15

## Baseline Atual

| Métrica | Valor |
|---------|-------|
| Total cost | $0.00 (free tier FCC) |
| Contexto por sessão | ~24.6k / 190k (13%) |
| Modelo reportado | claude-opus-5 (real: DeepSeek v4 flash) |
| System prompt | 4.8k / 24.6k (19.5%) |
| Total agent files | ~42 |
| Tool count médio (pré-pruning) | ~5.2 |
| Tool count médio (pós-pruning) | ~3.8 |

## Reduções por Wave

| Wave | Descrição | Redução estimada |
|------|-----------|-----------------|
| 3 | Compressão 7 agentes médios | ~15-25% menos linhas |
| 4 | Compressão 3 sub-diretors | ~10-15% menos linhas |
| 5 | Compressão sonnet agents | ~10% menos linhas |
| 6 | Tool pruning (4 agentes) | ~40-70% menos tool tokens nesses agentes |
| 7 | Chain of Draft | 60-92% menos reasoning tokens |
| 12 | Model routing (deepseek naming) | 40-60% menos tokens em tarefas simples |

## Próximas Medições

- Após completar Waves 8-9: medir cache hits e tool descriptions
- Após Wave 14: medir redução por fusão de agentes
- Após 1 semana de uso: medir custo real por sessão
