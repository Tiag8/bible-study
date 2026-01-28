'use client';

import { useState, useMemo, useCallback } from 'react';
import { X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { COLORS, BORDERS, SHADOW_CLASSES } from '@/lib/design-tokens';
import { useStudies } from '@/hooks';

interface AddReferenceModalProps {
  onAdd: (targetStudyId: string) => Promise<boolean>;
  onClose: () => void;
}

export function AddReferenceModal({ onAdd, onClose }: AddReferenceModalProps) {
  const { studies, loading: studiesLoading } = useStudies();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filtrar estudos por busca
  const filteredStudies = useMemo(() => {
    if (!searchQuery.trim()) return studies;
    const query = searchQuery.toLowerCase();
    return studies.filter(
      (study) =>
        study.title.toLowerCase().includes(query) ||
        study.book_name.toLowerCase().includes(query)
    );
  }, [studies, searchQuery]);

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
      <div className={cn('bg-white rounded-lg w-full max-w-md', SHADOW_CLASSES.lg)}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Adicionar Referência</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
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
              placeholder="Buscar estudo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                'w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
                BORDERS.gray
              )}
              autoFocus
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
                    'w-full text-left p-2 rounded transition-colors',
                    selectedId === study.id
                      ? 'bg-blue-100 border-2 border-blue-500'
                      : 'hover:bg-gray-100 border border-transparent'
                  )}
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
          >
            {isLoading ? 'Adicionando...' : 'Adicionar'}
          </button>
        </div>
      </div>
    </div>
  );
}
