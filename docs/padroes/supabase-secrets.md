# Padrão: Supabase Secrets Management

**Status**: Ativo
**Criado em**: 2025-11-02
**Autor**: Tiago
**Tags**: #padroes #supabase #secrets #edge-functions

---

## Contexto

Supabase oferece **dois métodos** para gerenciar secrets em Edge Functions:
1. **Supabase CLI** (`supabase secrets set`)
2. **Supabase Dashboard UI** (Settings → Edge Functions → Secrets)

**Problema crítico descoberto**: Secrets definidos via CLI **NÃO aparecem** no Dashboard UI, mas **funcionam** em runtime. Isso gera confusão e incidentes ("secrets sumiram!").

Este padrão documenta o **workflow correto** e **pitfalls** comuns.

---

## Problema

### Cenário Típico (Confusão)

```bash
# Developer define secret via CLI
$ supabase secrets set UAZAPI_INSTANCE_TOKEN="abc123"
# ✅ Saved successfully

# Developer vai no Dashboard UI para verificar
# ❌ Secret NÃO aparece na lista!

# Developer pensa: "Ué, não salvou?" e define novamente via UI
# ⚠️ CONFLITO: Agora tem DOIS valores diferentes!
```

**Root Cause**: CLI e UI usam **storages separados** (legacy).

---

## Solução: CLI como Fonte da Verdade

### Princípios

1. **CLI > UI**: SEMPRE usar CLI para definir secrets
2. **UI é read-only**: Dashboard UI serve apenas para visualizar (não criar)
3. **Version control**: Manter script de setup (`scripts/setup-secrets.sh`)
4. **Validação**: Sempre testar em runtime (não confiar no UI)

### Workflow Correto

#### 1. Definir Secrets via CLI

```bash
# scripts/setup-secrets.sh

#!/bin/bash
set -e

echo "🔐 Configurando secrets do Supabase..."

# UAZAPI credentials
supabase secrets set UAZAPI_INSTANCE_TOKEN="${UAZAPI_INSTANCE_TOKEN}" --project-ref="${SUPABASE_PROJECT_REF}"
supabase secrets set UAZAPI_SERVER_URL="${UAZAPI_SERVER_URL}" --project-ref="${SUPABASE_PROJECT_REF}"
supabase secrets set UAZAPI_WEBHOOK_SECRET="${UAZAPI_WEBHOOK_SECRET}" --project-ref="${SUPABASE_PROJECT_REF}"

# Gemini AI
supabase secrets set GEMINI_API_KEY="${GEMINI_API_KEY}" --project-ref="${SUPABASE_PROJECT_REF}"

# Verificar
echo "✅ Secrets configurados com sucesso!"
echo ""
echo "⚠️  IMPORTANTE: Secrets definidos via CLI NÃO aparecem no Dashboard UI."
echo "    Isso é comportamento esperado (legacy limitation)."
echo ""
echo "    Para validar, teste em runtime:"
echo "    → Deploy uma Edge Function"
echo "    → Verifique logs (Deno.env.get('SECRET_NAME'))"
```

**Executar**:
```bash
$ chmod +x scripts/setup-secrets.sh
$ export UAZAPI_INSTANCE_TOKEN="abc123"
$ export SUPABASE_PROJECT_REF="xyzproject"
$ ./scripts/setup-secrets.sh
```

#### 2. Validar em Runtime (NÃO no Dashboard)

```typescript
// supabase/functions/webhook-whatsapp-adapter/index.ts

// Validação de secrets no startup
const UAZAPI_INSTANCE_TOKEN = Deno.env.get('UAZAPI_INSTANCE_TOKEN');
const UAZAPI_SERVER_URL = Deno.env.get('UAZAPI_SERVER_URL');
const UAZAPI_WEBHOOK_SECRET = Deno.env.get('UAZAPI_WEBHOOK_SECRET');

if (!UAZAPI_INSTANCE_TOKEN) {
  throw new Error('UAZAPI_INSTANCE_TOKEN not configured');
}

console.log('✅ Secrets loaded successfully');
console.log(`Configuration:
  - UAZAPI_SERVER_URL: ${UAZAPI_SERVER_URL}
  - UAZAPI_INSTANCE_TOKEN: ${UAZAPI_INSTANCE_TOKEN.substring(0, 10)}...
  - UAZAPI_WEBHOOK_SECRET: ${UAZAPI_WEBHOOK_SECRET ? '✓ Set' : '✗ Missing'}
`);
```

**Deploy e verificar logs**:
```bash
$ supabase functions deploy webhook-whatsapp-adapter
$ supabase functions logs webhook-whatsapp-adapter

# Output esperado:
# ✅ Secrets loaded successfully
# Configuration:
#   - UAZAPI_SERVER_URL: https://stackia.uazapi.com
#   - UAZAPI_INSTANCE_TOKEN: abc123xyz...
#   - UAZAPI_WEBHOOK_SECRET: ✓ Set
```

#### 3. Documentar Secrets Esperados

