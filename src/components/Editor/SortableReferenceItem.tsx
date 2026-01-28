'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronUp, ChevronDown, Trash2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BORDERS } from '@/lib/design-tokens';
import { Reference, TagWithColor } from '@/hooks/useReferences';

interface SortableReferenceItemProps {
  reference: Reference;
  index: number;
  total: number;
  onDelete: (referenceId: string) => void;
  onReorder: (referenceId: string, direction: 'up' | 'down') => void;
  deleting?: boolean;
}

// Mapeamento de categorias bíblicas para cores gradient
const CATEGORY_COLORS: Record<string, { from: string; to: string }> = {
  'Pentateuco': { from: 'from-green-500', to: 'to-green-600' },
  'Históricos': { from: 'from-amber-500', to: 'to-amber-600' },
  'Poéticos': { from: 'from-purple-500', to: 'to-purple-600' },
  'Profetas Maiores': { from: 'from-red-500', to: 'to-red-600' },
  'Profetas Menores': { from: 'from-pink-500', to: 'to-pink-600' },
  'Evangelhos': { from: 'from-blue-500', to: 'to-blue-600' },
  'Histórico NT': { from: 'from-cyan-500', to: 'to-cyan-600' },
  'Cartas Paulinas': { from: 'from-indigo-500', to: 'to-indigo-600' },
  'Cartas Gerais': { from: 'from-teal-500', to: 'to-teal-600' },
  'Apocalíptico': { from: 'from-orange-500', to: 'to-orange-600' },
};

/**
 * SortableReferenceItem Component - Opção 3 Refinada
 *
 * Design minimalista Apple-style com:
 * - Barra colorida lateral por categoria bíblica
 * - Título + tags em 2 linhas
 * - Ações aparecem ao hover com stagger animation
 * - Refinement 1: Hover elevation + scale + translateY
 * - Refinement 2: Status bar gradient
 * - Refinement 3: Stagger actions animation
 */
export const SortableReferenceItem = React.forwardRef<
  HTMLDivElement,
  SortableReferenceItemProps
