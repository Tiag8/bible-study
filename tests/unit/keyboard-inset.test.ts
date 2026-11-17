import { describe, it, expect } from 'vitest';
import { keyboardInset } from '@/lib/keyboard-inset';

describe('keyboardInset', () => {
  it('é zero sem teclado (área visível igual à do layout)', () => {
    expect(keyboardInset(844, 844, 0)).toBe(0);
  });

  it('é a altura do teclado quando só a área visível encolhe (iOS)', () => {
    expect(keyboardInset(844, 508, 0)).toBe(336);
  });

  it('desconta o deslocamento da área visível quando a página rola sob o teclado', () => {
    // iOS empurra a área visível para baixo para mostrar o cursor: a barra sobe menos.
    expect(keyboardInset(844, 508, 120)).toBe(216);
  });

  it('é zero quando o navegador já redimensiona o layout (Android com resizes-content)', () => {
    expect(keyboardInset(508, 508, 0)).toBe(0);
  });

  it('ignora ruído de subpixel e valores negativos do efeito elástico', () => {
    expect(keyboardInset(844, 843.6, 0)).toBe(0);
    expect(keyboardInset(844, 844, 30)).toBe(0);
  });
});
