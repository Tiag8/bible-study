# Design Tokens - Quick Reference

> Copy-paste cheat sheet for design tokens. For detailed guide, see DESIGN_TOKENS_GUIDE.md

## Import

```typescript
import { COLORS, TAG_COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, BORDERS, SHADOW_CLASSES, STATUS_CONFIG } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';
```

---

## COLORS - Semantic Color System

| Token | Usage | Tailwind Class |
|-------|-------|---|
| `COLORS.primary.light` | Light background | `bg-blue-50` |
| `COLORS.primary.lighter` | Lighter background | `bg-blue-100` |
| `COLORS.primary.default` | Main action/button | `bg-blue-600` |
| `COLORS.primary.dark` | Dark variant | `bg-blue-700` |
| `COLORS.primary.text` | Text color | `text-blue-600` |
| `COLORS.success.light` | Light success background | `bg-green-50` |
| `COLORS.success.default` | Success action | `bg-green-600` |
| `COLORS.success.text` | Success text | `text-green-600` |
| `COLORS.warning.light` | Light warning background | `bg-orange-50` |
| `COLORS.warning.default` | Warning action | `bg-orange-500` |
| `COLORS.warning.text` | Warning text | `text-orange-600` |
| `COLORS.danger.light` | Light danger background | `bg-red-50` |
| `COLORS.danger.default` | Danger action | `bg-red-600` |
| `COLORS.danger.text` | Danger text | `text-red-600` |
| `COLORS.secondary.light` | Light secondary background | `bg-purple-50` |
| `COLORS.secondary.default` | Secondary action | `bg-purple-600` |
| `COLORS.secondary.text` | Secondary text | `text-purple-600` |
| `COLORS.accent.light` | Light accent background | `bg-cyan-50` |
| `COLORS.accent.default` | Accent action | `bg-cyan-600` |
| `COLORS.accent.text` | Accent text | `text-cyan-600` |
| `COLORS.neutral[50-900]` | Gray scale (50 to 900) | `bg-gray-X` |
| `COLORS.neutral.text.primary` | Main text color | `text-gray-900` |
| `COLORS.neutral.text.secondary` | Secondary text | `text-gray-600` |
| `COLORS.neutral.text.muted` | Muted text | `text-gray-500` |
| `COLORS.neutral.text.light` | Light text | `text-gray-400` |

---

## TAG_COLORS - Direct Hex Values

```typescript
TAG_COLORS.blue        // #3b82f6
TAG_COLORS.purple      // #8b5cf6
TAG_COLORS.green       // #22c55e
TAG_COLORS.orange      // #f97316
TAG_COLORS.pink        // #ec4899
TAG_COLORS.cyan        // #06b6d4
TAG_COLORS.red         // #ef4444
TAG_COLORS.yellow      // #eab308
TAG_COLORS['dark-green'] // #15803d

// Usage:
<span style={{ backgroundColor: TAG_COLORS.blue }}>Tag</span>
```

---

## TYPOGRAPHY - Font Sizes & Weights

| Token | Value |
|-------|-------|
| `TYPOGRAPHY.sizes.xs` | `text-xs` |
| `TYPOGRAPHY.sizes.sm` | `text-sm` |
| `TYPOGRAPHY.sizes.base` | `text-base` |
| `TYPOGRAPHY.sizes.lg` | `text-lg` |
| `TYPOGRAPHY.sizes.xl` | `text-xl` |
| `TYPOGRAPHY.sizes['2xl']` | `text-2xl` |
| `TYPOGRAPHY.weights.normal` | `font-normal` |
| `TYPOGRAPHY.weights.medium` | `font-medium` |
| `TYPOGRAPHY.weights.semibold` | `font-semibold` |
| `TYPOGRAPHY.weights.bold` | `font-bold` |

### Examples
```tsx
// Heading
<h2 className={cn(TYPOGRAPHY.sizes.lg, TYPOGRAPHY.weights.semibold)}>
  Title
</h2>

// Body text
<p className={cn(TYPOGRAPHY.sizes.base, TYPOGRAPHY.weights.normal)}>
  Content
</p>

// Small label
<label className={cn(TYPOGRAPHY.sizes.sm, TYPOGRAPHY.weights.medium)}>
  Label
</label>
```

---

## SPACING - Padding & Margin

| Token | Value |
|-------|-------|
| `SPACING.xs` | `0.25rem` (4px) |
| `SPACING.sm` | `0.5rem` (8px) |
| `SPACING.md` | `1rem` (16px) |
| `SPACING.lg` | `1.5rem` (24px) |
| `SPACING.xl` | `2rem` (32px) |
| `SPACING['2xl']` | `3rem` (48px) |

### Example
```tsx
// Note: SPACING values are direct values, not Tailwind classes
// Use with inline styles or create custom utility classes
<div style={{ padding: SPACING.md }}>
  Content with spacing
</div>
```

---

## BORDER_RADIUS - Rounded Corners

| Token | Value |
|-------|-------|
| `BORDER_RADIUS.none` | `rounded-none` |
| `BORDER_RADIUS.sm` | `rounded-sm` |
| `BORDER_RADIUS.md` | `rounded-md` |
| `BORDER_RADIUS.lg` | `rounded-lg` |
| `BORDER_RADIUS.xl` | `rounded-xl` |
| `BORDER_RADIUS.full` | `rounded-full` |

### Example
```tsx
<div className={cn(
  COLORS.primary.light,
  BORDER_RADIUS.lg,
  "p-4"
)}>
  Card
</div>
```

