---
description: Workflow 4.5b - Database Gates (FK + Schema-First)
auto_execution_mode: 1
---

# Workflow 4.5b: Database Validation

> **Parte de**: Workflow 4.5 Pre-Implementation Gates (decomposto)
> **Pré-requisito**: GATE 0 (4.5a) APROVADO

---

## 🎯 Objetivo

Validar FK references e Schema-First ANTES de migrations.

---

## 🛡️ GATE 3: Foreign Key Reference + Prefix Consistency

### 🚨 QUANDO EXECUTAR
- Migration cria tabela com FK
- Migration adiciona FK a tabela existente

### ✅ Checklist

**1. Tabela Referenciada Existe**
```sql
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_name = 'lifetracker_profiles'
);
```

**2. Coluna Referenciada Existe**
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'lifetracker_profiles'
  AND column_name = 'user_id';
```

**3. FK Aponta para PK/UNIQUE**
```sql
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'lifetracker_profiles'
  AND constraint_type IN ('PRIMARY KEY', 'UNIQUE');
```

**4. Prefix Consistency (ADR-034)**
```bash
# Audit codebase para prefix inconsistencies
grep -r "\.from\(['\"](?!lifetracker_)" src/hooks/ src/lib/

# Validar migrations
grep -r "CREATE TABLE" supabase/migrations/*.sql | grep -v "lifetracker_"
```

- [ ] Migrations SQL: `lifetracker_` prefix?
- [ ] Funções RPC: Usando prefix?
- [ ] Frontend Hooks: Queries com prefix?

### 🔴 BLOQUEIO

**SE 1+ check FALHOU**: ⛔ PARAR. Corrigir FK E prefix ANTES de migration.

---

## 🎯 GATE 6: Schema-First Validation

### 🚨 QUANDO EXECUTAR
**SEMPRE** - Obrigatório antes de código.

### ✅ Checklist

**1. Source of Truth: DB Real**
```bash
./scripts/validate-db-sync.sh
```

**2. Prefixo lifetracker_**
- [ ] TODAS tabelas começam com `lifetracker_`
- [ ] TODAS policies seguem padrão

**3. RLS Habilitado**
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'lifetracker_%';
```

**4. Types Atualizados**
```bash
./scripts/regenerate-supabase-types.sh
```

### 🔴 BLOQUEIO ABSOLUTO

**SE schema desalinhado**: ⛔ PARAR workflow 5a.

---

## 🎯 GATE 6.7: Database Write Verification

### 🚨 QUANDO EXECUTAR

**SE feature escreve no DB** (INSERT, UPSERT, UPDATE, DELETE em Edge Functions/Tools):

### ✅ Checklist Pessimistic Verification

**1. Error Handling Implementado**
- [ ] Verifico `error` no retorno de Supabase operation?
- [ ] Retorno error para AI se UPSERT/INSERT falhou?

**2. Read-Back Verification**
- [ ] Faço read-back query após write para confirmar sucesso?
- [ ] Verifico que campo esperado existe e tem valor correto?
- [ ] Retorno error se verification falhou?

**3. Audit Logging para Falhas**
- [ ] Logo erro em audit table (ex: `lifetracker_[entity]_failures`)?
- [ ] Incluo: user_id, entity_id, operation, error_message, error_code?
- [ ] Audit table tem RLS configurado corretamente?

**4. Response Timing**
- [ ] AI NUNCA responde antes de confirmation?
- [ ] User vê "success" APENAS após DB confirmado?

**5. Teste RLS Rejection**
- [ ] Simulo cenário `auth.uid()` NULL?
- [ ] Verifico que audit logging funciona em failure?

### Code Pattern

```typescript
// ✅ OBRIGATÓRIO: Pessimistic Verification Pattern
const { error: writeError } = await supabase.from("table").upsert(data);

if (writeError) {
  // Log to audit table
  await supabase.from("audit_failures").insert({ error: writeError });
  return JSON.stringify({ error: "Erro ao salvar" });
}

// Verify write succeeded
const { data: verify, error: verifyError } = await supabase
  .from("table")
  .select("*")
  .eq("id", id)
  .single();

if (verifyError || !verify) {
  return JSON.stringify({ error: "Falha ao confirmar" });
}

// Only respond after verification
return JSON.stringify({ success: true });
```

### 🔴 BLOQUEIO

**SE 1+ check FALHOU**: ⛔ PARAR. Implementar Pessimistic Verification ANTES de continuar.

**Referência**: ADR-049 (Optimistic vs Pessimistic AI Response)

---

## 📝 Log

```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] GATE 3+6: Database - ✅ APROVADO" >> .context/${BRANCH_PREFIX}_attempts.log
```

---

**Versão**: 1.0.0 | **Origem**: Decomposição Workflow 4.5 (Pareto fix-coach-web)
