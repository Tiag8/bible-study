/**
 * Testes unitários para emoji-data.ts
 * Valida lógica de busca e filtragem de emojis
 */

import { describe, it, expect } from 'vitest';
import { searchEmojis, EMOJIS } from './emoji-data';

describe('emoji-data.searchEmojis()', () => {
  it('retorna emojis quando query é vazia', () => {
    const result = searchEmojis('');
    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThanOrEqual(15); // Limita a 15 quando vazio
  });

  it('retorna array de emojis', () => {
    const result = searchEmojis('');
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toHaveProperty('emoji');
    expect(result[0]).toHaveProperty('shortname');
    expect(result[0]).toHaveProperty('keywords');
  });

  it('busca por shortname "grinning" retorna emoji', () => {
    const result = searchEmojis('grinning');
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].shortname).toContain('grinning');
  });

  it('busca por keyword "love" retorna múltiplos emojis', () => {
    const result = searchEmojis('love');
    expect(result.length).toBeGreaterThan(1);
    // Todos devem conter "love" no shortname ou keywords
    result.forEach((emoji) => {
      const hasLove =
        emoji.shortname.includes('love') ||
        emoji.keywords.some((kw) => kw.includes('love'));
      expect(hasLove).toBe(true);
    });
  });

  it('busca por "fire" retorna emoji de fogo', () => {
    const result = searchEmojis('fire');
    expect(result.length).toBeGreaterThan(0);
    const hasFireEmoji = result.some((emoji) => emoji.emoji === '🔥');
    expect(hasFireEmoji).toBe(true);
  });

  it('busca por "heart" retorna múltiplos emojis de coração', () => {
    const result = searchEmojis('heart');
    expect(result.length).toBeGreaterThan(0);
    // Deve incluir ❤️
    const hasRedHeart = result.some((emoji) => emoji.emoji === '❤️');
    expect(hasRedHeart).toBe(true);
  });

  it('busca é case-insensitive', () => {
    const resultLower = searchEmojis('happy');
    const resultUpper = searchEmojis('HAPPY');
    const resultMixed = searchEmojis('HaPpY');

    expect(resultLower.length).toBe(resultUpper.length);
    expect(resultLower.length).toBe(resultMixed.length);
  });

  it('busca com espaços é trimmed', () => {
    const resultWithSpaces = searchEmojis('  love  ');
    const resultNoSpaces = searchEmojis('love');

    expect(resultWithSpaces.length).toBe(resultNoSpaces.length);
  });

  it('busca por termo inexistente retorna array vazio', () => {
    const result = searchEmojis('xyzabc_not_exists');
    expect(result).toEqual([]);
  });

  it('busca por "smile" retorna múltiplos emojis smiley', () => {
    const result = searchEmojis('smile');
    expect(result.length).toBeGreaterThan(0);
    // Deve haver múltiplos smileys
    const uniqueEmojis = new Set(result.map((e) => e.emoji));
    expect(uniqueEmojis.size).toBeGreaterThan(1);
  });

  it('limita resultados a 12 emojis máximo', () => {
    const result = searchEmojis('a'); // Busca genérica que daria muitos hits
    expect(result.length).toBeLessThanOrEqual(12);
  });

  it('prioriza shortname matches sobre keyword matches', () => {
    const result = searchEmojis('smile');
    // Emojis com "smile" no shortname devem vir antes
    if (result.length > 1) {
      const firstIsShortname = result[0].shortname.includes('smile');
      expect(firstIsShortname).toBe(true);
    }
  });

  it('busca por "music" retorna emojis musicais', () => {
    const result = searchEmojis('music');
    expect(result.length).toBeGreaterThan(0);
    // Deve incluir 🎵 ou 🎶
    const hasMusicalEmoji = result.some(
      (emoji) => emoji.emoji === '🎵' || emoji.emoji === '🎶'
    );
    expect(hasMusicalEmoji).toBe(true);
  });

  it('busca por "star" retorna emojis de estrela', () => {
    const result = searchEmojis('star');
    expect(result.length).toBeGreaterThan(0);
    // Deve incluir ⭐
    const hasStarEmoji = result.some((emoji) => emoji.emoji === '⭐');
    expect(hasStarEmoji).toBe(true);
  });

  it('todos os emojis retornados têm propriedades válidas', () => {
    const result = searchEmojis('happy');
    result.forEach((emoji) => {
      expect(emoji.emoji).toBeDefined();
      expect(emoji.emoji.length).toBeGreaterThan(0);
      expect(emoji.shortname).toBeDefined();
      expect(emoji.shortname.length).toBeGreaterThan(0);
      expect(Array.isArray(emoji.keywords)).toBe(true);
      expect(emoji.keywords.length).toBeGreaterThan(0);
    });
  });
});

describe('EMOJIS constant', () => {
  it('tem emojis definidos', () => {
    expect(EMOJIS.length).toBeGreaterThan(100);
  });

  it('todos os emojis têm propriedades obrigatórias', () => {
    EMOJIS.forEach((emoji) => {
      expect(emoji.emoji).toBeDefined();
      expect(emoji.shortname).toBeDefined();
      expect(emoji.keywords).toBeDefined();
      expect(Array.isArray(emoji.keywords)).toBe(true);
    });
  });

  it('não contém strings vazias', () => {
    EMOJIS.forEach((emoji) => {
      expect(emoji.emoji.trim().length).toBeGreaterThan(0);
      expect(emoji.shortname.trim().length).toBeGreaterThan(0);
      emoji.keywords.forEach((kw) => {
        expect(kw.trim().length).toBeGreaterThan(0);
      });
    });
  });

  it('não contém duplicatas de shortname', () => {
    const shortnamesMap = new Map<string, number>();
    EMOJIS.forEach((emoji) => {
      const count = shortnamesMap.get(emoji.shortname) || 0;
      shortnamesMap.set(emoji.shortname, count + 1);
    });

    // Verificar se há duplicatas
    const duplicates = Array.from(shortnamesMap.entries())
      .filter(([, count]) => count > 1)
      .map(([shortname]) => shortname);

    expect(duplicates.length).toBe(0); // Não deve haver duplicatas
  });
});
