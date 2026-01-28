# Story 3.6 - Implementation Plan (Approved)

**Date**: 2026-01-27
**Status**: Approved - Ready for Implementation
**Approver**: User
**Agent**: Claude Code

---

## Approved Strategy

### Decision Matrix

| Decision | Option | Rationale |
|----------|--------|-----------|
| **1. Order** | Impact Order (A) | Start with critical blocker (StatusBadge = +15 pts), then quick wins (ARIA = +10 pts) |
| **2. StatusBadge** | Reusable Component (A) | Only 15 min extra, enables reuse across Dashboard/Backlog/Settings |
| **3. Graph Nav** | Assistive-Only (B) | Skip complex keyboard navigation, reach 85-90 with screen reader support |
| **4. Scope** | Reduced (B) | 3 pages guaranteed 95+ > 4 pages risk of failure |

---

## Implementation Timeline

### Phase 1: Critical Blocker (60 min)
**Task 3.6.2: Create StatusBadge Component**

```
⏱️ 60 minutes total

Step 1: Design StatusBadge (5 min)
  - Input: status ('concluído' | 'estudando' | 'revisando' | 'estudar')
  - Input: label (Portuguese text)
  - Input: icon (Lucide React icon)
  - Output: <div> with icon + color + text

Step 2: Implement Component (15 min)
  - File: src/components/dashboard/StatusBadge.tsx
  - Use COLORS tokens for consistency
  - Support 4 status types with correct colors + icons
  - Add accessibility: role, aria-label if needed

Step 3: Update Dashboard Components (25 min)
  - ChapterView.tsx: Replace color-only status badges
  - BacklogPanel.tsx: Replace status indicators
  - Import and use StatusBadge throughout

Step 4: Test (15 min)
  - Visual check: all 4 status types display correctly
  - Color + Icon + Text visible on each
  - Responsive on mobile
```

**Expected Output**: Dashboard + Backlog now show accessible status indicators
**Lighthouse Impact**: +15 points (estimated 75-80 → 90-95)

---

### Phase 2: Quick Wins (45 min)
**Task 3.6.3-4: ARIA Labels + Alt Text**

```
⏱️ 45 minutes total

Step 1: ARIA Labels on Buttons (25 min)
  - Delete button (StudyPageClient.tsx): aria-label="Deletar estudo"
  - Edit button (ChapterView.tsx): aria-label="Editar capítulo"
  - Delete icons (BacklogPanel.tsx): aria-label="Deletar item do backlog"
  - Graph zoom buttons (grafo/page.tsx): aria-label="Aumentar zoom", etc.

  Total: 8 buttons → 25 min (3 min each)

Step 2: Alt Text + Form Labels (20 min)
  - Add alt="" to decorative images
  - Verify form inputs have associated <label> tags
  - Check Settings page: email, password fields have labels
```

**Expected Output**: All icon-only buttons now accessible to screen readers
**Lighthouse Impact**: +10 points (estimated 90-95 → 95+)

---

### Phase 3: Modal Focus (30 min)
**Task 3.6.5: Focus Management**

```
⏱️ 30 minutes total

Step 1: Focus Trap in Modal (15 min)
  - File: src/components/ui/DeleteConfirmModal.tsx
  - Keep focus inside modal while open
  - Tab cycles between buttons (Cancel → Delete → Cancel...)

Step 2: Keyboard & Focus Restore (15 min)
  - Add onKeyDown handler: Escape key closes modal
  - Restore focus to trigger button after modal closes
  - Test on both Desktop + iPad
```

**Expected Output**: Modal meets WCAG focus requirements
**Lighthouse Impact**: +5 points (maintaining 95+)

---

### Phase 4: Validation (50 min)
**Task 3.6.6-7: Testing + Final Audit**

```
⏱️ 50 minutes total

Step 1: Screen Reader Testing (30 min)
  - Test VoiceOver on Mac/iPad
  - Verify all labels are read correctly
  - Check semantic HTML structure
  - Navigation between elements works

Step 2: Lighthouse Final Audit (20 min)
  - Run Lighthouse accessibility audit on all 3 pages
  - Dashboard: target >= 95
  - Editor: target >= 95
  - Settings: target >= 95
  - Document final scores
```

**Expected Output**: All 3 pages at 95+ Lighthouse score
**Final Deliverable**: Accessibility audit complete, compliant with WCAG AA

---

## Scope Details

### IN SCOPE (3 Pages → 95+)
✅ **Dashboard (/)**
  - StatusBadge component (icon + text + color)
  - ARIA labels on buttons
  - Keyboard navigation working
  - Contrast ratios OK
  - Screen reader friendly

✅ **Editor (/estudo/[id])**
  - Delete button aria-label
  - Focus management in modal
  - Escape key to close
  - Keyboard shortcuts (Ctrl+Z)

✅ **Settings (/settings)**
  - Form labels proper
  - Input accessibility
  - Focus visible on fields
  - Keyboard navigation

### OUT OF SCOPE (Defer to Story 3.7)
⏸️ **Graph (/grafo)**
  - Complex keyboard navigation (arrow keys, Enter)
  - Node tabindex management
  - Accessible graph legend
  - Will do "Assistive-Only" (screen reader support only)
  - Can reach 80-85 without full keyboard nav
  - Full keyboard nav deferred to Story 3.7

