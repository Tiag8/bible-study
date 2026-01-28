'use client';

import { useState } from 'react';
import { ChevronDown, Plus, AlertTriangle, X } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';
import { COLORS, BORDERS } from '@/lib/design-tokens';
import { Reference } from '@/hooks/useReferences';
import { AddReferenceModal } from './AddReferenceModal';
import { SortableReferenceItem } from './SortableReferenceItem';
import { toast } from 'sonner';

interface ReferencesSidebarProps {
  references: Reference[];
  loading: boolean;
  onAddReference: (targetStudyId: string) => Promise<boolean>;
  onDeleteReference: (referenceId: string) => Promise<boolean>;
  onReorder: (referenceId: string, direction: 'up' | 'down') => Promise<boolean>;
}

export function ReferencesSidebar({
  references,
  loading,
  onAddReference,
  onDeleteReference,
  onReorder,
}: ReferencesSidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [showOnMobile, setShowOnMobile] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Setup drag-and-drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDeleteClick = (referenceId: string) => {
    setDeleteConfirm(referenceId);
  };

  const handleDeleteConfirm = async (referenceId: string) => {
    setDeleting(referenceId);
    const refToDelete = references.find((ref) => ref.id === referenceId);
    const refTitle = refToDelete?.target_title || 'Referência';

    try {
      const success = await onDeleteReference(referenceId);
      if (success) {
        toast.success(`Referência removida: ${refTitle}`);
      } else {
        toast.error('Erro ao remover referência');
      }
    } catch {
      toast.error('Erro ao remover referência');
    } finally {
      setDeleting(null);
      setDeleteConfirm(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  return (
    <>
      {/* Mobile drawer overlay */}
      {showOnMobile && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-30"
          onClick={() => setShowOnMobile(false)}
          aria-label="Close references drawer"
        />
      )}

      {/* Sidebar - Desktop always visible, Mobile as drawer */}
      <div
        className={cn(
          'bg-gray-50 flex flex-col h-full border-l',
          BORDERS.gray,
          // Desktop: always visible sidebar
          'hidden md:flex md:w-80',
          // Mobile: drawer when showOnMobile
          'fixed md:static left-0 top-0 w-80 z-40 md:z-auto',
          showOnMobile && 'flex'
        )}
      >
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex items-center gap-2 text-sm font-semibold',
            COLORS.neutral.text.primary,
            'hover:opacity-80 transition-opacity'
          )}
        >
          <ChevronDown
            className={cn(
              'w-4 h-4 transition-transform',
              !isOpen && '-rotate-90'
            )}
          />
          Referências ({references.length})
        </button>

        {isOpen && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className={cn(
                'p-1.5 rounded transition-colors flex-1',
                COLORS.primary.default,
                'hover:opacity-90'
              )}
              title="Adicionar referência"
              aria-label="Add reference"
            >
              <Plus className="w-4 h-4 text-white mx-auto" />
            </button>

            {/* Close button on mobile */}
            <button
              onClick={() => setShowOnMobile(false)}
              className="md:hidden p-1.5 rounded transition-colors text-gray-500 hover:bg-gray-200"
              title="Close references"
              aria-label="Close references drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        </div>

      {/* Content */}
      {isOpen && (
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className={cn('text-sm text-center py-4', COLORS.neutral.text.muted)}>
              Carregando referências...
            </div>
          ) : references.length === 0 ? (
            <div className={cn('text-sm text-center py-4', COLORS.neutral.text.muted)}>
              Nenhuma referência ainda
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={() => {
                // Reorder is handled by onReorder callback in each item
                // This DndContext just provides the drag-and-drop context
              }}
            >
              <SortableContext
                items={references.map((ref) => ref.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {references.map((ref, idx) => (
                    <SortableReferenceItem
                      key={ref.id}
                      reference={ref}
                      index={idx}
                      total={references.length}
                      onDelete={handleDeleteClick}
                      onReorder={onReorder}
                      deleting={deleting === ref.id}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      )}

      {/* Add Reference Modal */}
      {showAddModal && (
        <AddReferenceModal
          onAdd={async (targetId) => {
            const success = await onAddReference(targetId);
            if (success) {
              toast.success('Referência adicionada com sucesso');
              setShowAddModal(false);
            } else {
              toast.error('Erro ao adicionar referência');
            }
            return success;
          }}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
            {/* Icon */}
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Remover referência?
            </h2>

            {/* Description */}
            <p className={cn('text-sm text-center mb-6', COLORS.neutral.text.secondary)}>
              Tem certeza que deseja remover a referência para{' '}
              <strong>
                {references.find((ref) => ref.id === deleteConfirm)?.target_title}
              </strong>
              ? Esta ação não pode ser desfeita.
            </p>

            {/* Buttons */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleDeleteCancel}
                className={cn(
                  'px-4 py-2 rounded border transition-colors',
                  BORDERS.gray,
                  'hover:bg-gray-50'
                )}
                disabled={deleting !== null}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteConfirm(deleteConfirm)}
                disabled={deleting !== null}
                className={cn(
                  'px-4 py-2 rounded text-white transition-colors',
                  deleting !== null ? 'opacity-50 cursor-not-allowed bg-red-400' : 'bg-red-600 hover:bg-red-700'
                )}
              >
                {deleting ? 'Removendo...' : 'Remover'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Floating Action Button on mobile to open references */}
      <button
        onClick={() => setShowOnMobile(true)}
        className={cn(
          'fixed bottom-6 right-6 md:hidden z-40',
          'p-3 rounded-full text-white transition-all',
          COLORS.primary.default,
          'hover:shadow-lg hover:scale-110',
          'shadow-lg'
        )}
        title="Open references"
        aria-label="Open references drawer"
      >
        <ChevronDown className="w-6 h-6" />
      </button>
    </>
  );
}
