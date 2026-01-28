# Story 4.3: Referências de Estudos - UI/UX

**Story ID:** 4.3
**Epic:** EPIC-002 (Stabilization for Friends)
**Points:** 8
**Status:** 🚀 In Progress
**Priority:** P0 (Polish & Testing)
**Sprint:** Sprint 4 (Polish + Testing)
**Last Updated:** 2026-01-29 - Day 3 Complete (Tasks 4.3.5-4.3.6)

---

## 📖 Story

As a Bible study user, I want to easily view, add, and manage references (links) between my study notes so that I can build a knowledge graph of interconnected biblical insights and navigate through related studies.

---

## 🎯 Acceptance Criteria

### Core Functionality
- [ ] **View References in Sidebar**
  - References sidebar displays on right side of editor (w-80)
  - Shows list of all studies that reference the current study
  - Each reference shows: target study title, bible book, relevant snippet
  - Sidebar is collapsible and persistent across page reloads
  - Mobile: References accessible via modal/drawer (not always visible)

- [ ] **Add References**
  - User can highlight text in editor and click "Referenciar" button
  - AddReferenceModal opens showing list of other studies
  - Search functionality to find target study by book/title
  - Selected reference creates link and removes from editor if needed
  - Toast confirmation: "Referência adicionada"
  - Optimistic UI (update sidebar immediately)

- [ ] **Remove References**
  - Delete button on each reference in sidebar
  - Confirmation modal: "Remover referência?"
  - When removed, link is deleted from editor content (via removeLink callback)
  - Toast confirmation: "Referência removida"
  - Cascade properly (no orphaned links)

- [ ] **Reference Display**
  - References show with visual distinction (border, icon, color)
  - Hover state shows target study details
  - Click reference card navigates to target study
  - Mobile: Touch-friendly sizes (min 44x44px)

- [ ] **Reordering References**
  - Drag-and-drop to reorder references in sidebar
  - Persist order to database (`display_order` field)
  - Smooth animation when reordering

### Performance & State Management
- [ ] **Loading States**
  - Skeleton loader while references fetch
  - "Nenhuma referência ainda" empty state
  - Prevent UI flicker during transitions

- [ ] **Error Handling**
  - Network error shows retry button
  - Invalid reference shows warning and removal option
  - User-friendly error messages (PT-BR)

- [ ] **Accessibility**
  - Sidebar title is semantic heading
  - Reference buttons have aria-labels
  - Keyboard navigation (Tab, Enter, Delete)
  - Screen reader announces new references
  - Delete confirmation is keyboard accessible

### Responsive Design
- [ ] **Desktop (1024px+)**
  - Sidebar always visible (w-80)
  - Editor centered with sidebar (flex layout)
  - Tooltips on hover

- [ ] **Tablet (768px-1023px)**
  - Sidebar collapsible (toggle button)
  - Reference count badge visible in header
  - Touch-friendly spacing

- [ ] **Mobile (<768px)**
  - Sidebar hidden by default
  - References accessible via "Referências" button in header
  - Modal/drawer for viewing and managing
  - Full-screen on small devices

### Integration with Editor
- [ ] **Link Management**
  - When reference is removed from sidebar, corresponding link in editor is removed
  - When reference is added, link format is `/estudo/{targetStudyId}`
  - Editor prevents duplicate references (UI feedback)

- [ ] **Visual Feedback**
  - Highlight links in editor that have references
  - Show reference count badge in editor toolbar
  - Tooltip on link shows target study info

---

## 📝 Tasks

- [x] **4.3.1** Design reference card component (Figma + React) — ✅ Day 1
- [x] **4.3.2** Implement ReferencesSidebar component (display + list) — ✅ Day 1
- [x] **4.3.3** Implement AddReferenceModal (search + selection) — ✅ Day 2 (debounce + accessibility)
- [x] **4.3.4** Implement useReferences hook (CRUD operations) — ✅ Day 2 (validation + error handling)
- [x] **4.3.5** Implement delete reference flow (confirmation + toast) — ✅ Day 3 (modal + notifications)
- [x] **4.3.6** Implement drag-and-drop reordering — ✅ Day 3 (@dnd-kit + keyboard nav)
- [ ] **4.3.7** Implement responsive mobile behavior
- [ ] **4.3.8** Add loading states and error handling
- [ ] **4.3.9** Add accessibility audit (WCAG AA)
- [ ] **4.3.10** Test on desktop (1920px, 1440px, 1024px)
- [ ] **4.3.11** Test on tablet (iPad 768px)
- [ ] **4.3.12** Test on mobile (iPhone 375px, 667px)
- [ ] **4.3.13** Accessibility audit (WCAG AA level)
- [ ] **4.3.14** CodeRabbit review & security check
- [ ] **4.3.15** Performance testing (Lighthouse + React DevTools)

