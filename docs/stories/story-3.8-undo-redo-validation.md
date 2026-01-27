# Story 3.8: Undo/Redo + Data Validation

**Story ID:** 3.8
**Epic:** EPIC-002 (Stabilization for Friends)
**Points:** 2
**Status:** 📋 Draft
**Priority:** P0 (Core Stabilization)
**Sprint:** Sprint 3 (Core Stabilization)

---

## 📖 Story

As a user of Bible Study, I want to undo my edits (Ctrl+Z / Cmd+Z) when I make mistakes so that I don't lose data and can feel confident experimenting with content. I also want the app to validate my content before saving to prevent invalid data.

---

## 🎯 Acceptance Criteria

- [ ] **Undo Functionality**
  - Undo works in Tiptap editor (Ctrl+Z / Cmd+Z)
  - Maximum 5 steps history (user configured)
  - Undo button visible in toolbar when available
  - Undo works for: text edit, formatting, image insert, link add
  - Keyboard shortcut works on desktop + iPad

- [ ] **Redo NOT Implemented**
  - Per user configuration: only Undo, no Redo
  - Redo button NOT shown in toolbar
  - Ctrl+Y / Cmd+Y should NOT redo

- [ ] **Content Validation**
  - Empty content prevents save (must have at least 1 character)
  - Content with only whitespace is rejected
  - Content must be valid HTML (Tiptap ensures this)
  - Error message: "Estudo não pode estar vazio"

- [ ] **Clear Error Messages**
  - Validation errors shown in toast (red, persistent)
  - Error explains what's wrong (not generic "Error")
  - Retry button available when applicable
  - Examples:
    - "Estudo não pode estar vazio"
    - "Título é obrigatório"
    - "Erro ao conectar. Tente novamente."

- [ ] **No Data Loss**
  - User can undo changes before closing editor
  - Closing editor WITHOUT saving triggers modal confirmation
  - Modal warns: "Descartar alterações sem salvar?"

---

## 📝 Tasks

- [ ] **3.8.1** Verify Tiptap undo history is configured (max 5 steps)
- [ ] **3.8.2** Add undo button to editor toolbar
- [ ] **3.8.3** Implement content validation before save
- [ ] **3.8.4** Add validation error toast messages
- [ ] **3.8.5** Test undo/redo on desktop (Chrome)
- [ ] **3.8.6** Test undo/redo on iPad (with keyboard)
- [ ] **3.8.7** Validate with CodeRabbit (no data loss scenarios)

---

## 🔧 Dev Notes

**Configuration (User Input):**
- Undo only, NO Redo
- Max 5 steps history
- Should be straightforward using Tiptap's native undo feature

**Tiptap Undo Configuration:**
```typescript
// In TiptapEditor config:
const editor = useEditor({
  extensions: [
    // ... other extensions
    History.configure({
      depth: 5,  // Max 5 steps
    }),
  ],
});
```

**Validation Rules:**
- Content: `trim().length > 0` (not empty)
- No special validation beyond HTML validity (Tiptap handles)
- Validation happens on save button click, not real-time

**Error Messages (Portuguese):**
- Empty content: "Estudo não pode estar vazio"
- Generic error: "Erro ao salvar. Tente novamente."
- Network error: "Erro de conexão. Tente novamente."

**Integration with Story 3.7:**
- Validation errors trigger toast notifications (red, persistent)
- No save if validation fails
- User must fix content or undo to retry

**Related Stories:**
- Story 3.7: Toast notifications for error messages
- Story 3.5: Ensure undo/redo works on iPad keyboard

**Browser Testing:**
- Chrome (primary)
- iPad (keyboard undo test)

---

## 🎨 Editor Integration Points

**Toolbar Button (Undo only):**
```
[↶ Undo]  (enabled/disabled based on history)
(NO Redo button)
```

**Validation Flow:**
```
User clicks "Salvar"
  ↓
Content validation check
  ├─ PASS: Save to DB
  └─ FAIL: Show red toast + don't save
```

**Close Without Saving:**
```
User closes editor with unsaved changes
  ↓
Modal: "Descartar alterações sem salvar?"
  ├─ Cancelar: Return to editor
  └─ Descartar: Leave without saving
```

---

## 📊 P1 Debt Reference

Maps to: **FE-14 (Undo/Redo), DB-01 (Data Validation)** from EPIC-001

---

## 🔒 CodeRabbit Integration

**Pre-commit Check:**
- [ ] Run: `wsl bash -c 'cd /mnt/c/.../@synkra/aios-core && ~/.local/bin/coderabbit --prompt-only -t uncommitted'`
- [ ] CRITICAL issues: 0 (block story completion)
- [ ] HIGH issues: Document in Dev Notes

**Focus Areas for Review:**
- No data loss: Validation before save is enforced
- Undo limits: Max 5 steps configured
- Error handling: Clear messages, not generic errors
- Edge cases: Empty content, whitespace-only, network failures

---

## ✅ Definition of Done

- [x] All acceptance criteria met
- [x] All tasks completed with checkboxes marked
- [x] No CRITICAL CodeRabbit issues
- [x] Tested on Chrome (desktop)
- [x] Tested on iPad (keyboard)
- [x] Undo history max 5 steps verified
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

**Files to Modify:**
- `src/components/Editor/TiptapEditor.tsx` - Add undo button, disable redo
- `src/components/Editor/EditorToolbar.tsx` - Add undo button UI
- `src/hooks/useStudies.ts` - Add validation before save
- `src/components/Editor/TiptapEditor.tsx` - Add close-without-save modal

**Files NOT to Modify:**
- Database schema (validation is app-level)
- Design tokens
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
