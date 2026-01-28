# Bug Analysis: Internal Links Feature

**Critical Bug Found**: Internal links are not navigable after merge

---

## Bug Summary

| Field | Value |
|-------|-------|
| **Bug ID** | BUG-001-INTERNAL-LINKS-NO-NAV |
| **Severity** | 🔴 **CRITICAL** - Feature doesn't work |
| **Status** | 🔴 **OPEN** |
| **Found** | 2026-01-27 (QA testing) |
| **Root Cause** | Missing `onClick` handler for links |
| **Impact** | Feature is 100% non-functional |
| **Lines of Code Affected** | 1-3 lines missing |
| **Effort to Fix** | 15-30 minutes |

---

## Bug Description

### What's Broken

Users can create internal links between studies (via "Referenciar" button), but **clicking the links does nothing**.

### Current Behavior

1. ✅ User selects text in editor
2. ✅ User clicks "Referenciar" button
3. ✅ User chooses another study from list
4. ✅ Link is created with correct `href="bible-graph://study/{uuid}"`
5. ✅ Link is saved to database
6. ✅ Link persists after reload
7. 🔴 **User clicks link → NOTHING HAPPENS**
   - No navigation
   - No error message
   - No browser action

### Expected Behavior

1. User clicks link
2. Page navigates to `/estudo/{target-study-uuid}`
3. Target study content loads
4. Breadcrumb updates
5. URL in address bar changes

---

## Root Cause Analysis (RCA)

### Why Did This Happen?

**Layer 1: UI/UX**
- Tiptap renders links as `<a href="bible-graph://study/123">text</a>`
- CSS styles them (blue color, underline) ✅
- **MISSING**: JavaScript handler to intercept clicks

**Layer 2: Architecture**
- No event listener on editor for `<a>` clicks
- No protocol handler for `bible-graph://` scheme
- No router integration to convert `bible-graph://study/123` → `/estudo/123`

**Layer 3: Development Process**
- **NO E2E TESTS** - Would have caught this immediately
- **NO MANUAL TESTING** - QA didn't test feature before merge
- **NO CODE REVIEW** - Reviewer didn't catch incomplete implementation
- **NO DEFINITION OF DONE** - Team didn't have checklist

---

## Evidence

### Code Review

**File**: `src/app/globals.css` (lines 85-93)
```css
.tiptap a {
  color: #3b82f6;           /* ✅ Color */
  text-decoration: underline; /* ✅ Underline */
  cursor: pointer;          /* ✅ Pointer cursor */
}

.tiptap a:hover {
  color: #2563eb;           /* ✅ Hover color */
}
/* ❌ MISSING: onClick handler or JavaScript listener */
```

**File**: `src/components/Editor/BubbleMenu/useBubbleMenuHandlers.ts` (line 54-69)
```typescript
const handleReference = useCallback((studyId: string, studyTitle: string) => {
  const referenceUrl = `bible-graph://study/${studyId}`;  // ✅ URL created
  editor
    .chain()
    .focus()
    .extendMarkRange("link")
    .setLink({ href: referenceUrl, target: "_self" })    // ✅ Link set
    .run();
  // ❌ MISSING: Router integration to handle clicks on this link
}, [editor, setSearchQuery, setMode]);
```

**File**: `src/app/estudo/[id]/StudyPageClient.tsx` (line 835-843)
```typescript
<Editor
  ref={editorRef}
  initialContent={study?.content || ""}
  onChange={handleContentChange}
  onUndoRedoChange={(canUndo) => setCanUndo(canUndo)}
/>
{/* ❌ MISSING: Link handler for editor */}
```

### Manual Test Results

**Test**: Click internal link
**Result**: ❌ FAIL - Click is ignored

**Browser DevTools**:
- Click event FIRES (can see in event listener breakpoints)
- BUT no handler attached to link
- Link href is `bible-graph://study/123` (custom protocol)
- Browser doesn't know what to do with custom protocol

### Database

**Query**: Check if link is saved
```sql
SELECT id, source_study_id, target_study_id, created_at
FROM bible_study_links
WHERE source_study_id = 'uuid-a' AND user_id = 'user-id';
```

