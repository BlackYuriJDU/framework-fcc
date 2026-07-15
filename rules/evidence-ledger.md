# Evidence Ledger Protocol

> Protocolo obrigatório de rastreabilidade e veracidade. Toda afirmação de progresso ou conclusão deve ser acompanhada de evidência concreta. Inspirado no protocolo que permitiu engenharia reversa de software complexo em tempo recorde.

## Princípio Único

**Nada é considerado concluído até que exista evidência verificável.**

## Regras Obrigatórias

### 1. Citar Fonte em Toda Conclusão

Toda alegação técnica deve citar a fonte exata:
- `arquivo:linha` para código
- `comando: saída` para logs/outputs
- `URL` para fontes externas
- `teste: resultado` para validações

Formato: `[Evidência: <fonte>] <afirmação>`

### 2. Níveis de Confiança

Classifique cada evidência em:
- **🔵 Análise Estática** — Teórico, baseado em leitura de código/documentação. Não testado.
- **🟢 Verificado em Runtime** — Testado com execução real, saída de comando ou teste passando.
- **🟡 Verificado por Diff** — Comparação bit-a-bit com ground truth.
- **🔴 Contradito** — Evidência posterior mostrou que a afirmação estava errada.

### 3. Auditoria Antes de Reportar

Antes de declarar tarefa concluída ou progresso:
1. **Audite cada alegação** contra um resultado real de ferramenta desta sessão.
2. **Relate apenas trabalho com evidência.** Se algo não foi verificado, diga explicitamente.
3. **Falhas devem ser relatadas fielmente** — se um teste falhou, mostre a saída real. Não "testes passam" quando não passam.

### 4. Falsificação de Alegações (Adversarial Check)

Ao encontrar nova evidência, tente ativamente falsificar conclusões anteriores:
- "Essa afirmação X ainda se sustenta diante do novo dado Y?"
- Se contradição encontrada: registre a alegação antiga como 🔴 Contradita e atualize.

### 5. Ledger de Sessão

Mantenha um ledger implícito no raciocínio:
- O que foi verificado vs. o que é suposição
- O que mudou de status durante a sessão
- Conflitos entre fontes

## Quando se Aplica

- **Sempre** ao final de uma implementação, correção ou análise
- **Sempre** antes de declarar "pronto", "funcionando" ou "concluído"
- **Sempre** em relatórios de auditoria (segurança, compliance, código)
- **Opcional** em tarefas triviais (rename, formatação, docs simples)

## Integração com o Pipeline

1. `engineering-implementation-planner` — inclui fontes e níveis de confiança no plano
2. `engineering-code-reviewer` — alegações de bug devem citar linha exata
3. `engineering-qa-validator` — output de comandos é a evidência final
4. `engineering-release-judge` — decisão deve ser baseada em evidências verificadas
5. `control-evidence-ledger` — auditor independente para tarefas críticas

## Exemplo

```
❌ "Corrigi o bug de autenticação."
   [Sem evidência — NÃO ACEITO]

✅ "Corrigi o bug de autenticação."
   [Evidência: src/auth/login.tsx:47] Token expirado não renovava session.
   [Evidência: npm test src/auth/login.test.tsx] Teste `renewal on expiry` passou (verde).
   [Confiança: 🟢 Verificado em Runtime]
```
