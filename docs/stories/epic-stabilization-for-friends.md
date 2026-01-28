# Epic: Stabilization for Friends - Bible Study

**Epic ID:** EPIC-002
**Data:** 2026-01-27 (Updated: 2026-01-28)
**Context:** Personal tool + free sharing with friends
**Status:** 🎯 IN PLANNING (Story 4.3 added to Sprint 4)
**Priority:** P0 (Essential before friend sharing)

---

## 📋 Resumo

Completar EPIC-001 com foco em **confiabilidade, mobile UX e acessibilidade**. Objetivo: tornar o Bible Study seguro e agradável para compartilhar com amigos sem se preocupar com bugs ou UI quebrada.

---

## 🎯 Objetivo

Transformar Bible Study de um "MVP pessoal funcional" em uma "ferramenta confiável para compartilhar com amigos", com:
- ✅ Zero bugs visíveis em mobile
- ✅ WCAG AA accessibility compliance
- ✅ Feedback visual claro (salvando, erros, sucesso)
- ✅ Documentação básica para amigos

---

## 📊 Escopo

### Incluído
- 4 stories P1 restantes (débitos críticos)
- Mobile UX enhancements
- Accessibility fixes
- Reliability + feedback systems
- Basic user documentation

### Excluído
- New features not related to stabilization
- Performance micro-optimizations
- Enterprise-grade features
- Dark mode (Priority B - Phase 2)

---

## 📈 Métricas de Sucesso

| Métrica | Baseline | Target | Prazo |
|---------|----------|--------|-------|
| P1 Débitos | 4 | 0 | Sprint 3-4 |
| Mobile Usability | Partial | 100% | Sprint 3 |
| Accessibility Score | ~70 | >95 WCAG AA | Sprint 3 |
| Bug Reports (Testing) | TBD | 0 Critical | Sprint 4 |
| Friend Onboarding Time | N/A | <5min | Sprint 4 |

---

## 🗓️ Timeline

| Sprint | Semanas | Foco | Stories |
|--------|---------|------|---------|
| **Sprint 3 (Final)** | 5-6 | Mobile + Accessibility | 3.5 + Others |
| **Sprint 4** | 7-8 | Final polish + testing | Stabilization |

---

## 💰 Budget

| Item | Horas | Custo |
|------|-------|-------|
| Mobile UX (Story 3.5) | 3-5h | R$ 450 - R$ 750 |
| Accessibility improvements | 4-6h | R$ 600 - R$ 900 |
| Feedback systems (toasts) | 2-3h | R$ 300 - R$ 450 |
| Testing + bug fixes | 3-4h | R$ 450 - R$ 600 |
| **TOTAL** | **12-18h** | **R$ 1.800 - R$ 2.700** |

---

## 📝 Stories (Planned)

### Sprint 3: Core Stabilization (2-3 weeks)

| ID | Story | Pontos | Status | P1 Debt Map |
|----|-------|--------|--------|------------|
| 3.5 | Mobile UX Enhancements | 3 | 📋 Ready | FE-09 (BubbleMenu responsive) |
| 3.6 | Accessibility - WCAG AA | 3 | 📋 Ready | FE-01,02,03,04,06 (consolidated) |
| 3.7 | Feedback Systems (Toast/Modal) | 2 | 📋 Ready | FE-13 (Salvando toast) |
| 3.8 | Undo/Redo + Data Validation | 2 | 📋 Ready | FE-14, DB-01 |

**Total Sprint 3: 10 pontos**

### Sprint 4: Polish + Testing (2-3 weeks)

| ID | Story | Pontos | Status | Purpose |
|----|-------|--------|--------|---------|
| 4.1 | Friend Onboarding Guide | 2 | 📋 Ready | Help friends get started |
| 4.2 | Bug Bash + Testing | 3 | 📋 Ready | Catch final issues |
| 4.3 | Reference Links - UI/UX | 8 | 🎯 **NEW** | Manage study interconnections |

**Total Sprint 4: 13 pontos**

---

## 🎨 User Story Details (Summary)

### Story 3.5: Mobile UX Enhancements (3pts)
**Goal:** Make Bible Study feel native on mobile
- BubbleMenu responsive + repositioning
- Touch targets >= 44px
- Layout doesn't break on small screens
- Input fields don't get hidden by keyboard
**Acceptance Criteria:**
- [ ] BubbleMenu works on phone
- [ ] No horizontal scrolling
- [ ] Touch targets 44x44px minimum
- [ ] Tested on iPhone + Android

