# Vertexion Agent System 4.0

Sistema global e visual para Arthur Araújo coordenar produtos, leads, validação de ideias e engenharia pelo Claude Code no WSL, sem depender de dezenas de comandos.

## O pacote entrega

### Vertexion Control

Um agente principal global, `control-vertexion-director`, interpreta linguagem natural, faz perguntas quando necessário, escolhe especialistas, limita paralelismo, controla ações externas e consolida a decisão.

### Três equipes

- **Growth Engine:** encontra e qualifica leads, seleciona o melhor do dia, prepara abordagem, follow-up, marketing review e métricas do funil.
- **Product Intelligence:** valida projetos, funcionalidades, ofertas, preços e estratégias com hipóteses, fontes, concorrência, viabilidade, risco, red team, experimento e resultado real.
- **Engineering Assurance:** planeja, revisa, corrige, audita segurança/Supabase/AppMax, executa QA, cria regressões, mantém documentação/compliance e prepara preview.

### Vertexion Control Center

Dashboard local em:

```text
http://localhost:3741
```

Permite:

- conversar naturalmente com o diretor;
- acompanhar agentes e eventos ao vivo;
- selecionar projeto e modo;
- ver projetos, leads, ideias, rotinas, aprovações e relatórios;
- parar execuções;
- descobrir caminhos dos repositórios;
- ativar ou pausar rotinas;
- abrir o melhor lead do dia e sua abordagem preparada.

O servidor aceita somente conexões loopback, usa token CSRF e não oferece endpoint para shell arbitrário.

## Apenas três Skills visíveis

```text
/revisar   — revisão do diff e especialistas condicionais
/validar   — validação completa antes de preview
/preview   — preview manual, após validação e aprovação
```

Buscar leads, validar ideias, marketing, compliance, documentação, incidentes e prioridades são acionados por linguagem natural ou pelas rotinas.

## Projetos conhecidos

| Prioridade | Projeto | Estado | Direção |
|---:|---|---|---|
| 1 | ZapMenu | pronto para lançamento | obter 3 clientes pagantes com segurança |
| 2 | Toveli | MVP quebrado | corrigir Expo Router/config/EAS e reabrir o app |
| 2 | Vertexion | pausado, avançado | equilibrar cliente, Dev e ecossistema |
| 3 | Tenvyr | ideação/template | validar change intelligence antes do MVP |
| 4 | Signalys | base intermediária | completar invoice follow-up real |

Detalhes ficam em `portfolio/` e `project-plans/`.

## Segurança

Este ZIP não contém:

- chaves, tokens ou senhas;
- `.env` real;
- dados pessoais de leads;
- bancos ou logs antigos;
- deploy automático de produção;
- migration remota automática;
- envio automático de mensagens;
- gasto autônomo.

Os pacotes antigos analisados continham credenciais reais. Antes de ativar integrações, siga `docs/SECURITY_ROTATION_CHECKLIST.md`.

## Instalação recomendada

Como o Claude Code principal roda no WSL e acessa projetos no Windows, a instalação padrão é global **no WSL**.

1. Extraia o ZIP no Windows.
2. Abra PowerShell na pasta extraída.
3. Execute:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\install.ps1
```

4. No WSL:

```bash
export PATH="$HOME/.local/bin:$PATH"
vertexion-doctor
vertexion-discover
vertexion-start
```

5. Abra `http://localhost:3741` ou use o atalho criado no Desktop.

Leia `docs/INSTALLATION.md` para opções e recuperação.

## Primeiro uso seguro

Não aplique tudo de uma vez. Gere primeiro um plano:

```bash
vertexion-plan
```

Ou cole no Claude Code o conteúdo de `START_HERE_PROMPT.md`.

O resultado obrigatório é `VERTEXION_INTRODUCTION_PLAN.md`, sem alterar os projetos. Depois introduza:

1. segurança e backup;
2. configuração global;
3. Control Center;
4. Engineering Assurance em branch/cópia;
5. Growth Engine em modo teste/dry-run;
6. Product Intelligence com casos artificiais;
7. rotinas locais;
8. integrações externas somente após aprovação.

