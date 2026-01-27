# Frontend Architecture & UX Audit - Bible Study

**Data:** 2026-01-26
**Score Geral:** 6.8/10 (Funcional mas com débitos de UX/Acessibilidade)
**Status:** ⚠️ 30+ Débitos Identificados

---

## 📊 Resumo Executivo

| Aspecto | Score | Status |
|---------|-------|--------|
| **Arquitetura de Componentes** | 8/10 | ✅ Bem estruturada |
| **Design System** | 7/10 | ⚠️ Cores hardcoded |
| **UX/Interações** | 5/10 | 🔴 Padrões nativos inadequados |
| **Acessibilidade (a11y)** | 6/10 | ⚠️ Précisa melhorias |
| **Performance** | 8/10 | ✅ Bom (lazy loading OK) |
| **Responsividade** | 6/10 | ⚠️ Inconsistente em breakpoints |
| **Código** | 7/10 | ⚠️ Duplicação de getTagColor |

---

## 1️⃣ ARQUITETURA DE COMPONENTES

**Score: 8/10** ✅

### Hierarquia Atual

```
src/
├── app/
│   ├── page.tsx                    ← Dashboard (66 livros)
│   ├── estudo/[id]/page.tsx        ← Editor
│   ├── grafo/page.tsx              ← Grafo
│   ├── login/page.tsx              ← Auth
│   └── globals.css
├── components/
│   ├── dashboard/                  ← Domain components
│   │   ├── Sidebar.tsx
│   │   ├── TopBar.tsx
│   │   ├── BookGrid.tsx
│   │   ├── BookCard.tsx
│   │   ├── ChapterView.tsx
│   │   ├── BacklogPanel.tsx
│   │   └── StudySelectionModal.tsx
│   ├── Editor/                     ← Editor-specific
│   │   ├── index.tsx
│   │   ├── BubbleMenu.tsx
│   │   ├── SlashMenu.tsx
│   │   ├── useSlashMenu.ts
│   │   └── ColoredBlockquote.ts
│   ├── ui/                         ← shadcn/ui primitives
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   └── [13+ more]
│   └── CreateTagModal.tsx
└── lib/
    ├── supabase/
    └── utils.ts
```

**Positivos:**
- ✅ Separação clara entre domain (dashboard) e UI primitivos
- ✅ Componentes reutilizáveis bem organizados
- ✅ Hooks customizados isolados (`useSlashMenu.ts`)
- ✅ Context API para state management (AuthContext)
- ✅ Sem prop drilling excessivo

---

## 2️⃣ DESIGN SYSTEM

**Score: 7/10** ⚠️

### Design Tokens Atuais

**Paleta de Cores:**
```javascript
const TAG_COLORS = {
  blue: '#3b82f6',     // Cartas Paulinas
  red: '#ef4444',      // Profetas Maiores
  green: '#10b981',    // Pentateuco
  purple: '#a855f7',   // Poéticos
  yellow: '#f59e0b',   // Históricos
  pink: '#ec4899',     // Profetas Menores
  indigo: '#6366f1',   // (NT)
  cyan: '#06b6d4',     // Histórico NT
  orange: '#f97316',   // Apocalíptico
  slate: '#64748b'     // Default
}
```

**Tipografia:**
- Font: Geist Sans (Next.js default)
- Sizes: sm (14px), base (16px), lg (18px), xl (20px), 2xl (24px)

**Espaçamento:**
- Tailwind padrão: p-2, p-4, p-6, gap-2, gap-4, gap-6

### Débitos do Design System

| ID | Débito | Severidade | Impacto |
|----|--------|-----------|---------|
| **DS-01** | ColorMap hardcoded em inline styles | 🔴 ALTA | 15+ linhas repetidas em 3+ arquivos |
| **DS-02** | Sem arquivo `design-tokens.ts` centralizado | 🔴 ALTA | Difícil manter consistência |
| **DS-03** | Responsividade inconsistente em breakpoints | 🟡 MÉDIO | Alguns componentes com sm:, outros sem |
| **DS-04** | Sem dark mode (apesar de globals.css ter media query) | 🟢 BAIXO | Login escuro, dashboard claro = inconsistência |
| **DS-05** | Falta de spacing/sizing tokens | 🟡 MÉDIO | Magic numbers no Tailwind |

### Recomendações Design System