>(
  (
    {
      reference,
      index,
      total,
      onDelete,
      onReorder,
      deleting,
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ref
  ) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
      useSortable({
        id: reference.id,
        disabled: deleting,
      });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    const isFirstItem = index === 0;
    const isLastItem = index === total - 1;

    // Get category colors (fallback para Evangelhos se não encontrar)
    const colors = CATEGORY_COLORS[reference.target_book_name] || CATEGORY_COLORS['Evangelhos'];

    // Parse título: extrai "Livro Capítulo" (antes do "-") e descrição (depois do "-")
    const titleParts = reference.target_title.split(' - ');
    const bookChapterPart = titleParts[0] || reference.target_title; // Livro + Capítulo (bold)
    const descriptionPart = titleParts.slice(1).join(' - ') || ''; // Descrição (normal)

    // Tags do estudo linkado
    const tags = reference.target_tags || [];

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          // Base container
          'group relative overflow-hidden',
          'px-3 py-6 rounded-lg border',
          BORDERS.gray,
          // Refinement 1: Hover elevation + scale + translateY
          'transition-all duration-200 ease-out',
          'hover:bg-white hover:shadow-sm hover:scale-[1.01] hover:-translate-y-0.5',
          // Drag state
          isDragging && 'shadow-lg bg-blue-50 border-blue-300 scale-100'
        )}
        role="article"
        aria-label={`Referência para ${reference.target_title}, posição ${index + 1} de ${total}`}
      >
        {/* Refinement 2: Status bar com gradient à esquerda */}
        <div
          className={cn(
            'absolute left-0 top-0 bottom-0 w-1',
            `bg-gradient-to-b ${colors.from} ${colors.to}`,
            'transition-all duration-300 group-hover:w-1.5'
          )}
          aria-hidden="true"
        />

        {/* Grip handle invisível para drag (mantém acessibilidade) */}
        <button
          {...attributes}
          {...listeners}
          className={cn(
            'absolute -left-12 top-2 p-2 rounded transition-colors',
            'opacity-0 hover:opacity-100 text-gray-400',
            isDragging && 'opacity-100 text-blue-600'
          )}
          title="Arraste para reordenar"
          aria-label="Alça para reordenar"
          aria-pressed={isDragging}
          disabled={deleting}
        >
          {/* Hidden grip visual - acessível via drag listeners */}
        </button>

        {/* Conteúdo principal - flex column */}
        <div className="flex flex-col gap-3">
          {/* Linha 1: Título (esquerda) + Botões (direita) */}
          <div className="flex items-center justify-between gap-3">
            {/* Link wrapper para navegação */}
            <a
              href={`/estudo/${reference.target_study_id}`}
              data-href={`/estudo/${reference.target_study_id}`}
              className={cn(
                'flex-1 min-w-0 text-sm font-semibold text-gray-900 leading-tight hover:text-blue-600 transition-colors',
                deleting && 'opacity-50 pointer-events-none'
              )}
            >
              {bookChapterPart}
            </a>

            {/* Refinement 3: Actions com stagger animation ao hover */}
            <div className="flex gap-1 flex-shrink-0 items-center">
            {/* Up button - delay-0 (sem delay) */}
            <button
              onClick={() => onReorder(reference.id, 'up')}
              className={cn(
                'p-1.5 rounded transition-all duration-150 ease-out',
                'opacity-0 group-hover:opacity-100', // fade in ao hover
                'delay-0', // stagger: sem delay
                isFirstItem || deleting
                  ? 'opacity-30 cursor-not-allowed'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800 active:scale-95'
              )}
              disabled={isFirstItem || deleting}
              title="Mover acima"
              aria-label={`Mover ${reference.target_title} para cima${isFirstItem ? ' (já no topo)' : ''}`}
              aria-disabled={isFirstItem || deleting}
            >
              <ChevronUp size={14} />
            </button>

            {/* Down button - delay-50 (stagger) */}
            <button
              onClick={() => onReorder(reference.id, 'down')}
              className={cn(
                'p-1.5 rounded transition-all duration-150 ease-out',
                'opacity-0 group-hover:opacity-100', // fade in ao hover
                'delay-50', // stagger: 50ms delay
                isLastItem || deleting
                  ? 'opacity-30 cursor-not-allowed'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800 active:scale-95'
              )}
              disabled={isLastItem || deleting}
              title="Mover abaixo"
              aria-label={`Mover ${reference.target_title} para baixo${isLastItem ? ' (já no final)' : ''}`}
              aria-disabled={isLastItem || deleting}
            >
              <ChevronDown size={14} />
            </button>

            {/* Delete button - delay-100 (stagger) + destaque em red */}
            <button
              onClick={() => onDelete(reference.id)}
              className={cn(
                'p-1.5 rounded ml-1 transition-all duration-150 ease-out',
                'opacity-0 group-hover:opacity-100', // fade in ao hover
                'delay-100', // stagger: 100ms delay
                'text-gray-500 hover:text-red-600 hover:bg-red-50',
                'hover:scale-105 active:scale-95',
                deleting && 'opacity-50 cursor-not-allowed'
              )}
              disabled={deleting}
              title="Deletar referência"
              aria-label={`Deletar referência para ${reference.target_title}`}
              aria-disabled={deleting}
            >
              <Trash2 size={14} />
            </button>

            {/* Navigate button - delay-150 (stagger final) */}
            <button
              onClick={() => {
                // Navigate via link - já é handle pelo <a> tag acima
                const link = document.querySelector(
                  `a[data-href="/estudo/${reference.target_study_id}"]`
                ) as HTMLAnchorElement;
                if (link) link.click();
              }}
              className={cn(
                'p-1.5 rounded transition-all duration-150 ease-out',
                'opacity-0 group-hover:opacity-100', // fade in ao hover
                'delay-150', // stagger: 150ms delay (final)
                'text-gray-500 hover:text-blue-600 hover:bg-blue-50',
                'active:scale-95'
              )}
              title="Ir para estudo"
              aria-label="Navegar para estudo linkado"
            >
              <ArrowRight size={14} />
            </button>
            </div>
          </div>

          {/* Linha 2: Descrição (quebra em múltiplas linhas) */}
          {descriptionPart && (
            <a
              href={`/estudo/${reference.target_study_id}`}
              data-href={`/estudo/${reference.target_study_id}`}
              className={cn(
                'text-sm font-normal text-gray-900 leading-snug hover:text-blue-600 transition-colors',
                deleting && 'opacity-50 pointer-events-none'
              )}
            >
              {descriptionPart}
            </a>
          )}

          {/* Linha 3: Tags coloridas (quebra em múltiplas linhas) */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {tags.map((tag: TagWithColor, idx: number) => (
                <span
                  key={idx}
                  className={cn(
                    'px-2.5 py-1 rounded-full text-xs font-medium',
                    'transition-all duration-150 ease-out'
                  )}
                  style={{
                    backgroundColor: `${tag.color}20`, // 20% opacity
                    color: tag.color,
                    border: `1px solid ${tag.color}40`, // 40% opacity border
                  }}
                  title={`${tag.type}`}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
);

SortableReferenceItem.displayName = 'SortableReferenceItem';