```typescript
// supabase/functions/_shared/config.ts

/**
 * Configuração centralizada de variáveis de ambiente
 *
 * IMPORTANTE: Secrets devem ser definidos via Supabase CLI:
 *   $ supabase secrets set SECRET_NAME="value"
 *
 * ⚠️  Secrets via CLI NÃO aparecem no Dashboard UI (comportamento esperado).
 *    Validar em runtime (logs) após deploy.
 *
 * @see scripts/setup-secrets.sh - Script de setup completo
 */

export interface EdgeFunctionConfig {
  // Supabase (built-in)
  supabaseUrl: string;
  supabaseServiceRoleKey: string;

  // UAZAPI WhatsApp
  uazapiInstanceToken: string;      // REQUIRED: Auth token
  uazapiServerUrl: string;          // REQUIRED: Base URL
  uazapiWebhookSecret: string;      // REQUIRED: HMAC validation

  // Gemini AI
  geminiApiKey: string;             // REQUIRED: Google AI Studio
}

export function loadConfig(): EdgeFunctionConfig {
  const config: EdgeFunctionConfig = {
    // Supabase
    supabaseUrl: Deno.env.get('SUPABASE_URL')!,
    supabaseServiceRoleKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,

    // UAZAPI
    uazapiInstanceToken: Deno.env.get('UAZAPI_INSTANCE_TOKEN')!,
    uazapiServerUrl: Deno.env.get('UAZAPI_SERVER_URL') || 'https://stackia.uazapi.com',
    uazapiWebhookSecret: Deno.env.get('UAZAPI_WEBHOOK_SECRET')!,

    // Gemini
    geminiApiKey: Deno.env.get('GEMINI_API_KEY')!,
  };

  // Validar obrigatórios
  const required: (keyof EdgeFunctionConfig)[] = [
    'supabaseUrl',
    'supabaseServiceRoleKey',
    'uazapiInstanceToken',
    'uazapiWebhookSecret',
    'geminiApiKey',
  ];

  for (const key of required) {
    if (!config[key]) {
      throw new Error(`Missing required env var: ${key.toUpperCase()}`);
    }
  }

  return config;
}
```

---

## Pitfalls Comuns

### ❌ Pitfall 1: Confiar no Dashboard UI

```bash
# Developer define via CLI
$ supabase secrets set MY_SECRET="value"

# Developer vai no Dashboard
# UI mostra: "No secrets configured" ❌

# Developer pensa: "Não funcionou" e define via UI
# → Resultado: DOIS valores diferentes, comportamento imprevisível
```

**Solução**: NUNCA confiar no UI, sempre validar em runtime.

### ❌ Pitfall 2: Sobrescrever via UI

```bash
# Developer define via CLI (correto)
$ supabase secrets set UAZAPI_TOKEN="abc123"

# Developer vai no UI e clica "Add Secret"
# Define novamente: UAZAPI_TOKEN="xyz789"

# Resultado: Valor via UI sobrescreve CLI
# Edge Function agora usa "xyz789" (não "abc123")
```

**Solução**: NUNCA usar UI para criar secrets, apenas CLI.

### ❌ Pitfall 3: Secrets não-versionados

```bash
# Developer define secrets manualmente
$ supabase secrets set SECRET1="value1"
$ supabase secrets set SECRET2="value2"
$ supabase secrets set SECRET3="value3"

# Meses depois: "Quais secrets estão configurados?"
# → Ninguém sabe (não documentado)
```

**Solução**: Manter `scripts/setup-secrets.sh` versionado (Git).

### ❌ Pitfall 4: Secrets hardcoded

```typescript
// ❌ RUIM: Hardcoded secret (vazamento no Git)
const UAZAPI_TOKEN = 'abc123xyz';  // ← NUNCA fazer isso!

// ✅ BOM: Ler de variável de ambiente
const UAZAPI_TOKEN = Deno.env.get('UAZAPI_INSTANCE_TOKEN');
if (!UAZAPI_TOKEN) {
  throw new Error('UAZAPI_INSTANCE_TOKEN not configured');
}
```

---

## Checklist de Setup

```bash
Setup de Secrets (Supabase Edge Functions):

1. [ ] Criar script de setup:
   - scripts/setup-secrets.sh
   - Lista TODOS os secrets necessários
   - Documenta onde obter cada valor

2. [ ] Definir secrets via CLI:
   $ supabase secrets set SECRET_NAME="value"

3. [ ] Validar em código:
   - Ler com Deno.env.get()
   - Throw error se obrigatório ausente
   - Log de confirmação no startup

4. [ ] Deploy e testar:
   $ supabase functions deploy FUNCTION_NAME
   $ supabase functions logs FUNCTION_NAME
   - Verificar logs (secrets carregados?)

5. [ ] Documentar no código:
   - Comentário explicando CLI > UI
   - Lista de secrets esperados
   - Link para setup script

6. [ ] NÃO confiar no Dashboard UI:
   - UI não mostra secrets via CLI
   - Usar apenas para secrets via UI (evitar!)
```

---

## Exemplo Real: Life Tracker

