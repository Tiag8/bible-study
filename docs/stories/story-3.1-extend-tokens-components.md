# Story 3.1: Estender Design Tokens para Componentes Restantes

**Story ID:** STORY-3.1
**Epic:** EPIC-001 (Resolução de Débitos Técnicos)
**Sprint:** 3
**Pontos:** 5
**Status:** 🚀 IN PROGRESS (Dev initiated implementation)

---

## 📋 User Story

**Como** desenvolvedor,
**Quero** que todos os componentes usem design tokens centralizados,
**Para que** tenhamos consistência visual completa em toda a aplicação.

---

## 🎯 Objetivo

Estender o uso de design tokens criados em Story 2.3 para os componentes restantes (Editor, Sidebar, TopBar, BubbleMenu, SlashMenu, CreateTagModal, Backlog, etc.), atingindo 100% de cobertura em todo o codebase.

---

## ✅ Critérios de Aceite

### Cobertura de Componentes
- [ ] Editor components (Editor/index.tsx, BubbleMenu.tsx, SlashMenu.tsx)
- [ ] Dashboard components (Sidebar, TopBar, BacklogPanel)
- [ ] Modal components (CreateTagModal, StudySelectionModal)
- [ ] Page components (page.tsx, estudo/[id]/page.tsx, login/page.tsx)
- [ ] Ui components (badge, button, input, dialog, etc.)

### Qualidade
- [ ] Zero hardcoded Tailwind color classes em arquivo .tsx
- [ ] Todos os COLORS e TAG_COLORS importados e usados
- [ ] Build passa sem erros
- [ ] TypeScript sem erros
- [ ] ESLint sem novos avisos

### Documentação
- [ ] Arquivo `COMPONENT_TOKENS_MAPPING.md` criado com mapeamento
- [ ] Cada componente tem comentário /* TOKENS */ indicando uso

---

## 📝 Tasks

- [x] **3.1.1** Refatorar Editor components com tokens (IN PROGRESS - Editor components pending)
- [x] **3.1.2** Refatorar Dashboard components com tokens (2/7 DONE: Sidebar, TopBar)
- [ ] **3.1.3** Refatorar Modal components com tokens
- [ ] **3.1.4** Refatorar Page components com tokens
- [x] **3.1.5** Refatorar UI base components com tokens (5/5 DONE: button, badge, input, breadcrumbs, confirm-modal)
- [x] **3.1.6** Validar build e tipos (ONGOING: Build PASS ✅, Zero lint warnings ✅)
- [x] **3.1.7** Criar arquivo de mapeamento tokens (DONE: docs/COMPONENT_TOKENS_MAPPING.md)
- [ ] **3.1.8** Testar visual em desktop e mobile (PENDING)

---

## 📊 Métricas de Sucesso

| Métrica | Target |
|---------|--------|
| % componentes refatorados | 100% |
| Hardcoded colors | 0 |
| Build errors | 0 |
| TypeScript errors | 0 |
| New ESLint warnings | 0 |

---

## 🔗 Dependências

- ✅ Story 2.3 (Design Tokens) deve estar DONE
- Design tokens file (`src/lib/design-tokens.ts`) estável

---

## 📝 Dev Notes

**Componentes prioritários:**
1. Editor (alta visibilidade) - 2h
2. Sidebar + TopBar (dashboard) - 1.5h
3. Modal components - 1h
4. Remaining UI components - 1.5h

**Estratégia:**
- Usar find/replace para substituir padrões comuns
- Teste visual após cada grupo
- Manter compatibilidade com design atual

---

## 📋 Implementation Progress (2026-01-27)

**Started by:** @dev (Dex)
**Current Phase:** UI Components + Dashboard Foundation
**Build Status:** ✅ PASS
**Lint Status:** ✅ ZERO WARNINGS

### Completed Components (7/22+)
**UI Base (5/5):**
- ✅ button.tsx (refactored with COLORS.primary, COLORS.secondary, COLORS.neutral)
- ✅ badge.tsx (refactored with COLORS)
- ✅ input.tsx (refactored with COLORS.neutral)
- ✅ breadcrumbs.tsx (refactored with COLORS)
- ✅ confirm-modal.tsx (refactored with COLORS.danger)

**Dashboard (2/7):**
- ✅ Sidebar.tsx (refactored with COLORS.primary, COLORS.neutral, COLORS.danger)
- ✅ TopBar.tsx (refactored with COLORS, TAG_COLORS)

### Commits
- `be9d4e8` - fix: remover 5 variáveis não utilizadas (lint cleanup)
- `f6365ce` - refactor(ui): aplicar design tokens em componentes base
- `ca523d5` - refactor(dashboard): aplicar design tokens em Sidebar e TopBar

### Next Priority Components
1. **Editor Components** (3 components, 1095 lines total):
   - BubbleMenu.tsx (608 lines) - HIGH IMPACT
   - SlashMenu.tsx (357 lines)
   - Editor/index.tsx (130 lines)

2. **Modal Components** (2 components):
   - CreateTagModal.tsx
   - StudySelectionModal.tsx

3. **Remaining Dashboard** (5 components):
   - BacklogPanel.tsx
   - BookGrid.tsx
   - ChapterView.tsx
   - StudySelectionModal.tsx
   - BookCard.tsx (already has tokens from Sprint 2.3)

4. **Page Components** (3):
   - src/app/page.tsx
   - src/app/login/page.tsx
   - src/app/estudo/[id]/page.tsx

---

**Criado por:** @qa (Quinn) - Recomendação
**Data:** 2026-01-26
**Implementação iniciada:** 2026-01-27 por @dev (Dex)
**Status:** 🚀 IN PROGRESS
