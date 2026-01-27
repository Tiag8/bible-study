# Technical Debt Assessment - FINAL

**Projeto:** Bible Study (Segundo Cérebro)
**Data:** 2026-01-26
**Versão:** 1.0 FINAL
**Status:** ✅ APROVADO POR TODOS OS ESPECIALISTAS

---

## 📋 Executive Summary

| Métrica | Valor |
|---------|-------|
| **Total de Débitos** | 63 |
| **Críticos (P0)** | 10 |
| **Altos (P1)** | 12 |
| **Médios (P2)** | 23 |
| **Baixos (P3/P4)** | 18 |
| **Esforço Total Estimado** | 104-139 horas |
| **Custo Estimado (R$150/h)** | R$ 15.600 - R$ 20.850 |
| **Timeline Recomendado** | 4-6 sprints (8-12 semanas) |

---

## 1️⃣ INVENTÁRIO COMPLETO DE DÉBITOS

### 🔴 CRÍTICOS (P0) - Deploy Blockers

**Database** (validado por @data-engineer)

| ID | Débito | Horas | Owner |
|----|--------|-------|-------|
| DB-01 | Validação JSONB content ausente | 2-3h | Backend |
| DB-03 | Orphaned records em backlog (CASCADE) | 1h | Backend |
| DB-04 | Status enum inconsistente DB/TypeScript | 1h | Backend |

**Frontend** (validado por @ux-design-expert)

| ID | Débito | Horas | Owner |
|----|--------|-------|-------|
| FE-01 | `confirm()` nativo → ConfirmModal | 3h | Frontend |
| FE-02 | `alert()` nativo → Toast system | 2h | Frontend |
| FE-03 | Delete button hover-only (a11y) | 2h | Frontend |
| FE-04 | Color-only status indication (a11y) | 1h | Frontend |
| FE-06 | Touch targets < 44px (WCAG) | 2h | Frontend |
| FE-09 | BubbleMenu não responsive mobile | 2h | Frontend |

**Subtotal P0:** 10 débitos | **16-20 horas** | **R$ 2.400 - R$ 3.000**

---

### 🟠 ALTOS (P1) - Próxima Sprint

**Sistema** (validado por @architect)

| ID | Débito | Horas | Owner |
|----|--------|-------|-------|
| SYS-01 | Múltiplos estudos por capítulo - UI | 4-6h | Frontend |
| SYS-02 | Links entre estudos - UI | 3-4h | Frontend |

**Database** (validado por @data-engineer)

| ID | Débito | Horas | Owner |
|----|--------|-------|-------|
| DB-02 | FK check em study_links (trigger) | 2-3h | Backend |
| DB-05 | Full-Text Search index | 3-4h | Backend |
| DB-07 | Soft delete com deleted_at | 4-5h | Backend |

**Frontend** (validado por @ux-design-expert)

| ID | Débito | Horas | Owner |
|----|--------|-------|-------|
| FE-07 | ColorMap hardcoded → centralizar | 2-3h | Frontend |
| FE-08 | Design tokens centralizados | 2-3h | Frontend |
| FE-13 | Feedback visual "Salvando..." toast | 1h | Frontend |
| FE-14 | Verificar undo/redo no Tiptap | 2h | Frontend |

**QA** (adicionado por @qa)

| ID | Débito | Horas | Owner |
|----|--------|-------|-------|
| QA-01 | Testes E2E para fluxos críticos | 8-12h | QA |

**Subtotal P1:** 12 débitos | **28-36 horas** | **R$ 4.200 - R$ 5.400**

---

### 🟡 MÉDIOS (P2) - 2-4 Sprints

| ID | Débito | Área | Horas |
|----|--------|------|-------|
| SYS-03 | Backlog - UI completa | Sistema | 4-6h |
| SYS-04 | Busca por texto | Sistema | 2-3h |
| SYS-08 | Validação de input (Zod) | Sistema | 3-4h |
| DB-06 | View grafo pesada | Database | 1-2h |
| DB-08 | Audit trail (created_by, updated_by) | Database | 3-4h |
| DB-17 | Connection pooling (escala) | Database | 2h |
| FE-10 | aria-labels em ícones | Frontend | 1-2h |
| FE-11 | getTagColor() duplicada | Frontend | 1-2h |
| FE-12 | TODO backlog integration | Frontend | 2-3h |
| FE-15 | Find in editor (Ctrl+F) | Frontend | 2-3h |
| FE-17 | Contrast ratio WCAG | Frontend | 1-2h |
| FE-18 | Responsividade inconsistente | Frontend | 2-3h |
| FE-26 | Onboarding/tutorial | Frontend | 4h |
| FE-28 | Skeleton loading | Frontend | 2h |
| QA-02 | Testes unitários hooks | QA | 6-8h |
| QA-03 | CI pipeline (GitHub Actions) | DevOps | 2-3h |
| QA-05 | Rate limiting API | Security | 2-3h |

