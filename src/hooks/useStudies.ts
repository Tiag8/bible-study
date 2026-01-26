'use client';

import { useState, useEffect, useCallback, useRef, createContext, useContext, createElement, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { Study, StudyInsert, StudyUpdate, TiptapContent } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';

// Tipo para estudo com conteúdo
export interface StudyWithContent extends Study {
  content: TiptapContent;
}

export type StudySummary = Omit<Study, 'content'>;

interface StudiesContextValue {
  studies: StudySummary[];
  loading: boolean;
  error: string | null;
  fetchStudies: () => Promise<void>;
  getStudyByBookAndChapter: (bookName: string, chapter: number) => Promise<StudyWithContent | null>;
  getOrCreateStudy: (bookName: string, chapter: number, title?: string) => Promise<StudyWithContent>;
  saveStudy: (id: string, updates: Partial<StudyUpdate>) => Promise<Study | null>;
  completeStudy: (id: string) => Promise<boolean>;
  deleteStudy: (id: string) => Promise<boolean>;
  getStudiesByBook: (bookName: string) => StudySummary[];
}

const StudiesContext = createContext<StudiesContextValue | undefined>(undefined);

function useStudiesInternal(): StudiesContextValue {
  const { user, loading: authLoading } = useAuth();
  const [studies, setStudies] = useState<StudySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refs para prevenir loops e race conditions
  const isFetchingRef = useRef(false);
  const hasFetchedRef = useRef(false);

  // Buscar todos os estudos
  const fetchStudies = useCallback(async () => {
    // Se auth ainda está carregando e não temos user, aguardar
    if (authLoading && !user?.id) {
      return;
    }

    // Se não tem usuário após auth carregar, parar loading
    if (!user?.id) {
      setLoading(false);
      setStudies([]);
      return;
    }

    // Prevenir múltiplas chamadas simultâneas
    if (isFetchingRef.current) {
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    try {
      isFetchingRef.current = true;
      setLoading(true);
      setError(null);

      const timeoutMs = 10000;
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error('[STUDIES] fetchStudies timeout'));
        }, timeoutMs);
      });

      const queryPromise = supabase
        .from('bible_studies')
        .select('id, user_id, title, book_name, chapter_number, status, tags, created_at, updated_at, completed_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

      if (error) throw error;
      setStudies((data as StudySummary[]) || []);
      hasFetchedRef.current = true;
    } catch (err) {
      console.error('[STUDIES] fetchStudies ERROR:', err);
      setError(err instanceof Error ? err.message : 'Erro ao buscar estudos');
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      isFetchingRef.current = false;
      setLoading(false);
    }
  }, [user?.id, authLoading]);

  // Buscar estudo por livro e capítulo
  const getStudyByBookAndChapter = useCallback(async (bookName: string, chapter: number): Promise<StudyWithContent | null> => {
    if (!user?.id) {
      return null;
    }
    
    try {
      const { data, error } = await supabase
        .from('bible_studies')
        .select('*')
        .eq('user_id', user.id)
        .eq('book_name', bookName)
        .eq('chapter_number', chapter)
        .single();

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
    if (!user?.id) {
      console.error('[STUDIES] getOrCreateStudy ERROR - no user');
      throw new Error('Usuário não autenticado');
    }
    
    // Tenta buscar existente
    const existing = await getStudyByBookAndChapter(bookName, chapter);
    if (existing) {
      return existing;
    }

    // Cria novo
    const newStudy: StudyInsert = {
      user_id: user.id,
      title: title || `${bookName} ${chapter}`,
      book_name: bookName,
      chapter_number: chapter,
      content: { type: 'doc', content: [{ type: 'paragraph' }] },
      status: 'draft',
      tags: [],
    };

    const { data, error } = await supabase
      .from('bible_studies')
      .insert(newStudy)
      .select()
      .single();

    if (error) throw error;
    return data as StudyWithContent;
  }, [user?.id, getStudyByBookAndChapter]);

  // Salvar conteúdo do estudo
  const saveStudy = useCallback(async (
    id: string,
    updates: Partial<StudyUpdate>
  ): Promise<Study | null> => {
    if (!user?.id) {
      return null;
    }

    const timeoutMs = 10000;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    try {
      // PATTERN: Seguir exatamente o padrão de completeStudy() que funciona
      // Apenas UPDATE, sem SELECT (evita hang com RLS + JSONB)
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error('[STUDIES] saveStudy timeout'));
        }, timeoutMs);
      });

      const now = new Date().toISOString();
      const queryPromise = supabase
        .from('bible_studies')
        .update({
          ...updates,
          updated_at: now,
        })
        .eq('id', id)
        .eq('user_id', user.id); // Explícito para RLS

      const { error } = await Promise.race([queryPromise, timeoutPromise]);

      if (error) throw error;

      // Atualizar state local (sem incluir 'content' que é pesado)
      setStudies(prev => prev.map(study => {
        if (study.id === id) {
          // Criar objeto atualizado sem 'content' (StudySummary)
          const { content, ...updateWithoutContent } = updates;
          return {
            ...study,
            ...updateWithoutContent,
            updated_at: now,
          };
        }
        return study;
      }));

      // NÃO fazer SELECT separado (pode travar com JSONB grande)
      // UI já tem o estado atualizado via currentContent
      return null; // Retornar null OK (página não usa retorno)
    } catch (err) {
      console.error('[STUDIES] saveStudy ERROR:', err);
      throw err;
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }, [user?.id]);

  // Marcar como completo
  const completeStudy = useCallback(async (id: string): Promise<boolean> => {
    if (!user?.id) {
      return false;
    }
    
    try {
      const { error } = await supabase
        .from('bible_studies')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      await fetchStudies();
      return true;
    } catch (err) {
      console.error('[STUDIES] completeStudy ERROR:', err);
      return false;
    }
  }, [user?.id, fetchStudies]);

  // Deletar estudo
  const deleteStudy = useCallback(async (id: string): Promise<boolean> => {
    if (!user?.id) {
      return false;
    }
    
    try {
      const { error } = await supabase
        .from('bible_studies')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      setStudies(prev => prev.filter(s => s.id !== id));
      return true;
    } catch (err) {
      console.error('[STUDIES] deleteStudy ERROR:', err);
      return false;
    }
  }, [user?.id]);

  // Buscar estudos por livro
  const getStudiesByBook = useCallback((bookName: string): StudySummary[] => {
    return studies.filter(s => s.book_name === bookName);
  }, [studies]);

  // Reset quando usuário mudar (logout/login com outro usuário)
  useEffect(() => {
    // Reset refs quando usuário mudar
    hasFetchedRef.current = false;
    isFetchingRef.current = false;
  }, [user?.id]);

  // Carregar estudos na montagem - apenas quando auth estiver pronto
  useEffect(() => {
    // Só executa quando auth terminar de carregar
    if (authLoading) {
      return;
    }

    // Se já buscou e tem usuário, não precisa buscar de novo no mount
    if (hasFetchedRef.current && user?.id) {
      return;
    }

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

export function StudiesProvider({ children }: { children: ReactNode }) {
  const value = useStudiesInternal();
  return createElement(StudiesContext.Provider, { value }, children);
}

export function useStudies() {
  const context = useContext(StudiesContext);
  if (!context) {
    throw new Error('useStudies must be used within a StudiesProvider');
  }
  return context;
}