---

## BORDERS - Border Colors

| Token | Value |
|-------|-------|
| `BORDERS.gray` | `border-gray-200` |
| `BORDERS.primary` | `border-blue-200` |
| `BORDERS.light` | `border-gray-100` |

### Example
```tsx
<div className={cn("border", BORDERS.gray)}>
  Content with border
</div>
```

---

## SHADOW_CLASSES - Elevation & Depth

| Token | CSS Value | Use Case |
|-------|-----------|----------|
| `SHADOW_CLASSES.none` | `none` | No shadow |
| `SHADOW_CLASSES.sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | Subtle elevation |
| `SHADOW_CLASSES.md` | `0 4px 6px -1px rgb(0 0 0 / 0.1)` | Default elevation |
| `SHADOW_CLASSES.lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1)` | Prominent elevation |

### Example
```tsx
// Card with elevation
<div className={cn(
  "bg-white rounded-lg p-6",
  SHADOW_CLASSES.md
)}>
  Card content
</div>

// Modal with prominent shadow
<div className={cn(
  "bg-white rounded-lg p-6",
  SHADOW_CLASSES.lg
)}>
  Modal content
</div>
```

---

## STATUS_CONFIG - Study Status

| Status | Icon | Color | Background | Label |
|--------|------|-------|------------|-------|
| `estudar` | BookOpen | warning.text | warning.light | Estudar |
| `estudando` | Circle | primary.text | primary.lighter | Estudando |
| `revisando` | RefreshCw | secondary.text | secondary.lighter | Revisando |
| `concluído` | CheckCircle | success.text | success.light | Concluído |

### Example
```tsx
import { STATUS_CONFIG } from '@/lib/design-tokens';

function StatusBadge({ status }: { status: StudyStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <div className={cn(config.bg, BORDER_RADIUS.md, "flex items-center gap-2 px-3 py-1")}>
      <config.icon className="w-4 h-4" />
      <span className={config.color}>{config.label}</span>
    </div>
  );
}
```

---

## Common Patterns

### Primary Button
```tsx
<button className={cn(
  "px-4 py-2",
  BORDER_RADIUS.md,
  COLORS.primary.default,
  "text-white",
  "transition-all hover:opacity-90"
)}>
  Action
</button>
```

### Success Alert
```tsx
<div className={cn(
  "rounded-lg p-4",
  COLORS.success.light,
  "border",
  BORDERS.primary
)}>
  <span className={COLORS.success.text}>
    ✓ Success message
  </span>
</div>
```

### Modal/Card
```tsx
<div className={cn(
  "bg-white rounded-lg p-6",
  "border",
  BORDERS.gray,
  SHADOW_CLASSES.lg
)}>
  Modal content
</div>
```

### Form Input
```tsx
<input
  type="text"
  placeholder="Enter text"
  className={cn(
    "px-3 py-2 border",
    BORDERS.gray,
    BORDER_RADIUS.md,
    "focus:ring-2 focus:ring-blue-500"
  )}
/>
```

### Disabled State
```tsx
<button
  disabled
  className={cn(
    "px-4 py-2",
    BORDER_RADIUS.md,
    COLORS.primary.default,
    "opacity-50 cursor-not-allowed"
  )}
>
  Disabled
</button>
```

### Text Hierarchy
```tsx
<div>
  <h1 className={cn(TYPOGRAPHY.sizes['2xl'], TYPOGRAPHY.weights.bold)}>
    Main Heading
  </h1>
  <p className={cn(COLORS.neutral.text.primary)}>
    Primary text content
  </p>
  <p className={cn(COLORS.neutral.text.secondary)}>
    Secondary text content
  </p>
  <p className={cn(COLORS.neutral.text.muted)}>
    Muted text content
  </p>
</div>
```

---

## Color Usage Guide

**Use PRIMARY for:**
- Main action buttons
- Links
- Focus states
- Important UI elements

**Use SUCCESS for:**
- Confirmations
- Positive states
- Check marks
- "Concluído" status

**Use WARNING for:**
- Alerts requiring attention
- Numbers of pending items
- "Estudando" or "Revisando" status

**Use DANGER for:**
- Destructive actions (delete)
- Error states
- Red alert messages

**Use SECONDARY for:**
- Alternative actions
- Secondary status ("Revisando")
- Less emphasized UI

**Use NEUTRAL for:**
- Body text
- Backgrounds
- Borders
- Structural elements

**Use ACCENT for:**
- Special emphasis
- Promotional elements
- Highlight features

---

## File Locations

| File | Purpose |
|------|---------|
| `src/lib/design-tokens.ts` | Token definitions (source of truth) |
| `src/styles/shadows.module.css` | Shadow class definitions |
| `src/app/globals.css` | Global CSS variables |
| `docs/guides/DESIGN_TOKENS_GUIDE.md` | Complete guide with examples |
| `docs/guides/TOKEN_QUICK_REFERENCE.md` | This quick reference |

---

## Tips & Tricks

### ✅ DO
- Use `cn()` utility to combine classes
- Keep semantic meanings consistent
- Leverage `.light` and `.lighter` for backgrounds
- Use `.text` variants for text colors
- Organize imports at top of component

### ❌ DON'T
- Hardcode Tailwind classes (use tokens instead)
- Mix multiple color systems
- Use `.text` variant for backgrounds
- Forget to add proper text contrast
- Assume colors work in dark mode

---

Last updated: 2026-01-27
