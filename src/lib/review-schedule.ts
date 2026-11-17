import type { StudyStatus } from '@/lib/design-tokens';

/**
 * Revisão espaçada dos cadernos impressos: depois de concluir um capítulo,
 * revisar após 1, 7, 21 e 60 dias. Cada intervalo conta a partir do momento
 * em que a revisão anterior foi marcada (ou da conclusão, para a primeira).
 *
 * review_stage = revisões já feitas (0 a 4); null = fora do agendamento.
 * next_review_at = quando vence a próxima; null = nada pendente.
 * Depois da 4ª revisão: stage 4 e next null (agendamento encerrado).
 */
export const REVIEW_INTERVALS_DAYS = [1, 7, 21, 60] as const;
export const TOTAL_REVIEWS = REVIEW_INTERVALS_DAYS.length;

export interface ReviewSchedule {
  review_stage: number | null;
  next_review_at: string | null;
}

export const NO_SCHEDULE: ReviewSchedule = { review_stage: null, next_review_at: null };

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/** Início do agendamento: primeira revisão 1 dia depois de `now`. */
export function startSchedule(now: Date): ReviewSchedule {
  return { review_stage: 0, next_review_at: addDays(now, REVIEW_INTERVALS_DAYS[0]).toISOString() };
}

/** Depois de marcar "Revisei" com `stage` revisões já feitas. */
export function scheduleAfterReview(stage: number, now: Date): ReviewSchedule {
  const done = stage + 1;
  if (done >= TOTAL_REVIEWS) {
    return { review_stage: TOTAL_REVIEWS, next_review_at: null };
  }
  return { review_stage: done, next_review_at: addDays(now, REVIEW_INTERVALS_DAYS[done]).toISOString() };
}

/**
 * Efeito de uma troca de status no agendamento. null = não mexer.
 * Passar a 'concluído' inicia; sair de 'concluído' limpa.
 */
export function scheduleForStatusChange(
  previous: StudyStatus | undefined,
  next: StudyStatus,
  now: Date
): ReviewSchedule | null {
  if (previous === next) return null;
  if (next === 'concluído') return startSchedule(now);
  return NO_SCHEDULE;
}

/** A revisão vence hoje (até o fim do dia local) ou já venceu. */
export function isReviewDue(nextReviewAt: string | null, now: Date): boolean {
  if (!nextReviewAt) return false;
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);
  return new Date(nextReviewAt).getTime() <= endOfToday.getTime();
}

/** "Revisão 2 de 4" para quem já fez 1 revisão. */
export function reviewLabel(stage: number): string {
  return `Revisão ${stage + 1} de ${TOTAL_REVIEWS}`;
}

/** Estudo concluído que nunca entrou no agendamento (concluído antes do recurso). */
export function canStartSchedule(status: StudyStatus, reviewStage: number | null): boolean {
  return status === 'concluído' && reviewStage === null;
}
