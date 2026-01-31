'use client';

import { useState } from 'react';
import { ChevronDown, Plus, AlertTriangle, X, RotateCw } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';
import { PARCHMENT } from '@/lib/design-tokens';
import { Reference } from '@/hooks/useReferences';
import { AddReferenceModal } from './AddReferenceModal';
import { SortableReferenceItem } from './SortableReferenceItem';
import { toast } from 'sonner';

interface ReferencesSidebarProps {
  references: Reference[];
  loading: boolean;
  error?: string | null;
  onAddReference: (targetStudyId: string) => Promise<boolean>;
  onAddExternalLink?: (url: string) => Promise<boolean>;
  onDeleteReference: (referenceId: string) => Promise<boolean>;
  onReorder: (referenceId: string, direction: 'up' | 'down') => Promise<boolean>;
  onRetry?: () => void;
}

export function ReferencesSidebar({
  references,
  loading,
  error,
  onAddReference,
  onAddExternalLink,
  onDeleteReference,
  onReorder,
  onRetry,
}: ReferencesSidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [showOnMobile, setShowOnMobile] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

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

  const handleRetry = async () => {
    if (!onRetry) return;
    setRetrying(true);
    try {
      onRetry();
    } finally {
      setRetrying(false);
    }
  };

  // Wrapper para onReorder com toast feedback (Story 4.3.4)
  const handleReorder = async (referenceId: string, direction: 'up' | 'down') => {
    const success = await onReorder(referenceId, direction);
    if (success) {
      toast.success('Ordem salva');
    }
    // Se não teve sucesso, é porque já estava no topo/fim - sem toast
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
          'bg-ivory flex flex-col h-full border-l',
          PARCHMENT.border.default,
          // Desktop: always visible sidebar
          'hidden md:flex md:w-80',
          // Mobile: drawer when showOnMobile
          'fixed md:static left-0 top-0 w-80 z-40 md:z-auto',
          showOnMobile && 'flex'
        )}
      >
        {/* Header */}
        <div className={cn("p-4 border-b flex items-center justify-between", PARCHMENT.border.default)}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex items-center gap-2 text-sm font-semibold px-2 py-1 rounded',
            PARCHMENT.text.heading,
            'hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-amber focus:ring-offset-1'
          )}
          title={isOpen ? 'Fechar painel de referências' : 'Abrir painel de referências'}
          aria-label={`Referências (${references.length} ${references.length === 1 ? 'referência' : 'referências'}) - ${isOpen ? 'Aberto' : 'Fechado'}`}
          aria-expanded={isOpen}
        >
          <ChevronDown
            className={cn(
              'w-4 h-4 transition-transform',
              !isOpen && '-rotate-90'
            )}
            aria-hidden="true"
          />
          Referências ({references.length})
        </button>

        {isOpen && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className={cn(
                'p-2 rounded transition-colors flex-1 min-h-[44px] flex items-center justify-center',
                'bg-amber hover:bg-amber-dark',
                'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-amber focus:ring-opacity-50'
              )}
              title="Adicionar nova referência"
              aria-label="Adicionar nova referência"
            >
              <Plus className="w-4 h-4 text-white" />
            </button>

            {/* Close button on mobile */}
            <button
              onClick={() => setShowOnMobile(false)}
              className={cn("md:hidden p-2 rounded transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-amber focus:ring-offset-1", PARCHMENT.text.muted, "hover:bg-warm-white")}
              title="Fechar painel de referências"
              aria-label="Fechar painel de referências"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        </div>

      {/* Content */}
      {isOpen && (
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {/* Loading State */}
          {loading && !error ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={cn(
                    'p-3 rounded border animate-pulse',
                    PARCHMENT.border.default,
                    'bg-warm-white'
                  )}
                  role="status"
                  aria-label="Carregando referência"
                >
                  <div className="h-4 bg-linen rounded w-3/4 mb-2" />
                  <div className="h-3 bg-linen rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : error ? (
            // Error State
            <div className="space-y-3">
              <div className="p-4 rounded border border-red-200 bg-red-50 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-900">
                      Erro ao carregar referências
                    </p>
                    <p className={cn('text-xs mt-1', PARCHMENT.text.secondary)}>
                      {error}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRetry}
                  disabled={retrying}
                  className={cn(
                    'w-full px-3 py-2 rounded text-xs font-medium transition-colors min-h-[44px]',
                    'flex items-center justify-center gap-1',
                    'focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-1',
                    retrying
                      ? 'bg-red-200 text-red-700 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800'
                  )}
                  title={retrying ? 'Aguarde enquanto tentamos novamente...' : 'Clique para tentar carregar as referências novamente'}
                  aria-label={retrying ? 'Aguarde enquanto tentamos novamente' : 'Tentar novamente'}
                  aria-busy={retrying}
                >
                  <RotateCw className={cn('w-3 h-3', retrying && 'animate-spin')} aria-hidden="true" />
                  {retrying ? 'Tentando...' : 'Tentar novamente'}
                </button>
              </div>
            </div>
          ) : references.length === 0 ? (
            // Empty State
            <div className={cn('text-sm text-center py-8 space-y-2', PARCHMENT.text.muted)}>
              <div className="text-2xl mb-2">📚</div>
              <p>Nenhuma referência ainda</p>
              <p className="text-xs">Adicione referências para conectar estudos</p>
            </div>
          ) : (
            // References List
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
                      onReorder={handleReorder}
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
          onAddExternalLink={onAddExternalLink ? async (url) => {
            const success = await onAddExternalLink(url);
            if (success) {
              toast.success('Link externo adicionado com sucesso');
              setShowAddModal(false);
            } else {
              toast.error('Erro ao adicionar link externo');
            }
            return success;
          } : undefined}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          role="presentation"
          aria-hidden="false"
        >
          <div
            className="bg-cream rounded-lg p-6 max-w-md mx-4 shadow-xl border border-linen"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            aria-describedby="delete-modal-description"
          >
            {/* Icon */}
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" aria-hidden="true" />
              </div>
            </div>

            {/* Title */}
            <h2
              id="delete-modal-title"
              className={cn("text-lg font-lora font-semibold text-center mb-2", PARCHMENT.text.heading)}
            >
              Remover referência?
            </h2>

            {/* Description */}
            <p
              id="delete-modal-description"
              className={cn('text-sm text-center mb-6', PARCHMENT.text.secondary)}
            >
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
                  'px-4 py-2 rounded border transition-colors min-h-[44px] font-medium',
                  PARCHMENT.border.default,
                  'hover:bg-warm-white focus:outline-none focus:ring-2 focus:ring-sand focus:ring-offset-1'
                )}
                disabled={deleting !== null}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteConfirm(deleteConfirm)}
                disabled={deleting !== null}
                className={cn(
                  'px-4 py-2 rounded text-white transition-colors min-h-[44px] font-medium',
                  'focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-1',
                  deleting !== null ? 'opacity-50 cursor-not-allowed bg-red-400' : 'bg-red-600 hover:bg-red-700 active:bg-red-800'
                )}
                aria-busy={deleting !== null}
              >
                {deleting ? 'Removendo...' : 'Remover'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Floating Action Button on mobile to open references - Touch target 48x48px */}
      <button
        onClick={() => setShowOnMobile(true)}
        className={cn(
          'fixed bottom-6 right-6 md:hidden z-40',
          'p-3 rounded-full text-white transition-all min-h-[48px] min-w-[48px] flex items-center justify-center',
          'bg-amber hover:bg-amber-dark',
          'hover:shadow-lg hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber',
          'shadow-lg'
        )}
        title="Abrir painel de referências"
        aria-label={`Abrir painel de referências (${references.length} ${references.length === 1 ? 'referência' : 'referências'})`}
      >
        <ChevronDown className="w-6 h-6" aria-hidden="true" />
      </button>
    </>
  );
}
