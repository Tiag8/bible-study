"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BibleBook, formatRelativeDate } from "@/lib/mock-data";
import { useStudies, useTags } from "@/hooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

  // Generate chapters array
  const chapters = Array.from({ length: book.totalChapters }, (_, i) => i + 1);

  // Get studies for this book
  const bookStudies = getStudiesByBook(book.name);

  const getChapterStudy = (chapter: number) => {
    return bookStudies.find((s) => s.chapter_number === chapter);
  };

  // Helper para buscar cor da tag
  const getTagColor = (tagName: string): string => {
    const tag = availableTags.find((t) => t.name === tagName);
    if (!tag) return "#6b7280"; // gray-500 default

    const colorMap: Record<string, string> = {
      blue: "#3b82f6",
      purple: "#8b5cf6",
      green: "#22c55e",
      orange: "#f97316",
      pink: "#ec4899",
      cyan: "#06b6d4",
      red: "#ef4444",
      yellow: "#eab308",
      "dark-green": "#15803d",
    };

    return colorMap[tag.color] || "#6b7280";
  };

  // Calcular capítulos estudados dinamicamente
  const studiedChapters = bookStudies.map(s => s.chapter_number);

  // Deletar estudo
  const handleDelete = async (studyId: string, studyTitle: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevenir navegação do Link
    e.stopPropagation();

    if (!confirm(`Tem certeza que deseja deletar "${studyTitle}"?`)) {
      return;
    }

    setDeletingId(studyId);
    const success = await deleteStudy(studyId);

    if (!success) {
      alert('Erro ao deletar estudo. Tente novamente.');
    }
    setDeletingId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="ml-3 text-gray-500">Carregando...</span>
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
            <div className="p-2 bg-blue-50 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{book.name}</h1>
              <p className="text-sm text-gray-500">
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
          <span className="text-sm text-gray-500">Tags:</span>
          {book.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              #{tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Progress Bar */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Progresso Geral
          </span>
          <span className="text-sm font-bold text-blue-600">
            {Math.round(
              (studiedChapters.length / book.totalChapters) * 100
            )}
            %
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all"
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
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
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

            return (
              <div
                key={chapter}
                onClick={handleChapterClick}
                className={cn(
                  "relative aspect-square rounded-lg flex items-center justify-center",
                  "text-sm font-medium transition-all cursor-pointer",
                  "hover:scale-105 hover:shadow-md",
                  studyCount > 0
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-200 text-gray-700 hover:border-blue-300"
                )}
                title={
                  studyCount > 0
                    ? `${studyCount} estudo${studyCount !== 1 ? 's' : ''}`
                    : `Capítulo ${chapter}`
                }
              >
                {chapter}
                {hasMultiple && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
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
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Estudos Recentes
          </h2>
          <div className="space-y-3">
            {bookStudies.slice(0, 5).map((study) => (
              <div
                key={study.id}
                className="relative group"
              >
                {/* Linha vermelha do lado esquerdo (aparece no hover) */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-l-lg" />

                <div
                  onClick={() => router.push(`/estudo/${study.id}`)}
                  className="block bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-200 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900">
                          {study.title}
                        </h3>
                        <span className="text-xs text-gray-500">
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
                    <div className="flex flex-col items-end gap-2 ml-4">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{formatRelativeDate(study.updated_at)}</span>
                      </div>
                      <Badge
                        className={cn(
                          "text-white text-xs",
                          study.status === 'estudando' && "bg-blue-500",
                          study.status === 'revisando' && "bg-purple-500",
                          study.status === 'concluído' && "bg-green-500"
                        )}
                      >
                        {study.status === 'estudando' && 'Estudando'}
                        {study.status === 'revisando' && 'Revisando'}
                        {study.status === 'concluído' && 'Concluído'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Botão de deletar (aparece no hover) */}
                <button
                  onClick={(e) => handleDelete(study.id, study.title, e)}
                  disabled={deletingId === study.id}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                  title="Deletar estudo"
                >
                  {deletingId === study.id ? (
                    <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {bookStudies.length === 0 && (
        <div className="text-center py-8">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
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
    </div>
  );
}
