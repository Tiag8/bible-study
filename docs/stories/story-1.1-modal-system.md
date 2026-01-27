# Story 1.1: Criar Sistema de Modais Customizadas

**Story ID:** STORY-1.1
**Epic:** EPIC-001 (Resolução de Débitos Técnicos)
**Sprint:** 1
**Pontos:** 5
**Status:** 📋 READY FOR DEVELOPMENT

---

## 📋 User Story

**Como** usuário do Bible Study,
**Quero** ver modais de confirmação consistentes com o design do app,
**Para que** eu tenha uma experiência visual coesa e profissional.

---

## 🎯 Objetivo

Substituir todas as chamadas de `confirm()` nativo do browser por um componente `<ConfirmModal>` customizado usando Radix AlertDialog.

---

## ✅ Critérios de Aceite

### Funcionalidade
- [ ] Criar componente `<ConfirmModal>` em `src/components/ui/confirm-modal.tsx`
- [ ] Componente aceita props: `open`, `onConfirm`, `onCancel`, `title`, `description`, `variant`
- [ ] Variant "destructive" mostra botão vermelho
- [ ] Modal fecha ao clicar fora ou pressionar Escape
- [ ] Focus trap funciona (Tab não sai do modal)

### Integração
- [ ] Substituir `confirm()` em `ChapterView.tsx` (delete estudo)
- [ ] Substituir `confirm()` em `StudySelectionModal.tsx` (delete estudo)
- [ ] Substituir `confirm()` em `[id]/page.tsx` (sair sem salvar)

### Qualidade
- [ ] Zero `confirm(` no codebase após implementação
- [ ] Componente tem aria-labels apropriados
- [ ] Funciona em mobile (touch)

---

## 📝 Tasks

- [ ] **1.1.1** Criar `src/components/ui/confirm-modal.tsx` usando Radix AlertDialog
- [ ] **1.1.2** Adicionar variantes (default, destructive)
- [ ] **1.1.3** Substituir confirm() em ChapterView.tsx
- [ ] **1.1.4** Substituir confirm() em StudySelectionModal.tsx
- [ ] **1.1.5** Substituir confirm() em [id]/page.tsx
- [ ] **1.1.6** Testar focus trap e keyboard navigation
- [ ] **1.1.7** Testar em mobile (375px viewport)

---

## 🔧 Implementação Sugerida

```tsx
// src/components/ui/confirm-modal.tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ConfirmModalProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
}

export function ConfirmModal({
  open,
  onConfirm,
  onCancel,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "default"
}: ConfirmModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={variant === "destructive" ? "bg-red-600 hover:bg-red-700" : ""}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

---

## 📊 Débitos Resolvidos

| ID | Débito | Severidade |
|----|--------|-----------|
| FE-01 | `confirm()` nativo do browser | 🔴 CRÍTICO |

---

## 🧪 Testes

### Manual
1. Clicar "Deletar" em um estudo → Modal customizada aparece
2. Pressionar Escape → Modal fecha
3. Clicar fora → Modal fecha
4. Tab através do modal → Focus não sai
5. Em mobile: Touch funciona normalmente

### Automatizado (futuro)
```typescript
// e2e/confirm-modal.spec.ts
test('delete study shows custom modal', async ({ page }) => {
  await page.goto('/estudo/xxx')
  await page.click('[data-testid="delete-button"]')
  await expect(page.locator('[role="alertdialog"]')).toBeVisible()
  await expect(page.locator('text=Confirmar')).toBeVisible()
})
```

---

## 📎 Referências

- [Radix AlertDialog](https://www.radix-ui.com/primitives/docs/components/alert-dialog)
- [shadcn/ui AlertDialog](https://ui.shadcn.com/docs/components/alert-dialog)
- [Technical Debt Assessment - FE-01](../prd/technical-debt-assessment.md)

---

## ✅ Definition of Done

- [ ] Componente criado e funcionando
- [ ] Todas as 3 substituições feitas
- [ ] Zero `confirm(` no codebase
- [ ] Focus trap funcionando
- [ ] Testado em mobile
- [ ] PR aprovado e merged

---

**Estimativa:** 3 horas
**Assignee:** Pendente
**Data:** 2026-01-26
