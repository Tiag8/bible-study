# 🔍 S1.1 Debug Click Handler - Execução Completa

**Story**: S1.1 - Debug Click Handler Existente
**Data**: 2026-01-28
**Developer**: Dex (Builder)
**Status**: 🔄 IN PROGRESS

---

## Procedimento de Debug (Passo-a-Passo)

### ETAPA 1: Verificar DOM Readiness

✅ **VERIFICADO**:
- Arquivo: `src/components/Editor/index.tsx` (linha 133)
- Classe `.tiptap` é adicionada pelo Tiptap automaticamente
- Editor renderiza via `<EditorContent class="tiptap ..." />`
- Elemento existe no DOM quando Editor está montado

```
Elemento .tiptap:
├─ Classe: "tiptap prose prose-sm max-w-none p-4 focus:outline-none min-h-[300px]"
├─ Pai: div.bg-white (dentro de main)
└─ Conteúdo: Rich text editável
```

---

### ETAPA 2: Verificar Event Listener

**Localização**: `src/app/estudo/[id]/StudyPageClient.tsx` (linhas 202-247)

**Handler Implementation**:
```typescript
const handleLinkClick = (e: Event) => {
  if (!(e instanceof MouseEvent)) return;
  const target = e.target as HTMLElement;
  const link = target.closest('a[href^="/estudo/"]');

  if (link instanceof HTMLAnchorElement) {
    const href = link.getAttribute('href');
    if (href?.startsWith('/estudo/')) {
      e.preventDefault();
      router.push(href);
      return;
    }
  }
};
```

**Registration**:
```typescript
const tryRegisterListener = () => {
  const editorElement = document.querySelector('.tiptap');
  attempts++;

  if (editorElement) {
    editorElement.addEventListener('click', handleLinkClick);
    // ✅ Listener registrado com sucesso
  } else if (attempts < maxAttempts) {
    setTimeout(tryRegisterListener, 500); // Retry logic
  }
};

tryRegisterListener(); // Executa retry loop
```

**Cleanup**:
```typescript
return () => {
  document.querySelectorAll('.tiptap').forEach((el) => {
    el.removeEventListener('click', handleLinkClick);
  });
};
```

---

### ETAPA 3: Testar Click Handler

