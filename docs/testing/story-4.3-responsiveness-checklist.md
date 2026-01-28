# Story 4.3: References Sidebar - Responsiveness Testing Checklist

**Test Date:** 2026-01-29
**Tester:** @dev
**Device Coverage:** Desktop, Tablet, Mobile

---

## 📱 Desktop Testing (1920px, 1440px, 1024px)

### 1024px (iPad landscape / Small desktop)
- [ ] **Layout**
  - [ ] Sidebar width is 320px (w-80)
  - [ ] Sidebar visible on right side
  - [ ] Editor content properly constrained
  - [ ] No horizontal scrollbar
  - [ ] FAB hidden (md: breakpoint)
  - [ ] Close button hidden in header

- [ ] **References List**
  - [ ] Reference cards display correctly
  - [ ] Grip handle (GripVertical) visible
  - [ ] Up/Down/Delete buttons visible and clickable
  - [ ] Title truncates with line-clamp-1
  - [ ] Book info displays (Genesis 1)
  - [ ] Drag-and-drop works smoothly

- [ ] **States**
  - [ ] Loading skeleton shows 3 placeholders
  - [ ] Empty state shows emoji 📚 + text
  - [ ] Error state shows AlertTriangle + retry button
  - [ ] Hover states visible (bg-white)
  - [ ] Drag state shows blue background + shadow

- [ ] **Interaction**
  - [ ] Add button works (+ icon)
  - [ ] Delete confirmation modal displays
  - [ ] Modal buttons have proper spacing
  - [ ] Keyboard navigation (Tab, Enter, Escape)
  - [ ] Focus rings visible (blue ring)

### 1440px (Standard desktop)
- [ ] Same tests as 1024px
- [ ] Sidebar positioned correctly with full width
- [ ] No layout shifts when content loads
- [ ] Sidebar collapse/expand toggle works
- [ ] Performance: References load < 500ms

### 1920px (Large desktop)
- [ ] Same tests as above
- [ ] Content doesn't stretch excessively
- [ ] Sidebar stays 320px width
- [ ] Proper spacing on ultra-wide screens

---

## 📲 Tablet Testing (768px iPad)

### Layout & Visibility
- [ ] **Sidebar Hidden by Default**
  - [ ] Sidebar not visible initially (hidden md:flex)
  - [ ] FAB visible at bottom-right (ChevronDown icon)
  - [ ] FAB size is appropriate (48x48px)
  - [ ] FAB has proper shadow (shadow-lg)

- [ ] **Drawer Pattern**
  - [ ] Clicking FAB opens sidebar as drawer
  - [ ] Sidebar positioned fixed on left (w-80)
  - [ ] Overlay backdrop appears (z-30, bg-black/50)
  - [ ] Clicking overlay closes drawer
  - [ ] Close button (X) in header visible
  - [ ] Smooth transition animation

- [ ] **Content Area**
  - [ ] Editor takes full width when drawer closed
  - [ ] Editor doesn't shift when drawer opens
  - [ ] Drawer slides in from left smoothly

### References Display
- [ ] Reference cards display in drawer
- [ ] Grip handle works (drag-and-drop)
- [ ] Up/Down/Delete buttons clickable
- [ ] All functionality same as desktop
- [ ] Touch targets >= 44px

### States
- [ ] Loading skeleton fits drawer width
- [ ] Empty state displays in drawer
- [ ] Error state with retry button works
- [ ] Modal pops over drawer correctly

### Interaction
- [ ] FAB responds to tap
- [ ] Overlay closes on tap
- [ ] Close (X) button closes drawer
- [ ] Add button opens modal in drawer
- [ ] Delete modal displays full-screen
- [ ] Keyboard works (Escape to close)

---

## 📱 Mobile Testing (375px, 667px)

### iPhone SE (375px)
- [ ] **Layout**
  - [ ] No horizontal scrolling
  - [ ] Content fits in viewport
  - [ ] Font sizes readable (not too small)
  - [ ] Buttons clickable without zoom
  - [ ] FAB visible and tappable

- [ ] **References Sidebar**
  - [ ] Sidebar hidden by default
  - [ ] Drawer width fills screen minus padding
  - [ ] Overlay covers entire viewport
  - [ ] Close button prominent and tappable
  - [ ] Reference cards display fully

- [ ] **Touch Targets**
  - [ ] FAB: 48x48px minimum
  - [ ] Buttons: 44x44px minimum
  - [ ] No touch target conflicts
  - [ ] Proper spacing between buttons

- [ ] **Interactions**
  - [ ] TAP FAB → Drawer opens
  - [ ] TAP X button → Drawer closes
  - [ ] TAP overlay → Drawer closes
  - [ ] TAP Add button → Modal opens
  - [ ] TAP Delete → Confirmation modal
  - [ ] SWIPE right → Drawer closes (optional)

### iPhone 11 (667px)
- [ ] Same tests as iPhone SE
- [ ] More breathing room, check spacing
- [ ] Modal buttons clearly separated

