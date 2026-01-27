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
  blue: '#3b82f6',
  purple: '#8b5cf6',
  green: '#22c55e',
  orange: '#f97316',
  pink: '#ec4899',
  cyan: '#06b6d4',
  red: '#ef4444',
  yellow: '#eab308',
  'dark-green': '#15803d',
}

// ============================================
// TYPOGRAPHY
// ============================================

export const TYPOGRAPHY = {
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

// ============================================
// BORDERS
// ============================================

export const BORDERS = {
  gray: 'border-gray-200',
  primary: 'border-blue-200',
  light: 'border-gray-100',
}

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
