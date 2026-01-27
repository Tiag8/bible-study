"use client";

import { useState, useEffect, useCallback } from "react";
import type { Editor } from "@tiptap/react";
import { ALLOWED_COMMANDS } from "@/lib/editor-constants";

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

  // ✅ PERFORMANCE: useCallback para estabilizar event handlers (previne memory leak)
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!editor || isOpen) return;

    // Verifica se "/" foi pressionado
    if (event.key === "/") {
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
  }, [editor, isOpen]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (!editor) return;

    // Detecta prefixos ">" e "|" para atalhos tipo Notion
    if ((event.key === ">" || event.key === "|") && event.shiftKey) {
      setTimeout(() => {
        const { state } = editor;
        const { from } = state.selection;

        // Obtém o texto antes do cursor
        const text = state.doc.textBetween(Math.max(0, from - 2), from);

        if (event.key === ">" && text.includes(">")) {
          // Remove ">" e cria toggle (Details)
          const start = Math.max(0, from - 1);
          editor.chain().focus().deleteRange({ from: start, to: from }).run();

          // Cria Details block com conteúdo padrão
          editor
            .chain()
            .focus()
            .insertContent({
              type: "details",
              content: [
                {
                  type: "detailsSummary",
                  content: [{ type: "text", text: "Clique para expandir" }],
                },
                {
                  type: "detailsContent",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "" }] }],
                },
              ],
            })
            .run();
        } else if (event.key === "|" && text.includes("|")) {
          // Remove "|" e cria quote
          const start = Math.max(0, from - 1);
          editor.chain().focus().deleteRange({ from: start, to: from }).run();
          editor.chain().focus().toggleBlockquote().run();
        }
      }, 0);
    }
  }, [editor]);

  // Detecta a digitação de "/" para abrir o menu e prefixos ">" e "|" para atalhos
  useEffect(() => {
    if (!editor) return;

    // ✅ PERFORMANCE: Handlers estabilizados via useCallback
    const editorDom = editor.view.dom;
    editorDom.addEventListener("keydown", handleKeyDown);
    editorDom.addEventListener("keyup", handleKeyUp);

    return () => {
      editorDom.removeEventListener("keydown", handleKeyDown);
      editorDom.removeEventListener("keyup", handleKeyUp);
    };
  }, [editor, handleKeyDown, handleKeyUp]);

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

      // ✅ SECURITY: Whitelist de comandos permitidos (previne command injection)
      if (!ALLOWED_COMMANDS.has(type)) {
        if (process.env.NODE_ENV === 'development') {
          console.error('[SECURITY] Invalid command blocked:', type);
        }
        return; // Bloqueia comando inválido
      }

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
        case "toggle":
          // Extensão oficial Details do Tiptap v3
          // Inserir um bloco details com summary e content
          editor
            .chain()
            .focus()
            .insertContent({
              type: "details",
              content: [
                {
                  type: "detailsSummary",
                  content: [{ type: "text", text: "Clique para expandir" }],
                },
                {
                  type: "detailsContent",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "" }] }],
                },
              ],
            })
            .run();
          break;
        case "backlog":
          // O texto do backlog é inserido pelo SlashMenu component
          // Aqui poderíamos fazer chamadas de API
          if (process.env.NODE_ENV === 'development') {
            console.log("Backlog data:", data);
          }
          break;
        default:
          if (process.env.NODE_ENV === 'development') {
            console.warn("Comando não reconhecido:", type);
          }
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
