/**
 * ✅ REFACTORING: Subcomponente - Toolbar principal do BubbleMenu
 *
 * Barra de ferramentas horizontal com todos os botões de formatação.
 * Modo "default" do BubbleMenu.
 */

import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Heading1,
  List,
  ListOrdered,
  Quote,
  Highlighter,
  Palette,
  Link2,
  BookOpen,
  Unlink,
  RemoveFormatting,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { COLORS } from "@/lib/design-tokens";
import type { BubbleMenuFormattingProps } from "./types";

export function BubbleMenuToolbar({ editor, setMode, handlers }: BubbleMenuFormattingProps) {
  const isLinkActive = editor.isActive("link");

  // Base button style with black icons - compact for horizontal fit
  /* TOKENS: COLORS.primary, COLORS.neutral */
  const buttonBase = `p-1.5 rounded transition-colors ${COLORS.neutral.text.secondary} hover:${COLORS.neutral[100]}`;
  const buttonActive = `${COLORS.primary.text} ${COLORS.primary.light}`;

  return (
    <div className="flex items-center gap-0.5 p-1.5 flex-wrap sm:flex-nowrap overflow-x-auto">
      {/* Formatting Group */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn(buttonBase, editor.isActive("bold") && buttonActive)}
        title="Negrito (Ctrl+B)"
      >
        <Bold className="w-4 h-4" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn(buttonBase, editor.isActive("italic") && buttonActive)}
        title="Itálico (Ctrl+I)"
      >
        <Italic className="w-4 h-4" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={cn(buttonBase, editor.isActive("underline") && buttonActive)}
        title="Sublinhado (Ctrl+U)"
      >
        <Underline className="w-4 h-4" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={cn(buttonBase, editor.isActive("strike") && buttonActive)}
        title="Tachado"
      >
        <Strikethrough className="w-4 h-4" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={cn(buttonBase, editor.isActive("code") && buttonActive)}
        title="Código"
      >
        <Code className="w-4 h-4" />
      </button>

      {/* Divider */}
      <div className={cn("w-px h-5 mx-1", COLORS.neutral[300])} />

      {/* Headings */}
      <button
        onClick={() => setMode("heading")}
        className={cn(
          buttonBase,
          (editor.isActive("heading", { level: 1 }) ||
            editor.isActive("heading", { level: 2 }) ||
            editor.isActive("heading", { level: 3 })) && buttonActive
        )}
        title="Títulos"
      >
        <Heading1 className="w-4 h-4" />
      </button>

      {/* Lists */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(buttonBase, editor.isActive("bulletList") && buttonActive)}
        title="Lista com marcadores"
      >
        <List className="w-4 h-4" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn(buttonBase, editor.isActive("orderedList") && buttonActive)}
        title="Lista numerada"
      >
        <ListOrdered className="w-4 h-4" />
      </button>

      <button
        onClick={() => setMode("quote")}
        className={cn(buttonBase, editor.isActive("blockquote") && buttonActive)}
        title="Citação"
      >
        <Quote className="w-4 h-4" />
      </button>

      {/* Divider */}
      <div className={cn("w-px h-5 mx-1", COLORS.neutral[300])} />

      {/* Colors & Highlight */}
      <button
        onClick={() => setMode("highlight")}
        className={cn(
          buttonBase,
          editor.isActive("highlight") && `text-orange-600 ${COLORS.warning.light}`
        )}
        title="Marca-texto"
      >
        <Highlighter className="w-4 h-4" />
      </button>

      <button
        onClick={() => setMode("textColor")}
        className={cn(buttonBase)}
        title="Cor do texto"
      >
        <Palette className="w-4 h-4" />
      </button>

      {/* Divider */}
      <div className={cn("w-px h-5 mx-1", COLORS.neutral[300])} />

      {/* Links */}
      <button
        onClick={() => setMode("link")}
        className={cn(buttonBase, isLinkActive && buttonActive)}
        title="Adicionar link externo"
      >
        <Link2 className="w-4 h-4" />
      </button>

      <button
        onClick={() => setMode("reference")}
        className={cn(buttonBase)}
        title="Referenciar outro estudo"
      >
        <BookOpen className="w-4 h-4" />
      </button>

      {isLinkActive && (
        <button
          onClick={handlers.removeLink}
          className={cn(
            "p-2 rounded transition-colors",
            COLORS.danger.text,
            `hover:${COLORS.danger.light}`
          )}
          title="Remover link"
        >
          <Unlink className="w-4 h-4" />
        </button>
      )}

      {/* Divider */}
      <div className={cn("w-px h-5 mx-1", COLORS.neutral[300])} />

      {/* Clear Formatting */}
      <button
        onClick={handlers.clearFormatting}
        className={cn(buttonBase)}
        title="Limpar formatação"
      >
        <RemoveFormatting className="w-4 h-4" />
      </button>
    </div>
  );
}
