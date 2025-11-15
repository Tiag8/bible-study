---
description: Workflow Add-Feature (4.5/11) - Pre-Implementation Quality Gates
auto_execution_mode: 1
---

## 📚 Pré-requisito

Ler ANTES: `docs/PLAN.md`, `docs/TASK.md`, `README.md`, `AGENTS.md`

---

## 🧠 FASE 0: LOAD CONTEXT (.context/ - OBRIGATÓRIO)

**⚠️ CRÍTICO**: SEMPRE ler `.context/` ANTES de qualquer ação.

### 0.1. Ler INDEX.md (Guia de Leitura)

```bash
cat .context/INDEX.md
```

**Entender**:
- Ordem de leitura dos arquivos
- O que cada arquivo faz
- Checklists obrigatórios

### 0.2. Ler Context Files (Ordem Definida em INDEX.md)

```bash
# Prefixo da branch (ex: feat-members)
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')

# 1. Onde estou agora?
cat .context/${BRANCH_PREFIX}_workflow-progress.md

# 2. Estado atual resumido
cat .context/${BRANCH_PREFIX}_temp-memory.md

# 3. Decisões já tomadas
cat .context/${BRANCH_PREFIX}_decisions.md

# 4. Histórico completo (últimas 30 linhas)
tail -30 .context/${BRANCH_PREFIX}_attempts.log
```

### 0.3. Validação Context Loaded

**Checklist**:
- [ ] Li INDEX.md?
- [ ] Li workflow-progress.md (onde estou)?
- [ ] Li temp-memory.md (estado atual)?
- [ ] Li decisions.md (decisões já tomadas)?
- [ ] Li últimas 30 linhas de attempts.log?

**Se NÃO leu**: ⛔ PARAR e ler AGORA.

### 0.4. Log Início Workflow

```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] WORKFLOW: 4.5 (Pre-Implementation Gates) - START" >> .context/${BRANCH_PREFIX}_attempts.log
```

---

# Workflow 4.5/11: Pre-Implementation Quality Gates

**Novo workflow** inserido ANTES do Workflow 5a (Implementation).

**O que acontece**:
- 5 Quality Gates preventivos ANTES de escrever código
- Detecta 70% bugs ANTES implementação
- Economiza 10-15h debugging/feature

**Por que etapa dedicada**:
- ✅ Gates PREVENTIVOS (não reativos)
- ✅ Valida ANTES de código (não depois)
- ✅ Economiza debugging custoso
- ✅ Baseado em meta-learning: feat-payment-gateway (5h) vs feat-sync-crud-mandamentos (52h) = 10x

**Meta-Learning**:
- **ML-CONTEXT-03**: Quality Gates preventivos > reativos
- **ML-CONTEXT-02**: Schema-First validation previne 60% bugs
- **ADR-021**: Pre-Implementation Quality Gates

---

## 🤖 USO MÁXIMO DE AGENTES

**SEMPRE paralelo**: 3-5 agentes (Tool Validation + Runtime + Schema + File Size + Anti-Over-Engineering)
**Benefício**: 15-20min vs 1-2h

---

## 🛡️ GATE 1: Tool Definition Validation (Se Gemini AI Tool)

### 🎯 Objetivo
Validar schema de tool ANTES de codificar handler.

### 🚨 QUANDO EXECUTAR
- Feature usa Gemini AI tools (`gemini-tools-*.ts`)
- Qualquer modificação em tool existente

### ✅ Checklist

**1. Tool Schema Completo**
- [ ] `name` descritivo (ex: `save_habit`, não `save`)
- [ ] `description` clara (50-100 chars)
- [ ] `parameters` com tipos corretos (string, integer, boolean, array, object)
- [ ] `required` array define campos obrigatórios vs opcionais

**2. Alinhamento Backend**
```typescript
// Exemplo: save_habit
required: ["user_id", "name"]  // ← DB tem NOT NULL?
```

