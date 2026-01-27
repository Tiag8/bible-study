import { useCallback, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export interface SearchResult {
  id: string;
  title: string;
  book_id: string;
  chapter_number: number;
  status: string;
  similarity: number;
}

export function useSearch() {
  const { user, loading: authLoading } = useAuth();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(
    async (query: string) => {
      // Guard: auth loading
      if (authLoading) return;

      // Guard: no user
      if (!user?.id) {
        setResults([]);
        setLoading(false);
        return;
      }

      // Guard: empty query
      if (!query.trim()) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Call RPC function with user_id for security
        const { data, error: rpcError } = await supabase.rpc(
          'bible_search_studies',
          {
            query_text: query.trim(),
            p_user_id: user.id,
          }
        );

        if (rpcError) {
          console.error('Search RPC error:', rpcError);
          setError(rpcError.message);
          setResults([]);
          return;
        }

        setResults(data || []);
      } catch (err) {
        console.error('Search error:', err);
        setError(err instanceof Error ? err.message : 'Search failed');
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [user?.id, authLoading]
  );

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    search,
    results,
    loading,
    error,
    clearResults,
  };
}
