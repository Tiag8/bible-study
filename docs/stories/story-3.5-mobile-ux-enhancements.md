# Story 3.5: Mobile UX Enhancements

**Story ID:** 3.5
**Epic:** EPIC-002 (Stabilization for Friends)
**Points:** 3
**Status:** 📋 Draft
**Priority:** P0 (Core Stabilization)
**Sprint:** Sprint 3 (Core Stabilization)

---

## 📖 Story

As a mobile user (iPhone/iPad), I want Bible Study to feel native on mobile with no broken layouts, responsive menus, and working touch interactions so that I can study comfortably on my phone without frustration.

---

## 🎯 Acceptance Criteria

- [ ] **BubbleMenu Responsive & Repositions**
  - BubbleMenu works on phone screens (< 600px width)
  - Menu automatically repositions if near viewport edge
  - Menu stays within viewport (no overflow)
  - Touch-friendly spacing between options
  - Tested on iPhone (375px width)

- [ ] **No Horizontal Scrolling**
  - Content fits within viewport width on all screen sizes
  - Tables, images, code blocks don't cause horizontal scroll
  - Editor content wraps properly
  - Sidebar doesn't overflow on mobile

- [ ] **Touch Targets Minimum 44x44px**
  - All buttons, links, interactive elements >= 44px square
  - Minimum spacing between touch targets
  - No tiny icons or compressed buttons on mobile
  - Tested on iPhone touch interactions

- [ ] **Input Fields Not Hidden by Keyboard**
  - When mobile keyboard opens, focused input scrolls into view
  - BubbleMenu dismisses when keyboard opens (optional but recommended)
  - Textarea in editor accessible with keyboard open
  - No content permanently hidden

- [ ] **Responsive Layouts**
  - Dashboard responsive (grid adapts to screen size)
  - Backlog panel works on mobile (drawer or modal)
  - Editor full-screen on mobile (hide sidebar if present)
  - Grafo readable on iPad (zoom possible)

- [ ] **Mobile Browser Performance**
  - Page loads quickly on mobile networks
  - No janky scrolling or animations
  - Smooth touch interactions
  - Battery-friendly (no excessive animations)

---

## 📝 Tasks

- [ ] **3.5.1** Audit current BubbleMenu on mobile (iPhone 375px)
- [ ] **3.5.2** Fix BubbleMenu repositioning (near viewport edge)
- [ ] **3.5.3** Verify all touch targets >= 44x44px
- [ ] **3.5.4** Test input keyboard behavior (no hidden fields)
- [ ] **3.5.5** Check responsive layouts (dashboard, editor, graph)
- [ ] **3.5.6** Verify no horizontal scrolling on mobile
- [ ] **3.5.7** Test on iPad (landscape orientation)
- [ ] **3.5.8** Performance testing (mobile network conditions)

---

## 🔧 Dev Notes

**Device Testing (User Configuration):**
- iPhone: Required (375px width test device)
- iPad: Required (landscape + portrait)
- Android: Not required (iOS focus for now)

**Responsive Breakpoints to Test:**
- Mobile: 320px - 600px
- Tablet: 600px - 1024px
- Desktop: 1024px+

**BubbleMenu Issues to Fix:**
- Current: May overflow on small screens
- Fix: Detect viewport position, reposition horizontally if near edge
- Fallback: Clamp to viewport if repositioning insufficient

**Touch Targets Audit:**
- Buttons in toolbar: Check size
- Icon buttons: Must have >= 44x44px hit area
- Form inputs: Label + input must be easy to tap
- Close buttons (modals): Must be large enough

**Input Keyboard Handling:**
```typescript
// Example: Auto-scroll to focused input on mobile
const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
  if (isMobile()) {
    e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};
```

**Responsive Design Pattern:**
- Use TailwindCSS breakpoints: `sm:`, `md:`, `lg:`
- Test on actual devices (iPhone + iPad)
- Consider viewport meta tag (already in HTML)

**Related Stories:**
- Story 3.6: Accessibility (touch targets already meet WCAG)
- Story 3.7: Toast positioning on mobile
- Story 3.8: Editor keyboard on mobile

**Browser Testing:**
- iOS Safari (primary for iPhone/iPad)
- Chrome mobile (for testing)

---

## 🎨 Mobile Layout Examples

**Dashboard on Mobile:**
```
┌─────────────────────┐
│ ☰  Bible Study  ⚙   │  (Hamburger menu)
├─────────────────────┤
│ [Search bar]        │
│ 📖 Genesis          │
│ 📖 Exodus           │
│ 📖 Leviticus        │  (Vertical grid, 1 column)
│ 📖 Numbers          │
│ 📖 Deuteronomy      │
├─────────────────────┤
│ [Backlog Modal]     │
└─────────────────────┘
```

**Editor on Mobile:**
```
┌─────────────────────┐
│ < Genesis 1:1    ✓  │  (Full width, no sidebar)
├─────────────────────┤
│ [Toolbar buttons]   │  (Horizontal scroll if needed)
├─────────────────────┤
│                     │
│ (Editor textarea)   │  (Full width, keyboard-friendly)
│                     │
└─────────────────────┘
```

**BubbleMenu Repositioning:**
```
Old: BubbleMenu fixed at selection point
     ├─ May overflow on small screen
     └─ Hard to interact with

New: BubbleMenu repositions
     ├─ Near left edge: Move right
     ├─ Near right edge: Move left
     ├─ Near bottom: Move up
     └─ Always stays in viewport
```

---

## 📊 P1 Debt Reference

Maps to: **FE-09 (BubbleMenu responsive)** from EPIC-001

---

## 🔒 CodeRabbit Integration

**Pre-commit Check:**
- [ ] Run: `wsl bash -c 'cd /mnt/c/.../@synkra/aios-core && ~/.local/bin/coderabbit --prompt-only -t uncommitted'`
- [ ] CRITICAL issues: 0 (block story completion)
- [ ] HIGH issues: Document in Dev Notes

**Focus Areas for Review:**
- Mobile responsiveness: CSS, media queries
- Touch interactions: No hover-only buttons
- Performance: No excessive re-renders on mobile
- Accessibility: Touch targets meet 44x44px minimum
- Keyboard: Input scrolling, no hidden fields

---

## ✅ Definition of Done

- [x] All acceptance criteria met
- [x] Tested on iPhone (375px - actual device or emulator)
- [x] Tested on iPad (landscape + portrait)
- [x] BubbleMenu repositions correctly
- [x] No horizontal scrolling detected
- [x] All touch targets >= 44x44px
- [x] Keyboard doesn't hide inputs
- [x] Performance acceptable on mobile network
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
- `src/components/Editor/BubbleMenu.tsx` - Fix repositioning logic
- `src/components/dashboard/*.tsx` - Ensure responsive layouts
- `src/components/Editor/TiptapEditor.tsx` - Full-screen mobile, keyboard handling
- `src/app/page.tsx` - Responsive grid for dashboard
- `src/app/grafo/page.tsx` - Pinch zoom for iPad
- Responsive CSS: Review all `sm:`, `md:`, `lg:` breakpoints

**Files NOT to Modify:**
- Design tokens (already mobile-friendly)
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
