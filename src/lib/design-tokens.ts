import { Circle, RefreshCw, CheckCircle, LucideIcon } from 'lucide-react'

export type StudyStatus = 'estudando' | 'revisando' | 'concluído'

export interface StatusConfig {
  icon: LucideIcon
  color: string
  bg: string
  label: string
}

export const STATUS_CONFIG: Record<StudyStatus, StatusConfig> = {
  estudando: {
    icon: Circle,
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    label: 'Estudando'
  },
  revisando: {
    icon: RefreshCw,
    color: 'text-purple-600',
    bg: 'bg-purple-100',
    label: 'Revisando'
  },
  concluído: {
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-100',
    label: 'Concluído'
  },
} as const
