import { Circle, RefreshCw, CheckCircle, BookOpen, LucideIcon } from 'lucide-react'
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
  primary: {
    light: 'bg-blue-50',
    lighter: 'bg-blue-100',
    default: 'bg-blue-600',
    dark: 'bg-blue-700',
    text: 'text-blue-600',
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
// TAG COLORS (Direct hex values for tag styling)
// ============================================

export const TAG_COLORS: Record<string, string> = {
  blue: '#C5D5E4',
  purple: '#D1C4E0',
  green: '#C5D9C0',
  orange: '#E8D0B3',
  pink: '#E0C8CF',
  cyan: '#BDD8D6',
  red: '#DEC0B8',
  yellow: '#E0D8B0',
  'dark-green': '#A8C5A0',
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
  status: {
    studying: { bg: 'bg-[#FFF8E7]', text: 'text-[#92742B]' },
    reviewing: { bg: 'bg-[#F3EEF8]', text: 'text-[#6B5B7B]' },
    done: { bg: 'bg-[#EEF5EC]', text: 'text-[#4A6741]' },
    todo: { bg: 'bg-[#FEF0E7]', text: 'text-[#8B5E3C]' },
  },
} as const

// ============================================
// STATUS CONFIG (Study status indicators)
// ============================================

export type StudyStatus = 'estudar' | 'estudando' | 'revisando' | 'concluído'

export interface StatusConfig {
  icon: LucideIcon
  color: string
  bg: string
  label: string
}

export const STATUS_CONFIG: Record<StudyStatus, StatusConfig> = {
  estudar: {
    icon: BookOpen,
    color: COLORS.warning.text,
    bg: COLORS.warning.light,
    label: 'Estudar'
  },
  estudando: {
    icon: Circle,
    color: COLORS.primary.text,
    bg: COLORS.primary.lighter,
    label: 'Estudando'
  },
  revisando: {
    icon: RefreshCw,
    color: COLORS.secondary.text,
    bg: COLORS.secondary.lighter,
    label: 'Revisando'
  },
  concluído: {
    icon: CheckCircle,
    color: COLORS.success.text,
    bg: COLORS.success.lighter,
    label: 'Concluído'
  },
} as const

// ============================================
// REFERENCE TYPE COLORS (Story 4.3.3)
// ============================================

/**
 * Colors for different reference types
 * - references: Internal references created by user (green)
 * - referenced_by: Reversed references created by trigger (red)
 * - external: External links to websites (blue)
 *
 * All colors validated for WCAG AA contrast (4.5:1)
 * Uses light tones (50) with darker borders (200) for clarity
 */
export const REFERENCE_TYPE_COLORS = {
  references: 'bg-green-50 border-green-200 hover:bg-green-100',
  referenced_by: 'bg-red-50 border-red-200 hover:bg-red-100',
  external: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
} as const

export type ReferenceTypeColor = keyof typeof REFERENCE_TYPE_COLORS

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
