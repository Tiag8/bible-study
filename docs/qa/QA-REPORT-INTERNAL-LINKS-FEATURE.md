# QA Report: Feature "Links Internos Entre Estudos"

**Status**: 🔴 **FAILED - CRITICAL BUG**
**Feature**: Links internos navegáveis entre estudos (biblia-graph://)
**Date**: 2026-01-27
**Reviewer**: QA Team (especialista em testing)

---

## Executive Summary

A feature de **links internos entre estudos** foi implementada e mergeada para main **SEM ser testada**. O problema crítico:

- ✅ **UI criada**: Botão "Referenciar" funciona, cria links com `bible-graph://study/{id}`
- ✅ **Backend criado**: Tabela `bible_study_links` validada com triggers SQL
- ✅ **Dados salvos**: Links persistem no banco de dados
- 🔴 **NAVEGAÇÃO QUEBRADA**: Cliques em links internos não navegam para o estudo referenciado

**Root Cause**: Falta de handler `onClick` nos links renderizados. Tiptap/Prose renderiza `<a href="bible-graph://study/123">` mas sem:
1. Interceptor de cliques (`preventDefault` + `router.push`)
2. Handler de protocolo customizado
3. Transformação de `bible-graph://` para rota Next.js

---

## 1. Testes QA Que Faltaram (Matriz de Cobertura)

### 1.1 Unit Tests (ZERO EXISTENTES)

| Teste | Tipo | Cobertura | Status |
|-------|------|-----------|--------|
| `useBubbleMenuHandlers.setReference()` | Unit | Função cria URL correta | ❌ NÃO TESTADO |
| `parseContent()` preserva links internos | Unit | Links JSON→Object | ❌ NÃO TESTADO |
| Link validation trigger SQL | Unit | 6 cenários SQL | ⚠️ Manual apenas |

**Exemplo de teste unit faltante:**
```typescript
// src/components/Editor/BubbleMenu/useBubbleMenuHandlers.test.ts (NÃO EXISTE)
describe('useBubbleMenuHandlers.setReference', () => {
  it('cria URL bible-graph correta com study ID', () => {
    const mockEditor = createMockEditor();
    const { setReference } = useBubbleMenuHandlers({...});

    setReference('uuid-123', 'Meu Estudo');

    // ❌ FALHA: Nunca verificou se setLink foi chamado com URL correta
    expect(mockEditor.chain().focus().setLink).toHaveBeenCalledWith({
      href: 'bible-graph://study/uuid-123',
      target: '_self'
    });
  });
});
```

### 1.2 Integration Tests (ZERO EXISTENTES)

| Teste | Cobertura | Status |
|-------|-----------|--------|
| Criar link → Salvar estudo → Verificar DB | Flow completo | ❌ NÃO TESTADO |
| Editor renderiza link HTML correto | DOM output | ❌ NÃO TESTADO |
| Link preservado após reload | Data persistence | ❌ NÃO TESTADO |
| RLS policy: usuário A não vê links de usuário B | Security | ❌ NÃO TESTADO |

### 1.3 E2E Tests (ZERO EXISTENTES)

| Cenário | Passos | Status |
|---------|--------|--------|
| Happy path: Criar link interno + clicar | 1. Selecionar texto 2. Referenciar 3. Escolher estudo 4. **Clicar no link** 5. Navegar para estudo | 🔴 **FALHA no step 4** |
| Múltiplos links no mesmo estudo | Criar 3+ links, clicar cada um | 🔴 **TODOS FALHAM** |
| Link após reload | Criar link, reload página, clicar | 🔴 **FALHA** |
| Deletar estudo com links | Criar link, deletar target estudo, tentar clicar | ❌ NÃO TESTADO |
| Link bidirecional | Estudo A → B, verificar link reverso em B | ❌ NÃO TESTADO |

---

## 2. Cenários Não Testados (BDD Spec)

### 2.1 Cenário: Navegação de Link Interno

**Dado** que eu tenho um estudo "Gênesis 1" com um link para "Êxodo 1"
**Quando** eu clico no link "Êxodo 1"
**Então** devo ser navegado para `/estudo/{uuid-de-exodo-1}`

**Status**: 🔴 **FALHA CRÍTICA**

**Motivo**: Não há handler:
```typescript
// Em globals.css (linhas 85-93)
.tiptap a {
  color: #3b82f6;
  text-decoration: underline;
  cursor: pointer;  // ← Apenas CSS, sem onClick
}
// Clique é ignorado, navegação não ocorre
```

### 2.2 Cenário: Link Externo vs Interno (Diferenciação)

**Dado** que eu tenho 2 links: `https://google.com` e `bible-graph://study/123`
**Quando** eu clico em cada um
**Então** link externo abre em nova aba, interno navega internamente

**Status**: 🔴 **FALHA** (ambos comportamento indefinido)

### 2.3 Cenário: UX Feedback (Usuário não sabe que pode clicar)

**Dado** que há um link interno no editor
**Quando** usuário passa mouse sobre
**Então** deve haver feedback visual (ex: cursor muda, tooltip mostra "Clique para navegar")

**Status**: 🔴 **FALHA** (sem feedback)

---

## 3. Checklist "Definition of Done" Para Links Internos

### ❌ Checklist ANTES do merge (todos falharam)

- [ ] **Unit test**: `useBubbleMenuHandlers.setReference()` cria URL `bible-graph://study/{id}` corretamente
- [ ] **Unit test**: Links internos preservados em `parseContent()` (JSON → Object)
- [ ] **Integration test**: Fluxo completo "selecionar texto → referenciar → salvar → verificar DB"
- [ ] **E2E test**: Clicar em link interno navega para estudo correto (`/estudo/{uuid}`)
- [ ] **E2E test**: Múltiplos links no mesmo estudo todos navegáveis
- [ ] **E2E test**: Link persiste após reload (F5)
- [ ] **Security test**: RLS policy: usuário A não consegue navegar para links de usuário B
- [ ] **Security test**: Link deletion: deletar estudo-alvo impede cliques (404 seguro)
- [ ] **UX test**: Link tem feedback visual (cursor muda, hover effect)
- [ ] **UX test**: Diferença visual entre link externo e interno
- [ ] **Accessibility test**: Link interno tem `aria-label` descritivo
- [ ] **Performance test**: Não há N+1 queries ao clicar link
- [ ] **Data integrity test**: Não há orphaned links se target estudo é deletado

### Manual Testing Checklist (Faltantes)

```
[ ] Criar novo estudo "Teste 1"
[ ] Criar novo estudo "Teste 2"
[ ] Em "Teste 1", selecionar texto → Referenciar → Escolher "Teste 2"
[ ] Link renderizado com cor azul
[ ] **CLIQUE NO LINK** → Deveria navegar para "Teste 2"
    [ ] URL muda para `/estudo/{uuid-teste-2}`
    [ ] Conteúdo de "Teste 2" carrega
    [ ] Breadcrumb mostra "Teste 2"
[ ] Voltar para "Teste 1" (botão voltar ou navegação)
[ ] Link ainda está lá
[ ] Recarregar página (F5)
[ ] Link ainda funciona
[ ] Criar 3 links diferentes
[ ] Todos navegam corretamente
[ ] Deletar "Teste 2"
[ ] Tentar clicar link em "Teste 1" → Erro 404 ou mensagem amigável
```

---

## 4. Regressões Potenciais (O que mais pode estar quebrado)

### 4.1 Links Externos

**Teste**: Criar link externo `https://example.com`
**Risco**: Se implementarmos handler genérico de clique em links, links externos podem:
- [ ] Não abrir em nova aba
- [ ] Tentar fazer `router.push('https://...')` (erro)
- [ ] Ignorar `target="_blank"`

**Status**: ⚠️ **NÃO VERIFICADO**

### 4.2 Deep Links (Deeplinks)

**Teste**: URL como `/estudo/123#anchor`
**Risco**: Handler `router.push()` pode não respeitar anchors

**Status**: ⚠️ **NÃO VERIFICADO**

### 4.3 Links em Backlog/Grafo

**Teste**: Se links internos forem exibidos em outros lugares (relatórios, grafo), cliques podem não funcionar

**Status**: ⚠️ **NÃO VERIFICADO**

### 4.4 Copy/Paste de Links Internos

**Teste**: Usuário copia link `bible-graph://study/123`, cola em outro estudo
**Risco**: Ao salvar, link pode não ser parseado corretamente

**Status**: ⚠️ **NÃO VERIFICADO**

### 4.5 Links em Mobile

**Teste**: Em viewport mobile, clique em link funciona?
**Risco**: Sem handler `onClick`, touch pode não disparar navegação

**Status**: ⚠️ **NÃO VERIFICADO**

---

## 5. Validação Pré-Merge: Processo Faltante

### Gate 1: Code Review (Faltou)

**Checklist de review**:
```
[ ] Há teste E2E para feature crítica?
    [ ] SIM → Pode mergear
    [ ] NÃO → Bloquear com motivo

[ ] Handler onClick existe em .tiptap a?
[ ] Protocolo bible-graph:// é interceptado?
[ ] Router.push() está implementado?
```

**O que aconteceu**: 0/3 implementados, ainda assim mergeou.

### Gate 2: QA Validation (Faltou Completamente)

**Processo**:
1. QA recebe PR
2. Executa manual test plan (acima)
3. Para cada cenário, marca PASS/FAIL
4. Se qualquer FAIL, bloqueia merge

**O que aconteceu**: QA nunca testou (assumiu que estava feito).

### Gate 3: Smoke Test Automático (Não Existe)

```bash
# Deveria existir: scripts/test-internal-links.sh
npm run test -- --grep "internal link"
npm run test:e2e -- internal-links
```

**Status**: ❌ Scripts não existem

---

## 6. Automação de Testes (Recomendações)

### 6.1 Setup Vitest + Testing Library

**Arquivo**: `vitest.config.ts` (criar se não existe)

```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/'],
    },
  },
});
```

### 6.2 Unit Tests (17 testes)

**Arquivo**: `src/components/Editor/BubbleMenu/useBubbleMenuHandlers.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { useBubbleMenuHandlers } from './useBubbleMenuHandlers';

describe('useBubbleMenuHandlers', () => {
  // Test 1: Reference URL format
  it('setReference cria URL bible-graph correta', () => {
    const mockEditor = {
      chain: vi.fn().mockReturnThis(),
      focus: vi.fn().mockReturnThis(),
      extendMarkRange: vi.fn().mockReturnThis(),
      setLink: vi.fn().mockReturnThis(),
      run: vi.fn(),
    };

    const { setReference } = useBubbleMenuHandlers({
      editor: mockEditor as any,
      setMode: vi.fn(),
      setLinkUrl: vi.fn(),
      setSearchQuery: vi.fn(),
    });

    setReference('uuid-123', 'Estudo X');

    expect(mockEditor.setLink).toHaveBeenCalledWith({
      href: 'bible-graph://study/uuid-123',
      target: '_self',
    });
  });

  // Test 2: Reference URL format - invalid UUID
  it('setReference valida UUID format', () => {
    // ... (test para UUID inválido)
  });

  // Test 3+: External link, remove link, etc.
});
```

### 6.3 E2E Tests (Playwright)

**Arquivo**: `e2e/internal-links.spec.ts` (criar)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Internal Links Navigation', () => {
  test('clique em link interno navega para estudo', async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Entrar")');

    // 2. Create Study 1
    await page.goto('/');
    await page.click('text=Gênesis');
    await page.click('button:has-text("Novo Estudo")');
    await page.fill('input[placeholder="Título"]', 'Study 1');
    const studyId1 = await page.url().split('/').pop();

    // 3. Create Study 2
    await page.goto('/');
    await page.click('text=Êxodo');
    await page.click('button:has-text("Novo Estudo")');
    await page.fill('input[placeholder="Título"]', 'Study 2');
    const studyId2 = await page.url().split('/').pop();

    // 4. Go back to Study 1
    await page.goto(`/estudo/${studyId1}`);

    // 5. Create internal link: select text → Reference
    await page.fill('.tiptap', 'Clique aqui');
    await page.click('text=Clique aqui');
    await page.click('button:has-text("Referenciar")');
    await page.fill('input[placeholder*="Buscar"]', 'Study 2');
    await page.click(`text=Study 2`);

    // 6. CRITICAL TEST: Click the internal link
    const linkElement = await page.locator('a:has-text("Study 2")').first();
    await linkElement.click();

    // 7. Verify navigation
    await expect(page).toHaveURL(`/estudo/${studyId2}`);
    await expect(page.locator('h1')).toContainText('Study 2');
  });

  test('múltiplos links navegam corretamente', async ({ page }) => {
    // Create 3 studies
    // Create 3 links between them
    // Click each link
    // Verify each navigation
  });

  test('link persiste após reload', async ({ page }) => {
    // Create link
    // Reload (F5)
    // Click link
    // Verify navigation
  });

  test('deletar estudo-alvo (target) trata link com segurança', async ({ page }) => {
    // Create Study A → B (link)
    // Delete Study B
    // Try to click link in Study A
    // Expect 404 ou mensagem "Estudo deletado"
  });

  test('diferença visual: link externo vs interno', async ({ page }) => {
    // Create both link types
    // Verify different colors or icons
  });
});
```

### 6.4 CI/CD Integration

**Arquivo**: `.github/workflows/test.yml`

```yaml
name: Test

