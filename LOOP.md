# Loop Configuration - Vertexion Agent System

## Active Loops

| Pattern | Cadence | Level | Comando |
|---------|---------|-------|---------|
| Daily Triage | 1d | L1 (report-only) | claude -p "Run loop triage" --agent operacoes-lead --bg |

## Human Gates
- Nenhuma acao automatica de escrita em producao
- L1 = report-only. Apenas leitura e relatorio
- L2+ requer checklist de seguranca aprovado pelo proprietario

## Projetos Monitorados
> Cadastre os seus projetos em portfolio/projects.json e liste-os aqui.

| Projeto | URL | Check |
|---------|-----|-------|
| meu-projeto | https://exemplo.com | Site no ar + status code |

## Budget
- Max tokens por run: 50K (L1)
- Max subagent spawns: 0 (L1)
- Review STATE.md a cada run
