/**
 * Local draft of a study being edited. It protects text typed on a phone when
 * the browser discards the tab or the network drops before the save lands.
 *
 * A draft is only restored when the server copy is still the one the draft was
 * based on (`baseUpdatedAt`), so it never overwrites newer saved work.
 */

const PREFIX = 'bible-study:draft:';

export interface StudyDraft {
  content: string;
  /** `updated_at` of the server copy this draft was typed on top of. */
  baseUpdatedAt: string;
  savedAt: string;
}

export function draftKey(studyId: string): string {
  return `${PREFIX}${studyId}`;
}

export function writeDraft(storage: Storage, studyId: string, draft: StudyDraft): void {
  try {
    storage.setItem(draftKey(studyId), JSON.stringify(draft));
  } catch {
    // Quota exceeded or storage disabled: the draft is a safety net, never a blocker.
  }
}

export function clearDraft(storage: Storage, studyId: string): void {
  try {
    storage.removeItem(draftKey(studyId));
  } catch {
    // Nothing to do.
  }
}

/**
 * Returns the draft content to restore, or null. Stale or unreadable drafts
 * are removed.
 */
export function readRestorableDraft(
  storage: Storage,
  studyId: string,
  serverUpdatedAt: string,
  serverContent: string
): string | null {
  let raw: string | null = null;
  try {
    raw = storage.getItem(draftKey(studyId));
  } catch {
    return null;
  }
  if (!raw) return null;

  try {
    const draft = JSON.parse(raw) as Partial<StudyDraft>;
    const sameBase =
      typeof draft.baseUpdatedAt === 'string' &&
      new Date(draft.baseUpdatedAt).getTime() === new Date(serverUpdatedAt).getTime();
    if (sameBase && typeof draft.content === 'string' && draft.content && draft.content !== serverContent) {
      return draft.content;
    }
  } catch {
    // Fall through to cleanup.
  }
  clearDraft(storage, studyId);
  return null;
}
