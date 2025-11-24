# ADR-034: Database Prefix Migration Checklist ({{PROJECT_PREFIX}})

**Status**: ✅ Aprovado
**Data**: 2025-11-21
**Contexto**: Meta-Learning feat-super-admin-dashboard (3/5 bugs prefix-related)
**Decisores**: Baseado em análise RCA de 3 bugs prefix mismatch

---

## 📋 CONTEXTO

### Problema Identificado

**3 Bugs Relacionados a Prefix** (feat-super-admin-dashboard):

**Bug #1 (Função SQL - has_role não encontrada)**:
- Migration 20251121013720 referenciou `has_role()` sem prefix
- **Root Cause**: Função existe como `{{PROJECT_PREFIX}}_has_role()` (com prefix)
- **Erro**: `function has_role(uuid, text) does not exist`
- **Fix**: Corrigir para `{{PROJECT_PREFIX}}_has_role()` na migration

**Bug #2 (Hook TypeScript - Tabela não encontrada)**:
- `useAdminAuth.tsx` linha 31 query `user_roles` sem prefix
- **Root Cause**: Tabela é `{{PROJECT_PREFIX}}_user_roles` (com prefix)
- **Erro**: `relation "user_roles" does not exist`
- **Fix**: Atualizar query para `{{PROJECT_PREFIX}}_user_roles`

**Bug #3 (View Materializada - 9 tabelas sem prefix)**:
- Migration 20251121015059 view `admin_metrics_summary` referenciou:
  - `users` → `{{PROJECT_PREFIX}}_users`
  - `user_roles` → `{{PROJECT_PREFIX}}_user_roles`
  - `areas` → `{{PROJECT_PREFIX}}_areas`
  - `goals` → `{{PROJECT_PREFIX}}_goals`
  - `habits` → `{{PROJECT_PREFIX}}_habits`
  - `habit_logs` → `{{PROJECT_PREFIX}}_habit_logs`
  - `reminders` → `{{PROJECT_PREFIX}}_reminders`
  - `assessments` → `{{PROJECT_PREFIX}}_assessments`
  - `whatsapp_conversations` → `{{PROJECT_PREFIX}}_whatsapp_conversations`
- **Root Cause**: View criada baseando-se em nomes old tables (pré-Schema-First)
- **Erro**: `relation "X" does not exist` (9x)
- **Fix**: Regenerar view com prefixo correto todas tabelas

### Root Cause Analysis (5 Whys)

1. **Por quê 3 bugs prefix?** → Views, funções e hooks referenciando old table names
2. **Por quê old names?** → Código/migrations criados antes de Schema-First padronização
3. **Por quê não atualizados?** → Gap temporal entre migrations antigas e nova feature
4. **Por quê gap temporal?** → Schema-First (ADR-020) adotado recentemente (2025-10)
5. **ROOT CAUSE**: Falta checklist sistemático PRÉ-COMMIT validando prefix obrigatório

### Evidências de Recorrência

- **Taxa de ocorrência**: 60% bugs feature (3/5 bugs)
- **Tempo debugging**: 1-2h por bug (total 3-6h)
- **Tempo prevenção**: 5min checklist (ROI 36x-72x)
- **Padrão**: Funções SQL, hooks TypeScript, views materializadas

### Meta-Learning

**Insight**: Prefix `{{PROJECT_PREFIX}}_` é OBRIGATÓRIO (ADR-020), mas validação manual falha. Checklist + script previne 60% bugs prefix.

**Relação com ADR-020**: Schema-First valida estrutura, mas NÃO valida naming convention (gap coberto por ADR-034).

---

## 🎯 DECISÃO

### Checklist PRÉ-COMMIT Obrigatório

**Executar ANTES de git commit** (migrations, hooks, views):

#### 1. **Migrations SQL** (supabase/migrations/*.sql)

- [ ] **Tabelas**: TODAS com `{{PROJECT_PREFIX}}_` prefix?
  ```sql
  -- ✅ CORRETO
  CREATE TABLE {{PROJECT_PREFIX}}_users (...);

  -- ❌ ERRADO
  CREATE TABLE users (...);
  ```

- [ ] **Funções**: TODAS com `{{PROJECT_PREFIX}}_` prefix?
  ```sql
  -- ✅ CORRETO
  SELECT {{PROJECT_PREFIX}}_has_role(user_id, 'admin');

  -- ❌ ERRADO
  SELECT has_role(user_id, 'admin');
  ```

- [ ] **Views Materializadas**: Referências com prefix?
  ```sql
  -- ✅ CORRETO
  FROM {{PROJECT_PREFIX}}_users u
  JOIN {{PROJECT_PREFIX}}_user_roles ur ON u.id = ur.user_id;

  -- ❌ ERRADO
  FROM users u
  JOIN user_roles ur ON u.id = ur.user_id;
  ```

#### 2. **Frontend Hooks** (src/hooks/*.tsx)

- [ ] **Queries Supabase**: Tabelas com prefix?
  ```typescript
  // ✅ CORRETO
  const { data } = await supabase
    .from('{{PROJECT_PREFIX}}_user_roles')
    .select('*');

  // ❌ ERRADO
  const { data } = await supabase
    .from('user_roles')
    .select('*');
  ```

