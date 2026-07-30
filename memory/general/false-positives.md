# Falsos positivos

- Supabase anon key pública não é automaticamente segredo.
- CSP nonce `__NONCE__` no template HTML (__root.tsx) parece placeholder inseguro mas é substituído em runtime por `server.ts:injectNonce()` com UUID real por request. O header CSP está sendo enviado corretamente (verificado via curl). Não é um bug. Verificar server.ts antes de reportar CSP nonce issue.
