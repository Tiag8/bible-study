# UX Specialist Review

**Projeto:** Bible Study
**Data:** 2026-01-26
**Revisor:** @ux-design-expert
**Documento Base:** `docs/prd/technical-debt-DRAFT.md`

---

## 📋 Gate Status: ⚠️ APPROVED WITH CONDITIONS

O assessment de Frontend/UX está **abrangente** mas algumas prioridades precisam ajuste. Os 6 débitos críticos são realmente críticos e devem ser resolvidos antes de produção.

---

## 1️⃣ DÉBITOS VALIDADOS

| ID | Débito | Severidade Original | Severidade Ajustada | Horas | Impacto UX |
|----|--------|---------------------|---------------------|-------|------------|
| FE-01 | `confirm()` nativo | 🔴 CRÍTICO | 🔴 CRÍTICO ✓ | 3h | Quebra consistência design system |
| FE-02 | `alert()` nativo | 🔴 CRÍTICO | 🔴 CRÍTICO ✓ | 2h | Bloqueia interação, UX ruim |
| FE-03 | Delete hover-only | 🔴 CRÍTICO | 🔴 CRÍTICO ✓ | 2h | **a11y blocker** - touch users blocked |
| FE-04 | Color-only status | 🔴 CRÍTICO | 🔴 CRÍTICO ✓ | 1h | **a11y blocker** - daltonismo |
| FE-05 | Focus trap modals | 🔴 CRÍTICO | 🟠 ALTO ↓ | 1h | Radix já implementa. Verificar apenas. |
| FE-06 | Touch targets < 44px | 🔴 CRÍTICO | 🔴 CRÍTICO ✓ | 2h | **WCAG violation** |
| FE-07 | ColorMap hardcoded | 🟠 ALTO | 🟠 ALTO ✓ | 2h | Manutenibilidade |
| FE-08 | Design tokens | 🟠 ALTO | 🟠 ALTO ✓ | 3h | Escalabilidade do design system |
| FE-09 | BubbleMenu mobile | 🟠 ALTO | 🔴 CRÍTICO ↑ | 2h | **50%+ usuários mobile** - crítico |
| FE-10 | aria-labels ícones | 🟠 ALTO | 🟡 MÉDIO ↓ | 1h | a11y importante mas não blocker |
| FE-11 | getTagColor duplicada | 🟡 MÉDIO | 🟡 MÉDIO ✓ | 1h | DRY violation |
| FE-12 | TODO backlog | 🟡 MÉDIO | 🟡 MÉDIO ✓ | 3h | Feature incompleta |
| FE-13 | Feedback "salvando" | 🟡 MÉDIO | 🟠 ALTO ↑ | 1h | **Usuário não sabe se salvou** - ansiedade |
| FE-14 | Undo/redo | 🟡 MÉDIO | 🟠 ALTO ↑ | 2h | **Perda de dados** sem recovery |
| FE-15 | Find in editor | 🟡 MÉDIO | 🟡 MÉDIO ✓ | 2h | Power user feature |
| FE-16 | Dropdown inconsistente | 🟡 MÉDIO | 🟢 BAIXO ↓ | 1h | Minor visual |
| FE-17 | Contrast ratio | 🟡 MÉDIO | 🟡 MÉDIO ✓ | 1h | a11y compliance |
| FE-18 | Responsividade | 🟡 MÉDIO | 🟡 MÉDIO ✓ | 2h | Mobile experience |
| FE-19 | Status select duplicado | 🟡 MÉDIO | 🟢 BAIXO ↓ | 1h | Refactor cosmético |
| FE-20 | Tag select duplicado | 🟡 MÉDIO | 🟢 BAIXO ↓ | 1h | Refactor cosmético |
| FE-21 | Dark mode | 🟢 BAIXO | 🟢 BAIXO ✓ | 5h | Nice-to-have |
| FE-22 | Skip link | 🟢 BAIXO | 🟢 BAIXO ✓ | 0.5h | a11y minor |
| FE-23 | Keyboard docs | 🟢 BAIXO | 🟢 BAIXO ✓ | 1h | Discoverability |
| FE-24 | ESLint warnings | 🟢 BAIXO | 🟢 BAIXO ✓ | 1h | Code quality |
| FE-25 | Unused CSS | 🟢 BAIXO | 🟢 BAIXO ✓ | 0.5h | Cleanup |

