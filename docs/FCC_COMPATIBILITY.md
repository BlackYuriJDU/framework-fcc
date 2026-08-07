# Compatibilidade com FCC

O sistema procura primeiro `fcc-claude` e depois `claude`.

- Todos os agentes declaram `model: opus`.
- Com FCC, esse alias pode ser redirecionado para DeepSeek, Groq, OpenRouter ou outro provedor.
- O dashboard usa `-p --output-format stream-json --verbose`.
- Configure chaves somente em variáveis de ambiente ou no mecanismo seguro do FCC.
- Não grave Tavily, Groq ou outros tokens em `settings.json` ou URLs MCP.
- Execute `vertexion-doctor` para conferir os binários disponíveis.