**CRÍTICO:**
1. Criar `src/lib/design-tokens.ts`:
```typescript
export const COLORS = {
  tags: {
    blue: '#3b82f6',
    red: '#ef4444',
    // ...
  },
  border: {
    light: '#e5e7eb',
    dark: '#1f2937',
  }
};
```

2. Usar em componentes:
```typescript
// Antes (hardcoded em 3+ lugares)
<div style={{ backgroundColor: '#3b82f6' }} />

// Depois (único source of truth)
<div style={{ backgroundColor: COLORS.tags.blue }} />
```

---

## 3️⃣ PADRÕES DE INTERAÇÃO (UX)

**Score: 5/10** 🔴

### Pontos Fortes
- ✅ Auto-save com 30s debounce
- ✅ Confirmação antes de sair com mudanças não salvas
- ✅ Loading states com spinner visual
- ✅ Feedback delete com linha vermelha hover
- ✅ Título editável inline com save/cancel

### Débitos Críticos de UX

| ID | Débito | Severidade | Impacto | Solução |
|----|--------|-----------|--------|---------|
| **UX-01** | `confirm()` nativo do browser | 🔴 CRÍTICO | Inconsistente com design, ruim em mobile | Criar `<ConfirmModal>` |
| **UX-02** | `alert()` nativo do browser | 🔴 CRÍTICO | Bloqueia UI, inconsistente | Criar `<Toast>` ou `<ErrorAlert>` |
| **UX-03** | Sem visual feedback após salvar | 🟡 MÉDIO | Usuário não sabe se salvou | Toast de sucesso ephemeral |
| **UX-04** | Botão delete em hover-only | 🔴 CRÍTICO | Touch users e keyboard users não conseguem | Move para always-visible |
| **UX-05** | Sem undo/redo no editor | 🔴 CRÍTICO | Perda irreversível de dados | Tiptap tem built-in, verificar se habilitado |
| **UX-06** | Modal de confirmação genérica | 🟡 MÉDIO | Sem customização (icon, color) | Delete modal em vermelho, etc |
| **UX-07** | Sem search dentro do editor | 🟡 MÉDIO | Ctrl+F não funciona | Adicionar Tiptap Find extension |
| **UX-08** | Dropdown de tags fecha ao clicar fora | 🟢 BAIXO | Comportamento esperado mas não documentado | Documentar ou adicionar hint |
| **UX-09** | Sem preview de links | 🟢 BAIXO | Links inseridos sem preview visual | Hover preview (future) |
| **UX-10** | Sem recent studies | 🟢 BAIXO | Speedbar para estudos frequentes | Nice-to-have |

---

## 4️⃣ ACESSIBILIDADE (a11y)

**Score: 6/10** ⚠️

### Checklist a11y

| Item | Status | Detalhes |
|------|--------|----------|
| **Semantic HTML** | ✅ | `<header>`, `<main>`, `<aside>`, `<section>` usados |
| **ARIA labels** | ⚠️ | 42 atributos, mas faltam em ícones sem texto |
| **Focus management** | ⚠️ | Radix Dialog deveria ter focus trap, verificar |
| **Keyboard navigation** | ⚠️ | Funções-chave inacessíveis ao teclado (delete hover-only) |
| **Color contrast** | ⚠️ | Alguns cinzas claros (<4.5:1 em WCAG AA) |
| **Color-independent** | 🔴 | Status usa só cores (estudando=azul, concluído=verde) |
| **Touch targets** | 🔴 | Botões delete < 44x44px (WCAG fail) |
| **Landmarks** | ⚠️ | Estrutura OK mas sem labels |

### Débitos a11y Críticos

| ID | Débito | Severidade | Solução |
|----|--------|-----------|---------|
| **A11Y-01** | Falta `aria-label` em ícones | 🟡 MÉDIO | Adicionar labels em BookOpen, ChevronLeft, X |
| **A11Y-02** | Color-only status indication | 🔴 CRÍTICO | Adicionar ícones (●, ◆, ✓) + cor |
| **A11Y-03** | Hover-only delete button | 🔴 CRÍTICO | Move para visible ou context menu |
| **A11Y-04** | Focus trap em modals | 🔴 CRÍTICO | Verificar Radix Dialog e ativar se desabilitado |
| **A11Y-05** | Sem skip link | 🟢 BAIXO | Adicionar "Skip to content" |
| **A11Y-06** | Contrast ratio inadequado | 🟡 MÉDIO | Testar com WCAG checker, aumentar se necessário |
| **A11Y-07** | Touch targets < 44px | 🔴 CRÍTICO | Aumentar padding/altura de botões |
| **A11Y-08** | Sem keyboard shortcuts docs | 🟢 BAIXO | Documentar Ctrl+B, Ctrl+I etc em help modal |

