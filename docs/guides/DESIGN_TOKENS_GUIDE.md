# Design Tokens Guide - Bible Study

> Comprehensive guide to using design tokens for building consistent, maintainable components in the Bible Study application.

## O que são Design Tokens?

Design tokens são **valores de design reutilizáveis** que centralizam decisões de design em um único lugar. Em vez de copiar cores hardcoded (`#3b82f6`), tamanhos (`1rem`), ou espaçamento em vários componentes, usamos tokens semânticos que garantem consistência visual em toda a aplicação.

### Por que usar Design Tokens?

- ✅ **Consistência**: Uma mudança no token afeta toda a aplicação
- ✅ **Manutenibilidade**: Fácil atualizar estilos globalmente
- ✅ **Escalabilidade**: Pronto para dark mode, temas customizáveis
- ✅ **Documentação**: Código auto-documentado e semanticamente claro
- ✅ **Colaboração**: Designers e desenvolvedores falam a mesma linguagem

---

## Anatomia dos Design Tokens

### 1. COLORS - Sistema Semântico

Sistema de cores baseado em **semântica e função**, não em cores literais.

```typescript
import { COLORS } from '@/lib/design-tokens';

// Estrutura:
COLORS.primary      // Ações principais, botões, focus
COLORS.success      // Estados positivos, confirmações
COLORS.warning      // Avisos, atenção
COLORS.danger       // Ações destrutivas, erros
COLORS.secondary    // Status secundário (revisão)
COLORS.neutral      // Textos, fundos, borders
COLORS.accent       // Destaques visuais (ciano/teal)
```

#### Cada cor tem variações:

```typescript
COLORS.primary.light      // Fundo claro: bg-blue-50
COLORS.primary.lighter    // Fundo mais claro: bg-blue-100
COLORS.primary.default    // Cor principal: bg-blue-600
COLORS.primary.dark       // Variação escura: bg-blue-700
COLORS.primary.text       // Texto da cor: text-blue-600
```

#### Exemplo Prático: Botão Primário

```tsx
import { cn } from '@/lib/utils';
import { COLORS } from '@/lib/design-tokens';

export function PrimaryButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-lg font-medium",
        COLORS.primary.default,    // bg-blue-600
        COLORS.neutral.text.primary, // text-white
        "transition-all hover:opacity-90"
      )}
    >
      {children}
    </button>
  );
}
```

### 2. TAG_COLORS - Mapa Direto de Valores Hex

Para casos onde você precisa de valores hex específicos (ex: tags com cores customizáveis).

```typescript
import { TAG_COLORS } from '@/lib/design-tokens';

export const TAG_COLORS = {
  blue: '#3b82f6',
  purple: '#8b5cf6',
  green: '#22c55e',
  orange: '#f97316',
  pink: '#ec4899',
  cyan: '#06b6d4',
  red: '#ef4444',
  yellow: '#eab308',
  'dark-green': '#15803d',
};

// Uso:
<span style={{ backgroundColor: TAG_COLORS.blue }}>Tag</span>
```

### 3. TYPOGRAPHY - Escalas Tipográficas

Sistema de tamanhos e pesos de fonte padronizados.

```typescript
import { TYPOGRAPHY } from '@/lib/design-tokens';

// Tamanhos (escalados)
TYPOGRAPHY.sizes.xs      // text-xs (12px)
TYPOGRAPHY.sizes.sm      // text-sm (14px)
TYPOGRAPHY.sizes.base    // text-base (16px)
TYPOGRAPHY.sizes.lg      // text-lg (18px)
TYPOGRAPHY.sizes.xl      // text-xl (20px)
TYPOGRAPHY.sizes['2xl']  // text-2xl (24px)

// Pesos (weights)
TYPOGRAPHY.weights.normal    // font-normal
TYPOGRAPHY.weights.medium    // font-medium
TYPOGRAPHY.weights.semibold  // font-semibold
TYPOGRAPHY.weights.bold      // font-bold
```

#### Exemplo: Título

```tsx
<h2 className={cn(TYPOGRAPHY.sizes.lg, TYPOGRAPHY.weights.semibold)}>
  Meu Título
</h2>
```

### 4. SPACING - Escala de Espaçamento

Valores consistentes para padding, margin, gaps.

```typescript
import { SPACING } from '@/lib/design-tokens';

SPACING.xs     // 0.25rem (4px)
SPACING.sm     // 0.5rem (8px)
SPACING.md     // 1rem (16px)
SPACING.lg     // 1.5rem (24px)
SPACING.xl     // 2rem (32px)
SPACING['2xl'] // 3rem (48px)
```

### 5. BORDER_RADIUS - Cantos Arredondados

Valores de border-radius padronizados.

```typescript
import { BORDER_RADIUS } from '@/lib/design-tokens';

BORDER_RADIUS.none   // rounded-none
BORDER_RADIUS.sm     // rounded-sm
BORDER_RADIUS.md     // rounded-md (padrão)
BORDER_RADIUS.lg     // rounded-lg
BORDER_RADIUS.xl     // rounded-xl
BORDER_RADIUS.full   // rounded-full (círculo)
```

