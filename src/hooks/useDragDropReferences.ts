'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Reference } from './useReferences';

/**
 * Hook for managing drag-and-drop reordering of references
 *
 * Handles:
 * - Sensor setup (pointer + keyboard)
 * - State management for dragging
 * - Reordering logic
 * - Callback integration
 */
export function useDragDropReferences(
  references: Reference[],
  onReorder: (referenceId: string, direction: 'up' | 'down') => Promise<boolean>
) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;

      if (!over || active.id === over.id) {
        return;
      }

      const oldIndex = references.findIndex((ref) => ref.id === active.id);
      const newIndex = references.findIndex((ref) => ref.id === over.id);

      if (oldIndex === -1 || newIndex === -1) {
        return;
      }

      // Determine direction (up or down)
      const direction = oldIndex < newIndex ? 'down' : 'up';

      setReordering(true);
      try {
        await onReorder(active.id as string, direction);
      } finally {
        setReordering(false);
      }
    },
    [references, onReorder]
  );

  return {
    sensors,
    activeId,
    reordering,
    handleDragStart,
    handleDragCancel,
    handleDragEnd,
    DndContext,
    SortableContext,
    verticalListSortingStrategy,
  };
}
