'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface CreateTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTag: (name: string, type: 'Versículos' | 'Temas' | 'Princípios', color: string) => Promise<void>;
}

const TAG_TYPES: Array<'Versículos' | 'Temas' | 'Princípios'> = ['Versículos', 'Temas', 'Princípios'];

const TAG_COLORS = [
  { name: 'blue', hex: '#3b82f6', label: 'Azul' },
  { name: 'purple', hex: '#8b5cf6', label: 'Roxo' },
  { name: 'green', hex: '#22c55e', label: 'Verde' },
  { name: 'orange', hex: '#f97316', label: 'Laranja' },
  { name: 'pink', hex: '#ec4899', label: 'Rosa' },
  { name: 'cyan', hex: '#06b6d4', label: 'Azul Claro' },
  { name: 'red', hex: '#ef4444', label: 'Vermelho' },
  { name: 'yellow', hex: '#eab308', label: 'Amarelo' },
  { name: 'dark-green', hex: '#15803d', label: 'Verde Escuro' },
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
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Nova Tag</h2>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Formulário */}
          <div className="space-y-4">
            {/* Nome da tag */}
            <div>
              <label htmlFor="tag-name" className="block text-sm font-medium text-gray-700 mb-1">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo
              </label>
              <div className="grid grid-cols-3 gap-2">
                {TAG_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    className={cn(
                      "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      "border border-gray-300",
                      selectedType === type
                        ? "bg-blue-50 border-blue-500 text-blue-700"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Cor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cor
              </label>
              <div className="grid grid-cols-3 gap-2">
                {TAG_COLORS.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setSelectedColor(color.name)}
                    className={cn(
                      "flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-all",
                      "border-2",
                      selectedColor === color.name
                        ? "border-gray-900 ring-2 ring-gray-900 ring-offset-2"
                        : "border-transparent hover:border-gray-300"
                    )}
                    title={color.label}
                  >
                    <span
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-xs text-gray-900">{color.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
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
