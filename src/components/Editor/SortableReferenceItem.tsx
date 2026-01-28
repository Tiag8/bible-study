'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ChevronUp, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BORDERS, COLORS } from '@/lib/design-tokens';
import { Reference } from '@/hooks/useReferences';

interface SortableReferenceItemProps {
  reference: Reference;
  index: number;
  total: number;
  onDelete: (referenceId: string) => void;
  onReorder: (referenceId: string, direction: 'up' | 'down') => void;
  deleting?: boolean;
}

/**
 * SortableReferenceItem Component
 *
 * Individual reference card with drag-and-drop support
 * Uses @dnd-kit/sortable for reordering
 */
export const SortableReferenceItem = React.forwardRef<
  HTMLDivElement,
  SortableReferenceItemProps
>(
  (
    {
      reference,
      index,
      total,
      onDelete,
      onReorder,
      deleting,
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ref
  ) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
      useSortable({
        id: reference.id,
        disabled: deleting, // Disable drag during delete
      });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    const isFirstItem = index === 0;
    const isLastItem = index === total - 1;

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          'p-3 rounded border transition-all',
          BORDERS.gray,
          'hover:bg-white',
          isDragging && 'shadow-lg bg-blue-50 border-blue-300'
        )}
        role="article"
        aria-label={`Reference to ${reference.target_title}, position ${index + 1} of ${total}`}
      >
        {/* Top row: Grip handle + Title */}
        <div className="flex items-start gap-2 mb-1">
          {/* Grip Handle */}
          <button
            {...attributes}
            {...listeners}
            className={cn(
              'flex-shrink-0 p-1 rounded transition-colors',
              'text-gray-400 hover:text-gray-600 hover:bg-gray-100',
              isDragging && 'bg-blue-100 text-blue-600'
            )}
            title="Drag to reorder"
            aria-label="Drag handle for reordering"
            disabled={deleting}
          >
            <GripVertical className="w-4 h-4" />
          </button>

          {/* Title */}
          <a
            href={`/estudo/${reference.target_study_id}`}
            data-href={`/estudo/${reference.target_study_id}`}
            className={cn(
              'text-sm font-medium text-blue-600 hover:underline cursor-pointer flex-1 line-clamp-1',
              deleting && 'opacity-50 pointer-events-none'
            )}
          >
            {reference.target_title}
          </a>
        </div>

        {/* Book info */}
        <div className={cn('text-xs', COLORS.neutral.text.muted, 'px-1 mb-2')}>
          {reference.target_book_name} {reference.target_chapter_number}
        </div>

        {/* Actions: Up/Down/Delete */}
        <div className="flex gap-1 px-1">
          {/* Up button */}
          <button
            onClick={() => onReorder(reference.id, 'up')}
            disabled={isFirstItem || deleting}
            className={cn(
              'p-1 rounded text-xs transition-colors',
              isFirstItem || deleting
                ? 'opacity-30 cursor-not-allowed'
                : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
            )}
            title="Move up"
            aria-label={`Move ${reference.target_title} up`}
          >
            <ChevronUp className="w-3 h-3" />
          </button>

          {/* Down button */}
          <button
            onClick={() => onReorder(reference.id, 'down')}
            disabled={isLastItem || deleting}
            className={cn(
              'p-1 rounded text-xs transition-colors',
              isLastItem || deleting
                ? 'opacity-30 cursor-not-allowed'
                : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
            )}
            title="Move down"
            aria-label={`Move ${reference.target_title} down`}
          >
            <ChevronUp className="w-3 h-3 rotate-180" />
          </button>

          {/* Delete button */}
          <button
            onClick={() => onDelete(reference.id)}
            disabled={deleting}
            className={cn(
              'p-1 rounded text-xs ml-auto transition-colors',
              'text-red-600 hover:bg-red-50',
              deleting && 'opacity-50 cursor-not-allowed'
            )}
            title="Delete reference"
            aria-label={`Delete reference to ${reference.target_title}`}
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }
);

SortableReferenceItem.displayName = 'SortableReferenceItem';
