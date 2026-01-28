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
 * @deprecated Use getAggregatedChapterStatus() instead - now uses status-based priority
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
 * Calculate aggregated status for a chapter based on HIGHEST PRIORITY STATUS
 * (Party Mode Decision: Alt 1 - Status Predominante with corrected priority)
 *
 * Priority order (urgency level):
 * - concluído (priority 1): Green - least urgent, work is complete
 * - revisando (priority 2): Purple - maintenance work
 * - estudando (priority 3): Blue - active work
 * - estudar (priority 4): Orange - most urgent, new work to start
 *
 * The function returns the color corresponding to the HIGHEST priority status present.
 * This ensures the chapter color reflects the most urgent/prioritized work available.
 *
 * @param studies - Array of studies in the chapter
 * @returns Aggregated status with color, completion percentage, and text color
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

  // Priority map: lower number = less urgent, higher number = more urgent
  const STATUS_PRIORITY = {
    'concluído': 1,
    'revisando': 2,
    'estudando': 3,
    'estudar': 4,
  } as const;

  // Find the highest priority status among all studies
  const highestPriorityStatus = studies.reduce((highest, current) => {
    const highestPriority = STATUS_PRIORITY[highest.status as keyof typeof STATUS_PRIORITY] || 0;
    const currentPriority = STATUS_PRIORITY[current.status as keyof typeof STATUS_PRIORITY] || 0;
    return currentPriority > highestPriority ? current : highest;
  }).status as 'estudar' | 'estudando' | 'revisando' | 'concluído';

  // Calculate completion percentage for informational display
  const completedCount = studies.filter(s => s.status === 'concluído').length;
  const completionPercentage = Math.round((completedCount / studies.length) * 100);

  // Map status to color and text styling
  let color: string;
  const textColor = 'text-white';

  switch (highestPriorityStatus) {
    case 'concluído':
      color = 'bg-green-600';
      break;
    case 'revisando':
      color = 'bg-purple-500';
      break;
    case 'estudando':
      color = 'bg-blue-500';
      break;
    case 'estudar':
      color = 'bg-orange-500';
      break;
  }

  return {
    status: highestPriorityStatus,
    completionPercentage,
    color,
    textColor,
  };
}
