'use client';

import { useState } from 'react';
import { ChevronDown, Plus, Trash2, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { COLORS, BORDERS } from '@/lib/design-tokens';
import { Reference } from '@/hooks/useReferences';
import { AddReferenceModal } from './AddReferenceModal';

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
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (referenceId: string) => {
    setDeleting(referenceId);
    await onDeleteReference(referenceId);
    setDeleting(null);
  };

  return (
    <div className={cn('border-l', BORDERS.gray, 'bg-gray-50 flex flex-col h-full')}>
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
          <button
            onClick={() => setShowAddModal(true)}
            className={cn(
              'p-1.5 rounded transition-colors',
              COLORS.primary.default,
              'hover:opacity-90'
            )}
            title="Adicionar referência"
          >
            <Plus className="w-4 h-4 text-white" />
          </button>
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
            references.map((ref, idx) => (
              <div
                key={ref.id}
                className={cn(
                  'p-3 rounded border transition-colors',
                  BORDERS.gray,
                  'hover:bg-white'
                )}
              >
                {/* Title */}
                <a
                  href={`/estudo/${ref.target_study_id}`}
                  data-href={`/estudo/${ref.target_study_id}`}
                  className="text-sm font-medium text-blue-600 hover:underline cursor-pointer block mb-1"
                >
                  {ref.target_title}
                </a>

                {/* Book info */}
                <div className={cn('text-xs', COLORS.neutral.text.muted)}>
                  {ref.target_book_name} {ref.target_chapter_number}
                </div>

                {/* Actions */}
                <div className="flex gap-1 mt-2">
                  {/* Up button */}
                  <button
                    onClick={() => onReorder(ref.id, 'up')}
                    disabled={idx === 0}
                    className={cn(
                      'p-1 rounded text-xs transition-colors',
                      idx === 0
                        ? 'opacity-30 cursor-not-allowed'
                        : 'hover:bg-gray-200'
                    )}
                    title="Mover para cima"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>

                  {/* Down button */}
                  <button
                    onClick={() => onReorder(ref.id, 'down')}
                    disabled={idx === references.length - 1}
                    className={cn(
                      'p-1 rounded text-xs transition-colors',
                      idx === references.length - 1
                        ? 'opacity-30 cursor-not-allowed'
                        : 'hover:bg-gray-200'
                    )}
                    title="Mover para baixo"
                  >
                    <ChevronUp className="w-3 h-3 rotate-180" />
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(ref.id)}
                    disabled={deleting === ref.id}
                    className={cn(
                      'p-1 rounded text-xs ml-auto transition-colors',
                      'text-red-600 hover:bg-red-50',
                      deleting === ref.id && 'opacity-50 cursor-not-allowed'
                    )}
                    title="Deletar referência"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Reference Modal */}
      {showAddModal && (
        <AddReferenceModal
          onAdd={async (targetId) => {
            const success = await onAddReference(targetId);
            if (success) {
              setShowAddModal(false);
            }
            return success;
          }}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
