"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BibleBook, formatRelativeDate } from "@/lib/mock-data";
import { useStudies, useTags } from "@/hooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { TAG_COLORS, COLORS, BORDERS } from "@/lib/design-tokens";
import { getAggregatedChapterStatus } from "@/lib/utils";
import { StudySelectionModal } from "./StudySelectionModal";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Plus,
  Loader2,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ChapterViewProps {
  book: BibleBook;
  onBack: () => void;
}

export function ChapterView({ book, onBack }: ChapterViewProps) {
  const router = useRouter();

  // Hook Supabase
  const { loading, getStudiesByBook, getStudiesByChapter, deleteStudy } = useStudies();
  const { tags: availableTags } = useTags();

  // Modal state
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    chapter: number | null;
  }>({ isOpen: false, chapter: null });

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    studyId: string;
    studyTitle: string;
  }>({ isOpen: false, studyId: "", studyTitle: "" });

  // Generate chapters array
  const chapters = Array.from({ length: book.totalChapters }, (_, i) => i + 1);

  // Get studies for this book
  const bookStudies = getStudiesByBook(book.name);

  // Helper para buscar cor da tag
  const getTagColor = (tagName: string): string => {
    const tag = availableTags.find((t) => t.name === tagName);
    if (!tag) return "#6b7280"; // gray-500 default

    // Use centralized TAG_COLORS from design tokens
    return TAG_COLORS[tag.color] || "#6b7280";
  };

  // Calcular capítulos estudados dinamicamente
  const studiedChapters = bookStudies.map(s => s.chapter_number);

  // Abrir modal de confirmação
  const handleDeleteClick = (studyId: string, studyTitle: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmModal({ isOpen: true, studyId, studyTitle });
  };

  // Confirmar deleção
  const handleConfirmDelete = async () => {
    const { studyId } = confirmModal;
    setDeletingId(studyId);
    setConfirmModal({ isOpen: false, studyId: "", studyTitle: "" });

    const success = await deleteStudy(studyId);

    if (success) {
      toast.success('Estudo deletado com sucesso');
    } else {
      toast.error('Erro ao deletar estudo. Tente novamente.');
    }
    setDeletingId(null);
  };

  // Cancelar deleção
  const handleCancelDelete = () => {
    setConfirmModal({ isOpen: false, studyId: "", studyTitle: "" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        {/* TOKENS: COLORS.primary, COLORS.neutral */}
        <Loader2 className={cn("w-8 h-8 animate-spin", COLORS.primary.text)} />
        <span className={cn("ml-3", COLORS.neutral.text.muted)}>Carregando...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", COLORS.primary.light)}>
              <BookOpen className={cn("w-6 h-6", COLORS.primary.text)} />
            </div>
            <div>
              <h1 className={cn("text-2xl font-bold", COLORS.neutral.text.primary)}>{book.name}</h1>
              <p className={cn("text-sm", COLORS.neutral.text.muted)}>
                {studiedChapters.length} de {book.totalChapters} capítulos
                estudados
              </p>
            </div>
          </div>
        </div>
        <Badge variant={book.testament === "NT" ? "default" : "secondary"}>
          {book.testament === "NT" ? "Novo Testamento" : "Antigo Testamento"}
        </Badge>
      </div>

      {/* Tags */}
      {book.tags.length > 0 && (
        <div className="flex items-center gap-2">
          <span className={cn("text-sm", COLORS.neutral.text.muted)}>Tags:</span>
          {book.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              #{tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Progress Bar */}
      <div className={cn("bg-white rounded-lg p-4", BORDERS.gray)}>
        <div className="flex items-center justify-between mb-2">
          <span className={cn("text-sm font-medium", COLORS.neutral.text.secondary)}>
            Progresso Geral
          </span>
          <span className={cn("text-sm font-bold", COLORS.primary.text)}>
            {Math.round(
              (studiedChapters.length / book.totalChapters) * 100
            )}
            %
          </span>
        </div>
        <div className={cn("w-full rounded-full h-3", COLORS.neutral[100])}>
          <div
            className={cn("h-3 rounded-full transition-all", COLORS.primary.default)}
            style={{
              width: `${
                (studiedChapters.length / book.totalChapters) * 100
              }%`,
            }}
          />
        </div>
      </div>

      {/* Chapters Grid */}
      <div>
        <h2 className={cn("text-lg font-semibold mb-4", COLORS.neutral.text.primary)}>
          Capítulos
        </h2>
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
          {chapters.map((chapter) => {
            const chapterStudies = getStudiesByChapter(book.name, chapter);
            const studyCount = chapterStudies.length;
            const hasMultiple = studyCount >= 2;

            const handleChapterClick = () => {
              if (studyCount === 0) {
                // Nenhum estudo: criar novo
                router.push(`/estudo/new?book=${book.id}&chapter=${chapter}`);
              } else {
                // 1+ estudos: abrir modal para escolher ou criar novo
                setModalState({ isOpen: true, chapter });
              }
            };

            // Determinar cor baseado no percentual de conclusão
            let chapterBgColor = `bg-white ${BORDERS.gray}`;
            let chapterTextColor = COLORS.neutral.text.secondary;
            let hoverColor = 'hover:border-blue-300';
            let tooltipText = `Capítulo ${chapter}`;

            if (studyCount > 0) {
              const aggregated = getAggregatedChapterStatus(chapterStudies);
              chapterBgColor = aggregated.color;
              chapterTextColor = aggregated.textColor;
              hoverColor = '';

              // Melhorar tooltip com percentual de conclusão
              tooltipText = `${studyCount} estudo${studyCount !== 1 ? 's' : ''} (${aggregated.completionPercentage}%)`;
            }

            return (
              <div
                key={chapter}
                onClick={handleChapterClick}
                className={cn(
                  "relative aspect-square rounded-lg flex items-center justify-center",
                  "text-sm font-medium transition-all cursor-pointer",
                  "hover:scale-105 hover:shadow-md",
                  studyCount > 0
                    ? `${chapterBgColor} ${chapterTextColor}`
                    : `${chapterBgColor} ${chapterTextColor} ${hoverColor}`
                )}
                title={tooltipText}
              >
                {chapter}
                {hasMultiple && (
                  <span className={cn("absolute -top-1 -right-1 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center", COLORS.danger.default)}>
                    {studyCount}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Studies */}
      {bookStudies.length > 0 && (
        <div>
          <h2 className={cn("text-lg font-semibold mb-4", COLORS.neutral.text.primary)}>
            Estudos Recentes
          </h2>
          <div className="space-y-3">
            {bookStudies.slice(0, 5).map((study) => (
              <div
                key={study.id}
                className="relative group"
              >
                {/* Linha vermelha do lado esquerdo (aparece no hover) */}
                <div className={cn("absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity rounded-l-lg", COLORS.danger.default)} />

                <div
                  onClick={() => router.push(`/estudo/${study.id}`)}
                  className={cn("block bg-white rounded-lg p-4 transition-colors cursor-pointer", BORDERS.gray, "hover:border-blue-200")}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={cn("font-medium", COLORS.neutral.text.primary)}>
                          {study.title}
                        </h3>
                        <span className={cn("text-xs", COLORS.neutral.text.muted)}>
                          • Capítulo {study.chapter_number}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {study.tags.slice(0, 3).map((tagName) => {
                          const tagColor = getTagColor(tagName);
                          return (
                            <span
                              key={tagName}
                              className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium"
                              style={{
                                borderWidth: '1px',
                                borderStyle: 'solid',
                                borderColor: tagColor,
                                color: tagColor,
                                backgroundColor: 'transparent',
                              }}
                            >
                              #{tagName}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className={cn("flex items-center gap-1 text-xs", COLORS.neutral.text.muted)}>
                        <Clock className="w-3 h-3" />
                        <span>{formatRelativeDate(study.updated_at)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={study.status} />
                        <button
                          onClick={(e) => handleDeleteClick(study.id, study.title, e)}
                          disabled={deletingId === study.id}
                          className={cn("p-1.5 rounded-md", COLORS.danger.light, COLORS.danger.text, `hover:${COLORS.danger.lighter}`, "opacity-40 group-hover:opacity-100 transition-opacity disabled:opacity-50 flex items-center justify-center flex-shrink-0")}
                          aria-label="Deletar estudo"
                        >
                          {deletingId === study.id ? (
                            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {bookStudies.length === 0 && (
        <div className="text-center py-8">
          <BookOpen className={cn("w-12 h-12 mx-auto mb-3", COLORS.neutral[300])} />
          <p className={COLORS.neutral.text.muted}>
            Nenhum estudo criado para este livro ainda
          </p>
          <Button
            variant="default"
            className="mt-4"
            onClick={() => router.push(`/estudo/new?book=${book.id}&chapter=1`)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Primeiro Estudo
          </Button>
        </div>
      )}

      {/* Study Selection Modal */}
      {modalState.isOpen && modalState.chapter !== null && (
        <StudySelectionModal
          isOpen={modalState.isOpen}
          onClose={() => setModalState({ isOpen: false, chapter: null })}
          studies={getStudiesByChapter(book.name, modalState.chapter)}
          bookId={book.id}
          bookName={book.name}
          chapter={modalState.chapter}
        />
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        open={confirmModal.isOpen}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        title="Deletar Estudo"
        description={`Tem certeza que deseja deletar "${confirmModal.studyTitle}"? Esta ação não pode ser desfeita.`}
        confirmText="Deletar"
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>
  );
}
