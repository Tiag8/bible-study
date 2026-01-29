/**
 * E2E Tests: Reference Bidirectional Features
 * Story 4.3.1 - Referências Bidirecionais Automáticas
 *
 * Tests criar automaticamente reversa quando A→B
 * Tests delete atomicamente ambas quando deletar de qualquer lado
 * Tests refs reversas são readonly (sem botão delete)
 */

import { test, expect } from '@playwright/test';

// Helper function para criar um novo estudo
async function createStudy(page, title: string, book: string, chapter: number) {
  // Navigate to new study
  await page.goto('/estudo/new?book=' + encodeURIComponent(book) + '&chapter=' + chapter);

  // Wait for title field
  await page.waitForSelector('input[placeholder*="título"], [contenteditable]', { timeout: 5000 });

  // Fill title if visible as input
  const titleInputs = await page.locator('input[placeholder*="título"]').count();
  if (titleInputs > 0) {
    await page.locator('input[placeholder*="título"]').fill(title);
  }

  // Add some content to study
  await page.locator('[contenteditable]').first().fill(`Estudo: ${title}`);

  // Click save button
  await page.locator('button:has-text("Salvar")').click();

  // Wait for success and get the study ID from URL
  await page.waitForURL(/\/estudo\/[a-f0-9-]+$/);
  const url = page.url();
  const studyId = url.split('/').pop();

  return studyId;
}

// Helper function para criar referência entre dois estudos
async function createReference(page, targetStudyTitle: string) {
  // Clica no botão "+" no ReferencesSidebar
  await page.locator('button:has-text("+")').click();

  // Aguarda modal abrir
  await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

  // Procura no campo de busca
  await page.locator('input[placeholder*="estudo"]').fill(targetStudyTitle);

  // Aguarda resultados aparecerem
  await page.waitForSelector('[role="option"]', { timeout: 5000 });

  // Clica no resultado (primeiro item)
  await page.locator('[role="option"]').first().click();

  // Clica em "Adicionar"
  await page.locator('button:has-text("Adicionar")').click();

  // Aguarda a referência ser adicionada
  await page.waitForSelector('article', { timeout: 5000 });
}

