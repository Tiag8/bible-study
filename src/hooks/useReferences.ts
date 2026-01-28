'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

/**
 * Reference Interface (Legacy)
 *
 * This interface is used internally by useReferences hook.
 * For new code, import from @/types/reference instead.
 *
 * @deprecated Use Reference from @/types/reference
 */
export interface TagWithColor {
  name: string;
  type: 'Versículos' | 'Temas' | 'Princípios';
  color: string;
}

export interface Reference {
  id: string;
  source_study_id: string;
  target_study_id: string;
  target_title: string;
  target_book_name: string;
  target_chapter_number: number;
  target_tags: TagWithColor[];
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

        // Query 1: Buscar estudos com seus nomes de tags
        const { data: targets, error: targetErr } = await supabase
          .from('bible_studies')
          .select('id, title, book_name, chapter_number, tags')
          .in('id', targetIds)
          .eq('user_id', user.id);

        if (targetErr) throw targetErr;

        // Query 2: Buscar todas as tags do usuário com suas cores e types
        const { data: allUserTags, error: tagsErr } = await supabase
          .from('bible_tags')
          .select('name, type, color')
          .eq('user_id', user.id);

        if (tagsErr) throw tagsErr;

        // Criar map de tags por nome para lookup rápido
        const tagsMap = new Map(
          (allUserTags || []).map((tag) => [tag.name, { type: tag.type, color: tag.color }])
        );

        // Merge com dados de target e enriquecer tags com cores
        const targetsMap = new Map(targets?.map((t) => [t.id, t]) || []);
        const enrichedRefs = data.map((ref) => {
          const target = targetsMap.get(ref.target_study_id);
          const tagNames = target?.tags || [];

          // Converter nomes de tags para objetos com color/type
          const tagsWithColor: TagWithColor[] = tagNames
            .map((tagName: string) => {
              const tagInfo = tagsMap.get(tagName);
              return {
                name: tagName,
                type: tagInfo?.type || 'Temas',
                color: tagInfo?.color || '#6b7280', // fallback cinza
              };
            });

          return {
            ...ref,
            target_title: target?.title || 'Desconhecido',
            target_book_name: target?.book_name || '',
            target_chapter_number: target?.chapter_number || 0,
            target_tags: tagsWithColor,
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
      if (!user?.id || !studyId) {
        const msg = 'User ou Study ID não disponível';
        setError(msg);
        return false;
      }

      // Validar: não pode referenciar a si mesmo
      if (targetStudyId === studyId) {
        const msg = 'Um estudo não pode referenciar a si mesmo';
        setError(msg);
        return false;
      }

      // Validar: evitar duplicatas
      if (references.some((ref) => ref.target_study_id === targetStudyId)) {
        const msg = 'Este estudo já está referenciado';
        setError(msg);
        return false;
      }

      try {
        setError(null);
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
    [studyId, user?.id, references, fetchReferences]
  );

  // Deletar referência
  const deleteReference = useCallback(
    async (referenceId: string) => {
      if (!user?.id) {
        const msg = 'User ID não disponível';
        setError(msg);
        return false;
      }

      try {
        setError(null);

        // Encontrar target_study_id antes de deletar
        const refToDelete = references.find((ref) => ref.id === referenceId);
        if (!refToDelete) {
          const msg = 'Referência não encontrada no estado local';
          console.warn('[useReferences]', msg);
          return false;
        }

        const { error: err } = await supabase
          .from('bible_study_links')
          .delete()
          .eq('id', referenceId)
          .eq('user_id', user.id);

        if (err) throw err;

        // Atualizar local state primeiro (otimistic update)
        setReferences((prev) => prev.filter((ref) => ref.id !== referenceId));

        // Chamar callback para remover link do editor
        if (onRemoveLink) {
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

  // Reordenar (salvar posição via drag-and-drop)
  // TODO: Persistir posição no banco de dados
  const reorderReference = useCallback(
    async (referenceId: string, direction: 'up' | 'down') => {
      const currentIndex = references.findIndex((ref) => ref.id === referenceId);
      if (currentIndex === -1) {
        console.warn('[useReferences] Reference not found:', referenceId);
        return false;
      }

      if (direction === 'up' && currentIndex === 0) {
        console.debug('[useReferences] Already at top, cannot move up');
        return false;
      }

      if (direction === 'down' && currentIndex === references.length - 1) {
        console.debug('[useReferences] Already at bottom, cannot move down');
        return false;
      }

      try {
        setError(null);
        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        const newReferences = [...references];
        [newReferences[currentIndex], newReferences[newIndex]] = [
          newReferences[newIndex],
          newReferences[currentIndex],
        ];

        setReferences(newReferences);

        // TODO: Save new order to database
        // await supabase.from('bible_study_links')
        //   .update({ display_order: newIndex })
        //   .eq('id', referenceId);

        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro ao reordenar referência';
        console.error('[useReferences] reorderReference error:', msg);
        setError(msg);
        return false;
      }
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
