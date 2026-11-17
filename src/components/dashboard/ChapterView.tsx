"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BibleBook, formatRelativeDate } from "@/lib/mock-data";
import { useStudies, useTags } from "@/hooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { TagChip } from "@/components/ui/tag-chip";
import { PARCHMENT } from "@/lib/design-tokens";
import { STATUS_ORDER, STATUS_THEME } from "@/lib/theme-colors";
import { getAggregatedChapterStatus } from "@/lib/utils";
import { StudySelectionModal } from "./StudySelectionModal";
import { ScheduleReviewButton } from "./ScheduleReviewButton";
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

  // Chave de cor da tag (useTags); sem a tag, o chip fica neutro
  const getTagColorKey = (tagName: string): string | null =>
    availableTags.find((t) => t.name === tagName)?.color ?? null;

  // Calcular capítulos estudados dinamicamente (usando Set para remover duplicatas)
  const studiedChapters = [...new Set(bookStudies.map(s => s.chapter_number))];

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
        <Loader2 className={cn("w-8 h-8 animate-spin", PARCHMENT.accent.text)} />
        <span className={cn("ml-3", PARCHMENT.text.muted)}>Carregando...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 md:gap-4 min-w-0">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", PARCHMENT.accent.light)}>
              <BookOpen className={cn("w-6 h-6", PARCHMENT.accent.text)} />
            </div>
            <div>
              <h1 className={cn("text-xl md:text-2xl font-lora font-bold", PARCHMENT.text.heading)}>{book.name}</h1>
              <p className={cn("text-sm", PARCHMENT.text.muted)}>
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
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("text-sm", PARCHMENT.text.muted)}>Tags:</span>
          {book.tags.map((tag) => (
            <TagChip key={tag} name={tag} colorKey={getTagColorKey(tag)} />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      <div className={cn("bg-cream rounded-lg p-4 border", PARCHMENT.border.default)}>
        <div className="flex items-center justify-between mb-2">
          <span className={cn("text-sm font-medium", PARCHMENT.text.secondary)}>
            Progresso Geral
          </span>
          <span className={cn("text-sm font-bold", PARCHMENT.accent.textDark)}>
            {Math.round(
              (studiedChapters.length / book.totalChapters) * 100
            )}
            %
          </span>
        </div>
        <div className="w-full rounded-full h-3 bg-linen">
          <div
            className="h-3 rounded-full transition-all bg-amber"
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
        <h2 className={cn("text-lg font-lora font-semibold mb-4", PARCHMENT.text.heading)}>
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

            // Status do capítulo: getAggregatedChapterStatus escolhe o mais urgente entre os estudos
            const aggregated = studyCount > 0 ? getAggregatedChapterStatus(chapterStudies) : null;
            const theme = aggregated && aggregated.status !== "vazio" ? STATUS_THEME[aggregated.status] : null;
            const StatusIcon = theme?.icon;

            const tooltipText = aggregated
              ? `${studyCount} estudo${studyCount !== 1 ? "s" : ""} (${aggregated.completionPercentage}% concluído${studyCount !== 1 ? "s" : ""})`
              : `Capítulo ${chapter}: criar estudo`;
            const ariaLabel = theme
              ? `Capítulo ${chapter}: ${theme.label}${hasMultiple ? `, ${studyCount} estudos` : ""}`
              : `Capítulo ${chapter}: sem estudo`;

            return (
              <button
                type="button"
                key={chapter}
                onClick={handleChapterClick}
                className={cn(
                  "relative aspect-square min-h-[44px] min-w-[44px] rounded-lg border flex flex-col items-center justify-center gap-0.5 text-sm font-medium transition-all cursor-pointer hover:scale-105 hover:shadow-md",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-dark focus-visible:ring-offset-2 focus-visible:ring-offset-parchment",
                  !theme && "bg-cream border-linen text-walnut hover:border-amber-dark"
                )}
                style={
                  theme
                    ? {
                        backgroundColor: theme.fill,
                        color: theme.ink,
                        borderColor: theme.border,
                        borderStyle: theme.borderStyle,
                      }
                    : undefined
                }
                title={tooltipText}
                aria-label={ariaLabel}
              >
                <span>{chapter}</span>
                {StatusIcon && <StatusIcon className="w-3 h-3" aria-hidden="true" />}
                {hasMultiple && (
                  <span
                    className="absolute -top-1 -right-1 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center bg-amber-dark"
                    aria-hidden="true"
                  >
                    {studyCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Legenda dos status (a cor nunca é a única pista: ícone e nome) */}
        <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2" aria-label="Legenda dos status">
          {STATUS_ORDER.map((status) => {
            const legend = STATUS_THEME[status];
            const LegendIcon = legend.icon;
            return (
              <li key={status} className="flex items-center gap-1.5 text-xs text-walnut">
                <span
                  className="inline-flex h-5 w-5 items-center justify-center rounded border"
                  style={{
                    backgroundColor: legend.fill,
                    color: legend.ink,
                    borderColor: legend.border,
                    borderStyle: legend.borderStyle,
                  }}
                  aria-hidden="true"
                >
                  <LegendIcon className="h-3 w-3" />
                </span>
                {legend.label}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Recent Studies */}
      {bookStudies.length > 0 && (
        <div>
          <h2 className={cn("text-lg font-lora font-semibold mb-4", PARCHMENT.text.heading)}>
            Estudos Recentes
          </h2>
          <ul className="space-y-3">
            {bookStudies.slice(0, 5).map((study) => (
              <li
                key={study.id}
                className={cn(
                  "group relative rounded-lg border bg-cream p-4 transition-colors",
                  PARCHMENT.border.default,
                  "hover:border-amber-dark focus-within:border-amber-dark"
                )}
              >
                <div className="flex items-start gap-2 md:items-center md:gap-4">
                  {/* Celular: título, depois status/capítulo/data, depois tags. Do md para cima: uma linha só */}
                  <div className="min-w-0 flex-1 md:flex md:items-center md:gap-3">
                    <h3 className={cn("font-medium line-clamp-2 md:line-clamp-1 md:min-w-0 md:flex-1", PARCHMENT.text.heading)}>
                      {/* O link cobre a linha inteira (after:inset-0); os botões ficam por cima com z-10 */}
                      <Link
                        href={`/estudo/${study.id}`}
                        className="rounded-lg outline-none after:absolute after:inset-0 after:rounded-lg after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-amber-dark"
                      >
                        {study.title}
                      </Link>
                    </h3>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-walnut md:mt-0 md:shrink-0 md:flex-nowrap">
                      <StatusBadge status={study.status} />
                      <span>Capítulo {study.chapter_number}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" aria-hidden="true" />
                        {formatRelativeDate(study.updated_at)}
                      </span>
                      <span className="relative z-10 empty:hidden">
                        <ScheduleReviewButton study={study} />
                      </span>
                    </div>
                    {study.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap items-center gap-1.5 md:mt-0 md:max-w-[40%] md:shrink-0">
                        {study.tags.slice(0, 3).map((tagName) => (
                          <TagChip key={tagName} name={tagName} colorKey={getTagColorKey(tagName)} />
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteClick(study.id, study.title, e)}
                    disabled={deletingId === study.id}
                    className="relative z-10 -mr-2 -mt-2 md:m-0 p-1.5 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 rounded-md bg-red-50 text-red-700 hover:bg-red-100 md:opacity-40 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity disabled:opacity-50 flex items-center justify-center flex-shrink-0"
                    aria-label={`Deletar estudo ${study.title}`}
                  >
                    {deletingId === study.id ? (
                      <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Empty State */}
      {bookStudies.length === 0 && (
        <div className="text-center py-8">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-linen" />
          <p className={PARCHMENT.text.muted}>
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
        description={`"${confirmModal.studyTitle}" vai para a lixeira. Você pode restaurar depois.`}
        confirmText="Deletar"
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>
  );
}
