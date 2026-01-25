"use client";

import { BibleBook, formatRelativeDate } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

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
        "hover:shadow-md hover:border-blue-200",
        hasStudies ? "border-gray-200" : "border-gray-100 opacity-75"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "p-2 rounded-lg",
              hasStudies ? "bg-blue-50" : "bg-gray-50"
            )}
          >
            <BookOpen
              className={cn(
                "w-5 h-5",
                hasStudies ? "text-blue-600" : "text-gray-400"
              )}
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{book.name}</h3>
            <p className="text-xs text-gray-500">
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
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className={cn(
              "h-2 rounded-full transition-all",
              progress === 100
                ? "bg-green-500"
                : progress > 0
                ? "bg-blue-500"
                : "bg-gray-200"
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
      <div className="flex items-center gap-1.5 text-xs text-gray-500">
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
