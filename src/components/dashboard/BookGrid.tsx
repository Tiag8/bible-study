"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { COLORS } from "@/lib/design-tokens";
import { BibleBook } from "@/lib/mock-data";
import { BookCard } from "./BookCard";

interface BookGridProps {
  books: BibleBook[];
  searchQuery: string;
  selectedTags: string[];
  onBookClick: (bookId: string) => void;
}

export function BookGrid({
  books,
  searchQuery,
  selectedTags,
  onBookClick,
}: BookGridProps) {
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        book.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );

      // Tags filter
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.some((tag) => book.tags.includes(tag));

      return matchesSearch && matchesTags;
    });
  }, [books, searchQuery, selectedTags]);

  // Separate by testament
  const oldTestament = filteredBooks.filter((b) => b.testament === "AT");
  const newTestament = filteredBooks.filter((b) => b.testament === "NT");

  if (filteredBooks.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-16", COLORS.neutral.text.muted)}>
        <p className="text-lg">Nenhum livro encontrado</p>
        <p className="text-sm mt-1">
          Tente ajustar sua busca ou filtros
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* TOKENS: COLORS.primary, COLORS.neutral */}
      {/* Stats */}
      <div className={cn("flex items-center gap-4 text-sm", COLORS.neutral.text.secondary)}>
        <span>
          <strong className={COLORS.neutral.text.primary}>{filteredBooks.length}</strong> de{" "}
          {books.length} livros
        </span>
        <span className={COLORS.neutral[300]}>|</span>
        <span>
          <strong className={COLORS.neutral.text.primary}>
            {filteredBooks.reduce((acc, b) => acc + b.studiedChapters.length, 0)}
          </strong>{" "}
          capítulos estudados
        </span>
      </div>

      {/* Old Testament */}
      {oldTestament.length > 0 && (
        <section>
          <h2 className={cn("text-lg font-semibold mb-4 flex items-center gap-2", COLORS.neutral.text.primary)}>
            <span className={cn("w-2 h-2 rounded-full", COLORS.neutral[400])} />
            Antigo Testamento
            <span className={cn("text-sm font-normal", COLORS.neutral.text.muted)}>
              ({oldTestament.length} livros)
            </span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {oldTestament.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onClick={() => onBookClick(book.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* New Testament */}
      {newTestament.length > 0 && (
        <section>
          <h2 className={cn("text-lg font-semibold mb-4 flex items-center gap-2", COLORS.neutral.text.primary)}>
            <span className={cn("w-2 h-2 rounded-full", COLORS.primary.default)} />
            Novo Testamento
            <span className={cn("text-sm font-normal", COLORS.neutral.text.muted)}>
              ({newTestament.length} livros)
            </span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {newTestament.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onClick={() => onBookClick(book.id)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
