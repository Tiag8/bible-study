/**
 * ✅ REFACTORING: Subcomponente - Seleção de cor de texto
 *
 * Grid de cores para aplicar/remover cor de texto.
 */

import { Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { COLORS } from "@/lib/design-tokens";
import { TEXT_COLORS } from "@/lib/editor-constants";
import type { BubbleMenuColorProps } from "./types";

export function BubbleMenuTextColor({
  setMode,
  onSelectColor,
  onRemoveColor,
}: BubbleMenuColorProps) {
  return (
    <div className="p-3 w-52">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Palette className="w-4 h-4 text-gray-900" />
        <span className="text-sm font-medium text-gray-900">Cor do texto</span>
      </div>

      {/* Grid de cores */}
      <div className="grid grid-cols-4 gap-2">
        {TEXT_COLORS.map((tc) => (
          <button
            key={tc.color}
            onClick={() => onSelectColor(tc.color)}
            className="w-full aspect-square rounded-full border-2 border-gray-200 hover:border-gray-400 transition-colors flex items-center justify-center"
            style={{ backgroundColor: tc.color }}
            title={tc.name}
          >
            <span className="text-white text-xs font-bold drop-shadow-sm">A</span>
          </button>
        ))}
      </div>

      {/* Botão remover cor */}
      {onRemoveColor && (
        <button
          onClick={onRemoveColor}
          className="w-full mt-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded transition-colors"
        >
          Cor padrão
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
