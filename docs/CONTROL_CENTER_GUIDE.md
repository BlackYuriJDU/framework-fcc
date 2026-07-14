# Vertexion Control Center

Dashboard local em `http://localhost:3741`, disponível apenas em `127.0.0.1`.

## Páginas

- **Início:** portfólio, melhor lead, rotinas, saúde e ações pendentes.
- **Executar:** campo natural para análise, investigação ou implementação.
- **Projetos:** caminhos locais, URLs, prioridade e estado.
- **Growth:** melhor lead, histórico e artefatos comerciais.
- **Ideias:** workspaces, nota, confiança e nível de evidência.
- **Rotinas:** diária, semanal e mensal; executar, ativar ou pausar.
- **Aprovações:** registro explícito de ações bloqueadas.
- **Relatórios:** arquivos de auditoria e resultados.
- **Atividade:** eventos transmitidos pelo Claude Code em `stream-json`.
- **Sistema:** Node, Git, Claude/FCC, caminhos e diagnóstico.

## Segurança

- Bind somente localhost.
- Requisições de alteração exigem token CSRF gerado no processo.
- Não existe endpoint para executar comando arbitrário.
- A central de aprovações registra a decisão, mas não transforma uma aprovação em execução automática de produção.
- Não exponha a porta por túnel, proxy, firewall ou roteador.

## Modos

- **Analisar:** `permission-mode plan`, até 32 turnos.
- **Profundo:** `permission-mode plan`, até 64 turnos.
- **Implementar:** `acceptEdits`, até 48 turnos, ainda sujeito às regras globais e aprovações.

## Dados

O Control Center usa JSON/JSONL local para estado operacional. Leads pessoais permanecem no Supabase; o dashboard só deve armazenar o mínimo necessário para exibição e auditoria.