**Validação**:
```bash
# Verificar DB schema
./scripts/validate-db-sync.sh

# Query direto se necessário
mcp__supabase_lifetracker__execute_sql "
SELECT column_name, is_nullable, data_type
FROM information_schema.columns
WHERE table_name = 'lifetracker_habits'
ORDER BY ordinal_position;
"
```

**3. UUID Explícito (ML-CONTEXT-01)**
- [ ] Retorno tool inclui UUID no TEXTO (não só JSON)
```typescript
// ✅ CORRETO
message: `Hábito criado! [ID: ${uuid}]`

// ❌ ERRADO
{ habit_id: uuid }  // LLM não vê
```

**4. Fuzzy Match (CRUD) (ML-CONTEXT-09)**
- [ ] Tool aceita ID OU name (busca fuzzy)
```typescript
// update_habit, delete_habit, get_habit
const habit = await fuzzyMatchHabit(habitIdOrName, userId);
```

### 🔴 BLOQUEIO
**SE 1+ check FALHOU**: ⛔ PARAR. Ajustar tool definition ANTES de codificar.

### 📝 Log Decisão
```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')
# Log gate result com marcação explícita para validação
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] GATE 1: Tool Validation - ✅ APROVADO" >> .context/${BRANCH_PREFIX}_attempts.log
# OU se bloqueado:
# echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] GATE 1: Tool Validation - ❌ BLOQUEADO - [razão]" >> .context/${BRANCH_PREFIX}_attempts.log
```

---

## 🛡️ GATE 2: Runtime Compatibility (Se Edge Function)

### 🎯 Objetivo
Validar compatibilidade runtime ANTES de deploy.

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
# Validar antes deploy
deno check supabase/functions/FUNCTION_NAME/index.ts
```

**4. Secrets Disponíveis**
- [ ] `supabase secrets list` confirma vars necessárias
```bash
# Exemplo: stripe-webhook
supabase secrets list | grep -E "STRIPE_SECRET_KEY|STRIPE_WEBHOOK_SECRET"
```

### 🔴 BLOQUEIO
**SE 1+ check FALHOU**: ⛔ PARAR. Corrigir runtime antes de deploy.

### 📝 Log Decisão
```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')
# Log gate result com marcação explícita para validação
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] GATE 2: Runtime Compatibility - ✅ APROVADO" >> .context/${BRANCH_PREFIX}_attempts.log
# OU se bloqueado:
# echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] GATE 2: Runtime Compatibility - ❌ BLOQUEADO - [razão]" >> .context/${BRANCH_PREFIX}_attempts.log
```

---

## 🛡️ GATE 3: Foreign Key Reference Validation (Se Migration com FK)

### 🎯 Objetivo
Validar FK reference ANTES de aplicar migration.

### 🚨 QUANDO EXECUTAR
- Migration cria tabela com FK
- Migration adiciona FK a tabela existente

### ✅ Checklist

**1. Tabela Referenciada Existe**
```sql
-- Migration: lifetracker_payments REFERENCES lifetracker_profiles(user_id)
-- Validar ANTES:
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_name = 'lifetracker_profiles'
);
```

**2. Coluna Referenciada Existe**
```sql
-- Validar coluna user_id em profiles
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'lifetracker_profiles'
  AND column_name = 'user_id';
```

**3. FK Aponta para PK/UNIQUE**
- [ ] Coluna referenciada é PRIMARY KEY ou UNIQUE
```sql
-- Validar constraints
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'lifetracker_profiles'
  AND constraint_type IN ('PRIMARY KEY', 'UNIQUE');
