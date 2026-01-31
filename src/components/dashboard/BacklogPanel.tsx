"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { PARCHMENT } from "@/lib/design-tokens";
import { formatRelativeDate } from "@/lib/mock-data";
import { useBacklog, useStudies } from "@/hooks";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { BacklogAddStudyModal } from "./BacklogAddStudyModal";
import { toast } from "sonner";
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

export function BacklogPanel() {
  const router = useRouter();
  const [showAddStudyModal, setShowAddStudyModal] = useState(false);

  // Hooks Supabase
  const {
    loading: backlogLoading,
    toggleBacklogStatus,
    deleteFromBacklog,
    fetchBacklog,
    getPending,
    getCompleted
  } = useBacklog();
  const { studies } = useStudies();

  const pendingItems = getPending();
  const completedItems = getCompleted();

  const handleModalClose = async () => {
    // Refetch backlog após modal fechar (em caso de novo item adicionado)
    await fetchBacklog();
    setShowAddStudyModal(false);
  };

  const getSourceStudy = (sourceId: string | null) => {
    if (!sourceId) return null;
    return studies.find((s) => s.id === sourceId);
  };

  const handleToggleStatus = async (itemId: string) => {
    try {
      const success = await toggleBacklogStatus(itemId);
      if (success) {
        toast.success("Status atualizado");
      } else {
        toast.error("Erro ao atualizar status.");
      }
    } catch (error) {
      console.error("[BACKLOG] handleToggleStatus ERROR:", error);
      toast.error("Erro ao atualizar status.");
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      const success = await deleteFromBacklog(itemId);
      if (success) {
        toast.success("Item removido do backlog");
      } else {
        toast.error("Erro ao remover item. Tente novamente.");
      }
    } catch (error) {
      console.error("[BACKLOG] handleRemoveItem ERROR:", error);
      toast.error("Erro ao remover item. Tente novamente.");
    }
  };

  const handleOpenStudy = (studyId: string | null) => {
    if (studyId) {
      router.push(`/estudo/${studyId}`);
    }
  };

  return (
    <aside className={cn("w-80 bg-ivory flex flex-col h-full border-l", PARCHMENT.border.default)}>
      {/* Header */}
      <div className={cn("p-4 border-b", PARCHMENT.border.default)}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookMarked className={cn("w-5 h-5", PARCHMENT.accent.text)} />
            <h2 className={cn("font-lora font-semibold", PARCHMENT.text.heading)}>Backlog de Estudos</h2>
          </div>
          <Badge variant="secondary" className="bg-warm-white border-linen text-walnut">{pendingItems.length}</Badge>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full border-linen text-stone hover:bg-cream hover:text-walnut"
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
            <Loader2 className={cn("w-6 h-6 animate-spin", PARCHMENT.accent.text)} />
            <span className={cn("ml-2", PARCHMENT.text.muted)}>Carregando...</span>
          </div>
        ) : pendingItems.length > 0 ? (
          <div className="p-3 space-y-2">
            <p className={cn("text-xs font-medium uppercase tracking-wider px-1", PARCHMENT.text.muted)}>
              Para Estudar ({pendingItems.length})
            </p>
            {pendingItems.map((item) => {
              const sourceStudy = getSourceStudy(item.source_study_id);
              return (
                <div
                  key={item.id}
                  onClick={() => handleOpenStudy(item.source_study_id)}
                  className="group rounded-lg p-3 transition-colors cursor-pointer bg-warm-white hover:bg-cream"
                >
                  <div className="flex items-start gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStatus(item.id);
                      }}
                      className="mt-0.5 w-5 h-5 rounded-full border-2 border-linen transition-colors flex-shrink-0 hover:border-amber"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={cn("font-medium text-sm truncate flex-1", PARCHMENT.text.heading)}>
                          {item.reference_label}
                        </p>
                        {sourceStudy && (
                          <StatusBadge status={sourceStudy.status} size="sm" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={cn("flex items-center gap-1 text-xs", PARCHMENT.text.muted)}>
                          <Clock className="w-3 h-3" />
                          <span>{formatRelativeDate(item.created_at)}</span>
                        </div>
                        {sourceStudy && (
                          <div className={cn("flex items-center gap-1 text-xs", PARCHMENT.accent.text)}>
                            <Link2 className="w-3 h-3" />
                            <span className="truncate max-w-[100px]">
                              {sourceStudy.title.split(" - ")[0]}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveItem(item.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 transition-all text-sand hover:text-red-600"
                      aria-label={`Deletar item ${item.reference_label} do backlog`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={cn("p-6 text-center", PARCHMENT.text.muted)}>
            <BookMarked className="w-10 h-10 mx-auto mb-2 text-linen" />
            <p className="text-sm">Nenhum item no backlog</p>
            <p className="text-xs mt-1">
              Use <kbd className="px-1 py-0.5 rounded bg-warm-white">/</kbd> no
              editor para adicionar
            </p>
          </div>
        )}

        {/* Completed Items */}
        {completedItems.length > 0 && (
          <div className={cn("p-3 border-t", PARCHMENT.border.default)}>
            <p className={cn("text-xs font-medium uppercase tracking-wider px-1 mb-2", PARCHMENT.text.muted)}>
              Concluídos ({completedItems.length})
            </p>
            {completedItems.map((item) => (
              <div
                key={item.id}
                className="group flex items-center gap-2 p-2 rounded-lg hover:bg-warm-white"
              >
                <button
                  onClick={() => handleToggleStatus(item.id)}
                  className="w-5 h-5 rounded-full bg-[#4A6741] text-white flex items-center justify-center flex-shrink-0"
                >
                  <Check className="w-3 h-3" />
                </button>
                <span className={cn("text-sm line-through truncate flex-1", PARCHMENT.text.muted)}>
                  {item.reference_label}
                </span>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-sand hover:text-red-600"
                  aria-label={`Deletar item concluído ${item.reference_label}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={cn("p-3 border-t", PARCHMENT.border.default)}>
        <button className={cn("w-full flex items-center justify-center gap-2 text-sm transition-colors py-2", PARCHMENT.text.secondary, "hover:text-amber")}>
          Ver Todos os Estudos
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Modal para criar estudo via backlog */}
      <BacklogAddStudyModal
        isOpen={showAddStudyModal}
        onClose={() => setShowAddStudyModal(false)}
        onSuccess={handleModalClose}
      />
    </aside>
  );
}
