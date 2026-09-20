# Detection System

> Sistema de detecção automática de equipes por Tag Explícita + Palavra-chave.
> Executado pelo `control-tesla` (orquestrador Tesla) antes de qualquer processamento.

---

## 1. Tags Explícitas (Prioridade Máxima)

| Tag | Equipe |
|-----|--------|
| `@DEV` | DEV |
| `@Design` | Design |
| `@Mkt` | Marketing |
| `@Fin` | Finanças |
| `@Jur` | Jurídico |
| `@Ops` | Operações |

Tags podem aparecer em qualquer posição na mensagem. Se uma tag for detectada, a equipe é acionada **independente** das palavras-chave.

**Uso:** `@DEV corrige o bug de login no seu-projeto`

## 2. Palavras-chave (Fallback)

Quando não há tag explícita, o director varre a mensagem contra o mapa de keywords de cada equipe.

### DEV
`bug|codigo|código|implementar|refatorar|deploy|build|teste|api|rota|componente|migração|sql|servidor|performance|segurança|auth|supabase|seu-gateway-de-pagamento|pix|webhook|infra|infraestrutura|pipeline|backup`

### Design
`design|layout|ui|ux|aparecia|estilo|cor|fonte|tipografia|icone|logo|branding|prototipo|figma|responsivo|mobile|tela|página|pagina|visual|microcopy|tom de voz`

### Marketing
`marketing|lead|divulgar|campanha|rede social|instagram|whatsapp|facebook|seo|conteudo|copy|anuncio|funil|conversão|prospecção|abordagem`

### Finanças
`preço|preco|custo|receita|faturamento|financeiro|plano|assinatura|mensalidade|tier|pricing|margem|lucro|investimento|orçamento|budget|análise|analise|investigar|investigação|tendência`

### Jurídico
`juridico|lei|contrato|termo|lgpd|privacidade|compliance|regulatorio|risco legal|clausula|direito|obrigação|licença`

### Operações
`operação|operacao|rotina|portfólio|portfolio|prioridade|aprovação|aprovar|auditoria|evolução|métrica|relatório|processo|workflow|tarefa|projeto`

## 3. Algoritmo de Decisão

```
1. Extrair tags explícitas (@DEV, @Design, etc.)
   → Se encontradas: IGNORAR keywords, usar apenas tags
2. Se não há tags:
   → Varrer mensagem contra keywords de cada equipe
   → Pontuar: cada keyword match = 1 ponto
   → Equipe com maior pontuação é selecionada
   → Empate: perguntar a o proprietário qual equipe
3. Se nenhuma tag nem keyword:
   → Modo padrão: director processa sem equipe específica
```

## 4. Notificação

Quando uma equipe é detectada:

```
🔧 Equipe DEV acionada (tag: @DEV)
ou
🎨 Equipe Design acionada (keyword: "layout")
ou
📋 Cross-team detectado: Design + Finanças
```

## 5. Cross-team

Se múltiplas tags são usadas OU keywords apontam para 2+ equipes:

```
📋 Cross-team: Design → layout + Fin → preço
→ Aplicar CROSS_TEAM.md
```
