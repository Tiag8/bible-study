"use client";

import Link from "next/link";
import { BibleBook, mockStudies, formatRelativeDate } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  BookOpen,
  Check,
  Clock,
  Edit3,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChapterViewProps {
  book: BibleBook;
  onBack: () => void;
}

export function ChapterView({ book, onBack }: ChapterViewProps) {
  // Generate chapters array
  const chapters = Array.from({ length: book.totalChapters }, (_, i) => i + 1);

  // Get studies for this book
  const bookStudies = mockStudies.filter((s) => s.book === book.name);

  const getChapterStudy = (chapter: number) => {
    return bookStudies.find((s) => s.chapter === chapter);
  };

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
                {book.studiedChapters.length} de {book.totalChapters} capítulos
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
              (book.studiedChapters.length / book.totalChapters) * 100
            )}
            %
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all"
            style={{
              width: `${
                (book.studiedChapters.length / book.totalChapters) * 100
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
            const isStudied = book.studiedChapters.includes(chapter);
            const study = getChapterStudy(chapter);
            const studyId = `${book.id}-${chapter}`;

            return (
              <Link
                key={chapter}
                href={`/estudo/${studyId}`}
                className={cn(
                  "relative aspect-square rounded-lg flex items-center justify-center",
                  "text-sm font-medium transition-all",
                  "hover:scale-105 hover:shadow-md",
                  isStudied
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-200 text-gray-700 hover:border-blue-300"
                )}
                title={
                  study
                    ? `${study.title} - ${
                        study.status === "completed" ? "Concluído" : "Rascunho"
                      }`
                    : `Capítulo ${chapter}`
                }
              >
                {chapter}
                {isStudied && (
                  <Check className="w-3 h-3 absolute top-1 right-1" />
                )}
              </Link>
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
                className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-200 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "p-2 rounded-lg",
                        study.status === "completed"
                          ? "bg-green-50"
                          : "bg-amber-50"
                      )}
                    >
                      {study.status === "completed" ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Edit3 className="w-4 h-4 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {study.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {study.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{formatRelativeDate(study.updated_at)}</span>
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
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            Nenhum estudo criado para este livro ainda
          </p>
          <Button variant="default" className="mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Criar Primeiro Estudo
          </Button>
        </div>
      )}
    </div>
  );
}
