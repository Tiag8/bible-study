import { describe, it, expect } from 'vitest';
import type { StudySummary } from '@/hooks';
import {
  getAggregatedChapterStatus,
  getHighestPriorityStatus,
} from './utils';

describe('getAggregatedChapterStatus', () => {
  /**
   * SCENARIO 1: Empty array
   * Expected: vazio, 0%, white background
   */
  it('retorna vazio com 0% para array vazio', () => {
    const result = getAggregatedChapterStatus([]);

    expect(result.status).toBe('vazio');
    expect(result.completionPercentage).toBe(0);
    expect(result.color).toBe('bg-white');
    expect(result.textColor).toBe('text-gray-600');
  });

  /**
   * SCENARIO 2: Single completed study
   * Expected: concluído, 100%, green
   */
  it('retorna concluído com 100% para 1 estudo completo', () => {
    const studies: StudySummary[] = [
      {
        id: 'uuid-1',
        user_id: 'user-1',
        title: 'Estudo 1',
        book_name: 'Gênesis',
        chapter_number: 1,
        status: 'concluído',
        tags: [],
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
    ];

    const result = getAggregatedChapterStatus(studies);

    expect(result.status).toBe('concluído');
    expect(result.completionPercentage).toBe(100);
    expect(result.color).toBe('bg-green-600');
    expect(result.textColor).toBe('text-white');
  });

  /**
   * SCENARIO 3: Single study to do
   * Expected: estudar, 0%, orange
   */
  it('retorna estudar com 0% para 1 estudo não começado', () => {
    const studies: StudySummary[] = [
      {
        id: 'uuid-1',
        user_id: 'user-1',
        title: 'Estudo 1',
        book_name: 'Gênesis',
        chapter_number: 1,
        status: 'estudar',
        tags: [],
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
    ];

    const result = getAggregatedChapterStatus(studies);

    expect(result.status).toBe('estudar');
    expect(result.completionPercentage).toBe(0);
    expect(result.color).toBe('bg-orange-500');
    expect(result.textColor).toBe('text-white');
  });

  /**
   * SCENARIO 4: Mixed statuses (1 completed, 1 to study)
   * Uses highest priority status: 'estudar' is priority 4, 'concluído' is priority 1
   * Expected: estudar (priority 4 > priority 1), 50%, orange
   */
  it('retorna estudar com 50% para 2 estudos (1 completo, 1 não) - prioriza estudar', () => {
    const studies: StudySummary[] = [
      {
        id: 'uuid-1',
        user_id: 'user-1',
        title: 'Estudo 1',
        book_name: 'Gênesis',
        chapter_number: 1,
        status: 'concluído',
        tags: [],
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
      {
        id: 'uuid-2',
        user_id: 'user-1',
        title: 'Estudo 2',
        book_name: 'Gênesis',
        chapter_number: 1,
        status: 'estudar',
        tags: [],
        created_at: '2024-01-02',
        updated_at: '2024-01-02',
      },
    ];

    const result = getAggregatedChapterStatus(studies);

    expect(result.status).toBe('estudar');
    expect(result.completionPercentage).toBe(50);
    expect(result.color).toBe('bg-orange-500');
  });

  /**
   * SCENARIO 5: Multiple completed with one "estudar"
   * Uses highest priority status: 'estudar' priority 4 > 'concluído' priority 1
   * Expected: estudar, 75%, orange (shows highest priority regardless of percentage)
   */
  it('retorna estudar com 75% para 4 estudos (3 completos, 1 não) - prioriza estudar', () => {
    const studies: StudySummary[] = [
      {
        id: 'uuid-1',
        user_id: 'user-1',
        title: 'Estudo 1',
        book_name: 'Gênesis',
        chapter_number: 1,
        status: 'concluído',
        tags: [],
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
      {
        id: 'uuid-2',
        user_id: 'user-1',
        title: 'Estudo 2',
        book_name: 'Gênesis',
        chapter_number: 1,
        status: 'concluído',
        tags: [],
        created_at: '2024-01-02',
        updated_at: '2024-01-02',
      },
      {
        id: 'uuid-3',
        user_id: 'user-1',
        title: 'Estudo 3',
        book_name: 'Gênesis',
        chapter_number: 1,
        status: 'concluído',
        tags: [],
        created_at: '2024-01-03',
        updated_at: '2024-01-03',
      },
      {
        id: 'uuid-4',
        user_id: 'user-1',
        title: 'Estudo 4',
        book_name: 'Gênesis',
        chapter_number: 1,
        status: 'estudar',
        tags: [],
        created_at: '2024-01-04',
        updated_at: '2024-01-04',
      },
    ];

    const result = getAggregatedChapterStatus(studies);

    expect(result.status).toBe('estudar');
    expect(result.completionPercentage).toBe(75);
    expect(result.color).toBe('bg-orange-500');
  });

  /**
   * SCENARIO 6: Multiple completed with one "estudar"
   * Uses highest priority status: 'estudar' priority 4 > 'concluído' priority 1
   * Expected: estudar, 67%, orange (highest priority wins)
   */
  it('retorna estudar com 67% para 3 estudos (2 completos, 1 não) - prioriza estudar', () => {
    const studies: StudySummary[] = [
      {
        id: 'uuid-1',
        user_id: 'user-1',
        title: 'Estudo 1',
        book_name: 'Gênesis',
        chapter_number: 1,
        status: 'concluído',
        tags: [],
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
      {
        id: 'uuid-2',
        user_id: 'user-1',
        title: 'Estudo 2',
        book_name: 'Gênesis',
        chapter_number: 1,
        status: 'concluído',
        tags: [],
        created_at: '2024-01-02',
        updated_at: '2024-01-02',
      },
      {
        id: 'uuid-3',
        user_id: 'user-1',
        title: 'Estudo 3',
        book_name: 'Gênesis',
        chapter_number: 1,
        status: 'estudar',
        tags: [],
        created_at: '2024-01-03',
        updated_at: '2024-01-03',
      },
    ];

    const result = getAggregatedChapterStatus(studies);

    expect(result.status).toBe('estudar');
    expect(result.completionPercentage).toBe(67);
    expect(result.color).toBe('bg-orange-500');
  });

  /**
   * SCENARIO 7: Multiple studies, all completed
   * Expected: concluído, 100%, green
   */
  it('retorna concluído com 100% para múltiplos estudos completos', () => {
    const studies: StudySummary[] = [
      {
        id: 'uuid-1',
        user_id: 'user-1',
        title: 'Estudo 1',
        book_name: 'Gênesis',
        chapter_number: 1,
        status: 'concluído',
        tags: [],
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
      {
        id: 'uuid-2',
        user_id: 'user-1',
        title: 'Estudo 2',
        book_name: 'Gênesis',
        chapter_number: 1,
        status: 'concluído',
        tags: [],
        created_at: '2024-01-02',
        updated_at: '2024-01-02',
      },
      {
        id: 'uuid-3',
        user_id: 'user-1',
        title: 'Estudo 3',
        book_name: 'Gênesis',
        chapter_number: 1,
        status: 'concluído',
        tags: [],
        created_at: '2024-01-03',
        updated_at: '2024-01-03',
      },
    ];

    const result = getAggregatedChapterStatus(studies);

    expect(result.status).toBe('concluído');
    expect(result.completionPercentage).toBe(100);
    expect(result.color).toBe('bg-green-600');
  });

  /**
   * SCENARIO 8: Mixed statuses (completed vs in review)
   * Uses highest priority status: 'revisando' priority 2 > 'concluído' priority 1
   * Expected: revisando, 50%, purple (highest priority wins despite 50% completion)
   */
  it('retorna revisando com 50% para 2 estudos (1 concluído, 1 revisando) - prioriza revisando', () => {
    const studies: StudySummary[] = [
      {
        id: 'uuid-1',
        user_id: 'user-1',
        title: 'Estudo 1',
        book_name: 'Gênesis',
        chapter_number: 1,
        status: 'concluído',
        tags: [],
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
      {
        id: 'uuid-2',
        user_id: 'user-1',
        title: 'Estudo 2',
        book_name: 'Gênesis',
        chapter_number: 1,
        status: 'revisando', // Not completed, but in review
        tags: [],
        created_at: '2024-01-02',
        updated_at: '2024-01-02',
      },
    ];

    const result = getAggregatedChapterStatus(studies);

    expect(result.completionPercentage).toBe(50);
    expect(result.status).toBe('revisando');
    expect(result.color).toBe('bg-purple-500');
  });

  /**
   * SCENARIO 9: Return type validation
   * Expected: All fields present in return object
   */
  it('retorna objeto com todos os campos necessários', () => {
    const studies: StudySummary[] = [
      {
        id: 'uuid-1',
        user_id: 'user-1',
        title: 'Estudo 1',
        book_name: 'Gênesis',
        chapter_number: 1,
        status: 'estudando',
        tags: [],
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
    ];

    const result = getAggregatedChapterStatus(studies);

    expect(result).toHaveProperty('status');
    expect(result).toHaveProperty('completionPercentage');
    expect(result).toHaveProperty('color');
    expect(result).toHaveProperty('textColor');
    expect(typeof result.status).toBe('string');
    expect(typeof result.completionPercentage).toBe('number');
    expect(typeof result.color).toBe('string');
    expect(typeof result.textColor).toBe('string');
  });

  /**
   * SCENARIO 10: All status types present (priority chain validation)
   * Priority chain: estudar (4) > estudando (3) > revisando (2) > concluído (1)
   * Expected: estudar is the highest, so color should be orange
   */
  it('retorna estudar quando múltiplos status presentes - valida cadeia de prioridade', () => {
    const studies: StudySummary[] = [
      {
        id: 'uuid-1',
        user_id: 'user-1',
        title: 'Estudo 1',
        book_name: 'Gênesis',
        chapter_number: 1,
        status: 'concluído',
        tags: [],
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
      {
        id: 'uuid-2',
        user_id: 'user-1',
        title: 'Estudo 2',
        book_name: 'Gênesis',
        chapter_number: 1,
        status: 'revisando',
        tags: [],
        created_at: '2024-01-02',
        updated_at: '2024-01-02',
      },
      {
        id: 'uuid-3',
        user_id: 'user-1',
        title: 'Estudo 3',
        book_name: 'Gênesis',
        chapter_number: 1,
        status: 'estudando',
        tags: [],
        created_at: '2024-01-03',
        updated_at: '2024-01-03',
      },
      {
        id: 'uuid-4',
        user_id: 'user-1',
        title: 'Estudo 4',
        book_name: 'Gênesis',
        chapter_number: 1,
        status: 'estudar',
        tags: [],
        created_at: '2024-01-04',
        updated_at: '2024-01-04',
      },
    ];

    const result = getAggregatedChapterStatus(studies);

    expect(result.status).toBe('estudar');
    expect(result.color).toBe('bg-orange-500');
    expect(result.completionPercentage).toBe(25);
  });

  /**
   * SCENARIO 11: Only completed studies (no urgency)
   * Expected: concluído (priority 1 is "least urgent" but only option)
   */
  it('retorna concluído quando todos estudos estão concluídos', () => {
    const studies: StudySummary[] = [
      {
        id: 'uuid-1',
        user_id: 'user-1',
        title: 'Estudo 1',
        book_name: 'Gênesis',
        chapter_number: 1,
        status: 'concluído',
        tags: [],
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
      {
        id: 'uuid-2',
        user_id: 'user-1',
        title: 'Estudo 2',
        book_name: 'Gênesis',
        chapter_number: 1,
        status: 'concluído',
        tags: [],
        created_at: '2024-01-02',
        updated_at: '2024-01-02',
      },
    ];

    const result = getAggregatedChapterStatus(studies);

    expect(result.status).toBe('concluído');
    expect(result.color).toBe('bg-green-600');
    expect(result.completionPercentage).toBe(100);
  });
});

/**
 * Tests for legacy getHighestPriorityStatus (kept for backwards compatibility)
 */
describe('getHighestPriorityStatus (deprecated)', () => {
  it('retorna vazio para array vazio', () => {
    expect(getHighestPriorityStatus([])).toBe('');
  });

  it('prioriza estudar sobre concluído', () => {
    const studies: StudySummary[] = [
      {
        id: 'uuid-1',
        user_id: 'user-1',
        title: 'Estudo 1',
        book_name: 'Gênesis',
        chapter_number: 1,
        status: 'concluído',
        tags: [],
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
      {
        id: 'uuid-2',
        user_id: 'user-1',
        title: 'Estudo 2',
        book_name: 'Gênesis',
        chapter_number: 1,
        status: 'estudar',
        tags: [],
        created_at: '2024-01-02',
        updated_at: '2024-01-02',
      },
    ];

    expect(getHighestPriorityStatus(studies)).toBe('estudar');
  });
});