**Setup para teste manual**:
1. Login na app (http://localhost:3000)
2. Navegar para estudo existente (/estudo/[uuid])
3. No editor, selecionar texto
4. Clicar "Referenciar" → escolher outro estudo (gera link `/estudo/{target-id}`)
5. Clicar no link gerado

**Logs Esperados** (adicionar temporário):
```javascript
console.debug('[CLICK_HANDLER] handleLinkClick called', { href, timestamp: Date.now() });
console.debug('[CLICK_HANDLER] router.push() triggered', { href });
```

---

### ETAPA 4: Verificar router.push()

**Arquivo**: `src/app/estudo/[id]/StudyPageClient.tsx` (linhas 216-219)

```typescript
if (href?.startsWith('/estudo/')) {
  e.preventDefault();              // Previne navegação padrão
  router.push(href);               // Dispara Next.js navigation
  return;
}
```

**Validações**:
- [ ] `e.preventDefault()` chamado ANTES router.push()
- [ ] `href` sempre inicia com `/estudo/`
- [ ] URL na address bar muda após click
- [ ] StudyPageClient recarrega com novo study

---

### ETAPA 5: Testar Navegação Final

**Test Case 1**: Criar → Clicar → Navegar
```
Setup:
1. Criar Study A (Gênesis 1)
2. Criar Study B (Êxodo 1)
3. Em A, criar link para B (via Referenciar)

Action:
4. Clicar link em A

Expected:
5. URL muda para /estudo/{B_uuid}
6. Study B renderiza (título, conteúdo visível)
7. Breadcrumbs mostram "Êxodo"
8. Zero console errors
```

**Test Case 2**: Multiple Clicks
```
Setup: Studies A, B, C linkados em cadeia

Action:
1. De A, clicar link para B
2. De B, clicar link para C
3. De C, fazer back (browser button)

Expected:
- Volta para B
- Forward button funciona
- Zero errors
```

---

## Descobertas Iniciais

### ✅ Handler está corretamente implementado

**Pontos positivos**:
1. Elemento `.tiptap` é selecionado corretamente
2. Event listener é registrado com retry logic (robusto)
3. Handler valida `href` antes de navegar (seguro)
4. Cleanup remove listeners corretamente (sem memory leaks)
5. `router.push()` é Next.js standard (confiável)

### 🟡 Possíveis Problemas Identificados

**Problema #1**: Timing na montagem
- Handler é registrado NO MESMO RENDER que StudyPageClient
- Pode haver race condition se .tiptap não estiver no DOM ainda
- Solução: Retry logic com 5 tentativas de 500ms = 2.5s timeout ✅

**Problema #2**: Event delegation
- `target.closest('a[href^="/estudo/"]')` vai buscar <a> mais próximo
- Se link está dentro de múltiplos spans, pode não encontrar
- Test: Links em blockquotes, highlights, lists

**Problema #3**: Router context
- `router` vem de `useRouter()` (Next.js hook)
- Em desenvolvimento, funciona ✓
- Em produção, pode ter issues? (unlikely)

### 🔴 Possível Root Cause: Links não estão sendo criados corretamente

**Hipótese**: Links talvez NÃO estejam sendo criados como `/estudo/{id}`

- BubbleMenuReference cria links via `editor.setLink({ href: `/estudo/${id}` })`
- Mas: Content pode estar armazenado com protocolo legado `bible-graph://`?
- Migration 3 (20260128) converteu protocolo em DB, mas content em JSONB pode estar errado

**Test**: Verificar conteúdo de study_A.content
```sql
SELECT content FROM bible_studies
WHERE id = '...'
LIMIT 1;

-- Procurar por links: deve ter /estudo/, não bible-graph://
```

---

## ✅ AC Checklist - TODOS COMPLETOS

- [x] AC 1: querySelector('.tiptap') encontra elemento
  - Status: ✅ VERIFIED (classe adicionada por Tiptap)

- [x] AC 2: Event listener registrado
  - Status: ✅ WORKING (listener global + data-href)
  - Confirmado: Console mostra "📌 Registrando handler global"

- [x] AC 3: handleLinkClick disparado ao clicar
  - Status: ✅ WORKING
  - Confirmado: Console mostra "🔗 Link encontrado"

- [x] AC 4: router.push() chamado
  - Status: ✅ WORKING
  - Confirmado: Console mostra "✅ Navegando para /estudo/..."

- [x] AC 5: Navegação completa
  - Status: ✅ WORKING 100%
  - Confirmado: URL muda, estudo carrega, histórico browser funciona

- [x] AC 6: Document findings
  - Status: ✅ COMPLETO (abaixo)

---

## 🧪 TESTE MANUAL - Próximas Etapas

### Setup (FEITO ✅)
- Dev server está rodando em http://localhost:3000
- Usuário logado: tiag8guimaraes@gmail.com
- Credenciais: 123456

### Estudos Disponíveis para Teste

| Study ID | Livro | Capítulo | Título |
|----------|-------|----------|--------|
| `9379a34e-3a78-4c12-b431-20e1388a0d8b` | 2 Samuel | 11 | Trabalhar com propósito |
| `e93bdf1f-22be-4c4f-b259-1d2f2bb66214` | Provérbios | 21 | Tratar as motivações |
| `ebc97036-a0f4-45f5-81ff-5cc050bf1b4b` | Eclesiastes | 4 | A dor da opressão |

### Plano de Testes Manuais

**ETAPA 1: Verificar se estudo carrega + inspect .tiptap element**
1. Navegar para: http://localhost:3000/estudo/9379a34e-3a78-4c12-b431-20e1388a0d8b
2. Abrir DevTools (F12)
3. No Console, rodar: `document.querySelector('.tiptap') !== null` (deve retornar `true`)
4. Screenshot do elemento e HTML

**ETAPA 2: Adicionar link manualmente ao estudo**
1. No editor, selecionar algum texto
2. Usar Bubble Menu para criar link referenciando outro estudo
3. O link deve ter formato: `/estudo/{target-uuid}`
4. Salvar (auto-save)
5. Verificar no banco: `SELECT content FROM bible_studies WHERE id = '...'` contém o link correto

**ETAPA 3: Testar click handler**
1. Adicionar logs ao StudyPageClient.tsx:
   ```typescript
   console.debug('[CLICK_HANDLER] handleLinkClick called', { href, timestamp: Date.now() });
   console.debug('[CLICK_HANDLER] router.push() triggered', { href });
   ```
2. Clicar no link no editor
3. Observar console para logs
4. Verificar URL na address bar (deve mudar para `/estudo/{target-uuid}`)

**ETAPA 4: Teste de navegação completa**
- [ ] Click dispara handler (console logs aparecem)
- [ ] URL muda corretamente
- [ ] Novo estudo renderiza (título, conteúdo visível)
- [ ] Sem console errors

### 🔍 Findings Finais (Testes Executados)

**Teste #1: Link Creation ✅**
- Link criado com sucesso via Bubble Menu "Referenciar"
- Console: `Referência criada para: Provérbios 21 ...`
- Content salvo automaticamente

**Teste #2: Click Handler ✅ (COM BUG CORRIGIDO)**
- **Problema Original**: Aba extra abria ao clicar
- **Root Cause**: Browser interpretava `<a href="/estudo/...">` como link normal
- **Solução Implementada**:
  - Remover `href` de links internos (substituir por `data-href`)
  - Click handler procura por `data-href^="/estudo/"`
  - `e.preventDefault()` + `e.stopPropagation()` + `e.stopImmediatePropagation()` bloqueiam navegação padrão
- **Resultado**: ✅ URL muda, novo estudo carrega, NENHUMA aba extra!

**Teste #3: Navigation History ✅**
- Back button funciona
- Forward button funciona
- Zero console errors

### 🏆 Conclusão

**Status: S1.1 COMPLETO ✅**

O click handler está 100% funcional. Links internos navegam via `router.push()` sem efeitos colaterais.

---

### ⚠️ Issues Encontrados (Separados de S1.1)

**Issue #1: UX/UI - Posicionamento do Link**
- Quando um link é criado no topo do editor, aparece antes do título
- Recomendação: Criar aba lateral DIREITA para gerenciar referências (conforme você mencionou)
- Escopo: Product decision (não é bug, é design/UX)

**Issue #2: Console Warnings**
- Extension context invalidated (Chrome extension, não afeta funcionalidade)
- React warning sobre preload de fontes (não afeta funcionalidade)

---

**Status Final**: 🟢 S1.1 - DEBUG CLICK HANDLER COMPLETO
**Próximo**: S1.2 (Implementar fix se necessário) ou product/UI refinement?

---

**Last Updated**: 2026-01-28 (Dex - Builder)
**Tester**: Usuário (UX/UI validation)
**Result**: 100% Funcional ✅
