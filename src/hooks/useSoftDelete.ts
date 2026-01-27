import { useCallback, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export interface DeletedStudy {
  id: string;
  title: string;
  book_name: string;
  chapter_number: number;
  deleted_at: string;
}

export function useSoftDelete() {
  const { user, loading: authLoading } = useAuth();
  const [deletedStudies, setDeletedStudies] = useState<DeletedStudy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Soft delete a study
  const softDelete = useCallback(
    async (studyId: string) => {
      if (authLoading || !user?.id) return false;

      try {
        setLoading(true);
        setError(null);

        const { data, error: rpcError } = await supabase.rpc(
          'bible_soft_delete_study',
          {
            p_study_id: studyId,
            p_user_id: user.id,
          }
        );

        if (rpcError) {
          console.error('Soft delete error:', rpcError);
          setError(rpcError.message);
          return false;
        }

        return data === true;
      } catch (err) {
        console.error('Soft delete error:', err);
        setError(err instanceof Error ? err.message : 'Soft delete failed');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [user?.id, authLoading]
  );

  // Restore a deleted study
  const restore = useCallback(
    async (studyId: string) => {
      if (authLoading || !user?.id) return false;

      try {
        setLoading(true);
        setError(null);

        const { data, error: rpcError } = await supabase.rpc(
          'bible_restore_study',
          {
            p_study_id: studyId,
            p_user_id: user.id,
          }
        );

        if (rpcError) {
          console.error('Restore error:', rpcError);
          setError(rpcError.message);
          return false;
        }

        return data === true;
      } catch (err) {
        console.error('Restore error:', err);
        setError(err instanceof Error ? err.message : 'Restore failed');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [user?.id, authLoading]
  );

  // Fetch deleted studies
  const fetchDeletedStudies = useCallback(async () => {
    if (authLoading || !user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: rpcError } = await supabase.rpc(
        'bible_get_deleted_studies',
        {
          p_user_id: user.id,
        }
      );

      if (rpcError) {
        console.error('Fetch deleted studies error:', rpcError);
        setError(rpcError.message);
        setDeletedStudies([]);
        return;
      }

      setDeletedStudies(data || []);
    } catch (err) {
      console.error('Fetch deleted studies error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch deleted studies');
      setDeletedStudies([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, authLoading]);

  return {
    softDelete,
    restore,
    fetchDeletedStudies,
    deletedStudies,
    loading,
    error,
  };
}
