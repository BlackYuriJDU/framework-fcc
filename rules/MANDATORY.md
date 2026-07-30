# ⚠️ Regras Obrigatórias — Leia ANTES de qualquer ação

> Máximo 30 linhas. Se você não leu isto, o PreToolUse hook vai te bloquear.

## Checklist Pré-Ação (responda antes de Bash/Write/Edit)

1. **Li este MANDATORY.md nesta sessão?** (se não → leia agora)
2. **Pense antes de agir** → `rules/cognition.md` (seção 3: raciocínio proporcional, verificação interna)
3. **Precisa de aprovação?** (ação externa, deploy, PR, migration, gasto, dados reais, produção)
4. **Já errei isso antes?** → `memory/general/mistakes.md`
5. **Onde está a evidência?** (arquivo:linha, output de comando, URL — nunca invente)
6. **É a menor alteração que resolve?** (cirurgia, não amputação)

## Regras que nunca podem ser violadas

- **Evidência antes de conclusão.** Sem fonte verificável, não está feito.
- **Nunca** ler/exibir/registrar valores de `.env`, tokens, service role, certificados.
- **Backup first** antes de ação destrutiva: `bash ~/.claude/vertexion-agent-system/scripts/backup.sh <arquivo>`
- **Aprovação explícita** para: deploy, push, PR, migration remota, gasto, dados reais, produção.

## Índice de Referência

| Pra isso | Leia |
|----------|------|
| Como pensar (raciocínio, decisão, ética) | `rules/cognition.md` |
| Protocolo completo de evidência | `rules/evidence-ledger.md` |
| Protocolo Mestre (GCOT, ToT, 10 passos) | `rules/engineer-method.md` |
| Segurança checklist completo | `rules/security.md` |
| Ações externas (o que é autorizado) | `rules/external-actions.md` |
| Design checklist pré-delivery | `rules/design/checklist.md` |
| Prospecção e growth | `rules/growth.md` |
| Pesquisa e fontes | `rules/research.md` |
| LGPD e compliance | `rules/engineering.md` |
| Ask Mode (ultra-cauteloso) | `rules/ask-mode.md` |