```

**4. Prefixo Correto (lifetracker_)**
- [ ] FK usa prefixo: `FOREIGN KEY (user_id) REFERENCES lifetracker_profiles(user_id)`

### 🔴 BLOQUEIO
**SE 1+ check FALHOU**: ⛔ PARAR. Corrigir FK antes de aplicar migration.

### 📝 Log Decisão
```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')
# Log gate result com marcação explícita para validação
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] GATE 3: FK Validation - ✅ APROVADO" >> .context/${BRANCH_PREFIX}_attempts.log
# OU se bloqueado:
# echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] GATE 3: FK Validation - ❌ BLOQUEADO - [razão]" >> .context/${BRANCH_PREFIX}_attempts.log
```

---

## 🛡️ GATE 4: File Size Limit (Se Arquivo > 500L)

### 🎯 Objetivo
Prevenir context decay em arquivos grandes (ML-CONTEXT-10).

### 🚨 QUANDO EXECUTAR
- Arquivo novo > 500 linhas
- Modificação aumenta arquivo > 500L

### ✅ Checklist

**1. Context Decay Evidence**
- **Fonte**: NPR/Medium 2025 - "LLM esquece contexto em arquivos 300+ linhas"
- **Caso Real**: Handler 1,491L causou inconsistências → Modularização forçada

**2. File Size Check**
```bash
# Verificar tamanho
wc -l src/path/to/file.ts

# Se > 500L, considerar divisão
```

**3. Divisão Proposta**
```typescript
// Exemplo: gemini-chat-handler-v2.ts (1,491L)
// DIVIDIR EM:
// - gemini-tools-habits.ts (275L)
// - gemini-tools-stats.ts (186L)
// - gemini-tools-reminders.ts (240L)
// - handler-v2.ts (270L - apenas orchestration)
```

**4. Alternativas**
- [ ] Extrair utils/helpers para _shared/
- [ ] Extrair constants para arquivo separado
- [ ] Extrair types para types.ts

### 🟡 AVISO (não bloqueio)
**SE arquivo > 500L**: ⚠️ CONSIDERAR divisão. Documentar razão se não dividir.

### 📝 Log Decisão
```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')
# Log gate result com marcação explícita para validação
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] GATE 4: File Size - ✅ APROVADO" >> .context/${BRANCH_PREFIX}_attempts.log
# OU se aviso (não bloqueia):
# echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] GATE 4: File Size - ⚠️ AVISO: dividir sugerido (arquivo > 500L)" >> .context/${BRANCH_PREFIX}_attempts.log
```

---

## 🛡️ GATE 5: Anti-Over-Engineering

### 🎯 Objetivo
Validar que solução SIMPLES não existe (REGRA #10 CLAUDE.md).

### 🚨 QUANDO EXECUTAR
- ANTES de criar novo módulo/classe/abstração
- Feature que adiciona 3+ arquivos

### ✅ Checklist

**1. Funcionalidade Nativa Existe?**
- [ ] Gemini AI já faz? (parsing, extração, NLP)
- [ ] React/Supabase tem built-in? (cache, RLS, auth)
- [ ] Biblioteca instalada cobre? (Zod, Recharts)

**2. Gap Real Comprovado?**
```typescript
// ✅ TESTE OBRIGATÓRIO
// 1. Testar solução atual
// 2. Falhou em caso REAL (não hipotético)
// 3. Gap é SISTÊMICO (3+ casos) ou pontual?
```

**3. Alternativas Simples?**
- [ ] Ajustar prompt resolve?
- [ ] Parâmetro/config resolve?
- [ ] Doc adicional resolve?

**4. Red Flags (bloqueio imediato)**
- ❌ Parser/Extractor custom → Gemini já faz
- ❌ Cache custom → React Query já tem
- ❌ Validation layer → Zod já valida
- ❌ Auth custom → Supabase já tem
- ❌ "Futuramente vai precisar..." (YAGNI violation)

### 🔴 BLOQUEIO
**SE 1+ red flag**: ⛔ PARAR. Usar funcionalidade nativa.

### 📝 Log Decisão
```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')
# Log gate result com marcação explícita para validação
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] GATE 5: Anti-Over-Engineering - ✅ APROVADO" >> .context/${BRANCH_PREFIX}_attempts.log
# OU se bloqueado:
# echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] GATE 5: Anti-Over-Engineering - ❌ BLOQUEADO - [razão]" >> .context/${BRANCH_PREFIX}_attempts.log
```

---

## 🎯 GATE 6: Schema-First Validation (OBRIGATÓRIO - Todas Features)

### 🎯 Objetivo
Validar DB schema ANTES de codificar (ML-CONTEXT-02).

### 🚨 QUANDO EXECUTAR
**SEMPRE** - Workflow 4.5 executado ANTES Workflow 5a.

### ✅ Checklist

**1. Source of Truth: DB Real**
```bash
# Script automatizado
./scripts/validate-db-sync.sh

