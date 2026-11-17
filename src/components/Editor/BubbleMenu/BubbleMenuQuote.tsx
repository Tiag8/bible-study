/**
 * ✅ REFACTORING: Subcomponente - Seleção de cor de citação
 *
 * Grid de cores para blockquote com preview da borda colorida.
 */

import { Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import { COLORS } from "@/lib/design-tokens";
import { QUOTE_COLORS } from "@/lib/editor-constants";
import type { BubbleMenuColorProps } from "./types";
import { QUOTE_DISPLAY } from "@/lib/theme-colors";

export function BubbleMenuQuote({
  editor,
  setMode,
  onSelectColor,
  onRemoveColor,
}: BubbleMenuColorProps) {
  return (
    <div className="p-3 w-60">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Quote className="w-4 h-4 text-gray-900" />
        <span className="text-sm font-medium text-gray-900">Cor da citação</span>
      </div>

      {/* Grid de cores com preview */}
      <div className="grid grid-cols-4 gap-2">
        {QUOTE_COLORS.map((qc) => (
          <button
            key={qc.color}
            onClick={() => onSelectColor(qc.color)}
            className="w-full aspect-square rounded-md border-2 border-gray-200 hover:border-gray-400 transition-colors flex items-center justify-center"
            style={{
              backgroundColor: QUOTE_DISPLAY[qc.color]?.fill,
              borderLeftWidth: '4px',
              borderLeftColor: QUOTE_DISPLAY[qc.color]?.border
            }}
            title={QUOTE_DISPLAY[qc.color]?.name ?? qc.name}
            aria-label={`Citação: ${QUOTE_DISPLAY[qc.color]?.name ?? qc.name}`}
          >
            <Quote className="w-4 h-4" style={{ color: QUOTE_DISPLAY[qc.color]?.border }} />
          </button>
        ))}
      </div>

      {/* Botão remover (se ativo) */}
      {editor.isActive("blockquote") && onRemoveColor && (
        <button
          onClick={onRemoveColor}
          className={cn(
            "w-full mt-2 px-3 py-1.5 text-sm rounded transition-colors",
            COLORS.danger.text,
            `hover:${COLORS.danger.light}`
          )}
        >
          Remover citação
        </button>
      )}

      {/* Botão voltar */}
      <button
        onClick={() => setMode("default")}
        className={cn(
          "mt-3 text-xs max-md:text-sm max-md:py-2 max-md:pr-4 transition-colors",
          COLORS.neutral.text.muted,
          `hover:${COLORS.neutral.text.secondary}`
        )}
      >
        ← Voltar
      </button>
    </div>
  );
}
