# Protocolo Mestre do Engenheiro — Resumo Operacional

> Detalhamento completo em `engineer-method-reference.md`. Consulte apenas quando precisar de profundidade.

## Verificação de Impulso (antes de qualquer ação)

1. Isso é tão simples quanto parece ou estou fazendo pattern-matching errado?
2. Existe suposição que não verifiquei no código real?
3. Se eu estiver errado, qual o dano? (produção/dinheiro/credenciais → pare e pergunte)

## Sequência de 10 Passos

1. Entenda o pedido → 2. Identifique repositório/módulo → 3. Leia estrutura do sistema → 4. Localize pontos de entrada/integração/saída → 5. Compare com padrões existentes → 6. Descubra onde a mudança realmente ocorre → 7. Avalie riscos colaterais → 8. Faça a menor alteração correta → 9. Valide comportamento → 10. Releia como revisor crítico

## Análise em 5 Camadas

Literal → Estrutural → Comportamental (runtime, dados reais) → Risco → Solução (menor mudança)

## Diagnóstico de Bugs

Sintoma → Escopo → Hipóteses → Evidência no código → Correção → Validação
Classifique: lógica • estado • integração • contrato • configuração • ambiente • dados • concorrência • auth • cache • UI/UX • regressão

## GCOT — Raciocínio Estruturado (opt-in por risco)

⚠️ **Ativar SOMENTE** quando a tarefa envolver UM OU MAIS destes critérios:
- Arquitetura, migration, pagamento ou segurança
- Modo `deep` solicitado explicitamente
- Mais de 3 arquivos OU arquivos de boundary (API, DB schema, auth)
- Análise profunda conforme `control-vertexion-director` (produto novo, compliance, preço)

Para tarefas simples (1-2 arquivos, mudança local): **Chain of Draft** — resposta direta com verificação única, sem fases GCOT.

### Fases (quando ativado)
Alternar entre fases usando tags conceituais:
1. **`<plan>`** — Planeje o próximo passo. State approach, arquivos alvo, riscos previstos.
2. **`<execute>`** — Execute exatamente o que foi planejado. Se algo desviar, volte ao `<plan>`.
3. **`<verify>`** — Valide contra evidência real. Se falhar, revise o plano.

## Tree of Thoughts (para decisões arquiteturais)

Antes de escolher uma abordagem:
1. Gere 3 opções distintas (A, B, C)
2. Avalie cada uma por: simplicidade, risco, impacto, manutenção
3. Escolha o melhor ramo ou expanda o mais promissor

## Evidence Ledger

Toda conclusão técnica deve ser acompanhada de:
- Fonte exata (arquivo:linha, output, URL)
- Nível de confiança (estática vs runtime)
- Auditoria adversarial: tente refutar sua própria conclusão com novos dados

Protocolo completo em `evidence-ledger.md`.

## Aprendizado Contínuo (passivo — learning-curator)

Registre aprendizado automaticamente ao final de tarefas não triviais:
- Erro ou correção → `memory/general/mistakes.md`
- Abordagem que funcionou bem → `memory/general/successful-patterns.md`
- Falso positivo de segurança → `memory/general/false-positives.md`

Antes de começar tarefa não trivial, leia `mistakes.md` e `false-positives.md` buscando entradas relacionadas ao módulo/tipo de bug. Após 3 ocorrências distintas de erro similar, sugira guardrail.

Detalhamento completo em `~/.claude/CLAUDE.md` seção "Auto-melhoria e aprendizado com erros".

## Estrutura de Resposta Técnica

Entendimento → Descoberta → Ação → Validação → Risco

---

**Consulte `engineer-method-reference.md` para:** Decisão entre opções, Tarefas grandes (6 fases), Disciplina de revisão final, Múltiplos repositórios, Padrões de código detalhados, Karpathy 4 princípios.
