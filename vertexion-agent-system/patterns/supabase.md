# Supabase Patterns (Vertexion Ecosystem)

## Autenticação
- `supabase.auth.getSession()` no `beforeLoad`, nunca no cliente
- Service role key NUNCA no frontend (server functions apenas)
- RLS policies em TODAS as tabelas com dados de usuário

## Migrations
- Nomear: `YYYYMMDDHHMMSS_descricao.sql`
- Migration aplicada NUNCA é editada — nova migration para correção
- Sempre testar local antes de aplicar em produção

## RLS Policies
- `USING(true)` NUNCA em tabela com dados sensíveis — sempre justificar
- `WITH CHECK` policy OBRIGATÓRIA para INSERT/UPDATE (não só USING)
- `SECURITY DEFINER` com `search_path` FIXO (`public, extensions`)

## Storage
- Buckets com políticas por owner (`bucket_id = auth.uid()`)
- Bucket público justificado por escrito
- Validação de tipo (JPEG/PNG/WebP) e tamanho (max 2MB) no servidor

## Queries
- Service role client no servidor, anon key no cliente
- Sempre usar SDK Supabase — sem raw SQL string interpolation
- `maybeSingle()` para 0-ou-1 resultado esperado
- Ownership verification: `SELECT ... WHERE owner_id = auth.uid()` antes de mutations
