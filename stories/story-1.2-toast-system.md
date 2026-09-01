# Story 1.2: Criar Sistema de Toasts para Feedback

**Story ID:** STORY-1.2
**Epic:** EPIC-001 (Resolução de Débitos Técnicos)
**Sprint:** 1
**Pontos:** 3
**Status:** 📋 READY FOR DEVELOPMENT

---

## 📋 User Story

**Como** usuário do Bible Study,
**Quero** receber feedback visual de minhas ações (salvar, erro, sucesso),
**Para que** eu saiba que minhas ações foram processadas sem precisar de alertas bloqueantes.

---

## 🎯 Objetivo

1. Instalar e configurar biblioteca de toasts (sonner recomendado)
2. Substituir todas as chamadas de `alert()` por toasts
3. Adicionar toasts de feedback em ações importantes

---

## ✅ Critérios de Aceite

### Funcionalidade
- [ ] Instalar `sonner` como dependência
- [ ] Configurar `<Toaster />` no layout principal
- [ ] Toasts aparecem no canto superior direito
- [ ] Tipos: success (verde), error (vermelho), loading (spinner), info (azul)

### Integração
- [ ] Substituir `alert()` em `ChapterView.tsx` (erro ao deletar)
- [ ] Substituir `alert()` em `StudySelectionModal.tsx` (erro ao criar)
- [ ] Adicionar toast "Salvando..." ao salvar estudo
- [ ] Adicionar toast "Salvo com sucesso!" após salvar
- [ ] Adicionar toast de erro se falhar ao salvar

### Qualidade
- [ ] Zero `alert(` no codebase após implementação
- [ ] Toasts não bloqueiam interação
- [ ] Auto-dismiss após 3-5 segundos

---

## 📝 Tasks

- [ ] **1.2.1** Instalar `sonner`: `npm install sonner`
- [ ] **1.2.2** Adicionar `<Toaster />` em `app/layout.tsx`
- [ ] **1.2.3** Criar wrapper/helper em `src/lib/toast.ts`
- [ ] **1.2.4** Substituir alert() em ChapterView.tsx
- [ ] **1.2.5** Substituir alert() em StudySelectionModal.tsx
- [ ] **1.2.6** Adicionar feedback de save em [id]/page.tsx
- [ ] **1.2.7** Testar todos os cenários

---

## 🔧 Implementação Sugerida

```tsx
// app/layout.tsx
import { Toaster } from 'sonner'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
```

```typescript
// src/lib/toast.ts
import { toast } from 'sonner'

export const showToast = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  loading: (message: string) => toast.loading(message),
  dismiss: () => toast.dismiss(),
}

// Exemplo de uso com promise
export const toastPromise = <T,>(
  promise: Promise<T>,
  messages: { loading: string; success: string; error: string }
) => toast.promise(promise, messages)
```

```tsx
// Uso em [id]/page.tsx
import { toast } from 'sonner'

const handleSave = async () => {
  const toastId = toast.loading('Salvando...')
  try {
    await saveStudy(...)
    toast.success('Salvo com sucesso!', { id: toastId })
  } catch (error) {
    toast.error('Erro ao salvar. Tente novamente.', { id: toastId })
  }
}
```

---

## 📊 Débitos Resolvidos

| ID | Débito | Severidade |
|----|--------|-----------|
| FE-02 | `alert()` nativo do browser | 🔴 CRÍTICO |
| FE-13 | Sem feedback visual "salvando" | 🟠 ALTO |

---

## 🧪 Testes

### Manual
1. Salvar estudo → Toast "Salvando..." aparece, depois "Salvo!"
2. Causar erro de save (desconectar internet) → Toast de erro
3. Deletar estudo com erro → Toast de erro (não alert)
4. Verificar que toasts não bloqueiam interação

### Automatizado (futuro)
```typescript
// e2e/toast.spec.ts
test('save shows toast feedback', async ({ page }) => {
  await page.goto('/estudo/xxx')
  await page.fill('[data-testid="title-input"]', 'Novo título')
  await page.click('[data-testid="save-button"]')
  await expect(page.locator('text=Salvando')).toBeVisible()
  await expect(page.locator('text=Salvo com sucesso')).toBeVisible()
})
```

---

## 📎 Referências

- [Sonner Documentation](https://sonner.emilkowal.ski/)
- [Sonner GitHub](https://github.com/emilkowalski/sonner)
- [Technical Debt Assessment - FE-02, FE-13](../prd/technical-debt-assessment.md)

---

## ✅ Definition of Done

- [ ] Sonner instalado e configurado
- [ ] Toaster no layout principal
- [ ] Zero `alert(` no codebase
- [ ] Feedback de save funcionando
- [ ] Testado manualmente
- [ ] PR aprovado e merged

---

**Estimativa:** 2 horas
**Assignee:** Pendente
**Data:** 2026-01-26