**Result**: ✅ Link exists in database
- Proves creation works
- Proves persistence works
- Only navigation broken

---

## Impact Analysis

### What Works ✅
- Creating links (UI + backend)
- Saving links to database
- Loading links from database
- Displaying links in editor
- Styling links visually

### What's Broken 🔴
- **Navigation** (THE ENTIRE POINT)
- User can't use the feature at all

### Severity

**Score**: 10/10 (CRITICAL)

**Why**:
- Feature is 100% non-functional
- Deployed to production (merged to main)
- Users will create links expecting them to work
- No workaround for end users
- Violates feature contract

---

## Why Tests Would Have Caught This

### E2E Test Example (Would FAIL)

```typescript
test('clicking internal link navigates to target study', async ({ page }) => {
  // Setup: Create link
  // ...

  // Action: Click link
  const link = page.locator('a[href*="bible-graph"]');
  await link.click();

  // Assert: Should navigate
  await expect(page).toHaveURL(/\/estudo\//);  // ❌ FAILS

  // Would catch bug immediately
});
```

**Without test**: Bug made it to production
**With test**: Bug caught before merge

### Manual Test Checklist (Would Have Found)

```
TC 1.2: Click Internal Link
[ ] Setup: Link created
[ ] Action: Click link
[ ] Expected: Navigate to target study
[ ] ACTUAL: ❌ Nothing happens
[ ] PASS/FAIL: FAIL

→ Would block merge
```

---

## Reproduction Steps (For Testing Fix)

### Setup
1. Create user account and login
2. Create Study A: "Gênesis 1"
3. Create Study B: "Êxodo 1"
4. Navigate to Study A

### Reproduction
1. Click in editor
2. Type: "Este versículo também em Êxodo"
3. Select text "Êxodo"
4. Click "Referenciar" button
5. Type "Êxodo" in search
6. Click "Êxodo 1" in list
7. Link is now blue and underlined in text

### Observation
8. **Click link**
9. **Expected**: Navigate to `/estudo/{uuid-exodo-1}`
10. **Actual**: Nothing happens ❌

---

## Fix Implementation

### Solution Approach

Add event listener on editor to intercept `bible-graph://` protocol clicks

### Implementation Steps

**Step 1**: Create link handler utility
**File**: `src/lib/link-handler.ts`

```typescript
import { NextRouter } from 'next/router';
import { toast } from 'sonner';

export function initializeInternalLinks(
  router: NextRouter,
  user_id: string | undefined
) {
  const handleLinkClick = async (e: MouseEvent) => {
    const target = e.target as HTMLAnchorElement;
    if (!target?.href) return;

    // Only handle bible-graph:// protocol
    if (!target.href.startsWith('bible-graph://')) {
      return; // Let browser handle external links
    }

    e.preventDefault();

    // Extract study ID from URL
    const studyId = target.href.replace('bible-graph://study/', '');

    // Validate it's a UUID
    if (!studyId.match(/^[0-9a-f-]{36}$/i)) {
      toast.error('Link inválido');
      return;
    }

    // Check if study exists and user has access
    const { data, error } = await supabase
      .from('bible_studies')
      .select('id')
      .eq('id', studyId)
      .eq('user_id', user_id)
      .single();

    if (error || !data) {
      toast.error('Estudo foi deletado ou você não tem acesso');
      return;
    }

    // Navigate
    await router.push(`/estudo/${studyId}`);
  };

  // Find editor and attach listener
  const editor = document.querySelector('.tiptap');
  if (!editor) return () => {};

  editor.addEventListener('click', handleLinkClick);

  // Return cleanup function
  return () => {
    editor.removeEventListener('click', handleLinkClick);
  };
}
```

**Step 2**: Integrate into StudyPageClient
**File**: `src/app/estudo/[id]/StudyPageClient.tsx`

```typescript
import { initializeInternalLinks } from '@/lib/link-handler';

// Inside StudyPageClient component
useEffect(() => {
  const cleanup = initializeInternalLinks(router, user?.id);
  return cleanup;
}, [router, user?.id]);
```