# Query manual se necessário
mcp__supabase_lifetracker__execute_sql "
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name LIKE 'lifetracker_%'
ORDER BY table_name, ordinal_position;
"
```

**2. Prefixo lifetracker_**
- [ ] TODAS tabelas começam com `lifetracker_`
- [ ] TODAS policies seguem padrão

**3. RLS Habilitado**
```sql
-- Validar RLS em tabelas novas
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'lifetracker_%';
```

**4. Types Atualizados**
```bash
# Regenerar types APÓS validação schema
./scripts/regenerate-supabase-types.sh
```

### 🔴 BLOQUEIO ABSOLUTO
**SE schema desalinhado**: ⛔ PARAR workflow 5a.

### 📝 Log Decisão
```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')
# Log gate result com marcação explícita para validação
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] GATE 6: Schema-First - ✅ APROVADO" >> .context/${BRANCH_PREFIX}_attempts.log
# OU se bloqueado:
# echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] GATE 6: Schema-First - ❌ BLOQUEADO - [razão]" >> .context/${BRANCH_PREFIX}_attempts.log
```

---

## 🛡️ GATE 7: Performance Validation (Pre-Code)

### 🎯 Objetivo
Validar performance requirements ANTES de codificar.

### 🚨 QUANDO EXECUTAR
- TODAS features (obrigatório)
- Modificação > 100 linhas

### ✅ Checklist

**1. Console.log Scan**
```bash
# Scan console.logs em src/ (não deve existir em produção)
grep -r "console.log" src/ --exclude-dir=node_modules || echo "✅ No console.logs found"
```
- [ ] 0 console.logs em src/ (production code)

**2. Bundle Size Check**
```bash
# Build preview para medir bundle
npm run build
# Verificar dist/ size
du -sh dist/
```
- [ ] Bundle size < 500KB (threshold)
- [ ] Se > 500KB: Identificar bloat (chunk analysis)

**3. Performance Budget**
- [ ] Dashboard load: < 2s target
- [ ] Coach Chat: < 5s target
- [ ] Habit Logging: Instantâneo

### 🔴 BLOQUEIO
**SE console.logs > 0 OU bundle > 500KB**: ⛔ PARAR. Limpar antes de prosseguir.

### 📝 Log Decisão
```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] GATE 7: Performance - ✅ APROVADO" >> .context/${BRANCH_PREFIX}_attempts.log
# OU se bloqueado:
# echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] GATE 7: Performance - ❌ BLOQUEADO - [razão]" >> .context/${BRANCH_PREFIX}_attempts.log
```

---

## 🛡️ GATE 8: Pre-Deploy Checklist (Pre-Code)

### 🎯 Objetivo
Validar deploy readiness ANTES de escrever código.

### 🚨 QUANDO EXECUTAR
- Features que alteram deployment (migrations, Edge Functions, env vars)
- OBRIGATÓRIO antes Workflow 5a

### ✅ Checklist

**1. Build Success**
```bash
npm run build
```
- [ ] Build completa sem erros

**2. TypeScript Check**
```bash
npx tsc --noEmit
```
- [ ] 0 type errors

**3. Lint Pass**
```bash
npx eslint "src/**/*.{ts,tsx}"
```
- [ ] 0 lint errors (warnings OK)

**4. Tests Pass (se existirem)**
```bash
npm run test 2>/dev/null || echo "N/A"
```
- [ ] Todos testes passam OU N/A

**5. Environment Variables**
- [ ] .env.example atualizado (se novos secrets)
- [ ] Supabase secrets configurados (se Edge Functions)

**6. Migrations Ready**
- [ ] Migration testada localmente (se DB changes)
- [ ] Rollback migration criada (se schema breaking)

### 🔴 BLOQUEIO
**SE 1+ check FALHOU**: ⛔ PARAR. Corrigir antes de prosseguir para Workflow 5a.

### 📝 Log Decisão
```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] GATE 8: Pre-Deploy - ✅ APROVADO" >> .context/${BRANCH_PREFIX}_attempts.log
# OU se bloqueado:
# echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] GATE 8: Pre-Deploy - ❌ BLOQUEADO - [razão]" >> .context/${BRANCH_PREFIX}_attempts.log
```

---

## ✅ APROVAÇÃO FINAL: Prosseguir para Workflow 5a

### Checklist Geral

**8 Gates Validados**:
- [ ] GATE 1: Tool Validation (se aplicável)
- [ ] GATE 2: Runtime Compatibility (se aplicável)
- [ ] GATE 3: FK Reference (se aplicável)
- [ ] GATE 4: File Size (aviso se > 500L)
- [ ] GATE 5: Anti-Over-Engineering
- [ ] GATE 6: Schema-First (OBRIGATÓRIO)
- [ ] GATE 7: Performance (OBRIGATÓRIO)
- [ ] GATE 8: Pre-Deploy (OBRIGATÓRIO)

**Se TODOS aprovados**: ✅ Prosseguir Workflow 5a (Implementation)

**Se 1+ bloqueado**: ⛔ PARAR. Corrigir antes de codificar.

---

## 📊 FASE FINAL: UPDATE CONTEXT

### Log Workflow Completo

```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')

