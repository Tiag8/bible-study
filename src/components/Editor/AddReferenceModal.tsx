'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { X, Search, Link2, BookOpen, ExternalLink, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { COLORS, BORDERS, SHADOW_CLASSES } from '@/lib/design-tokens';
import { useStudies } from '@/hooks';
import { isValidUrl } from '@/lib/reference-utils';

type TabType = 'internal' | 'external';

interface AddReferenceModalProps {
  onAdd: (targetStudyId: string) => Promise<boolean>;
  onAddExternalLink?: (url: string) => Promise<boolean>;
  onClose: () => void;
  currentStudyId?: string; // To exclude current study from list
  existingReferenceIds?: string[]; // To exclude already-referenced studies
}

export function AddReferenceModal({
  onAdd,
  onAddExternalLink,
  onClose,
  currentStudyId,
  existingReferenceIds = [],
}: AddReferenceModalProps) {
  const { studies, loading: studiesLoading } = useStudies();
  const [activeTab, setActiveTab] = useState<TabType>('internal');
  const [rawSearchQuery, setRawSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // External link state
  const [externalUrl, setExternalUrl] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);

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

  // Validate URL on change
  const handleUrlChange = useCallback((value: string) => {
    setExternalUrl(value);
    setUrlError(null);

    if (value.trim() && !isValidUrl(value)) {
      setUrlError('URL inválida. Use http:// ou https://');
    }
  }, []);

  // Add internal reference
  const handleAddInternal = useCallback(async () => {
    if (!selectedId) return;

    try {
      setIsLoading(true);
      await onAdd(selectedId);
    } finally {
      setIsLoading(false);
    }
  }, [selectedId, onAdd]);

  // Add external link
  const handleAddExternal = useCallback(async () => {
    if (!externalUrl.trim() || !onAddExternalLink) return;

    // Validate URL
    if (!isValidUrl(externalUrl)) {
      setUrlError('URL inválida. Use http:// ou https://');
      return;
    }

    try {
      setIsLoading(true);
      const success = await onAddExternalLink(externalUrl);
      if (success) {
        setExternalUrl('');
        onClose();
      }
    } finally {
      setIsLoading(false);
    }
  }, [externalUrl, onAddExternalLink, onClose]);

  // Combined handler based on active tab
  const handleAdd = useCallback(async () => {
    if (activeTab === 'internal') {
      await handleAddInternal();
    } else {
      await handleAddExternal();
    }
  }, [activeTab, handleAddInternal, handleAddExternal]);

  // Check if can add
  const canAdd = activeTab === 'internal'
    ? selectedId !== null
    : externalUrl.trim() !== '' && !urlError && onAddExternalLink;

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

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('internal')}
            className={cn(
              'flex-1 py-3 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2',
              activeTab === 'internal'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            )}
            aria-selected={activeTab === 'internal'}
            role="tab"
          >
            <BookOpen className="w-4 h-4" />
            Estudo Interno
          </button>
          <button
            onClick={() => setActiveTab('external')}
            className={cn(
              'flex-1 py-3 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2',
              activeTab === 'external'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700',
              !onAddExternalLink && 'opacity-50 cursor-not-allowed'
            )}
            aria-selected={activeTab === 'external'}
            role="tab"
            disabled={!onAddExternalLink}
            title={!onAddExternalLink ? 'Links externos não disponíveis' : undefined}
          >
            <ExternalLink className="w-4 h-4" />
            Link Externo
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {activeTab === 'internal' ? (
            <>
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
            </>
          ) : (
            <>
              {/* External URL input */}
              <div className="space-y-2">
                <label htmlFor="external-url" className="block text-sm font-medium text-gray-700">
                  URL do Link Externo
                </label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="external-url"
                    type="url"
                    placeholder="https://exemplo.com/artigo"
                    value={externalUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    className={cn(
                      'w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2',
                      urlError
                        ? 'border-red-300 focus:ring-red-500'
                        : cn(BORDERS.gray, 'focus:ring-blue-500')
                    )}
                    autoFocus
                    aria-label="External URL"
                    aria-invalid={!!urlError}
                    aria-describedby={urlError ? 'url-error' : undefined}
                  />
                </div>
                {urlError && (
                  <div id="url-error" className="flex items-center gap-1 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    {urlError}
                  </div>
                )}
              </div>

              {/* Preview */}
              {externalUrl && isValidUrl(externalUrl) && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <ExternalLink className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-blue-900 truncate">
                        {(() => {
                          try {
                            return new URL(externalUrl).hostname;
                          } catch {
                            return externalUrl;
                          }
                        })()}
                      </div>
                      <div className="text-xs text-blue-700 truncate">{externalUrl}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Help text */}
              <p className={cn('text-xs', COLORS.neutral.text.muted)}>
                Cole a URL completa do site, artigo ou recurso que deseja referenciar.
                Links externos aparecem com cor azul na lista de referências.
              </p>
            </>
          )}
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
            disabled={!canAdd || isLoading}
            className={cn(
              'flex-1 py-2 px-4 rounded text-white transition-colors',
              canAdd && !isLoading
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
