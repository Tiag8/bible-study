'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PARCHMENT } from '@/lib/design-tokens';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

/**
 * Painel que sobe da base da tela, para escolhas curtas no celular.
 *
 * Usa <dialog> modal: o navegador cuida do foco preso no painel, do Esc, de deixar
 * a página atrás inerte e de devolver o foco ao botão que abriu. Fecha também pelo X
 * e tocando fora. Um painel por vez: quem abre outro fecha este antes.
 */
export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  // Fechar por mudança de `open` também dispara o evento "close" do <dialog>. Sem esta
  // marca, trocar um painel por outro avisaria o dono de que "fechou" e derrubaria o novo.
  const closedByProp = useRef(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // O foco vai para o painel em si, não para o primeiro botão: no Safari o X ganhava
      // o anel de foco ao abrir por toque e parecia selecionado.
      dialog.focus();
    }
    if (!open && dialog.open) {
      closedByProp.current = true;
      dialog.close();
    }
  }, [open]);

  const handleNativeClose = () => {
    if (closedByProp.current) {
      closedByProp.current = false;
      return;
    }
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      tabIndex={-1}
      onClose={handleNativeClose}
      // O toque fora do painel cai no próprio <dialog> (a área escurecida é dele).
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      // Gesto de voltar do Android fecha o painel, onde o navegador já suporta.
      {...{ closedby: 'any' }}
      // Sem flex aqui de propósito: com o painel em coluna flex e o corpo em `flex-1`, o
      // Safari do iPhone calculava a altura do corpo como zero (a base 0% numa altura
      // indefinida) e o painel abria só com o título. O corpo tem altura máxima própria.
      className={cn(
        'fixed inset-x-0 bottom-0 top-auto m-0 w-full max-w-full rounded-t-2xl border-t border-linen bg-warm-white p-0',
        'overflow-hidden shadow-[0_-10px_30px_rgba(60,36,21,0.2)] backdrop:bg-espresso/30 focus:outline-none'
      )}
    >
      <div className="flex flex-col items-center px-2 pt-2">
        <span className="h-1 w-10 rounded-full bg-sand/50" aria-hidden="true" />
        <div className="flex w-full items-center justify-between pl-3">
          <h2 id={titleId} className={cn('font-lora text-base font-semibold', PARCHMENT.text.heading)}>
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-walnut active:bg-linen focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-dark"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div
        className="sheet-body overflow-y-auto overscroll-contain px-2"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)' }}
      >
        {children}
      </div>
    </dialog>
  );
}
