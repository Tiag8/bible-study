/**
 * Subcomponente - Popover para criar/editar comentario inline
 *
 * Exibe textarea para digitar comentario + botoes Salvar/Cancelar.
 */

import { useState, useEffect, useRef } from "react";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { COLORS, BORDERS } from "@/lib/design-tokens";
import type { BubbleMenuBaseProps } from "./types";

interface BubbleMenuCommentProps extends BubbleMenuBaseProps {
  /** Texto inicial (para modo edicao) */
  initialText?: string;
  /** Callback ao salvar comentario */
  onSave: (text: string) => void;
}

export function BubbleMenuComment({
  setMode,
  initialText = "",
  onSave,
}: BubbleMenuCommentProps) {
  const [text, setText] = useState(initialText);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus automatico na textarea ao abrir
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSave = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSave(trimmed);
  };

  return (
    <div className="p-3 w-80">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare className={cn("w-4 h-4", COLORS.neutral.text.primary)} />
        <span className={cn("text-sm font-medium", COLORS.neutral.text.primary)}>
          {initialText ? "Editar comentario" : "Adicionar comentario"}
        </span>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Adicionar comentario..."
        rows={3}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleSave();
          }
          if (e.key === "Escape") {
            setMode("default");
          }
        }}
        className={cn(
          "w-full px-2 py-1.5 text-sm rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500",
          BORDERS.gray
        )}
      />

      {/* Acoes */}
      <div className="flex items-center justify-between mt-2">
        <button
          onClick={() => setMode("default")}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Cancelar
        </button>

        <button
          onClick={handleSave}
          disabled={!text.trim()}
          className={cn(
            "px-3 py-1 text-sm text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
            COLORS.primary.default,
            `hover:${COLORS.primary.dark}`
          )}
        >
          Salvar
        </button>
      </div>

      <p className="text-xs text-gray-400 mt-1">
        Ctrl+Enter para salvar
      </p>
    </div>
  );
}
