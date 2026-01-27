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
  getStudyById: (id: string) => Promise<StudyWithContent | null>;
  getStudyByBookAndChapter: (bookName: string, chapter: number) => Promise<StudyWithContent | null>;
  getStudiesByChapter: (bookName: string, chapter: number) => StudySummary[];
  getOrCreateStudy: (bookName: string, chapter: number, title?: string) => Promise<StudyWithContent>;
  createStudy: (bookName: string, chapter: number, title?: string) => Promise<StudyWithContent>;
  saveStudy: (id: string, updates: Partial<StudyUpdate>) => Promise<Study | null>;
  updateStudyStatus: (id: string, status: 'estudar' | 'estudando' | 'revisando' | 'concluído') => Promise<boolean>;
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

  // Buscar estudo por ID (UUID)
  const getStudyById = useCallback(async (id: string): Promise<StudyWithContent | null> => {
    if (!user?.id) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('bible_studies')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data as StudyWithContent | null;
    } catch (err) {
      console.error('[STUDIES] getStudyById ERROR:', err);
      return null;
    }
  }, [user?.id]);

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
    // ✅ ERROR HANDLING: Verificação de autenticação com mensagem user-friendly
    if (!user?.id) {
      console.error('[STUDIES] getOrCreateStudy ERROR - no user');
      throw new Error('Você precisa estar autenticado para criar estudos');
    }

    try {
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
        status: 'estudando',
        tags: [],
      };

      const { data, error } = await supabase
        .from('bible_studies')
        .insert(newStudy)
        .select()
        .single();

      // ✅ ERROR HANDLING: Mensagem específica para falha de criação
      if (error) {
        console.error('[STUDIES] getOrCreateStudy INSERT ERROR:', error);
        throw new Error(`Erro ao criar estudo: ${error.message}`);
      }

      return data as StudyWithContent;
    } catch (err) {
      // ✅ ERROR HANDLING: Captura qualquer erro não esperado
      if (err instanceof Error) {
        throw err; // Re-throw com mensagem original
      }
      throw new Error('Erro inesperado ao criar estudo');
    }
  }, [user?.id, getStudyByBookAndChapter]);

  // Criar estudo (SEMPRE cria novo, independente de existir)
  const createStudy = useCallback(async (
    bookName: string,
    chapter: number,
    title?: string
  ): Promise<StudyWithContent> => {
    // ✅ ERROR HANDLING: Verificação de autenticação com mensagem user-friendly
    if (!user?.id) {
      console.error('[STUDIES] createStudy ERROR - no user');
      throw new Error('Você precisa estar autenticado para criar estudos');
    }

    try {
      // SEMPRE cria novo, não busca existente
      const newStudy: StudyInsert = {
        user_id: user.id,
        title: title || `${bookName} ${chapter}`,
        book_name: bookName,
        chapter_number: chapter,
        content: { type: 'doc', content: [{ type: 'paragraph' }] },
        status: 'estudando',
        tags: [],
      };

      const { data, error } = await supabase
        .from('bible_studies')
        .insert(newStudy)
        .select()
        .single();

      // ✅ ERROR HANDLING: Mensagem específica para falha de criação
      if (error) {
        console.error('[STUDIES] createStudy INSERT ERROR:', error);
        throw new Error(`Erro ao criar estudo: ${error.message}`);
      }

      await fetchStudies(); // Atualizar lista
      return data as StudyWithContent;
    } catch (err) {
      // ✅ ERROR HANDLING: Captura qualquer erro não esperado
      if (err instanceof Error) {
        throw err; // Re-throw com mensagem original
      }
      throw new Error('Erro inesperado ao criar estudo');
    }
  }, [user?.id, fetchStudies]);

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
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      // ✅ ERROR HANDLING: Log detalhado + mensagem user-friendly
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('[STUDIES] saveStudy ERROR:', { id, error: errorMessage, err });

      // ✅ ERROR HANDLING: Não crashar UI - retornar null gracefully
      // A página deve checar se retorno é null e mostrar toast de erro
      setError(`Erro ao salvar estudo: ${errorMessage}`);
      return null;
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }, [user?.id]);

  // Atualizar status do estudo
  const updateStudyStatus = useCallback(async (
    id: string,
    status: 'estudar' | 'estudando' | 'revisando' | 'concluído'
  ): Promise<boolean> => {
    if (!user?.id) {
      return false;
    }

    try {
      const updateData: Partial<StudyUpdate> = {
        status,
        updated_at: new Date().toISOString(),
      };

      // Se mudando para concluído, setar completed_at
      if (status === 'concluído') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('bible_studies')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchStudies();
      return true;
    } catch (err) {
      console.error('[STUDIES] updateStudyStatus ERROR:', err);
      return false;
    }
  }, [user?.id, fetchStudies]);

  // Marcar como completo (wrapper para updateStudyStatus)
  const completeStudy = useCallback(async (id: string): Promise<boolean> => {
    return updateStudyStatus(id, 'concluído');
  }, [updateStudyStatus]);

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

  // Buscar estudos por capítulo específico (retorna array para múltiplos estudos)
  const getStudiesByChapter = useCallback((bookName: string, chapter: number): StudySummary[] => {
    return studies.filter(s => s.book_name === bookName && s.chapter_number === chapter);
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
    getStudyById,
    getStudyByBookAndChapter,
    getStudiesByChapter,
    getOrCreateStudy,
    createStudy,
    saveStudy,
    updateStudyStatus,
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
