# Story 1.3: Implementar Acessibilidade Básica

**Story ID:** STORY-1.3
**Epic:** EPIC-001 (Resolução de Débitos Técnicos)
**Sprint:** 1
**Pontos:** 5
**Status:** 📋 READY FOR DEVELOPMENT

---

## 📋 User Story

**Como** usuário com deficiência visual ou que usa dispositivos touch,
**Quero** poder usar o Bible Study com tecnologias assistivas,
**Para que** eu não seja excluído de usar o aplicativo.

---

## 🎯 Objetivo

Resolver os 4 débitos críticos de acessibilidade identificados no assessment:
1. Delete button hover-only (inacessível para touch/keyboard)
2. Color-only status indication (daltonismo)
3. Touch targets < 44px (WCAG violation)
4. Focus trap em modals (verificar)

---

## ✅ Critérios de Aceite

### Delete Button (FE-03)
- [ ] Botão delete sempre visível (não apenas em hover)
- [ ] Botão tem opacidade reduzida quando não hover (opacity-40)
- [ ] Botão é acessível via Tab (keyboard navigation)
- [ ] Touch target >= 44x44px

### Status Icons (FE-04)
- [ ] Status "estudando" tem ícone Circle + cor azul + texto
- [ ] Status "revisando" tem ícone RefreshCw + cor roxa + texto
- [ ] Status "concluído" tem ícone CheckCircle + cor verde + texto
- [ ] Criar componente `<StatusBadge>` reutilizável

### Touch Targets (FE-06)
- [ ] Todos os botões têm min-h-[44px] min-w-[44px]
- [ ] Áreas de toque suficientes em mobile
- [ ] Padding aumentado onde necessário

### Focus Trap (FE-05)
- [ ] Verificar que Radix Dialog tem focus trap habilitado
- [ ] Tab não sai dos modals
- [ ] Escape fecha modals

---

## 📝 Tasks

- [ ] **1.3.1** Mover delete button para sempre visível (opacity-40 → opacity-100 on hover)
- [ ] **1.3.2** Criar `<StatusBadge>` component com ícone + cor + texto
- [ ] **1.3.3** Criar config de STATUS em design-tokens ou constants
- [ ] **1.3.4** Aplicar StatusBadge em ChapterView, StudyPage, BookCard
- [ ] **1.3.5** Auditar e aumentar touch targets em todos os botões
- [ ] **1.3.6** Verificar focus trap em ConfirmModal e outros dialogs
- [ ] **1.3.7** Rodar Lighthouse Accessibility e atingir > 90

---

## 🔧 Implementação Sugerida

### Status Config
```typescript
// src/lib/design-tokens.ts
import { Circle, RefreshCw, CheckCircle, LucideIcon } from 'lucide-react'

export const STATUS_CONFIG = {
  estudando: {
    icon: Circle,
    color: 'text-blue-500',
    bg: 'bg-blue-100',
    label: 'Estudando'
  },
  revisando: {
    icon: RefreshCw,
    color: 'text-purple-500',
    bg: 'bg-purple-100',
    label: 'Revisando'
  },
  concluído: {
    icon: CheckCircle,
    color: 'text-green-500',
    bg: 'bg-green-100',
    label: 'Concluído'
  },
} as const
```

### StatusBadge Component
```tsx
// src/components/ui/status-badge.tsx
import { STATUS_CONFIG } from '@/lib/design-tokens'

interface StatusBadgeProps {
  status: keyof typeof STATUS_CONFIG
  showIcon?: boolean
  showText?: boolean
}

export function StatusBadge({ status, showIcon = true, showText = true }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm ${config.bg}`}>
      {showIcon && <Icon className={`w-3 h-3 ${config.color}`} />}
      {showText && <span className={config.color}>{config.label}</span>}
    </span>
  )
}
```

### Delete Button Always Visible
```tsx
// Antes (hover-only)
<button className="opacity-0 group-hover:opacity-100">
  <Trash2 />
</button>

// Depois (sempre visível, discreto)
<button
  className="opacity-40 hover:opacity-100 transition-opacity p-2 min-h-[44px] min-w-[44px]"
  aria-label="Excluir estudo"
>
  <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
</button>
```

---

## 📊 Débitos Resolvidos

| ID | Débito | Severidade |
|----|--------|-----------|
| FE-03 | Delete button hover-only | 🔴 CRÍTICO |
| FE-04 | Color-only status indication | 🔴 CRÍTICO |
| FE-06 | Touch targets < 44px | 🔴 CRÍTICO |
| FE-05 | Focus trap em modals | 🔴 CRÍTICO |

---

## 🧪 Testes

### Manual
1. Navegar com Tab pelo dashboard → Delete button recebe focus
2. Ver status de estudos → Ícone + cor + texto visíveis
3. Usar em touch device → Botões têm área suficiente
4. Tab dentro de modal → Focus não escapa

### Lighthouse
```bash
# Rodar no Chrome DevTools
Lighthouse > Accessibility > Score > 90
```

### Checklist WCAG
- [ ] 1.4.1 Use of Color: Status não depende só de cor
- [ ] 2.4.7 Focus Visible: Focus é visível em todos elementos
- [ ] 2.5.5 Target Size: Touch targets >= 44x44px

---

## 📎 Referências

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Radix Accessibility](https://www.radix-ui.com/primitives/docs/overview/accessibility)
- [Technical Debt Assessment - FE-03, FE-04, FE-05, FE-06](../prd/technical-debt-assessment.md)

---

## ✅ Definition of Done

- [ ] Delete button sempre visível
- [ ] StatusBadge com ícone + cor + texto
- [ ] Touch targets >= 44px
- [ ] Focus trap funcionando
- [ ] Lighthouse Accessibility > 90
- [ ] Testado em mobile
- [ ] PR aprovado e merged

---

**Estimativa:** 4 horas
**Assignee:** Pendente
**Data:** 2026-01-26
