import shadows from '@/styles/shadows.module.css'

/**
 * Centralized Design Tokens
 * Single source of truth for colors, sizing, spacing, and other design properties
 */

// ============================================
// SEMANTIC COLORS (Status-based)
// ============================================

export const COLORS = {
  // Primary (Action/Focus)
  // Primária no tema pergaminho (era azul). Texto branco sobre o tom padrão: 5,30:1;
  // o tom de texto sobre o claro: 5,9:1.
  primary: {
    light: 'bg-amber-light',
    lighter: 'bg-amber-light',
    default: 'bg-amber-dark',
    dark: 'bg-[#6B4E0A]',
    text: 'text-[#6B4E0A]',
  },

  // Success
  success: {
    light: 'bg-green-50',
    lighter: 'bg-green-100',
    default: 'bg-green-600',
    dark: 'bg-green-700',
    text: 'text-green-600',
  },

  // Warning/Secondary
  warning: {
    light: 'bg-orange-50',
    lighter: 'bg-orange-100',
    default: 'bg-orange-500',
    dark: 'bg-orange-600',
    text: 'text-orange-600',
  },

  // Danger/Destructive
  danger: {
    light: 'bg-red-50',
    lighter: 'bg-red-100',
    default: 'bg-red-600',
    dark: 'bg-red-700',
    text: 'text-red-600',
  },

  // Secondary (Status review)
  secondary: {
    light: 'bg-purple-50',
    lighter: 'bg-purple-100',
    default: 'bg-purple-600',
    dark: 'bg-purple-700',
    text: 'text-purple-600',
  },

  // Neutral/Gray
  neutral: {
    50: 'bg-gray-50',
    100: 'bg-gray-100',
    200: 'bg-gray-200',
    300: 'bg-gray-300',
    400: 'bg-gray-400',
    500: 'bg-gray-500',
    600: 'bg-gray-600',
    700: 'bg-gray-700',
    800: 'bg-gray-800',
    900: 'bg-gray-900',
    text: {
      primary: 'text-gray-900',
      secondary: 'text-gray-600',
      muted: 'text-gray-500',
      light: 'text-gray-400',
    }
  },

  // Accent (Ciano/Teal)
  accent: {
    light: 'bg-cyan-50',
    lighter: 'bg-cyan-100',
    default: 'bg-cyan-600',
    dark: 'bg-cyan-700',
    text: 'text-cyan-600',
  }
}

// ============================================
// TYPOGRAPHY
// ============================================

export const TYPOGRAPHY = {
  families: {
    serif: 'font-lora',
    sans: 'font-inter',
  },
  sizes: {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
  },
  weights: {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  }
}

// ============================================
// SPACING
// ============================================

export const SPACING = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
}

// ============================================
// BORDER RADIUS
// ============================================

export const BORDER_RADIUS = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
}

// ============================================
// SHADOWS
// ============================================

/**
 * Shadow classes mapped from CSS modules
 * Use SHADOW_CLASSES for all new code
 * SHADOWS_LEGACY kept for backward compatibility (1 sprint only)
 */
export const SHADOW_CLASSES = {
  none: shadows.shadowNone,
  sm: shadows.shadowSm,
  md: shadows.shadowMd,
  lg: shadows.shadowLg,
} as const

// Legacy - for backward compatibility during transition
export const SHADOWS = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
}

// Warm shadows (parchment theme - sepia tones)
export const SHADOW_WARM = {
  sm: shadows.shadowWarmSm,
  md: shadows.shadowWarmMd,
  lg: shadows.shadowWarmLg,
} as const

// ============================================
// BORDERS
// ============================================

export const BORDERS = {
  gray: 'border-gray-200',
  primary: 'border-blue-200',
  light: 'border-gray-100',
  linen: 'border-linen',
}

// ============================================
// PARCHMENT THEME (Epic 6.1)
// ============================================

/**
 * Parchment theme tokens for dashboard redesign.
 * Extends (not replaces) existing COLORS for backward compatibility.
 * Use PARCHMENT in dashboard components; COLORS remains for Editor, Grafo, etc.
 */
export const PARCHMENT = {
  bg: {
    page: 'bg-parchment',
    card: 'bg-cream',
    sidebar: 'bg-ivory',
    input: 'bg-warm-white',
    hover: 'bg-warm-white',
  },
  text: {
    primary: 'text-[#272626]',
    heading: 'text-espresso',
    subheading: 'text-walnut',
    secondary: 'text-stone',
    muted: 'text-sand',
  },
  accent: {
    default: 'bg-amber',
    light: 'bg-amber-light',
    dark: 'bg-amber-dark',
    text: 'text-amber',
    textDark: 'text-amber-dark',
  },
  border: {
    default: 'border-linen',
    hover: 'border-amber-light',
  },
} as const

// ============================================
// STUDY STATUS
// ============================================

/**
 * Status de um estudo. Ícone, nome e cores de cada status ficam em
 * STATUS_THEME (src/lib/theme-colors.ts).
 */
export type StudyStatus = 'estudar' | 'estudando' | 'revisando' | 'concluído'

// ============================================
// PARCHMENT HEX VALUES (for Canvas/non-Tailwind contexts)
// ============================================

/**
 * Raw hex values for use in Canvas API, inline styles,
 * and other contexts where Tailwind classes don't apply.
 * Must stay in sync with tailwind.config.ts custom colors.
 */
export const PARCHMENT_HEX = {
  parchment: '#e8e0d1',
  cream: '#f0eee4',
  ivory: '#f5f0e8',
  warmWhite: '#f7f3eb',
  linen: '#EDE8E0',
  espresso: '#3C2415',
  walnut: '#5C4033',
  stone: '#7A6F64',
  sand: '#A69B8D',
  amber: '#B8860B',
  amberLight: '#F5E6C8',
  amberDark: '#8B6508',
} as const
