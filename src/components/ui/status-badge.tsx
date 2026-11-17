"use client"

import type { StudyStatus } from '@/lib/design-tokens'
import { STATUS_THEME } from '@/lib/theme-colors'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: StudyStatus
  showIcon?: boolean
  showText?: boolean
  size?: 'sm' | 'md'
  className?: string
}

/**
 * Selo de status no tema pergaminho: preenchimento, borda e tinta vêm de STATUS_THEME.
 * O selo leva o ícone e o nome; sem o nome visível, o nome vai num aria-label.
 */
export function StatusBadge({
  status,
  showIcon = true,
  showText = true,
  size = 'sm',
  className,
}: StatusBadgeProps) {
  const theme = STATUS_THEME[status]
  const Icon = theme.icon

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium whitespace-nowrap',
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: theme.fill,
        color: theme.ink,
        borderColor: theme.border,
        borderStyle: theme.borderStyle,
      }}
      role={showText ? undefined : 'img'}
      aria-label={showText ? undefined : `Status: ${theme.label}`}
    >
      {showIcon && <Icon className={cn(iconSizes[size], 'shrink-0')} aria-hidden="true" />}
      {showText && <span>{theme.label}</span>}
    </span>
  )
}
