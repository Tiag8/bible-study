/**
 * ✅ REFACTORING: Subcomponente - Input de link externo
 *
 * Permite adicionar URL externa à seleção de texto.
 */

import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { COLORS, BORDERS } from "@/lib/design-tokens";
import type { BubbleMenuLinkProps } from "./types";

export function BubbleMenuLink({
  setMode,
  linkUrl,
  setLinkUrl,
  onSetLink,
}: BubbleMenuLinkProps) {
  return (
    <div className="p-3 w-80">
      {/* Input de URL */}
      <div className="flex items-center gap-2">
        <ExternalLink className={cn("w-4 h-4", COLORS.neutral.text.primary)} />
        <input
          type="url"
          placeholder="https://..."
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSetLink();
            }
            if (e.key === "Escape") {
              setMode("default");
              setLinkUrl("");
            }
          }}
          className={cn(
            "flex-1 px-2 py-1 text-sm rounded focus:outline-none focus:ring-2 focus:ring-blue-500",
            BORDERS.gray
          )}
          autoFocus
        />
        <button
          onClick={onSetLink}
          disabled={!linkUrl}
          className={cn(
            "px-3 py-1 text-sm text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
            COLORS.primary.default,
            `hover:${COLORS.primary.dark}`
          )}
        >
          OK
        </button>
      </div>

      {/* Botão voltar */}
      <button
        onClick={() => {
          setMode("default");
          setLinkUrl("");
        }}
        className="mt-3 text-xs text-gray-500 hover:text-gray-700"
      >
        ← Voltar
      </button>
    </div>
  );
}
