# Decision History

Registro cronológico de decisões importantes. Formato obrigatório:

```
## [AAAA-MM-DD] [Título]
**Contexto:** ...
**Decisão:** ...
**Alternativas:** ...
**Consequências:** ...
**Decidiu:** Arthur / [agente]
```

---

## 2026-07-10 Estrutura do Vertexion Agent System
**Contexto:** Integração de ~30 sugestões do ChatGPT + auto-auditoria.
**Decisão:** Adotar modelo de Fases (0-4) em vez de implementar tudo de uma vez. Priorizar Foundation → Pipeline → Fortalecimento de Agentes → Organização.
**Alternativas:** Implementar tudo junto (risco: sobrecarga), ignorar sugestões (risco: estagnar).
**Consequências:** Sistema evolui de forma controlada, cada fase tem checkpoint.
**Decidiu:** Arthur

## 2026-07-10 Modelo efetivo DeepSeek v4 flash via FCC
**Contexto:** Alias `opus` mapeado para DeepSeek v4 flash.
**Decisão:** Documentar explicitamente que agentes rodam DeepSeek, não Opus. Todos os agentes mantêm `model: opus` no frontmatter mas o CLAUDE.md registra o mapeamento real.
**Alternativas:** Mudar todos os agentes para `model: deepseek` (quebraria se FCC trocar de provedor).
**Consequências:** Transparência sem quebrar compatibilidade com futuro provider swap.
**Decidiu:** Arthur
> **⚠️ SUPERADO (2026-08-05, Fase 3 multi-modelo):** O framework agora é agnóstico a provedor. Nenhum provedor é "o efetivo" fixo; o modelo varia por sessão (`/model` ou FCC). Manter `model:` no frontmatter continua válido como intenção de perfil; o comportamento é definido pelo perfil real em uso. Ver seção "Modelos e Provedores (multi-modelo)" do CLAUDE.md.

## 2026-07-06 Migração V1→V2 AppMax no ZapMenu
**Contexto:** Pagamentos V1 deprecated pela AppMax.
**Decisão:** Migrar para V2 com PIX + cartão tokenizado (PCI SAQ A).
**Alternativas:** Trocar de provedor (custo de migração maior), manter V1 (risco de segurança).
**Consequências:** 29 arquivos alterados, boleto removido, typecheck zerado.
**Decidiu:** Arthur
