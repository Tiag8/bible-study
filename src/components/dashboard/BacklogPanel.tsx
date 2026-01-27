"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { COLORS, BORDERS } from "@/lib/design-tokens";
import { formatRelativeDate } from "@/lib/mock-data";
import { useBacklog, useStudies } from "@/hooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BacklogAddStudyModal } from "./BacklogAddStudyModal";
import {
  BookMarked,
  Plus,
  Clock,
  Check,
  Link2,
  X,
  ChevronRight,
  Loader2,
} from "lucide-react";

interface BacklogPanelProps {
  onStudyClick?: (referenceLabel: string) => void;
}

export function BacklogPanel({ onStudyClick }: BacklogPanelProps) {
  const [showAddStudyModal, setShowAddStudyModal] = useState(false);

  // Hooks Supabase
  const {
    loading: backlogLoading,
    toggleBacklogStatus,
    deleteFromBacklog,
    getPending,
    getCompleted
  } = useBacklog();
  const { studies } = useStudies();

  const pendingItems = getPending();
  const completedItems = getCompleted();

  const getSourceStudy = (sourceId: string | null) => {
    if (!sourceId) return null;
    return studies.find((s) => s.id === sourceId);
  };

  const handleToggleStatus = async (itemId: string) => {
    await toggleBacklogStatus(itemId);
  };

  const handleRemoveItem = async (itemId: string) => {
    await deleteFromBacklog(itemId);
  };

  return (
    <aside className={cn("w-80 bg-white flex flex-col h-full", BORDERS.gray.replace('border', 'border-l'))}>
      {/* TOKENS: COLORS.primary, COLORS.success, COLORS.danger, COLORS.neutral, BORDERS */}
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookMarked className={cn("w-5 h-5", COLORS.primary.text)} />
            <h2 className={cn("font-semibold", COLORS.neutral.text.primary)}>Backlog de Estudos</h2>
          </div>
          <Badge variant="secondary">{pendingItems.length}</Badge>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setShowAddStudyModal(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Estudo
        </Button>
      </div>

      {/* Pending Items */}
      <div className="flex-1 overflow-y-auto">
        {backlogLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className={cn("w-6 h-6 animate-spin", COLORS.neutral.text.light)} />
            <span className={cn("ml-2", COLORS.neutral.text.muted)}>Carregando...</span>
          </div>
        ) : pendingItems.length > 0 ? (
          <div className="p-3 space-y-2">
            <p className={cn("text-xs font-medium uppercase tracking-wider px-1", COLORS.neutral.text.muted)}>
              Para Estudar ({pendingItems.length})
            </p>
            {pendingItems.map((item) => {
              const sourceStudy = getSourceStudy(item.source_study_id);
              return (
                <div
                  key={item.id}
                  className={cn("group rounded-lg p-3 transition-colors", COLORS.neutral[50], `hover:${COLORS.neutral[100]}`)}
                >
                  <div className="flex items-start gap-2">
                    <button
                      onClick={() => handleToggleStatus(item.id)}
                      className={cn("mt-0.5 w-5 h-5 rounded-full border-2 transition-colors flex-shrink-0", BORDERS.gray.replace('border', 'border-'), `hover:border-blue-500`)}
                    />
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => onStudyClick?.(item.reference_label)}
                        className="text-left w-full"
                      >
                        <p className={cn("font-medium text-sm truncate", COLORS.neutral.text.primary)}>
                          {item.reference_label}
                        </p>
                      </button>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={cn("flex items-center gap-1 text-xs", COLORS.neutral.text.muted)}>
                          <Clock className="w-3 h-3" />
                          <span>{formatRelativeDate(item.created_at)}</span>
                        </div>
                        {sourceStudy && (
                          <div className={cn("flex items-center gap-1 text-xs", COLORS.primary.text)}>
                            <Link2 className="w-3 h-3" />
                            <span className="truncate max-w-[100px]">
                              {sourceStudy.title.split(" - ")[0]}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className={cn("opacity-0 group-hover:opacity-100 p-1 transition-all", COLORS.neutral.text.light, `hover:${COLORS.danger.text}`)}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={cn("p-6 text-center", COLORS.neutral.text.muted)}>
            <BookMarked className={cn("w-10 h-10 mx-auto mb-2", COLORS.neutral[300])} />
            <p className="text-sm">Nenhum item no backlog</p>
            <p className="text-xs mt-1">
              Use <kbd className={cn("px-1 py-0.5 rounded", COLORS.neutral[100])}>/</kbd> no
              editor para adicionar
            </p>
          </div>
        )}

        {/* Completed Items */}
        {completedItems.length > 0 && (
          <div className="p-3 border-t border-gray-100">
            <p className={cn("text-xs font-medium uppercase tracking-wider px-1 mb-2", COLORS.neutral.text.muted)}>
              Concluídos ({completedItems.length})
            </p>
            {completedItems.map((item) => (
              <div
                key={item.id}
                className={cn("group flex items-center gap-2 p-2 rounded-lg", `hover:${COLORS.neutral[50]}`)}
              >
                <button
                  onClick={() => handleToggleStatus(item.id)}
                  className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0"
                >
                  <Check className="w-3 h-3" />
                </button>
                <span className={cn("text-sm line-through truncate flex-1", COLORS.neutral.text.muted)}>
                  {item.reference_label}
                </span>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className={cn("opacity-0 group-hover:opacity-100 p-1", COLORS.neutral.text.light, `hover:${COLORS.danger.text}`)}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-100">
        <button className={cn("w-full flex items-center justify-center gap-2 text-sm transition-colors py-2", COLORS.neutral.text.secondary, `hover:${COLORS.primary.text}`)}>
          Ver Todos os Estudos
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Modal para criar estudo via backlog */}
      <BacklogAddStudyModal
        isOpen={showAddStudyModal}
        onClose={() => setShowAddStudyModal(false)}
      />
    </aside>
  );
}
