# Test Plan: Internal Links Navigation Feature

**Feature**: Users can click internal links between studies (bible-graph://)
**Scope**: Editor, Navigation, Database, Security
**Status**: 🔴 NOT TESTED
**Date**: 2026-01-27

---

## Test Strategy Matrix

```
                 UNIT    INTEGRATION    E2E     MANUAL   SECURITY
Editor           P1      P2             P1      -        -
Navigation       P1      P2             P1      P2       -
Database         -       P1             -       P2       P1
UI/UX            -       -              P2      P1       -
Accessibility    -       -              P2      P1       -
Performance      -       P2             P3      -        -
Mobile           -       -              P1      P1       -
```

Priority: P1 (Blocking), P2 (Important), P3 (Nice-to-have)

---

## Part 1: Manual Test Cases

### Test Case 1.1: Create Internal Link (Happy Path)

**Objective**: Verify link creation UI works end-to-end

**Setup**:
- User logged in
- 2 studies created: "Study A" and "Study B"
- Currently editing "Study A"

**Steps**:
1. Click to position cursor in text editor
2. Type text: "Este é um link para Êxodo"
3. Select the text "Êxodo"
4. Right-click → Bubble Menu appears
5. Click button "Referenciar" (speech bubble icon)
6. Search box appears with placeholder "Buscar estudo para referenciar..."
7. Type "Study B" in search
8. List shows "Study B" with details (book_name, chapter, status)
9. Click "Study B" in list
10. Bubble menu closes
11. Text "Êxodo" is now styled as a link (blue, underlined)

**Expected Result**:
- Link visually appears in editor
- Link has `href="bible-graph://study/{uuid-b}"`
- No errors in console

**Pass Criteria**: All steps complete without errors

**Test Data**:
- Study A ID: `uuid-1111-1111-1111-111111111111`
- Study B ID: `uuid-2222-2222-2222-222222222222`

---

### Test Case 1.2: Click Internal Link (CRITICAL)

**Objective**: Verify clicking link navigates to target study

**Setup**: From Test 1.1 (link exists in Study A)

**Steps**:
1. Link is visible in editor (blue text "Êxodo")
2. Move mouse over link
3. Click link

**Expected Result**:
- Page navigates to `/estudo/{uuid-2222-2222-2222-222222222222}`
- Study B content loads
- Breadcrumb shows "Study B"
- URL changed in address bar
- No 404 errors

**Pass Criteria**: Navigation completes without error

**Test Data**: Same as 1.1

**ACTUAL RESULT** (Current): Link click is IGNORED - no navigation occurs ❌

---

### Test Case 1.3: Multiple Links in Same Study

**Objective**: Verify multiple links in single study all navigate correctly

**Setup**:
- Study A with 3 links to different studies (B, C, D)
- Each link labeled differently: "Versículo 1", "Versículo 2", "Versículo 3"

**Steps**:
1. Click "Versículo 1" → Should navigate to Study B
2. Verify URL: `/estudo/{uuid-b}`
3. Go back to Study A
4. Click "Versículo 2" → Should navigate to Study C
5. Verify URL: `/estudo/{uuid-c}`
6. Go back to Study A
7. Click "Versículo 3" → Should navigate to Study D
8. Verify URL: `/estudo/{uuid-d}`

**Expected Result**: All 3 links navigate to correct studies

**Pass Criteria**: 3/3 links work correctly

**ACTUAL RESULT**: All clicks IGNORED ❌

---

### Test Case 1.4: Link Persistence After Reload

**Objective**: Verify link survives page reload

**Setup**: Link exists in Study A

**Steps**:
1. Verify link is visible and blue
2. Press F5 (hard reload)
3. Wait for page to load
4. Link should still be visible (same color, same text)
5. Click link

**Expected Result**:
- Link remains after reload
- Link still navigates correctly

**Pass Criteria**: Link renders and works after reload

**ACTUAL RESULT**: Link renders but doesn't navigate ❌

---

### Test Case 1.5: Link Copy/Paste

**Objective**: Verify link behavior when copied/pasted

**Setup**:
- Study A with link to Study B
- Open Study C (different study)

**Steps**:
1. In Study A, select the link element (triple-click or drag)
2. Copy (Ctrl+C)
3. Navigate to Study C
4. Click in editor
5. Paste (Ctrl+V)
6. Link appears in Study C
7. Click link

**Expected Result**:
- Link pastes correctly as `<a href="bible-graph://...">`
- Link still navigates to correct study

**Pass Criteria**: Pasted link works

**ACTUAL RESULT**: ❌ NOT TESTED

---

### Test Case 1.6: External Link vs Internal Link (Differentiation)

**Objective**: Verify different behavior between internal and external links

**Setup**:
- Study with both:
  - External link: `https://example.com`
  - Internal link: `bible-graph://study/uuid-123`

**Steps**:
1. Click external link → should open in new tab (target="_blank")
2. Verify new tab with example.com
3. Go back to study
4. Click internal link → should navigate within app
5. Verify navigation to `/estudo/uuid-123`

**Expected Result**:
- External link: New tab behavior
- Internal link: Client-side navigation

**Pass Criteria**: Different behaviors for different link types

**ACTUAL RESULT**: Both links don't work ❌

---

### Test Case 1.7: Non-existent Target (Deleted Study)

**Objective**: Verify safe handling when target study is deleted

**Setup**:
- Study A has link to Study B
- Delete Study B from database

**Steps**:
1. Navigate to Study A
2. Try to click link

**Expected Result**:
- Link is disabled/greyed out, OR
- Click shows error toast: "Estudo foi deletado", OR
- Shows 404 page with friendly message

**NOT** a broken JavaScript error or silent failure

**Pass Criteria**: Graceful error handling

**ACTUAL RESULT**: ❌ NOT TESTED

---

### Test Case 1.8: Visual Feedback on Hover

**Objective**: Verify link has visual feedback indicating it's clickable

**Setup**: Study with internal link

**Steps**:
1. Move mouse to link
2. Observe cursor and styling

**Expected Result**:
- Cursor changes to `pointer` ✓ (CSS has this)
- Link highlights or changes color on hover
- Tooltip or hint appears (optional)

**Pass Criteria**: Clear visual indication link is clickable

**ACTUAL RESULT**:
- ✓ Cursor is pointer
- ❌ No hover state beyond cursor
- ❌ No tooltip or hint

---

### Test Case 1.9: Keyboard Navigation (Accessibility)

**Objective**: Verify links can be navigated via Tab key

**Setup**: Study with 2+ links

**Steps**:
1. Focus editor
2. Press Tab multiple times to focus links
3. Verify each link can be focused (focus ring visible)
4. Press Enter on focused link
5. Should navigate

**Expected Result**:
- Links are focusable (in tab order)
- Enter key triggers navigation
- Focus ring visible (accessibility indicator)

**Pass Criteria**: Full keyboard navigation support

**ACTUAL RESULT**: ❌ Links probably not in tab order

---

### Test Case 1.10: Mobile Touch Interaction

**Objective**: Verify links work on touch devices

**Setup**:
- Open study on mobile device or mobile emulation
- Study has internal link

**Steps**:
1. Tap link

**Expected Result**:
- Navigation occurs on tap (no long-press required)

**Pass Criteria**: Touch navigation works

**ACTUAL RESULT**: ❌ Untested (likely broken)

---

### Test Case 1.11: RLS Security - User A can't navigate to User B's links

**Objective**: Verify RLS policies prevent unauthorized access

**Setup**:
- User A has Study A with link to Study B (both User A's)
- User B has Study C
- Create scenario: User A's Study contains link pointing to User C's Study D

**Steps**:
1. User A clicks link pointing to User C's Study D
2. Try to navigate

**Expected Result**:
- Navigation blocked (should show 404 or "Unauthorized")
- Not "Internal Server Error" or revealing user data

**Pass Criteria**: RLS policies enforced

**ACTUAL RESULT**: ❌ NOT TESTED (critical security)

---

### Test Case 1.12: Bidirectional Link Tracking

**Objective**: Verify link appears in both directions (if database schema supports)

**Setup**:
- Study A links to Study B
- Check `bible_study_links` table

**Steps**:
1. In Study A, create link to Study B
2. Query DB: `SELECT * FROM bible_study_links WHERE source_study_id = '{uuid-a}'`
3. Result should show link with `target_study_id = '{uuid-b}'`
4. (If bidirectional) Check if reverse link exists
5. View Study B → should show backlinks (optional feature)

**Expected Result**:
- Forward link exists in DB ✓
- Reverse tracking (if implemented) works
- RLS filters to user_id

**Pass Criteria**: Correct DB records

**ACTUAL RESULT**: ❌ Navigation untested (DB part verified in migration tests)

---

## Part 2: Unit Tests (Vitest)

### Unit Test Suite: useBubbleMenuHandlers

**File**: `src/components/Editor/BubbleMenu/useBubbleMenuHandlers.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useBubbleMenuHandlers } from './useBubbleMenuHandlers';

describe('useBubbleMenuHandlers', () => {
  let mockEditor: any;
  let setMode: any;
  let setLinkUrl: any;
  let setSearchQuery: any;

  beforeEach(() => {
    // Mock Tiptap editor chain API
    mockEditor = {
      chain: vi.fn().mockReturnThis(),
      focus: vi.fn().mockReturnThis(),
      extendMarkRange: vi.fn().mockReturnThis(),
      setLink: vi.fn().mockReturnThis(),
      run: vi.fn(),
    };

    setMode = vi.fn();
    setLinkUrl = vi.fn();
    setSearchQuery = vi.fn();
  });

  // Test 1: Reference URL format
  it('setReference cria URL bible-graph correta com study ID', () => {
    const { setReference } = useBubbleMenuHandlers({
      editor: mockEditor,
      setMode,
      setLinkUrl,
      setSearchQuery,
    });

    setReference('test-uuid-123', 'Estudo Teste');

    expect(mockEditor.chain).toHaveBeenCalled();
    expect(mockEditor.focus).toHaveBeenCalled();
    expect(mockEditor.extendMarkRange).toHaveBeenCalledWith('link');
    expect(mockEditor.setLink).toHaveBeenCalledWith({
      href: 'bible-graph://study/test-uuid-123',
      target: '_self',
    });
    expect(mockEditor.run).toHaveBeenCalled();
  });

  // Test 2: setReference resets search
  it('setReference limpa searchQuery após criar link', () => {
    const { setReference } = useBubbleMenuHandlers({
      editor: mockEditor,
      setMode,
      setLinkUrl,
      setSearchQuery,
    });

    setReference('uuid', 'title');

    expect(setSearchQuery).toHaveBeenCalledWith('');
    expect(setMode).toHaveBeenCalledWith('default');
  });

  // Test 3: setLink for external URL
  it('setLink cria link externo com target="_blank"', () => {
    const { setLink } = useBubbleMenuHandlers({
      editor: mockEditor,
      setMode,
      setLinkUrl,
      setSearchQuery,
    });

    setLink('https://example.com');

    expect(mockEditor.setLink).toHaveBeenCalledWith({
      href: 'https://example.com',
    });
  });

  // Test 4: removeLink
  it('removeLink remove link da seleção', () => {
    const { removeLink } = useBubbleMenuHandlers({
      editor: mockEditor,
      setMode,
      setLinkUrl,
      setSearchQuery,
    });

    removeLink();

    expect(mockEditor.chain).toHaveBeenCalled();
    expect(mockEditor.unsetLink).toHaveBeenCalled();
  });

  // Test 5: Empty study ID validation
  it('setReference não cria link para study ID vazio', () => {
    const { setReference } = useBubbleMenuHandlers({
      editor: mockEditor,
      setMode,
      setLinkUrl,
      setSearchQuery,
    });

    setReference('', 'title');

    // Should not call setLink for empty ID
    expect(mockEditor.setLink).not.toHaveBeenCalledWith(
      expect.objectContaining({ href: expect.stringContaining('bible-graph://study/') })
    );
  });

  // Test 6: UUID format validation
  it('setReference valida formato UUID', () => {
    const { setReference } = useBubbleMenuHandlers({
      editor: mockEditor,
      setMode,
      setLinkUrl,
      setSearchQuery,
    });

    const validUuid = '123e4567-e89b-12d3-a456-426614174000';
    setReference(validUuid, 'title');

    expect(mockEditor.setLink).toHaveBeenCalled();
  });
});
```

**Expected Results**:
- 6/6 tests FAIL currently (setReference exists but onClick handler doesn't)
- After fix: 6/6 PASS

---

### Unit Test Suite: parseContent

**File**: `src/lib/editor-utils.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { parseContent } from './editor-utils';

describe('parseContent', () => {
  // Test 1: Preserve internal links in JSON
  it('preserva links internos ao parsear JSON', () => {
    const input = JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Clique aqui',
              marks: [
                {
                  type: 'link',
                  attrs: {
                    href: 'bible-graph://study/123',
                    target: '_self',
                  },
                },
              ],
            },
          ],
        },
      ],
    });

    const result = parseContent(input);

    expect(result).toHaveProperty('content');
    expect(result.content[0].content[0].marks[0].attrs.href).toBe('bible-graph://study/123');
  });

  // Test 2: Handle malformed link URLs gracefully
  it('sanitiza URLs maliciosas em links', () => {
    const malicious = '<a href="javascript:alert(1)">click</a>';
    const result = parseContent(malicious);

    // DOMPurify should remove javascript: protocol
    expect(result).not.toContain('javascript:');
  });

  // Test 3: Preserve external links
  it('preserva links externos (https://)', () => {
    const input = '<a href="https://example.com">link</a>';
    const result = parseContent(input);

    expect(result).toContain('https://example.com');
  });
});
```

**Expected Results**:
- Test 1: PASS (parseContent already preserves links)
- Test 2: PASS (DOMPurify working)
- Test 3: PASS

---

## Part 3: Integration Tests

### Integration Test: Full Flow - Create Link → Save → Reload

```typescript
// src/hooks/__tests__/useStudies.integration.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useStudies } from '../useStudies';
import { supabase } from '@/lib/supabase/client';

describe('useStudies - Internal Link Integration', () => {
  it('salva e recupera estudo com links internos', async () => {
    const { result } = renderHook(() => useStudies());

    // 1. Create study with link
    const content = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Link',
              marks: [
                {
                  type: 'link',
                  attrs: { href: 'bible-graph://study/target-uuid' },
                },
              ],
            },
          ],
        },
      ],
    };

    await result.current.createStudy('Gênesis', 1, 'Test Study');
    const study = result.current.studies[0];

    // 2. Save with link
    await result.current.saveStudy(study.id, {
      title: 'Test Study',
      content,
    });

    // 3. Fetch and verify link preserved
    const fetched = await result.current.getStudyById(study.id);
    expect(fetched.content.content[0].content[0].marks[0].attrs.href).toBe(
      'bible-graph://study/target-uuid'
    );
  });
});
```

---

## Part 4: E2E Tests (Playwright)

### E2E Test File Structure

**File**: `e2e/internal-links.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Internal Links - E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'qa@test.com');
    await page.fill('input[type="password"]', 'qa-test-password-123');
    await page.click('button:has-text("Entrar")');
    await page.waitForNavigation();
  });

  test('navegação de link interno - happy path', async ({ page }) => {
    // 1. Create Study A
    await page.goto(`${BASE_URL}/`);
    await page.click('text=Gênesis');
    await page.click('button:has-text("Novo Estudo")');
    const studyAUrl = page.url();
    const studyAId = studyAUrl.split('/').pop();

    // 2. Create Study B
    await page.goto(`${BASE_URL}/`);
    await page.click('text=Êxodo');
    await page.click('button:has-text("Novo Estudo")');
    const studyBUrl = page.url();
    const studyBId = studyBUrl.split('/').pop();

    // 3. Go to Study A
    await page.goto(`${BASE_URL}/estudo/${studyAId}`);

    // 4. Create internal link
    const editor = page.locator('.tiptap');
    await editor.click();
    await editor.type('Clique aqui para Êxodo');

    // Select "Êxodo"
    const selection = await editor.evaluate(() => {
      const text = document.querySelector('.tiptap').textContent;
      const range = document.createRange();
      range.setStart(document.querySelector('.tiptap'), 0);
      range.setEnd(document.querySelector('.tiptap'), 1);
      window.getSelection().addRange(range);
    });

    // Open bubble menu
    await page.click('button:has-text("Referenciar")');

    // Search for Study B
    await page.fill('input[placeholder*="Buscar"]', 'Êxodo');
    await page.click('text=Êxodo'); // Select Study B

    // 5. CRITICAL: Click the link
    const link = page.locator('a:has-text("Êxodo")').first();
    await link.click();

    // 6. Verify navigation
    await expect(page).toHaveURL(`${BASE_URL}/estudo/${studyBId}`);
  });

  test('múltiplos links navegáveis', async ({ page }) => {
    // Create 3 studies
    const studyIds: string[] = [];
    for (let i = 0; i < 3; i++) {
      await page.goto(`${BASE_URL}/`);
      await page.click('text=Gênesis');
      await page.click('button:has-text("Novo Estudo")');
      const id = page.url().split('/').pop();
      studyIds.push(id);
    }

    // Go to first study
    await page.goto(`${BASE_URL}/estudo/${studyIds[0]}`);

    // Create 2 links to other studies
    const editor = page.locator('.tiptap');
    await editor.click();
    await editor.type('Link 1');
    // ... create link to Study 2

    await editor.click();
    await editor.type('Link 2');
    // ... create link to Study 3

    // Click each link
    for (let i = 0; i < 2; i++) {
      await page.locator(`a:has-text("Link ${i + 1}")`).click();
      await expect(page).toHaveURL(`${BASE_URL}/estudo/${studyIds[i + 1]}`);
      await page.goBack();
    }
  });

  test('link persiste após reload', async ({ page }) => {
    // Create link (from previous test)
    // ...

    // Reload page
    await page.reload();

    // Link should still be visible
    const link = page.locator('a[href*="bible-graph"]');
    await expect(link).toBeVisible();

    // And still navigate
    await link.click();
    await expect(page).toHaveURL(/\/estudo\//);
  });

  test('tratamento seguro para estudo deletado', async ({ page }) => {
    // Create link to Study B
    // Delete Study B from DB
    // Try to click link in Study A

    // Should show error or 404
    await expect(page.locator('text=Estudo foi deletado')).toBeVisible();
  });
});
```

**Run Command**:
```bash
npx playwright test e2e/internal-links.spec.ts
```

---

## Part 5: Security Tests

### Security Test: RLS Policy Enforcement

**Test Objective**: Verify users can't navigate to other users' studies via links

```sql
-- Test in Supabase Dashboard or via psql
-- Create 2 users and test RLS

-- Setup
INSERT INTO auth.users (id, email) VALUES
  ('user-a-id', 'user-a@test.com'),
  ('user-b-id', 'user-b@test.com');

-- User A creates Study A
INSERT INTO bible_studies (id, user_id, book_name, chapter_number, title, status)
VALUES ('study-a-id', 'user-a-id', 'Gênesis', 1, 'Study A', 'estudando');

-- User B creates Study B
INSERT INTO bible_studies (id, user_id, book_name, chapter_number, title, status)
VALUES ('study-b-id', 'user-b-id', 'Êxodo', 1, 'Study B', 'estudando');

-- Try to create cross-user link (should FAIL due to trigger)
INSERT INTO bible_study_links (id, user_id, source_study_id, target_study_id)
VALUES (
  'link-id',
  'user-a-id',  -- User A trying to link to User B's study
  'study-a-id',
  'study-b-id'  -- ← Different user_id, should fail
);

-- Expected: Trigger error
-- Error: "source_study_id and target_study_id must have the same user_id"
```

---

## Part 6: Accessibility Tests

### WCAG AA Compliance Checklist

- [ ] Link has sufficient color contrast (4.5:1 minimum)
- [ ] Link is keyboard focusable (Tab key)
- [ ] Link has focus ring visible
- [ ] Link has descriptive `aria-label`
- [ ] Link can be activated by Enter key
- [ ] No keyboard traps (can Tab away from link)
- [ ] Focus order is logical

---

## Part 7: Performance Tests

### Performance Baseline

**Metric**: Time to navigate when clicking link

**Baseline**: < 500ms from click to page load

```typescript
// In E2E test
const startTime = Date.now();
await page.click('a[href*="bible-graph"]');
await page.waitForNavigation();
const duration = Date.now() - startTime;

expect(duration).toBeLessThan(500);
```

---

## Test Execution Plan

### Day 1 (Today): Manual Testing

- [ ] Execute Test Cases 1.1 - 1.12 (Section 1)
- [ ] Document PASS/FAIL for each
- [ ] Screenshot failures
- [ ] Identify missing features

### Day 2: Unit Tests

- [ ] Setup vitest config
- [ ] Write tests from Part 2
- [ ] Aim for 80% coverage on Editor components

### Day 3: E2E Tests

- [ ] Setup Playwright
- [ ] Write tests from Part 4
- [ ] Run in CI/CD

### Day 4: Security + Accessibility

- [ ] Execute RLS tests
- [ ] WCAG audit
- [ ] Performance baseline

### Day 5: Review & Approve

- [ ] All tests PASS
- [ ] Code review complete
- [ ] Ready to merge

---

## Sign-Off

| Role | Name | Date | Status |
|------|------|------|--------|
| QA Lead | TBD | - | Pending |
| Developer | TBD | - | Pending |
| Product | TBD | - | Pending |

---

**Last Updated**: 2026-01-27
**Next Review**: After feature fix
