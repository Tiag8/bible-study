import { describe, it, expect, beforeEach } from 'vitest';
import { clearDraft, draftKey, readRestorableDraft, writeDraft } from '@/lib/study-draft';

const STUDY = '22222222-2222-4222-8222-222222222222';
const SERVER_AT = '2026-11-17T10:00:00.000Z';
const SERVER_CONTENT = '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"salvo"}]}]}';
const DRAFT_CONTENT = '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"salvo e mais um pouco"}]}]}';

function memoryStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() { return data.size; },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => [...data.keys()][index] ?? null,
    removeItem: (key) => { data.delete(key); },
    setItem: (key, value) => { data.set(key, value); },
  };
}

describe('Rascunho local do estudo', () => {
  let storage: Storage;
  beforeEach(() => {
    storage = memoryStorage();
  });

  it('devolve o rascunho quando a cópia do servidor ainda é a mesma', () => {
    writeDraft(storage, STUDY, { content: DRAFT_CONTENT, baseUpdatedAt: SERVER_AT, savedAt: '2026-11-17T10:05:00.000Z' });
    expect(readRestorableDraft(storage, STUDY, SERVER_AT, SERVER_CONTENT)).toBe(DRAFT_CONTENT);
  });

  it('aceita a mesma data em outro formato (o banco devolve +00:00)', () => {
    writeDraft(storage, STUDY, { content: DRAFT_CONTENT, baseUpdatedAt: SERVER_AT, savedAt: '2026-11-17T10:05:00.000Z' });
    expect(readRestorableDraft(storage, STUDY, '2026-11-17T10:00:00+00:00', SERVER_CONTENT)).toBe(DRAFT_CONTENT);
  });

  it('descarta o rascunho se o servidor mudou depois (outro aparelho ou sincronização)', () => {
    writeDraft(storage, STUDY, { content: DRAFT_CONTENT, baseUpdatedAt: SERVER_AT, savedAt: '2026-11-17T10:05:00.000Z' });
    expect(readRestorableDraft(storage, STUDY, '2026-11-17T11:00:00.000Z', SERVER_CONTENT)).toBeNull();
    expect(storage.getItem(draftKey(STUDY))).toBeNull();
  });

  it('não restaura rascunho igual ao que já está salvo', () => {
    writeDraft(storage, STUDY, { content: SERVER_CONTENT, baseUpdatedAt: SERVER_AT, savedAt: '2026-11-17T10:05:00.000Z' });
    expect(readRestorableDraft(storage, STUDY, SERVER_AT, SERVER_CONTENT)).toBeNull();
  });

  it('ignora e apaga rascunho corrompido', () => {
    storage.setItem(draftKey(STUDY), '{não é json');
    expect(readRestorableDraft(storage, STUDY, SERVER_AT, SERVER_CONTENT)).toBeNull();
    expect(storage.getItem(draftKey(STUDY))).toBeNull();
  });

  it('não mistura rascunhos de estudos diferentes', () => {
    writeDraft(storage, STUDY, { content: DRAFT_CONTENT, baseUpdatedAt: SERVER_AT, savedAt: '2026-11-17T10:05:00.000Z' });
    expect(readRestorableDraft(storage, '33333333-3333-4333-8333-333333333333', SERVER_AT, SERVER_CONTENT)).toBeNull();
  });

  it('clearDraft remove o rascunho; falha de armazenamento não quebra a edição', () => {
    writeDraft(storage, STUDY, { content: DRAFT_CONTENT, baseUpdatedAt: SERVER_AT, savedAt: '2026-11-17T10:05:00.000Z' });
    clearDraft(storage, STUDY);
    expect(storage.getItem(draftKey(STUDY))).toBeNull();

    const full = { ...memoryStorage(), setItem: () => { throw new Error('QuotaExceededError'); } } as Storage;
    expect(() => writeDraft(full, STUDY, { content: DRAFT_CONTENT, baseUpdatedAt: SERVER_AT, savedAt: SERVER_AT })).not.toThrow();
  });
});