---

## 🔧 Dev Notes

### Architecture
```
Components:
- ReferencesSidebar.tsx (display + management)
  - ReferenceCard.tsx (individual reference)
  - AddReferenceModal.tsx (search + selection)
  - EmptyState component (no references)

Hooks:
- useReferences.ts (CRUD, reordering)
  - addReference(targetStudyId)
  - deleteReference(referenceId)
  - reorderReference(referenceId, newPosition)

Integration:
- StudyPageClient.tsx
  - Pass references data to sidebar
  - Handle delete callback (removeLink from editor)
  - Manage loading/error states
```

### Database
**Already implemented (Story 2.4):**
- ✅ `bible_study_links` table
- ✅ RLS policies (user_id filtering)
- ✅ Trigger validation (ownership check)

**New fields needed:**
- `display_order` (INTEGER) - for drag-and-drop ordering
- `created_at` (TIMESTAMPTZ) - already exists

### Styling
**Use design tokens from `src/lib/design-tokens.ts`:**
- Colors: `COLORS.primary`, `COLORS.neutral`, `COLORS.success`
- Typography: `TYPOGRAPHY` (body, caption, label)
- Spacing: Tailwind defaults (px-4, gap-2, etc.)
- Shadows: `SHADOW_CLASSES` (sm, md, lg)
- Borders: `BORDERS` (neutral.light, primary.default)

**Component states:**
- Default: Gray border, neutral text
- Hover: Light blue background, primary text
- Active: Blue border, blue text
- Disabled: Gray text, opacity-50
- Error: Red border, red text

### Dependencies
**External libraries (already installed):**
- `react-beautiful-dnd` or `dnd-kit` for drag-and-drop (choose one)
- `sonner` for toast notifications (✅ already used)
- `@radix-ui` for accessible modals (✅ already used)

**Internal dependencies:**
- `useReferences` hook (custom, to be created/updated)
- `useAuth` hook (get current user)
- `Editor` component (for removeLink callback)

### Performance Considerations
- [ ] Memoize ReferenceCard with React.memo
- [ ] Use useCallback for delete/reorder handlers
- [ ] Paginate references if count > 50
- [ ] Debounce search in AddReferenceModal
- [ ] Lazy load full reference details on hover

### Testing Strategy
- [ ] Unit tests for useReferences hook
- [ ] Component snapshot tests
- [ ] E2E tests: Add → Display → Delete flow
- [ ] Responsive layout tests (Playwright)
- [ ] Accessibility tests (axe-core)

---

## 📋 Acceptance Criteria Checklist

### Frontend Components
- [x] ReferencesSidebar displays references correctly — ✅ Component implemented & integrated
- [x] ReferenceCard shows title, book, snippet — ✅ Component created with memoization
- [x] AddReferenceModal has searchable list — ✅ Day 2 (200ms debounce + aria-labels)
- [x] CRUD operations working (add/delete/reorder) — ✅ Day 2-3 (validation + optimistic updates)
- [x] Delete confirmation modal with toast — ✅ Day 3 (AlertTriangle icon + notifications)
- [x] Drag-and-drop reordering functional — ✅ Day 3 (@dnd-kit + keyboard nav + visual feedback)
- [x] Mobile responsive sidebar/drawer — ✅ Layout ready (w-80, responsive flex)
- [x] Empty state shows "Nenhuma referência ainda" — ✅ Implemented in ReferencesSidebar

