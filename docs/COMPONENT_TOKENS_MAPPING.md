# Component Design Tokens Mapping - Story 3.1

**Status:** In Progress
**Last Updated:** 2026-01-27
**Coverage Target:** 100% of components

---

## Priority 1: High-Impact Components (User-Facing)

### Editor Components
- [ ] `src/components/Editor/index.tsx` - 130 lines
  - Status: Hardcoded colors in toolbar
  - Tokens needed: COLORS.primary, COLORS.neutral
  - Estimated: 30min

- [ ] `src/components/Editor/BubbleMenu.tsx` - 608 lines (LARGEST)
  - Status: Hardcoded colors in buttons and menu
  - Tokens needed: COLORS.primary, COLORS.neutral, COLORS.secondary
  - Estimated: 1.5h

- [ ] `src/components/Editor/SlashMenu.tsx` - 357 lines
  - Status: Hardcoded colors in command palette
  - Tokens needed: COLORS.primary, COLORS.accent, COLORS.neutral
  - Estimated: 1h

### Dashboard Components
- [ ] `src/components/dashboard/ChapterView.tsx` - 344 lines
  - Status: Mostly tokens (from Sprint 2.3), minor updates
  - Tokens needed: Verify usage
  - Estimated: 15min

- [ ] `src/components/dashboard/BookCard.tsx` - 110 lines
  - Status: Already has tokens (Sprint 2.3)
  - Tokens needed: ✅ Already using
  - Estimated: 0min

- [ ] `src/components/dashboard/BookGrid.tsx` - 116 lines
  - Status: Likely needs updates
  - Tokens needed: COLORS.primary, COLORS.neutral
  - Estimated: 20min

- [ ] `src/components/dashboard/BacklogPanel.tsx` - 239 lines
  - Status: Hardcoded colors in status badges
  - Tokens needed: COLORS.success, COLORS.warning, COLORS.danger
  - Estimated: 30min

- [ ] `src/components/dashboard/TopBar.tsx` - 179 lines
  - Status: Hardcoded colors in navigation
  - Tokens needed: COLORS.primary, COLORS.neutral
  - Estimated: 20min

- [ ] `src/components/dashboard/Sidebar.tsx` - 156 lines
  - Status: Hardcoded colors in sidebar
  - Tokens needed: COLORS.primary, COLORS.neutral
  - Estimated: 20min

### Modal Components
- [ ] `src/components/CreateTagModal.tsx`
  - Status: Hardcoded colors
  - Tokens needed: COLORS.primary, COLORS.neutral
  - Estimated: 15min

- [ ] `src/components/dashboard/StudySelectionModal.tsx` - 234 lines
  - Status: Hardcoded colors in modal
  - Tokens needed: COLORS.primary, COLORS.danger
  - Estimated: 20min

---

## Priority 2: UI Base Components

### Dialog/Modal
- [ ] `src/components/ui/dialog.tsx` - 122 lines
  - Status: Hardcoded bg-white, borders
  - Tokens needed: COLORS.neutral
  - Estimated: 15min

- [ ] `src/components/ui/alert-dialog.tsx` - 141 lines
  - Status: Hardcoded colors
  - Tokens needed: COLORS.primary, COLORS.danger, COLORS.neutral
  - Estimated: 20min

### Form Elements
- [ ] `src/components/ui/input.tsx`
  - Status: Hardcoded borders/bg
  - Tokens needed: COLORS.neutral
  - Estimated: 10min

- [ ] `src/components/ui/badge.tsx`
  - Status: Hardcoded colors
  - Tokens needed: COLORS.primary, COLORS.neutral
  - Estimated: 10min

- [ ] `src/components/ui/button.tsx`
  - Status: Hardcoded colors
  - Tokens needed: COLORS.primary, COLORS.secondary, COLORS.neutral
  - Estimated: 15min

### Navigation
- [ ] `src/components/ui/breadcrumbs.tsx`
  - Status: Hardcoded colors
  - Tokens needed: COLORS.primary, COLORS.neutral.text
  - Estimated: 10min

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

### Summary
**Total Estimated Time:** 6-7 hours
**Total Components:** 22+

**Progress by Category:**
- Editor Components: 0/3 done
- Dashboard Components: 1/7 done (BookCard already has tokens)
- Modal Components: 0/2 done
- UI Components: 0/5 done
- Page Components: 0/3 done

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