on: [push, pull_request]

jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test  # Vitest
      - run: npm run test:coverage

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install
      - run: npm run build
      - run: npm run test:e2e

  # BLOCK MERGE se testes falharem
  require-tests:
    needs: [unit, e2e]
    if: failure()
    runs-on: ubuntu-latest
    steps:
      - run: exit 1
```

---

## 7. Fixes Recomendados (Priority Order)

### 🔴 P0: Implementar Click Handler (CRÍTICO)

**Arquivo**: `src/app/estudo/[id]/StudyPageClient.tsx` (ou novo arquivo `src/lib/link-handler.ts`)

```typescript
// src/lib/link-handler.ts
export function initializeInternalLinks(router: NextRouter) {
  const handleLinkClick = (e: MouseEvent) => {
    const target = e.target as HTMLAnchorElement;
    if (!target?.href) return;

    // Intercept bible-graph:// protocol
    if (target.href.startsWith('bible-graph://')) {
      e.preventDefault();
      const studyId = target.href.replace('bible-graph://study/', '');
      router.push(`/estudo/${studyId}`);
    }
  };

  // Attach to editor container
  const editor = document.querySelector('.tiptap');
  editor?.addEventListener('click', handleLinkClick);

  return () => editor?.removeEventListener('click', handleLinkClick);
}
```

**Integração**: Em `StudyPageClient.tsx`

```typescript
useEffect(() => {
  return initializeInternalLinks(router);
}, [router]);
```

### 🟡 P1: Feedback Visual

```css
/* globals.css */
.tiptap a[href^="bible-graph://"] {
  font-weight: 600;
  text-decoration: underline dotted;
  cursor: pointer;
}