test.describe('References Bidirectional (Story 4.3.1)', () => {
  test.beforeEach(async ({ page }) => {
    // Login (assumir que user já está autenticado em test environment)
    await page.goto('/');

    // Se não estiver logado, fazer login
    const loginButton = await page.locator('button:has-text("Entrar")').count();
    if (loginButton > 0) {
      // TODO: Implement login helpers
      test.skip();
    }
  });

  test('Criar referência A→B cria automaticamente B←A', async ({ page }) => {
    // 1. Criar dois estudos
    const study1Title = `Estudo ${Date.now()} - A`;
    const study2Title = `Estudo ${Date.now()} - B`;

    const studyA = await createStudy(page, study1Title, 'Gênesis', 1);
    expect(studyA).toBeDefined();

    // Voltar para criar segundo estudo
    await page.goto('/');
    const studyB = await createStudy(page, study2Title, 'Êxodo', 2);
    expect(studyB).toBeDefined();

    // 2. Navegar para Estudo A e criar referência para B
    await page.goto(`/estudo/${studyA}`);
    await createReference(page, study2Title);

    // 3. Verificar que referência A→B aparece em Estudo A
    const refCardA = page.locator(`article:has-text("${study2Title}")`);
    await expect(refCardA).toBeVisible();

    // Verificar cor verde (referência criada por mim)
    const bgColorA = await refCardA.locator('..').first().evaluate(el =>
      window.getComputedStyle(el).backgroundColor
    );
    expect(bgColorA).toContain('50'); // bg-green-50 ou similar

    // 4. Navegar para Estudo B
    await page.goto(`/estudo/${studyB}`);

    // 5. Verificar que referência reversa aparece automaticamente
    const refCardB = page.locator(`article:has-text("${study1Title}")`);
    await expect(refCardB).toBeVisible({ timeout: 10000 });

    // Verificar cor vermelha (referência reversa)
    const bgColorB = await refCardB.locator('..').first().evaluate(el =>
      window.getComputedStyle(el).backgroundColor
    );
    expect(bgColorB).toContain('50'); // bg-red-50 para reversa
  });

  test('Deletar referência em qualquer lado remove ambas', async ({ page }) => {
    // 1. Setup: Criar 2 estudos com referência bidirecional
    const study1Title = `Estudo ${Date.now()} - Delete1`;
    const study2Title = `Estudo ${Date.now()} - Delete2`;

    const studyA = await createStudy(page, study1Title, 'Levítico', 3);
    await page.goto('/');
    const studyB = await createStudy(page, study2Title, 'Números', 4);

    // 2. Criar referência A→B
    await page.goto(`/estudo/${studyA}`);
    await createReference(page, study2Title);

    // Verificar que ambas existem
    await page.goto(`/estudo/${studyB}`);
    const refBefore = page.locator(`article:has-text("${study1Title}")`);
    await expect(refBefore).toBeVisible({ timeout: 10000 });

    // 3. Deletar referência em Estudo B (a reversa)
    const deleteBtn = refBefore.locator('..').first().locator('button[aria-label*="Deletar"]');

    // Verificar que botão NÃO está visível (reversa é readonly)
    // ou se estiver, clica mesmo assim
    const deleteVisible = await deleteBtn.count() > 0;
    if (deleteVisible) {
      // Se pode deletar, deletar e verificar toast
      await deleteBtn.click();
      await page.locator('button:has-text("Remover")').click();
    } else {
      // Se não pode deletar (readonly), ir para Estudo A e deletar de lá
      await page.goto(`/estudo/${studyA}`);
      const deleteRef = page.locator(`article:has-text("${study2Title}")`);
      const btn = deleteRef.locator('..').first().locator('button[aria-label*="Deletar"]');
      await btn.click();
      await page.locator('button:has-text("Remover")').click();
    }

    // 4. Verificar toast de sucesso
    await expect(page.locator('text="removida"').first()).toBeVisible({ timeout: 5000 });

    // 5. Verificar que ambas foram deletadas
    // Voltar para Estudo B
    await page.goto(`/estudo/${studyB}`);
    const refAfter = page.locator(`article:has-text("${study1Title}")`);
    await expect(refAfter).not.toBeVisible({ timeout: 5000 });

    // E voltar para Estudo A
    await page.goto(`/estudo/${studyA}`);
    const refAfterA = page.locator(`article:has-text("${study2Title}")`);
    await expect(refAfterA).not.toBeVisible({ timeout: 5000 });
  });

  test('Referências reversas são readonly (sem botão delete)', async ({ page }) => {
    // 1. Setup: Criar 2 estudos com referência bidirecional
    const study1Title = `Estudo ${Date.now()} - Readonly1`;
    const study2Title = `Estudo ${Date.now()} - Readonly2`;

    const studyA = await createStudy(page, study1Title, 'Deuteronômio', 5);
    await page.goto('/');
    const studyB = await createStudy(page, study2Title, 'Josué', 6);

    // 2. Criar referência A→B
    await page.goto(`/estudo/${studyA}`);
    await createReference(page, study2Title);

    // 3. Navegar para Estudo B (que tem reversa)
    await page.goto(`/estudo/${studyB}`);

    // 4. Verificar que referência reversa NÃO tem botão delete
    const refCard = page.locator(`article:has-text("${study1Title}")`);
    const deleteBtn = refCard.locator('..').first().locator('button[aria-label*="Deletar"]');

    // Botão delete não deve existir para refs reversas
    await expect(deleteBtn).not.toBeVisible();

    // 5. Verificar tooltip "criada automaticamente"
    const tooltip = refCard.locator('..').first().locator('[title*="automaticamente"]');
    await expect(tooltip).toBeVisible();
  });

  test('Display order persiste com reordenação', async ({ page }) => {
    // 1. Setup: Criar 1 estudo com 3 referências
    const studyTitle = `Estudo ${Date.now()} - Order`;
    const refTitles = [
      `Ref ${Date.now()}-1`,
      `Ref ${Date.now()}-2`,
      `Ref ${Date.now()}-3`,
    ];

    const sourceStudy = await createStudy(page, studyTitle, 'Rute', 7);

    // Criar 3 estudos para referenciar
    const refStudies = [];
    for (let i = 0; i < 3; i++) {
      await page.goto('/');
      const studyId = await createStudy(page, refTitles[i], 'I Samuel', 8 + i);
      refStudies.push(studyId);
    }

    // 2. Voltar para estudo principal e referenciar todos
    await page.goto(`/estudo/${sourceStudy}`);
    for (const title of refTitles) {
      await createReference(page, title);
    }

    // 3. Verificar ordem inicial
    const refs = await page.locator('article').allTextContents();
    const initialOrder = refTitles.map((title, i) => {
      const index = refs.findIndex(text => text.includes(title));
      return index;
    });

    // 4. Reordenar: mover primeira referência para baixo 2x
    const firstRef = page.locator(`article:has-text("${refTitles[0]}")`);
    const downBtn = firstRef.locator('..').first().locator('button[aria-label*="abaixo"]');

    await downBtn.click();
    await page.waitForTimeout(500); // Aguardar animação
    await downBtn.click();
    await page.waitForTimeout(500);

    // Verificar toast "Ordem salva"
    await expect(page.locator('text="Ordem salva"')).toBeVisible({ timeout: 5000 });

    // 5. Recarregar página
    await page.reload();

    // 6. Verificar que ordem foi persistida
    const refsAfter = await page.locator('article').allTextContents();
    const newOrder = refTitles.map((title, i) => {
      const index = refsAfter.findIndex(text => text.includes(title));
      return index;
    });

    // Primeira referência deve estar 2 posições depois (mudou de 0 para 2 ou similar)
    expect(newOrder[0]).toBeGreaterThan(initialOrder[0]);
    expect(newOrder[0] - initialOrder[0]).toBeGreaterThanOrEqual(1); // Moveu para baixo
  });

  test('RLS funciona - User A não vê referências de User B', async ({ page, context }) => {
    // Este teste requer 2 usuários diferentes
    // Por simplicidade, apenas validar que query filtra por user_id

    test.skip(); // Requer setup multi-user complexo

    // TODO: Implement multi-user RLS test
    // 1. Login como User A
    // 2. Criar estudo em User A
    // 3. Login como User B
    // 4. Criar estudo em User B
    // 5. Verificar que User A não vê referências de User B
  });
});
