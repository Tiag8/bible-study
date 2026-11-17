'use client';

import { useCallback, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { removeStudyAttachments } from './useAttachments';

export interface DeletedStudy {
  id: string;
  title: string;
  book_name: string;
  chapter_number: number;
  deleted_at: string;
}

/**
 * Lixeira: lista, restaura e apaga definitivamente os estudos do usuário logado.
 * As RPCs usam auth.uid() no banco; nenhuma recebe o id do usuário.
 * Mover para a lixeira é useStudies().deleteStudy.
 */
export function useSoftDelete() {
  const { user } = useAuth();
  const [deletedStudies, setDeletedStudies] = useState<DeletedStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = user?.id ?? null;

  const fetchDeletedStudies = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const { data, error: rpcError } = await supabase.rpc('bible_get_deleted_studies');
      if (rpcError) throw rpcError;
      setDeletedStudies((data as DeletedStudy[]) || []);
    } catch (err) {
      console.error('[TRASH] fetchDeletedStudies ERROR:', err);
      setError('Não foi possível carregar a lixeira.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const restore = useCallback(async (studyId: string): Promise<boolean> => {
    if (!userId) return false;

    const { data, error: rpcError } = await supabase.rpc('bible_restore_study', { p_study_id: studyId });
    if (rpcError || data !== true) {
      console.error('[TRASH] restore ERROR:', rpcError ?? 'estudo não está na lixeira');
      return false;
    }
    setDeletedStudies((prev) => prev.filter((s) => s.id !== studyId));
    return true;
  }, [userId]);

  // Apaga a linha e, só depois, os anexos do estudo no Storage.
  const purge = useCallback(async (studyId: string): Promise<boolean> => {
    if (!userId) return false;

    const { data, error: rpcError } = await supabase.rpc('bible_purge_study', { p_study_id: studyId });
    if (rpcError || data !== true) {
      console.error('[TRASH] purge ERROR:', rpcError ?? 'estudo não está na lixeira');
      return false;
    }
    await removeStudyAttachments(userId, studyId);
    setDeletedStudies((prev) => prev.filter((s) => s.id !== studyId));
    return true;
  }, [userId]);

  return {
    deletedStudies,
    loading,
    error,
    fetchDeletedStudies,
    restore,
    purge,
  };
}
