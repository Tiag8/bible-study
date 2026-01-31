"use client";

import { BibleBook, formatRelativeDate } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { PARCHMENT, SHADOW_WARM } from "@/lib/design-tokens";

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
        "bg-cream rounded-xl p-5 border transition-all cursor-pointer",
        PARCHMENT.border.default,
        SHADOW_WARM.sm,
        hasStudies
          ? "hover:border-amber-light"
          : "opacity-75 hover:border-amber-light/50",
        "hover:translate-y-[-2px]"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "p-2 rounded-lg",
              hasStudies ? PARCHMENT.accent.light : "bg-warm-white"
            )}
          >
            <BookOpen
              className={cn(
                "w-5 h-5",
                hasStudies ? PARCHMENT.accent.text : PARCHMENT.text.muted
              )}
            />
          </div>
          <div>
            <h3 className={cn("font-lora font-semibold", PARCHMENT.text.heading)}>{book.name}</h3>
            <p className={cn("text-xs", PARCHMENT.text.muted)}>
              {book.totalChapters} capítulos
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "text-xs border-linen",
            book.testament === "NT" ? PARCHMENT.status.studying.text : PARCHMENT.text.secondary
          )}
        >
          {book.testament}
        </Badge>
      </div>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className={PARCHMENT.text.secondary}>
            {book.studiedChapters.length} de {book.totalChapters} estudados
          </span>
          <span className={cn("font-medium", PARCHMENT.text.heading)}>
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full rounded-full h-2 bg-linen">
          <div
            className={cn(
              "h-2 rounded-full transition-all",
              progress === 100
                ? "bg-[#4A6741]"
                : progress > 0
                ? "bg-amber"
                : "bg-linen"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Tags */}
      {book.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {book.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className={cn("text-xs border-linen", PARCHMENT.text.secondary)}>
              #{tag}
            </Badge>
          ))}
          {book.tags.length > 3 && (
            <Badge variant="outline" className={cn("text-xs border-linen", PARCHMENT.text.muted)}>
              +{book.tags.length - 3}
            </Badge>
          )}
        </div>
      )}

      {/* Last Update */}
      <div className={cn("flex items-center gap-1.5 text-xs", PARCHMENT.text.muted)}>
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
