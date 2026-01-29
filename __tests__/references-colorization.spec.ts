/**
 * Reference Colorization Tests
 * Story 4.3.3 - Validação de cores por tipo de referência
 *
 * Testes para validar que cores corretas são aplicadas a cada tipo de referência
 */

import { expect, test, describe } from '@jest/globals';
import { getReferenceTypeColor, getReferenceTypeLabel } from '@/lib/reference-utils';
import { Reference } from '@/hooks/useReferences';

describe('Reference Colorization (Story 4.3.3)', () => {
  describe('getReferenceTypeColor()', () => {
    test('deve retornar cor verde para referências internas (eu referencio)', () => {
      const ref: Reference = {
        id: '1',
        source_study_id: 'source-1',
        target_study_id: 'target-1',
        link_type: 'internal',
        is_bidirectional: true,
        created_at: '2026-01-28T00:00:00Z',
        target_title: 'Proverbs 21',
        target_book_name: 'Cartas Paulinas',
        target_chapter_number: 21,
        target_tags: [],
      };

      const color = getReferenceTypeColor(ref);
      expect(color).toContain('bg-green-50');
      expect(color).toContain('border-green-200');
    });

    test('deve retornar cor vermelha para referências reversas (fui referenciado)', () => {
      const ref: Reference = {
        id: '2',
        source_study_id: 'target-1',
        target_study_id: 'source-1',
        link_type: 'internal',
        is_bidirectional: false,  // Criada por trigger
        created_at: '2026-01-28T00:00:00Z',
        target_title: 'Psalms 10',
        target_book_name: 'Poéticos',
        target_chapter_number: 10,
        target_tags: [],
      };

      const color = getReferenceTypeColor(ref);
      expect(color).toContain('bg-red-50');
      expect(color).toContain('border-red-200');
    });

    test('deve retornar cor azul para links externos', () => {
      const ref: Reference = {
        id: '3',
        source_study_id: 'source-1',
        link_type: 'external',
        external_url: 'https://example.com',
        is_bidirectional: false,
        created_at: '2026-01-28T00:00:00Z',
      };

      const color = getReferenceTypeColor(ref);
      expect(color).toContain('bg-blue-50');
      expect(color).toContain('border-blue-200');
    });

    test('deve incluir hover states em todas as cores', () => {
      const refs: Reference[] = [
        {
          id: '1',
          source_study_id: 's',
          target_study_id: 't',
          link_type: 'internal',
          is_bidirectional: true,
          created_at: '2026-01-28T00:00:00Z',
        },
        {
          id: '2',
          source_study_id: 't',
          link_type: 'external',
          external_url: 'https://example.com',
          is_bidirectional: false,
          created_at: '2026-01-28T00:00:00Z',
        },
      ];

      refs.forEach(ref => {
        const color = getReferenceTypeColor(ref);
        expect(color).toContain('hover:bg-');
      });
    });
  });

  describe('getReferenceTypeLabel()', () => {
    test('deve retornar "Referência" para refs internas bidirecionais', () => {
      const ref: Reference = {
        id: '1',
        source_study_id: 's',
        target_study_id: 't',
        link_type: 'internal',
        is_bidirectional: true,
        created_at: '2026-01-28T00:00:00Z',
      };

      expect(getReferenceTypeLabel(ref)).toBe('Referência');
    });

    test('deve retornar "Referenciado por" para refs reversas', () => {
      const ref: Reference = {
        id: '2',
        source_study_id: 't',
        link_type: 'internal',
        is_bidirectional: false,
        created_at: '2026-01-28T00:00:00Z',
      };

      expect(getReferenceTypeLabel(ref)).toBe('Referenciado por');
    });

    test('deve retornar "Link Externo" para links externos', () => {
      const ref: Reference = {
        id: '3',
        source_study_id: 's',
        link_type: 'external',
        external_url: 'https://example.com',
        is_bidirectional: false,
        created_at: '2026-01-28T00:00:00Z',
      };

      expect(getReferenceTypeLabel(ref)).toBe('Link Externo');
    });
  });

  describe('Color Contrast WCAG AA Validation', () => {
    test('cores devem estar documentadas em design-tokens.ts', () => {
      // Este teste garante que as cores estão centralizadas
      const designTokens = require('@/lib/design-tokens');
      expect(designTokens.REFERENCE_TYPE_COLORS).toBeDefined();
      expect(designTokens.REFERENCE_TYPE_COLORS.references).toBeDefined();
      expect(designTokens.REFERENCE_TYPE_COLORS.referenced_by).toBeDefined();
      expect(designTokens.REFERENCE_TYPE_COLORS.external).toBeDefined();
    });

    test('cores devem usar tom 50 (claro) e border tom 200', () => {
      const designTokens = require('@/lib/design-tokens');
      const colors = designTokens.REFERENCE_TYPE_COLORS;

      Object.values(colors).forEach((colorClass: string) => {
        // Verificar que usa tons 50 (bg) e 200 (border)
        expect(colorClass).toMatch(/bg-(green|red|blue)-50/);
        expect(colorClass).toMatch(/border-(green|red|blue)-200/);
      });
    });
  });
});
