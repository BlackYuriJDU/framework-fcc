# Tailwind CSS Patterns (Vertexion Ecosystem)

## Versão
- Tailwind v4 (com `@theme`, não `tailwind.config.ts`)
- CSS nativo via `@import "tailwindcss"`

## Tema
```css
@theme {
  --color-background: #14151C;
  --color-foreground: #F8F8F8;
  --color-surface: #1E1F26;
  --color-primary: #E31C4A;
  --font-family-display: "Space Grotesk", sans-serif;
  --font-family-body: "Manrope", sans-serif;
  --font-family-mono: "JetBrains Mono", monospace;
}
```

## Regras
- Utilitários do Tailwind, NUNCA CSS modules ou styled-components
- Cores via variáveis CSS do `@theme`, não hex direto
- Responsivo: mobile-first (sm:, md:, lg:, xl:)
- Animações via Tailwind (`transition-all duration-200`, `hover:scale-105`)
- Dark mode via classe (`.dark`), não `prefers-color-scheme`
