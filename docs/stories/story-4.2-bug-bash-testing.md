# Story 4.2: Bug Bash + Testing

**Story ID:** 4.2
**Epic:** EPIC-002 (Stabilization for Friends)
**Points:** 3
**Status:** 📋 Draft
**Priority:** P0 (Polish & Testing)
**Sprint:** Sprint 4 (Polish + Testing)

---

## 📖 Story

As a friend about to receive early access to Bible Study, I want the app to be thoroughly tested and free of bugs so that I can trust it and enjoy my first experience without frustration.

---

## 🎯 Acceptance Criteria

- [ ] **Comprehensive Manual E2E Testing**
  - All core workflows tested end-to-end (no automated suite)
  - Testing approach: Manual, hands-on (user preference)
  - Browser: Chrome (primary)
  - Devices: iPhone, iPad (if available)
  - Test plan created and documented

- [ ] **All Core Workflows Tested**
  1. Login/signup with name input
  2. View 66 books and select one
  3. View chapters and click into chapter
  4. Create a new study
  5. Edit study (text, formatting)
  6. Save study (auto-save + manual)
  7. Delete study (confirm modal)
  8. Add/edit/delete tags
  9. View backlog and add items
  10. Navigate grafo (force-directed graph)
  11. Mobile experience (if device available)
  12. Logout and re-login

- [ ] **Edge Cases Tested**
  - Empty content save (validation)
  - Very long study content (performance)
  - Special characters in tags
  - Rapid-fire saves (stress test)
  - Network interruption (error handling)
  - Keyboard navigation (Tab through app)
  - Screen reader test (accessibility)

- [ ] **No Critical Bugs Found**
  - Critical = app crash, data loss, broken core workflow
  - High bugs: documented in Dev Notes (may be deferred)
  - Low bugs: noted but acceptable for friend sharing

- [ ] **Performance Validated**
  - Dashboard loads in < 2 seconds
  - Editor is responsive (no lag)
  - Grafo renders smoothly (1000+ nodes)
  - Mobile performance acceptable

- [ ] **Final Sign-Off**
  - Testing checklist completed
  - All test results documented
  - Approval: "Ready for friends"

---

## 📝 Tasks

- [ ] **4.2.1** Create comprehensive test plan (12 core workflows)
- [ ] **4.2.2** Test login/signup (with full name)
- [ ] **4.2.3** Test dashboard (book grid, search, filtering)
- [ ] **4.2.4** Test study editor (create, edit, save, delete)
- [ ] **4.2.5** Test tags (create, edit, delete, filter)
- [ ] **4.2.6** Test backlog (add, remove, status changes)
- [ ] **4.2.7** Test grafo (view, zoom, click, navigation)
- [ ] **4.2.8** Test mobile experience (iPhone if available)
- [ ] **4.2.9** Test edge cases (empty, long content, special chars)
- [ ] **4.2.10** Test error handling (network, validation)
- [ ] **4.2.11** Test accessibility (keyboard, screen reader)
- [ ] **4.2.12** Performance testing (load times, responsiveness)
- [ ] **4.2.13** Document all findings and sign off

---

## 🔧 Dev Notes

**Configuration (User Input):**
- Testing approach: Manual only (no Playwright suite)
- Browser priority: Chrome first, others if time
- Devices: iPhone + iPad available for testing

**Test Plan Template:**

