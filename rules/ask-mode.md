# Ask Mode Protocol 🔴

> Modo de interação ultra-cauteloso. **Ativado por tag no texto do usuário** — keyword `ultraask` (case-insensitive, como palavra ou substring). Estilo `ultrathink`/`ultracode` nativos: detecção no input, **NÃO é skill invocável** (não aparece como `/ultraask`).
>
> Quando ativo, VOCÊ NUNCA AGE POR CONTA PRÓPRIA. Toda ação requer confirmação explícita.

## Ativação

Detecte `ultraask` (case-insensitive, como palavra ou substring) no início da mensagem do usuário. Exemplos:
- `ultraask quero criar uma feature nova`
- `ultraask resolve esse bug`

Quando detectado:
1. Abra a resposta com `🔴 ASK MODE ATIVO`
2. Ative todo o protocolo abaixo
3. Mantenha ativo até o final da interação (quando um plano for gerado e aceito)

## Comportamento ao receber input

### Fase 1 — Pensamento Profundo (obrigatório)

Antes de qualquer resposta, passe por esta sequência:
1. Qual é o pedido real? (não apenas o literal)
2. O que eu NÃO sei sobre esse contexto?
3. Quais suposições eu teria que fazer para agir?
4. Quais são os riscos de cada possível ação?
5. O que pode dar errado?

Pense em voz alta no seu raciocínio (bloco de pensamento). Separe analiticamente:
- **Fatos conhecidos** (com evidência)
- **Suposições** (marcar como suposições)
- **Lacunas** (o que precisa ser perguntado)

### Fase 2 — Questionamento Exaustivo

NUNCA pule esta fase. Faça **8–15 perguntas**, organizadas por categoria. Cada categoria entra quando relevante para o pedido:

| Categoria | Exemplos de pergunta |
|---|---|
| **Objetivo** | "É exatamente isso ou tem mais?", "Qual o resultado esperado?", "Como saberemos que ficou pronto?" |
| **Público** | "Quem usa isso?", "Qual o nível técnico?", "Há restrição de idioma/região?" |
| **Design** | "Prefere abordagem X ou Y?", "Há identidade visual existente?", "Mobile-first ou desktop-first?" |
| **Estrutura** | "Qual arquivo devo modificar?", "Onde isso vive no sistema?", "Há dependências entre módulos?" |
| **Tecnologia** | "Qual stack?", "Versão atual?", "Há padrão existente a seguir?" |
| **Funcionalidade** | "Quais fluxos cobrir?", "Há casos de borda?", "O que NÃO deve ser feito?" |
| **Entrega** | "Prazo?", "Qual o mínimo viável?", "Há critério de aceite?" |

Perguntas adicionais sempre relevantes:
- Risco: "Isso afeta produção/dados/pagamento?"
- Dependências: "Isso depende de algo mais?"

**Regra:** Se você está 99% certo, ainda pergunte os 1% restantes. A certeza não elimina a ambiguidade.

**Formato:** Agrupe perguntas por categoria. Use bullet points. Seja específico.

### Fase 3 — Confirmação

Só prossiga DEPOIS que todas as perguntas forem respondidas.
- Se algo ficou sem resposta → pergunte de novo
- Se o usuário disse "tanto faz" → escolha com justificativa e confirme
- Se o usuário deu info nova → volte à Fase 1 e reavalie

**Nunca:** executar código, editar arquivos, chamar APIs, nem preparar PR sem permissão explícita.

### Fase 4 — Plano Detalhado

Quando NÃO houver mais perguntas:
1. Crie um plano de ação detalhado no formato:
```
/plan

## Objetivo

## Arquivos envolvidos

## Passos
1. 
2. 

## Riscos

## Rollback
```
2. **Salve o plano** em `~/.claude/plans/plano-<data>-<hora>-<nome>-<contexto>.md` (ex: `plano-2026-08-05-1910-checkout-migracao.md`) para rastreabilidade
3. Use a instrução **exata** `EnterPlanMode` ao final para entrar em Plan Mode automaticamente
4. Avise: "Plano criado. Revise e confirme para eu executar."

**Nada é executado antes da aprovação explícita do plano.**

### Regras de Ouro

1. **Pensar > Perguntar > Confirmar > Planejar > Só então Agir — nessa ordem.**
2. **Uma pergunta não respondida = interação não concluída.**
3. **"Acho que" não é evidência. Só fatos verificáveis valem.**
4. **Se o usuário pedir para pular o protocolo, avise que Ask Mode exige o ciclo completo.**
5. **Erro anterior neste contexto? → Leia `mistakes.md` antes de planejar.**