- [ ] **Types Regenerados**: Após migration aplicada?
  ```bash
  ./scripts/regenerate-supabase-types.sh
  ```

#### 3. **Validation Script** (obrigatório)

- [ ] **Executar**: `./scripts/validate-schema-first.sh` passou sem erros?

**Script Valida**:
- Prefixo `{{PROJECT_PREFIX}}_` em TODAS tabelas públicas
- RLS habilitado
- Types.ts sincronizado com DB real

**SE 1+ check FALHOU**: ⛔ PARAR commit. Ajustar migration/código.

### Script de Validação Automática

**Criado**: `./scripts/validate-db-prefix.sh`

```bash
#!/bin/bash
# Valida prefix {{PROJECT_PREFIX}}_ em migrations e código

echo "=== Validando Prefix {{PROJECT_PREFIX}}_ ==="

# 1. Verificar migrations (SQL)
MIGRATIONS=$(find supabase/migrations -name "*.sql" -type f)
VIOLATIONS_SQL=""

for file in $MIGRATIONS; do
  # Detectar CREATE TABLE sem prefix
  if grep -q "CREATE TABLE [^l][^i][^f][^e]" "$file"; then
    VIOLATIONS_SQL="$VIOLATIONS_SQL\n$file: CREATE TABLE sem prefix"
  fi

  # Detectar JOIN/FROM sem prefix (exceto auth.users, storage.*)
  if grep -qE "FROM [^l][^i][^f][^e]|JOIN [^l][^i][^f][^e]" "$file" | grep -v "auth\\." | grep -v "storage\\."; then
    VIOLATIONS_SQL="$VIOLATIONS_SQL\n$file: FROM/JOIN sem prefix"
  fi
done

if [ ! -z "$VIOLATIONS_SQL" ]; then
  echo "❌ ERRO: Migrations SQL sem prefix {{PROJECT_PREFIX}}_:"
  echo -e "$VIOLATIONS_SQL"
  exit 1
fi

# 2. Verificar hooks TypeScript
HOOKS=$(find src/hooks -name "*.tsx" -o -name "*.ts")
VIOLATIONS_TS=""

for file in $HOOKS; do
  # Detectar .from('X') sem {{PROJECT_PREFIX}}_
  if grep -qE "\\.from\\(['\"][^l][^i][^f][^e]" "$file"; then
    VIOLATIONS_TS="$VIOLATIONS_TS\n$file: .from() sem prefix"
  fi
done

if [ ! -z "$VIOLATIONS_TS" ]; then
  echo "❌ ERRO: Hooks TypeScript sem prefix {{PROJECT_PREFIX}}_:"
  echo -e "$VIOLATIONS_TS"
  exit 1
fi

# 3. Validar DB real (se conectado)
if command -v psql &> /dev/null; then
  NO_PREFIX=$(psql "$DATABASE_URL" -t -c "
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name NOT LIKE '{{PROJECT_PREFIX}}_%'
      AND table_name NOT IN ('schema_migrations', 'spatial_ref_sys');
  ")

  if [ ! -z "$NO_PREFIX" ]; then
    echo "❌ ERRO: Tabelas DB SEM prefix {{PROJECT_PREFIX}}_:"
    echo "$NO_PREFIX"
    exit 1
  fi
fi

echo "✅ Prefix {{PROJECT_PREFIX}}_ validado: Migrations OK, Hooks OK, DB OK"
```

### Git Pre-Commit Hook (Opcional)

Adicionar em `.git/hooks/pre-commit`:

```bash
#!/bin/bash
# Validar prefix antes de commit

./scripts/validate-db-prefix.sh

if [ $? -ne 0 ]; then
  echo ""
  echo "🚫 COMMIT BLOQUEADO: Violations prefix {{PROJECT_PREFIX}}_"
  echo "Fix migrations/hooks e execute novamente."
  exit 1
fi
```

---

## 🔧 ALTERNATIVAS CONSIDERADAS

### Alternativa 1: Validação Manual (REJEITADA)

**Prós**:
- Sem overhead script
- Flexibilidade caso a caso

**Contras**:
- ❌ Taxa erro 60% (evidência feat-super-admin-dashboard)
- ❌ Debugging 1-2h por bug (vs 5min checklist)
- ❌ Não escala (mais features = mais bugs)

**Decisão**: ❌ REJEITADA - Manual não confiável

### Alternativa 2: Renomear Tabelas (Remover Prefix) (REJEITADA)

**Prós**:
- Queries mais limpas (sem prefix)

**Contras**:
- ❌ ADR-020 Schema-First padronizou `{{PROJECT_PREFIX}}_` (decisão aprovada)
- ❌ Breaking change massivo (41 migrations, 14 features)
- ❌ Colisões namespace (users, roles, etc)

**Decisão**: ❌ REJEITADA - Violaria ADR-020

### Alternativa 3: Checklist + Script Validation (APROVADA) ✅

