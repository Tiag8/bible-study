import { describe, it, expect } from 'vitest';
import {
  NO_SCHEDULE,
  TOTAL_REVIEWS,
  canStartSchedule,
  isReviewDue,
  reviewLabel,
  scheduleAfterReview,
  scheduleForStatusChange,
  startSchedule,
} from '@/lib/review-schedule';

// Meio-dia local, longe da virada do dia.
const NOW = new Date(2026, 10, 17, 12, 0, 0);

function daysAfterNow(iso: string | null): number {
  if (!iso) throw new Error('sem data');
  return Math.round((new Date(iso).getTime() - NOW.getTime()) / 86_400_000);
}

describe('Revisão espaçada (1, 7, 21, 60 dias)', () => {
  describe('startSchedule', () => {
    it('primeira revisão vence 1 dia depois da conclusão', () => {
      const s = startSchedule(NOW);
      expect(s.review_stage).toBe(0);
      expect(daysAfterNow(s.next_review_at)).toBe(1);
    });
  });

  describe('scheduleAfterReview', () => {
    it('cada revisão agenda o próximo intervalo a partir do momento marcado', () => {
      expect(scheduleAfterReview(0, NOW).review_stage).toBe(1);
      expect(daysAfterNow(scheduleAfterReview(0, NOW).next_review_at)).toBe(7);
      expect(daysAfterNow(scheduleAfterReview(1, NOW).next_review_at)).toBe(21);
      expect(daysAfterNow(scheduleAfterReview(2, NOW).next_review_at)).toBe(60);
    });

    it('a 4ª revisão encerra o agendamento', () => {
      expect(scheduleAfterReview(3, NOW)).toEqual({ review_stage: TOTAL_REVIEWS, next_review_at: null });
    });

    it('marcar de novo depois de encerrado continua encerrado', () => {
      expect(scheduleAfterReview(TOTAL_REVIEWS, NOW)).toEqual({ review_stage: TOTAL_REVIEWS, next_review_at: null });
    });
  });

  describe('scheduleForStatusChange', () => {
    it('passar a concluído inicia o agendamento', () => {
      const s = scheduleForStatusChange('revisando', 'concluído', NOW);
      expect(s?.review_stage).toBe(0);
      expect(daysAfterNow(s?.next_review_at ?? null)).toBe(1);
    });

    it('sair de concluído limpa o agendamento', () => {
      expect(scheduleForStatusChange('concluído', 'estudando', NOW)).toEqual(NO_SCHEDULE);
      expect(scheduleForStatusChange('concluído', 'revisando', NOW)).toEqual(NO_SCHEDULE);
    });

    it('escolher concluído de novo não reinicia o agendamento', () => {
      expect(scheduleForStatusChange('concluído', 'concluído', NOW)).toBeNull();
    });
  });

  describe('isReviewDue', () => {
    it('vence hoje, mesmo mais tarde no dia, e quando atrasada', () => {
      expect(isReviewDue(new Date(2026, 10, 17, 23, 0).toISOString(), NOW)).toBe(true);
      expect(isReviewDue(new Date(2026, 10, 10, 8, 0).toISOString(), NOW)).toBe(true);
    });

    it('não vence amanhã nem sem data', () => {
      expect(isReviewDue(new Date(2026, 10, 18, 0, 0).toISOString(), NOW)).toBe(false);
      expect(isReviewDue(null, NOW)).toBe(false);
    });
  });

  it('reviewLabel mostra qual revisão é', () => {
    expect(reviewLabel(0)).toBe('Revisão 1 de 4');
    expect(reviewLabel(1)).toBe('Revisão 2 de 4');
  });

  it('canStartSchedule só para concluído sem agendamento', () => {
    expect(canStartSchedule('concluído', null)).toBe(true);
    expect(canStartSchedule('concluído', 0)).toBe(false);
    expect(canStartSchedule('concluído', TOTAL_REVIEWS)).toBe(false);
    expect(canStartSchedule('estudando', null)).toBe(false);
  });
});
