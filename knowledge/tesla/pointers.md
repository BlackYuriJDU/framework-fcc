# Tesla — Ponters de Conhecimento

> Índice de referência do orquestrador Tesla (engenharia + auto-melhoria). Repos clonados em
> `knowledge/tesla/repos/` (geridos pelo `scripts/sync-knowledge.sh`). Aqui: URLs (não clonar) + caminhos locais.

## Clonados (shallow) — `repos/`
Consulte `manifest.json`. Git clone via `bash ~/.claude/vertexion-agent-system/scripts/sync-knowledge.sh`.

## URLs (não clonar — gigantes ou já são tools do ambiente)
- Semgrep: https://github.com/semgrep/semgrep — já é tool no ambiente (agente static-analysis).
- CodeQL: https://github.com/github/codeql — enorme; usar docs.
- Biome: https://github.com/biomejs/biome — enorme; usar CLI via package.
- OXC: https://github.com/oxc-project/oxc — enorme; usar CLI via package.
- Matomo: https://github.com/matomo-org/matomo — analytics self-hosted; referência, não repo.

## Caminhos locais já disponíveis
- `~/.claude/skills/superpowers/` — skills superpowers (processos).
- `~/.claude/skills/trailofbits/` — Trail of Bits claude-audit (construído em casa).
- `~/.claude/skills/karpathy/` — karpathy minimal-diff.

## Conteúdo interno (foldado de `knowledge/engineering/`)
- `harness-loop.md` — loop do harness.
- `harness-prompt-template.md` — template de prompt do harness.

## Protocolos de engenharia (skills)
- `~/.claude/skills/tesla/` — SKILL.md + when_to_use (engineering, security, control, memory, product, research, routing).
- `~/.claude/rules/ultrathink2.md` — Tesla opera SEMPRE em ultrathink2.
- `~/.claude/skills/autoloop/` — Karpathy Loop (maker/checker).
