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
  target_study_id?: string | null;
  target_title?: string;
  target_book_name?: string;
  target_chapter_number?: number;
  target_tags?: TagWithColor[];
  created_at: string;
  position?: number;

  // Story 4.3.1-4.3.4 fields
  link_type: 'internal' | 'external';
  external_url?: string | null;
  is_bidirectional?: boolean;
  display_order?: number;
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
          link_type,
          external_url,
          is_bidirectional,
          display_order,
          position: target_study_id
        `)
        .eq('source_study_id', studyId)
        .eq('user_id', user.id)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (err) throw err;

      // Fetch target study details para cada referência (apenas internos)
      if (data && data.length > 0) {
        // Filtrar apenas referências internas com target_study_id
        const internalRefs = data.filter((ref) => ref.link_type === 'internal' && ref.target_study_id);
        const targetIds = internalRefs.map((ref) => ref.target_study_id);

        // Query 1: Buscar estudos com seus nomes de tags (apenas se houver)
        let targets = [];
        if (targetIds.length > 0) {
          const { data: targetsData, error: targetErr } = await supabase
            .from('bible_studies')
            .select('id, title, book_name, chapter_number, tags')
            .in('id', targetIds)
            .eq('user_id', user.id);

          if (targetErr) throw targetErr;
          targets = targetsData || [];
        }

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
          // Para links externos, não buscar dados de target
          if (ref.link_type === 'external') {
            return {
              ...ref,
              link_type: 'external' as const,
              target_study_id: null,
              target_title: undefined,
              target_book_name: undefined,
              target_chapter_number: undefined,
              target_tags: undefined,
            };
          }

          // Para links internos, enriquecer com dados do target
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
            link_type: 'internal' as const,
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
            link_type: 'internal',  // Story 4.3.1
            is_bidirectional: true,  // Story 4.3.1 - Trigger criará reversa
            display_order: references.length,  // Story 4.3.4
          });

        if (err) throw err;

        // Refetch para atualizar lista (aguarda trigger criar reversa)
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

        // Story 4.3.1: Usar RPC delete_bidirectional_link para delete atomicamente ambas refs
        const { error: err } = await supabase.rpc('delete_bidirectional_link', {
          link_id: referenceId,
        });

        if (err) throw err;

        // Atualizar local state primeiro (otimistic update)
        setReferences((prev) => prev.filter((ref) => ref.id !== referenceId));

        // Chamar callback para remover link do editor (apenas para internos)
        if (onRemoveLink && refToDelete.link_type === 'internal' && refToDelete.target_study_id) {
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

  // Story 4.3.2: Adicionar link externo (URL)
  const addExternalLink = useCallback(
    async (url: string, title?: string) => {
      if (!user?.id || !studyId) {
        const msg = 'User ou Study ID não disponível';
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
            target_study_id: null,  // Links externos não têm target
            link_type: 'external',  // Story 4.3.2
            external_url: url,      // Story 4.3.2
            is_bidirectional: false,  // Links externos não criam reversos
            display_order: references.length,  // Story 4.3.4
          });

        if (err) throw err;

        // Refetch para atualizar lista
        await fetchReferences();
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro ao adicionar link externo';
        console.error('[useReferences] addExternalLink error:', msg);
        setError(msg);
        return false;
      }
    },
    [studyId, user?.id, references.length, fetchReferences]
  );

  // Story 4.3.4: Reordenar (salvar posição via swap_display_order RPC)
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

        // Otimistic update
        setReferences(newReferences);

        // Story 4.3.4: Usar RPC swap_display_order para swap atomicamente
        const neighborRef = references[newIndex];
        const { error: err } = await supabase.rpc('swap_display_order', {
          ref_id_1: referenceId,
          ref_id_2: neighborRef.id,
        });

        if (err) {
          // Revert se RPC falhar
          setReferences(references);
          throw err;
        }

        // Refetch para garantir sincronização com DB
        await fetchReferences();
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro ao reordenar referência';
        console.error('[useReferences] reorderReference error:', msg);
        setError(msg);
        return false;
      }
    },
    [references, fetchReferences]
  );

  return {
    references,
    loading,
    error,
    addReference,
    addExternalLink,  // Story 4.3.2
    deleteReference,
    reorderReference,
    refetch: fetchReferences,
  };
}
