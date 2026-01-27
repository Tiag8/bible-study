# Technical Debt Assessment - DRAFT

**Projeto:** Bible Study (Segundo Cérebro)
**Data:** 2026-01-26
**Status:** 📝 PARA REVISÃO DOS ESPECIALISTAS
**Versão:** DRAFT v1.0

---

## 📋 Executive Summary

| Métrica | Valor |
|---------|-------|
| **Total de Débitos** | 50 |
| **Críticos** | 10 |
| **Altos** | 11 |
| **Médios** | 19 |
| **Baixos** | 10 |
| **Esforço Total Estimado** | 120-180 horas |
| **Custo Estimado (R$150/h)** | R$ 18.000 - R$ 27.000 |

---

## 1️⃣ DÉBITOS DE SISTEMA (Arquitetura)

**Fonte:** `docs/architecture/system-architecture.md`
**Validado por:** @architect ✅

### Gaps Identificados

| ID | Débito | Severidade | Impacto | Esforço | Prioridade |
|----|--------|-----------|---------|---------|------------|
| SYS-01 | Múltiplos estudos por capítulo - UI incompleta | 🟠 ALTO | Core functionality parcial | 4-6h | P1 |
| SYS-02 | Links entre estudos - tabela existe, sem UI | 🟠 ALTO | Grafo desconectado | 3-4h | P1 |
| SYS-03 | Backlog - tabela existe, UI minimal | 🟡 MÉDIO | Feature incompleta | 4-6h | P2 |
| SYS-04 | Busca por texto - não implementada | 🟡 MÉDIO | UX limitada | 2-3h | P2 |
| SYS-05 | Sincronização realtime - ausente | 🟡 MÉDIO | Sem colabs | 4-6h | P3 |
| SYS-06 | Código duplicado getTagColor() | 🟢 BAIXO | Manutenibilidade | 1-2h | P2 |
| SYS-07 | Exportação (HTML/PDF/JSON) - não existe | 🟡 MÉDIO | Feature faltante | 6-8h | P3 |
| SYS-08 | Validação de input minimal | 🟡 MÉDIO | Segurança | 3-4h | P2 |
| SYS-09 | Rate limiting ausente | 🟢 BAIXO | Proteção abuse | 2-3h | P3 |
| SYS-10 | Tests E2E - Playwright instalado, sem testes | 🟢 BAIXO | Qualidade | 8-12h | P3 |

**Subtotal Sistema:** 10 débitos | ~37-54 horas

---

## 2️⃣ DÉBITOS DE DATABASE (Supabase)

**Fonte:** `supabase/docs/DB-AUDIT.md`
**⚠️ PENDENTE:** Revisão do @data-engineer

### Débitos Críticos

| ID | Débito | Severidade | Impacto | Esforço | Prioridade |
|----|--------|-----------|---------|---------|------------|
| DB-01 | Validação JSONB content ausente | 🔴 CRÍTICO | Dados corrompidos quebram editor | 2-3h | P0 |
| DB-02 | FK check faltando em study_links | 🔴 CRÍTICO | Violação RLS possível | 2-3h | P0 |
| DB-03 | Orphaned records em backlog (ON DELETE SET NULL) | 🔴 CRÍTICO | Integridade de dados | 1-2h | P0 |
| DB-04 | Status enum inconsistente DB vs TypeScript | 🔴 CRÍTICO | Bugs runtime | 1-2h | P0 |

### Débitos Altos

| ID | Débito | Severidade | Impacto | Esforço | Prioridade |
|----|--------|-----------|---------|---------|------------|
| DB-05 | Falta Full-Text Search index | 🟠 ALTO | Performance busca | 3-4h | P1 |
| DB-06 | View bible_graph_data pesada | 🟠 ALTO | Performance grafo | 1-2h | P1 |
| DB-07 | Sem soft delete | 🟠 ALTO | Perda permanente de dados | 4-5h | P1 |
| DB-08 | Sem audit trail (created_by, updated_by) | 🟠 ALTO | Compliance/debugging | 3-4h | P2 |

### Débitos Médios/Baixos

| ID | Débito | Severidade | Impacto | Esforço | Prioridade |
|----|--------|-----------|---------|---------|------------|
| DB-09 | Tags array sem validação | 🟡 MÉDIO | Integridade | 5-8h | P3 |
| DB-10 | Color em tags sem validação | 🟡 MÉDIO | Dados inválidos | 1-2h | P2 |
| DB-11 | Índice RLS performance | 🟡 MÉDIO | Performance | 0.5h | P2 |
| DB-12 | RLS policies redundantes | 🟡 MÉDIO | Manutenibilidade | 3-4h | P3 |
| DB-13 | Migration dependency não documentado | 🟡 MÉDIO | DevOps risk | 0.5h | P3 |
| DB-14 | Sem comentários em functions | 🟢 BAIXO | Documentação | 0.5h | P4 |
| DB-15 | Sem métricas de uso | 🟢 BAIXO | Observability | 2-3h | P4 |