### 6. BORDERS - Cores de Borders

Borders padronizados para diferentes contextos.

```typescript
import { BORDERS } from '@/lib/design-tokens';

BORDERS.gray      // border-gray-200 (padrão)
BORDERS.primary   // border-blue-200
BORDERS.light     // border-gray-100
```

### 7. SHADOW_CLASSES - Elevação e Profundidade

Sistema de shadows para criar profundidade visual.

```typescript
import { SHADOW_CLASSES } from '@/lib/design-tokens';

SHADOW_CLASSES.none  // Sem sombra
SHADOW_CLASSES.sm    // Sombra sutil (0 1px 2px)
SHADOW_CLASSES.md    // Sombra padrão (0 4px 6px)
SHADOW_CLASSES.lg    // Sombra grande (0 10px 15px)
```

#### Exemplo: Card com Elevação

```tsx
<div className={cn("p-6 rounded-lg bg-white", SHADOW_CLASSES.md)}>
  Conteúdo do card
</div>
```

### 8. STATUS_CONFIG - Configurações de Status

Mapeamento completo de status (ícone, cor, background, label).

```typescript
import { STATUS_CONFIG, type StudyStatus } from '@/lib/design-tokens';

type StudyStatus = 'estudar' | 'estudando' | 'revisando' | 'concluído';

// Cada status tem:
STATUS_CONFIG.estudar.icon      // Lucide icon
STATUS_CONFIG.estudar.color     // text color
STATUS_CONFIG.estudar.bg        // background color
STATUS_CONFIG.estudar.label     // Texto em português
```

#### Exemplo: Status Badge

```tsx
function StatusBadge({ status }: { status: StudyStatus }) {
  const config = STATUS_CONFIG[status];

  return (
    <div className={cn("flex items-center gap-2 px-3 py-1 rounded-lg", config.bg)}>
      <config.icon className="w-4 h-4" />
      <span className={config.color}>{config.label}</span>
    </div>
  );
}
```

---

## Como Usar em Componentes

### Padrão de Importação

```typescript
'use client';

import { cn } from '@/lib/utils';
import {
  COLORS,
  TYPOGRAPHY,
  SHADOW_CLASSES,
  BORDERS,
  SPACING,
  TAG_COLORS,
} from '@/lib/design-tokens';
```

### Padrão de Aplicação

```tsx
// ❌ EVITAR: Tailwind classes hardcoded
<button className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700">
  Botão
</button>

// ✅ USAR: Design tokens
<button className={cn(
  "px-4 py-2 rounded-lg",
  COLORS.primary.default,
  COLORS.neutral.text.primary,
  SHADOW_CLASSES.md,
  "transition-all hover:opacity-90"
)}>
  Botão
</button>
```

---

## Padrões Semânticos - Quando Usar Cada Cor

### PRIMARY - Ações Principais

Use para **botões primários, links, elementos que comandam foco**.

```tsx
// ✅ Correto
<button className={cn(COLORS.primary.default, "text-white")}>
  Salvar Estudo
</button>

<a href="/estudo" className={COLORS.primary.text}>
  Ver Estudo
</a>
```

### SUCCESS - Confirmações e Positivos

Use para **confirmações de ação, estados bem-sucedidos, check marks**.

```tsx
// ✅ Correto
<div className={cn(COLORS.success.light, "rounded-lg p-4")}>
  ✓ Estudo salvo com sucesso!
</div>

<span className={COLORS.success.text}>Concluído</span>
```

### WARNING - Avisos e Atenção

Use para **avisos que requerem atenção, números de revisão, status "estudando"**.

```tsx
// ✅ Correto
<div className={cn(COLORS.warning.light, "rounded-lg p-4")}>
  ⚠ 5 estudos aguardando revisão
</div>

<span className={COLORS.warning.text}>Em Revisão</span>
```

### DANGER - Ações Destrutivas

Use para **deletar, ações irreversíveis, estados de erro**.

```tsx
// ✅ Correto
<button className={cn(COLORS.danger.default, "text-white")}>
  🗑 Deletar Estudo
</button>

<div className={cn(COLORS.danger.light, "rounded-lg p-4")}>
  ✗ Erro ao salvar. Tente novamente.
</div>
```

### SECONDARY - Status Secundário

Use para **status de revisão, ações alternativas, formulários**.

```tsx
// ✅ Correto
<span className={cn(COLORS.secondary.light, "rounded-lg px-3 py-1")}>
  Revisando
</span>
```

### NEUTRAL - Textos e Backgrounds

Use para **corpo de texto, backgrounds, borders, elementos estruturais**.

```tsx
// ✅ Correto
<p className={COLORS.neutral.text.primary}>
  Texto principal do componente
</p>

<p className={COLORS.neutral.text.secondary}>
  Texto secundário ou descrição
</p>

<div className={COLORS.neutral.text.muted}>
  Texto muito leve (disabled, placeholder)
</div>

<div className={cn(COLORS.neutral[50], "rounded-lg")}>
  Background muito claro
</div>
```

