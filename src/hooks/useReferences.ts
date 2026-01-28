'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export interface Reference {
  id: string;
  source_study_id: string;
  target_study_id: string;
  target_title: string;
  target_book_name: string;
  target_chapter_number: number;
  created_at: string;
  position?: number;
}

export function useReferences(studyId: string | null, onRemoveLink?: (targetStudyId: string) => void) {
  const { user } = useAuth();
  const [references, setReferences] = useState<Reference[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch referências para um estudo
  const fetchReferences = useCallback(async () => {
    if (!user?.id || !studyId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from('bible_study_links')
        .select(`
          id,
          source_study_id,
          target_study_id,
          created_at,
          position: target_study_id
        `)
        .eq('source_study_id', studyId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (err) throw err;

      // Fetch target study details para cada referência
      if (data && data.length > 0) {
        const targetIds = data.map((ref) => ref.target_study_id);
        const { data: targets, error: targetErr } = await supabase
          .from('bible_studies')
          .select('id, title, book_name, chapter_number')
          .in('id', targetIds)
          .eq('user_id', user.id);

        if (targetErr) throw targetErr;

        // Merge com dados de target
        const targetsMap = new Map(targets?.map((t) => [t.id, t]) || []);
        const enrichedRefs = data.map((ref) => {
          const target = targetsMap.get(ref.target_study_id);
          return {
            ...ref,
            target_title: target?.title || 'Desconhecido',
            target_book_name: target?.book_name || '',
            target_chapter_number: target?.chapter_number || 0,
          };
        });

        setReferences(enrichedRefs);
      } else {
        setReferences([]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar referências';
      console.error('[useReferences] Error:', msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [studyId, user?.id]);

  // Initial fetch
  useEffect(() => {
    fetchReferences();
  }, [fetchReferences]);

  // Adicionar referência
  const addReference = useCallback(
    async (targetStudyId: string) => {
      if (!user?.id || !studyId) return false;

      try {
        const { error: err } = await supabase
          .from('bible_study_links')
          .insert({
            user_id: user.id,
            source_study_id: studyId,
            target_study_id: targetStudyId,
          });

        if (err) throw err;

        // Refetch para atualizar lista
        await fetchReferences();
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro ao adicionar referência';
        console.error('[useReferences] addReference error:', msg);
        setError(msg);
        return false;
      }
    },
    [studyId, user?.id, fetchReferences]
  );

  // Deletar referência
  const deleteReference = useCallback(
    async (referenceId: string) => {
      if (!user?.id) return false;

      try {
        // Encontrar target_study_id antes de deletar
        const refToDelete = references.find((ref) => ref.id === referenceId);

        const { error: err } = await supabase
          .from('bible_study_links')
          .delete()
          .eq('id', referenceId)
          .eq('user_id', user.id);

        if (err) throw err;

        // Atualizar local state
        setReferences((prev) => prev.filter((ref) => ref.id !== referenceId));

        // Chamar callback para remover link do editor
        if (refToDelete && onRemoveLink) {
          onRemoveLink(refToDelete.target_study_id);
        }

        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro ao deletar referência';
        console.error('[useReferences] deleteReference error:', msg);
        setError(msg);
        return false;
      }
    },
    [user?.id, references, onRemoveLink]
  );

  // Reordenar (salvar posição)
  const reorderReference = useCallback(
    async (referenceId: string, direction: 'up' | 'down') => {
      const currentIndex = references.findIndex((ref) => ref.id === referenceId);
      if (currentIndex === -1) return false;

      if (direction === 'up' && currentIndex === 0) return false;
      if (direction === 'down' && currentIndex === references.length - 1) return false;

      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      const newReferences = [...references];
      [newReferences[currentIndex], newReferences[newIndex]] = [
        newReferences[newIndex],
        newReferences[currentIndex],
      ];

      setReferences(newReferences);
      return true;
    },
    [references]
  );

  return {
    references,
    loading,
    error,
    addReference,
    deleteReference,
    reorderReference,
    refetch: fetchReferences,
  };
}
