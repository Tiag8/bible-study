"use client";

import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extensions";
import { Highlight } from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Details, DetailsSummary, DetailsContent } from "@tiptap/extension-details";
import { cn } from "@/lib/utils";
import { COLORS } from "@/lib/design-tokens";
import { ColoredBlockquote } from "./ColoredBlockquote";
import { BubbleMenuComponent } from "./BubbleMenu";
import { SlashMenu } from "./SlashMenu";
import { useSlashMenu } from "./useSlashMenu";
import type { TiptapContent } from "@/types/database";

interface EditorProps {
  initialContent?: string | TiptapContent | null;
  onChange?: (content: string) => void;
}

// Função para parsear conteúdo: JSON string, objeto JSON ou HTML
function parseContent(content: unknown): string | object {
  if (!content) return "";
  // Se já for objeto, retorna diretamente
  if (typeof content === "object") return content;
  // Se não for string, retorna vazio
  if (typeof content !== "string") return "";
  // Tenta parsear como JSON se começa com {
  if (content.trim().startsWith("{")) {
    try {
      return JSON.parse(content);
    } catch {
      // Se falhar, retorna como HTML
      return content;
    }
  }
  return content;
}

export function Editor({ initialContent = "", onChange }: EditorProps) {
  const lastAppliedContentRef = useRef<string | null>(null);
  const parsedInitialContent = parseContent(initialContent);
  /* TOKENS: COLORS.neutral */

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        blockquote: false, // Usar nossa extensão customizada
      }),
      ColoredBlockquote,
      Placeholder.configure({
        placeholder: "Comece a escrever suas anotações... Use / para comandos.",
      }),
      Highlight.configure({
        multicolor: true,
        HTMLAttributes: {
          class: "highlight",
        },
      }),
      TextStyle,
      Color,
      // Extensão oficial de Details (Toggle List)
      Details.configure({
        persist: true,
        HTMLAttributes: {
          class: "details-block",
        },
      }),
      DetailsSummary.configure({
        HTMLAttributes: {
          class: "details-summary",
        },
      }),
      DetailsContent.configure({
        HTMLAttributes: {
          class: "details-content",
        },
      }),
    ],
    content: parsedInitialContent,
    immediatelyRender: false, // Fix SSR hydration mismatch
    editorProps: {
      attributes: {
        class: "tiptap prose prose-sm max-w-none p-4 focus:outline-none min-h-[300px]",
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(JSON.stringify(editor.getJSON()));
    },
  });

  // Atualizar conteúdo quando initialContent mudar
  useEffect(() => {
    if (!editor) return;
    const normalizedContent = parseContent(initialContent);
    const contentKey =
      typeof normalizedContent === "string"
        ? normalizedContent
        : JSON.stringify(normalizedContent);

    if (lastAppliedContentRef.current === contentKey) return;

    editor.commands.setContent(normalizedContent);
    lastAppliedContentRef.current = contentKey;
  }, [editor, initialContent]);

  const slashMenu = useSlashMenu(editor);

  if (!editor) {
    return (
      <div className={cn("p-4 animate-pulse", COLORS.neutral.text.light)}>
        Carregando editor...
      </div>
    );
  }

  return (
    <div className="relative">
      <BubbleMenuComponent editor={editor} />
      <EditorContent editor={editor} />
      <SlashMenu
        editor={editor}
        isOpen={slashMenu.isOpen}
        position={slashMenu.position}
        onClose={slashMenu.close}
        onSelect={slashMenu.handleSelect}
      />
    </div>
  );
}
