# Cross-Team Coordination System

> Baseado no template de **Delegation Contract** (`project-template/docs/engineering/delegation-contract.md`).
> Ativado quando 2+ equipes são detectadas simultaneamente.

---

## Template Base (Delegation Contract)

O contrato original de delegação é estendido para coordenação entre equipes:

```
## Cross-Team Contract

### Goal
{objetivo geral do pedido}

### Teams Envolvidas
- {team}: {objetivo específico para esta equipe}
- {team}: {objetivo específico para esta equipe}

### Coordination Lead
{team que coordena — geralmente a primeira detectada ou a de maior relevância}

### Dependencies
- {team A} precisa do output de {team B} para começar
- {team C} é independente, pode rodar em paralelo

### Done When
{todos os objetivos das equipes concluídos + integração validada}

### Not To Do
{o que está fora do escopo}

### Files
{arquivos relevantes}

### Verification
{como validar cada entrega + a integração}
```

---

## Fluxo de Coordenação

```
Input: "@Design @Dev cria tela de planos com checkout"

                    ▼
    Director detecta: @Design + @Dev = Cross-team
                    ▼
    Director cria Cross-Team Contract:
      Goal: "criar tela de planos com checkout"
      Design: "criar UI da tela de planos"
      DEV: "implementar checkout funcional"
      Ordem: Design → (entrega layout) → DEV
                    ▼
    Director notifica: 📋 Cross-team: Design → DEV
                    ▼
    1. Director spawns design-lead com objetivo "criar UI da tela de planos"
    2. design-lead executa → entrega layout/mockup
    3. Director spawns dev-lead com objetivo "implementar checkout" + layout do design
    4. dev-lead executa → entrega funcionalidade
                    ▼
    Director coordena integração → reporta resultado a o proprietário
```

## Regras de Coordenação

### 1. Ordem de Execução
Se há dependência entre equipes (Design → DEV), execute em série na ordem correta.
Se equipes são independentes (Jur + Fin), execute em paralelo.

### 2. Comunicação Entre Equipes
O director é o único ponto de coordenação. Equipes não falam entre si diretamente.
O director recebe output de uma equipe e passa como contexto para a próxima.

### 3. Resolução de Conflitos
- Se equipes discordam: director decide baseado no escopo total do pedido
- Se o conflito é técnico e afecta o resultado: reportar a o proprietário com ambas posições
- Cross-team nunca bloqueia por mais de 1 ciclo sem intervenção

### 4. Contrato de Integração
Quando a última equipe entrega, o director:
1. Verifica se todos os outputs se integram corretamente
2. Testa o fluxo completo (happy path)
3. Reporta: o que cada equipe fez + resultado final + riscos residuais
