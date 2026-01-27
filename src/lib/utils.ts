import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { StudySummary } from "@/hooks";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get the highest priority status from a list of studies
 * Priority order: 'estudar' (laranja) > 'estudando' (azul) > 'revisando' (roxo) > 'concluído' (verde)
 * Used for visual indication in chapter cards (shows most urgent status)
 * @deprecated Use getAggregatedChapterStatus() instead for better UX
 */
export function getHighestPriorityStatus(studies: StudySummary[]): string {
  if (studies.length === 0) return '';

  const priorityMap: Record<string, number> = {
    'estudar': 4,
    'estudando': 3,
    'revisando': 2,
    'concluído': 1,
  };

  return studies.reduce((highest, current) => {
    const highestPriority = priorityMap[highest] || 0;
    const currentPriority = priorityMap[current.status] || 0;
    return currentPriority > highestPriority ? current.status : highest;
  }, studies[0].status);
}

/**
 * Interface for aggregated chapter status with completion percentage
 * Shows visual progress based on how many studies are completed
 */
export interface AggregatedChapterStatus {
  status: 'vazio' | 'estudar' | 'estudando' | 'revisando' | 'concluído';
  completionPercentage: number;
  color: string;
  textColor: string;
}

/**
 * Calculate aggregated status for a chapter based on completion percentage
 * Maps completion % to intuitive color representation:
 * - 100% → Verde (concluído)
 * - 75%+ → Roxo claro (revisando)
 * - 50%+ → Azul claro (estudando)
 * - 0%+ → Azul normal (estudando)
 * - 0% → Laranja (estudar)
 *
 * @param studies - Array of studies in the chapter
 * @returns Aggregated status with color and percentage
 */
export function getAggregatedChapterStatus(
  studies: StudySummary[]
): AggregatedChapterStatus {
  if (studies.length === 0) {
    return {
      status: 'vazio',
      completionPercentage: 0,
      color: 'bg-white',
      textColor: 'text-gray-600',
    };
  }

  // Count studies by status
  const completedCount = studies.filter(s => s.status === 'concluído').length;
  const completionPercentage = Math.round((completedCount / studies.length) * 100);

  // Map percentage to status and color
  let status: 'estudar' | 'estudando' | 'revisando' | 'concluído';
  let color: string;
  const textColor = 'text-white';

  if (completionPercentage === 100) {
    status = 'concluído';
    color = 'bg-green-600';
  } else if (completionPercentage >= 75) {
    status = 'revisando';
    color = 'bg-purple-500';
  } else if (completionPercentage >= 50) {
    status = 'estudando';
    color = 'bg-blue-500';
  } else if (completionPercentage > 0) {
    status = 'estudando';
    color = 'bg-blue-600';
  } else {
    status = 'estudar';
    color = 'bg-orange-500';
  }

  return {
    status,
    completionPercentage,
    color,
    textColor,
  };
}
