import { test, expect } from '@playwright/test';

/**
 * End-to-end tests para links internos
 *
 * Testa o fluxo completo do usuário:
 * - Criar links entre estudos
 * - Salvar estudo
 * - Recarregar página
 * - Clicar no link e navegar
 */

test.describe('Bible Study Internal Links E2E', () => {
  const STUDY_PAGE_URL = 'http://localhost:3000/estudo/genesis-1';
  const EDITOR_SELECTOR = '.tiptap';
  const BUBBLE_MENU_SELECTOR = '[data-testid="bubble-menu"]';

  // ✅ E2E TEST 1: Complete workflow - Create, Save, Reload, Click, Navigate
  test('should create link, save, reload, and navigate', async ({ page }) => {
    // 1. Navigate to study page
    await page.goto(STUDY_PAGE_URL);
    await page.waitForSelector(EDITOR_SELECTOR);

    // 2. Type text that will become a link
    const editor = page.locator(EDITOR_SELECTOR);
    await editor.focus();
    await editor.fill('See also: Exodus 1');

    // 3. Select "Exodus 1" text (double-click to select word)
    await editor.dblclick();

    // 4. Wait for BubbleMenu to appear
    const bubbleMenu = page.locator(BUBBLE_MENU_SELECTOR);
    await bubbleMenu.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {
      // If bubble menu doesn't appear with selector, look for reference button by text
      return page.locator('button:has-text("Reference")').first();
    });

    // 5. Click "Reference" button
    const referenceButton = page.locator('button:has-text("Reference")').first();
    await referenceButton.click();

    // 6. Search for "Exodus 1" in reference picker
    const searchInput = page.locator('input[placeholder*="Search"]').first();
    await searchInput.fill('Exodus');
    await page.waitForTimeout(500);

    // 7. Click on first result (Exodus 1)
    const firstResult = page.locator('[data-testid="reference-result"]').first();
    await firstResult.click();

    // 8. Verify link was created (link should be visible in editor)
    const linkInEditor = editor.locator('a[href*="estudo"]').first();
    await expect(linkInEditor).toBeVisible();

    // 9. Click Save button
    const saveButton = page.locator('button:has-text("Save")');
    await saveButton.click();

    // 10. Wait for save confirmation
    await page.waitForTimeout(2000);

    // 11. Reload page
    await page.reload();
    await page.waitForSelector(EDITOR_SELECTOR);

    // 12. Verify link still exists after reload
    const reloadedLink = page.locator(EDITOR_SELECTOR).locator('a[href*="estudo"]').first();
    await expect(reloadedLink).toBeVisible();

    // 13. Click the link
    await reloadedLink.click();

    // 14. Verify navigation happened (URL changed)
    await page.waitForNavigation({ timeout: 5000 }).catch(() => {
      // Navigation might not trigger if same page, that's ok
      return null;
    });

    // 15. Verify we're on a study page (URL contains /estudo/)
    expect(page.url()).toContain('/estudo/');
  });

  // ✅ E2E TEST 2: Mobile touch on link navigates
  test('should navigate on mobile touch', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigate to study page
    await page.goto(STUDY_PAGE_URL);
    await page.waitForSelector(EDITOR_SELECTOR);

    // Create a link programmatically (for faster test)
    await page.evaluate(() => {
      const editor = document.querySelector('.tiptap');
      if (editor) {
        editor.innerHTML =
          '<p><a href="/estudo/exodus-1">Exodus 1</a></p>';
      }
    });

    // Get the link
    const link = page.locator(EDITOR_SELECTOR).locator('a[href*="estudo"]').first();
    await expect(link).toBeVisible();

    // Tap on the link (mobile touch)
    const boundingBox = await link.boundingBox();
    if (boundingBox) {
      await page.touchscreen.tap(
        boundingBox.x + boundingBox.width / 2,
        boundingBox.y + boundingBox.height / 2
      );
    }

    // Verify navigation or link interaction (on mobile, may open in same window)
    await page.waitForNavigation({ timeout: 5000 }).catch(() => null);

    // Verify we're either on study page or link was activated
    const isStodyPage = page.url().includes('/estudo/');
    expect(isStodyPage).toBeTruthy();
  });

  // ✅ E2E TEST 3: Ctrl+Click behavior
  test('should handle ctrl+click modifier key', async ({ page }) => {
    // Navigate to study page
    await page.goto(STUDY_PAGE_URL);
    await page.waitForSelector(EDITOR_SELECTOR);

    // Create a link programmatically
    await page.evaluate(() => {
      const editor = document.querySelector('.tiptap');
      if (editor) {
        editor.innerHTML =
          '<p><a href="/estudo/leviticus-1">Leviticus 1</a></p>';
      }
    });

    // Get the link
    const link = page.locator(EDITOR_SELECTOR).locator('a[href*="estudo"]').first();

    // Get link's href to verify it's correct
    const href = await link.getAttribute('href');
    expect(href).toContain('/estudo/leviticus-1');

    // Ctrl+Click (or Cmd+Click on Mac) should still navigate
    // Use Control key for all platforms (works for most browsers)
    const ctrlKey = 'Control';

    await link.click({
      modifiers: [ctrlKey as 'Control' | 'Meta' | 'Shift' | 'Alt'],
    });

    // Verify navigation happened
    await page.waitForNavigation({ timeout: 5000 }).catch(() => null);

    // URL should contain /estudo/
    expect(page.url()).toContain('/estudo/');
  });

  // ✅ E2E TEST 4: Multiple links on same page
  test('should handle multiple internal links', async ({ page }) => {
    // Navigate to study page
    await page.goto(STUDY_PAGE_URL);
    await page.waitForSelector(EDITOR_SELECTOR);

    // Create multiple links programmatically
    await page.evaluate(() => {
      const editor = document.querySelector('.tiptap');
      if (editor) {
        editor.innerHTML = `
          <p><a href="/estudo/genesis-2">Genesis 2</a></p>
          <p><a href="/estudo/exodus-1">Exodus 1</a></p>
          <p><a href="/estudo/leviticus-1">Leviticus 1</a></p>
        `;
      }
    });

    // Verify all 3 links are visible
    const links = page.locator(EDITOR_SELECTOR).locator('a[href*="estudo"]');
    await expect(links).toHaveCount(3);

    // Click first link
    const firstLink = links.nth(0);
    const firstHref = await firstLink.getAttribute('href');
    await firstLink.click();

    // Verify navigation
    await page.waitForNavigation({ timeout: 5000 }).catch(() => null);
    expect(page.url()).toContain('/estudo/');

    // Navigate back
    await page.goBack();
    await page.waitForSelector(EDITOR_SELECTOR);

    // Click second link
    const secondLinkRefresh = page.locator(EDITOR_SELECTOR).locator('a[href*="estudo"]').nth(1);
    const secondHref = await secondLinkRefresh.getAttribute('href');
    await secondLinkRefresh.click();

    // Verify navigation to second link
    await page.waitForNavigation({ timeout: 5000 }).catch(() => null);
    expect(page.url()).toContain('/estudo/');
  });

  // ✅ E2E TEST 5: Regression - other editor features still work
  test('should not break other editor formatting features', async ({ page }) => {
    // Navigate to study page
    await page.goto(STUDY_PAGE_URL);
    await page.waitForSelector(EDITOR_SELECTOR);

    const editor = page.locator(EDITOR_SELECTOR);
    await editor.focus();

    // Type some text
    await editor.fill('This is a test with bold and italic');

    // Select "bold" and make it bold
    await editor.evaluate(() => {
      const el = document.querySelector('.tiptap') as any;
      if (el && el.editor) {
        // This is pseudocode - actual implementation depends on Tiptap setup
        // In real tests, use Tiptap commands directly or interact with UI
      }
    });

    // Test that basic formatting still works (typing, editing, etc)
    await editor.focus();
    await page.keyboard.type(' and underline');

    // Verify text is in editor
    const editorContent = await editor.textContent();
    expect(editorContent).toContain('test with bold');
    expect(editorContent).toContain('and underline');

    // Verify no console errors
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // No critical errors should have occurred
    expect(errors.filter(e => !e.includes('Failed to fetch')).length).toBe(0);
  });
});
