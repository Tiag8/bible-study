'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { COLORS, BORDERS, SHADOW_CLASSES } from '@/lib/design-tokens';
import { useStudies } from '@/hooks';

interface AddReferenceModalProps {
  onAdd: (targetStudyId: string) => Promise<boolean>;
  onClose: () => void;
  currentStudyId?: string; // To exclude current study from list
  existingReferenceIds?: string[]; // To exclude already-referenced studies
}

export function AddReferenceModal({
  onAdd,
  onClose,
  currentStudyId,
  existingReferenceIds = [],
}: AddReferenceModalProps) {
  const { studies, loading: studiesLoading } = useStudies();
  const [rawSearchQuery, setRawSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Debounce search (200ms)
  useEffect(() => {
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearchQuery(rawSearchQuery);
    }, 200);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [rawSearchQuery]);

  // Filtrar estudos por busca, excluindo estudo atual e já referenciados
  const filteredStudies = useMemo(() => {
    const filtered = studies.filter((study) => {
      // Excluir estudo atual (não pode referenciar a si mesmo)
      if (currentStudyId && study.id === currentStudyId) return false;
      // Excluir estudos já referenciados
      if (existingReferenceIds.includes(study.id)) return false;
      return true;
    });

    if (!debouncedSearchQuery.trim()) return filtered;

    const query = debouncedSearchQuery.toLowerCase();
    return filtered.filter(
      (study) =>
        study.title.toLowerCase().includes(query) ||
        study.book_name.toLowerCase().includes(query)
    );
  }, [studies, debouncedSearchQuery, currentStudyId, existingReferenceIds]);

  const handleAdd = useCallback(async () => {
    if (!selectedId) return;

    try {
      setIsLoading(true);
      await onAdd(selectedId);
    } finally {
      setIsLoading(false);
    }
  }, [selectedId, onAdd]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className={cn('bg-white rounded-lg w-full max-w-md', SHADOW_CLASSES.lg)}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-reference-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 id="add-reference-title" className="text-lg font-semibold">
            Adicionar Referência
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar estudo por título ou livro..."
              value={rawSearchQuery}
              onChange={(e) => setRawSearchQuery(e.target.value)}
              className={cn(
                'w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                BORDERS.gray
              )}
              autoFocus
              aria-label="Search studies"
            />
          </div>

          {/* Studies list */}
          <div className="max-h-64 overflow-y-auto space-y-2 border rounded-lg p-2">
            {studiesLoading ? (
              <div className={cn('text-sm text-center py-4', COLORS.neutral.text.muted)}>
                Carregando estudos...
              </div>
            ) : filteredStudies.length === 0 ? (
              <div className={cn('text-sm text-center py-4', COLORS.neutral.text.muted)}>
                Nenhum estudo encontrado
              </div>
            ) : (
              filteredStudies.map((study) => (
                <button
                  key={study.id}
                  onClick={() => setSelectedId(study.id)}
                  className={cn(
                    'w-full text-left p-2 rounded transition-colors border-2',
                    selectedId === study.id
                      ? cn(COLORS.primary.light, 'border-blue-500')
                      : 'hover:bg-gray-100 border-transparent'
                  )}
                  aria-pressed={selectedId === study.id}
                  aria-label={`Select ${study.title}`}
                >
                  <div className="font-medium text-sm">{study.title}</div>
                  <div className={cn('text-xs', COLORS.neutral.text.muted)}>
                    {study.book_name} {study.chapter_number}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t">
          <button
            onClick={onClose}
            className={cn(
              'flex-1 py-2 px-4 rounded border transition-colors',
              BORDERS.gray,
              'hover:bg-gray-50'
            )}
            aria-label="Cancel adding reference"
          >
            Cancelar
          </button>
          <button
            onClick={handleAdd}
            disabled={!selectedId || isLoading}
            className={cn(
              'flex-1 py-2 px-4 rounded text-white transition-colors',
              selectedId && !isLoading
                ? cn(COLORS.primary.default, 'hover:opacity-90')
                : 'opacity-50 cursor-not-allowed bg-gray-400'
            )}
            aria-label={isLoading ? 'Adding reference' : 'Add selected reference'}
          >
            {isLoading ? 'Adicionando...' : 'Adicionar'}
          </button>
        </div>
      </div>
    </div>
  );
}
