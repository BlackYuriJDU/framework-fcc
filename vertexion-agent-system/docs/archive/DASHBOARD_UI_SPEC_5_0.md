# Dashboard UI 5.0 — Especificação detalhada

## Direção visual

**Objetivo:** abandonar a estética genérica azul/escura e adotar uma interface **light, premium, glassmorphism, clean e mais produtiva**, inspirada no layout de dashboards SaaS modernos.

## Referência estética

A interface deve lembrar um dashboard administrativo com:

- fundo geral em cinza muito claro / off-white;
- superfícies com cartões brancos translúcidos;
- sombras suaves e difusas;
- bordas claras com leve transparência;
- navegação lateral clara;
- métricas no topo;
- conteúdo dividido em cartões com hierarquia forte;
- tipografia limpa e bem espaçada;
- pouco ruído visual.

## Paleta recomendada

- Background base: `#F3F5F9`
- Background auxiliar: `#EEF1F6`
- Surface glass: `rgba(255,255,255,0.78)`
- Surface solid: `#FFFFFF`
- Border soft: `rgba(148, 163, 184, 0.22)`
- Text main: `#0F172A`
- Text secondary: `#475569`
- Text tertiary: `#64748B`
- Brand primary: `#5B8CFF`
- Brand secondary: `#6ED1FF`
- Success: `#16A34A`
- Warning: `#D97706`
- Danger: `#DC2626`
- Idea/Product accent: `#8B5CF6`
- Growth accent: `#F59E0B`
- Engineering accent: `#06B6D4`

## Glassmorphism

Todo card importante deve usar:

- `backdrop-filter: blur(18px)`
- `background: rgba(255,255,255,0.72)`
- borda: `1px solid rgba(255,255,255,0.55)` + linha suave externa `rgba(148,163,184,0.20)`
- sombra grande suave: `0 18px 50px rgba(15, 23, 42, 0.08)`

## Layout

### Shell

- sidebar fixa à esquerda, largura ~260px;
- topo com título, subtítulo, pesquisa curta, relógio e status;
- área central com grid de cards.

### Sidebar

- logo em card arredondado com gradiente azul claro;
- título “Vertexion Control Center”;
- botões de navegação com ícones discretos;
- item ativo com fundo branco translúcido e brilho suave;
- rodapé mostrando “Somente localhost”.

### Home

1. linha superior com 4 métricas:
   - Projetos
   - Execuções ativas
   - Aprovações
   - Ideias
2. segunda linha:
   - Portfólio e prioridade
   - Equipes
3. terceira linha:
   - Melhor lead do dia
   - Resumo rápido das rotinas
4. quarta linha:
   - Atividade recente
   - Alertas / saúde

### Leads

- cards superiores com funil e estatísticas;
- tabela principal de leads com busca e filtros;
- painel lateral do melhor lead com score, mensagem, CTA e Loom.

### Ideias

- cards resumidos em grid;
- detalhe da ideia com abas: Resumo, Hipóteses, Evidências, Concorrentes, Experimento, Decisão, Resultado real.

### Relatórios

- lista à esquerda;
- visualizador Markdown/JSON à direita;
- destaque para risco, recomendações e data.

### Sistema

- saúde do ambiente;
- versões;
- caminho do home;
- logs;
- backups;
- últimas rotações.

## Tipografia

- `Inter` ou `ui-sans-serif`;
- títulos mais pesados, com tracking levemente negativo;
- labels e overlines em caixa alta discreta;
- usar texto secundário para contexto e explicações.

## Microinterações

- hover com elevação suave;
- badges com cores suaves e fundo pastel;
- animação rápida de 140–180ms;
- skeleton simples para carregamento futuro.

## Experiência funcional

- nenhuma página deve ficar vazia sem contexto;
- sempre mostrar estado vazio com orientação prática;
- relatórios e ideias devem abrir sem trocar de página inteira;
- botão de copiar mensagem do lead deve existir;
- os cards de métricas devem explicar seu valor com um subtítulo pequeno.
