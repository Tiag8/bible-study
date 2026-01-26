'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { Study, StudyInsert, StudyUpdate, TiptapContent } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';

// Tipo para estudo com conteúdo
export interface StudyWithContent extends Study {
  content: TiptapContent;
}

export function useStudies() {
  const { user, loading: authLoading } = useAuth();
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refs para prevenir loops e race conditions
  const isFetchingRef = useRef(false);
  const hasFetchedRef = useRef(false);

  // Buscar todos os estudos
  const fetchStudies = useCallback(async () => {
    console.log('[STUDIES] fetchStudies START - authLoading:', authLoading, 'userId:', user?.id, 'isFetching:', isFetchingRef.current, 'hasFetched:', hasFetchedRef.current);

    // Se auth ainda está carregando, aguardar (mas não setar loading, deixa true)
    if (authLoading) {
      console.log('[STUDIES] fetchStudies SKIP - authLoading is true');
      return;
    }

    // Se não tem usuário após auth carregar, parar loading
    if (!user?.id) {
      console.log('[STUDIES] fetchStudies STOP - no user after auth loaded');
      setLoading(false);
      setStudies([]);
      console.log('[STUDIES] setLoading FALSE (no user)');
      return;
    }

    // Prevenir múltiplas chamadas simultâneas
    if (isFetchingRef.current) {
      console.log('[STUDIES] fetchStudies SKIP - already fetching');
      return;
    }

    try {
      isFetchingRef.current = true;
      console.log('[STUDIES] fetchStudies BEGIN - setting loading to true');
      setLoading(true);

      console.log('[STUDIES] fetchStudies QUERY BEFORE - userId:', user.id);
      const { data, error } = await supabase
        .from('bible_studies')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      console.log('[STUDIES] fetchStudies QUERY AFTER - data:', data?.length, 'error:', error);

      if (error) throw error;
      setStudies(data || []);
      hasFetchedRef.current = true;
      console.log('[STUDIES] fetchStudies SUCCESS - studies set:', data?.length);
    } catch (err) {
      console.error('[STUDIES] fetchStudies ERROR:', err);
      setError(err instanceof Error ? err.message : 'Erro ao buscar estudos');
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
      console.log('[STUDIES] setLoading FALSE (finally)');
    }
  }, [user?.id, authLoading]);

  // Buscar estudo por livro e capítulo
  const getStudyByBookAndChapter = useCallback(async (bookName: string, chapter: number): Promise<StudyWithContent | null> => {
    console.log('[STUDIES] getStudyByBookAndChapter - bookName:', bookName, 'chapter:', chapter, 'userId:', user?.id);
    
    if (!user?.id) {
      console.log('[STUDIES] getStudyByBookAndChapter SKIP - no user');
      return null;
    }
    
    try {
      console.log('[STUDIES] getStudyByBookAndChapter QUERY BEFORE');
      const { data, error } = await supabase
        .from('bible_studies')
        .select('*')
        .eq('user_id', user.id)
        .eq('book_name', bookName)
        .eq('chapter_number', chapter)
        .single();

      console.log('[STUDIES] getStudyByBookAndChapter QUERY AFTER - data:', data, 'error:', error);

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data as StudyWithContent | null;
    } catch (err) {
      console.error('[STUDIES] getStudyByBookAndChapter ERROR:', err);
      return null;
    }
  }, [user?.id]);

  // Criar ou obter estudo
  const getOrCreateStudy = useCallback(async (
    bookName: string,
    chapter: number,
    title?: string
  ): Promise<StudyWithContent> => {
    console.log('[STUDIES] getOrCreateStudy - bookName:', bookName, 'chapter:', chapter, 'userId:', user?.id);
    
    if (!user?.id) {
      console.error('[STUDIES] getOrCreateStudy ERROR - no user');
      throw new Error('Usuário não autenticado');
    }
    
    // Tenta buscar existente
    console.log('[STUDIES] getOrCreateStudy - checking existing');
    const existing = await getStudyByBookAndChapter(bookName, chapter);
    if (existing) {
      console.log('[STUDIES] getOrCreateStudy - found existing study:', existing.id);
      return existing;
    }

    // Cria novo
    console.log('[STUDIES] getOrCreateStudy - creating new study');
    const newStudy: StudyInsert = {
      user_id: user.id,
      title: title || `${bookName} ${chapter}`,
      book_name: bookName,
      chapter_number: chapter,
      content: { type: 'doc', content: [{ type: 'paragraph' }] },
      status: 'draft',
      tags: [],
    };

    console.log('[STUDIES] getOrCreateStudy INSERT BEFORE');
    const { data, error } = await supabase
      .from('bible_studies')
      .insert(newStudy)
      .select()
      .single();

    console.log('[STUDIES] getOrCreateStudy INSERT AFTER - data:', data, 'error:', error);

    if (error) throw error;
    return data as StudyWithContent;
  }, [user?.id, getStudyByBookAndChapter]);

  // Salvar conteúdo do estudo
  const saveStudy = useCallback(async (
    id: string,
    updates: Partial<StudyUpdate>
  ): Promise<Study | null> => {
    const VERSION_TAG = '2025-01-25-001';
    console.log(`[STUDIES v${VERSION_TAG}] saveStudy - id:`, id, 'updates:', updates, 'userId:', user?.id);

    if (!user?.id) {
      console.log('[STUDIES] saveStudy SKIP - no user');
      return null;
    }

    try {
      console.log('[STUDIES] saveStudy UPDATE BEFORE');
      // PATTERN: Seguir exatamente o padrão de completeStudy() que funciona
      // Apenas UPDATE, sem SELECT (evita hang com RLS + JSONB)
      const { error } = await supabase
        .from('bible_studies')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id); // Explícito para RLS

      console.log('[STUDIES] saveStudy UPDATE AFTER - error:', error);

      if (error) throw error;

      // NÃO fazer SELECT separado (pode travar com JSONB grande)
      // UI já tem o estado atualizado via currentContent
      console.log('[STUDIES] saveStudy SUCCESS - no SELECT needed');
      return null; // Retornar null OK (página não usa retorno)
    } catch (err) {
      console.error('[STUDIES] saveStudy ERROR:', err);
      throw err;
    }
  }, [user?.id]);

  // Marcar como completo
  const completeStudy = useCallback(async (id: string): Promise<boolean> => {
    console.log('[STUDIES] completeStudy - id:', id, 'userId:', user?.id);
    
    if (!user?.id) {
      console.log('[STUDIES] completeStudy SKIP - no user');
      return false;
    }
    
    try {
      console.log('[STUDIES] completeStudy UPDATE BEFORE');
      const { error } = await supabase
        .from('bible_studies')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      console.log('[STUDIES] completeStudy UPDATE AFTER - error:', error);

      if (error) throw error;
      
      console.log('[STUDIES] completeStudy - refreshing studies');
      await fetchStudies();
      console.log('[STUDIES] completeStudy SUCCESS');
      return true;
    } catch (err) {
      console.error('[STUDIES] completeStudy ERROR:', err);
      return false;
    }
  }, [user?.id, fetchStudies]);

  // Deletar estudo
  const deleteStudy = useCallback(async (id: string): Promise<boolean> => {
    console.log('[STUDIES] deleteStudy - id:', id, 'userId:', user?.id);
    
    if (!user?.id) {
      console.log('[STUDIES] deleteStudy SKIP - no user');
      return false;
    }
    
    try {
      console.log('[STUDIES] deleteStudy DELETE BEFORE');
      const { error } = await supabase
        .from('bible_studies')
        .delete()
        .eq('id', id);

      console.log('[STUDIES] deleteStudy DELETE AFTER - error:', error);

      if (error) throw error;
      setStudies(prev => prev.filter(s => s.id !== id));
      console.log('[STUDIES] deleteStudy SUCCESS');
      return true;
    } catch (err) {
      console.error('[STUDIES] deleteStudy ERROR:', err);
      return false;
    }
  }, [user?.id]);

  // Buscar estudos por livro
  const getStudiesByBook = useCallback((bookName: string): Study[] => {
    console.log('[STUDIES] getStudiesByBook - bookName:', bookName, 'totalStudies:', studies.length);
    const filtered = studies.filter(s => s.book_name === bookName);
    console.log('[STUDIES] getStudiesByBook - found:', filtered.length);
    return filtered;
  }, [studies]);

  // Reset quando usuário mudar (logout/login com outro usuário)
  useEffect(() => {
    console.log('[STUDIES] useEffect USER CHANGE - userId:', user?.id);
    // Reset refs quando usuário mudar
    hasFetchedRef.current = false;
    isFetchingRef.current = false;
  }, [user?.id]);

  // Carregar estudos na montagem - apenas quando auth estiver pronto
  useEffect(() => {
    console.log('[STUDIES] useEffect TRIGGERED - authLoading:', authLoading, 'userId:', user?.id, 'hasFetched:', hasFetchedRef.current);

    // Só executa quando auth terminar de carregar
    if (authLoading) {
      console.log('[STUDIES] useEffect SKIP - waiting for auth');
      return;
    }

    // Se já buscou e tem usuário, não precisa buscar de novo no mount
    if (hasFetchedRef.current && user?.id) {
      console.log('[STUDIES] useEffect SKIP - already fetched');
      return;
    }

    console.log('[STUDIES] useEffect CALLING fetchStudies');
    fetchStudies();
  }, [authLoading, user?.id, fetchStudies]);

  return {
    studies,
    loading,
    error,
    fetchStudies,
    getStudyByBookAndChapter,
    getOrCreateStudy,
    saveStudy,
    completeStudy,
    deleteStudy,
    getStudiesByBook,
  };
}
