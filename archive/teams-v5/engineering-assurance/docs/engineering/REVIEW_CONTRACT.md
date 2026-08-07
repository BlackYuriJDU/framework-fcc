# Contrato de saída dos agentes

Todo agente revisor deve retornar um único objeto JSON válido, sem comentários antes ou depois.

```json
{
  "agent": "nome-do-agente",
  "status": "PASS | WARN | FAIL | NOT_APPLICABLE | BLOCKED",
  "scope": ["arquivo-ou-área-analisada"],
  "summary": "resumo curto e factual",
  "findings": [
    {
      "id": "PREFIXO-001",
      "severity": "CRITICAL | HIGH | MEDIUM | LOW | INFO",
      "confidence": "HIGH | MEDIUM | LOW",
      "category": "categoria",
      "file": "caminho/arquivo",
      "line": 1,
      "evidence": "evidência concreta sem expor segredos",
      "impact": "impacto real",
      "recommended_action": "ação específica",
      "verification": "como verificar a correção"
    }
  ],
  "metadata": {}
}
```

## Regras

- `CRITICAL` e `HIGH` exigem confiança alta e caminho de impacto concreto.
- Não inventar linha. Use `null` quando não houver linha precisa.
- Não incluir conteúdo de segredo na evidência.
- Não reportar preferência estética como vulnerabilidade ou bloqueador.
- Se a análise não for aplicável, use `NOT_APPLICABLE`.
- Se faltarem ferramentas ou ambiente, use `BLOCKED`; nunca transforme ausência de verificação em `PASS`.
- Findings equivalentes devem ser deduplicados pelo agente principal.
- Agentes especializados podem adicionar campos em `metadata`, mas devem preservar a estrutura principal.
