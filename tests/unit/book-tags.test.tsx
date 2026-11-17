import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BookGrid } from '@/components/dashboard/BookGrid';
import { mockBibleBooks, getBookTagsFromStudies, type BibleBook } from '@/lib/mock-data';

/**
 * Filtro de tags do dashboard: os livros não têm tags fixas (mock-data tem tags: []),
 * então as tags de cada livro vêm dos estudos do usuário. Replica o enriquecimento
 * feito em DashboardClient.tsx.
 */
type StudyLike = { book_name: string; chapter_number: number; tags: string[] | null };

function enrichBooks(studies: StudyLike[]): BibleBook[] {
  return mockBibleBooks.map((book) => {
    const bookStudies = studies.filter((s) => s.book_name === book.name);
    return {
      ...book,
      studiedChapters: [...new Set(bookStudies.map((s) => s.chapter_number))],
      tags: getBookTagsFromStudies(bookStudies),
    };
  });
}

const studies: StudyLike[] = [
  { book_name: 'Gênesis', chapter_number: 1, tags: ['Criação', 'Fé'] },
  { book_name: 'Gênesis', chapter_number: 2, tags: ['Fé'] },
  { book_name: 'Rute', chapter_number: 1, tags: ['Amor'] },
  { book_name: 'João', chapter_number: 3, tags: ['Fé', 'Salvação'] },
  { book_name: 'Salmos', chapter_number: 23, tags: [] },
];

describe('getBookTagsFromStudies', () => {
  it('retorna array vazio sem estudos', () => {
    expect(getBookTagsFromStudies([])).toEqual([]);
  });

  it('junta as tags dos estudos sem repetir, na ordem em que aparecem', () => {
    expect(
      getBookTagsFromStudies([{ tags: ['Criação', 'Fé'] }, { tags: ['Fé', 'Lei'] }])
    ).toEqual(['Criação', 'Fé', 'Lei']);
  });

  it('ignora estudos sem tags (vazio, null ou ausente)', () => {
    expect(getBookTagsFromStudies([{ tags: [] }, { tags: null }, {}, { tags: ['Graça'] }])).toEqual(['Graça']);
  });
});

describe('BookGrid com filtro de tags', () => {
  const books = enrichBooks(studies);

  it('sem tag selecionada mostra os 66 livros', () => {
    render(<BookGrid books={books} searchQuery="" selectedTags={[]} onBookClick={vi.fn()} />);
    expect(screen.getByText('66')).toBeInTheDocument();
  });

  it('com uma tag mostra só os livros que têm estudo com aquela tag', () => {
    render(<BookGrid books={books} searchQuery="" selectedTags={['Fé']} onBookClick={vi.fn()} />);
    expect(screen.getByRole('button', { name: /^Gênesis/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^João/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Rute/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Salmos/ })).not.toBeInTheDocument();
    expect(screen.queryByText('Nenhum livro encontrado')).not.toBeInTheDocument();
  });

  it('com várias tags mostra os livros que têm pelo menos uma delas', () => {
    render(<BookGrid books={books} searchQuery="" selectedTags={['Amor', 'Salvação']} onBookClick={vi.fn()} />);
    expect(screen.getByRole('button', { name: /^Rute/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^João/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Gênesis/ })).not.toBeInTheDocument();
  });

  it('tag que nenhum estudo usa esvazia a grade', () => {
    render(<BookGrid books={books} searchQuery="" selectedTags={['Profecia']} onBookClick={vi.fn()} />);
    expect(screen.getByText('Nenhum livro encontrado')).toBeInTheDocument();
  });
});