**Resumo de Ajustes:**
- 1 débito **elevado** para CRÍTICO (FE-09 BubbleMenu mobile)
- 2 débitos **elevados** para ALTO (FE-13, FE-14)
- 1 débito **rebaixado** de CRÍTICO (FE-05)
- 3 débitos **rebaixados** para BAIXO (FE-16, FE-19, FE-20)

---

## 2️⃣ DÉBITOS ADICIONADOS

| ID | Débito | Severidade | Horas | Descrição |
|----|--------|-----------|-------|-----------|
| **FE-26** | Sem onboarding/tutorial | 🟡 MÉDIO | 4h | Novo usuário não sabe como usar o app. Adicionar tour guiado ou tooltips. |
| **FE-27** | Sem página de erro 404/500 customizada | 🟢 BAIXO | 2h | Erros mostram página Next.js default. Criar páginas branded. |
| **FE-28** | Sem skeleton loading | 🟡 MÉDIO | 2h | Página "pisca" ao carregar. Usar skeleton screens para perceived performance. |

---

## 3️⃣ RESPOSTAS AO ARCHITECT

### Pergunta 1: Design de modal - Radix Dialog ou custom?

**Recomendação:** **Radix Dialog** (já está instalado via shadcn/ui)

```tsx
// Componente: src/components/ui/confirm-modal.tsx
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

export function ConfirmModal({
  open,
  onConfirm,
  onCancel,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "default" // "default" | "destructive"
}) {
  return (
    <AlertDialog open={open} onOpenChange={onCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
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

**Razão:** Radix já tem focus trap, escape key, click outside, a11y built-in.

### Pergunta 2: Delete button - always visible ou context menu?

**Recomendação:** **Always visible com opacidade reduzida**

```tsx
// Antes (hover-only)
<button className="opacity-0 group-hover:opacity-100">
  <Trash2 />
</button>

// Depois (sempre visível, discreto)
<button className="opacity-40 hover:opacity-100 transition-opacity">
  <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
</button>
```

**Alternativa:** Ícone de 3 pontos (...) que abre menu com "Editar" e "Excluir"

**Razão:** Context menu (right-click) não funciona em mobile. Always visible é mais acessível.

### Pergunta 3: Ícones para status

**Recomendação:**

| Status | Ícone | Cor | Visual |
|--------|-------|-----|--------|
| Estudando | `●` (círculo cheio) | Azul #3b82f6 | 🔵 Estudando |
| Revisando | `◐` (meio círculo) ou `↻` | Roxo #a855f7 | 🟣 Revisando |
| Concluído | `✓` (checkmark) | Verde #10b981 | ✅ Concluído |

```tsx
const STATUS_CONFIG = {
  estudando: { icon: Circle, color: 'text-blue-500', label: 'Estudando' },
  revisando: { icon: RefreshCw, color: 'text-purple-500', label: 'Revisando' },
  concluído: { icon: CheckCircle, color: 'text-green-500', label: 'Concluído' },
}
```

**Razão:** Ícones de Lucide já disponíveis. Combinação ícone + cor + texto = máxima acessibilidade.

### Pergunta 4: Design tokens do zero ou convenção existente?

**Recomendação:** **Usar convenção Tailwind + extensão mínima**

```typescript
// src/lib/design-tokens.ts
export const COLORS = {
  // Status (com ícone associado)
  status: {
    estudando: { bg: 'bg-blue-100', text: 'text-blue-700', icon: 'Circle' },
    revisando: { bg: 'bg-purple-100', text: 'text-purple-700', icon: 'RefreshCw' },
    concluído: { bg: 'bg-green-100', text: 'text-green-700', icon: 'CheckCircle' },
  },

  // Tags (por tipo)
  tags: {
    Versículos: { bg: 'bg-amber-100', text: 'text-amber-700' },
    Temas: { bg: 'bg-blue-100', text: 'text-blue-700' },
    Princípios: { bg: 'bg-purple-100', text: 'text-purple-700' },
  },

  // Categorias bíblicas
  categories: {
    pentateuco: '#10b981',
    historicos: '#f59e0b',
    poeticos: '#a855f7',
    profetasMaiores: '#ef4444',
    // ...
  }
} as const;

