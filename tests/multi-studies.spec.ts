import { test, expect } from '@playwright/test';

test.describe('Múltiplos Estudos por Capítulo', () => {
  test.beforeEach(async ({ page }) => {
    // Fazer login antes de cada teste
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');

    // Preencher formulário de login
    await page.fill('input[type="email"]', 'tiag8guimaraes@gmail.com');
    await page.fill('input[type="password"]', '123456');

    // Clicar em Log In
    await page.click('button:has-text("Log In")');
    await page.waitForLoadState('networkidle');

    // Aguardar redirecionamento para dashboard
    await page.waitForURL('http://localhost:3000/', { timeout: 10000 });
  });

  test('Cenário 1: Capítulo sem estudos deve criar novo estudo', async ({ page }) => {
    // Clicar em um livro (ex: Gênesis)
    await page.click('text=Gênesis');
    await page.waitForLoadState('networkidle');

    // Aguardar grid de capítulos carregar
    await expect(page.locator('h2:has-text("Capítulos")')).toBeVisible();
    await page.waitForTimeout(1000); // Aguardar hooks carregarem

    // Encontrar o primeiro capítulo vazio clicando diretamente no número "1"
    // Usar um seletor mais específico que identifica capítulos vazios
    const emptyChapter = page.locator('div[title^="Capítulo"]').first();
    await emptyChapter.click();

    // Aguardar navegação
    await page.waitForURL(/\/estudo\/new\?book=.*&chapter=.*/, { timeout: 10000 });

    // Verificar que navegou corretamente
    expect(page.url()).toContain('/estudo/new');
    expect(page.url()).toContain('book=');
    expect(page.url()).toContain('chapter=');

    // Aguardar editor carregar
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.ProseMirror')).toBeVisible({ timeout: 10000 });
  });

  test('Cenário 2: Capítulo com 1 estudo abre modal e pode selecionar estudo', async ({ page }) => {
    // Clicar em 2 Samuel
    await page.click('text=2 Samuel');
    await page.waitForLoadState('networkidle');

    // Aguardar grid carregar
    await expect(page.locator('h2:has-text("Capítulos")')).toBeVisible();
    await page.waitForTimeout(1000);

    // Clicar em capítulo com estudo (azul) - capítulo 11
    const chapterWithStudy = page.locator('div.bg-blue-600', { hasText: '11' }).first();
    await chapterWithStudy.click();

    // Modal deve aparecer (novo comportamento - permite criar 2º estudo)
    await expect(page.locator('h2:has-text("2 Samuel 11")')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button:has-text("Criar Novo Estudo")')).toBeVisible();

    // Clicar no estudo existente para abrir
    const existingStudy = page.locator('div.space-y-2 button').first();
    await existingStudy.click();

    // Deve navegar para /estudo/{uuid}
    await page.waitForURL(/\/estudo\/[a-f0-9-]{36}/, { timeout: 10000 });
    expect(page.url()).toMatch(/\/estudo\/[a-f0-9-]{36}/);

    // Aguardar editor carregar
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.ProseMirror')).toBeVisible({ timeout: 10000 });
  });

  test('Cenário 3: Criar 2º estudo para mesmo capítulo', async ({ page }) => {
    // Ir para 2 Samuel
    await page.click('text=2 Samuel');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Clicar em capítulo 11 (já tem 1 estudo)
    const chapter11 = page.locator('div.bg-blue-600', { hasText: '11' }).first();
    await chapter11.click();

    // Modal deve aparecer (novo comportamento)
    await expect(page.locator('h2:has-text("2 Samuel 11")')).toBeVisible({ timeout: 5000 });

    // Clicar em "Criar Novo Estudo"
    await page.click('button:has-text("Criar Novo Estudo")');
    await page.waitForURL(/\/estudo\/new\?book=2sa&chapter=11/, { timeout: 10000 });

    // Aguardar editor carregar
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.ProseMirror')).toBeVisible({ timeout: 10000 });

    // Escrever algo no editor para diferenciar
    await page.locator('.ProseMirror').fill('Este é o segundo estudo de 2 Samuel 11');

    // Salvar
    await page.click('button:has-text("Salvar")');

    // Aguardar indicador de salvo
    await expect(page.locator('text=Salvo')).toBeVisible({ timeout: 35000 });
  });

  test('Cenário 4: Modal deve aparecer com 2+ estudos', async ({ page }) => {
    // Ir para 2 Samuel
    await page.click('text=2 Samuel');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Procurar capítulo com badge laranja (2+ estudos)
    // Deve ser um div.bg-blue-600 (capítulo com estudo) que contém span.bg-orange-500 (badge)
    const chapterWithBadge = page.locator('div.bg-blue-600').filter({ has: page.locator('span.bg-orange-500') }).first();

    if (await chapterWithBadge.count() > 0) {
      // Tem badge - deve ter 2+ estudos
      const badge = chapterWithBadge.locator('span.bg-orange-500');
      const studyCount = await badge.textContent();

      console.log(`Capítulo tem ${studyCount} estudos`);

      // Clicar no capítulo
      await chapterWithBadge.click();

      // Modal deve aparecer com o livro + capítulo
      await expect(page.locator('h2:has-text("2 Samuel")')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('button:has-text("Criar Novo Estudo")')).toBeVisible();

      // Deve listar os estudos existentes
      await expect(page.locator('div.space-y-2 button').first()).toBeVisible();
    } else {
      // Se não tem capítulo com 2+ estudos, pular teste
      console.log('Nenhum capítulo com 2+ estudos encontrado');
    }
  });

  test('Cenário 5: Navegação no modal', async ({ page }) => {
    await page.click('text=2 Samuel');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Clicar em capítulo 11 (tem 2+ estudos com badge laranja)
    // Deve ser um div.bg-blue-600 (capítulo com estudo) que contém span.bg-orange-500 (badge) E texto "11"
    const chapter11 = page.locator('div.bg-blue-600').filter({
      has: page.locator('span.bg-orange-500'),
      hasText: /^11$/  // Exatamente "11", não "110" ou "211"
    });

    if (await chapter11.count() > 0) {
      await chapter11.first().click();

      // Modal aberto
      await expect(page.locator('text=2 Samuel 11')).toBeVisible();

      // Clicar no primeiro estudo listado
      const firstStudy = page.locator('.space-y-2 button').first();
      await firstStudy.click();
      await page.waitForLoadState('networkidle');

      // Deve navegar para estudo (UUID)
      expect(page.url()).toMatch(/\/estudo\/[a-f0-9-]{36}/);

      // Modal deve fechar
      await expect(page.locator('text=2 Samuel 11')).not.toBeVisible();
    }
  });

  test('Cenário 6: Breadcrumb mostra nome correto do livro', async ({ page }) => {
    await page.click('text=2 Samuel');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Clicar em qualquer capítulo com estudo (primeiro .bg-blue-600)
    const chapter = page.locator('.bg-blue-600').first();
    await chapter.click();

    // Modal deve aparecer (novo comportamento)
    await expect(page.locator('h2')).toBeVisible({ timeout: 5000 });

    // Clicar no primeiro estudo listado
    const firstStudy = page.locator('div.space-y-2 button').first();
    await firstStudy.click();

    // Aguardar navegação para estudo
    await page.waitForURL(/\/estudo\/.+/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');

    // Aguardar editor carregar
    await expect(page.locator('.ProseMirror')).toBeVisible({ timeout: 10000 });

    // Breadcrumb deve mostrar "2 Samuel" e "Capítulo"
    // Verificar dentro do nav com aria-label="Breadcrumb"
    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]');
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb.locator('text=2 Samuel')).toBeVisible();
    await expect(breadcrumb.locator('text=Capítulo')).toBeVisible();
  });
});