# Log attempts.log
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] WORKFLOW: 4.5 (Pre-Implementation Gates) - COMPLETO" >> .context/${BRANCH_PREFIX}_attempts.log
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] RESULTADO: 8 gates validados, [X] aprovados, [Y] bloqueados" >> .context/${BRANCH_PREFIX}_attempts.log

# Atualizar workflow-progress.md
```

**Atualizar manualmente** (não automatizar):
- `.context/${BRANCH_PREFIX}_workflow-progress.md` → Adicionar seção Workflow 4.5
- `.context/${BRANCH_PREFIX}_temp-memory.md` → Atualizar "Próximos Passos"

---

## 📚 Documentação de Referência

**Meta-Learnings**:
- ML-CONTEXT-01: AI Context Persistence (UUID explícito)
- ML-CONTEXT-02: Schema-First Validation
- ML-CONTEXT-03: Quality Gates Preventivos > Reativos
- ML-CONTEXT-09: Fuzzy Match CRUD
- ML-CONTEXT-10: Context Decay 300+ linhas

**ADRs**:
- ADR-020: Schema-First Development
- ADR-021: Pre-Implementation Quality Gates
- ADR-022: AI Context Persistence Pattern

**CLAUDE.md Regras**:
- REGRA #8: Source of Truth Validation
- REGRA #10: Anti-Over-Engineering
- REGRA #14: Code Hygiene
- REGRA #15: AI Context Persistence
- REGRA #16: Pre-Implementation Quality Gates

**Benefícios Comprovados**:
- feat-payment-gateway: 5h (gates preventivos)
- feat-sync-crud-mandamentos: 52h (gates reativos)
- **Diferença**: 10x (47h economizadas)

---

**Versão**: 1.0.0
**Criado**: 2025-11-13
**Baseado em**: Meta-Learning Consolidation 2025-11-13
