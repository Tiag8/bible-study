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
          'p-3 rounded border transition-all focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-1',
          BORDERS.gray,
          'hover:bg-white',
          isDragging && 'shadow-lg bg-blue-50 border-blue-300'
        )}
        role="article"
        aria-label={`Referência para ${reference.target_title} (${reference.target_book_name} ${reference.target_chapter_number}), posição ${index + 1} de ${total}`}
      >
        {/* Top row: Grip handle + Title */}
        <div className="flex items-start gap-2 mb-1">
          {/* Grip Handle - Touch target 44x44px */}
          <button
            {...attributes}
            {...listeners}
            className={cn(
              'flex-shrink-0 p-2 rounded transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center',
              'text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
              isDragging && 'bg-blue-100 text-blue-600',
              deleting && 'opacity-50 cursor-not-allowed'
            )}
            title="Arraste para reordenar (cima/baixo)"
            aria-label="Alça para reordenar - use setas ou arraste"
            aria-pressed={isDragging}
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

        {/* Actions: Up/Down/Delete - Touch target 44x44px */}
        <div className="flex gap-1 px-0">
          {/* Up button */}
          <button
            onClick={() => onReorder(reference.id, 'up')}
            disabled={isFirstItem || deleting}
            className={cn(
              'p-2 rounded transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
              isFirstItem || deleting
                ? 'opacity-30 cursor-not-allowed'
                : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
            )}
            title="Mover para cima"
            aria-label={`Mover ${reference.target_title} para cima${isFirstItem ? ' (já no topo)' : ''}`}
            aria-disabled={isFirstItem || deleting}
          >
            <ChevronUp className="w-4 h-4" />
          </button>

          {/* Down button */}
          <button
            onClick={() => onReorder(reference.id, 'down')}
            disabled={isLastItem || deleting}
            className={cn(
              'p-2 rounded transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
              isLastItem || deleting
                ? 'opacity-30 cursor-not-allowed'
                : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
            )}
            title="Mover para baixo"
            aria-label={`Mover ${reference.target_title} para baixo${isLastItem ? ' (já no final)' : ''}`}
            aria-disabled={isLastItem || deleting}
          >
            <ChevronUp className="w-4 h-4 rotate-180" />
          </button>

          {/* Delete button */}
          <button
            onClick={() => onDelete(reference.id)}
            disabled={deleting}
            className={cn(
              'p-2 rounded ml-auto transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center',
              'text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1',
              deleting && 'opacity-50 cursor-not-allowed'
            )}
            title="Deletar referência"
            aria-label={`Deletar referência para ${reference.target_title}`}
            aria-disabled={deleting}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }
);

SortableReferenceItem.displayName = 'SortableReferenceItem';
