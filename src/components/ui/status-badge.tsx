"use client"

import { STATUS_CONFIG, StudyStatus } from '@/lib/design-tokens'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: StudyStatus
  showIcon?: boolean
  showText?: boolean
  size?: 'sm' | 'md'
  className?: string
}

export function StatusBadge({
  status,
  showIcon = true,
  showText = true,
  size = 'sm',
  className,
}: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        config.bg,
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label={`Status: ${config.label}`}
    >
      {showIcon && (
        <Icon className={cn(iconSizes[size], config.color)} aria-hidden="true" />
      )}
      {showText && <span className={config.color}>{config.label}</span>}
    </span>
  )
}
