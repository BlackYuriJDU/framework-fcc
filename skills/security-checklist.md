# Security Checklist
Ativado por: auth, pagamento, secrets, dados pessoais, webhook, RLS, deploy.

- Nunca ler/exibir/registrar valores de `.env`, tokens, service role, certificados
- Verificar RLS, WITH CHECK, SECURITY DEFINER, search_path
- Webhooks: idempotência, verificação de assinatura
- Preços validados no backend (nunca confiar no frontend)
- Fail-closed, nunca fail-open
- Dados pessoais (LGPD): minimizar coleta, garantir exclusão