export const SPACING = {
  touch: '44px', // Mínimo WCAG para touch targets
} as const;
```

**Razão:** Não reinventar a roda. Tailwind já é o design system. Apenas centralizar valores customizados.

### Pergunta 5: Dark mode é prioridade?

**Recomendação:** **NÃO é prioridade.** P4 (backlog).

**Razão:**
- Login já tem tema escuro, dashboard claro = inconsistência atual
- Melhor padronizar em tema claro primeiro
- Dark mode é 5h+ de trabalho para testar todos os componentes
- Pode ser feature para v2.0

**Ação imediata:** Remover dark mode do login OU adicionar toggle para usuário escolher (futuro)

---

## 4️⃣ RECOMENDAÇÕES DE DESIGN

### Quick Wins (< 2h cada)

1. **Toast de feedback "Salvando..."**
```tsx
// Usar sonner ou react-hot-toast
import { toast } from 'sonner'

const handleSave = async () => {
  toast.loading('Salvando...')
  try {
    await saveStudy()
    toast.success('Salvo com sucesso!')
  } catch {
    toast.error('Erro ao salvar')
  }
}
```

2. **Status com ícone + cor**
```tsx
<Badge className={STATUS_CONFIG[status].bg}>
  <StatusIcon className={STATUS_CONFIG[status].color} />
  {STATUS_CONFIG[status].label}
</Badge>
```

3. **Touch targets aumentados**
```tsx
// Antes
<button className="p-1">

// Depois
<button className="p-2 min-h-[44px] min-w-[44px]">
```

### Componentes Novos Necessários

| Componente | Prioridade | Descrição |
|------------|------------|-----------|
| `<ConfirmModal>` | P0 | Substituir confirm() |
| `<Toast>` system | P0 | Substituir alert() + feedback |
| `<StatusBadge>` | P0 | Ícone + cor + texto |
| `<DeleteButton>` | P1 | Always visible, styled |
| `<TagSelector>` | P2 | Extrair de StudyPage |
| `<StatusSelect>` | P2 | Extrair de StudyPage |
| `<SkeletonCard>` | P2 | Loading state |

---

## 5️⃣ ESTIMATIVAS REVISADAS

| Prioridade | Débitos | Horas Originais | Horas Revisadas |
|------------|---------|-----------------|-----------------|
| P0 (Críticos) | 6 → 6 | 10-14h | 12-15h |
| P1 (Altos) | 4 → 6 | 6-10h | 10-13h |
| P2 (Médios) | 10 → 8 | 12-18h | 12-16h |
| P3/P4 (Baixos) | 5 → 8 | 8-12h | 11-15h |
| **TOTAL** | 25 → 28 | 36-54h | **45-59h** |

**Aumento:** ~10 horas (débitos adicionados + ajustes de escopo)

---

## 6️⃣ CHECKLIST DE IMPLEMENTAÇÃO UX

### Antes de Deploy (P0)
- [ ] Criar `<ConfirmModal>` com Radix AlertDialog
- [ ] Criar sistema de Toast (sonner ou similar)
- [ ] Adicionar ícones aos status (Circle, RefreshCw, CheckCircle)
- [ ] Mover delete button para sempre visível
- [ ] Aumentar touch targets para 44px mínimo
- [ ] Testar BubbleMenu em viewport < 640px

### Sprint 1 (P1)
- [ ] Criar `src/lib/design-tokens.ts`
- [ ] Extrair getTagColor para utility
- [ ] Adicionar feedback "Salvando..." com toast
- [ ] Verificar Tiptap undo/redo está habilitado
- [ ] Adicionar aria-labels em ícones principais

### Sprint 2 (P2)
- [ ] Criar `<StatusBadge>` component
- [ ] Criar `<TagSelector>` component
- [ ] Adicionar skeleton loading
- [ ] Testar contrast ratio WCAG AA

---

## 7️⃣ PARECER FINAL

### ⚠️ APPROVED WITH CONDITIONS

O assessment de Frontend/UX está **correto na identificação dos problemas**. As condições para aprovação:

**Condições:**
1. **FE-09 deve ser P0** (BubbleMenu mobile é crítico, não alto)
2. **FE-13 e FE-14 devem ser P1** (feedback e undo são importantes para UX)
3. **3 débitos adicionados** devem entrar no backlog (FE-26, FE-27, FE-28)

**Pontos Fortes do Assessment:**
- Identificou corretamente os 6 débitos críticos de a11y
- Reconheceu a necessidade de design tokens
- Priorizou corretamente replace de `confirm()` e `alert()`

**Pronto para prosseguir para FASE 7 (QA Review) com ajustes incorporados.**

---

**Data:** 2026-01-26
**Revisor:** @ux-design-expert Agent
**Próxima Revisão:** Pós-implementação de P0
