# Turn-Based Loop (5 fases)
Ativado por: tarefa multi-step, pedido complexo, menção a "loop", "fases".

## Fase 1 — Prompt
- Recebe tarefa, classifica risco (Trivial/Padrão/Arriscado)
- **Saída:** classe de risco definida

## Fase 2 — Gather Context
- Lê código/arquivos antes de propor mudança. NUNCA assume estrutura.
- Para Padrão/Arriscado: levanta testes, convenções, dependências.
- **Saída:** descreve estado atual real do sistema (sem invenção)

## Fase 3 — Take Action
- Para Padrão/Arriscado: mapa de estágios (1 linha de resultado + critério "feito" por estágio)
- Implementa estágio por estágio, evidência por estágio
- **Saída:** todos estágios com evidência real

## Fase 4 — Check Work
- Ledger de evidência: cada afirmação com comando exato + saída real
- Se Arriscado: verificador fresco (segunda chamada sem histórico)
- TDD com red testemunhado: escreve teste → vê falhar pelo motivo certo → implementa → vê passar
- Se reprovado: volta à Fase 3, não à Fase 1
- **Saída:** ledger preenchido, verificação fresca (se arriscado), 0 afirmações sem prova

## Fase 5 — Response
- Confirmado vs Inferido vs Não-verificável
- O que só o humano confirma
- Estado do git
- Próximos passos
- Alegação mais provável de estar errada