### Landscape Mode (mobile)
- [ ] [ ] Layout still responsive
- [ ] [ ] FAB not obscured
- [ ] [ ] Drawer still accessible
- [ ] [ ] No content cutoff

---

## ⌨️ Keyboard Navigation

### Desktop
- [ ] **Tab Navigation**
  - [ ] Tab order logical (LTR, top-to-bottom)
  - [ ] Focus rings visible (blue ring)
  - [ ] No focus traps
  - [ ] Skip to content link (if applicable)

- [ ] **Modal Navigation**
  - [ ] Tab inside modal only
  - [ ] Focus trap active
  - [ ] Escape closes modal
  - [ ] Enter activates buttons

- [ ] **References List**
  - [ ] Tab through reference cards
  - [ ] Tab through grip handle → up → down → delete
  - [ ] Arrow keys work (if keyboard accessible)
  - [ ] Enter activates drag (if applicable)

### Mobile
- [ ] Focus visible when using keyboard
- [ ] Escape key closes modals/drawer
- [ ] Enter key activates buttons

---

## 🎨 Visual Design

### Colors & Contrast
- [ ] **Text Contrast**
  - [ ] Dark text on light: >= 4.5:1
  - [ ] Light text on dark: >= 4.5:1
  - [ ] Error text (red): Sufficient contrast
  - [ ] Muted text (gray): >= 3:1

- [ ] **Focus States**
  - [ ] Focus ring color: Blue (focus:ring-2 focus:ring-blue-500)
  - [ ] Focus ring offset visible
  - [ ] Doesn't obscure content

- [ ] **Hover States**
  - [ ] Reference card: Light gray (hover:bg-white)
  - [ ] Buttons: Darker shade (hover:bg-gray-200)
  - [ ] Links: Underline (hover:underline)

### Spacing
- [ ] Padding: 16px (p-4) in sidebar
- [ ] Gap between items: 8px (space-y-2)
- [ ] Gap between buttons: 4px (gap-1)
- [ ] Mobile padding appropriate (not cramped)

### Typography
- [ ] Title: Bold, readable
- [ ] Book info: Smaller, muted color
- [ ] Error messages: Clear, actionable
- [ ] Empty state: Centered, with emoji

---

## 🔄 Loading States

### Skeleton Loader
- [ ] [ ] 3 placeholder cards
- [ ] [ ] Animation smooth (animate-pulse)
- [ ] [ ] Proper height/width
- [ ] [ ] Gray bars (bg-gray-300)
- [ ] [ ] Skeleton disappears when loaded

### Error State
- [ ] AlertTriangle icon visible (red)
- [ ] Error message clear and helpful
- [ ] Retry button prominent (red-600)
- [ ] Spinner shows while retrying
- [ ] Button disables during retry

### Empty State
- [ ] Emoji 📚 displays
- [ ] Text: "Nenhuma referência ainda"
- [ ] Subtext: "Adicione referências para conectar estudos"
- [ ] Centered in viewport
- [ ] Helpful and not confusing

---

## ♿ Accessibility

### Screen Reader
- [ ] [ ] All buttons have aria-label (Portuguese)
- [ ] [ ] Modal has role="alertdialog"
- [ ] [ ] Modal has aria-modal="true"
- [ ] [ ] Modal has aria-labelledby and aria-describedby
- [ ] [ ] Toggle button has aria-expanded
- [ ] [ ] Loading state has role="status"
- [ ] [ ] Icons have aria-hidden="true"

### Touch & Motor
- [ ] All buttons >= 44x44px
- [ ] Proper spacing (no accidental taps)
- [ ] Drag handle clearly identifiable
- [ ] Drag feedback visual (color change)
- [ ] Delete requires confirmation (prevents accidents)

### Cognitive
- [ ] Labels are clear and in Portuguese
- [ ] Actions are undoable when possible
- [ ] Error messages are helpful
- [ ] No auto-playing animations
- [ ] Modals clearly labeled

---

## 📊 Performance

### Load Time
- [ ] Sidebar loads within 500ms
- [ ] Add modal opens within 300ms
- [ ] References rendered without jank
- [ ] No layout shift (CLS < 0.1)

### Interactions
- [ ] Drag-and-drop is smooth
- [ ] No "jank" during scroll
- [ ] Delete animation smooth
- [ ] Modal opens without delay

### Mobile Performance
- [ ] FAB visible immediately
- [ ] Drawer opens smoothly
- [ ] No stutter on animation

---

## 🐛 Bug Checklist

- [ ] No console errors
- [ ] No TypeScript errors
- [ ] No ESLint warnings (in components)
- [ ] No unused imports
- [ ] No memory leaks (DevTools)

---

## ✅ Sign-Off

- **Tester:** ________________
- **Date:** ________________
- **Notes:**
  ```
  [Add any issues or special observations here]
  ```

**Status:** [ ] PASS [ ] FAIL (if FAIL, list blockers below)

### Blockers (if FAIL):
1. [ ] Issue 1: _______
2. [ ] Issue 2: _______
3. [ ] Issue 3: _______