```markdown
## Test Case 1: Login & Signup
- [ ] Navigate to /login
- [ ] Click "Criar conta"
- [ ] Fill: email, password, full name
- [ ] Verify: Profile created, stored in DB
- [ ] Logout and re-login with same credentials
- [ ] Verify: Name displayed in sidebar

## Test Case 2: Dashboard (Book Grid)
- [ ] Load dashboard
- [ ] Verify: 66 books displayed in grid
- [ ] Verify: Organized by category (different colors)
- [ ] Test search: Type "Genesis" → filter works
- [ ] Test category filter: Click "Pentateuco" → show only 5 books
- [ ] Test responsive: Resize to mobile → grid adapts
- [ ] Verify: Click book → show chapters

## Test Case 3: Create Study
- [ ] Select Genesis chapter 1
- [ ] Click "Nova anotação"
- [ ] Type content in editor
- [ ] Verify: Auto-save every 30s (toast appears)
- [ ] Click "Salvar" button
- [ ] Verify: Study saved and listed
- [ ] Verify: Content persists after refresh

## Test Case 4: Edit Study
- [ ] Open saved study
- [ ] Edit text (change content)
- [ ] Use Ctrl+Z (undo) 3 times
- [ ] Verify: Undo works (max 5 steps)
- [ ] Try Ctrl+Y (redo) → should do nothing
- [ ] Edit text again and save
- [ ] Verify: Changes saved

## Test Case 5: Delete Study
- [ ] Click delete button on study
- [ ] Verify: Modal appears ("Deletar estudo?")
- [ ] Click "Cancelar" → study not deleted
- [ ] Click delete again
- [ ] Click "Deletar" → study removed
- [ ] Verify: Study no longer in list

## Test Case 6: Tags
- [ ] Create tag: "Promessas de Deus"
- [ ] Assign to study
- [ ] Verify: Tag appears in sidebar
- [ ] Click tag → filter studies
- [ ] Edit tag name
- [ ] Delete tag → confirm modal
- [ ] Verify: Tag removed

## Test Case 7: Backlog
- [ ] Add item: "Ler Salmos 23"
- [ ] Verify: Item in sidebar
- [ ] Mark as "Concluído"
- [ ] Verify: Status change
- [ ] Remove item → confirm modal
- [ ] Verify: Item removed

## Test Case 8: Grafo (Graph)
- [ ] Navigate to grafo
- [ ] Verify: Force-directed graph renders
- [ ] Hover node → see details
- [ ] Click node → navigate to study
- [ ] Zoom in/out (mouse wheel)
- [ ] Pan (drag background)
- [ ] Verify: Legend shows categories

## Test Case 9: Mobile Experience (iPhone)
- [ ] Open app on iPhone (375px)
- [ ] Dashboard: Grid responsive?
- [ ] Click book → chapters visible?
- [ ] Editor: Full-screen, keyboard accessible?
- [ ] Backlog: Visible and usable?
- [ ] Tap buttons: All >= 44px touch target?

## Test Case 10: Edge Cases
- [ ] Create study with ONLY whitespace → save fails
- [ ] Create study with 10,000+ characters → save works, displays OK
- [ ] Tag with special chars: "Filhos de Deus (Rm 8:14)" → works?
- [ ] Rapid clicks on save → no duplicate saves?
- [ ] Network offline → graceful error, retry option?

## Test Case 11: Keyboard Navigation
- [ ] Tab through entire app → logical order?
- [ ] Shift+Tab → reverse order?
- [ ] Enter on buttons → activates?
- [ ] Escape on modal → closes?
- [ ] No keyboard trap (can always escape)?

## Test Case 12: Performance
- [ ] Dashboard load time: < 2 seconds?
- [ ] Editor responsiveness: No lag when typing?
- [ ] Grafo render time: < 3 seconds?
- [ ] Mobile: No excessive battery drain?
```

**Testing Tools:**
- Chrome DevTools (network, performance)
- iPhone Safari (if physical device available)
- iPad Safari (if physical device available)
- Lighthouse (performance audit)

**Bug Documentation Format:**
```markdown
## Bug: [Title]
- **Severity**: Critical / High / Medium / Low
- **Steps**: How to reproduce
- **Expected**: What should happen
- **Actual**: What actually happened
- **Environment**: Chrome 120 / iPhone 14 / etc.
- **Screenshots**: If applicable
- **Fix**: (if obvious, otherwise defer)
```

**Related Stories:**
- Story 3.5: Mobile UX (test on iPhone)
- Story 3.6: Accessibility (keyboard nav, screen reader)
- Story 3.7: Feedback systems (toasts, modals)

---

## 🎨 Testing Checklist

**Pre-Testing:**
- [ ] Build passes (`npm run build`)
- [ ] No lint errors (`npm run lint`)
- [ ] No TypeScript errors (`npm run typecheck`)
- [ ] Recent commits pushed

**During Testing:**
- [ ] Follow test plan systematically
- [ ] Document deviations and discoveries
- [ ] Take screenshots of bugs
- [ ] Note performance observations

**Post-Testing:**
- [ ] All test cases documented
- [ ] Critical bugs: fixed or blocked story
- [ ] High bugs: documented in Dev Notes
- [ ] Approval received: "Ready for friends"

---

## 📊 P1 Debt Reference

Maps to: **Story 4.2** (New feature, not P1 debt)

---

## 🔒 CodeRabbit Integration

**Pre-final Check:**
- [ ] Run: `wsl bash -c 'cd /mnt/c/.../@synkra/aios-core && ~/.local/bin/coderabbit --prompt-only -t uncommitted'`
- [ ] CRITICAL issues: 0 (block story completion)
- [ ] HIGH issues: Document in Dev Notes

**Focus Areas for Review:**
- Code quality: No obvious bugs or code smells
- Performance: No memory leaks or inefficient loops
- Security: No XSS, injection vulnerabilities
- Accessibility: Keyboard and screen reader support

---

## ✅ Definition of Done

- [x] Test plan created and documented
- [x] All 12+ core workflows tested manually
- [x] Edge cases tested
- [x] No critical bugs found (or fixed)
- [x] Performance validated
- [x] Accessibility verified (keyboard, screen reader)
- [x] Mobile testing completed (iPhone if available)
- [x] Bug report(s) documented (if any)
- [x] Final approval: "Ready for friends"
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
- `docs/testing/TEST_PLAN_4.2.md` - Comprehensive test plan
- `docs/testing/BUG_REPORT_4.2.md` - Bug documentation

**Files NOT to Modify:**
- No code changes for this story
- Testing is manual verification only

---

## 🔄 Change Log

- Created: 2026-01-27
- Status: Draft
- Next: Ready for @dev implementation (manual testing phase)

---

**Epic Reference:** EPIC-002: Stabilization for Friends
**Created by:** River (Scrum Master)
**Date:** 2026-01-27