**Subtotal Database:** 15 débitos | ~30-45 horas

### ❓ Perguntas para @data-engineer

1. **DB-01:** Qual schema de validação JSONB recomenda para Tiptap content?
2. **DB-02:** Melhor usar CHECK constraint ou trigger para garantir same user_id em links?
3. **DB-03:** Preferência: CASCADE delete ou soft delete para backlog?
4. **DB-07:** Implementar soft delete com `deleted_at` ou archive table separada?
5. **DB-09:** Vale refatorar tags array → tabela de junção? Qual o esforço real?

---

## 3️⃣ DÉBITOS DE FRONTEND/UX

**Fonte:** `docs/frontend/frontend-spec.md`
**⚠️ PENDENTE:** Revisão do @ux-design-expert

### Débitos Críticos

| ID | Débito | Severidade | Impacto | Esforço | Prioridade |
|----|--------|-----------|---------|---------|------------|
| FE-01 | `confirm()` nativo do browser | 🔴 CRÍTICO | UX inconsistente, mobile ruim | 2-3h | P0 |
| FE-02 | `alert()` nativo do browser | 🔴 CRÍTICO | Bloqueia UI, inconsistente | 2-3h | P0 |
| FE-03 | Delete button hover-only | 🔴 CRÍTICO | a11y fail, touch users blocked | 1-2h | P0 |
| FE-04 | Color-only status indication | 🔴 CRÍTICO | a11y fail (daltonismo) | 1-2h | P0 |
| FE-05 | Focus trap em modals (verificar) | 🔴 CRÍTICO | Keyboard nav broken | 1-2h | P0 |
| FE-06 | Touch targets < 44px | 🔴 CRÍTICO | WCAG violation | 1-2h | P0 |

### Débitos Altos

| ID | Débito | Severidade | Impacto | Esforço | Prioridade |
|----|--------|-----------|---------|---------|------------|
| FE-07 | ColorMap hardcoded em 3+ lugares | 🟠 ALTO | Manutenibilidade | 2-3h | P1 |
| FE-08 | Sem design tokens centralizados | 🟠 ALTO | Inconsistência visual | 2-3h | P1 |
| FE-09 | BubbleMenu não responsive mobile | 🟠 ALTO | Mobile UX quebrada | 1-2h | P1 |
| FE-10 | aria-label faltando em ícones | 🟠 ALTO | a11y parcial | 1-2h | P1 |

### Débitos Médios

| ID | Débito | Severidade | Impacto | Esforço | Prioridade |
|----|--------|-----------|---------|---------|------------|
| FE-11 | getTagColor() duplicada 3x | 🟡 MÉDIO | DRY violation | 1-2h | P2 |
| FE-12 | TODO: backlog integration incompleta | 🟡 MÉDIO | Feature broken | 2-3h | P2 |
| FE-13 | Sem feedback visual "salvando" | 🟡 MÉDIO | UX confusa | 1-2h | P2 |
| FE-14 | Sem undo/redo verificar | 🟡 MÉDIO | Perda de dados | 1-2h | P2 |
| FE-15 | Sem Find in editor (Ctrl+F) | 🟡 MÉDIO | UX limitada | 2-3h | P2 |
| FE-16 | Dropdown de tags modal inconsistente | 🟡 MÉDIO | Design inconsistência | 1-2h | P2 |
| FE-17 | Contrast ratio inadequado | 🟡 MÉDIO | a11y fail | 1-2h | P2 |
| FE-18 | Responsividade inconsistente | 🟡 MÉDIO | Mobile parcial | 2-3h | P2 |
| FE-19 | Status select code duplicado | 🟡 MÉDIO | DRY violation | 1-2h | P2 |
| FE-20 | Tag select code duplicado | 🟡 MÉDIO | DRY violation | 1-2h | P2 |

### Débitos Baixos

| ID | Débito | Severidade | Impacto | Esforço | Prioridade |
|----|--------|-----------|---------|---------|------------|
| FE-21 | Sem dark mode (parcial) | 🟢 BAIXO | Nice-to-have | 4-6h | P4 |
| FE-22 | Sem skip link a11y | 🟢 BAIXO | a11y minor | 0.5h | P3 |
| FE-23 | Sem keyboard shortcuts docs | 🟢 BAIXO | Discoverability | 1-2h | P3 |
| FE-24 | ESLint warnings (any types) | 🟢 BAIXO | Type safety | 1-2h | P3 |
| FE-25 | Unused CSS classes | 🟢 BAIXO | Cleanup | 0.5h | P4 |

**Subtotal Frontend:** 25 débitos | ~35-55 horas

### ❓ Perguntas para @ux-design-expert

1. **FE-01/02:** Qual design de modal usar? Radix Dialog ou custom?
2. **FE-03:** Delete button: always visible ou context menu (right-click)?
3. **FE-04:** Quais ícones sugerir para status? (estudando=●, revisando=◆, concluído=✓)?
4. **FE-08:** Criar design tokens do zero ou usar convenção existente?
5. **FE-21:** Dark mode é prioridade? Ou manter tema único?

