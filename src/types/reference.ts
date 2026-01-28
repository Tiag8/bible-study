/**
 * Reference Type Definitions
 *
 * Types for the Reference Links feature (Story 4.3)
 * Enables users to create interconnected networks of Bible study notes
 */

export interface Reference {
  id: string;
  source_study_id: string;
  target_study_id: string;
  user_id: string;
  display_order: number;
  created_at: string;

  // Denormalized for display (optional)
  target_study?: {
    id: string;
    title: string;
    book_id: string;
    chapter: number;
    content?: string; // snippet
  };
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
