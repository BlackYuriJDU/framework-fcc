# Arquitetura

```text
Vertexion Director (sessão principal)
├── Control Auditor
├── Portfolio Analyst
├── Growth Engine
├── Product Intelligence
└── Engineering Assurance
```

## Princípio central

O usuário descreve a intenção em linguagem natural. O diretor escolhe equipes e agentes, pergunta quando a ambiguidade altera materialmente o resultado e bloqueia ações externas até aprovação.

## Execução

- **Interativa:** Claude Code no WSL, com projetos no Windows.
- **Visual:** Control Center executa Claude em modo não interativo e transmite `stream-json`.
- **Rotinas:** scripts locais e Task Scheduler; Pipedream continua responsável pelo pipeline de leads quando configurado.
- **Memória geral:** diretório global do sistema.
- **Memória técnica:** `.claude/` e `docs/` de cada repositório.
- **Dados pessoais:** Supabase privado, nunca Git/Markdown.

## Modelo

Agentes de análise usam `model: opus`. O FCC pode redirecionar esse alias para outro provedor; o sistema registra modelo solicitado e provedor detectado, sem afirmar que foi Anthropic Opus quando não puder confirmar.