---

## 4️⃣ MATRIZ DE PRIORIZAÇÃO PRELIMINAR

### 🔴 P0 - CRÍTICOS (Deploy Blockers)

| ID | Débito | Área | Esforço |
|----|--------|------|---------|
| DB-01 | Validação JSONB content | Database | 2-3h |
| DB-02 | FK check em study_links | Database | 2-3h |
| DB-03 | Orphaned records backlog | Database | 1-2h |
| DB-04 | Status enum inconsistente | Database | 1-2h |
| FE-01 | confirm() nativo | Frontend | 2-3h |
| FE-02 | alert() nativo | Frontend | 2-3h |
| FE-03 | Delete button hover-only | Frontend | 1-2h |
| FE-04 | Color-only status | Frontend | 1-2h |
| FE-05 | Focus trap modals | Frontend | 1-2h |
| FE-06 | Touch targets < 44px | Frontend | 1-2h |

**Total P0:** 10 débitos | ~16-24 horas | **R$ 2.400 - R$ 3.600**

### 🟠 P1 - ALTOS (Próxima Sprint)

| ID | Débito | Área | Esforço |
|----|--------|------|---------|
| SYS-01 | Múltiplos estudos UI | Sistema | 4-6h |
| SYS-02 | Links entre estudos UI | Sistema | 3-4h |
| DB-05 | Full-Text Search | Database | 3-4h |
| DB-06 | View grafo pesada | Database | 1-2h |
| DB-07 | Soft delete | Database | 4-5h |
| FE-07 | ColorMap hardcoded | Frontend | 2-3h |
| FE-08 | Design tokens | Frontend | 2-3h |
| FE-09 | BubbleMenu mobile | Frontend | 1-2h |
| FE-10 | aria-labels ícones | Frontend | 1-2h |

**Total P1:** 9 débitos | ~22-31 horas | **R$ 3.300 - R$ 4.650**

### 🟡 P2 - MÉDIOS (2-4 Sprints)

**Total P2:** 19 débitos | ~30-45 horas | **R$ 4.500 - R$ 6.750**

### 🟢 P3/P4 - BAIXOS (Backlog)

**Total P3/P4:** 12 débitos | ~20-30 horas | **R$ 3.000 - R$ 4.500**

---

## 5️⃣ DEPENDÊNCIAS ENTRE DÉBITOS

```
DB-04 (enum) ──────────────────────────┐
                                       │
FE-04 (color status) ──> FE-07 (colormap) ──> FE-08 (design tokens)
                                       │
FE-11 (getTagColor) ───────────────────┘

DB-01 (JSONB validation) ──> FE-14 (undo/redo)

DB-07 (soft delete) ──> SYS-03 (backlog full)

SYS-02 (links UI) ──> Grafo funcional completo
```

---

## 6️⃣ RISCOS IDENTIFICADOS

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Dados corrompidos (DB-01) | ALTA | CRÍTICO | Implementar validação JSONB ASAP |
| Violação RLS (DB-02) | MÉDIA | CRÍTICO | Adicionar constraint check |
| Mobile UX quebrada (FE-09) | ALTA | ALTO | Testar em viewports < 640px |
| a11y lawsuit risk (FE-04, FE-06) | BAIXA | ALTO | Compliance WCAG AA |
| Performance degradada (DB-05) | MÉDIA | MÉDIO | FTS antes de 1000+ estudos |

---

## 7️⃣ PRÓXIMOS PASSOS

### Para @data-engineer (FASE 5)
- [ ] Revisar seção 2 (Database)
- [ ] Responder 5 perguntas técnicas
- [ ] Validar/ajustar severidades
- [ ] Adicionar débitos não identificados
- [ ] Estimar horas com precisão

### Para @ux-design-expert (FASE 6)
- [ ] Revisar seção 3 (Frontend/UX)
- [ ] Responder 5 perguntas de design
- [ ] Validar/ajustar severidades
- [ ] Adicionar débitos não identificados
- [ ] Sugerir soluções de design

### Para @qa (FASE 7)
- [ ] Revisar assessment completo
- [ ] Identificar gaps não cobertos
- [ ] Avaliar riscos cruzados
- [ ] Sugerir testes de validação
- [ ] Dar parecer: APPROVED / NEEDS WORK

---

## 📎 ANEXOS

- `docs/architecture/system-architecture.md` - Análise de sistema
- `supabase/docs/SCHEMA.md` - Schema documentado
- `supabase/docs/DB-AUDIT.md` - Auditoria database
- `docs/frontend/frontend-spec.md` - Auditoria frontend/UX

---

**Data de Criação:** 2026-01-26
**Criado por:** @architect (Aria)
**Status:** DRAFT - Aguardando revisão de especialistas
**Próxima Atualização:** Após FASES 5-7
