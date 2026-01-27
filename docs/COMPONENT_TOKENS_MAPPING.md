# Component Design Tokens Mapping - Story 3.1

**Status:** In Progress
**Last Updated:** 2026-01-27
**Coverage Target:** 100% of components

---

## Priority 1: High-Impact Components (User-Facing)

### Editor Components
- [x] `src/components/Editor/index.tsx` - 130 lines ✅ DONE (Commit: 1dc7fcf)
  - Status: Loading state text color
  - Tokens: COLORS.neutral
  - Applied: Yes

- [x] `src/components/Editor/BubbleMenu.tsx` - 608 lines (LARGEST) ✅ DONE (Commit: 20af2e0)
  - Status: Comprehensive refactoring (menu buttons, dividers, input, palette)
  - Tokens: COLORS.primary, COLORS.neutral, SHADOWS, BORDERS
  - Applied: Yes

- [x] `src/components/Editor/SlashMenu.tsx` - 357 lines ✅ DONE (Commit: 8af1f89)
  - Status: Command palette styling
  - Tokens: COLORS.primary, COLORS.neutral, BORDERS
  - Applied: Yes

### Dashboard Components
- [x] `src/components/dashboard/ChapterView.tsx` - 344 lines ✅ DONE (Commit: 54196f4)
  - Status: Already had many tokens, refactored loader, labels, borders
  - Tokens: COLORS.primary, COLORS.neutral, BORDERS
  - Applied: Yes

- [x] `src/components/dashboard/BookCard.tsx` - 110 lines ✅ DONE (Sprint 2.3)
  - Status: Already has tokens
  - Tokens: COLORS.primary, COLORS.neutral, COLORS.danger
  - Applied: Yes

- [x] `src/components/dashboard/BookGrid.tsx` - 116 lines ✅ DONE (Commit: 1e053da)
  - Status: Stats, section titles, dots
  - Tokens: COLORS.primary, COLORS.neutral
  - Applied: Yes

- [x] `src/components/dashboard/BacklogPanel.tsx` - 239 lines ✅ DONE (Commit: 5bf6129)
  - Status: Comprehensive refactoring (items, labels, buttons, controls)
  - Tokens: COLORS.primary, COLORS.danger, COLORS.neutral, BORDERS
  - Applied: Yes

- [x] `src/components/dashboard/TopBar.tsx` - 179 lines ✅ DONE (Commit: ca523d5)
  - Status: Search bar, filters, tags
  - Tokens: COLORS.primary, COLORS.neutral, BORDERS, TAG_COLORS
  - Estimated: 20min

- [ ] `src/components/dashboard/Sidebar.tsx` - 156 lines
  - Status: Hardcoded colors in sidebar
  - Tokens needed: COLORS.primary, COLORS.neutral
  - Estimated: 20min

### Modal Components
- [x] `src/components/CreateTagModal.tsx` ✅ DONE (Commit: 9c5fa32)
  - Status: Modal dialog with form, color picker, buttons
  - Tokens: COLORS.primary, COLORS.neutral, SHADOWS, BORDERS
  - Applied: Yes

- [x] `src/components/dashboard/StudySelectionModal.tsx` - 234 lines ✅ DONE (Commit: ca08ddc)
  - Status: Study selection with list and delete buttons
  - Tokens: COLORS.primary, COLORS.danger, COLORS.neutral
  - Applied: Yes

---

## Priority 2: UI Base Components

### Dialog/Modal
- [x] `src/components/ui/confirm-modal.tsx` ✅ DONE (Commit: f6365ce)
  - Status: Confirm dialog with variant support
  - Tokens: COLORS.primary, COLORS.danger
  - Applied: Yes

### Form Elements
- [x] `src/components/ui/input.tsx` ✅ DONE (Commit: f6365ce)
  - Status: Text input with focus states
  - Tokens: COLORS.neutral
  - Applied: Yes

- [x] `src/components/ui/badge.tsx` ✅ DONE (Commit: f6365ce)
  - Status: Multiple variants (default, secondary, outline)
  - Tokens: COLORS.primary, COLORS.neutral
  - Applied: Yes

- [x] `src/components/ui/button.tsx` ✅ DONE (Commit: f6365ce)
  - Status: All variants (default, outline, ghost, secondary)
  - Tokens: COLORS.primary, COLORS.neutral, BORDERS
  - Applied: Yes

### Navigation
- [x] `src/components/ui/breadcrumbs.tsx` ✅ DONE (Commit: f6365ce)
  - Status: Navigation breadcrumbs
  - Tokens: COLORS.primary, COLORS.neutral
  - Applied: Yes

---

## Priority 3: Page Components

- [ ] `src/app/page.tsx` (Dashboard)
  - Status: Needs audit
  - Estimated: 15min

- [ ] `src/app/estudo/[id]/page.tsx` (Editor page)
  - Status: Needs audit
  - Estimated: 15min

- [ ] `src/app/login/page.tsx`
  - Status: Needs audit
  - Estimated: 15min

---

## Implementation Progress

### Summary (2026-01-27 Session)
**Total Components:** 22+
**Progress:** 15/22+ ✅

**Progress by Category:**
- Editor Components: ✅ 3/3 DONE (130, 608, 357 lines)
- Dashboard Components: ✅ 5/7 DONE (BookCard, ChapterView, BookGrid, BacklogPanel, TopBar, Sidebar pending)
- Modal Components: ✅ 2/2 DONE (CreateTagModal, StudySelectionModal)
- UI Components: ✅ 5/5 DONE (button, badge, input, breadcrumbs, confirm-modal)
- Page Components: 0/3 PENDING

---

## Refactoring Pattern

Each component refactoring follows this pattern:

```typescript
// BEFORE: Hardcoded
className="bg-blue-600 text-white hover:bg-blue-700"

// AFTER: Using design tokens
import { COLORS } from '@/lib/design-tokens';
className={`${COLORS.primary.default} text-white hover:${COLORS.primary.dark}`}
```

---

## Validation Checklist

- [ ] Zero hardcoded Tailwind color classes
- [ ] All COLORS imports present
- [ ] Build passes: `npm run build` ✅
- [ ] Lint passes: `npm run lint` ✅
- [ ] TypeScript clean: `npm run typecheck` (if available)
- [ ] Visual testing on desktop
- [ ] Visual testing on mobile (375px)

---

## Notes

- Story 2.3 already refactored: BookCard, ChapterView (partial), SearchInput, RestoreButton
- Focus on high-impact components first (Editor, Dashboard)
- Test visual consistency after each refactoring batch
- Maintain exact same appearance - only swapping color definitions

---