**Subtotal P2:** 23 débitos | **35-48 horas** | **R$ 5.250 - R$ 7.200**

---

### 🟢 BAIXOS (P3/P4) - Backlog

| ID | Débito | Área | Horas |
|----|--------|------|-------|
| SYS-05 | Sincronização realtime | Sistema | 4-6h |
| SYS-06 | Extrair getTagColor utility | Sistema | 1-2h |
| SYS-07 | Exportação HTML/PDF/JSON | Sistema | 6-8h |
| SYS-09 | Rate limiting (redundante com QA-05) | Sistema | - |
| SYS-10 | Tests E2E (redundante com QA-01) | Sistema | - |
| DB-09 | Tags array → tabela junção | Database | 6-8h |
| DB-10 | Color validation em tags | Database | 1h |
| DB-11 | Índice RLS performance | Database | 0.5h |
| DB-12 | RLS policies redundantes | Database | 3-4h |
| DB-13 | Migration dependency docs | Database | 0.5h |
| DB-14 | Comentários em functions | Database | 0.5h |
| DB-15 | Métricas de uso | Database | 2-3h |
| DB-16 | VACUUM/ANALYZE config | Database | 1h |
| FE-16 | Dropdown inconsistente | Frontend | 1-2h |
| FE-19 | Status select duplicado | Frontend | 1-2h |
| FE-20 | Tag select duplicado | Frontend | 1-2h |
| FE-21 | Dark mode | Frontend | 5h |
| FE-22 | Skip link a11y | Frontend | 0.5h |
| FE-23 | Keyboard shortcuts docs | Frontend | 1-2h |
| FE-24 | ESLint warnings (any) | Frontend | 1-2h |
| FE-25 | Unused CSS classes | Frontend | 0.5h |
| FE-27 | Página 404/500 customizada | Frontend | 2h |
| QA-04 | Health check endpoint | DevOps | 1h |

**Subtotal P3/P4:** 18 débitos | **25-35 horas** | **R$ 3.750 - R$ 5.250**

---

## 2️⃣ MATRIZ DE PRIORIZAÇÃO FINAL

```
                    IMPACTO
              Baixo    Médio    Alto    Crítico
         ┌─────────┬─────────┬─────────┬─────────┐
         │ FE-21   │ DB-08   │ SYS-01  │ DB-01   │
   Alta  │ FE-22   │ FE-26   │ SYS-02  │ FE-01   │
         │ FE-23   │ FE-28   │ QA-01   │ FE-09   │
URGÊNCIA ├─────────┼─────────┼─────────┼─────────┤
         │ DB-14   │ SYS-03  │ DB-05   │ DB-03   │
   Média │ DB-16   │ SYS-04  │ DB-07   │ FE-02   │
         │ FE-24   │ QA-03   │ FE-07   │ FE-03   │
         ├─────────┼─────────┼─────────┼─────────┤
         │ DB-11   │ DB-09   │ DB-02   │ FE-04   │
   Baixa │ DB-13   │ SYS-07  │ FE-14   │ FE-06   │
         │ FE-25   │ FE-15   │ FE-13   │ DB-04   │
         └─────────┴─────────┴─────────┴─────────┘
```

---

## 3️⃣ PLANO DE RESOLUÇÃO

### Sprint 1: CRÍTICOS (Semanas 1-2)

**Objetivo:** Tornar o app production-ready do ponto de vista de estabilidade e a11y

| Dia | Débitos | Horas | Foco |
|-----|---------|-------|------|
| 1-2 | DB-03, DB-04 | 2h | Quick wins database |
| 3-4 | DB-01 | 3h | Validação JSONB |
| 5-6 | FE-01, FE-02 | 5h | Modal + Toast system |
| 7-8 | FE-03, FE-04 | 3h | Acessibilidade |
| 9-10 | FE-06, FE-09 | 4h | Mobile + touch |

**Entregáveis:**
- [ ] Database com validação de integridade
- [ ] Sistema de modais customizadas
- [ ] Sistema de toasts para feedback
- [ ] Acessibilidade básica (a11y score > 90)
- [ ] Mobile UX funcional

### Sprint 2: ALTOS - Parte 1 (Semanas 3-4)

**Objetivo:** Features críticas e foundation

| Dia | Débitos | Horas | Foco |
|-----|---------|-------|------|
| 1-3 | DB-05 | 4h | Full-Text Search |
| 4-6 | DB-07 | 5h | Soft delete |
| 7-8 | DB-02 | 3h | Trigger validação |
| 9-10 | FE-07, FE-08 | 5h | Design tokens |

**Entregáveis:**
- [ ] Busca funcional no app
- [ ] Recovery de dados deletados
- [ ] Integridade de links garantida
- [ ] Design system centralizado

### Sprint 3: ALTOS - Parte 2 (Semanas 5-6)

**Objetivo:** Features de produto e qualidade

