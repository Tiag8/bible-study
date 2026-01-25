"use client";

import { useState, useEffect, useCallback } from "react";
import type { Editor } from "@tiptap/react";

interface SlashMenuState {
  isOpen: boolean;
  position: { top: number; left: number };
  open: () => void;
  close: () => void;
  handleSelect: (type: string, data?: unknown) => void;
}

export function useSlashMenu(editor: Editor | null): SlashMenuState {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // Detecta a digitação de "/" para abrir o menu
  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Verifica se "/" foi pressionado
      if (event.key === "/" && !isOpen) {
        // Obtém a posição do cursor
        const { view } = editor;
        const { from } = view.state.selection;
        const coords = view.coordsAtPos(from);

        // Calcula a posição do menu
        setPosition({
          top: coords.bottom + 8,
          left: coords.left,
        });

        setIsOpen(true);
      }
    };

    // Adiciona listener ao editor DOM
    const editorDom = editor.view.dom;
    editorDom.addEventListener("keydown", handleKeyDown);

    return () => {
      editorDom.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor, isOpen]);

  // Fecha o menu quando clica fora
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".slash-menu") && !target.closest("[data-radix-popper-content-wrapper]")) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Foca de volta no editor
    editor?.commands.focus();
  }, [editor]);

  const handleSelect = useCallback(
    (type: string, data?: unknown) => {
      if (!editor) return;

      // Remove o "/" que acionou o menu
      const { from } = editor.state.selection;
      editor.commands.deleteRange({ from: from - 1, to: from });

      // Executa o comando baseado no tipo
      switch (type) {
        case "h1":
          editor.chain().focus().toggleHeading({ level: 1 }).run();
          break;
        case "h2":
          editor.chain().focus().toggleHeading({ level: 2 }).run();
          break;
        case "h3":
          editor.chain().focus().toggleHeading({ level: 3 }).run();
          break;
        case "bullet":
          editor.chain().focus().toggleBulletList().run();
          break;
        case "numbered":
          editor.chain().focus().toggleOrderedList().run();
          break;
        case "todo":
          // StarterKit não inclui TaskList, então usamos bullet como fallback
          editor.chain().focus().toggleBulletList().run();
          break;
        case "quote":
          editor.chain().focus().toggleBlockquote().run();
          break;
        case "code":
          editor.chain().focus().toggleCodeBlock().run();
          break;
        case "backlog":
          // O texto do backlog é inserido pelo SlashMenu component
          // Aqui poderíamos fazer chamadas de API
          console.log("Backlog data:", data);
          break;
        default:
          console.warn("Comando não reconhecido:", type);
      }

      setIsOpen(false);
    },
    [editor]
  );

  return {
    isOpen,
    position,
    open,
    close,
    handleSelect,
  };
}
