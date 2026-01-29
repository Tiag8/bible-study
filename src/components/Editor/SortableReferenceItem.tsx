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
// Função para escurecer cores claras mantendo o matiz
// Detecta luminância e aplica darkening se necessário
function getContrastColor(hexColor: string): string {
  // Parse hex color
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calcular luminância (WCAG)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Se a cor é clara (luminância > 0.6), escurecer
  if (luminance > 0.6) {
    // Converter para HSL, reduzir lightness e aumentar saturation
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2 / 255;
    let h = 0;
    let s = 0;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - (max + min)) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    // Escurecer: reduzir lightness para ~55% e aumentar saturation
    const newL = Math.max(0.4, l * 0.65); // Reduz lightness
    const newS = Math.min(1, s * 1.2); // Aumenta saturation

    // Converter HSL de volta para RGB
    const hsl2rgb = (h: number, s: number, l: number) => {
      let r, g, b;

      if (s === 0) {
        r = g = b = l;
      } else {
        const hue2rgb = (p: number, q: number, t: number) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1 / 6) return p + (q - p) * 6 * t;
          if (t < 1 / 2) return q;
          if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
          return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
      }

      const toHex = (x: number) => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };

      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    };

    return hsl2rgb(h, newS, newL);
  }

  // Se a cor é escura, retornar como está
  return hexColor;
}

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
              {tags.map((tag: TagWithColor, idx: number) => {
                const contrastColor = getContrastColor(tag.color);
                return (
                  <span
                    key={idx}
                    className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium transition-all duration-150 ease-out"
                    style={{
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: contrastColor,
                      color: contrastColor,
                      backgroundColor: 'transparent',
                    }}
                    title={`${tag.type}`}
                  >
                    #{tag.name}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }
);

SortableReferenceItem.displayName = 'SortableReferenceItem';