---

## Files to Modify

**Priority Order**:

1. ✨ **NEW**: `src/components/dashboard/StatusBadge.tsx`
   - Create reusable status component

2. **MODIFY**: `src/components/dashboard/ChapterView.tsx`
   - Use StatusBadge instead of color-only badges
   - Add aria-label to edit button

3. **MODIFY**: `src/components/dashboard/BacklogPanel.tsx`
   - Use StatusBadge for status display
   - Add aria-label to delete icons

4. **MODIFY**: `src/app/estudo/[id]/StudyPageClient.tsx`
   - Add aria-label to delete button

5. **MODIFY**: `src/components/ui/DeleteConfirmModal.tsx`
   - Implement focus trap
   - Add Escape key handler
   - Focus restore after close

6. **REVIEW**: `src/components/grafo/page.tsx`
   - Add aria-labels to zoom buttons (but skip keyboard nav for now)

7. **VERIFY**: `src/app/settings/page.tsx`
   - Check form labels are properly associated
   - No changes likely needed

---

## Testing Checklist

### Phase 1 (StatusBadge)
- [ ] Component renders correctly for 4 status types
- [ ] Icon + color + text all visible
- [ ] Responsive on mobile/tablet
- [ ] Color meets contrast ratio

### Phase 2 (ARIA + Alt Text)
- [ ] All icon-only buttons have aria-labels
- [ ] Alt text added to decorative images
- [ ] Form inputs have associated labels
- [ ] Screen reader can read all content

### Phase 3 (Focus Management)
- [ ] Focus stays inside modal while open
- [ ] Escape key closes modal
- [ ] Focus returns to trigger button after close
- [ ] Tab cycles through modal buttons

### Phase 4 (Final Validation)
- [ ] Dashboard Lighthouse >= 95
- [ ] Editor Lighthouse >= 95
- [ ] Settings Lighthouse >= 95
- [ ] VoiceOver tested on Mac/iPad
- [ ] Keyboard navigation Tab/Shift+Tab works
- [ ] No "keyboard trap" (can always escape)

---

## Lighthouse Target

### Current Estimates (Pre-Implementation)
- Dashboard: 75-80
- Editor: 85-90
- Settings: 80-85
- **Average: 80-85**

### Expected After Implementation
- Dashboard: 95+
- Editor: 95+
- Settings: 95+
- **Average: 95+**

### Graph (Deferred)
- Current: 70-75
- After Assistive-Only: 80-85 (defer keyboard nav to Story 3.7)

---

## Decision: Graph Scope

**Decision**: Assistive-Only for Graph (B option chosen)

**Rationale**:
- Complex component (react-force-graph-2d library)
- Keyboard navigation requires significant refactoring
- Screen reader support already valuable
- Can reach 80-85 Lighthouse without full keyboard nav
- Full keyboard nav: future Story 3.7 with dedicated time

**Acceptable Trade-off**:
- Users with screen readers: ✅ Supported
- Users with keyboard only: ⚠️ Limited (use mouse fallback)
- Mobile users: ✅ Touch works fine
- Visual users: ✅ Graph fully functional

**Future**:
- Story 3.7: "Graph Keyboard Navigation" (tabindex, arrow keys, Enter)
- Full accessibility for all interaction modes

---

## Git Commits Plan

```
1. feat(accessibility): create StatusBadge component
   - Reusable component with icon + text + color
   - 4 status types: concluído, estudando, revisando, estudar
   - WCAG AA compliant

2. refactor(dashboard): use StatusBadge component
   - Update ChapterView
   - Update BacklogPanel
   - Remove color-only indicators

3. a11y(buttons): add aria-labels to icon-only buttons
   - Delete buttons
   - Edit buttons
   - Zoom controls

4. a11y(forms): add labels and alt text
   - Form input labels
   - Alt text for decorative images

5. a11y(modal): implement focus trap and keyboard handling
   - Focus trap in DeleteConfirmModal
   - Escape key to close
   - Focus restore

6. test(a11y): final accessibility audit
   - Lighthouse >= 95 on 3 pages
   - Screen reader testing
   - Keyboard navigation testing
```

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| StatusBadge breaks existing style | Low | Medium | Test all 4 states, compare with old design |
| Focus trap implementation bugs | Low | Medium | Simple implementation, tested libraries available |
| Graph refactor causes regression | Low | Medium | Only changing labels, not graph logic |
| Screen reader doesn't read labels | Very Low | High | Use standard ARIA, test with VoiceOver |

---

## Success Criteria

✅ **All 3 Pages at 95+ Lighthouse**
- Dashboard: 95+
- Editor: 95+
- Settings: 95+

✅ **WCAG AA Compliance Verified**
- All color indicators have icon + text
- All buttons have accessible names
- Keyboard navigation works (Tab/Escape)
- Screen reader friendly

✅ **No Regressions**
- Build passes
- Existing features still work
- No layout breaks

✅ **Ready for Production**
- Commit to main
- Document findings
- Plan Graph work for Story 3.7

---

**Next Step**: Implement Task 3.6.2 (StatusBadge Component) ⏱️ 60 minutes
