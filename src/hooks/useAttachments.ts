'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import {
  ATTACHMENTS_BUCKET,
  SIGNED_URL_TTL_SECONDS,
  attachmentFolder,
  buildAttachmentPath,
  displayFileName,
  validateAttachment,
  type Attachment,
} from '@/lib/attachments';

/**
 * Remove every file stored with a study. Used when the study itself is deleted.
 * Best effort: a failure is logged and never blocks the caller.
 */
export async function removeStudyAttachments(userId: string, studyId: string): Promise<void> {
  const bucket = supabase.storage.from(ATTACHMENTS_BUCKET);
  const folder = attachmentFolder(userId, studyId);
  const { data: files, error } = await bucket.list(folder, { limit: 1000 });
  if (error) {
    console.error('[ATTACHMENTS] removeStudyAttachments list ERROR:', error.message);
    return;
  }
  if (!files?.length) return;
  const { error: removeError } = await bucket.remove(files.map((file) => `${folder}/${file.name}`));
  if (removeError) {
    console.error('[ATTACHMENTS] removeStudyAttachments remove ERROR:', removeError.message);
  }
}

export function useAttachments(studyId: string | null) {
  const { user } = useAuth();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = user?.id ?? null;

  const fetchAttachments = useCallback(async () => {
    if (!userId || !studyId) {
      setAttachments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const bucket = supabase.storage.from(ATTACHMENTS_BUCKET);
      const folder = attachmentFolder(userId, studyId);

      const { data: files, error: listError } = await bucket.list(folder, {
        limit: 100,
        sortBy: { column: 'created_at', order: 'asc' },
      });
      if (listError) throw listError;

      // Entries without an id are sub-folders, not files.
      const objects = (files ?? []).filter((file) => file.id);
      const urlByPath = new Map<string, string>();
      if (objects.length > 0) {
        const { data: signed, error: signError } = await bucket.createSignedUrls(
          objects.map((file) => `${folder}/${file.name}`),
          SIGNED_URL_TTL_SECONDS
        );
        if (signError) throw signError;
        for (const item of signed ?? []) {
          if (item.path && item.signedUrl) urlByPath.set(item.path, item.signedUrl);
        }
      }

      setAttachments(
        objects.map((file) => {
          const path = `${folder}/${file.name}`;
          return {
            path,
            name: displayFileName(file.name),
            size: Number(file.metadata?.size ?? 0),
            mimeType: String(file.metadata?.mimetype ?? ''),
            createdAt: file.created_at ?? '',
            url: urlByPath.get(path) ?? null,
          };
        })
      );
    } catch (err) {
      console.error('[ATTACHMENTS] fetchAttachments ERROR:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar anexos');
    } finally {
      setLoading(false);
    }
  }, [userId, studyId]);

  useEffect(() => {
    fetchAttachments();
  }, [fetchAttachments]);

  /** Upload files one by one. Returns how many were stored and the messages of those refused. */
  const uploadAttachments = useCallback(
    async (files: File[]): Promise<{ uploaded: number; errors: string[] }> => {
      if (!userId || !studyId) {
        return { uploaded: 0, errors: ['Você precisa estar autenticado para anexar arquivos.'] };
      }

      const errors: string[] = [];
      let uploaded = 0;
      setUploading(true);
      try {
        const bucket = supabase.storage.from(ATTACHMENTS_BUCKET);
        for (const file of files) {
          const invalid = validateAttachment(file);
          if (invalid) {
            errors.push(invalid);
            continue;
          }
          const { error: uploadError } = await bucket.upload(
            buildAttachmentPath(userId, studyId, file.name),
            file,
            { contentType: file.type, upsert: false }
          );
          if (uploadError) {
            console.error('[ATTACHMENTS] upload ERROR:', uploadError.message);
            errors.push(`"${file.name}": não foi possível enviar o arquivo.`);
            continue;
          }
          uploaded += 1;
        }
        if (uploaded > 0) await fetchAttachments();
      } finally {
        setUploading(false);
      }
      return { uploaded, errors };
    },
    [userId, studyId, fetchAttachments]
  );

  const removeAttachment = useCallback(async (attachment: Attachment): Promise<boolean> => {
    const { data, error: removeError } = await supabase.storage
      .from(ATTACHMENTS_BUCKET)
      .remove([attachment.path]);
    // Storage answers with an empty list, not an error, when nothing was removed.
    if (removeError || !data?.length) {
      console.error('[ATTACHMENTS] remove ERROR:', removeError?.message ?? 'nothing removed');
      return false;
    }
    setAttachments((prev) => prev.filter((item) => item.path !== attachment.path));
    return true;
  }, []);

  return {
    attachments,
    loading,
    uploading,
    error,
    uploadAttachments,
    removeAttachment,
    refetch: fetchAttachments,
  };
}