### Recomendação a11y

**IMEDIATO (antes de produção):**
1. Status com ícones + cores
2. Delete button sempre visível
3. Focus trap em todos os modals
4. Touch targets 44x44px mínimo

**PRÓXIMAS SPRINTS:**
1. aria-labels em ícones
2. Testar contrast ratio
3. Documentar keyboard shortcuts
4. Skip link no layout

---

## 5️⃣ PERFORMANCE FRONTEND

**Score: 8/10** ✅

### Otimizações Implementadas

| Otimização | Status | Detalhes |
|-----------|--------|----------|
| **Lazy loading de grafo** | ✅ | `dynamic()` import com ssr: false |
| **Memoization** | ✅ | `useMemo` em BookGrid filtering |
| **useCallback** | ✅ | Handlers em BubbleMenu, GrafoPage |
| **Bundle splitting** | ✅ | Grafo em rota separada (`/grafo`) |
| **Next.js Image** | N/A | Sem imagens (só ícones Lucide) |
| **CSS-in-JS** | ✅ | Tailwind (zero runtime overhead) |

### Pontos de Atenção

| Métrica | Status | Ação |
|---------|--------|------|
| **Tiptap bundle** | ⚠️ | Verificar se otimizado (extensions necessárias?) |
| **react-force-graph** | ✅ | Já lazy loaded (OK!) |
| **Editor re-renders** | ✓ | Controlled via refs (`lastAppliedContentRef`) |

---

## 6️⃣ RESPONSIVIDADE

**Score: 6/10** ⚠️

### Breakpoint Analysis

| Viewport | Status | Problema | Solução |
|----------|--------|----------|---------|
| **Mobile (<640px)** | ⚠️ | BubbleMenu width-80 fixo, cobre tela | width-64 md:w-80 |
| **Tablet (640px-1024px)** | ✅ | OK | - |
| **Desktop (>1024px)** | ✅ | OK | - |
| **Ultra-wide (>1920px)** | ⚠️ | Sem xl: breakpoints | Adicionar xl: específicos |

### Débitos Responsividade

| ID | Débito | Severidade | Solução |
|----|--------|-----------|---------|
| **RESP-01** | BubbleMenu não responsive em mobile | 🔴 CRÍTICO | Usar `max-w-[90vw]` ou `w-64 md:w-80` |
| **RESP-02** | Touch targets < 44px | 🔴 CRÍTICO | Aumentar padding mínimo |
| **RESP-03** | Alguns componentes sem sm:/md:/lg: | 🟡 MÉDIO | Auditar e padronizar |

---

## 7️⃣ DÉBITOS TÉCNICOS DE CÓDIGO

**Score: 7/10** ⚠️

### Duplicação de Código

| ID | Débito | Localização | Severidade |
|----|--------|------------|-----------|
| **CODE-01** | `getTagColor()` duplicada | ChapterView.tsx + StudyPage.tsx + BubbleMenu.tsx | 🟡 MÉDIO |
| **CODE-02** | ColorMap inline em 3+ lugares | TopBar, ChapterView, StudyPage | 🔴 ALTA |
| **CODE-03** | Status select dropdown code | StudyPage.tsx linhas 544-596 | 🟡 MÉDIO |
| **CODE-04** | Tag select dropdown code | StudyPage.tsx linhas 615-679 | 🟡 MÉDIO |

### TODOs e Dead Code

| Arquivo | Linha | TODO | Severidade |
|---------|-------|------|-----------|
| `SlashMenu.tsx` | 211 | "Add to backlog" não implementado | 🟡 MÉDIO |
| `BacklogPanel.tsx` | 233 | "Ver Todos" link não funciona | 🟡 MÉDIO |
| `GrafoPage.tsx` | 3x | `@typescript-eslint/no-explicit-any` disabled | 🟢 BAIXO |

### Recomendações Code Cleanup

```typescript
// Antes (duplicado 3x)
function ChapterView() {
  const getTagColor = (color) => {
    const colorMap = { blue: '#3b82f6', ... };
    return colorMap[color];
  };
}

// Depois (centralizado)
// src/lib/tag-utils.ts
export const getTagColor = (color: string) => {
  const map = COLORS.tags;
  return map[color as keyof typeof map];
};

// Em componentes:
import { getTagColor } from '@/lib/tag-utils';
```

