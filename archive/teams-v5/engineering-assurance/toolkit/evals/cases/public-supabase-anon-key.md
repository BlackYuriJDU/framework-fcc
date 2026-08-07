# Caso: falso positivo esperado

```ts
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

A anon key pública do Supabase é destinada ao cliente. O risco deve ser avaliado pelas permissões e RLS, não pela mera presença da variável no frontend.
