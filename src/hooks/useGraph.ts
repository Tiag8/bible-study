'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Study, StudyLink, StudyLinkInsert } from '@/types/database';
import { getBookCategory, bookCategoryColors, type BookCategory } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';

// Tipos para o grafo
export interface GraphNode {
  id: string;
  name: string;
  book: string;
  chapter: number;
  category: BookCategory;
  color: string;
  val: number;
}

export interface GraphLink {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export function useGraph() {
  const { user, loading: authLoading } = useAuth();
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [links, setLinks] = useState<StudyLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar dados do grafo
  const fetchGraphData = useCallback(async () => {
    // Se auth ainda está carregando e não temos user, aguardar
    if (authLoading && !user?.id) return;

    // Se não tem usuário após auth carregar, parar loading
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Buscar estudos e links em paralelo
      const [studiesResult, linksResult] = await Promise.all([
        supabase
          .from('bible_studies')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('bible_study_links')
          .select('*')
          .eq('user_id', user.id),
      ]);

      if (studiesResult.error) throw studiesResult.error;
      if (linksResult.error) throw linksResult.error;

      const studies = studiesResult.data || [];
      const studyLinks = linksResult.data || [];

      // Transformar para formato do grafo
      const nodes: GraphNode[] = studies.map((study: Study) => {
        const category = getBookCategory(study.book_name);
        return {
          id: study.id,
          name: study.title,
          book: study.book_name,
          chapter: study.chapter_number,
          category,
          color: bookCategoryColors[category],
          val: study.status === 'completed' ? 8 : 5,
        };
      });

      const graphLinks: GraphLink[] = studyLinks.map((link: StudyLink) => ({
        source: link.source_study_id,
        target: link.target_study_id,
      }));

      setGraphData({ nodes, links: graphLinks });
      setLinks(studyLinks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar dados do grafo');
    } finally {
      setLoading(false);
    }
  }, [user?.id, authLoading]);

  // Criar link entre estudos
  const createLink = useCallback(async (
    sourceId: string,
    targetId: string
  ): Promise<StudyLink | null> => {
    if (!user?.id) return null;
    
    try {
      // Verificar se já existe
      const existingLink = links.find(
        l => (l.source_study_id === sourceId && l.target_study_id === targetId) ||
             (l.source_study_id === targetId && l.target_study_id === sourceId)
      );
      if (existingLink) {
        console.warn('Link já existe');
        return existingLink;
      }

      const newLink: StudyLinkInsert = {
        user_id: user.id,
        source_study_id: sourceId,
        target_study_id: targetId,
      };

      const { data, error } = await supabase
        .from('bible_study_links')
        .insert(newLink)
        .select()
        .single();

      if (error) throw error;

      // Atualizar dados locais
      setLinks(prev => [...prev, data]);
      setGraphData(prev => ({
        ...prev,
        links: [...prev.links, { source: sourceId, target: targetId }],
      }));

      return data;
    } catch (err) {
      console.error('Erro ao criar link:', err);
      return null;
    }
  }, [user?.id, links]);

  // Remover link
  const deleteLink = useCallback(async (linkId: string): Promise<boolean> => {
    if (!user?.id) return false;
    
    try {
      const { error } = await supabase
        .from('bible_study_links')
        .delete()
        .eq('id', linkId);

      if (error) throw error;

      const deletedLink = links.find(l => l.id === linkId);
      if (deletedLink) {
        setLinks(prev => prev.filter(l => l.id !== linkId));
        setGraphData(prev => ({
          ...prev,
          links: prev.links.filter(
            l => !(l.source === deletedLink.source_study_id && l.target === deletedLink.target_study_id)
          ),
        }));
      }

      return true;
    } catch (err) {
      console.error('Erro ao deletar link:', err);
      return false;
    }
  }, [user?.id, links]);

  // Buscar links de um estudo específico
  const getStudyLinks = useCallback((studyId: string): StudyLink[] => {
    return links.filter(
      l => l.source_study_id === studyId || l.target_study_id === studyId
    );
  }, [links]);

  // Carregar na montagem
  useEffect(() => {
    fetchGraphData();
  }, [fetchGraphData]);

  return {
    graphData,
    links,
    loading,
    error,
    fetchGraphData,
    createLink,
    deleteLink,
    getStudyLinks,
  };
}
