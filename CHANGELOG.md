# Changelog

## 5.0.0 — 2026-07-01

- Complemento operacional do 4.0.0.
- UI do dashboard refeita em tema claro glassmorphism.
- Instalação com merge, clean e dry-run.
- Scripts de backup e restauração no WSL e Windows.
- Logs com rotação automática (1.5MB, mantém 8).
- Leads, ideias e relatórios com visualização melhorada.
- Persistência da mensagem do melhor lead.
- Base para permission prompt tool (gated).
- Scripts de cápsula do tempo e rotação de logs.
- `disableBypassPermissionsMode` no settings.json.

## 4.0.0 — 2026-06-30

### Arquitetura

- Criado o Vertexion Director como agente principal global real.
- Integradas três equipes: Growth Engine, Product Intelligence e Engineering Assurance.
- Adicionada camada Vertexion Control para portfólio, auditoria e aprovações.
- Reduzidas as Skills visíveis para `/revisar`, `/validar` e `/preview`.
- Todos os agentes solicitam Opus com esforço alto.

### Control Center

- Dashboard localhost sem dependências externas.
- Streaming `stream-json`, interrupção de execução e retomada de estado operacional.
- Projetos, leads, ideias, rotinas, aprovações, relatórios e saúde do sistema.
- Bind loopback, CSRF e ausência de endpoint para shell arbitrário.
- Scheduler interno diário, semanal e mensal sem duplicação pelo Task Scheduler.

### Growth Engine

- Preservado o Scout moderno e removida a arquitetura legada duplicada.
- Chaves opcionais em modo teste e validação condicional por integração.
- Histórico de aceitos, rejeitados e duplicados para nunca repetir empresas.
- Orçamento local Tavily.
- Melhor lead do dia e artefato para o dashboard.
- Fluxo interno diário, Pipedream/n8n documentados e nenhum envio a leads.

### Product Intelligence

- Equipe construída do zero.
- Hipóteses falsificáveis, fontes, concorrência, viabilidade, regulação, red team e experimento.
- Nota, confiança e evidência separadas.
- Escada de evidência 0–5 e validação apenas a partir de pagamento.
- Workspaces por ideia e avaliações artificiais.

### Engineering Assurance

- Pipeline v3 migrado para agentes prefixados e roteamento condicional.
- Toolkit de escopo, fingerprint, scanner e avaliações preservado.
- Correções de permission mode para build, runtime, regressão, memória e preview.
- Planos específicos para ZapMenu, Toveli, Vertexion, Tenvyr e Signalys.

### Segurança e instalação

- Removidos tokens, `.env`, caches, históricos e dados pessoais.
- Criados instaladores Windows/WSL com backup e desinstalação segura.
- Instalação padrão somente no WSL; Windows é opcional.
- Criado checklist de rotação, scanner e migração segura de MCPs.
- Adicionados self-tests e validador final do pacote.
