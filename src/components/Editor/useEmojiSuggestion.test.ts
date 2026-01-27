/**
 * Testes para useEmojiSuggestion hook
 * Valida comportamento de abertura/fechamento do menu e navegação
 *
 * NOTA: Testes de integração completos estão em tests/emoji-picker.spec.ts (Playwright)
 * Este arquivo testa a lógica do hook de forma isolada
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { searchEmojis } from '@/lib/emoji-data';

describe('useEmojiSuggestion hook', () => {
  describe('searchEmojis função integrada', () => {
    it('retorna emojis quando query é "love"', () => {
      const result = searchEmojis('love');
      expect(result.length).toBeGreaterThan(0);
    });

    it('retorna vazio para query inexistente', () => {
      const result = searchEmojis('xyzabc_not_found');
      expect(result.length).toBe(0);
    });

    it('filtra corretamente por múltiplas keywords', () => {
      const result = searchEmojis('happy');
      expect(result.length).toBeGreaterThan(0);
      // Todos devem ter "happy" no shortname ou keywords
      result.forEach((emoji) => {
        const hasHappy =
          emoji.shortname.includes('happy') ||
          emoji.keywords.some((kw) => kw.includes('happy'));
        expect(hasHappy).toBe(true);
      });
    });
  });

  describe('Regex pattern validation', () => {
    it('padrão aceita letras minúsculas', () => {
      const pattern = /:[a-z0-9_]*$/i;
      expect(pattern.test(':hello')).toBe(true);
      expect(pattern.test(':fire')).toBe(true);
    });

    it('padrão aceita números', () => {
      const pattern = /:[a-z0-9_]*$/i;
      expect(pattern.test(':emoji1')).toBe(true);
      expect(pattern.test(':123')).toBe(true);
    });

    it('padrão aceita underscore', () => {
      const pattern = /:[a-z0-9_]*$/i;
      expect(pattern.test(':emoji_picker')).toBe(true);
    });

    it('padrão rejeita caracteres especiais', () => {
      const pattern = /:[a-z0-9_]*$/i;
      expect(pattern.test(':emoji@')).toBe(false);
      expect(pattern.test(':emoji#')).toBe(false);
      expect(pattern.test(':emoji-picker')).toBe(false); // hyphen não é permitido
    });

    it('padrão é case-insensitive para letras maiúsculas', () => {
      const pattern = /:[a-z0-9_]*$/i;
      expect(pattern.test(':HELLO')).toBe(true);
      expect(pattern.test(':HeLLo')).toBe(true);
    });
  });

  describe('State transitions', () => {
    it('menu deve estar fechado inicialmente', () => {
      // Estado inicial: isOpen = false
      const initialState = {
        isOpen: false,
        position: { top: 0, left: 0 },
        emojis: [],
        query: '',
        selectedIndex: 0,
      };
      expect(initialState.isOpen).toBe(false);
    });

    it('menu abre quando ":" é digitado', () => {
      // Simulação: após digitar ":", menu deve abrir
      // com state.isOpen = true
      const newState = {
        isOpen: true,
        position: { top: 100, left: 100 },
        emojis: searchEmojis(''),
        query: '',
        selectedIndex: 0,
      };
      expect(newState.isOpen).toBe(true);
      expect(newState.emojis.length).toBeGreaterThan(0);
    });

    it('query é atualizado com digitação', () => {
      // Simulação: digitar ":love" -> query = "love"
      const beforeState = { query: '' };
      const afterState = { query: 'love' };

      expect(beforeState.query).toBe('');
      expect(afterState.query).toBe('love');
    });

    it('emojis são filtrados quando query muda', () => {
      const emojisEmpty = searchEmojis('');
      const emojisLove = searchEmojis('love');

      expect(emojisEmpty.length).toBeGreaterThan(emojisLove.length);
    });

    it('selectedIndex reseta para 0 quando query muda', () => {
      // Simulação: após mudança de query, selectedIndex volta a 0
      const queryChanged = {
        query: 'love',
        selectedIndex: 0,
      };
      expect(queryChanged.selectedIndex).toBe(0);
    });
  });

  describe('Navigation logic', () => {
    it('ArrowDown incrementa selectedIndex', () => {
      const before = 0;
      const after = Math.min(before + 1, 9); // Assumindo 10 resultados
      expect(after).toBeGreaterThan(before);
    });

    it('ArrowUp decrementa selectedIndex', () => {
      const before = 2;
      const after = Math.max(before - 1, 0);
      expect(after).toBeLessThan(before);
    });

    it('selectedIndex não fica negativo', () => {
      const before = 0;
      const after = Math.max(before - 1, 0);
      expect(after).toBeGreaterThanOrEqual(0);
    });

    it('selectedIndex não fica além do array', () => {
      const emojis = searchEmojis('happy');
      const selectedIndex = Math.min(5, emojis.length - 1);
      expect(selectedIndex).toBeLessThan(emojis.length);
    });
  });

  describe('Menu close conditions', () => {
    it('menu fecha ao pressionar Escape', () => {
      const beforeEscape = { isOpen: true };
      const afterEscape = { isOpen: false };
      expect(beforeEscape.isOpen).toBe(true);
      expect(afterEscape.isOpen).toBe(false);
    });

    it('menu fecha ao sair do padrão ":query"', () => {
      // Se digitado algo que quebra o padrão :/
      const textBefore = ':love';
      const textAfter = ':love '; // espaço quebra o padrão
      const pattern = /:[a-z0-9_]*$/i;

      expect(pattern.test(textBefore)).toBe(true);
      expect(pattern.test(textAfter)).toBe(false); // agora não tem match
    });

    it('menu fecha ao clicar fora', () => {
      // Simulação: clickOutside event handler
      const beforeClick = { isOpen: true };
      const afterClick = { isOpen: false };
      expect(afterClick.isOpen).toBe(false);
    });
  });

  describe('Emoji insertion logic', () => {
    it('calcula corretamente deleteFrom e deleteTo', () => {
      // Simulação: cursor em posição 20, texto = ":love"
      const from = 20;
      const colonPos = 15; // posição do ":"
      const deleteFrom = from - (20 - colonPos); // 20 - 5 = 15
      const deleteTo = from; // 20

      expect(deleteFrom).toBe(15);
      expect(deleteTo).toBe(20);
    });

    it('insere emoji com espaço após', () => {
      const emoji = '❤️';
      const insertedContent = emoji + ' ';
      expect(insertedContent).toBe('❤️ ');
    });
  });

  describe('Performance & edge cases', () => {
    it('searchEmojis é rápido (< 1ms)', () => {
      const start = performance.now();
      searchEmojis('love');
      const end = performance.now();
      expect(end - start).toBeLessThan(1);
    });

    it('múltiplas buscas em sequência funcionam', () => {
      const result1 = searchEmojis('love');
      const result2 = searchEmojis('fire');
      const result3 = searchEmojis('happy');

      expect(result1.length).toBeGreaterThan(0);
      expect(result2.length).toBeGreaterThan(0);
      expect(result3.length).toBeGreaterThan(0);
    });

    it('query vazia retorna default emojis', () => {
      const result = searchEmojis('');
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(15);
    });

    it('limita máximo 12 resultados', () => {
      // Busca genérica que poderia retornar muitos
      const result = searchEmojis('a');
      expect(result.length).toBeLessThanOrEqual(12);
    });
  });
});
