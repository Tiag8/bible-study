---
description: Workflow 4.5d - Edge Function Runtime Compatibility
auto_execution_mode: 1
---

# Workflow 4.5d: Edge Function Validation

> **Parte de**: Workflow 4.5 Pre-Implementation Gates (decomposto)
> **Pré-requisito**: GATE 0 (4.5a) APROVADO
> **QUANDO**: Edge Function nova/modificada

---

## 🎯 Objetivo

Validar compatibilidade runtime Deno ANTES de deploy.

---

## 🛡️ GATE 2: Runtime Compatibility

### 🚨 QUANDO EXECUTAR
- Qualquer Edge Function nova/modificada
- Uso de libs externas
- Código assíncrono

### ✅ Checklist

**1. Deno Runtime**
- [ ] Imports são Deno-compatíveis (`npm:` ou `jsr:`)
```typescript
// ✅ CORRETO
import Stripe from "npm:stripe@17.4.0";

// ❌ ERRADO
import Stripe from "stripe"; // Node.js style
```

**2. Async Pattern Correto**
```typescript
// ✅ CORRETO (Deno.serve)
Deno.serve(async (req) => { ... });

// ❌ ERRADO (addEventListener - deprecated)
addEventListener("fetch", (event) => { ... });
```

**3. TypeScript Checks Locais**
```bash
deno check supabase/functions/FUNCTION_NAME/index.ts
```

**4. Secrets Disponíveis**
```bash
supabase secrets list | grep -E "SECRET_KEY|API_KEY"
```
- [ ] Todos secrets necessários configurados

**5. CORS Headers**
- [ ] Função inclui CORS headers apropriados
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

**6. Error Handling**
- [ ] Try/catch em operações async
- [ ] Retorno HTTP apropriado (200/400/500)
- [ ] Logging para debugging

### 🔴 BLOQUEIO

**SE 1+ check FALHOU**: ⛔ PARAR. Corrigir runtime antes de deploy.

---

## 📝 Log

```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] GATE 2: Runtime Compatibility - ✅ APROVADO" >> .context/${BRANCH_PREFIX}_attempts.log
```

---

## 📚 Referências

- **Guide**: `docs/guides/EDGE_FUNCTIONS_BEST_PRACTICES.md`
- **Memory**: `~/.claude/memory/edge-functions.md`
- **CLAUDE.md**: REGRA #24 (Git Edge Functions)

---

**Versão**: 1.0.0 | **Origem**: Decomposição Workflow 4.5 (Pareto fix-coach-web)