### Story 3.6: Accessibility - WCAG AA (3pts)
**Goal:** Make Bible Study usable for everyone
- Color + icon for status (not color-only)
- Keyboard navigation works
- Screen reader friendly labels
- Sufficient contrast ratios
**Acceptance Criteria:**
- [ ] WCAG AA score >95
- [ ] Tab navigation complete
- [ ] No color-only indicators
- [ ] Screen reader compatible

### Story 3.7: Feedback Systems (2pts)
**Goal:** Users always know what's happening
- "Salvando..." toast while editing
- Success/error feedback modal
- Confirmation before delete
**Acceptance Criteria:**
- [ ] Toast system implemented
- [ ] All async operations show feedback
- [ ] Modal confirms destructive actions

### Story 3.8: Undo/Redo + Validation (2pts)
**Goal:** Friends won't lose data accidentally
- Undo/redo in editor
- Content validation before save
- Error messages are clear
**Acceptance Criteria:**
- [ ] Undo/redo works in Tiptap
- [ ] Validation prevents invalid saves
- [ ] Error messages helpful

### Story 4.1: Friend Onboarding (2pts)
**Goal:** New users understand how to use
- Welcome screen
- Basic tutorial
- FAQ or help page
**Acceptance Criteria:**
- [ ] First-time user gets guidance
- [ ] Basic workflows documented
- [ ] Troubleshooting info available

### Story 4.2: Bug Bash + Testing (3pts)
**Goal:** Catch bugs before friends find them
- Comprehensive E2E testing
- Edge case testing
- Performance validation
**Acceptance Criteria:**
- [ ] All core workflows tested
- [ ] Edge cases handled
- [ ] No critical bugs found

### Story 4.3: Reference Links - UI/UX (8pts) ⭐ NEW
**Goal:** Let users build interconnected study networks
- View, add, remove, and reorder references between studies
- Sidebar panel showing all references to current study
- Search modal to add new references
- Drag-and-drop reordering
- Mobile responsive (drawer on tablet/mobile)
- Full accessibility (WCAG AA)
**Acceptance Criteria:**
- [ ] ReferencesSidebar component with reference list
- [ ] AddReferenceModal with searchable studies
- [ ] Delete reference with confirmation
- [ ] Drag-and-drop reordering functional
- [ ] Mobile responsive (3 breakpoints)
- [ ] WCAG AA accessibility compliant
- [ ] Lighthouse Performance > 80
- [ ] CodeRabbit security sign-off
**Why Important:** Enables knowledge graph visualization and deep interconnection of biblical concepts. Foundation for Phase 2 features (grafo, advanced search, connection analytics).

---

## 🚀 Success Criteria (Overall Epic)

- ✅ All 4 P1 débitos resolved
- ✅ Mobile UX is solid (no UI breaking on phones)
- ✅ Accessibility meets WCAG AA standards
- ✅ Users have clear feedback (toasts, modals)
- ✅ Data integrity guaranteed (validation + undo)
- ✅ Friends can self-onboard (<5min to first study)
- ✅ Zero critical bugs found in testing

---

## 📋 Quality Gates

Before considering Epic DONE:
- [ ] All stories marked complete
- [ ] Build: PASS
- [ ] Lint: PASS
- [ ] E2E tests: ALL PASS
- [ ] Lighthouse accessibility: >95
- [ ] Manual mobile testing: PASS
- [ ] QA approval: YES
- [ ] User testing (yourself + 1 friend): PASS

---

## 🎯 Out of Scope (Phase 2+)

- Dark mode (nice to have)
- Multiple studies UI enhancement
- Study links visualization
- Advanced search features
- Performance micro-optimizations

---

## 📌 Dependencies

- ✅ EPIC-001 (3 stories already done)
- ✅ Design tokens system (3.2, 3.4 done)
- ✅ Database foundation (2.1-2.4 done)

**No external blocking dependencies**

---

## 🔄 Success = Ready for Friends

When this epic is DONE:
✅ You use it comfortably
✅ You're not embarrassed to show to friends
✅ Bugs won't ruin their first impression
✅ They can figure it out without help
✅ It feels polished and reliable

---

**Created by:** Morgan (@pm)
**Date:** 2026-01-27
**Status:** Ready for Sprint 3-4 Planning