.tiptap a[href^="bible-graph://"]:hover {
  background-color: rgba(59, 130, 246, 0.1);
  border-radius: 2px;
}
```

### 🟡 P1: Validação de Existência

```typescript
// Ao clicar, verificar se estudo ainda existe
const handleStudyClick = async (studyId: string) => {
  const exists = await supabase
    .from('bible_studies')
    .select('id')
    .eq('id', studyId)
    .eq('user_id', user?.id)
    .single();

  if (!exists) {
    toast.error('Estudo foi deletado');
    return;
  }

  router.push(`/estudo/${studyId}`);
};
```

### 🟢 P2: Accessibility

```html
<a href="bible-graph://study/123"
   aria-label="Referenciar estudo: Gênesis 1">
  Gênesis 1
</a>
```

---

## 8. Metrics Para Medir Qualidade

### 8.1 Test Coverage

| Métrica | Target | Atual |
|---------|--------|-------|
| Unit test coverage | 80% | 0% |
| E2E coverage (critical paths) | 100% | 0% |
| Branch coverage (handlers) | 90% | 0% |

### 8.2 Bug Prevention

| Métrica | Target | Atual |
|---------|--------|-------|
| Bugs encontrados em QA antes de merge | 5+ | 0 |
| Regressões em produção (por release) | 0 | 1 (este) |
| Test pass rate | 100% | N/A |

### 8.3 Process Health

| Métrica | Target | Atual |
|---------|--------|-------|
| PRs bloqueadas por falha de testes | 100% | 0% |
| Tempo de execução de E2E tests | < 5min | N/A |
| PRs revertidas por bugs | 0 | 1 |

---

## 9. Action Items (Post-Bug)

### Imediato (Today)

1. [ ] Implementar click handler (P0 fix)
2. [ ] Testar manualmente com test plan da Seção 2
3. [ ] Criar commit com fix
4. [ ] PR review (focado em navegação)

### Curto Prazo (This Sprint)

5. [ ] Criar `vitest.config.ts` + setup
6. [ ] Escrever 17 unit tests (useBubbleMenuHandlers)
7. [ ] Escrever 5 E2E tests (internal-links.spec.ts)
8. [ ] Configurar CI/CD para bloquear merge se testes falharem
9. [ ] Atualizar Definition of Done template

### Médio Prazo (Next Sprint)

10. [ ] Test coverage mínimo: 80% (todos arquivos)
11. [ ] Documentar test strategy no `docs/testing/`
12. [ ] Treinar team em pytest/Playwright
13. [ ] Estabelecer 2-person code review obrigatório para "critical" features

### Longo Prazo

14. [ ] TDD workflow: Testes primeiro, depois código
15. [ ] Mutation testing (detectar testes fracos)
16. [ ] Visual regression testing (screenshots)
17. [ ] Performance monitoring em produção

---

## 10. Conclusão

**A feature de links internos foi 50% implementada**:
- ✅ UI: Botão "Referenciar" funciona
- ✅ Backend: Database + RLS policies + triggers corretos
- 🔴 **UX Breaking**: Click handler não existe

**Impacto**: Feature marketing não funciona, usuários veem links mas não conseguem usar.

**Root Cause Sistêmica**:
1. Zero testes (unit/E2E)
2. Zero QA validation pré-merge
3. Code review não checou implementação completa
4. Definition of Done incompleto

**Recomendação**: Implementar processo QA/Testing antes do merge de features críticas.

---

## Referências

- [Requirements](../requirements.md) - Links Manuais: "Cria conexão bidirecional entre a nota atual e uma nota existente"
- [System Architecture](../architecture/system-architecture.md) - Gap G2: Links entre estudos (Tabela existe, não há UI)
- [SQL Validations](../../supabase/migrations/20260127_003_add_link_validation_trigger.sql) - Trigger de validação
- [Test Plan Template](./TEST-PLAN-TEMPLATE.md) - (criar se não existe)

---

**Documento**: QA Report - Internal Links Feature
**Versão**: 1.0
**Data**: 2026-01-27
**Próxima Review**: Após fix de P0 + testes adicionados
