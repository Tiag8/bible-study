# Story 3.4: Extrair Shadow Tokens para CSS Modules

**Story ID:** STORY-3.4
**Epic:** EPIC-001 (Resolução de Débitos Técnicos)
**Sprint:** 3
**Pontos:** 3
**Status:** 📋 READY FOR DEVELOPMENT

---

## 📋 User Story

**Como** desenvolvedor,
**Quero** que shadow tokens sejam mais reutilizáveis e performáticos,
**Para que** possamos ter efeitos consistentes com carregamento otimizado.

---

## 🎯 Objetivo

Extrair sistema de shadows (atualmente em design-tokens.ts como Tailwind classes) para CSS Modules `.module.css` com CSS custom properties, melhorando reutilização e performance.

---

## ✅ Critérios de Aceite

### Estrutura
- [ ] Arquivo `src/styles/shadows.module.css` criado
- [ ] Shadows como CSS custom properties (--shadow-*)
- [ ] Exported classes: shadow-sm, shadow-md, shadow-lg, shadow-none
- [ ] Cada shadow tem fallback para navegadores antigos

### Uso em Componentes
- [ ] design-tokens.ts exporta SHADOW_CLASSES (mapeamento)
- [ ] Componentes importam de SHADOW_CLASSES
- [ ] Suporta composição com `cn()`: `cn('p-4', SHADOW_CLASSES.md)`

### Qualidade
- [ ] Shadows visualmente idênticos (antes/depois)
- [ ] Build size igual ou menor
- [ ] Browser support: Chrome, Firefox, Safari (últimas 2 versões)
- [ ] Zero console warnings

### Documentação
- [ ] Comentários em shadows.module.css
- [ ] Exemplo de uso em design-tokens.ts

---

## 📝 Tasks

- [ ] **3.4.1** Criar `src/styles/shadows.module.css` com vars
- [ ] **3.4.2** Definir 4 níveis de shadow (none, sm, md, lg)
- [ ] **3.4.3** Atualizar design-tokens.ts com SHADOW_CLASSES
- [ ] **3.4.4** Refatorar componentes para usar novo sistema
- [ ] **3.4.5** Testar visual em diferentes browsers
- [ ] **3.4.6** Validar performance (lighthouse)

---

## 📊 CSS Shadows Propostos

| Nome | CSS | Uso |
|------|-----|-----|
| none | `box-shadow: none` | Sem sombra |
| sm | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | Subtle elevation |
| md | `0 4px 6px -1px rgb(0 0 0 / 0.1)` | Default elevation |
| lg | `0 10px 15px -3px rgb(0 0 0 / 0.1)` | High elevation |

---

## 🎨 Exemplo - shadows.module.css

```css
/* Shadows.module.css */

:root {
  --shadow-none: none;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}

.shadowNone {
  box-shadow: var(--shadow-none);
}

.shadowSm {
  box-shadow: var(--shadow-sm);
}

.shadowMd {
  box-shadow: var(--shadow-md);
}

.shadowLg {
  box-shadow: var(--shadow-lg);
}
```

---

## 🎨 Exemplo - design-tokens.ts Update

```typescript
import shadows from '@/styles/shadows.module.css';

export const SHADOW_CLASSES = {
  none: shadows.shadowNone,
  sm: shadows.shadowSm,
  md: shadows.shadowMd,
  lg: shadows.shadowLg,
} as const;

// Manter para compatibilidade (não é recomendado)
export const SHADOWS_LEGACY = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
} as const;
```

---

## 🔗 Dependências

- ✅ Story 2.3 (Design Tokens) - DONE
- ⏳ Story 3.1 (Extend Tokens) - Opcional, para contexto

---

## 📝 Dev Notes

**Por que CSS Modules?**
1. **Performance**: Menos Tailwind parsing necessário
2. **Reusabilidade**: CSS vars podem ser compostas
3. **Manutenção**: Mudança única afeta tudo
4. **Dark Mode**: Fácil override em dark mode (future)

**Migração Strategy:**
1. Criar novo arquivo shadows.module.css
2. Atualizar design-tokens.ts
3. Componentes usam SHADOW_CLASSES[key]
4. Manter compatibilidade com SHADOWS_LEGACY por 1 sprint

---

## 📊 Métricas de Sucesso

| Métrica | Target |
|---------|--------|
| Visual consistency | 100% |
| Build size delta | ≤0 bytes |
| Browser support | 2+ versions |
| Performance | No regression |

---

## ⚠️ Considerações Futuras

- **Dark Mode (3.3)**: Shadows podem precisar ajuste em dark
- **Theme System**: CSS vars facilitarão tema switching
- **Animation**: Shadows em transições podem usar CSS vars

---

**Criado por:** @qa (Quinn) - Recomendação
**Data:** 2026-01-26
**Status:** Ready para Sprint 3 (paralelo com 3.1)
