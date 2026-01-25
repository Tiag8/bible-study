"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import { BubbleMenuComponent } from "./BubbleMenu";
import { SlashMenu } from "./SlashMenu";
import { useSlashMenu } from "./useSlashMenu";

interface EditorProps {
  initialContent?: string;
  onChange?: () => void;
}

export function Editor({ initialContent = "", onChange }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
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
    ],
    content: initialContent,
    immediatelyRender: false, // Fix SSR hydration mismatch
    editorProps: {
      attributes: {
        class: "tiptap prose prose-sm max-w-none p-4 focus:outline-none min-h-[300px]",
      },
    },
    onUpdate: () => {
      onChange?.();
    },
  });

  // Atualizar conteúdo quando initialContent mudar
  useEffect(() => {
    if (editor && initialContent && editor.isEmpty) {
      editor.commands.setContent(initialContent);
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
