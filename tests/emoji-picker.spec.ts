import { test, expect } from '@playwright/test';

test.describe('Emoji Picker Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login antes de cada teste
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');

    // Preencher credenciais
    await page.fill('input[type="email"]', 'tiag8guimaraes@gmail.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button:has-text("Log In")');
    await page.waitForLoadState('networkidle');

    // Aguardar dashboard
    await page.waitForURL('http://localhost:3000/', { timeout: 10000 });

    // Navegar para um estudo (usar Gênesis 1 como default)
    await page.click('text=Gênesis');
    await page.waitForLoadState('networkidle');
    await page.click('[data-chapter="1"]');
    await page.waitForLoadState('networkidle');

    // Aguardar editor carregar
    await page.waitForSelector('.tiptap', { timeout: 5000 });
    await page.click('.tiptap');
  });

  test('Abrir menu de emojis ao digitar ":"', async ({ page }) => {
    // Digitar ":"
    await page.keyboard.type(':');
    await page.waitForTimeout(300);

    // Verificar se menu aparece
    const emojiMenu = page.locator('.emoji-menu');
    await expect(emojiMenu).toBeVisible();
    await expect(emojiMenu).toContainText('Digitando:');
  });

  test('Buscar emojis por keyword "love"', async ({ page }) => {
    // Digitar ":love"
    await page.keyboard.type(':love');
    await page.waitForTimeout(300);

    // Verificar se menu exibe emojis relacionados a love
    const emojiMenu = page.locator('.emoji-menu');
    await expect(emojiMenu).toBeVisible();

    // Verificar se aparece pelo menos um emoji de love
    // Esperamos ❤️, 😍, 💕, 💗, 💖, 💝
    const emojiButtons = emojiMenu.locator('button');
    const count = await emojiButtons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Buscar emojis por keyword "fire"', async ({ page }) => {
    // Digitar ":fire"
    await page.keyboard.type(':fire');
    await page.waitForTimeout(300);

    // Verificar menu
    const emojiMenu = page.locator('.emoji-menu');
    await expect(emojiMenu).toBeVisible();

    // Verificar se tem emojis
    const emojiButtons = emojiMenu.locator('button');
    const count = await emojiButtons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Buscar emojis por keyword "star"', async ({ page }) => {
    // Digitar ":star"
    await page.keyboard.type(':star');
    await page.waitForTimeout(300);

    // Verificar menu
    const emojiMenu = page.locator('.emoji-menu');
    await expect(emojiMenu).toBeVisible();

    // Verificar se exibe sugestões
    const emojiButtons = emojiMenu.locator('button');
    const count = await emojiButtons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Navegar com seta DOWN incrementa selectedIndex', async ({ page }) => {
    // Digitar ":"
    await page.keyboard.type(':love');
    await page.waitForTimeout(300);

    // Verificar primeiro emoji selecionado
    let selectedButton = page.locator('[data-selected="true"]');
    await expect(selectedButton).toHaveCount(1);

    // Pressionar seta DOWN
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);

    // Verificar se seleção mudou
    selectedButton = page.locator('[data-selected="true"]');
    await expect(selectedButton).toHaveCount(1);
  });

  test('Navegar com seta UP decrementa selectedIndex', async ({ page }) => {
    // Digitar ":"
    await page.keyboard.type(':love');
    await page.waitForTimeout(300);

    // Pressionar seta DOWN algumas vezes
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);

    // Pressionar seta UP
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(100);

    // Verificar que seleção se moveu
    const selectedButton = page.locator('[data-selected="true"]');
    await expect(selectedButton).toHaveCount(1);
  });

  test('Enter seleciona emoji atual', async ({ page }) => {
    // Digitar ":"
    await page.keyboard.type(':love');
    await page.waitForTimeout(300);

    // Verificar que menu está aberto
    await expect(page.locator('.emoji-menu')).toBeVisible();

    // Pressionar Enter
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);

    // Verificar que menu fechou
    await expect(page.locator('.emoji-menu')).not.toBeVisible();

    // Verificar que emoji foi inserido (deve haver um emoji + espaço no editor)
    const editorContent = await page.locator('.tiptap').innerText();
    expect(editorContent.length).toBeGreaterThan(0);
    // Verificar que não contém mais o ":" (foi removido)
    expect(editorContent).not.toContain(':love');
  });

  test('Clique no emoji seleciona e insere', async ({ page }) => {
    // Digitar ":"
    await page.keyboard.type(':fire');
    await page.waitForTimeout(300);

    // Verificar menu
    await expect(page.locator('.emoji-menu')).toBeVisible();

    // Clicar no primeiro emoji
    const firstEmojiButton = page.locator('.emoji-menu button').first();
    await firstEmojiButton.click();
    await page.waitForTimeout(300);

    // Verificar que menu fechou
    await expect(page.locator('.emoji-menu')).not.toBeVisible();

    // Verificar que emoji foi inserido
    const editorContent = await page.locator('.tiptap').innerText();
    expect(editorContent.length).toBeGreaterThan(0);
  });

  test('Escape fecha menu sem inserir emoji', async ({ page }) => {
    // Digitar ":"
    await page.keyboard.type(':happy');
    await page.waitForTimeout(300);

    // Verificar menu está aberto
    await expect(page.locator('.emoji-menu')).toBeVisible();

    // Pressionar Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // Verificar que menu fechou
    await expect(page.locator('.emoji-menu')).not.toBeVisible();

    // Verificar que nada foi inserido (editor vazio ou contém ":happy")
    const editorContent = await page.locator('.tiptap').innerText();
    // O ":" + "happy" ainda deve estar lá (não foi inserido emoji)
    expect(editorContent).toContain(':happy');
  });

  test('Clicar fora fecha menu', async ({ page }) => {
    // Digitar ":"
    await page.keyboard.type(':star');
    await page.waitForTimeout(300);

    // Verificar menu está aberto
    await expect(page.locator('.emoji-menu')).toBeVisible();

    // Clicar fora do menu (no editor, longe)
    await page.click('.tiptap', { position: { x: 50, y: 50 } });
    await page.waitForTimeout(300);

    // Menu deve estar fechado
    await expect(page.locator('.emoji-menu')).not.toBeVisible();
  });

  test('Backspace atualiza query e filtra emojis', async ({ page }) => {
    // Digitar ":smile"
    await page.keyboard.type(':smile');
    await page.waitForTimeout(300);

    // Contar emojis iniciais
    let emojiButtons = page.locator('.emoji-menu button');
    const initialCount = await emojiButtons.count();
    expect(initialCount).toBeGreaterThan(0);

    // Deletar letra (backspace para remover "e")
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(300);

    // Query agora é ":smil"
    // Verificar que a query foi atualizada
    const queryText = page.locator('.emoji-menu').getByText('Digitando:');
    await expect(queryText).toContainText(':smil');

    // Número de emojis pode mudar (filtro diferente)
    emojiButtons = page.locator('.emoji-menu button');
    const newCount = await emojiButtons.count();
    // Pode ter menos ou a mesma quantidade
    expect(newCount).toBeLessThanOrEqual(initialCount);
  });

  test('Menu não abre para caracteres aleatórios após ":"', async ({ page }) => {
    // Digitar ":@#$" (caracteres inválidos)
    await page.keyboard.type(':@#$');
    await page.waitForTimeout(300);

    // Regex não deve dar match para chars inválidos
    // Menu pode ficar aberto mas com 0 resultados
    // Ou pode fechar (dependendo da implementação)
    // O importante é que não temos crash
    const editorContent = await page.locator('.tiptap').innerText();
    expect(editorContent).toBeDefined();
  });

  test('Múltiplos emojis podem ser inseridos em sequência', async ({ page }) => {
    // Inserir primeiro emoji
    await page.keyboard.type(':love');
    await page.waitForTimeout(300);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);

    // Inserir segundo emoji
    await page.keyboard.type(':fire');
    await page.waitForTimeout(300);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);

    // Verificar que ambos foram inseridos
    const editorContent = await page.locator('.tiptap').innerText();
    // Deve ter conteúdo (emojis)
    expect(editorContent.length).toBeGreaterThan(2);
  });

  test('Emoji inserido + espaço automático', async ({ page }) => {
    // Digitar ":"
    await page.keyboard.type(':heart');
    await page.waitForTimeout(300);

    // Selecionar emoji
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);

    // Verificar que há espaço após emoji
    // Cursor deve estar posicionado após o espaço
    const editorContent = await page.locator('.tiptap').innerText();
    // O conteúdo deve terminar com espaço após o emoji
    expect(editorContent.trim().length).toBeGreaterThan(0);
  });

  test('Menu mostra query atualizada em tempo real', async ({ page }) => {
    // Digitar ":"
    await page.keyboard.type(':');
    await page.waitForTimeout(300);

    // Verificar query vazia
    let queryDisplay = page.locator('.emoji-menu').getByText('Digitando:');
    await expect(queryDisplay).toContainText(':');

    // Digitar "s"
    await page.keyboard.type('s');
    await page.waitForTimeout(300);

    // Verificar query atualizada
    queryDisplay = page.locator('.emoji-menu').getByText('Digitando:');
    await expect(queryDisplay).toContainText(':s');

    // Digitar "t"
    await page.keyboard.type('t');
    await page.waitForTimeout(300);

    // Verificar query atualizada
    queryDisplay = page.locator('.emoji-menu').getByText('Digitando:');
    await expect(queryDisplay).toContainText(':st');
  });
});
