'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Tag, TagInsert } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';

export function useTags() {
  const { user, loading: authLoading } = useAuth();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar todas as tags
  const fetchTags = useCallback(async () => {
    // Se auth ainda está carregando e não temos user, aguardar
    if (authLoading && !user?.id) return;

    // Se não tem usuário após auth carregar, parar loading
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bible_tags')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (error) throw error;
      setTags(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar tags');
    } finally {
      setLoading(false);
    }
  }, [user?.id, authLoading]);

  // Criar nova tag
  const createTag = useCallback(async (
    name: string,
    type: 'Versículos' | 'Temas' | 'Princípios' = 'Temas',
    color: string = 'blue'
  ): Promise<Tag | null> => {
    if (!user?.id) return null;
    
    try {
      const newTag: TagInsert = {
        user_id: user.id,
        name,
        type,
        color,
      };

      const { data, error } = await supabase
        .from('bible_tags')
        .insert(newTag)
        .select()
        .single();

      if (error) throw error;
      setTags(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      return data;
    } catch (err) {
      console.error('Erro ao criar tag:', err);
      return null;
    }
  }, [user?.id]);

  // Deletar tag
  const deleteTag = useCallback(async (id: string): Promise<boolean> => {
    if (!user?.id) return false;
    
    try {
      const { error } = await supabase
        .from('bible_tags')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTags(prev => prev.filter(t => t.id !== id));
      return true;
    } catch (err) {
      console.error('Erro ao deletar tag:', err);
      return false;
    }
  }, [user?.id]);

  // Buscar tag por nome
  const getTagByName = useCallback((name: string): Tag | undefined => {
    return tags.find(t => t.name.toLowerCase() === name.toLowerCase());
  }, [tags]);

  // Filtrar por tipo
  const getTagsByType = useCallback((type: 'Versículos' | 'Temas' | 'Princípios'): Tag[] => {
    return tags.filter(t => t.type === type);
  }, [tags]);

  // Carregar na montagem
  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  return {
    tags,
    loading,
    error,
    fetchTags,
    createTag,
    deleteTag,
    getTagByName,
    getTagsByType,
  };
}
