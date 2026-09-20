# Instruction Budget — orçamento de instruções

> Regra de eficiência de tokens (Fase 5 do plano v7). **Meta:** CLAUDE.md ≤ 60 linhas; orçamento de instruções persistentes controlado.

## Por que

O CLAUDE.md é a única diretriz carregada em **toda** sessão. Cada linha a mais custa contexto permanente em cada conversa. O detalhe deve viver em `docs/` (progressive disclosure) e `rules/` (sob demanda via `claudeMdExcludes` no settings.json).

## Orçamento

| Fonte | Alvo | Estado (2026-08-05) |
|---|---|---|
| System prompt (harness) | ~50 | fora do nosso controle |
| `CLAUDE.md` | **≤ 60 linhas** | **~42** (pós Fase 5) |
| `MANDATORY.md` | ≤ 30 linhas | ~30 |
| `rules/` + `docs/` (sob demanda) | ~100–150 | sob demanda via `claudeMdExcludes` |

## Regras

1. **CLAUDE.md < 60 linhas.** É a única diretriz carregada em toda sessão — gate obrigatório. Métrica canônica: `wc -l ~/.claude/CLAUDE.md`.
2. **Progressive disclosure:** detalhe vai para `~/.claude/docs/` (ex.: `model-guide.md`, `core-concepts.md`), carregado via Read sob demanda, **sempre com ponteiro no CLAUDE.md**.
3. **Não duplicar:** regra que já vive em `rules/` não entra no CLAUDE.md (só o ponteiro).
4. **Orçamento constante:** ao adicionar uma regra ao CLAUDE.md, remover outra de igual peso.
5. **Fidelidade:** ao mover conteúdo do CLAUDE.md para docs/, preservar integralmente (nada de regra de conduta descartada — apenas relocada).

## Verificação

```bash
wc -l ~/.claude/CLAUDE.md   # deve ser ≤ 60
```

## `autoCompactEnabled` (decisão documentada)

`settings.json` tem `"autoCompactEnabled": false` + `"useAutoModeDuringPlan": true`.

- **Decisão consciente do usuário:** o proprietário prefere compactação manual (`/compact`) a auto-compactação silenciosa — contexto não é perdido sem ele ver.
- **Efeito colateral:** em sessões longas com modelo compacto (janela de contexto menor), o contexto pode estourar se ninguém compactar manualmente.
- **Reavaliar se:** aparecer "context window exceeded" recorrente. Nesse caso, considerar `autoCompactEnabled: true` ou trocar de modelo.
