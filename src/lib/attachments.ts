/**
 * Study attachments: files and images stored with each study.
 *
 * Files live in the private Storage bucket `bible-attachments` under
 * `<user_id>/<study_id>/<timestamp>-<file name>`. Keep the limits below in
 * sync with supabase/migrations/20261117_001_add_study_attachments.sql.
 */

export const ATTACHMENTS_BUCKET = 'bible-attachments';
export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
export const SIGNED_URL_TTL_SECONDS = 60 * 60;

export const ALLOWED_ATTACHMENT_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/heic',
  'application/pdf',
  'text/plain',
  'text/markdown',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

/** Value for the `accept` attribute of the file input. */
export const ATTACHMENT_ACCEPT = ALLOWED_ATTACHMENT_TYPES.join(',');

export interface Attachment {
  /** Full object path inside the bucket. */
  path: string;
  /** File name shown to the user (timestamp prefix removed). */
  name: string;
  size: number;
  mimeType: string;
  createdAt: string;
  /** Short-lived URL to open or preview the file. */
  url: string | null;
}

export function attachmentFolder(userId: string, studyId: string): string {
  return `${userId}/${studyId}`;
}

/**
 * Storage keys accept a limited character set, so accents are stripped and
 * anything else becomes a hyphen. The extension is preserved.
 */
export function sanitizeFileName(fileName: string): string {
  const cleaned = fileName
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+|-+$/g, '');
  return cleaned || 'arquivo';
}

export function buildAttachmentPath(
  userId: string,
  studyId: string,
  fileName: string,
  now: number = Date.now()
): string {
  return `${attachmentFolder(userId, studyId)}/${now}-${sanitizeFileName(fileName)}`;
}

/** Remove the `<timestamp>-` prefix added by buildAttachmentPath. */
export function displayFileName(objectName: string): string {
  return objectName.replace(/^\d{13}-/, '');
}

/** Images every browser can render as a thumbnail (HEIC is not one of them). */
export function isPreviewableImage(mimeType: string): boolean {
  return mimeType.startsWith('image/') && mimeType !== 'image/heic';
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
}

/** Returns a user-facing error message, or null when the file can be uploaded. */
export function validateAttachment(file: { name: string; size: number; type: string }): string | null {
  if (!(ALLOWED_ATTACHMENT_TYPES as readonly string[]).includes(file.type)) {
    return `"${file.name}": tipo de arquivo não permitido. Use imagem, PDF, texto ou Word (.docx).`;
  }
  if (file.size > MAX_ATTACHMENT_BYTES) {
    return `"${file.name}": o arquivo passa de ${formatFileSize(MAX_ATTACHMENT_BYTES)}.`;
  }
  if (file.size === 0) {
    return `"${file.name}": o arquivo está vazio.`;
  }
  return null;
}
