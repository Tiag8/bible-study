// Tipos gerados para o Supabase - Bible Study
// Prefixo: bible_

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Conteúdo do editor Tiptap
export interface TiptapContent {
  type: 'doc';
  content: Array<{
    type: string;
    content?: Array<{ type: string; text?: string; marks?: Array<{ type: string }> }>;
    attrs?: Record<string, unknown>;
  }>;
}

export interface Database {
  public: {
    Tables: {
      bible_studies: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: TiptapContent;
          book_name: string;
          chapter_number: number;
          status: 'estudar' | 'estudando' | 'revisando' | 'concluído';
          tags: string[];
          created_at: string;
          updated_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content?: TiptapContent;
          book_name: string;
          chapter_number: number;
          status?: 'estudar' | 'estudando' | 'revisando' | 'concluído';
          tags?: string[];
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: TiptapContent;
          book_name?: string;
          chapter_number?: number;
          status?: 'estudar' | 'estudando' | 'revisando' | 'concluído';
          tags?: string[];
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
      };
      bible_study_links: {
        Row: {
          id: string;
          user_id: string;
          source_study_id: string;
          target_study_id: string | null;
          link_type: 'internal' | 'external';
          external_url: string | null;
          is_bidirectional: boolean;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          source_study_id: string;
          target_study_id?: string | null;
          link_type?: 'internal' | 'external';
          external_url?: string | null;
          is_bidirectional?: boolean;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          source_study_id?: string;
          target_study_id?: string | null;
          link_type?: 'internal' | 'external';
          external_url?: string | null;
          is_bidirectional?: boolean;
          display_order?: number;
          created_at?: string;
        };
      };
      bible_tags: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: 'Versículos' | 'Temas' | 'Princípios';
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type?: 'Versículos' | 'Temas' | 'Princípios';
          color?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          type?: 'Versículos' | 'Temas' | 'Princípios';
          color?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      bible_graph_data: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          book_name: string;
          chapter_number: number;
          status: 'estudar' | 'estudando' | 'revisando' | 'concluído';
          tags: string[];
          outgoing_links: Array<{ target_id: string }>;
        };
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Tipos de conveniência
export type Study = Database['public']['Tables']['bible_studies']['Row'];
export type StudyInsert = Database['public']['Tables']['bible_studies']['Insert'];
export type StudyUpdate = Database['public']['Tables']['bible_studies']['Update'];

export type StudyLink = Database['public']['Tables']['bible_study_links']['Row'];
export type StudyLinkInsert = Database['public']['Tables']['bible_study_links']['Insert'];
export type StudyLinkUpdate = Database['public']['Tables']['bible_study_links']['Update'];

export type Tag = Database['public']['Tables']['bible_tags']['Row'];
export type TagInsert = Database['public']['Tables']['bible_tags']['Insert'];

export type GraphData = Database['public']['Views']['bible_graph_data']['Row'];
