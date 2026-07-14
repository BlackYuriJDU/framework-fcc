# Loop Configuration — Vertexion Agent System

## Active Loops

| Pattern | Cadence | Level | Comando |
|---------|---------|-------|---------|
| Daily Triage | 1d | L1 (report-only) | `claude -p "Run loop triage" --agent engineering-loop-triage --bg` |

## Human Gates
- Nenhuma ação automática de escrita em produção
- L1 = report-only. Apenas leitura e relatório
- L2+ requer checklist de segurança aprovado por Arthur

## Projetos Monitorados
| Projeto | URL | Check |
|---------|-----|-------|
| ZapMenu | zapmenu.org | Site no ar + SSL + status code |
| Vertexion | vertexion.org | Site no ar |
| Telegram | — | Report canal autorizado |

## Budget
- Max tokens por run: 50K (L1)
- Max subagent spawns: 0 (L1)
- Review STATE.md a cada run

## Constraints
Arquivo: `loop-constraints.md`

## Run Log
Arquivo: `loop-run-log.md`
