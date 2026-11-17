'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { SHADOW_CLASSES } from '@/lib/design-tokens';
import { tagAccent } from '@/lib/theme-colors';

interface CreateTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTag: (name: string, type: 'Versículos' | 'Temas' | 'Princípios', color: string) => Promise<void>;
}

const TAG_TYPES: Array<'Versículos' | 'Temas' | 'Princípios'> = ['Versículos', 'Temas', 'Princípios'];

// A chave (name) é gravada no banco; a cor exibida vem de tagAccent (tons terrosos)
const TAG_COLORS = [
  { name: 'blue', label: 'Azul' },
  { name: 'purple', label: 'Roxo' },
  { name: 'green', label: 'Verde' },
  { name: 'orange', label: 'Laranja' },
  { name: 'pink', label: 'Rosa' },
  { name: 'cyan', label: 'Azul Claro' },
  { name: 'red', label: 'Vermelho' },
  { name: 'yellow', label: 'Amarelo' },
  { name: 'dark-green', label: 'Verde Escuro' },
];

export function CreateTagModal({ isOpen, onClose, onCreateTag }: CreateTagModalProps) {
  const [tagName, setTagName] = useState('');
  const [selectedType, setSelectedType] = useState<'Versículos' | 'Temas' | 'Princípios'>('Temas');
  const [selectedColor, setSelectedColor] = useState('blue');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    // Validação
    if (!tagName.trim()) {
      setError('Digite um nome para a tag');
      return;
    }

    if (!selectedColor) {
      setError('Selecione uma cor');
      return;
    }

    try {
      setIsCreating(true);
      setError('');
      await onCreateTag(tagName.trim(), selectedType, selectedColor);

      // Resetar formulário e fechar
      setTagName('');
      setSelectedType('Temas');
      setSelectedColor('blue');
      onClose();
    } catch {
      setError('Erro ao criar tag. Tente novamente.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setTagName('');
    setSelectedType('Temas');
    setSelectedColor('blue');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={handleCancel}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <div className={cn("bg-cream rounded-lg p-6 border border-linen", SHADOW_CLASSES.lg)}>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-lora font-semibold text-espresso">Nova Tag</h2>
            <button
              onClick={handleCancel}
              className="transition-colors text-stone hover:text-espresso"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Formulário */}
          <div className="space-y-4">
            {/* Nome da tag */}
            <div>
              <label htmlFor="tag-name" className="block text-sm font-medium mb-1 text-walnut">
                Nome da Tag
              </label>
              <Input
                id="tag-name"
                type="text"
                placeholder="Ex: Fé, Salvação, João 3:16..."
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                className="w-full"
                autoFocus
              />
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium mb-2 text-walnut">
                Tipo
              </label>
              <div className="grid grid-cols-3 gap-2">
                {TAG_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    className={cn(
                      "px-3 py-2 rounded-md text-sm font-medium transition-colors border",
                      selectedType === type
                        ? "bg-amber-light border-amber-dark text-espresso"
                        : "bg-warm-white border-linen text-walnut hover:bg-linen"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Cor */}
            <div>
              <label className="block text-sm font-medium mb-2 text-walnut">
                Cor
              </label>
              <div className="grid grid-cols-3 gap-2">
                {TAG_COLORS.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setSelectedColor(color.name)}
                    className={cn(
                      "flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-all border-2",
                      selectedColor === color.name
                        ? "border-espresso ring-2 ring-espresso ring-offset-2 ring-offset-cream"
                        : "border-transparent hover:border-linen"
                    )}
                    title={color.label}
                  >
                    <span
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: tagAccent(color.name) }}
                    />
                    <span className="text-xs text-espresso">{color.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="text-sm px-3 py-2 rounded-md text-red-700 bg-red-50">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isCreating}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isCreating}
              className="flex-1"
            >
              {isCreating ? 'Criando...' : 'Criar Tag'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
