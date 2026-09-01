# Story 3.3: Implementar Sistema de Variantes de Tema (Dark Mode)

**Story ID:** STORY-3.3
**Epic:** EPIC-001 (Resolução de Débitos Técnicos)
**Sprint:** 3
**Pontos:** 8
**Status:** 📋 FUTURE (Depende de Stories 3.1, 3.2)

---

## 📋 User Story

**Como** usuário que trabalha à noite,
**Quero** ter opção de dark mode,
**Para que** eu possa estudar a Bíblia sem cansar meus olhos.

---

## 🎯 Objetivo

Implementar sistema de temas (light/dark) usando design tokens com suporte a preferência do sistema e persistência de escolha do usuário.

---

## ✅ Critérios de Aceite

### Funcionalidade
- [ ] Toggle tema no settings (light/dark/system)
- [ ] Dark mode aplicado em todos os componentes
- [ ] Preferência do usuário persistida no localStorage
- [ ] Paleta dark sensível para contraste WCAG AA (≥4.5:1)
- [ ] Transição suave entre temas

### Design Tokens
- [ ] Estender design-tokens.ts com tema dark
- [ ] Criar export THEME_VARIANTS com light/dark
- [ ] Colors dinâmicas usando CSS variables
- [ ] TAG_COLORS ajustadas para dark

### Qualidade
- [ ] Lighthouse Accessibility > 95 em ambos temas
- [ ] Build passa
- [ ] Sem flash de cor ao carregar
- [ ] Funciona com preferência sistema (prefers-color-scheme)

### Testes
- [ ] E2E: Toggle tema e verificar aplicação
- [ ] Visual: Comparar light vs dark em todas páginas
- [ ] Mobile: Testar em 375px e 768px

---

## 📝 Tasks

- [ ] **3.3.1** Estender design-tokens.ts com THEME_VARIANTS
- [ ] **3.3.2** Criar ThemeProvider e useTheme hook
- [ ] **3.3.3** Implementar CSS variables para colors
- [ ] **3.3.4** Criar settings UI para tema toggle
- [ ] **3.3.5** Persistir preferência em localStorage
- [ ] **3.3.6** Testar contraste WCAG AA dark mode
- [ ] **3.3.7** Testar preferência do sistema (prefers-color-scheme)
- [ ] **3.3.8** E2E teste theme switching

---

## 🎨 Paleta Dark Mode Sugerida

| Token | Light | Dark |
|-------|-------|------|
| primary | #3b82f6 (blue-600) | #60a5fa (blue-400) |
| success | #22c55e (green-600) | #4ade80 (green-400) |
| danger | #ef4444 (red-600) | #f87171 (red-400) |
| neutral bg | #ffffff | #1f2937 (gray-800) |
| neutral text | #111827 (gray-900) | #f3f4f6 (gray-100) |

---

## 🔗 Dependências

- ✅ Story 2.3 (Design Tokens) - DONE
- ⏳ Story 3.1 (Extend Tokens) - Para contexto completo
- ✅ AuthContext para persistência por usuário (futuro)

---

## 📝 Implementação Sugerida

```typescript
// design-tokens.ts
export const THEME_VARIANTS = {
  light: {
    colors: { /* ... */ },
    background: '#ffffff',
    foreground: '#000000',
  },
  dark: {
    colors: { /* ... */ },
    background: '#1f2937',
    foreground: '#f3f4f6',
  },
};

// hooks/useTheme.ts
export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('bible-theme', newTheme);
  };

  return { theme, toggleTheme };
}
```

---

## ⚠️ Notas Técnicas

**CSS Variables:**
- Use calc() para transições suaves
- Media query `prefers-color-scheme` para default
- Evitar flash ao carregar (hidratar do localStorage)

**Contraste:**
- Testar com WAVE ou Lighthouse
- Mínimo 4.5:1 para texto normal
- Mínimo 3:1 para ícones

---

## 📊 Métricas de Sucesso

| Métrica | Target |
|---------|--------|
| Lighthouse Accessibility (light) | >95 |
| Lighthouse Accessibility (dark) | >95 |
| WCAG AA contrast ratio | 100% |
| Theme switch time | <200ms |

---

**Criado por:** @qa (Quinn) - Recomendação
**Data:** 2026-01-26
**Status:** Ready para Sprint 3 (após 3.1/3.2)
