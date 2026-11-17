'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export interface SearchResult {
  id: string;
  title: string;
  book_name: string;
  chapter_number: number;
  status: string;
  /** Trecho do conteúdo em volta do termo encontrado (null se o estudo não tem texto). */
  excerpt: string | null;
}

export const MIN_SEARCH_LENGTH = 2;
const DEBOUNCE_MS = 300;

/**
 * Busca no título, livro e conteúdo dos estudos do usuário logado (sem acento,
 * sem diferença de maiúsculas). Espera o usuário parar de digitar e ignora
 * respostas de buscas anteriores. Estudos na lixeira não aparecem.
 */
export function useSearch(query: string) {
  const { user } = useAuth();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const term = query.trim();
  const active = term.length >= MIN_SEARCH_LENGTH;
  const userId = user?.id ?? null;

  useEffect(() => {
    if (!userId || !active) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(async () => {
      const { data, error: rpcError } = await supabase.rpc('bible_search_studies', { p_query: term });
      if (cancelled) return;
      if (rpcError) {
        console.error('[SEARCH] bible_search_studies ERROR:', rpcError);
        setError('Não foi possível buscar agora. Tente novamente.');
        setResults([]);
      } else {
        setError(null);
        setResults((data as SearchResult[]) || []);
      }
      setLoading(false);
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [term, active, userId]);

  return { results, loading, error, active };
}