### Setup Script

```bash
# scripts/setup-secrets.sh

#!/bin/bash
set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔐 Life Tracker - Setup de Secrets Supabase${NC}"
echo ""

# Validar variáveis de ambiente locais
if [ -z "$SUPABASE_PROJECT_REF" ]; then
  echo -e "${RED}❌ SUPABASE_PROJECT_REF não definida${NC}"
  echo "   Execute: export SUPABASE_PROJECT_REF=xyzproject"
  exit 1
fi

echo "📋 Secrets a configurar:"
echo "  1. UAZAPI_INSTANCE_TOKEN    (WhatsApp integration)"
echo "  2. UAZAPI_SERVER_URL        (WhatsApp server)"
echo "  3. UAZAPI_WEBHOOK_SECRET    (Webhook validation)"
echo "  4. GEMINI_API_KEY           (AI Coach)"
echo ""

# Confirmar
read -p "Continuar? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  exit 0
fi

# Definir secrets
echo ""
echo "🚀 Configurando secrets..."

supabase secrets set \
  UAZAPI_INSTANCE_TOKEN="${UAZAPI_INSTANCE_TOKEN}" \
  UAZAPI_SERVER_URL="${UAZAPI_SERVER_URL:-https://stackia.uazapi.com}" \
  UAZAPI_WEBHOOK_SECRET="${UAZAPI_WEBHOOK_SECRET}" \
  GEMINI_API_KEY="${GEMINI_API_KEY}" \
  --project-ref="${SUPABASE_PROJECT_REF}"

echo ""
echo -e "${GREEN}✅ Secrets configurados com sucesso!${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo "    - Secrets via CLI NÃO aparecem no Dashboard UI (comportamento esperado)"
echo "    - Para validar: Deploy uma Edge Function e verifique logs"
echo ""
echo "    Comandos úteis:"
echo "      $ supabase functions deploy webhook-whatsapp-adapter"
echo "      $ supabase functions logs webhook-whatsapp-adapter"
```

### Validação em Código

```typescript
// supabase/functions/webhook-whatsapp-adapter/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// Validação de secrets no startup
const REQUIRED_SECRETS = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'UAZAPI_INSTANCE_TOKEN',
  'UAZAPI_SERVER_URL',
  'UAZAPI_WEBHOOK_SECRET',
];

for (const secret of REQUIRED_SECRETS) {
  if (!Deno.env.get(secret)) {
    throw new Error(`Missing required secret: ${secret}`);
  }
}

// Carregar configs
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const UAZAPI_SERVER_URL = Deno.env.get('UAZAPI_SERVER_URL')!;
const UAZAPI_INSTANCE_TOKEN = Deno.env.get('UAZAPI_INSTANCE_TOKEN')!;

console.log('✅ Webhook WhatsApp UAZAPI ready!');
console.log(`Configuration:
  - SUPABASE_URL: ${SUPABASE_URL}
  - UAZAPI_SERVER_URL: ${UAZAPI_SERVER_URL}
  - UAZAPI_INSTANCE_TOKEN: ${UAZAPI_INSTANCE_TOKEN.substring(0, 10)}...
`);

serve(async (req: Request) => {
  // Handler...
});
```

---

## Quando Usar CLI vs UI

### ✅ Use CLI quando

- Setup inicial de projeto (secrets obrigatórios)
- CI/CD pipelines (automação)
- Múltiplos secrets (batch update)
- Secrets críticos (produção)
- Version control do setup (scripts/)

### ❌ Evite UI quando

- Qualquer situação acima (CLI é melhor)
- Secrets críticos (UI não é auditável)
- Equipe > 1 pessoa (UI gera inconsistência)

### 🟡 Use UI apenas se

- Teste rápido de protótipo (não-produção)
- Secret temporário (teste, debug)
- Solo developer + sem automação

---

## Benefícios do CLI

- ✅ **Versionável**: Scripts em Git (auditável)
- ✅ **Reproduzível**: Rodar script recria setup
- ✅ **Automação**: CI/CD pode rodar (zero manual)
- ✅ **Batch updates**: Múltiplos secrets de uma vez
- ✅ **Consistência**: Mesmo setup em dev/staging/prod

---

## Referências

- **Supabase Docs**: Edge Functions - Environment Variables
- **Código**: `scripts/setup-secrets.sh`
- **ADR 004**: UAZAPI Integration (secrets management)
- **Meta-learnings**: `docs/meta-learnings.md#supabase-secrets`

---

## Notas Finais

**Por que CLI e UI são separados?**
- **Legacy limitation**: Dashboard UI foi adicionado depois do CLI
- **Não-sincronizados**: CLI usa API interna, UI usa API pública (diferentes storages)
- **Futuro**: Supabase planeja unificar (roadmap 2025), mas hoje são separados

**Regra de ouro**: CLI como fonte da verdade, UI apenas para visualização.

---

**Última atualização**: 2025-11-02
**Status**: Padrão ativo (usado em produção)
**Casos de uso**: UAZAPI integration, Gemini AI, todos Edge Functions
