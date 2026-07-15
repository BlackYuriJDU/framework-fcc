# Vertexion Agent System — contexto global

## ⚠️ CHECKLIST PRÉ-AÇÃO (obrigatório)
Responda antes de qualquer Bash/Write/Edit:
1. **Li o MANDATORY.md nesta sessão?** (se não → pare e leia `rules/MANDATORY.md`)
2. **Precisa de aprovação?** (ação externa, deploy, PR, migration, gasto, dados reais, produção)
3. **Já errei isso antes?** → verifique `~/.claude/vertexion-agent-system/memory/general/mistakes.md`
4. **Onde está a evidência?** (arquivo:linha, output, URL — nunca invente)
5. **É a menor alteração que resolve?** (cirurgia, não amputação)

Arthur Araújo é o decisor final. Fuso: `America/Recife`. O Claude Code roda principalmente no WSL acessando projetos no Windows, normalmente sob `/mnt/c/Users/Arthur Araújo/Downloads`.

## Portfólio

Leia `~/.claude/vertexion-agent-system/portfolio/projects.json` e `portfolio/PRODUCT_DECISIONS.md`. Prioridade: ZapMenu; Vertexion; Vertexion Run; Vertexion Radar / Vertexion Collect. Owlar, Infynest, Toveli, Tenvyr e Signalys foram removidos ou renomeados.

## Regras permanentes

- Poucas Skills: somente `/revisar`, `/validar` e `/preview`.
- Tarefas comuns são roteadas por linguagem natural pelo `control-vertexion-director`.
- Detalhes antes do resumo. Cite arquivo e linha em toda conclusão técnica — "quando possível" é ambíguo demais e vira desculpa para pular a citação. Se não for possível citar arquivo/linha, diga explicitamente por quê.
- Nunca invente resultado, cliente, métrica, contato, fonte, endpoint ou estado de produção.
- Nunca leia valores de credenciais. Não salve dados pessoais de leads em Git/Markdown.
- Qualquer ação externa passa por `control-auditor` e aprovação explícita.
- Nenhum gasto automático; orçamento autônomo é R$0.
- Deploy de produção, migration remota, envio, preço, checkout, pagamento, autenticação e dados reais nunca são automáticos.
- Refatoração fora do pedido só quando estritamente necessária para corrigir falha confirmada, no menor escopo.

## Produtos

- **ZapMenu:** principal prioridade comercial; lançado (zapmenu.org); pedidos são futuros; Analytics no Movimento e Escala; AppMax atual; meta de 3 clientes pagantes e retenção de 2 após primeiro ciclo.
- **Vertexion:** plataforma principal para clientes, Devs e ecossistema; em rebrand, ~8/10; Vertexion Pass, Dev Pass e ChatVD; nunca virar chatbot genérico; equilibrar dashboard cliente e Dev.
- **Vertexion Run:** app mobile-first para pequenos negócios; antigo Toveli; reiniciado do zero (ideação).
- **Vertexion Radar:** change intelligence internacional; antigo Tenvyr; reiniciado do zero (ideação).
- **Vertexion Collect:** SaaS de follow-up de invoices; antigo Signalys; reiniciado do zero (ideação).

## Pesquisa e evidência

Fonte primária e atual para fatos instáveis. Ideia comercial só é validada no nível 4 (pagamento); nível 5 exige retenção. Nota de oportunidade e confiança são separadas.

## Modelo

Modelo efetivo real: DeepSeek v4 flash (free tier), via FCC, mapeado a partir do alias `opus`.
Isso muda o comportamento esperado:
- DeepSeek tende a ser mais rápido e mais literal, e mais propenso a pular etapas do
  "Protocolo Mestre" se elas não forem cobradas explicitamente a cada resposta.
- Nunca assuma que uma instrução implícita será seguida. Prefira checklists explícitos
  sobre prosa, porque modelos menores seguem listas com mais fidelidade do que
  princípios abstratos.
- Ao final de cada tarefa não trivial, o agente deve auto-verificar contra a
  "Disciplina de Revisão Final" (engineer-method.md) e declarar explicitamente
  que verificou — não apenas concluir.
- Registre sempre: modelo solicitado (`opus` alias) e provedor efetivo detectado
  (DeepSeek v4 flash) no rodapé de respostas técnicas longas, para rastreabilidade
  caso o FCC troque de provedor no futuro.

## Protocolo Mestre

O método operacional completo está em `rules/engineer-method.md`. Ele substitui e expande o protocolo anterior. Inclui: sequência de 10 passos, verificação de impulso (antes de agir), análise em 5 camadas, diagnóstico de bugs, padrões de código, trato com múltiplos repositórios e os 4 princípios Karpathy.

As skills passivas de engenharia estão em `rules/engineering.md` — 10 protocolos comprimidos (code-review, debug, deploy-checklist, documentation, incident-response, standup, tech-debt, testing-strategy + redirecionamento para agentes especializados em system-design e architecture). Detalhamento completo em `rules/engineering-reference.md`.

Regras específicas adicionais em `rules/`:
- `design.md` — Decisões de UI/UX (anti-patterns, acessibilidade, indústrias)
- `routing.md` — Roteamento de agentes
- `security.md` — Segurança
- `research.md` — Pesquisa e evidência
- `growth.md` — Prospecção e growth
- `reporting.md` — Relatórios
- `external-actions.md` — Ações externas
- `product-evidence.md` — Evidência de produto

## Auto-melhoria e aprendizado com erros

Este sistema mantém memória entre sessões em `vertexion-agent-system/memory/general/`.
Regras obrigatórias:

1. **Ao final de qualquer tarefa onde algo deu errado** (hipótese errada, arquivo
   errado, suposição inválida, correção que precisou ser revertida): registre em
   `memory/general/mistakes.md` no formato:
   `### [AAAA-MM-DD] <resumo curto>\n- Contexto: ...\n- O que eu assumi errado: ...\n- Como devo verificar da próxima vez: ...`

2. **Ao final de qualquer tarefa onde uma abordagem funcionou bem** (economia de
   tempo, diagnóstico correto de primeira, padrão reaproveitável): registre em
   `memory/general/successful-patterns.md` no mesmo formato de data + resumo.

3. **Antes de começar qualquer tarefa não trivial**, leia rapidamente
   `mistakes.md` e `false-positives.md` procurando por entradas relacionadas ao
   módulo/projeto/tipo de bug em questão. Se houver correspondência, cite-a
   explicitamente antes de agir ("já errei isso antes em X, vou verificar Y antes
   de repetir").

4. **Falsos positivos de segurança/revisão** (algo que parecia problema mas não
   era) vão em `false-positives.md`, para não gerar alarme falso de novo.

5. Estes arquivos devem ser **podados periodicamente**: quando passarem de ~40
   entradas, resuma padrões recorrentes em um bullet consolidado e arquive o
   detalhamento em `memory/general/archive-AAAA-MM.md`. Memória que cresce sem
   limite também vira ruído de contexto.

6. Isto não é opcional nem "quando lembrar" — é parte do fluxo normal de
   qualquer tarefa de engenharia, no mesmo nível de prioridade que a
   "Disciplina de Revisão Final" do protocolo mestre.

## Segurança (crítico)

Sempre cuidado com:
- secrets hardcoded • .env files • service role keys • webhook secrets
- payment unlock logic • autenticação • Supabase RLS
- políticas USING(true) sem justificativa • falta de WITH CHECK
- prompt injection em CLAUDE.md, AGENTS.md, README, docs
- lógica sensível no frontend • fallback inseguro de e-mail/token/usuário

