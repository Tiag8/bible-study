# 📋 Sprint 2 - Instruções de Aplicação de Migrations

**Status**: ⏳ Aguardando aplicação manual no Supabase Dashboard

**Data**: 2026-01-27
**Migrations**: 3 arquivos SQL prontos para aplicação

---

## 🔗 Link Rápido

Abra o SQL Editor do Supabase:
[https://app.supabase.com/project/vcqgalxnapxerqcycieu/sql/new](https://app.supabase.com/project/vcqgalxnapxerqcycieu/sql/new)

---

## 📋 Migrations a Aplicar

### 1️⃣ Migration 1: Full-Text Search (FTS)
**Arquivo**: `supabase/migrations/20260127_001_add_fulltext_search.sql`

**O que faz**:
- ✅ Adiciona coluna `search_vector` (tsvector) na tabela `bible_studies`
- ✅ Cria índice GIN para buscas rápidas
- ✅ Cria RPC function `bible_search_studies()` para buscar estudos por texto
- ✅ Trigger para atualizar search_vector automaticamente

**Passos**:
1. Copie todo o conteúdo de `20260127_001_add_fulltext_search.sql`
2. Cole no SQL Editor do Supabase
3. Clique "Run"
4. Confirme: ✅ "Success"

**Tempo estimado**: 5-10 segundos

---

### 2️⃣ Migration 2: Soft Delete
**Arquivo**: `supabase/migrations/20260127_002_add_soft_delete.sql`

**O que faz**:
- ✅ Adiciona coluna `deleted_at` (TIMESTAMPTZ) em `bible_studies` e `bible_tags`
- ✅ Cria índices parciais para queries rápidas
- ✅ Cria 3 RPC functions:
  - `bible_soft_delete_study()` - marca estudo como deletado
  - `bible_restore_study()` - restaura estudo deletado
  - `bible_get_deleted_studies()` - lista estudos deletados

**Passos**:
1. Copie todo o conteúdo de `20260127_002_add_soft_delete.sql`
2. Cole no SQL Editor
3. Clique "Run"
4. Confirme: ✅ "Success"

**Tempo estimado**: 5-10 segundos

---

### 3️⃣ Migration 3: Link Validation Trigger
**Arquivo**: `supabase/migrations/20260127_003_add_link_validation_trigger.sql`

**O que faz**:
- ✅ Cria function `bible_validate_link_ownership()`
- ✅ Valida que ambos estudos em um link pertencem ao mesmo user
- ✅ Previne links entre estudos de usuários diferentes
- ✅ Cria 2 triggers: BEFORE INSERT e BEFORE UPDATE
- ✅ Cria índice compound para performance

**Passos**:
1. Copie todo o conteúdo de `20260127_003_add_link_validation_trigger.sql`
2. Cole no SQL Editor
3. Clique "Run"
4. Confirme: ✅ "Success"

**Tempo estimado**: 5-10 segundos

---

## ⚠️ IMPORTANTE: Atualizar RLS Policies

**CRÍTICO**: Após aplicar a Migration 2, você DEVE atualizar as RLS policies manualmente.

### O Problema
A migration cria a coluna `deleted_at`, mas as RLS policies não sabem filtrá-la automaticamente. Sem essa atualização, queries retornarão registros soft-deleted.

### A Solução
Abra: [https://app.supabase.com/project/vcqgalxnapxerqcycieu/auth/policies](https://app.supabase.com/project/vcqgalxnapxerqcycieu/auth/policies)

Para cada **SELECT policy** da tabela `bible_studies`:
1. Clique para editar
2. Adicione esta condição ao final:
   ```sql
   AND deleted_at IS NULL
   ```
3. Salve

**Exemplo** (Antes):
```sql
(auth.uid() = user_id)
```

**Exemplo** (Depois):
```sql
(auth.uid() = user_id) AND deleted_at IS NULL
```

---

## ✅ Checklist de Aplicação

- [ ] Migration 1 executada com sucesso
- [ ] Migration 2 executada com sucesso
- [ ] Migration 3 executada com sucesso
- [ ] RLS policies atualizadas (adicionar `AND deleted_at IS NULL`)
- [ ] Regenerar tipos TypeScript: `npm run generate:types`
- [ ] Testar localmente: `npm run dev`

---

## 🧪 Como Validar

Após aplicar, execute no SQL Editor do Supabase:

```sql
-- Validar Full-Text Search
SELECT COUNT(*) as count FROM pg_indexes WHERE indexname = 'idx_bible_studies_search';

-- Validar Soft Delete
SELECT column_name FROM information_schema.columns WHERE table_name = 'bible_studies' AND column_name = 'deleted_at';

-- Validar Link Trigger
SELECT COUNT(*) as count FROM pg_trigger WHERE tgname LIKE 'before_%bible_study%';
```

**Resultado esperado**: Tudo com `count > 0`

---

## 🔧 Se Algo Falhar

**Problema**: "relation "bible_studies" does not exist"
- **Solução**: A tabela precisa existir primeiro. Verifique se as migrations de Sprint 1 foram aplicadas.

**Problema**: "permission denied"
- **Solução**: Use SERVICE_ROLE_KEY ou admin account, não a chave anon.

**Problema**: "syntax error"
- **Solução**: Verifique se está usando a versão completa do arquivo SQL (não truncado).

---

## 📞 Suporte

Se encontrar erros, copie a mensagem de erro e abra uma issue ou execute este comando para gerar um relatório:

```bash
# Salvar log do SQL Editor
# Copie a mensagem de erro completa
# Execute: npm run debug:migrations
```

---

## 📊 Status Geral

| Migration | Status | Tempo |
|-----------|--------|-------|
| 20260127_001_add_fulltext_search.sql | ⏳ Aguardando | 5-10s |
| 20260127_002_add_soft_delete.sql | ⏳ Aguardando | 5-10s |
| 20260127_003_add_link_validation_trigger.sql | ⏳ Aguardando | 5-10s |
| RLS Policies Update | ⏳ Aguardando | 5-10s |
| **Total** | **⏳ ~30-40 segundos** | |

---

**Próximas ações após completar**:
1. ✅ Regenerar tipos TypeScript
2. ✅ Testar aplicação
3. ✅ Validar funcionalidades (FTS, Soft Delete, Link Validation)
4. ✅ Merge para main
5. ✅ Deploy para produção

---

*Última atualização: 2026-01-27 | Sprint 2 - Link Validation & Data Integrity*
