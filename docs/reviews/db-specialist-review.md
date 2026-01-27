# Database Specialist Review

**Projeto:** Bible Study
**Data:** 2026-01-26
**Revisor:** @data-engineer
**Documento Base:** `docs/prd/technical-debt-DRAFT.md`

---

## 📋 Gate Status: ✅ APPROVED (com ressalvas)

O assessment de database está **bem fundamentado** e identifica corretamente os principais débitos. Algumas severidades foram ajustadas e 2 débitos adicionais identificados.

---

## 1️⃣ DÉBITOS VALIDADOS

| ID | Débito | Severidade Original | Severidade Ajustada | Horas | Notas |
|----|--------|---------------------|---------------------|-------|-------|
| DB-01 | Validação JSONB content | 🔴 CRÍTICO | 🔴 CRÍTICO ✓ | 2-3h | Correto. Prioridade máxima. |
| DB-02 | FK check em study_links | 🔴 CRÍTICO | 🟠 ALTO ↓ | 2-3h | RLS já previne parcialmente. Risco menor que indicado. |
| DB-03 | Orphaned records backlog | 🔴 CRÍTICO | 🔴 CRÍTICO ✓ | 1h | Correto. Fix simples: mudar ON DELETE. |
| DB-04 | Status enum inconsistente | 🔴 CRÍTICO | 🟠 ALTO ↓ | 1h | Verificar se TypeScript realmente está errado antes de classificar como crítico. |
| DB-05 | Full-Text Search | 🟠 ALTO | 🟠 ALTO ✓ | 3-4h | Correto. Essencial para UX de busca. |
| DB-06 | View grafo pesada | 🟠 ALTO | 🟡 MÉDIO ↓ | 1h | View já não seleciona content. Verificar queries reais. |
| DB-07 | Soft delete | 🟠 ALTO | 🟠 ALTO ✓ | 4-5h | Correto. Importante para UX e compliance. |
| DB-08 | Audit trail | 🟠 ALTO | 🟡 MÉDIO ↓ | 3-4h | Nice-to-have. Não é blocker. |
| DB-09 | Tags array sem validação | 🟡 MÉDIO | 🟡 MÉDIO ✓ | 6-8h | Refactor grande. Deixar para P3. |
| DB-10 | Color validation | 🟡 MÉDIO | 🟢 BAIXO ↓ | 1h | Frontend já valida. Low risk. |
| DB-11 | Índice RLS | 🟡 MÉDIO | 🟢 BAIXO ↓ | 0.5h | Índices já existem. Otimização marginal. |
| DB-12 | RLS policies redundantes | 🟡 MÉDIO | 🟢 BAIXO ↓ | 3-4h | Funciona. Refactor cosmético. |
| DB-13 | Migration dependency | 🟡 MÉDIO | 🟢 BAIXO ↓ | 0.5h | Documentação apenas. |
| DB-14 | Comentários functions | 🟢 BAIXO | 🟢 BAIXO ✓ | 0.5h | OK |
| DB-15 | Métricas de uso | 🟢 BAIXO | 🟢 BAIXO ✓ | 2-3h | Future feature |

**Resumo de Ajustes:**
- 4 débitos **rebaixados** de severidade (DB-02, DB-04, DB-06, DB-08, DB-10, DB-11, DB-12, DB-13)
- 0 débitos **elevados**
- Assessment **conservador** (bom para segurança)

---

## 2️⃣ DÉBITOS ADICIONADOS

| ID | Débito | Severidade | Horas | Descrição |
|----|--------|-----------|-------|-----------|
| **DB-16** | Falta de VACUUM/ANALYZE automático | 🟢 BAIXO | 1h | Supabase faz automaticamente, mas verificar configuração |
| **DB-17** | Sem connection pooling explícito | 🟡 MÉDIO | 2h | Para escala futura (100+ usuários simultâneos), considerar PgBouncer ou Supabase pooler |

---

## 3️⃣ RESPOSTAS AO ARCHITECT

### Pergunta 1: Schema de validação JSONB para Tiptap

**Recomendação:** Validação básica é suficiente:

```sql
ALTER TABLE bible_studies
ADD CONSTRAINT check_content_structure CHECK (
  content IS NULL OR
  content = '{}'::jsonb OR
  (jsonb_typeof(content) = 'object' AND content ? 'type')
);
```

**Razão:** Validação complexa no banco é lenta. Melhor validar no frontend e aceitar estrutura básica no DB.

### Pergunta 2: CHECK constraint vs trigger para study_links

**Recomendação:** **Trigger** é mais robusto:

```sql
CREATE OR REPLACE FUNCTION check_study_links_same_user()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM bible_studies
    WHERE id = NEW.source_study_id AND user_id = NEW.user_id
  ) OR NOT EXISTS (
    SELECT 1 FROM bible_studies
    WHERE id = NEW.target_study_id AND user_id = NEW.user_id
  ) THEN
    RAISE EXCEPTION 'Links must reference studies owned by same user';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_study_links_ownership
BEFORE INSERT OR UPDATE ON bible_study_links
FOR EACH ROW EXECUTE FUNCTION check_study_links_same_user();
```

**Razão:** CHECK constraints não podem fazer subqueries. Trigger é a única opção para validação cross-table.

### Pergunta 3: CASCADE vs soft delete para backlog

**Recomendação:** **CASCADE delete** para backlog:

```sql
ALTER TABLE bible_backlog
DROP CONSTRAINT IF EXISTS bible_backlog_source_study_id_fkey,
ADD CONSTRAINT bible_backlog_source_study_id_fkey
  FOREIGN KEY (source_study_id) REFERENCES bible_studies(id)
  ON DELETE CASCADE;
```

**Razão:** Backlog items sem estudo de origem perdem contexto. Melhor deletar junto.

### Pergunta 4: Soft delete com deleted_at vs archive table

**Recomendação:** **deleted_at column** (mais simples):

```sql
-- 1. Adicionar coluna
ALTER TABLE bible_studies ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Atualizar RLS para ignorar deletados
DROP POLICY IF EXISTS "Users can see own studies" ON bible_studies;
CREATE POLICY "Users can see own non-deleted studies"
ON bible_studies FOR SELECT
USING (auth.uid() = user_id AND deleted_at IS NULL);

-- 3. View para "lixeira" (opcional)
CREATE VIEW bible_studies_trash AS
SELECT * FROM bible_studies WHERE deleted_at IS NOT NULL;
```

**Razão:** Archive table adiciona complexidade (joins, sync). deleted_at é padrão da indústria.

### Pergunta 5: Refatorar tags array → tabela de junção

**Recomendação:** **NÃO refatorar agora.** Deixar para P3/P4.

**Razão:**
- Esforço alto (6-8h de refactor + testes)
- Array funciona para escala atual (< 100 tags por usuário)
- GIN index em arrays é performante
- Refatorar quando houver necessidade real (filtros complexos, analytics de tags)

---

## 4️⃣ RECOMENDAÇÕES DE ORDEM DE RESOLUÇÃO

### Sprint 1 (P0 - Críticos)
1. **DB-03** - Mudar backlog FK para CASCADE (1h) ← Mais fácil, quick win
2. **DB-01** - Adicionar validação JSONB básica (2h)
3. **DB-04** - Verificar e sincronizar enum TypeScript (1h)

### Sprint 2 (P1 - Altos)
4. **DB-05** - Implementar Full-Text Search (3-4h)
5. **DB-07** - Implementar soft delete (4-5h)
6. **DB-02** - Adicionar trigger de validação em links (2h)

### Backlog (P2+)
7. DB-08 - Audit trail
8. DB-09 - Refatorar tags (se necessário)
9. DB-17 - Connection pooling (escala)

---

## 5️⃣ ESTIMATIVAS REVISADAS

| Prioridade | Débitos | Horas Originais | Horas Revisadas |
|------------|---------|-----------------|-----------------|
| P0 (Críticos) | 3 → 2 | 6-8h | 3-4h |
| P1 (Altos) | 4 → 4 | 11-15h | 10-13h |
| P2 (Médios) | 3 → 2 | 6-8h | 5-7h |
| P3/P4 (Baixos) | 5 → 9 | 7-10h | 10-14h |
| **TOTAL** | 15 → 17 | 30-41h | **28-38h** |

**Economia estimada:** 2-3 horas (ajuste de severidades)

---

## 6️⃣ PARECER FINAL

### ✅ APPROVED

O assessment de database está **correto e bem fundamentado**. As principais descobertas são válidas:

1. **Validação JSONB** é realmente crítica
2. **Orphaned records** precisa fix imediato
3. **Soft delete** é importante para UX

**Ressalvas:**
- Algumas severidades eram conservadoras (ajustadas)
- 2 débitos adicionais identificados (menor importância)
- Esforço total ligeiramente menor que estimado

**Pronto para prosseguir para FASE 7 (QA Review).**

---

**Data:** 2026-01-26
**Revisor:** @data-engineer Agent
**Próxima Revisão:** Pós-implementação de P0/P1