---

## 8️⃣ USER EXPERIENCE GAPS

| ID | Gap | Severidade | Solução |
|----|-----|-----------|---------|
| **GAP-01** | Sem feedback visual "salvando" | 🟡 MÉDIO | Spinner + "Salvando..." antes do checkmark |
| **GAP-02** | Sem empty state para "Sem estudos" | 🟡 MÉDIO | Ilustração + "Comece a estudar!" |
| **GAP-03** | Sem search/find dentro do editor | 🟡 MÉDIO | Tiptap Find extension |
| **GAP-04** | Sem breadcrumb em dashboard | 🟢 BAIXO | Sidebar já mostra localização |
| **GAP-05** | Nenhuma confirmação ao criar novo estudo | 🟢 BAIXO | Add confirmation toast |
| **GAP-06** | Sem preview de como tag fica visualmente | 🟢 BAIXO | Live color preview |

---

## 🎯 MATRIZ PRIORITIZAÇÃO

### 🔴 CRÍTICO (Deploy Blocker)

**Fazer ANTES de ir para produção:**

1. **UX-01** - Substituir `confirm()` → `<ConfirmModal>`
2. **UX-02** - Substituir `alert()` → `<Toast>`
3. **UX-04** - Move delete button visible
4. **A11Y-02** - Status com ícones + cores
5. **A11Y-03** - Focus trap em modals
6. **A11Y-07** - Touch targets 44x44px

### 🟠 ALTO (Próxima Sprint)

1. **DS-01/DS-02** - Centralizar design tokens
2. **CODE-01/CODE-02** - Extrair getTagColor
3. **RESP-01** - BubbleMenu responsive
4. **A11Y-01** - aria-labels em ícones

### 🟡 MÉDIO (Backlog)

1. **UX-05** - Verificar undo/redo no editor
2. **UX-07** - Find in editor
3. **CODE-03/CODE-04** - Extrair componentes Select
4. **GAP-01** - Feedback "salvando"

### 🟢 BAIXO (Nice-to-have)

1. **A11Y-05** - Skip link
2. **GAP-02** - Empty states
3. **A11Y-08** - Docs de shortcuts
4. **DS-04** - Dark mode

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### FASE 1: Críticos (1-2 semanas)

- [ ] Criar `<ConfirmModal>` component
- [ ] Criar `<Toast>` system
- [ ] Mover delete button para sempre visível
- [ ] Adicionar ícones a status (●, ◆, ✓)
- [ ] Verificar focus trap em Radix Dialog
- [ ] Aumentar touch targets para 44x44px mínimo

### FASE 2: Altos (2-3 semanas)

- [ ] Criar `src/lib/design-tokens.ts`
- [ ] Extrair `getTagColor()` para `src/lib/tag-utils.ts`
- [ ] Adicionar `aria-label` em ícones
- [ ] Testar BubbleMenu em mobile (<640px)
- [ ] Usar `max-w-[90vw]` para dropdowns

### FASE 3: Médios (3-4 semanas)

- [ ] Implementar TODOs (backlog, search)
- [ ] Adicionar `<StatusSelect>` component
- [ ] Adicionar `<TagSelector>` component
- [ ] Verificar Tiptap undo/redo
- [ ] Adicionar Tiptap Find extension

### FASE 4: Baixos (Backlog)

- [ ] Adicionar skip link
- [ ] Implementar empty states
- [ ] Testar contrast ratio WCAG
- [ ] Documentar keyboard shortcuts

---

## 🏆 CONCLUSÃO

**Status Atual:** ⚠️ Funcional mas com débitos críticos de UX e acessibilidade

**Recomendação:** Implementar FASE 1 (críticos) antes de deploy em produção. Depois seguir com FASE 2 nas próximas sprints.

**Impacto de Não Abordar:**
- WCAG violation (accessibility fails)
- Mobile UX inadequada
- Perda de dados sem undo
- Inconsistência de design

**ROI de Abordar:**
- ✅ Produção-ready a11y
- ✅ Mobile experience melhorado
- ✅ Código mais manutenível
- ✅ Design system escalável

---

**Data:** 2026-01-26
**Analisado por:** @ux-design-expert Agent
**Próximo Review:** Após implementação de FASE 1 (1-2 semanas)
