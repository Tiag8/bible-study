# Story 1.4: Corrigir Mobile UX (BubbleMenu)

**Story ID:** STORY-1.4
**Epic:** EPIC-001 (Resolução de Débitos Técnicos)
**Sprint:** 1
**Pontos:** 3
**Status:** 📋 READY FOR DEVELOPMENT

---

## 📋 User Story

**Como** usuário de dispositivo mobile,
**Quero** usar o editor de estudos sem problemas de layout,
**Para que** eu possa estudar em qualquer dispositivo.

---

## 🎯 Objetivo

Corrigir o BubbleMenu e outros elementos que quebram em viewports mobile (< 640px).

---

## ✅ Critérios de Aceite

### BubbleMenu (FE-09)
- [ ] BubbleMenu não sai da tela em viewport 375px
- [ ] Usar `max-w-[90vw]` ou similar para limitar largura
- [ ] Botões de formatação funcionam em touch
- [ ] Menu posiciona corretamente acima/abaixo do texto selecionado

### TopBar
- [ ] Busca responsiva em mobile
- [ ] Filtros não quebram layout
- [ ] Dropdown de tags funciona em touch

### Geral
- [ ] Testar em Chrome DevTools com viewport 375x667 (iPhone SE)
- [ ] Testar em viewport 390x844 (iPhone 12/13/14)
- [ ] Sem horizontal scroll em nenhuma página

---

## 📝 Tasks

- [ ] **1.4.1** Auditar BubbleMenu.tsx para largura fixa
- [ ] **1.4.2** Adicionar `max-w-[90vw]` ou breakpoints responsivos
- [ ] **1.4.3** Testar SlashMenu em mobile
- [ ] **1.4.4** Verificar TopBar em mobile
- [ ] **1.4.5** Testar em 3 viewports diferentes
- [ ] **1.4.6** Corrigir qualquer overflow horizontal

---

## 🔧 Implementação Sugerida

```tsx
// BubbleMenu.tsx - Antes
<div className="w-80 bg-white border rounded-lg shadow-lg">

// BubbleMenu.tsx - Depois
<div className="w-full max-w-[min(20rem,90vw)] bg-white border rounded-lg shadow-lg">
```

```tsx
// TopBar.tsx - Garantir responsividade
<div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
  <Input className="w-full sm:w-64" placeholder="Buscar..." />
  <div className="flex gap-2 flex-wrap">
    {/* Filtros */}
  </div>
</div>
```

---

## 📊 Débitos Resolvidos

| ID | Débito | Severidade |
|----|--------|-----------|
| FE-09 | BubbleMenu não responsive mobile | 🔴 CRÍTICO |
| FE-18 | Responsividade inconsistente | 🟡 MÉDIO (parcial) |

---

## 🧪 Testes

### Viewports para Testar
- [ ] 375x667 (iPhone SE)
- [ ] 390x844 (iPhone 12/13/14)
- [ ] 412x915 (Pixel 5)
- [ ] 768x1024 (iPad)

### Manual
1. Abrir /estudo/xxx em mobile
2. Selecionar texto → BubbleMenu aparece dentro da tela
3. Clicar em formatação → Funciona
4. Verificar sem scroll horizontal

---

## ✅ Definition of Done

- [ ] BubbleMenu não sai da tela em 375px
- [ ] Touch interactions funcionam
- [ ] Sem horizontal scroll
- [ ] Testado em 3+ viewports
- [ ] PR aprovado e merged

---

**Estimativa:** 2 horas
**Assignee:** Pendente
**Data:** 2026-01-26