**Step 3**: Add CSS feedback
**File**: `src/app/globals.css`

```css
/* Visual feedback for internal links */
.tiptap a[href^="bible-graph://"] {
  font-weight: 600;
  text-decoration: underline dotted;
  cursor: pointer;
}

.tiptap a[href^="bible-graph://"]:hover {
  background-color: rgba(59, 130, 246, 0.1);
  border-radius: 2px;
  transition: background-color 0.2s ease;
}

/* External links for comparison */
.tiptap a:not([href^="bible-graph://"]) {
  text-decoration: underline solid;
}
```

**Step 4**: Add Test (P1)
**File**: `src/components/Editor/BubbleMenu/useBubbleMenuHandlers.test.ts`

```typescript
it('link handler navigates to correct study', async () => {
  const mockRouter = { push: vi.fn() };

  // Simulate click on bible-graph link
  const link = document.createElement('a');
  link.href = 'bible-graph://study/test-uuid';

  const cleanup = initializeInternalLinks(mockRouter as any, 'user-id');
  link.click();

  // Should call router.push
  expect(mockRouter.push).toHaveBeenCalledWith('/estudo/test-uuid');

  cleanup();
});
```

### Testing the Fix

```bash
# After implementing fix:
npm run test:e2e -- internal-links
# Should show:
# ✅ clicking internal link navigates to target study

npm run dev
# Manual test:
# 1. Create link
# 2. Click link
# 3. Should navigate to target study
```

---

## Related Issues

### Potential Regressions (Triggered by This Bug)

1. **External links might break** if handler is too broad
   - Need to differentiate `https://` vs `bible-graph://`

2. **Mobile tap might not work** if using click event instead of tap
   - May need to add `touchend` handler

3. **Keyboard navigation** - Users can't navigate links with Enter key
   - Need to add keydown handler

4. **Link validation** - Deleted studies still show clickable links
   - Need to disable/hide orphaned links

---

## Prevention Checklist

### For This Bug

- [ ] Write E2E test FIRST (TC 1.2 Click Link)
- [ ] Implement handler
- [ ] Test passes
- [ ] Add to PR
- [ ] Code review checks for handler
- [ ] Manual testing before merge

### For Future Bugs

- [ ] Use Definition of Done checklist
- [ ] Require E2E for critical features
- [ ] 2-person code review (mandatory)
- [ ] QA sign-off before merge
- [ ] GitHub branch protection (block if tests fail)

---

## Lessons Learned

### What Failed

1. **No tests** - Feature wasn't tested
2. **No QA** - No one validated feature
3. **Incomplete code review** - Reviewer didn't verify implementation
4. **No process** - No Definition of Done checklist

### What to Fix

1. **Add tests** - Unit + E2E before merge
2. **Add QA step** - Mandatory QA validation
3. **Improve review** - Checklist for code review
4. **Add process** - Definition of Done template + CI/CD enforcement

---

## Timeline

| Time | Event |
|------|-------|
| Day 1 | Feature developed (Create + Save + DB) |
| Day 2 | Feature merged to main (no tests) |
| Day 3 | QA finds bug (clicking doesn't navigate) |
| **Day 4** | **FIX APPLIED** (add click handler) |
| **Day 5** | **TESTS ADDED** (E2E + manual) |
| **Day 6** | **REGRESSION TESTING** (manual + E2E) |
| **Day 7** | **PRODUCTION DEPLOY** |

---

## Sign-Off

| Role | Name | Date | Status |
|------|------|------|--------|
| QA | TBD | - | Found bug ✅ |
| Developer | TBD | - | Pending fix |
| Code Review | TBD | - | Pending approval of fix |
| QA (Retest) | TBD | - | Pending sign-off |

---

**Bug Report ID**: BUG-001-INTERNAL-LINKS-NO-NAV
**Created**: 2026-01-27
**Last Updated**: 2026-01-27
**Status**: 🔴 OPEN
**Priority**: 🔴 CRITICAL
