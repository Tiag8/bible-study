'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { BacklogItem, BacklogInsert } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';

export function useBacklog() {
  const { user, loading: authLoading } = useAuth();
  const [backlog, setBacklog] = useState<BacklogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar todo o backlog
  const fetchBacklog = useCallback(async () => {
    console.log('[BACKLOG] fetchBacklog START - authLoading:', authLoading, 'userId:', user?.id);
    
    // Se auth ainda está carregando, aguardar
    if (authLoading) {
      console.log('[BACKLOG] fetchBacklog SKIP - authLoading is true');
      return;
    }

    // Se não tem usuário após auth carregar, parar loading
    if (!user?.id) {
      console.log('[BACKLOG] fetchBacklog STOP - no user after auth loaded');
      setLoading(false);
      console.log('[BACKLOG] setLoading FALSE (no user)');
      return;
    }

    try {
      console.log('[BACKLOG] fetchBacklog BEGIN - setting loading to true');
      setLoading(true);
      
      console.log('[BACKLOG] fetchBacklog QUERY BEFORE - userId:', user.id);
      const { data, error } = await supabase
        .from('bible_backlog')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      console.log('[BACKLOG] fetchBacklog QUERY AFTER - data:', data?.length, 'error:', error);

      if (error) throw error;
      setBacklog(data || []);
      console.log('[BACKLOG] fetchBacklog SUCCESS - backlog set:', data?.length);
    } catch (err) {
      console.error('[BACKLOG] fetchBacklog ERROR:', err);
      setError(err instanceof Error ? err.message : 'Erro ao buscar backlog');
    } finally {
      setLoading(false);
      console.log('[BACKLOG] setLoading FALSE (finally)');
    }
  }, [user?.id, authLoading]);

  // Adicionar item ao backlog
  const addToBacklog = useCallback(async (
    referenceLabel: string,
    sourceStudyId?: string
  ): Promise<BacklogItem | null> => {
    console.log('[BACKLOG] addToBacklog - referenceLabel:', referenceLabel, 'sourceStudyId:', sourceStudyId, 'userId:', user?.id);
    
    if (!user?.id) {
      console.log('[BACKLOG] addToBacklog SKIP - no user');
      return null;
    }
    
    try {
      const newItem: BacklogInsert = {
        user_id: user.id,
        reference_label: referenceLabel,
        source_study_id: sourceStudyId || null,
        status: false,
      };

      console.log('[BACKLOG] addToBacklog INSERT BEFORE');
      const { data, error } = await supabase
        .from('bible_backlog')
        .insert(newItem)
        .select()
        .single();

      console.log('[BACKLOG] addToBacklog INSERT AFTER - data:', data, 'error:', error);

      if (error) throw error;
      setBacklog(prev => [data, ...prev]);
      console.log('[BACKLOG] addToBacklog SUCCESS');
      return data;
    } catch (err) {
      console.error('[BACKLOG] addToBacklog ERROR:', err);
      return null;
    }
  }, [user?.id]);

  // Marcar item como completo/incompleto
  const toggleBacklogStatus = useCallback(async (id: string): Promise<boolean> => {
    console.log('[BACKLOG] toggleBacklogStatus - id:', id, 'userId:', user?.id);
    
    if (!user?.id) {
      console.log('[BACKLOG] toggleBacklogStatus SKIP - no user');
      return false;
    }
    
    try {
      const item = backlog.find(b => b.id === id);
      if (!item) {
        console.log('[BACKLOG] toggleBacklogStatus - item not found in local state');
        return false;
      }

      console.log('[BACKLOG] toggleBacklogStatus UPDATE BEFORE - current status:', item.status, 'new status:', !item.status);
      const { error } = await supabase
        .from('bible_backlog')
        .update({ status: !item.status })
        .eq('id', id);

      console.log('[BACKLOG] toggleBacklogStatus UPDATE AFTER - error:', error);

      if (error) throw error;
      setBacklog(prev => prev.map(b => b.id === id ? { ...b, status: !b.status } : b));
      console.log('[BACKLOG] toggleBacklogStatus SUCCESS');
      return true;
    } catch (err) {
      console.error('[BACKLOG] toggleBacklogStatus ERROR:', err);
      return false;
    }
  }, [user?.id, backlog]);

  // Deletar item do backlog
  const deleteFromBacklog = useCallback(async (id: string): Promise<boolean> => {
    console.log('[BACKLOG] deleteFromBacklog - id:', id, 'userId:', user?.id);
    
    if (!user?.id) {
      console.log('[BACKLOG] deleteFromBacklog SKIP - no user');
      return false;
    }
    
    try {
      console.log('[BACKLOG] deleteFromBacklog DELETE BEFORE');
      const { error } = await supabase
        .from('bible_backlog')
        .delete()
        .eq('id', id);

      console.log('[BACKLOG] deleteFromBacklog DELETE AFTER - error:', error);

      if (error) throw error;
      setBacklog(prev => prev.filter(b => b.id !== id));
      console.log('[BACKLOG] deleteFromBacklog SUCCESS');
      return true;
    } catch (err) {
      console.error('[BACKLOG] deleteFromBacklog ERROR:', err);
      return false;
    }
  }, [user?.id]);

  // Filtrar pendentes
  const getPending = useCallback((): BacklogItem[] => {
    console.log('[BACKLOG] getPending - totalBacklog:', backlog.length);
    const pending = backlog.filter(b => !b.status);
    console.log('[BACKLOG] getPending - found:', pending.length);
    return pending;
  }, [backlog]);

  // Filtrar completos
  const getCompleted = useCallback((): BacklogItem[] => {
    console.log('[BACKLOG] getCompleted - totalBacklog:', backlog.length);
    const completed = backlog.filter(b => b.status);
    console.log('[BACKLOG] getCompleted - found:', completed.length);
    return completed;
  }, [backlog]);

  // Carregar na montagem
  useEffect(() => {
    console.log('[BACKLOG] useEffect - mounting, calling fetchBacklog');
    fetchBacklog();
  }, [fetchBacklog]);

  return {
    backlog,
    loading,
    error,
    fetchBacklog,
    addToBacklog,
    toggleBacklogStatus,
    deleteFromBacklog,
    getPending,
    getCompleted,
  };
}
