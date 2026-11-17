import { describe, it, expect } from 'vitest';
import { formatRelativeDate } from '@/lib/mock-data';

const NOW = new Date('2026-11-17T12:00:00Z');
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000).toISOString();

describe('formatRelativeDate', () => {
  it('sem data diz "Nunca"', () => {
    expect(formatRelativeDate(null, NOW)).toBe('Nunca');
  });

  it('hoje e ontem', () => {
    expect(formatRelativeDate(daysAgo(0), NOW)).toBe('Hoje');
    expect(formatRelativeDate(daysAgo(1), NOW)).toBe('Ontem');
  });

  it('dias no plural de 2 a 6', () => {
    expect(formatRelativeDate(daysAgo(2), NOW)).toBe('2 dias atrás');
    expect(formatRelativeDate(daysAgo(6), NOW)).toBe('6 dias atrás');
  });

  it('1 semana no singular, 2 ou mais no plural', () => {
    expect(formatRelativeDate(daysAgo(7), NOW)).toBe('1 semana atrás');
    expect(formatRelativeDate(daysAgo(13), NOW)).toBe('1 semana atrás');
    expect(formatRelativeDate(daysAgo(14), NOW)).toBe('2 semanas atrás');
    expect(formatRelativeDate(daysAgo(29), NOW)).toBe('4 semanas atrás');
  });

  it('30 dias ou mais mostra a data', () => {
    expect(formatRelativeDate(daysAgo(30), NOW)).toBe(new Date(daysAgo(30)).toLocaleDateString('pt-BR'));
  });
});
