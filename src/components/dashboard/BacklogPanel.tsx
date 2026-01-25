"use client";

import { useState } from "react";
import { formatRelativeDate } from "@/lib/mock-data";
import { useBacklog, useStudies } from "@/hooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReference, setNewReference] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Hooks Supabase
  const {
    loading: backlogLoading,
    addToBacklog,
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

  const handleAddItem = async () => {
    if (newReference.trim()) {
      setIsAdding(true);
      await addToBacklog(newReference.trim());
      setNewReference("");
      setShowAddForm(false);
      setIsAdding(false);
    }
  };

  const handleToggleStatus = async (itemId: string) => {
    await toggleBacklogStatus(itemId);
  };

  const handleRemoveItem = async (itemId: string) => {
    await deleteFromBacklog(itemId);
  };

  return (
    <aside className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-gray-900">Backlog de Estudos</h2>
          </div>
          <Badge variant="secondary">{pendingItems.length}</Badge>
        </div>

        {!showAddForm ? (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Estudo
          </Button>
        ) : (
          <div className="space-y-2">
            <Input
              placeholder="Ex: Êxodo 20 ou Mateus 5-7"
              value={newReference}
              onChange={(e) => setNewReference(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddItem();
                if (e.key === "Escape") {
                  setShowAddForm(false);
                  setNewReference("");
                }
              }}
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                className="flex-1"
                onClick={handleAddItem}
                disabled={!newReference.trim() || isAdding}
              >
                {isAdding ? "Adicionando..." : "Adicionar"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAddForm(false);
                  setNewReference("");
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Pending Items */}
      <div className="flex-1 overflow-y-auto">
        {backlogLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            <span className="ml-2 text-gray-500">Carregando...</span>
          </div>
        ) : pendingItems.length > 0 ? (
          <div className="p-3 space-y-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider px-1">
              Para Estudar ({pendingItems.length})
            </p>
            {pendingItems.map((item) => {
              const sourceStudy = getSourceStudy(item.source_study_id);
              return (
                <div
                  key={item.id}
                  className="group bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <button
                      onClick={() => handleToggleStatus(item.id)}
                      className="mt-0.5 w-5 h-5 rounded-full border-2 border-gray-300 hover:border-blue-500 transition-colors flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => onStudyClick?.(item.reference_label)}
                        className="text-left w-full"
                      >
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {item.reference_label}
                        </p>
                      </button>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{formatRelativeDate(item.created_at)}</span>
                        </div>
                        {sourceStudy && (
                          <div className="flex items-center gap-1 text-xs text-blue-600">
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
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            <BookMarked className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Nenhum item no backlog</p>
            <p className="text-xs mt-1">
              Use <kbd className="px-1 py-0.5 bg-gray-100 rounded">/</kbd> no
              editor para adicionar
            </p>
          </div>
        )}

        {/* Completed Items */}
        {completedItems.length > 0 && (
          <div className="p-3 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider px-1 mb-2">
              Concluídos ({completedItems.length})
            </p>
            {completedItems.map((item) => (
              <div
                key={item.id}
                className="group flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50"
              >
                <button
                  onClick={() => handleToggleStatus(item.id)}
                  className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0"
                >
                  <Check className="w-3 h-3" />
                </button>
                <span className="text-sm text-gray-500 line-through truncate flex-1">
                  {item.reference_label}
                </span>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500"
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
        <button className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors py-2">
          Ver Todos os Estudos
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