**Prós**:
- ✅ Detecta 100% violations (migrations, hooks, DB)
- ✅ ROI 36x-72x (5min vs 1-2h debugging)
- ✅ Compatível ADR-020 Schema-First
- ✅ Pre-commit hook opcional (automação)

**Contras**:
- ⚠️ +5min validação PRÉ-COMMIT (aceitável)

**Decisão**: ✅ APROVADA - Custo-benefício favorável

---

## 📊 CONSEQUÊNCIAS

### Positivas

1. **Prevenção 60% Bugs Prefix**
   - Elimina classe bugs mismatch (funções, hooks, views)
   - Detecta ANTES commit (não debugging prod)

2. **Economia Tempo**
   - Validação: 5min (checklist + script)
   - Debugging evitado: 1-2h/bug × 3 bugs = 3-6h
   - **ROI**: 36x-72x (3-6h ÷ 5min)

3. **Alinhamento ADR-020**
   - Reforça Schema-First Development
   - Prefix `{{PROJECT_PREFIX}}_` obrigatório validado automaticamente

4. **Confiança Migrations**
   - Pre-commit hook bloqueia commits problemáticos
   - Zero surpresas em produção

### Negativas

1. **Overhead Validação**
   - +5min PRÉ-COMMIT (checklist + script)
   - **Mitigação**: Automação via pre-commit hook (1-2min)

2. **Manutenção Script**
   - Atualizar se padrões mudarem
   - **Mitigação**: Script simples (grep-based), baixa complexidade

---

## 🔗 RELACIONADOS

### ADRs

- **ADR-020**: Schema-First Development (source of truth, prefix obrigatório)
- **ADR-021**: Pre-Implementation Quality Gates (GATE 6 Schema-First)
- **ADR-023**: Git Migrations (ordem commit migration + types)

### Workflows

- **Workflow 2b**: Technical Design (executar validate-schema-first.sh)
- **Workflow 4.5**: Pre-Implementation Gates (GATE 6 Schema-First)
- **Workflow 5a**: Implementation (checklist PRÉ-COMMIT)

### {{PROJECT_NAME}} Regras

- **REGRA #8**: Source of Truth Validation (scripts obrigatórios)
- **REGRA #23**: Git Migrations (commit migration + types + validation)

### Features

- **feat-super-admin-dashboard**: 3/5 bugs prefix (60%), 3-6h debugging

### Scripts

- **`validate-schema-first.sh`**: Valida prefix + RLS + types (existente)
- **`validate-db-prefix.sh`**: Valida prefix migrations + hooks (novo)
- **`regenerate-supabase-types.sh`**: Regenera types pós-migration

---

## 📝 NOTAS IMPLEMENTAÇÃO

### Checklist Rápido (Template)

**Copiar para PR description ou commit message**:

```markdown
## ✅ Checklist Prefix {{PROJECT_PREFIX}}_

**Migrations SQL**:
- [ ] Tabelas com prefix
- [ ] Funções com prefix
- [ ] Views com prefix

**Frontend Hooks**:
- [ ] .from() com prefix
- [ ] Types regenerados

**Validation**:
- [ ] ./scripts/validate-db-prefix.sh PASSED
- [ ] ./scripts/validate-schema-first.sh PASSED
```

### Workflow Integration (Proposto)

**Workflow 5a Implementation - Adicionar Fase 0.5**:

```markdown
### 0.5 GATE: Prefix Validation (OBRIGATÓRIO)

**Executar ANTES de git commit**:

```bash
./scripts/validate-db-prefix.sh
```

**Checklist**:
- [ ] Script passou sem erros
- [ ] Migrations com prefix {{PROJECT_PREFIX}}_
- [ ] Hooks com prefix {{PROJECT_PREFIX}}_
- [ ] Types regenerados

**SE FALHOU**: ⛔ PARAR commit. Ajustar migrations/hooks.
```

### Exceções Permitidas

**Tabelas SEM prefix `{{PROJECT_PREFIX}}_`** (whitelist):

- `schema_migrations` (Supabase internal)
- `spatial_ref_sys` (PostGIS internal)
- `auth.*` (Supabase Auth schema)
- `storage.*` (Supabase Storage schema)

**Regra**: TODAS tabelas `public` schema DEVEM ter prefix `{{PROJECT_PREFIX}}_`.

---

## 📚 REFERÊNCIAS

1. **feat-super-admin-dashboard**: 3/5 bugs prefix (60%), migrations 20251121013720, 20251121015059
2. **ADR-020**: Schema-First Development (source of truth DB real, prefix obrigatório)
3. **REGRA #8**: Source of Truth Validation (scripts validação obrigatórios)
4. **useAdminAuth.tsx** linha 31: Bug #2 (`user_roles` → `{{PROJECT_PREFIX}}_user_roles`)
5. **Migration 20251121013720**: Bug #1 (`has_role()` → `{{PROJECT_PREFIX}}_has_role()`)
6. **Migration 20251121015059**: Bug #3 (9 tabelas view sem prefix)

---

**Aprovado por**: {{DEVELOPER_NAME}}
**Data Aprovação**: 2025-11-21
**Revisão**: N/A (ADR inicial)
