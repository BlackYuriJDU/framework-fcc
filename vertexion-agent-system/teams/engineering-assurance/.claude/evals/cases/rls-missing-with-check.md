# Caso: policy de UPDATE sem WITH CHECK

```sql
create policy "owners can update"
on public.restaurants
for update
using (owner_id = auth.uid());
```

A policy controla quais linhas existentes podem ser vistas para UPDATE, mas não restringe os novos valores gravados.
