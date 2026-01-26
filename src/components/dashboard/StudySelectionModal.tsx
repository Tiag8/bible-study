'use client';

import { useRouter } from 'next/navigation';
import type { StudySummary } from '@/hooks/useStudies';
import { formatRelativeDate } from '@/lib/mock-data';
import { useTags } from '@/hooks';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock, FileText } from 'lucide-react';

interface StudySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  studies: StudySummary[];
  bookId: string;
  bookName: string;
  chapter: number;
}

export function StudySelectionModal({
  isOpen,
  onClose,
  studies,
  bookId,
  bookName,
  chapter,
}: StudySelectionModalProps) {
  const router = useRouter();
  const { tags: availableTags } = useTags();

  // Helper para buscar cor da tag
  const getTagColor = (tagName: string): string => {
    const tag = availableTags.find((t) => t.name === tagName);
    if (!tag) return '#6b7280'; // gray-500 default

    const colorMap: Record<string, string> = {
      blue: '#3b82f6',
      purple: '#8b5cf6',
      green: '#22c55e',
      orange: '#f97316',
      pink: '#ec4899',
      cyan: '#06b6d4',
      red: '#ef4444',
      yellow: '#eab308',
      'dark-green': '#15803d',
    };

    return colorMap[tag.color] || '#6b7280';
  };

  const handleSelectStudy = (studyId: string) => {
    router.push(`/estudo/${studyId}`);
    onClose();
  };

  const handleCreateNew = () => {
    router.push(`/estudo/new?book=${bookId}&chapter=${chapter}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            {bookName} {chapter}
          </DialogTitle>
          <DialogDescription>
            Você tem {studies.length} estudo{studies.length !== 1 ? 's' : ''} para este capítulo.
            Selecione um para editar ou crie um novo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {/* Botão Criar Novo */}
          <Button
            onClick={handleCreateNew}
            className="w-full justify-start gap-2 h-auto py-4"
            variant="outline"
          >
            <Plus className="w-5 h-5" />
            <div className="flex-1 text-left">
              <div className="font-semibold">Criar Novo Estudo</div>
              <div className="text-xs text-muted-foreground">
                Adicionar mais um estudo para este capítulo
              </div>
            </div>
          </Button>

          {/* Lista de Estudos Existentes */}
          <div className="space-y-2">
            {studies.map((study) => (
              <Button
                key={study.id}
                onClick={() => handleSelectStudy(study.id)}
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-4"
              >
                <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900 truncate">
                      {study.title}
                    </h3>
                    <Badge
                      variant={study.status === 'concluído' ? 'default' : 'secondary'}
                      className="flex-shrink-0"
                    >
                      {study.status === 'estudando' && 'Estudando'}
                      {study.status === 'revisando' && 'Revisando'}
                      {study.status === 'concluído' && 'Concluído'}
                    </Badge>
                  </div>

                  {/* Tags */}
                  {study.tags.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap mb-1">
                      {study.tags.slice(0, 3).map((tag) => {
                        const tagColor = getTagColor(tag);
                        return (
                          <span
                            key={tag}
                            className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium"
                            style={{
                              borderWidth: '1px',
                              borderStyle: 'solid',
                              borderColor: tagColor,
                              color: tagColor,
                              backgroundColor: 'transparent',
                            }}
                          >
                            #{tag}
                          </span>
                        );
                      })}
                      {study.tags.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{study.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Data de atualização */}
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{formatRelativeDate(study.updated_at)}</span>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
