'use client';

import React from 'react';
import { Trash2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Reference } from '@/types/reference';

interface ReferenceCardProps {
  reference: Reference;
  onDelete?: (referenceId: string) => void | Promise<void>;
  onSelect?: (reference: Reference) => void;
  isDragging?: boolean;
  isLoading?: boolean;
}

/**
 * ReferenceCard Component
 *
 * Displays a single reference (link) to another study
 * Supports drag-drop reordering and deletion
 *
 * States:
 * - Default: Gray border, white background
 * - Hover: Slightly darker border, light gray background, delete visible
 * - Dragging: Reduced opacity, shadow, grab cursor
 * - Error: Red border/background (when reference is invalid)
 * - Loading: Disabled delete button with reduced opacity
 */
export const ReferenceCard = React.memo(function ReferenceCard({
  reference,
  onDelete,
  isDragging,
  isLoading,
}: ReferenceCardProps) {
  const [showDelete, setShowDelete] = React.useState(false);

  return (
    <div
      className={cn(
        'flex items-center gap-2 p-3 rounded-md border',
        'transition-all duration-200 cursor-grab',
        isDragging && 'opacity-70 shadow-sm cursor-grabbing',
        showDelete && 'bg-red-50 border-red-300',
        !showDelete && 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      )}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
      role="article"
      aria-label={`Reference to ${reference.target_title || 'Unknown'}`}
    >
      {/* Grip Handle (for drag-drop) */}
      <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0 hover:text-gray-600" />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 truncate">
          {reference.target_title || 'Untitled'}
        </h4>
        <p className="text-xs text-gray-500">
          {reference.target_book_name} {reference.target_chapter_number}
        </p>
      </div>

      {/* Delete Button */}
      <button
        onClick={() => onDelete?.(reference.id)}
        disabled={isLoading}
        className={cn(
          'flex-shrink-0 p-1.5 rounded transition-colors',
          'text-red-600 hover:text-red-700 hover:bg-red-50',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          showDelete ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        )}
        aria-label="Delete reference"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
});
