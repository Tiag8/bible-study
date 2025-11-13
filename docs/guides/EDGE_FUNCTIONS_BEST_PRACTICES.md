# Edge Functions Best Practices (Deno Runtime)

**Última atualização**: 2025-11-12
**Contexto**: Supabase Edge Functions (Deno Edge Runtime)

---

## 🎯 RESUMO EXECUTIVO

Edge Functions rodam em **Deno Edge Runtime** (não Node.js).

**Diferenças críticas**:
- ✅ APIs async obrigatórias (SubtleCrypto)
- ✅ Imports via URL (`https://esm.sh/`)
- ✅ Env vars via `Deno.env.get()`

**ROI**: Previne 20-40min debug por função

---

## 🔧 PADRÕES OBRIGATÓRIOS

### **1. Imports**

```typescript
// ✅ CORRETO (Deno)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0';

// ❌ ERRADO (Node.js)
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
```

**Fontes**:
- esm.sh: `https://esm.sh/[package]@[version]`
- deno.land: `https://deno.land/x/[package]`

---

### **2. Environment Variables**

```typescript
// ✅ CORRETO (Deno)
const apiKey = Deno.env.get('API_KEY');

// ❌ ERRADO (Node.js)
const apiKey = process.env.API_KEY;
```

**Configurar secrets**:
```bash
supabase secrets set API_KEY=value
supabase secrets list  # Ver secrets configurados
```

---

### **3. Crypto APIs (SEMPRE ASYNC)**

```typescript
// ✅ CORRETO (Deno - Async)
const event = await stripe.webhooks.constructEventAsync(
  body, 
  signature, 
  webhookSecret
);

// ❌ ERRADO (Node.js - Sync)
const event = stripe.webhooks.constructEvent(
  body, 
  signature, 
  webhookSecret
);
```

**Por quê**: Deno usa `SubtleCrypto` (Web Crypto API) que é async.

**Erro comum**:
```
SubtleCryptoProvider cannot be used in a synchronous context
```

**Solução**: Usar versão `Async` da API.

---

### **4. Serve Function**

```typescript
// ✅ CORRETO (Deno)
Deno.serve(async (req) => {
  // Handler code
  return new Response('OK', { status: 200 });
});

// ❌ ERRADO (Node.js)
export default async function handler(req, res) {
  res.status(200).json({ ok: true });
}
```

---

### **5. CORS Headers**

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle OPTIONS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  // Your logic
  
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
});
```

---

## 🔍 CHECKLIST PRÉ-DEPLOY

**ANTES de deploy Edge Function**:

- [ ] **Imports**: URLs (`https://esm.sh/` ou `https://deno.land/`)
- [ ] **Env vars**: `Deno.env.get()` (não `process.env`)
- [ ] **Crypto**: APIs async (`constructEventAsync`, `await crypto`)
- [ ] **Serve**: `Deno.serve()` (não `export default`)
- [ ] **CORS**: Headers configurados
- [ ] **Pesquisa**: "[lib] + Deno Edge Runtime" (ex: "Stripe Deno")

---

## 🐛 TROUBLESHOOTING

### **Erro: SubtleCryptoProvider cannot be used in synchronous context**

**Causa**: Usando API síncrona em Deno (que requer async)

**Solução**:
```typescript
// ❌ ANTES
const result = crypto.subtle.digest('SHA-256', data);

// ✅ DEPOIS
const result = await crypto.subtle.digest('SHA-256', data);
```

**Exemplos comuns**:
- Stripe: `constructEvent()` → `constructEventAsync()`
- JWT: `verify()` → `verifyAsync()`
- Hash: `createHash()` → `await crypto.subtle.digest()`

---

### **Erro: Cannot find module**

**Causa**: Import Node.js ao invés de URL

**Solução**:
```typescript
// ❌ ANTES
import Stripe from 'stripe';

// ✅ DEPOIS
import Stripe from 'https://esm.sh/stripe@14.21.0';
```

---

### **Erro: Deno is not defined**

**Causa**: Lint error (esperado em IDE, funciona em runtime)

**Solução**: Ignorar (ou adicionar `deno.json` com types)

```json
{
  "compilerOptions": {
    "lib": ["deno.window"],
    "types": ["https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts"]
  }
}
```

---

## 📚 BIBLIOTECAS COMUNS

### **Stripe**

```typescript
import Stripe from 'https://esm.sh/stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-11-20.acacia',
  httpClient: Stripe.createFetchHttpClient(), // ⚠️ Obrigatório para Deno
});

// Webhook (ASYNC)
const event = await stripe.webhooks.constructEventAsync(body, sig, secret);
```

**Docs**: [Stripe + Deno](https://stripe.com/docs/webhooks/deno)

---

### **Supabase Client**

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Queries normais
const { data, error } = await supabase
  .from('table')
  .select('*')
  .eq('id', id);
```

---

### **Fetch (Built-in)**

```typescript
// Fetch já está disponível (Web API)
const response = await fetch('https://api.example.com', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
  signal: AbortSignal.timeout(5000), // Timeout 5s
});

const json = await response.json();
```

---

## 🚀 DEPLOY

```bash
# Deploy função
supabase functions deploy function-name --no-verify-jwt

# Ver logs
supabase functions logs function-name

# Testar localmente
supabase functions serve function-name
```

---

## 📖 REFERÊNCIAS

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Deno Runtime](https://deno.com/runtime)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [esm.sh CDN](https://esm.sh/)

---

## 🎯 META-LEARNING

**Origem**: ML-15 (Payment Gateway Stripe)
**Bugs prevenidos**: Runtime incompatibility (HTTP 400)
**ROI**: 20-40min por Edge Function

**Aplicar**: TODAS Edge Functions futuras

---

**Última atualização**: 2025-11-12
**Status**: Validado em produção
**Referência**: `docs/meta-learnings/ML-15-payment-gateway-learnings.md`
