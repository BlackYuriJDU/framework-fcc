# Caso: preço confiado ao cliente

```ts
const { planId, amount } = await request.json();
await paymentProvider.createCharge({ planId, amount, userId });
```

O backend usa diretamente o valor enviado pelo navegador, sem resolver o preço oficial do plano no servidor.
