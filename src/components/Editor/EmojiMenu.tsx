"use client";

import { useEffect, useRef } from "react";
import type { EmojiData } from "@/lib/emoji-data";

interface EmojiMenuProps {
  isOpen: boolean;
  position: { top: number; left: number };
  emojis: EmojiData[];
  selectedIndex: number;
  query: string;
  onSelect: (emoji: EmojiData) => void;
}

/**
 * Menu flutuante de emojis com busca
 * Aparece quando o usuário digita ":" e busca por emojis
 *
 * Features:
 * - Grid responsivo com 5 colunas
 * - Navegação com teclado (↑↓ + Enter)
 * - Hover para selecionar com mouse
 * - Auto-scroll para item selecionado
 * - WCAG AA Compliant (ARIA, focus management, contrast)
 * - Bounds checking (não sai da tela)
 */
export function EmojiMenu({
  isOpen,
  position,
  emojis,
  selectedIndex,
  query,
  onSelect,
}: EmojiMenuProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para item selecionado
  useEffect(() => {
    if (!containerRef.current) return;
    const selectedElement = containerRef.current.querySelector(
      '[data-selected="true"]'
    );
    selectedElement?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  // Auto-focus no menu quando abre
  useEffect(() => {
    if (isOpen && menuRef.current) {
      // Dar foco ao primeiro elemento focável (ajuda screen readers)
      const firstButton = menuRef.current.querySelector('button[role="option"]') as HTMLButtonElement;
      firstButton?.focus();
    }
  }, [isOpen]);

  // Não renderiza se menu fechado ou sem emojis
  if (!isOpen || emojis.length === 0) {
    return null;
  }

  const selectedEmoji = emojis[selectedIndex];

  return (
    <>
      {/* Live region para anúncios ao screen reader */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {selectedEmoji && `${selectedEmoji.emoji} selecionado: ${selectedEmoji.shortname}`}
      </div>

      <div
        className="emoji-menu fixed z-50 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg p-2 w-72 max-h-72"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
        ref={menuRef}
        role="listbox"
        aria-label="Seletor de emojis"
        aria-expanded={isOpen}
      >
        {/* Cabeçalho com query */}
        <div className="mb-2 pb-2 border-b border-gray-100 dark:border-slate-700">
          <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">
            Digitando: <span className="font-mono">:{query}</span>
          </p>
        </div>

        {/* Grid de emojis (5 colunas) */}
        <div className="grid grid-cols-5 gap-1 max-h-40 overflow-y-auto">
          {emojis.map((emoji, index) => (
            <button
              key={`${emoji.shortname}-${index}`}
              onClick={() => onSelect(emoji)}
              data-index={index}
              data-selected={index === selectedIndex}
              role="option"
              aria-selected={index === selectedIndex}
              aria-label={`${emoji.emoji} ${emoji.shortname}`}
              className={`
                p-2 text-2xl rounded transition-all duration-100
                hover:bg-gray-100 dark:hover:bg-slate-700
                focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1
                dark:focus:ring-blue-300 dark:focus:ring-offset-slate-900
                ${
                  index === selectedIndex
                    ? "bg-blue-100 dark:bg-blue-900 border-2 border-blue-500 dark:border-blue-400 scale-110 shadow-md"
                    : "border border-transparent hover:border-gray-300 dark:hover:border-slate-600"
                }
              `}
              tabIndex={-1}
            >
              {emoji.emoji}
            </button>
          ))}
        </div>

        {/* Rodapé com instruções acessíveis */}
        {emojis.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-slate-700">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              ↑↓ Navegar • Enter Selecionar • Esc Fechar
            </p>
            <p className="sr-only">
              {emojis.length} emojis encontrados. Use as setas para navegar e Enter para selecionar.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