## Comandos instalados

```bash
vertexion-doctor
vertexion-discover
vertexion-start
vertexion-stop
vertexion-status
vertexion-open
vertexion-plan
vertexion-init-project "/mnt/c/caminho/projeto"
vertexion-new-idea "Nome da ideia"
vertexion-routine daily|weekly|monthly
vertexion-secret-scan "/mnt/c/caminho/projeto"
```

## Rotinas

### Diária, 10h

- busca/ingestão de leads;
- follow-ups vencidos;
- incidentes críticos;
- atualização do painel;
- melhor lead do dia;
- mensagem personalizada e Loom opcional;
- nenhum envio automático.

### Semanal

- compliance de ZapMenu e Vertexion;
- saúde dos produtos;
- marketing review;
- documentação;
- leads antigos;
- falsos positivos e desempenho dos agentes.

### Mensal

- portfólio, receita, custos e prioridades;
- ideias e previsões;
- cápsula do tempo com mudanças positivas, negativas e inconclusivas.

O scheduler fica dentro do Control Center. O Agendador do Windows apenas inicia o dashboard no login, evitando execução duplicada.

## FCC

Todos os agentes solicitam `opus`, mas FCC pode redirecionar esse alias para outro modelo/provedor. O sistema diferencia `requestedModel` de `effectiveModel` quando o CLI fornece essa informação. Não afirme que Anthropic Opus foi usado sem confirmação.

A pesquisa tenta usar ferramentas disponíveis no Claude Code; quando WebSearch não estiver disponível, o diretor pode usar o script Tavily se `TAVILY_API_KEY` estiver configurada localmente.

## Growth Engine

O Scout moderno foi preservado e melhorado:

- Tavily + Groq em lotes;
- validação e normalização;
- deduplicação;
- histórico mínimo de aceitos, rejeitados e duplicados para não repetir empresas;
- orçamento local de créditos Tavily;
- Supabase/Telegram opcionais;
- melhor lead do dia;
- nenhuma chave no repositório.

O sistema legado duplicado (`agents/` e `mcp/`) não foi migrado.

## Product Intelligence

Use linguagem natural ou:

```bash
vertexion-new-idea "Adicionar pedidos pelo WhatsApp ao ZapMenu"
```

Cada ideia recebe workspace próprio, nota 0–100, confiança percentual e evidência 0–5. Sinais web nunca são tratados como pagamento. Uma ideia só é chamada de validada a partir do nível 4.

## Engineering Assurance

O pipeline usa escopo e especialistas condicionais. Não roda todos os agentes sempre. Bugs confirmados devem, quando tecnicamente possível, gerar teste de regressão. Aprendizados só são registrados após correção e validação; três ocorrências independentes viram candidato a guardrail, sempre com aprovação.

## Estrutura principal

```text
Vertexion-Agent-System/
├── global-claude-config/   agentes, regras, scripts e 3 Skills
├── control-center/         dashboard localhost
├── teams/                  Growth, Product e Engineering
├── portfolio/              projetos, equipe, plataformas e métricas
├── project-plans/          planos específicos dos cinco produtos
├── project-template/       memória técnica por repositório
├── marketing/brands/       baselines das marcas
├── memory/                 aprendizado geral
├── docs/                   instalação, segurança, operação e auditoria
├── install.ps1
├── install-wsl.sh
└── START_HERE_PROMPT.md
```

## Validação local do pacote

```bash
node scripts/validate-package.mjs
```

O validador verifica estrutura, frontmatter, nomes, modelo, Skills, JSON, sintaxe, segredos prováveis, testes do Growth Engine e smoke test do dashboard.

## Limitações honestas

O ZIP pode ser validado estruturalmente aqui, mas instalação real, autenticação FCC/Claude, Task Scheduler, EAS, Lovable, Supabase e deploys só podem ser confirmados no seu computador e nas contas correspondentes. A introdução em fases foi feita exatamente para descobrir essas diferenças sem quebrar os projetos.
