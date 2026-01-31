/**
 * Reference Type Definitions
 *
 * Single source of truth para tipos de referencia/links entre estudos.
 * Usado por useReferences, ReferencesSidebar, ReferenceCard, etc.
 */

import type { StudyLink } from './database';

export interface TagWithColor {
  name: string;
  type: 'Versículos' | 'Temas' | 'Princípios';
  color: string;
}

/**
 * Reference enrichida com dados do estudo target.
 * Extends StudyLink com campos denormalizados para display.
 */
export interface Reference {
  id: string;
  source_study_id: string;
  target_study_id?: string | null;
  target_title?: string;
  target_book_name?: string;
  target_chapter_number?: number;
  target_tags?: TagWithColor[];
  created_at: string;
  position?: number;

  // Campos do schema (migration 20260128_004)
  link_type: 'internal' | 'external';
  external_url?: string | null;
  is_bidirectional?: boolean;
  display_order?: number;
}

export interface ReferenceCardProps {
  reference: Reference;
  onDelete?: (referenceId: string) => void | Promise<void>;
  onSelect?: (reference: Reference) => void;
  isDragging?: boolean;
  isLoading?: boolean;
}

export interface ReferencesSidebarProps {
  references: Reference[];
  loading: boolean;
  error?: string | null;
  onAddReference: () => void;
  onDeleteReference: (referenceId: string) => Promise<boolean>;
  onReorderReference?: (referenceId: string, newOrder: number) => Promise<boolean>;
}

export interface AddReferenceModalProps {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onSelect: (targetStudyId: string) => Promise<boolean>;
  currentStudyId: string;
  existingReferenceIds?: string[];
}

// Re-export do tipo base para conveniencia
export type { StudyLink };
