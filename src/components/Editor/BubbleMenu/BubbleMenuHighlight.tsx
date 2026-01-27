/**
 * ✅ REFACTORING: Subcomponente - Seleção de cor de marca-texto
 *
 * Grid de cores para aplicar/remover highlight.
 */

import { Highlighter } from "lucide-react";
import { cn } from "@/lib/utils";
import { COLORS } from "@/lib/design-tokens";
import { HIGHLIGHT_COLORS } from "@/lib/editor-constants";
import type { BubbleMenuColorProps } from "./types";

export function BubbleMenuHighlight({
  editor,
  setMode,
  onSelectColor,
  onRemoveColor,
}: BubbleMenuColorProps) {
  return (
    <div className="p-3 w-52">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Highlighter className={cn("w-4 h-4", COLORS.neutral.text.primary)} />
        <span className={cn("text-sm font-medium", COLORS.neutral.text.primary)}>Marca-texto</span>
      </div>

      {/* Grid de cores */}
      <div className="grid grid-cols-3 gap-2">
        {HIGHLIGHT_COLORS.map((hl) => (
          <button
            key={hl.color}
            onClick={() => onSelectColor(hl.color)}
            className={cn(
              "w-full aspect-square rounded-md border-2 border-transparent transition-colors",
              `hover:border-${COLORS.neutral[400]}`
            )}
            style={{ backgroundColor: hl.color }}
            title={hl.name}
          />
        ))}
      </div>

      {/* Botão remover (se ativo) */}
      {editor.isActive("highlight") && onRemoveColor && (
        <button
          onClick={onRemoveColor}
          className={cn(
            "w-full mt-2 px-3 py-1.5 text-sm rounded transition-colors",
            COLORS.danger.text,
            `hover:${COLORS.danger.light}`
          )}
        >
          Remover marca-texto
        </button>
      )}

      {/* Botão voltar */}
      <button
        onClick={() => setMode("default")}
        className={cn(
          "mt-3 text-xs transition-colors",
          COLORS.neutral.text.muted,
          `hover:${COLORS.neutral.text.secondary}`
        )}
      >
        ← Voltar
      </button>
    </div>
  );
}
