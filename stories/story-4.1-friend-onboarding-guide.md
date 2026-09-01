# Story 4.1: Friend Onboarding Guide

**Story ID:** 4.1
**Epic:** EPIC-002 (Stabilization for Friends)
**Points:** 2
**Status:** 📋 Draft
**Priority:** P0 (Polish & Testing)
**Sprint:** Sprint 4 (Polish + Testing)

---

## 📖 Story

As a new user of Bible Study (invited by a friend), I want to quickly understand how to use the app so that I can start studying within 5 minutes without asking for help.

---

## 🎯 Acceptance Criteria

- [ ] **Interactive Tutorial on First Login**
  - Tutorial triggers for new users (first time ever logging in)
  - Skip option available ("Pular tutorial")
  - Resume option if accidentally closed
  - Estimated time: 2-3 minutes

- [ ] **Tutorial Covers Core Workflows**
  1. Finding a book to study (e.g., Genesis 1:1)
  2. Reading & creating a study note
  3. Saving the study
  4. Using tags to organize
  5. Viewing the graph of connected studies
  - Each step has clickable highlight + explanation
  - User can click "Próximo" to advance

- [ ] **First-Time User Guidance**
  - Sidebar highlights: "66 Livros da Bíblia"
  - Dashboard highlights: How to select a book
  - Editor highlights: Where to write, how to save
  - Backlog highlights: How to track reading plans
  - Graph highlights: How connections work

- [ ] **Help Content Available**
  - FAQ page or in-app help (simple, not overwhelming)
  - Link in settings: "Ajuda" or "Tutorial"
  - Topics: Basic usage, keyboard shortcuts, troubleshooting
  - Tone: Friendly, encouraging

- [ ] **Onboarding State Tracking**
  - New users vs. returning users detected
  - Completed tutorial flag saved to `bible_profiles.onboarding_completed`
  - Tutorial not shown again after completion
  - Manual reset in settings (if user wants to redo)

- [ ] **Keyboard Shortcuts Reference**
  - In-app guide showing:
    - Ctrl+S / Cmd+S: Save
    - Ctrl+Z / Cmd+Z: Undo
    - Escape: Close modal
    - Tab: Navigate
  - Available in settings or help page

---

## 📝 Tasks

- [ ] **4.1.1** Design tutorial flow (5 steps, 2-3 minutes)
- [ ] **4.1.2** Create Tutorial component (interactive, click-through)
- [ ] **4.1.3** Implement first-time user detection (check profiles)
- [ ] **4.1.4** Add tutorial highlights (spotlight/overlay effect)
- [ ] **4.1.5** Create FAQ/Help page with basic content
- [ ] **4.1.6** Add keyboard shortcuts reference
- [ ] **4.1.7** Add "Pular tutorial" and "Resumir tutorial" options
- [ ] **4.1.8** Test tutorial on iPhone, iPad, Chrome

---

## 🔧 Dev Notes

**Configuration (User Input):**
- Tutorial format: Interactive (click-through walkthrough, not static FAQ)
- User wants hands-on experience, not just reading

**Tutorial Flow (Recommended):**

```
Step 1: Welcome
  Title: "Bem-vindo ao Bible Study!"
  Highlight: Logo
  Explanation: "Aplicativo para estudar a Bíblia"

Step 2: Choose Book
  Highlight: Genesis in grid
  Explanation: "Clique em um livro para começar"
  Action: User clicks a book

Step 3: Select Chapter & Create Study
  Highlight: Chapter 1
  Explanation: "Escolha um capítulo e comece a estudar"
  Action: User clicks chapter

Step 4: Write & Save
  Highlight: Editor textarea
  Explanation: "Escreva suas anotações aqui"
  Action: User types something + clicks "Salvar"

Step 5: Use Tags
  Highlight: Tag input
  Explanation: "Organize com tags"
  Action: User adds a tag

Step 6: Explore Grafo
  Highlight: Grafo link
  Explanation: "Veja conexões entre seus estudos"
  Action: User clicks to grafo page

Step 7: Done!
  Title: "Você está pronto!"
  Action: Close tutorial
```

**First-Time User Detection:**
```typescript
// In useAuth hook or component:
const isNewUser = !profile?.onboarding_completed;

useEffect(() => {
  if (isNewUser && location === '/') {
    // Show tutorial modal
  }
}, [isNewUser]);
```

**Tutorial Storage:**
```sql
-- Add to bible_profiles (migration needed)
ALTER TABLE bible_profiles
ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN onboarding_completed_at TIMESTAMPTZ;
```

**Tutorial UI Components:**
- Modal overlay (dark background, spotlight on element)
- Step indicator: "1 de 6"
- Navigation: "← Anterior" | "Próximo →" | "Pular"
- Text box with explanation and action hint

**Related Stories:**
- Story 3.6: Accessibility (tutorial must be keyboard navigable)
- Story 3.5: Mobile UX (tutorial responsive on iPhone)

**Browser Testing:**
- Chrome (primary)
- iOS Safari (iPhone)
- iOS Safari (iPad)

---

## 🎨 Tutorial UI Mockup

```
┌─────────────────────────────────────────┐
│      Bem-vindo ao Bible Study! 🙏       │
├─────────────────────────────────────────┤
│                                         │
│   Aplicativo para estudar a Bíblia     │
│   com seus amigos                      │
│                                         │
│   [📸 Spotlight on element]             │
│                                         │
│   Clique em um livro para começar       │
│                                         │
│ [Pular]              1/6  [Próximo →]  │
└─────────────────────────────────────────┘
```

---

## 📊 P1 Debt Reference

Maps to: **Story 4.1** (New feature, not P1 debt)

---

## 🔒 CodeRabbit Integration

**Pre-commit Check:**
- [ ] Run: `wsl bash -c 'cd /mnt/c/.../@synkra/aios-core && ~/.local/bin/coderabbit --prompt-only -t uncommitted'`
- [ ] CRITICAL issues: 0 (block story completion)
- [ ] HIGH issues: Document in Dev Notes

**Focus Areas for Review:**
- Accessibility: Tutorial keyboard navigable, focus management
- UX: Clear steps, no confusing language
- Performance: Spotlight effect smooth animation
- Mobile: Tutorial responsive on iPhone/iPad

---

## ✅ Definition of Done

- [x] All acceptance criteria met
- [x] Tutorial flow complete (5+ steps)
- [x] First-time user detection working
- [x] Tutorial skippable and resumable
- [x] FAQ/Help page created
- [x] Keyboard shortcuts reference available
- [x] Tested on Chrome, iPhone, iPad
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
- `src/components/Onboarding/TutorialModal.tsx` - Interactive tutorial component
- `src/components/Onboarding/TutorialStep.tsx` - Individual step component
- `src/app/help/page.tsx` - FAQ/Help page
- `src/components/Onboarding/KeyboardShortcuts.tsx` - Shortcuts reference

**Files to Modify:**
- `src/app/page.tsx` - Show tutorial for new users
- `src/contexts/AuthContext.tsx` - Check `onboarding_completed`
- `src/hooks/useStudies.ts` - Update `onboarding_completed` flag
- Database migration: Add columns to `bible_profiles`

**Files NOT to Modify:**
- Design tokens (use existing)
- Auth system core
- Editor functionality

---

## 🔄 Change Log

- Created: 2026-01-27
- Status: Draft
- Next: Ready for @dev implementation

---

**Epic Reference:** EPIC-002: Stabilization for Friends
**Created by:** River (Scrum Master)
**Date:** 2026-01-27
