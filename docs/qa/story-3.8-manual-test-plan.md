# Story 3.8 - Manual Test Plan

**Story:** Undo/Redo + Data Validation
**Date:** 2026-01-27
**Tester:** (To be filled)
**Status:** Ready for Testing

---

## ✅ Automated Tests (PASSED)

All logic tests and integration tests passed:

- ✅ History extension configured with depth: 5
- ✅ EditorHandle interface with undo/redo methods
- ✅ Undo button with proper handlers
- ✅ Content validation logic (6/6 test cases passed)
- ✅ Undo state tracking (all transitions correct)
- ✅ Build successful
- ✅ Dev server running

---

## 📋 Manual Test Plan

### **Task 3.8.5: Test on Chrome Desktop**

#### Prerequisites
- [ ] Chrome browser open
- [ ] App running on http://localhost:3000
- [ ] Logged in to Bible Study app
- [ ] Open or create a study

#### Test Cases

**TC 3.8.5.1: Undo Button Visibility**
- [ ] Click on a study to open editor
- [ ] Observe toolbar (next to Save button)
- [ ] Expected: Undo button with Undo2 icon is visible
- [ ] Expected: Button is DISABLED initially (no changes yet)
- [ ] Result: ☐ PASS ☐ FAIL

**TC 3.8.5.2: Undo Button Enablement**
- [ ] Type any text in the editor: "Hello"
- [ ] Expected: Undo button becomes ENABLED (not grayed out)
- [ ] Result: ☐ PASS ☐ FAIL

**TC 3.8.5.3: Click Undo Button**
- [ ] Keep text "Hello" in editor
- [ ] Click Undo button in toolbar
- [ ] Expected: Text "Hello" is removed/reverted
- [ ] Expected: Editor shows previous state (empty or original content)
- [ ] Result: ☐ PASS ☐ FAIL

**TC 3.8.5.4: Keyboard Shortcut Ctrl+Z**
- [ ] Type new text: "World"
- [ ] Press Ctrl+Z (Windows) or Cmd+Z (Mac)
- [ ] Expected: Text "World" is removed
- [ ] Expected: Editor reverts to previous state
- [ ] Result: ☐ PASS ☐ FAIL

**TC 3.8.5.5: Max 5 Steps History**
- [ ] Clear editor (or reload)
- [ ] Type: "1" then press Ctrl+Z
- [ ] Type: "12" then press Ctrl+Z
- [ ] Type: "123" then press Ctrl+Z
- [ ] Type: "1234" then press Ctrl+Z
- [ ] Type: "12345" then press Ctrl+Z
- [ ] Type: "123456" then press Ctrl+Z
- [ ] Type: "1234567" then press Ctrl+Z
- [ ] Expected: Cannot undo past 5 steps (only goes back to "1234567")
- [ ] Result: ☐ PASS ☐ FAIL

**TC 3.8.5.6: Empty Content Validation**
- [ ] Click Save button with empty editor
- [ ] Expected: Toast error message appears: "Estudo não pode estar vazio"
- [ ] Expected: Study is NOT saved
- [ ] Result: ☐ PASS ☐ FAIL

**TC 3.8.5.7: Whitespace-Only Validation**
- [ ] Type spaces only: "     "
- [ ] Click Save button
- [ ] Expected: Toast error message: "Estudo não pode estar vazio"
- [ ] Expected: Study is NOT saved
- [ ] Result: ☐ PASS ☐ FAIL

**TC 3.8.5.8: Valid Content Saves**
- [ ] Type: "Hello World"
- [ ] Click Save button
- [ ] Expected: Toast success message: "Salvo com sucesso!"
- [ ] Expected: Study is saved to database
- [ ] Result: ☐ PASS ☐ FAIL

---

### **Task 3.8.6: Test on iPad with Keyboard**

#### Prerequisites
- [ ] iPad with external keyboard
- [ ] App loaded on http://localhost:3000 (or production URL)
- [ ] Logged in
- [ ] Study opened in editor

#### Test Cases

**TC 3.8.6.1: Undo Button Visible on iPad**
- [ ] Look at toolbar
- [ ] Expected: Undo button visible (responsive layout on iPad)
- [ ] Result: ☐ PASS ☐ FAIL

**TC 3.8.6.2: Keyboard Shortcut Cmd+Z (iPad Magic Keyboard)**
- [ ] Type text: "iPad Test"
- [ ] Press Cmd+Z (via keyboard)
- [ ] Expected: Text "iPad Test" is undone
- [ ] Result: ☐ PASS ☐ FAIL

**TC 3.8.6.3: Touch Undo Button**
- [ ] Type text: "Touch Test"
- [ ] Tap Undo button on screen
- [ ] Expected: Text "Touch Test" is undone
- [ ] Result: ☐ PASS ☐ FAIL

**TC 3.8.6.4: Responsive Layout Check**
- [ ] Toolbar should display properly on iPad (12.9" and 10.2" if possible)
- [ ] Undo button should be easily clickable (44px+ touch target)
- [ ] Expected: No layout issues or overflow
- [ ] Result: ☐ PASS ☐ FAIL

---

## 📊 Test Summary

**Chrome Desktop:**
- Total Test Cases: 8
- Passed: __ / 8
- Failed: __ / 8

**iPad with Keyboard:**
- Total Test Cases: 4
- Passed: __ / 4
- Failed: __ / 4

**Overall Result:**
- ☐ ALL TESTS PASSED ✅
- ☐ SOME TESTS FAILED ⚠️
- ☐ CRITICAL FAILURES ❌

---

## 📝 Observations & Notes

(To be filled during testing)

### Chrome Desktop:
- Notes:
- Issues found:
- Screenshots:

### iPad:
- Notes:
- Issues found:
- Screenshots:

---

## 🎯 Sign-Off

**Tester Name:** ________________
**Date:** ________________
**Result:** ☐ Ready for Merge ☐ Needs Fixes ☐ Blocked

**Comments:**


---

**Related Story:** Story 3.8 (Undo/Redo + Data Validation)
**Epic:** EPIC-002 (Stabilization for Friends)
