import { describe, it, expect } from 'vitest';
import { QUOTE_DISPLAY, REFERENCE_ACCENTS, STATUS_ORDER, STATUS_THEME, TAG_ACCENTS, tagAccent } from '@/lib/theme-colors';
import { ALLOWED_QUOTE_COLORS } from '@/lib/editor-constants';

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const PAGE = '#f0eee4';
const INK = '#3C2415';

describe('Cores de significado do tema', () => {
  it('texto e ícone de cada status têm 4,5:1 ou mais sobre o preenchimento', () => {
    for (const status of STATUS_ORDER) {
      const theme = STATUS_THEME[status];
      const surface = theme.fill === 'transparent' ? PAGE : theme.fill;
      expect(contrast(theme.ink, surface), status).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('os estados que dependem da borda ou do preenchimento têm 3:1 contra a página', () => {
    expect(contrast(STATUS_THEME.estudar.border, PAGE)).toBeGreaterThanOrEqual(3);
    expect(contrast(STATUS_THEME.concluído.fill, PAGE)).toBeGreaterThanOrEqual(3);
  });

  it('os quatro status formam uma rampa do claro ao escuro', () => {
    const fills = STATUS_ORDER.map((s) => (STATUS_THEME[s].fill === 'transparent' ? PAGE : STATUS_THEME[s].fill));
    const lum = fills.map(luminance);
    expect(lum[0]).toBeGreaterThan(lum[1]);
    expect(lum[1]).toBeGreaterThan(lum[2]);
    expect(lum[2]).toBeGreaterThan(lum[3]);
  });

  it('todo status tem nome e ícone (a cor não é a única pista)', () => {
    for (const status of STATUS_ORDER) {
      expect(STATUS_THEME[status].label.length).toBeGreaterThan(0);
      expect(STATUS_THEME[status].icon).toBeTruthy();
    }
    expect(new Set(STATUS_ORDER.map((s) => STATUS_THEME[s].icon)).size).toBe(4);
  });

  it('pontos de etiqueta e faixas de referência têm 3:1 contra a página', () => {
    for (const [key, accent] of Object.entries(TAG_ACCENTS)) {
      expect(contrast(accent, PAGE), key).toBeGreaterThanOrEqual(3);
    }
    for (const [key, { accent }] of Object.entries(REFERENCE_ACCENTS)) {
      expect(contrast(accent, PAGE), key).toBeGreaterThanOrEqual(3);
    }
    expect(tagAccent('nao-existe')).toBe(tagAccent(null));
  });

  it('toda cor de citação permitida no editor tem tom de exibição legível', () => {
    for (const stored of ALLOWED_QUOTE_COLORS) {
      const display = QUOTE_DISPLAY[stored];
      expect(display, stored).toBeTruthy();
      expect(contrast(display.border, PAGE), `${stored} borda`).toBeGreaterThanOrEqual(3);
      expect(contrast(INK, display.fill), `${stored} texto`).toBeGreaterThanOrEqual(7);
    }
  });
});
