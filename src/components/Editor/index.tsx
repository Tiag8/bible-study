"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Underline from "@tiptap/extension-underline";
import { ColoredBlockquote } from "./ColoredBlockquote";
import { BubbleMenuComponent } from "./BubbleMenu";
import { SlashMenu } from "./SlashMenu";
import { useSlashMenu } from "./useSlashMenu";

interface EditorProps {
  initialContent?: string;
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
  const parsedInitialContent = parseContent(initialContent);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        blockquote: false, // Usar nossa extensão customizada
      }),
      ColoredBlockquote,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline hover:text-blue-800",
        },
      }),
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
      Underline,
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
    if (editor && initialContent && editor.isEmpty) {
      editor.commands.setContent(parseContent(initialContent));
    }
  }, [editor, initialContent]);

  const slashMenu = useSlashMenu(editor);

  if (!editor) {
    return (
      <div className="p-4 text-gray-400 animate-pulse">
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
