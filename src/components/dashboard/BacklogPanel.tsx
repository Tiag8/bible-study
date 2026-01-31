"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { PARCHMENT } from "@/lib/design-tokens";
import type { StudyStatus } from "@/lib/design-tokens";
import { formatRelativeDate } from "@/lib/mock-data";
import { useStudies } from "@/hooks";
import type { SortField, SortDirection } from "@/hooks";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { BacklogAddStudyModal } from "./BacklogAddStudyModal";
import {
  BookMarked,
  Plus,
  Clock,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  CalendarDays,
} from "lucide-react";

const STATUS_OPTIONS: { value: StudyStatus | 'todos'; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'estudar', label: 'Estudar' },
  { value: 'estudando', label: 'Estudando' },
  { value: 'revisando', label: 'Revisando' },
  { value: 'concluído', label: 'Concluído' },
];

export function BacklogPanel() {
  const router = useRouter();
  const [showAddStudyModal, setShowAddStudyModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StudyStatus | 'todos'>('todos');
  const [bookFilter, setBookFilter] = useState<string>('todos');
  const [sortField] = useState<SortField>('updated_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const {
    loading,
    filterStudies,
    sortStudies,
    booksWithStudies,
    fetchStudies,
  } = useStudies();

  const filteredAndSorted = useMemo(() => {
    const filtered = filterStudies(statusFilter, bookFilter);
    return sortStudies(filtered, sortField, sortDirection);
  }, [filterStudies, sortStudies, statusFilter, bookFilter, sortField, sortDirection]);

  const handleModalClose = async () => {
    await fetchStudies();
    setShowAddStudyModal(false);
  };

  const handleOpenStudy = (studyId: string) => {
    router.push(`/estudo/${studyId}`);
  };

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  return (
    <aside className={cn("w-80 bg-ivory flex flex-col h-full border-l", PARCHMENT.border.default)}>
      {/* Header */}
      <div className={cn("p-4 border-b", PARCHMENT.border.default)}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookMarked className={cn("w-5 h-5", PARCHMENT.accent.text)} />
            <h2 className={cn("font-lora font-semibold", PARCHMENT.text.heading)}>
              Quadro de Estudos
            </h2>
          </div>
          <span className={cn("text-xs px-2 py-1 rounded-full bg-warm-white border border-linen", PARCHMENT.text.muted)}>
            {filteredAndSorted.length}
          </span>
        </div>

        {/* Filtros */}
        <div className="space-y-2 mb-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StudyStatus | 'todos')}
            className={cn(
              "w-full px-3 py-1.5 text-sm rounded-md border bg-warm-white",
              PARCHMENT.border.default,
              PARCHMENT.text.primary
            )}
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <select
            value={bookFilter}
            onChange={(e) => setBookFilter(e.target.value)}
            className={cn(
              "w-full px-3 py-1.5 text-sm rounded-md border bg-warm-white",
              PARCHMENT.border.default,
              PARCHMENT.text.primary
            )}
          >
            <option value="todos">Todos os livros</option>
            {booksWithStudies.map(book => (
              <option key={book} value={book}>{book}</option>
            ))}
          </select>
        </div>

        {/* Ordenação + Adicionar */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-linen text-stone hover:bg-cream hover:text-walnut"
            onClick={toggleSortDirection}
            title={`Ordenar por data ${sortDirection === 'desc' ? 'mais recente' : 'mais antigo'}`}
          >
            {sortDirection === 'desc' ? (
              <ArrowDown className="w-4 h-4" />
            ) : (
              <ArrowUp className="w-4 h-4" />
            )}
            <ArrowUpDown className="w-3 h-3 ml-1" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-linen text-stone hover:bg-cream hover:text-walnut"
            onClick={() => setShowAddStudyModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Estudo
          </Button>
        </div>
      </div>

      {/* Lista de Estudos */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className={cn("w-6 h-6 animate-spin", PARCHMENT.accent.text)} />
            <span className={cn("ml-2", PARCHMENT.text.muted)}>Carregando...</span>
          </div>
        ) : filteredAndSorted.length > 0 ? (
          <div className="p-3 space-y-2">
            {filteredAndSorted.map((study) => (
              <div
                key={study.id}
                onClick={() => handleOpenStudy(study.id)}
                className="group rounded-lg p-3 transition-colors cursor-pointer bg-warm-white hover:bg-cream"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className={cn("font-medium text-sm truncate flex-1", PARCHMENT.text.heading)}>
                    {study.title || `${study.book_name} ${study.chapter_number}`}
                  </p>
                  <StatusBadge status={study.status} size="sm" />
                </div>
                <div className="flex items-center gap-3">
                  <div className={cn("flex items-center gap-1 text-xs", PARCHMENT.text.muted)}>
                    <Clock className="w-3 h-3" />
                    <span>{formatRelativeDate(study.created_at)}</span>
                  </div>
                  {study.status === 'concluído' && study.completed_at ? (
                    <div className={cn("flex items-center gap-1 text-xs", PARCHMENT.status.done.text)}>
                      <CalendarDays className="w-3 h-3" />
                      <span>{formatRelativeDate(study.completed_at)}</span>
                    </div>
                  ) : study.updated_at !== study.created_at ? (
                    <div className={cn("flex items-center gap-1 text-xs", PARCHMENT.accent.text)}>
                      <CalendarDays className="w-3 h-3" />
                      <span>{formatRelativeDate(study.updated_at)}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={cn("p-6 text-center", PARCHMENT.text.muted)}>
            <BookMarked className="w-10 h-10 mx-auto mb-2 text-linen" />
            <p className="text-sm">Nenhum estudo encontrado</p>
            <p className="text-xs mt-1">
              {statusFilter !== 'todos' || bookFilter !== 'todos'
                ? 'Tente ajustar os filtros'
                : 'Clique em "Adicionar Estudo" para começar'}
            </p>
          </div>
        )}
      </div>

      {/* Modal para criar estudo */}
      <BacklogAddStudyModal
        isOpen={showAddStudyModal}
        onClose={() => setShowAddStudyModal(false)}
        onSuccess={handleModalClose}
      />
    </aside>
  );
}
