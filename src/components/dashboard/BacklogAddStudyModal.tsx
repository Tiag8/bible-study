'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockBibleBooks } from '@/lib/mock-data';
import { COLORS, BORDERS } from '@/lib/design-tokens';
import { useStudies, useBacklog } from '@/hooks';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';

interface BacklogAddStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BacklogAddStudyModal({ isOpen, onClose }: BacklogAddStudyModalProps) {
  const { createStudy } = useStudies();
  const { addToBacklog } = useBacklog();

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedBook, setSelectedBook] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [bookSearchTerm, setBookSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Get selected book object to find chapter count
  const bookObject = mockBibleBooks.find((b) => b.id === selectedBook);
  const chapters = bookObject
    ? Array.from({ length: bookObject.totalChapters }, (_, i) => i + 1)
    : [];

  // Filter books based on search term
  const filteredBooks = mockBibleBooks.filter((book) =>
    book.name.toLowerCase().includes(bookSearchTerm.toLowerCase())
  );

  const handleReset = () => {
    setStep(1);
    setSelectedBook('');
    setSelectedChapter('');
    setBookSearchTerm('');
    setIsLoading(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSelectBook = (bookId: string) => {
    setSelectedBook(bookId);
    setBookSearchTerm('');
  };

  const handleNextStep = () => {
    if (!selectedBook) {
      toast.error('Por favor, selecione um livro');
      return;
    }
    setStep(2);
    setSelectedChapter('');
  };

  const handleSelectChapter = (chapter: number) => {
    setSelectedChapter(String(chapter));
  };

  const handleCreate = async () => {
    if (!selectedBook || !selectedChapter) {
      toast.error('Por favor, complete todos os campos');
      return;
    }

    setIsLoading(true);
    try {
      const book = mockBibleBooks.find((b) => b.id === selectedBook);
      if (!book) {
        toast.error('Livro não encontrado');
        return;
      }

      // Create study with status 'estudar' (empty study from backlog)
      const newStudy = await createStudy(book.name, parseInt(selectedChapter));

      // Add to backlog list
      await addToBacklog(
        `${book.name} ${selectedChapter}`,
        newStudy.id
      );

      toast.success(`Estudo criado: ${book.name} ${selectedChapter}`);
      handleClose();
    } catch (error) {
      console.error('[BACKLOG_MODAL] Create error:', error);
      toast.error('Erro ao criar estudo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Estudo</DialogTitle>
          <DialogDescription>
            {step === 1
              ? 'Etapa 1 de 2: Selecione o livro'
              : 'Etapa 2 de 2: Selecione o capítulo'}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Book Selection */}
        {step === 1 && (
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar livro..."
                value={bookSearchTerm}
                onChange={(e) => setBookSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Book List */}
            <div className={cn('border rounded-lg max-h-64 overflow-y-auto', BORDERS.gray)}>
              {filteredBooks.length > 0 ? (
                filteredBooks.map((book) => (
                  <button
                    key={book.id}
                    onClick={() => handleSelectBook(book.id)}
                    className={cn(
                      'w-full text-left px-4 py-3 border-b transition-colors',
                      selectedBook === book.id
                        ? `${COLORS.primary.default} text-white`
                        : `hover:${COLORS.neutral[50]}`
                    )}
                  >
                    <p className="font-medium text-sm">{book.name}</p>
                    <p className="text-xs opacity-75">
                      {book.totalChapters} capítulos
                    </p>
                  </button>
                ))
              ) : (
                <div className={cn('p-4 text-center text-sm', COLORS.neutral.text.muted)}>
                  Nenhum livro encontrado
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={handleNextStep}
                disabled={!selectedBook}
              >
                Próximo
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Chapter Selection */}
        {step === 2 && bookObject && (
          <div className="space-y-4">
            {/* Selected Book Info */}
            <div className={cn('p-3 rounded-lg', COLORS.neutral[50], BORDERS.gray)}>
              <p className={cn('text-sm', COLORS.neutral.text.muted)}>
                Livro selecionado:
              </p>
              <p className={cn('font-semibold', COLORS.neutral.text.primary)}>
                {bookObject.name}
              </p>
            </div>

            {/* Chapter Grid */}
            <div>
              <p className={cn('text-sm mb-2', COLORS.neutral.text.muted)}>
                Selecione o capítulo:
              </p>
              <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
                {chapters.map((chapter) => (
                  <button
                    key={chapter}
                    onClick={() => handleSelectChapter(chapter)}
                    className={cn(
                      'aspect-square rounded text-sm font-medium transition-all',
                      selectedChapter === String(chapter)
                        ? `${COLORS.primary.default} text-white`
                        : `${COLORS.neutral[50]} border ${BORDERS.gray} hover:border-blue-300`
                    )}
                  >
                    {chapter}
                  </button>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setStep(1);
                  setSelectedChapter('');
                }}
                disabled={isLoading}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <Button
                className="flex-1"
                onClick={handleCreate}
                disabled={!selectedChapter || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  'Criar'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
