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
 * - Hint com instruções de uso
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

  // Auto-scroll para item selecionado
  useEffect(() => {
    if (!containerRef.current) return;
    const selectedElement = containerRef.current.querySelector(
      '[data-selected="true"]'
    );
    selectedElement?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  // Não renderiza se menu fechado ou sem emojis
  if (!isOpen || emojis.length === 0) {
    return null;
  }

  return (
    <div
      className="emoji-menu fixed z-50 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg p-2 w-72"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      ref={containerRef}
    >
      {/* Cabeçalho com query */}
      <div className="mb-2 pb-2 border-b border-gray-100 dark:border-slate-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Digitando: <span className="font-mono text-gray-700 dark:text-gray-300">:{query}</span>
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
            className={`
              p-2 text-2xl rounded transition-all duration-100
              hover:bg-gray-100 dark:hover:bg-slate-700
              ${
                index === selectedIndex
                  ? "bg-blue-100 dark:bg-blue-900 border-2 border-blue-400 dark:border-blue-500 scale-110"
                  : "border border-transparent"
              }
            `}
            title={emoji.shortname}
            tabIndex={-1}
          >
            {emoji.emoji}
          </button>
        ))}
      </div>

      {/* Rodapé com instruções */}
      {emojis.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-slate-700">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            ↑↓ Navegar • Enter Selecionar • Esc Fechar
          </p>
        </div>
      )}
    </div>
  );
}
