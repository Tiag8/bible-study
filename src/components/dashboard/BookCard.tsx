"use client";

import { BibleBook, formatRelativeDate } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { COLORS } from "@/lib/design-tokens";

interface BookCardProps {
  book: BibleBook;
  onClick: () => void;
}

export function BookCard({ book, onClick }: BookCardProps) {
  const progress =
    book.totalChapters > 0
      ? (book.studiedChapters.length / book.totalChapters) * 100
      : 0;
  const hasStudies = book.studiedChapters.length > 0;

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-xl p-5 border transition-all cursor-pointer",
        "hover:shadow-md",
        hasStudies ? `border-gray-200 ${COLORS.primary.text} hover:border-blue-200` : `border-gray-100 opacity-75 ${COLORS.neutral[100]} hover:border-gray-200`
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "p-2 rounded-lg",
              hasStudies ? COLORS.primary.light : COLORS.neutral[50]
            )}
          >
            <BookOpen
              className={cn(
                "w-5 h-5",
                hasStudies ? COLORS.primary.text : COLORS.neutral.text.light
              )}
            />
          </div>
          <div>
            <h3 className={cn("font-semibold", COLORS.neutral.text.primary)}>{book.name}</h3>
            <p className={cn("text-xs", COLORS.neutral.text.muted)}>
              {book.totalChapters} capítulos
            </p>
          </div>
        </div>
        <Badge variant={book.testament === "NT" ? "default" : "secondary"}>
          {book.testament}
        </Badge>
      </div>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-600">
            {book.studiedChapters.length} de {book.totalChapters} estudados
          </span>
          <span className="font-medium text-gray-900">
            {Math.round(progress)}%
          </span>
        </div>
        <div className={cn("w-full rounded-full h-2", COLORS.neutral[100])}>
          <div
            className={cn(
              "h-2 rounded-full transition-all",
              progress === 100
                ? COLORS.success.default
                : progress > 0
                ? COLORS.primary.default
                : COLORS.neutral[200]
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Tags */}
      {book.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {book.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              #{tag}
            </Badge>
          ))}
          {book.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{book.tags.length - 3}
            </Badge>
          )}
        </div>
      )}

      {/* Last Update */}
      <div className={cn("flex items-center gap-1.5 text-xs", COLORS.neutral.text.muted)}>
        <Clock className="w-3.5 h-3.5" />
        <span>
          {book.lastUpdate
            ? `Atualizado ${formatRelativeDate(book.lastUpdate)}`
            : "Nenhum estudo ainda"}
        </span>
      </div>
    </div>
  );
}
