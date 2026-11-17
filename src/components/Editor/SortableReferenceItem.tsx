'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronUp, ChevronDown, Trash2, ArrowRight, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { REFERENCE_ACCENTS } from '@/lib/theme-colors';
import { TagChip } from '@/components/ui/tag-chip';
import { Reference, TagWithColor } from '@/hooks/useReferences';
import { getReferenceKind, getShortHostname } from '@/lib/reference-utils';

interface SortableReferenceItemProps {
  reference: Reference;
  index: number;
  total: number;
  onDelete: (referenceId: string) => void;
  onReorder: (referenceId: string, direction: 'up' | 'down') => void;
  deleting?: boolean;
}

/**
 * SortableReferenceItem Component - Opção 3 Refinada
 *
 * Design minimalista no tema pergaminho com:
 * - Superfície creme, borda linho e faixa de 3 px na cor do tipo de referência
 * - Nome do tipo ("Referência", "Citado por", "Link externo") antes da descrição
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

    // Tipo da referência: cor da faixa e nome do tipo (REFERENCE_ACCENTS)
    const referenceAccent = REFERENCE_ACCENTS[getReferenceKind(reference)];

    // Parse título: extrai "Livro Capítulo" (antes do "-") e descrição (depois do "-")
    // Para links externos, usar URL como título
    let bookChapterPart = '';
    let descriptionPart = '';

    if (reference.link_type === 'external' && reference.external_url) {
      bookChapterPart = getShortHostname(reference.external_url);
      descriptionPart = reference.external_url;
    } else {
      const titleParts = reference.target_title?.split(' - ') || [];
      bookChapterPart = titleParts[0] || reference.target_title || 'Desconhecido'; // Livro + Capítulo (bold)
      descriptionPart = titleParts.slice(1).join(' - ') || ''; // Descrição (normal)
    }

    // Tags do estudo linkado (não existem para links externos)
    const tags = reference.target_tags || [];

    // Story 4.3.1: Verificar se é referência reversa (readonly)
    const isReversedReference = reference.link_type === 'internal' && reference.is_bidirectional === false;

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          // Base container
          'group relative overflow-hidden',
          'pl-4 pr-3 py-6 rounded-lg border',
          'bg-cream border-linen hover:bg-warm-white',
          // Refinement 1: Hover elevation + scale + translateY
          'transition-all duration-200 ease-out',
          'hover:shadow-sm hover:scale-[1.01] hover:-translate-y-0.5',
          // Drag state
          isDragging && 'shadow-lg opacity-50 scale-100'
        )}
        role="article"
        aria-label={`Referência para ${reference.target_title || reference.external_url}, posição ${index + 1} de ${total}`}
      >
        {/* Faixa de 3 px na cor do tipo de referência */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px]"
          style={{ backgroundColor: referenceAccent.accent }}
          aria-hidden="true"
        />

        {/* Grip handle invisível para drag (mantém acessibilidade) */}
        <button
          {...attributes}
          {...listeners}
          className={cn(
            'absolute -left-12 top-2 p-2 rounded transition-colors',
            'opacity-0 hover:opacity-100 text-stone',
            isDragging && 'opacity-100 text-amber-dark'
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
            {/* Link wrapper para navegação - interno ou externo */}
            {reference.link_type === 'external' && reference.external_url ? (
              <a
                href={reference.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'flex-1 min-w-0 text-sm font-semibold text-espresso leading-tight hover:text-amber-dark transition-colors',
                  'flex items-center gap-1',
                  deleting && 'opacity-50 pointer-events-none'
                )}
              >
                {bookChapterPart}
                <ExternalLink size={12} />
              </a>
            ) : (
              <a
                href={`/estudo/${reference.target_study_id}`}
                data-href={`/estudo/${reference.target_study_id}`}
                className={cn(
                  'flex-1 min-w-0 text-sm font-semibold text-espresso leading-tight hover:text-amber-dark transition-colors',
                  deleting && 'opacity-50 pointer-events-none'
                )}
              >
                {bookChapterPart}
              </a>
            )}

            {/* Refinement 3: Actions com stagger animation ao hover */}
            <div className="flex gap-1 flex-shrink-0 items-center">
            {/* Up button - delay-0 (sem delay) */}
            <button
              onClick={() => onReorder(reference.id, 'up')}
              className={cn(
                'p-1.5 rounded transition-all duration-150 ease-out',
                'md:opacity-0 md:group-hover:opacity-100 max-md:p-2.5', // no toque fica sempre visível; fade in ao hover no desktop
                'delay-0', // stagger: sem delay
                isFirstItem || deleting
                  ? 'opacity-30 cursor-not-allowed'
                  : 'text-stone hover:bg-linen hover:text-espresso active:scale-95'
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
                'md:opacity-0 md:group-hover:opacity-100 max-md:p-2.5', // no toque fica sempre visível; fade in ao hover no desktop
                'delay-50', // stagger: 50ms delay
                isLastItem || deleting
                  ? 'opacity-30 cursor-not-allowed'
                  : 'text-stone hover:bg-linen hover:text-espresso active:scale-95'
              )}
              disabled={isLastItem || deleting}
              title="Mover abaixo"
              aria-label={`Mover ${reference.target_title} para baixo${isLastItem ? ' (já no final)' : ''}`}
              aria-disabled={isLastItem || deleting}
            >
              <ChevronDown size={14} />
            </button>

            {/* Delete button - delay-100 (stagger) + destaque em red */}
            {/* Story 4.3.1: Ocultar delete para refs reversas (readonly) */}
            {!isReversedReference && (
              <button
                onClick={() => onDelete(reference.id)}
                className={cn(
                  'p-1.5 rounded ml-1 transition-all duration-150 ease-out',
                  'md:opacity-0 md:group-hover:opacity-100 max-md:p-2.5', // no toque fica sempre visível; fade in ao hover no desktop
                  'delay-100', // stagger: 100ms delay
                  'text-stone hover:text-red-700 hover:bg-red-50',
                  'hover:scale-105 active:scale-95',
                  deleting && 'opacity-50 cursor-not-allowed'
                )}
                disabled={deleting}
                title={isReversedReference ? 'Esta referência foi criada automaticamente' : 'Deletar referência'}
                aria-label={`Deletar referência para ${reference.target_title}`}
                aria-disabled={deleting}
              >
                <Trash2 size={14} />
              </button>
            )}

            {/* Tooltip para refs reversas */}
            {isReversedReference && (
              <div
                className="p-1.5 rounded text-stone"
                title="Esta referência foi criada automaticamente"
                aria-label="Esta referência foi criada automaticamente"
              >
                <span className="text-xs">🔗</span>
              </div>
            )}

            {/* Navigate button - delay-150 (stagger final) */}
            <button
              onClick={() => {
                // Story 4.3.2: Navegação diferenciada por tipo de link
                if (reference.link_type === 'external' && reference.external_url) {
                  window.open(reference.external_url, '_blank', 'noopener,noreferrer');
                } else {
                  const link = document.querySelector(
                    `a[data-href="/estudo/${reference.target_study_id}"]`
                  ) as HTMLAnchorElement;
                  if (link) link.click();
                }
              }}
              className={cn(
                'p-1.5 rounded transition-all duration-150 ease-out',
                'md:opacity-0 md:group-hover:opacity-100 max-md:p-2.5', // no toque fica sempre visível; fade in ao hover no desktop
                'delay-150', // stagger: 150ms delay (final)
                'text-stone hover:text-amber-dark hover:bg-linen',
                'active:scale-95'
              )}
              title={reference.link_type === 'external' ? 'Abrir link externo' : 'Ir para estudo'}
              aria-label={reference.link_type === 'external' ? 'Abrir link externo em nova aba' : 'Navegar para estudo linkado'}
            >
              {reference.link_type === 'external' ? <ExternalLink size={14} /> : <ArrowRight size={14} />}
            </button>
            </div>
          </div>

          {/* Linha 2: nome do tipo na cor da faixa, depois a descrição (quebra em múltiplas linhas) */}
          <p
            className={cn(
              'text-sm leading-snug',
              reference.link_type === 'external' && 'truncate'
            )}
          >
            <span className="mr-1.5 text-xs font-semibold" style={{ color: referenceAccent.accent }}>
              {referenceAccent.label}
            </span>
            {descriptionPart && (
              reference.link_type === 'external' && reference.external_url ? (
                <a
                  href={reference.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'font-normal text-walnut hover:text-amber-dark transition-colors',
                    deleting && 'opacity-50 pointer-events-none'
                  )}
                  title={reference.external_url}
                >
                  {descriptionPart}
                </a>
              ) : (
                <a
                  href={`/estudo/${reference.target_study_id}`}
                  data-href={`/estudo/${reference.target_study_id}`}
                  className={cn(
                    'font-normal text-espresso hover:text-amber-dark transition-colors',
                    deleting && 'opacity-50 pointer-events-none'
                  )}
                >
                  {descriptionPart}
                </a>
              )
            )}
          </p>

          {/* Linha 3: Tags coloridas (quebra em múltiplas linhas) */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {tags.map((tag: TagWithColor, idx: number) => (
                <span key={idx} title={`${tag.type}`}>
                  <TagChip name={tag.name} colorKey={tag.color} />
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
