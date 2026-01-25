"use client";

import { useMemo } from "react";
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
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <p className="text-lg">Nenhum livro encontrado</p>
        <p className="text-sm mt-1">
          Tente ajustar sua busca ou filtros
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <span>
          <strong className="text-gray-900">{filteredBooks.length}</strong> de{" "}
          {books.length} livros
        </span>
        <span className="text-gray-300">|</span>
        <span>
          <strong className="text-gray-900">
            {filteredBooks.reduce((acc, b) => acc + b.studiedChapters.length, 0)}
          </strong>{" "}
          capítulos estudados
        </span>
      </div>

      {/* Old Testament */}
      {oldTestament.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gray-400" />
            Antigo Testamento
            <span className="text-sm font-normal text-gray-500">
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
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Novo Testamento
            <span className="text-sm font-normal text-gray-500">
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
