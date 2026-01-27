# Story 3.7: Feedback Systems (Toast/Modal)

**Story ID:** 3.7
**Epic:** EPIC-002 (Stabilization for Friends)
**Points:** 2
**Status:** 📋 Draft
**Priority:** P0 (Core Stabilization)
**Sprint:** Sprint 3 (Core Stabilization)

---

## 📖 Story

As a user of Bible Study, I want to see clear feedback when I perform actions (saving, deleting, errors) so that I always know what's happening and feel confident using the app.

---

## 🎯 Acceptance Criteria

- [ ] **Toast System Implemented**
  - Toast notifications appear when async operations occur
  - Positioned consistently (top-right, 20px from edges)
  - Auto-dismiss after 3 seconds
  - Multiple toasts can stack vertically
  - Dismiss button available
  - Smooth animations (fade in/out 300ms)

- [ ] **Saving Feedback**
  - "Salvando..." toast appears when auto-save triggers
  - "Salvo com sucesso ✓" on success
  - "Erro ao salvar" on failure with retry option
  - Toasts clear after 3 seconds (success) or persist (error)

- [ ] **Delete Confirmation**
  - Modal confirms before deleting (not toast)
  - Title: "Deletar estudo?"
  - Body: "Esta ação não pode ser desfeita"
  - Buttons: "Cancelar" (secondary) and "Deletar" (danger red)
  - Keyboard: ESC cancels, Enter confirms

- [ ] **Error Messages**
  - Network errors show helpful message + retry button
  - Validation errors show specific field and reason
  - Toasts have appropriate colors (success green, error red, info blue)

- [ ] **All Async Operations Have Feedback**
  - Study save
  - Study delete
  - Tag create/edit/delete
  - Backlog add/remove
  - Link create/delete

---

## 📝 Tasks

- [ ] **3.7.1** Create Toast component with composable API
- [ ] **3.7.2** Create useToast() hook for managing toast queue
- [ ] **3.7.3** Integrate toast feedback into auto-save (study editor)
- [ ] **3.7.4** Create DeleteConfirmation modal component
- [ ] **3.7.5** Integrate delete confirmation into all destructive actions
- [ ] **3.7.6** Test toasts and modals on mobile (iPhone/iPad)
- [ ] **3.7.7** Validate accessibility (focus, keyboard nav, ARIA labels)

---

## 🔧 Dev Notes

**Configuration (User Input):**
- Toast implementation: Author's discretion on best practices
- Recommendation: Use Radix UI components (consistent with existing design)
- Animation: Smooth fade in/out 300ms
- Position: Top-right (20px from edges)
- Auto-dismiss: 3 seconds for success, persistent for error

**Design Tokens:**
- Success: `COLORS.success` (green)
- Error: `COLORS.danger` (red)
- Info: `COLORS.primary` (blue)
- Use existing `SHADOW_CLASSES.md` for elevation

**Dependencies:**
- Existing: Radix UI, TailwindCSS, framer-motion (if available)
- May need: `sonner` library for toast (lightweight, recommended)

**Related Stories:**
- Story 3.8: Data validation for error messages
- Story 3.5: Ensure toasts visible on small screens

**Browser Testing:**
- Chrome (primary)
- Safari (if time)
- Mobile: iOS (iPhone, iPad) already available

---

## 🎨 Design References

**Toast Component Spec:**
```
┌─────────────────────────────────────────┐
│ ✓ Salvo com sucesso                  ✕  │
└─────────────────────────────────────────┘
 (auto-dismiss in 3s)
```

**Delete Modal Spec:**
```
╔════════════════════════════════╗
║  Deletar estudo?               ║
╠════════════════════════════════╣
║                                ║
║  Esta ação não pode ser        ║
║  desfeita                      ║
║                                ║
║  [Cancelar]    [Deletar]       ║
╚════════════════════════════════╝
```

---

## 📊 P1 Debt Reference

Maps to: **FE-13 (Salvando toast)** from EPIC-001

---

## 🔒 CodeRabbit Integration

**Pre-commit Check:**
- [ ] Run: `wsl bash -c 'cd /mnt/c/.../@synkra/aios-core && ~/.local/bin/coderabbit --prompt-only -t uncommitted'`
- [ ] CRITICAL issues: 0 (block story completion)
- [ ] HIGH issues: Document in Dev Notes

**Focus Areas for Review:**
- Accessibility: ARIA labels, focus management, keyboard nav
- Performance: No memory leaks in toast stacking
- Security: No user input directly in toast (prevent XSS)
- Types: Proper TypeScript for toast props

---

## ✅ Definition of Done

- [x] All acceptance criteria met
- [x] All tasks completed with checkboxes marked
- [x] No CRITICAL CodeRabbit issues
- [x] Mobile testing done (iPhone/iPad)
- [x] Keyboard navigation verified
- [x] Visual regression test passed
- [x] Story status set to "Ready for Review"

---

## 📋 Dev Agent Record

**Status:** Draft → Ready for Review (via @dev)
**Agent Model Used:** -
**Completion Date:** -

**Debug Log:**
- (none yet)

**Completion Notes:**
- (none yet)

---

## 📁 File List

**Files to Create:**
- `src/components/ui/Toast.tsx` - Toast component
- `src/hooks/useToast.ts` - Toast hook
- `src/components/ui/DeleteConfirmModal.tsx` - Delete confirmation modal

**Files to Modify:**
- `src/components/Editor/TiptapEditor.tsx` - Add save feedback
- `src/hooks/useStudies.ts` - Add toast integration
- `src/hooks/useBacklog.ts` - Add toast integration
- `src/hooks/useTags.ts` - Add toast integration
- `src/app/page.tsx` - Add toast provider

**Files NOT to Modify:**
- Design tokens (use existing)
- Database schema
- Auth system

---

## 🔄 Change Log

- Created: 2026-01-27
- Status: Draft
- Next: Ready for @dev implementation

---

**Epic Reference:** EPIC-002: Stabilization for Friends
**Created by:** River (Scrum Master)
**Date:** 2026-01-27
