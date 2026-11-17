import { describe, it, expect } from 'vitest';
import { getReferenceKind } from '@/lib/reference-utils';
import { REFERENCE_ACCENTS } from '@/lib/theme-colors';

describe('getReferenceKind', () => {
  it('link externo vira "Link externo"', () => {
    const kind = getReferenceKind({ link_type: 'external', is_bidirectional: true });
    expect(kind).toBe('external');
    expect(REFERENCE_ACCENTS[kind].label).toBe('Link externo');
  });

  it('referência interna criada pelo gatilho (is_bidirectional=false) vira "Citado por"', () => {
    const kind = getReferenceKind({ link_type: 'internal', is_bidirectional: false });
    expect(kind).toBe('referenced_by');
    expect(REFERENCE_ACCENTS[kind].label).toBe('Citado por');
  });

  it('referência interna criada pelo usuário vira "Referência"', () => {
    expect(getReferenceKind({ link_type: 'internal', is_bidirectional: true })).toBe('references');
  });

  it('qualquer outro caso cai em "Referência"', () => {
    expect(getReferenceKind({ link_type: 'internal', is_bidirectional: null as unknown as boolean })).toBe('references');
  });
});