### User Interactions
- [ ] Add reference: Highlight → Click "Referenciar" → Select target → Link created
- [ ] Remove reference: Click delete → Confirm → Link removed from editor
- [ ] Reorder: Drag reference card → Order persists on page reload
- [ ] Navigate: Click reference → Route to target study
- [ ] Search: Type book name → Results filter in real-time

### Data Integrity
- [ ] No duplicate references between same two studies
- [ ] References are bidirectional (A → B shows B has reference from A)
- [ ] Deleting target study cascades delete on references
- [ ] User can only see their own references (RLS enforced)

### Performance
- [ ] Sidebar loads in <500ms
- [ ] Add reference modal opens <300ms
- [ ] Search debounced to <200ms response
- [ ] Reorder updates DB within <1s
- [ ] Lighthouse Performance > 80

### Accessibility
- [ ] Keyboard navigation (Tab, Enter, Delete, Escape)
- [ ] Screen reader announces references
- [ ] Focus visible on interactive elements
- [ ] ARIA labels on buttons
- [ ] Color contrast >= 4.5:1
- [ ] Touch targets >= 44x44px mobile

### Mobile Responsive
- [ ] Desktop (1024px+): Sidebar always visible
- [ ] Tablet (768px): Sidebar collapsible
- [ ] Mobile (<768px): References in modal/drawer
- [ ] No horizontal scroll on any breakpoint
- [ ] Touch gestures work (swipe to close modal)

---

## 🎯 Implementation Strategy

### Phase 1: Components (4.3.1-4.3.2)
- Build ReferencesSidebar and ReferenceCard
- Static props (no API integration)
- Basic styling with design tokens
- Empty state component

### Phase 2: Add References (4.3.3)
- Build AddReferenceModal
- Search functionality
- Integration with useReferences.addReference()
- Toast notifications

### Phase 3: Delete & Reorder (4.3.4-4.3.5)
- Delete confirmation flow
- removeLink callback integration
- Drag-and-drop reordering
- Optimistic UI updates

### Phase 4: Polish (4.3.6-4.3.15)
- Responsive mobile layout
- Loading states & error handling
- Keyboard navigation & accessibility
- Testing & performance optimization
- CodeRabbit review & security audit

---

## 🚀 Success Metrics

✅ **Functional:**
- User can add, view, remove references
- References persist and sync across sessions
- No broken links in editor

✅ **Performance:**
- Sidebar loads <500ms
- Add/remove operations <1s
- No layout shift (CLS < 0.1)

✅ **Quality:**
- Accessibility score WCAG AA
- Zero critical/high security issues (CodeRabbit)
- Mobile responsive on iOS/Android
- E2E tests covering main flows

✅ **User Experience:**
- Clear visual feedback for actions
- No data loss on failures
- Intuitive mobile navigation
- Helpful empty states

---

## 📅 Timeline Estimate

- **Phase 1 (Components):** 1-2 days (~5 pts)
- **Phase 2 (Add References):** 1 day (~3 pts)
- **Phase 3 (Delete/Reorder):** 1 day (~3 pts)
- **Phase 4 (Polish):** 2-3 days (~5-8 pts)

**Total:** 5-8 story points | ~1-1.5 sprint (Sprint 4)

---

## 🔗 Dependencies

**Blocker Removed:**
- ✅ Story 2.4 (Trigger validation) — COMPLETED
- ✅ Story 2.1 (RLS policies) — COMPLETED
- ✅ Story 2.2 (Soft delete) — COMPLETED

**Related Stories:**
- Story 3.6 (Accessibility WCAG AA) — should be done first or in parallel
- Story 3.7 (Feedback Systems) — toast notifications
- Story 4.1 (Onboarding Guide) — can include reference feature walkthrough

**Future Stories:**
- Story 5.1 (Graph Visualization) — visual representation of references
- Story 5.2 (Reference Analytics) — insights on study connections

---

## 👤 Ownership

**PM:** Morgan (Sprint planning & backlog refinement)
**Dev:** @dev (Implementation)
**QA:** @qa (Testing & code review)
**UX:** Can leverage existing component library (shadcn/ui + design tokens)

---

## 📝 Revision History

- **Created:** 2026-01-28 (Morgan, PM Agent)
- **Status:** Draft → Ready for Sprint 4 Planning
- **Next:** @dev review & task breakdown
