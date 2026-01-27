/**
 * ✅ REFACTORING: Subcomponente - Busca de estudos para referência
 *
 * Lista filtrada de estudos para criar links internos (bible-graph://).
 */

import { useMemo } from "react";
import { BookOpen, Loader2 } from "lucide-react";
import { useStudies } from "@/hooks";
import { cn } from "@/lib/utils";
import { COLORS, BORDERS } from "@/lib/design-tokens";
import type { BubbleMenuReferenceProps } from "./types";

export function BubbleMenuReference({
  setMode,
  searchQuery,
  setSearchQuery,
  onSelectReference,
}: BubbleMenuReferenceProps) {
  // Hook Supabase
  const { studies, loading: studiesLoading } = useStudies();

  // ✅ PERFORMANCE: useMemo previne re-filtro em toda re-render
  const filteredStudies = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return studies.filter((study) =>
      study.title.toLowerCase().includes(query) ||
      study.book_name.toLowerCase().includes(query)
    );
  }, [studies, searchQuery]);

  return (
    <div className="p-3 w-80">
      {/* Input de busca */}
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className={cn("w-4 h-4", COLORS.neutral.text.primary)} />
        <input
          type="text"
          placeholder="Buscar estudo para referenciar..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setMode("default");
              setSearchQuery("");
            }
          }}
          className={cn(
            "flex-1 px-2 py-1 text-sm rounded focus:outline-none focus:ring-2 focus:ring-blue-500",
            BORDERS.gray
          )}
          autoFocus
        />
      </div>

      {/* Lista de estudos */}
      <div className="max-h-48 overflow-y-auto">
        {studiesLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className={cn("w-4 h-4 animate-spin", COLORS.neutral.text.secondary)} />
            <span className={cn("ml-2 text-sm", COLORS.neutral.text.muted)}>Carregando...</span>
          </div>
        ) : filteredStudies.length > 0 ? (
          filteredStudies.map((study) => (
            <button
              key={study.id}
              onClick={() => onSelectReference(study.id, study.title)}
              className={cn(
                "w-full text-left px-2 py-2 text-sm rounded transition-colors",
                `hover:${COLORS.neutral[100]}`
              )}
            >
              <div className={cn("font-medium truncate", COLORS.neutral.text.primary)}>
                {study.title}
              </div>
              <div className={cn("text-xs", COLORS.neutral.text.muted)}>
                {study.book_name} {study.chapter_number} • {
                  study.status === 'estudando' ? 'Estudando' :
                  study.status === 'revisando' ? 'Revisando' :
                  'Concluído'
                }
              </div>
            </button>
          ))
        ) : (
          <div className={cn("text-sm text-center py-4", COLORS.neutral.text.muted)}>
            Nenhum estudo encontrado
          </div>
        )}
      </div>

      {/* Botão voltar */}
      <button
        onClick={() => {
          setMode("default");
          setSearchQuery("");
        }}
        className="mt-2 text-xs text-gray-500 hover:text-gray-700"
      >
        ← Voltar
      </button>
    </div>
  );
}