### ACCENT - Destaques Especiais

Use para **destaque visual, elementos promocionais, ênfase**.

```tsx
// ✅ Correto
<span className={COLORS.accent.text}>
  ★ Favorito
</span>
```

---

## Exemplos Práticos de Refatoração

### Exemplo 1: Componente de Input

```tsx
// ❌ ANTES (Tailwind hardcoded)
<input
  type="text"
  placeholder="Digite uma tag"
  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
/>

// ✅ DEPOIS (Com design tokens)
import { COLORS, BORDER_RADIUS, BORDERS, SPACING } from '@/lib/design-tokens';

<input
  type="text"
  placeholder="Digite uma tag"
  className={cn(
    `px-3 py-2 border`,
    BORDERS.gray,
    BORDER_RADIUS.md,
    "focus:ring-2",
    COLORS.primary.default,
    "focus:border-transparent"
  )}
/>
```

### Exemplo 2: Modal com Sombra

```tsx
// ❌ ANTES
<div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
  Conteúdo do modal
</div>

// ✅ DEPOIS
<div className={cn(
  "bg-white p-6",
  BORDER_RADIUS.lg,
  SHADOW_CLASSES.lg,
  BORDERS.gray
)}>
  Conteúdo do modal
</div>
```

### Exemplo 3: Status Indicator

```tsx
// ❌ ANTES (Hardcoded colors)
const statusColor = status === 'concluído' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600';

// ✅ DEPOIS (Semantic tokens)
import { STATUS_CONFIG } from '@/lib/design-tokens';

const config = STATUS_CONFIG[status];
<div className={cn(config.bg, "rounded-lg px-3 py-1")}>
  <config.icon className="w-4 h-4" />
  <span className={config.color}>{config.label}</span>
</div>
```

### Exemplo 4: Combinando Múltiplos Tokens

```tsx
<div className={cn(
  'rounded-lg p-6',
  COLORS.primary.light,     // bg-blue-50
  'border',
  COLORS.primary.default,   // ⚠️ ERRO: Isso é classe bg, não border
)}>
```

**⚠️ Cuidado:** COLORS.primary.default é `bg-blue-600`. Para borders, use `BORDERS.primary` (que é `border-blue-200`).

---

## Erros Comuns e Como Evitar

### ❌ Erro 1: Misturar tokens com Tailwind hardcoded

```tsx
// ❌ RUIM
<button className={cn(COLORS.primary.default, "bg-green-500")}>
  // Conflito de classes!
</button>

// ✅ BOM
<button className={COLORS.primary.default}>
  Usar apenas tokens
</button>
```

### ❌ Erro 2: Usar cor errada para o caso de uso

```tsx
// ❌ RUIM - Usando warning para um botão primário
<button className={COLORS.warning.default}>
  Salvar
</button>

// ✅ BOM - Usar primary para ações principais
<button className={COLORS.primary.default}>
  Salvar
</button>
```

### ❌ Erro 3: Esquecer de adicionar contraste de texto

```tsx
// ❌ RUIM - Fundo dark sem texto claro
<div className={COLORS.primary.dark}>
  Texto ilegível
</div>

// ✅ BOM - Adicionar cor de texto apropriada
<div className={cn(COLORS.primary.dark, "text-white")}>
  Texto legível
</div>
```

### ❌ Erro 4: Usar TOKEN.text para backgrounds

```tsx
// ❌ RUIM - Mistura de propósitos
<div className={cn(
  COLORS.primary.text,  // text-blue-600, não é background!
  "p-4"
)}>
  Fundo não está azul!
</div>

// ✅ BOM - Usar light ou default para backgrounds
<div className={cn(
  COLORS.primary.light,  // bg-blue-50
  "p-4"
)}>
  Fundo azul claro
</div>
```

---

## Dark Mode (Futuro)

O sistema de design tokens foi projetado para suportar dark mode facilmente:

```typescript
// Em globals.css (futuro):
@media (prefers-color-scheme: dark) {
  :root {
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.3);  // Maior contraste
  }
}
```

---

## Checklist para Novos Componentes

Ao criar um novo componente, verifique:

- [ ] Usar `COLORS` para cores (não hardcoded)
- [ ] Usar `SHADOW_CLASSES` para sombras
- [ ] Usar `TYPOGRAPHY` para tamanhos de fonte
- [ ] Usar `BORDER_RADIUS` para cantos
- [ ] Usar `SPACING` para padding/margin
- [ ] Usar `BORDERS` para borders
- [ ] Usar semântica correta (primary vs warning, etc)
- [ ] Testar com linter (`npm run lint`)
- [ ] Testar visual no browser

---

## Recursos Adicionais

- **Arquivo de definição:** `src/lib/design-tokens.ts`
- **CSS Modules:** `src/styles/shadows.module.css`
- **Globals:** `src/app/globals.css`
- **Referência Rápida:** Veja `TOKEN_QUICK_REFERENCE.md`

