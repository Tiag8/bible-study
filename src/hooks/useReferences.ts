'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { isValidUUID } from '@/lib/utils';

/**
 * Retry helper with exponential backoff
 * @param fn - Async function to retry
 * @param maxAttempts - Maximum number of attempts (default: 3)
 * @param delayMs - Initial delay in milliseconds (default: 1000)
 * @returns Result of function
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.debug(`[retryWithBackoff] Attempt ${attempt}/${maxAttempts}`);
      return await fn();
    } catch (err) {
      lastError = err as Error;
      console.warn(`[retryWithBackoff] Attempt ${attempt} failed:`, lastError.message);

      if (attempt < maxAttempts) {
        const delay = delayMs * Math.pow(2, attempt - 1);
        console.debug(`[retryWithBackoff] Waiting ${delay}ms before retry...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Max retry attempts reached');
}

// Tipos importados da single source of truth
import type { Reference, TagWithColor } from '@/types/reference';

// Re-export para manter compatibilidade com imports existentes
export type { Reference, TagWithColor };

interface StudyData {
  id: string;
  title: string;
  book_name: string;
  chapter_number: number;
  tags: TagWithColor[] | null;
}

export function useReferences(studyId: string | null, onRemoveLink?: (targetStudyId: string) => void) {
  const { user } = useAuth();
  const [references, setReferences] = useState<Reference[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch referências para um estudo
  const fetchReferences = useCallback(async () => {
    if (!user?.id || !studyId) {
      console.debug('[useReferences] Early return: user?.id=%s, studyId=%s', user?.id, studyId);
      return;
    }

    if (!isValidUUID(studyId)) {
      console.error('[useReferences] ID inválido (não é UUID):', studyId);
      setError('ID de estudo inválido');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.debug('[useReferences] Starting fetch for studyId=%s, userId=%s', studyId, user?.id);

      // Retry with exponential backoff for transient failures
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let data: any[] | null = null;
      try {
        data = await retryWithBackoff(
          async () => {
            const { data: result, error: queryErr } = await supabase
              .from('bible_study_links')
              .select(`
                id,
                source_study_id,
                target_study_id,
                created_at,
                link_type,
                external_url,
                is_bidirectional,
                display_order
              `)
              .eq('source_study_id', studyId)
              .eq('user_id', user.id)
              .order('display_order', { ascending: true })
              .order('created_at', { ascending: true });

            // Throw on Supabase error so retryWithBackoff can catch it
            if (queryErr) {
              const msg = queryErr.message || queryErr.code || JSON.stringify(queryErr);
              throw new Error(`Supabase query error: ${msg}`);
            }
            return result;
          },
          3, // 3 attempts
          1000 // 1s initial delay
        );
      } catch (retryErr) {
        console.error('[useReferences] Retry exhausted:', retryErr);
        throw retryErr;
      }

      console.debug('[useReferences] Query succeeded, rows returned=%d', data?.length || 0);

      // Fetch target study details para cada referência (apenas internos)
      if (data && data.length > 0) {
        // Filtrar apenas referências internas com target_study_id
        const internalRefs = data.filter((ref) => ref.link_type === 'internal' && ref.target_study_id);
        const targetIds = internalRefs.map((ref) => ref.target_study_id);

        // Query 1: Buscar estudos com seus nomes de tags (apenas se houver)
        let targets: StudyData[] = [];
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
          // Para links externos, extrair hostname da URL como título
          if (ref.link_type === 'external') {
            let displayTitle = 'Link Externo';
            if (ref.external_url) {
              try {
                displayTitle = new URL(ref.external_url).hostname.replace('www.', '');
              } catch {
                // URL inválida, manter título genérico
              }
            }

            return {
              ...ref,
              link_type: 'external' as const,
              target_study_id: null,
              target_title: displayTitle,
              target_book_name: ref.external_url || undefined,
              target_chapter_number: undefined,
              target_tags: undefined,
            };
          }

          // Para links internos, enriquecer com dados do target
          const target = targetsMap.get(ref.target_study_id);
          const targetTagNames = target?.tags || [];

          // Tags vêm como string[] do banco, precisa enriquecer com type/color do tagsMap
          const tagsWithColor: TagWithColor[] = Array.isArray(targetTagNames)
            ? targetTagNames
                .map((tagName: string | TagWithColor) => {
                  // Se já é TagWithColor (objeto), usar direto
                  if (typeof tagName === 'object' && tagName !== null) {
                    return tagName as TagWithColor;
                  }
                  // Se é string, buscar no tagsMap
                  const tagInfo = tagsMap.get(tagName as string);
                  return {
                    name: tagName as string,
                    type: tagInfo?.type || 'Temas',
                    color: tagInfo?.color || 'gray',
                  } as TagWithColor;
                })
                .filter((tag): tag is TagWithColor => tag.name !== undefined)
            : [];

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
      const stack = err instanceof Error ? err.stack : 'No stack trace';
      console.error('[useReferences] Error:', {
        message: msg,
        stack: stack,
        studyId: studyId,
        userId: user?.id,
        timestamp: new Date().toISOString(),
      });
      setError(msg);
    } finally {
      setLoading(false);
      console.debug('[useReferences] fetchReferences completed, error=%s', error?.substring(0, 50));
    }
  }, [studyId, user?.id]);

  // Initial fetch
  useEffect(() => {
    fetchReferences();
  }, [fetchReferences]);

  // Adicionar referência
  const addReference = useCallback(
    async (targetStudyId: string) => {
      console.debug('[useReferences.addReference] Called with targetStudyId=%s', targetStudyId);

      if (!user?.id || !studyId) {
        const msg = 'User ou Study ID não disponível';
        console.error('[useReferences.addReference] Missing IDs:', { userId: user?.id, studyId });
        setError(msg);
        return false;
      }

      // Validar: UUID válido
      if (!isValidUUID(targetStudyId)) {
        const msg = 'ID de estudo inválido (deve ser UUID)';
        console.error('[useReferences.addReference] Invalid UUID:', targetStudyId);
        setError(msg);
        return false;
      }

      // Validar: não pode referenciar a si mesmo
      if (targetStudyId === studyId) {
        const msg = 'Um estudo não pode referenciar a si mesmo';
        console.warn('[useReferences.addReference] Self-reference attempted:', targetStudyId);
        setError(msg);
        return false;
      }

      // Validar: evitar duplicatas
      if (references.some((ref) => ref.target_study_id === targetStudyId)) {
        const msg = 'Este estudo já está referenciado';
        console.warn('[useReferences.addReference] Duplicate reference:', targetStudyId);
        setError(msg);
        return false;
      }

      try {
        setError(null);
        console.debug('[useReferences.addReference] Inserting bidirectional reference');
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
    async (url: string, _title?: string) => {
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
