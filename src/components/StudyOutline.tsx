'use client';

import { useCallback, useRef, useState } from 'react';
import { ListTree } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PARCHMENT } from '@/lib/design-tokens';
import { Button } from '@/components/ui/button';
import { useDismiss } from '@/hooks/useDismiss';
import type { OutlineItem } from '@/components/Editor';

interface StudyOutlineProps {
  /** Lê os títulos do editor no momento em que o sumário é aberto. */
  getOutline: () => OutlineItem[];
  onSelect: (pos: number) => void;
}

/** Lista dos títulos do estudo, recuada por nível. Usada no popover e no painel do celular. */
export function OutlineList({ items, onSelect }: { items: OutlineItem[]; onSelect: (pos: number) => void }) {
  if (items.length === 0) {
    return (
      <p className={cn('px-2 py-3 text-sm', PARCHMENT.text.secondary)}>
        Este estudo ainda não tem títulos. Use Título 1, 2 ou 3 no texto para montar o sumário.
      </p>
    );
  }
  return (
    <ul>
      {items.map((item) => (
        <li key={item.pos}>
          <button
            type="button"
            onClick={() => onSelect(item.pos)}
            className={cn(
              'w-full min-h-[44px] rounded px-2 py-2 text-left text-sm hover:bg-warm-white active:bg-linen focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-dark',
              item.level === 1 ? cn('font-semibold', PARCHMENT.text.heading) : PARCHMENT.text.subheading,
              item.level === 2 && 'pl-5',
              item.level >= 3 && 'pl-8'
            )}
          >
            {item.text}
          </button>
        </li>
      ))}
    </ul>
  );
}

/** Sumário do estudo: lista os títulos e leva até cada um. Útil em notas longas. */
export function StudyOutline({ getOutline, onSelect }: StudyOutlineProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<OutlineItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(containerRef, open, close);

  const toggle = () => {
    if (!open) setItems(getOutline());
    setOpen(!open);
  };

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={toggle}
        aria-label="Sumário do estudo"
        aria-expanded={open}
      >
        <ListTree className="w-4 h-4 sm:mr-2" />
        <span className="hidden sm:inline">Sumário</span>
      </Button>

      {open && (
        <nav
          aria-label="Sumário do estudo"
          className={cn(
            'z-50 overflow-y-auto rounded-lg border border-linen bg-cream p-2 shadow-xl',
            'fixed inset-x-3 top-16 max-h-[70dvh]',
            'sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80 sm:max-h-[60vh]'
          )}
        >
          <OutlineList
            items={items}
            onSelect={(pos) => {
              onSelect(pos);
              setOpen(false);
            }}
          />
        </nav>
      )}
    </div>
  );
}
