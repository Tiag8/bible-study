import { describe, it, expect } from 'vitest';

/**
 * Função helper que replica a lógica de contagem de capítulos únicos
 * usada em DashboardClient.tsx e ChapterView.tsx
 */
function getUniqueChapters(studies: Array<{ chapter_number: number }>): number[] {
  return [...new Set(studies.map(s => s.chapter_number))];
}

describe('Chapter Counting Logic', () => {
  describe('Contagem de Capítulos Únicos', () => {
    it('retorna array vazio quando não há estudos', () => {
      const studies: Array<{ chapter_number: number }> = [];
      const uniqueChapters = getUniqueChapters(studies);

      expect(uniqueChapters).toEqual([]);
      expect(uniqueChapters.length).toBe(0);
    });

    it('conta 1 estudo em 1 capítulo como 1 capítulo', () => {
      const studies = [{ chapter_number: 1 }];
      const uniqueChapters = getUniqueChapters(studies);

      expect(uniqueChapters.length).toBe(1);
      expect(uniqueChapters).toEqual([1]);
    });

    it('conta múltiplos estudos no MESMO capítulo como 1 capítulo único', () => {
      const studies = [
        { chapter_number: 2 },
        { chapter_number: 2 }
      ];
      const uniqueChapters = getUniqueChapters(studies);

      expect(uniqueChapters.length).toBe(1);
      expect(uniqueChapters).toEqual([2]);
    });

    it('conta estudos em capítulos DIFERENTES corretamente', () => {
      const studies = [
        { chapter_number: 1 },
        { chapter_number: 3 },
        { chapter_number: 5 }
      ];
      const uniqueChapters = getUniqueChapters(studies);

      expect(uniqueChapters.length).toBe(3);
      expect(uniqueChapters).toContain(1);
      expect(uniqueChapters).toContain(3);
      expect(uniqueChapters).toContain(5);
    });

    it('conta 3 estudos no cap 1 + 2 no cap 2 como 2 capítulos únicos', () => {
      const studies = [
        { chapter_number: 1 },
        { chapter_number: 1 },
        { chapter_number: 1 },
        { chapter_number: 2 },
        { chapter_number: 2 }
      ];
      const uniqueChapters = getUniqueChapters(studies);

      expect(uniqueChapters.length).toBe(2);
    });
  });

  describe('Cálculo de Progresso', () => {
    it('calcula 0% para livro sem estudos', () => {
      const totalChapters = 50;
      const studiedChapters: number[] = [];
      const progress = totalChapters > 0
        ? (studiedChapters.length / totalChapters) * 100
        : 0;

      expect(progress).toBe(0);
    });

    it('calcula progresso correto para livro parcialmente estudado', () => {
      const totalChapters = 50; // Gênesis
      const studiedChapters = [1, 3]; // 2 capítulos únicos
      const progress = (studiedChapters.length / totalChapters) * 100;

      expect(progress).toBe(4); // 2/50 = 4%
    });

    it('calcula 100% para livro com todos capítulos estudados', () => {
      const totalChapters = 4; // Rute
      const studiedChapters = [1, 2, 3, 4];
      const progress = (studiedChapters.length / totalChapters) * 100;

      expect(progress).toBe(100);
    });

    it('calcula progresso para livro de 1 capítulo (Obadias)', () => {
      const totalChapters = 1; // Obadias
      const studiedChapters = [1];
      const progress = (studiedChapters.length / totalChapters) * 100;

      expect(progress).toBe(100);
    });
  });

  describe('BUG REGRESSION: Gênesis com 2 estudos no cap 2', () => {
    it('deve contar como 1 capítulo único, não 2 estudos', () => {
      // Cenário do bug reportado
      const genesisStudies = [
        { book_name: 'Gênesis', chapter_number: 2, title: 'Estudo 1' },
        { book_name: 'Gênesis', chapter_number: 2, title: 'Estudo 2' }
      ];

      const studiedChapters = getUniqueChapters(genesisStudies);

      // CRÍTICO: Deve ser 1, não 2
      expect(studiedChapters.length).toBe(1);
      expect(studiedChapters).toEqual([2]);

      // Progresso deve ser 2% (1/50), não 4% (2/50)
      const progress = (studiedChapters.length / 50) * 100;
      expect(progress).toBe(2);
    });
  });

  describe('Total de Capítulos no Dashboard', () => {
    it('soma capítulos únicos de múltiplos livros', () => {
      const books = [
        { name: 'Gênesis', studiedChapters: [1, 3] },      // 2 capítulos
        { name: 'Êxodo', studiedChapters: [] },            // 0 capítulos
        { name: 'Rute', studiedChapters: [1, 2, 3, 4] }   // 4 capítulos
      ];

      const total = books.reduce((acc, b) => acc + b.studiedChapters.length, 0);

      expect(total).toBe(6); // 2 + 0 + 4
    });
  });
});