| Dia | Débitos | Horas | Foco |
|-----|---------|-------|------|
| 1-3 | SYS-01 | 5h | Múltiplos estudos UI |
| 4-6 | SYS-02 | 4h | Links entre estudos |
| 7-8 | FE-13, FE-14 | 3h | Feedback + undo |
| 9-10 | QA-01 (parcial) | 4h | Testes E2E básicos |

**Entregáveis:**
- [ ] Múltiplos estudos por capítulo funcional
- [ ] Links entre estudos na UI
- [ ] Feedback visual completo
- [ ] 3+ testes E2E passando

### Sprints 4-6: MÉDIOS + BAIXOS (Semanas 7-12)

**Objetivo:** Polish, optimizations, tech debt cleanup

- P2 débitos por ordem de ROI
- CI/CD pipeline
- Testes adicionais
- Performance optimizations

---

## 4️⃣ RISCOS E MITIGAÇÕES

| Risco | Prob. | Impacto | Mitigação | Owner |
|-------|-------|---------|-----------|-------|
| Dados corrompidos sem recovery | ALTA | CRÍTICO | Sprint 1: DB-01, DB-07 | @data-engineer |
| Mobile UX quebrada | ALTA | ALTO | Sprint 1: FE-09, FE-06 | @ux-design-expert |
| a11y compliance fail | MÉDIA | ALTO | Sprint 1: FE-03, FE-04, FE-06 | @ux-design-expert |
| Performance degradada | MÉDIA | MÉDIO | Sprint 2: DB-05, DB-06 | @data-engineer |
| RLS bypass | BAIXA | CRÍTICO | Sprint 2: DB-02 | @data-engineer |
| Regression bugs | MÉDIA | MÉDIO | Sprint 3: QA-01 | @qa |

---

## 5️⃣ CRITÉRIOS DE SUCESSO

### Definition of Done - Sprint 1 (P0)

- [ ] Zero `confirm()` ou `alert()` no codebase
- [ ] Lighthouse Accessibility > 90
- [ ] Touch targets >= 44px em todos os botões
- [ ] BubbleMenu funciona em viewport 375px
- [ ] Status tem ícone + cor + texto
- [ ] Constraint JSONB aplicada no banco
- [ ] CASCADE delete funcionando em backlog

### Definition of Done - Sprint 2 (P1 Parte 1)

- [ ] Busca por texto funciona com FTS
- [ ] Soft delete implementado com `deleted_at`
- [ ] Trigger de validação em study_links ativo
- [ ] Design tokens em `src/lib/design-tokens.ts`
- [ ] ColorMap removido de componentes individuais

### Definition of Done - Sprint 3 (P1 Parte 2)

- [ ] Múltiplos estudos por capítulo na UI
- [ ] Links entre estudos podem ser criados
- [ ] Toast "Salvando..." aparece ao salvar
- [ ] Undo/redo funciona no editor
- [ ] 3+ testes E2E passando no CI

### Métricas de Qualidade Target

| Métrica | Atual | Target | Prazo |
|---------|-------|--------|-------|
| Lighthouse Performance | ? | > 90 | Sprint 3 |
| Lighthouse Accessibility | ? | > 95 | Sprint 1 |
| Bundle Size (first load) | ? | < 500KB | Sprint 2 |
| Test Coverage | 0% | > 30% | Sprint 3 |
| Débitos Críticos | 10 | 0 | Sprint 1 |
| Débitos Altos | 12 | 0 | Sprint 3 |

---

## 6️⃣ PRÓXIMOS PASSOS

1. **FASE 9:** Criar Relatório Executivo para stakeholders
2. **FASE 10:** Criar Epic + Stories para desenvolvimento
3. **Sprint Planning:** Alocar time para Sprint 1
4. **Execução:** Começar pelos P0 críticos

---

## 📎 ANEXOS

### Documentos de Referência

- `docs/architecture/system-architecture.md` - Análise de sistema
- `supabase/docs/SCHEMA.md` - Schema documentado
- `supabase/docs/DB-AUDIT.md` - Auditoria database
- `docs/frontend/frontend-spec.md` - Auditoria frontend/UX
- `docs/prd/technical-debt-DRAFT.md` - DRAFT original

### Reviews de Especialistas

- `docs/reviews/db-specialist-review.md` - @data-engineer ✅
- `docs/reviews/ux-specialist-review.md` - @ux-design-expert ✅
- `docs/reviews/qa-review.md` - @qa ✅

---

**Aprovações:**

| Especialista | Status | Data |
|--------------|--------|------|
| @architect | ✅ Aprovado | 2026-01-26 |
| @data-engineer | ✅ Aprovado | 2026-01-26 |
| @ux-design-expert | ✅ Aprovado (com condições) | 2026-01-26 |
| @qa | ✅ Aprovado | 2026-01-26 |

---

**Data de Criação:** 2026-01-26
**Versão:** 1.0 FINAL
**Status:** ✅ PRONTO PARA EXECUÇÃO
