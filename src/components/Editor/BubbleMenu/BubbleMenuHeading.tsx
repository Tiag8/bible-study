/**
 * ✅ REFACTORING: Subcomponente - Seleção de títulos
 *
 * Permite escolher entre H1, H2, H3 ou parágrafo normal.
 */

import { Heading1, Heading2, Heading3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { COLORS } from "@/lib/design-tokens";
import type { BubbleMenuBaseProps } from "./types";

export function BubbleMenuHeading({ editor, setMode }: BubbleMenuBaseProps) {
  return (
    <div className="p-3 w-56">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Heading1 className={cn("w-4 h-4", COLORS.neutral.text.primary)} />
        <span className={cn("text-sm font-medium", COLORS.neutral.text.primary)}>Títulos</span>
      </div>

      {/* Opções de título */}
      <div className="space-y-1">
        <button
          onClick={() => {
            editor.chain().focus().toggleHeading({ level: 1 }).run();
            setMode("default");
          }}
          className={cn(
            `w-full text-left px-3 py-2 rounded flex items-center gap-2 transition-colors ${COLORS.neutral.text.primary} hover:${COLORS.neutral[100]}`,
            editor.isActive("heading", { level: 1 }) && `${COLORS.primary.light} ${COLORS.primary.text}`
          )}
        >
          <Heading1 className="w-5 h-5" />
          <span className="text-lg font-bold">Título 1</span>
        </button>

        <button
          onClick={() => {
            editor.chain().focus().toggleHeading({ level: 2 }).run();
            setMode("default");
          }}
          className={cn(
            `w-full text-left px-3 py-2 rounded flex items-center gap-2 transition-colors ${COLORS.neutral.text.primary} hover:${COLORS.neutral[100]}`,
            editor.isActive("heading", { level: 2 }) && `${COLORS.primary.light} ${COLORS.primary.text}`
          )}
        >
          <Heading2 className="w-5 h-5" />
          <span className="text-base font-semibold">Título 2</span>
        </button>

        <button
          onClick={() => {
            editor.chain().focus().toggleHeading({ level: 3 }).run();
            setMode("default");
          }}
          className={cn(
            `w-full text-left px-3 py-2 rounded flex items-center gap-2 transition-colors ${COLORS.neutral.text.primary} hover:${COLORS.neutral[100]}`,
            editor.isActive("heading", { level: 3 }) && `${COLORS.primary.light} ${COLORS.primary.text}`
          )}
        >
          <Heading3 className="w-5 h-5" />
          <span className="text-sm font-semibold">Título 3</span>
        </button>

        <button
          onClick={() => {
            editor.chain().focus().setParagraph().run();
            setMode("default");
          }}
          className={cn(
            `w-full text-left px-3 py-2 rounded transition-colors ${COLORS.neutral.text.primary} hover:${COLORS.neutral[100]}`,
            !editor.isActive("heading") && `${COLORS.primary.light} ${COLORS.primary.text}`
          )}
        >
          <span className="text-sm">Parágrafo normal</span>
        </button>
      </div>

      {/* Botão voltar */}
      <button
        onClick={() => setMode("default")}
        className={cn("mt-3 text-xs transition-colors", COLORS.neutral.text.muted, `hover:${COLORS.neutral.text.secondary}`)}
      >
        ← Voltar
      </button>
    </div>
  );
}
