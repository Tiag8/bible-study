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
import { PARCHMENT } from '@/lib/design-tokens';
import { useStudies } from '@/hooks';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';

interface BacklogAddStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => Promise<void>;
}

export function BacklogAddStudyModal({ isOpen, onClose, onSuccess }: BacklogAddStudyModalProps) {
  const { createStudy } = useStudies();

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedBook, setSelectedBook] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [bookSearchTerm, setBookSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const bookObject = mockBibleBooks.find((b) => b.id === selectedBook);
  const chapters = bookObject
    ? Array.from({ length: bookObject.totalChapters }, (_, i) => i + 1)
    : [];

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

      await createStudy(book.name, parseInt(selectedChapter));
      toast.success(`Estudo criado: ${book.name} ${selectedChapter}`);

      if (onSuccess) {
        await onSuccess();
      }
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
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto bg-ivory border-linen">
        <DialogHeader>
          <DialogTitle>Criar Novo Estudo</DialogTitle>
          <DialogDescription>
            {step === 1
              ? 'Etapa 1 de 2: Selecione o livro'
              : 'Etapa 2 de 2: Selecione o capítulo'}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <div className="relative">
              <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4", PARCHMENT.text.muted)} />
              <Input
                placeholder="Buscar livro..."
                value={bookSearchTerm}
                onChange={(e) => setBookSearchTerm(e.target.value)}
                className="pl-10 bg-warm-white border-linen placeholder:text-sand"
              />
            </div>

            <div className="border border-linen rounded-lg max-h-64 overflow-y-auto">
              {filteredBooks.length > 0 ? (
                filteredBooks.map((book) => (
                  <button
                    key={book.id}
                    onClick={() => handleSelectBook(book.id)}
                    className={cn(
                      'w-full text-left px-4 py-3 border-b border-linen transition-colors',
                      selectedBook === book.id
                        ? 'bg-amber text-white'
                        : 'hover:bg-warm-white'
                    )}
                  >
                    <p className="font-medium text-sm">{book.name}</p>
                    <p className="text-xs opacity-75">
                      {book.totalChapters} capítulos
                    </p>
                  </button>
                ))
              ) : (
                <div className={cn('p-4 text-center text-sm', PARCHMENT.text.muted)}>
                  Nenhum livro encontrado
                </div>
              )}
            </div>

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

        {step === 2 && bookObject && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-warm-white border border-linen">
              <p className={cn('text-sm', PARCHMENT.text.muted)}>
                Livro selecionado:
              </p>
              <p className={cn('font-lora font-semibold', PARCHMENT.text.heading)}>
                {bookObject.name}
              </p>
            </div>

            <div>
              <p className={cn('text-sm mb-2', PARCHMENT.text.muted)}>
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
                        ? 'bg-amber text-white'
                        : 'bg-warm-white border border-linen hover:border-amber-light'
                    )}
                  >
                    {chapter}
                  </button>
                ))}
              </div>
            </div>

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
