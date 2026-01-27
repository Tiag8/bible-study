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
