"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extensions";
import { Highlight } from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Details, DetailsSummary, DetailsContent } from "@tiptap/extension-details";
import { cn } from "@/lib/utils";
import { COLORS } from "@/lib/design-tokens";
import { EDITOR_DEBOUNCE_DELAY } from "@/lib/editor-constants";
import { parseContent } from "@/lib/editor-utils";
import { ColoredBlockquote } from "./ColoredBlockquote";
import { BubbleMenuComponent } from "./BubbleMenu"; // Agora aponta para BubbleMenu/index
import { SlashMenu } from "./SlashMenu";
import { useSlashMenu } from "./useSlashMenu";
import { EmojiMenu } from "./EmojiMenu";
import { useEmojiSuggestion } from "./useEmojiSuggestion";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import type { TiptapContent } from "@/types/database";

interface EditorProps {
  initialContent?: string | TiptapContent | null;
  onChange?: (content: string) => void;
  onUndoRedoChange?: (canUndo: boolean, canRedo: boolean) => void;
  onAddReference?: (targetStudyId: string) => Promise<boolean>;
  onAddExternalLink?: (url: string) => Promise<boolean>;
  onDeleteReferenceByStudyId?: (targetStudyId: string) => Promise<boolean>;
}

export interface EditorHandle {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  removeLink: (url: string) => void;
}

/**
 * Editor de texto rico usando Tiptap (extensível, headless)
 *
 * **Features:**
 * - Formatação rica (bold, italic, headings, lists, etc.)
 * - Blockquotes coloridos (7 cores)
 * - Highlight (6 cores marca-texto)
 * - Links externos + referências internas (bible-graph://)
 * - Slash commands (/ para menu)
 * - Notion-style shortcuts (> para toggle, | para quote)
 * - Auto-save com debounce (300ms)
 * - Undo/Redo com histórico limitado a 5 passos
 *
 * @param initialContent - Conteúdo inicial (JSON | HTML | objeto TiptapContent)
 * @param onChange - Callback quando conteúdo muda (formato: JSON string)
 * @param onUndoRedoChange - Callback quando status undo/redo muda
 * @ref Editor - Expõe métodos undo() e redo() e status canUndo/canRedo
 */
export const Editor = forwardRef<EditorHandle, EditorProps>(
  function Editor({ initialContent = "", onChange, onUndoRedoChange, onAddReference, onAddExternalLink, onDeleteReferenceByStudyId }: EditorProps, ref) {
  // Ref para prevenir sync loops (evita setContent quando conteúdo já é o mesmo)
  const lastSyncedContentRef = useRef<string | null>(null);

  // ✅ Memoizar parsed content para evitar remontagem do editor
  const parsedInitialContent = useMemo(
    () => parseContent(initialContent),
    [initialContent]
  );
  /* TOKENS: COLORS.neutral */

  // ✅ PERFORMANCE: Debounce onChange - reduz de 60 calls/s para ~3 calls/s
  // Evita sobrecarga de auto-save em digitação rápida
  const debouncedOnChange = useDebouncedCallback(
    (content: string) => onChange?.(content),
    EDITOR_DEBOUNCE_DELAY
  );

  // ✅ PERFORMANCE: Memoizar extensões para evitar recriação a cada render
  // Evita "Adding different instances of a keyed plugin" erro
  const extensions = useMemo(
    () => [
      StarterKit.configure({
        blockquote: false, // Usar nossa extensão customizada ColoredBlockquote
      }),
      ColoredBlockquote, // Extensão customizada com suporte a cores de blockquote
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
    []
  );

  const editor = useEditor({
    extensions,
    content: parsedInitialContent,
    immediatelyRender: false, // Fix SSR hydration mismatch
    editorProps: {
      attributes: {
        class: "tiptap prose prose-sm max-w-none p-4 focus:outline-none min-h-[300px]",
      },
    },
    onUpdate: ({ editor }) => {
      debouncedOnChange(JSON.stringify(editor.getJSON()));
    },
  });

  // Expor métodos undo/redo/removeLink via ref
  useImperativeHandle(ref, () => ({
    undo: () => editor?.commands.undo(),
    redo: () => editor?.commands.redo(),
    canUndo: editor?.can().undo() ?? false,
    canRedo: editor?.can().redo() ?? false,
    removeLink: (url: string) => {
      if (!editor) return;
      const doc = editor.state.doc;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      editor.chain()
        .focus()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .command(({ tr }: any) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          doc.descendants((node: any, pos: number) => {
            if (node.marks) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              node.marks.forEach((mark: any) => {
                if (mark.type.name === 'link') {
                  const href = mark.attrs.href;
                  if (href === url) {
                    tr.removeMark(pos, pos + node.nodeSize, mark.type);
                  }
                }
              });
            }
          });
          return true;
        })
        .run();
    },
  }), [editor]);

  /**
   * Sincroniza initialContent externo com estado interno do editor
   *
   * **Quando dispara:**
   * - Quando initialContent prop muda (ex: após carregar do DB)
   * - Quando editor é inicializado
   *
   * **Prevenção de loops:**
   * - Usa lastSyncedContentRef para evitar setContent quando conteúdo já é o mesmo
   * - Compara contentKey (string normalizada) ao invés de referências
   *
   * **Suporta formatos:**
   * - String JSON → parseado
   * - String HTML → sanitizado
   * - Objeto TiptapContent → usado direto
   */
  useEffect(() => {
    // Aguarda editor estar pronto
    if (!editor) return;

    // Normaliza conteúdo (parse + sanitize)
    const normalizedContent = parseContent(initialContent);

    // Cria chave única para comparação (evita setContent desnecessário)
    const contentKey =
      typeof normalizedContent === "string"
        ? normalizedContent
        : JSON.stringify(normalizedContent);

    // SKIP se conteúdo já foi aplicado (previne loop infinito)
    if (lastSyncedContentRef.current === contentKey) return;

    // Atualiza editor + marca como sincronizado
    editor.commands.setContent(normalizedContent);
    lastSyncedContentRef.current = contentKey;
  }, [editor, initialContent]);

  /**
   * Notifica pai sobre mudanças no status undo/redo
   * Dispara quando usuário faz undo/redo ou digita novo conteúdo
   */
  useEffect(() => {
    if (!editor) return;

    const updateUndoRedoStatus = () => {
      onUndoRedoChange?.(
        editor.can().undo(),
        editor.can().redo()
      );
    };

    // Atualiza imediatamente quando editor muda
    updateUndoRedoStatus();

    // Listen para mudanças (digitação, undo, redo, etc)
    editor.on("update", updateUndoRedoStatus);
    editor.on("selectionUpdate", updateUndoRedoStatus);

    return () => {
      editor.off("update", updateUndoRedoStatus);
      editor.off("selectionUpdate", updateUndoRedoStatus);
    };
  }, [editor, onUndoRedoChange]);

  const slashMenu = useSlashMenu(editor);
  const emojiMenu = useEmojiSuggestion(editor);

  if (!editor) {
    return (
      <div className={cn("p-4 animate-pulse", COLORS.neutral.text.light)}>
        Carregando editor...
      </div>
    );
  }

  return (
    <div className="relative">
      <style>{`
        /* Details (Toggle/Collapsible) Styling */
        .details-block {
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          padding: 0.75rem;
          margin: 0.5rem 0;
          background-color: #f9fafb;
        }

        .details-summary {
          cursor: pointer;
          display: flex;
          align-items: center;
          font-weight: 500;
          color: #1f2937;
          user-select: none;
          padding: 0.5rem;
          border-radius: 0.375rem;
          transition: background-color 0.2s;
          list-style: none;
        }

        .details-summary::-webkit-details-marker {
          margin-right: 0.5rem;
          color: #6b7280;
        }

        .details-summary:hover {
          background-color: #ede9fe;
        }

        .details-content {
          margin-top: 0.5rem;
          padding-left: 1rem;
          color: #374151;
          border-left: 2px solid #dbeafe;
          padding: 0.5rem 0.75rem 0.5rem 1rem;
        }

        /* Open state styling */
        details[open] .details-summary {
          color: #2563eb;
        }
      `}</style>

      <BubbleMenuComponent editor={editor} onAddReference={onAddReference} onAddExternalLink={onAddExternalLink} onDeleteReferenceByStudyId={onDeleteReferenceByStudyId} />
      <EditorContent editor={editor} />
      <SlashMenu
        editor={editor}
        isOpen={slashMenu.isOpen}
        position={slashMenu.position}
        onClose={slashMenu.close}
        onSelect={slashMenu.handleSelect}
      />
      <EmojiMenu
        isOpen={emojiMenu.isOpen}
        position={emojiMenu.position}
        emojis={emojiMenu.emojis}
        selectedIndex={emojiMenu.selectedIndex}
        query={emojiMenu.query}
        onSelect={emojiMenu.selectEmoji}
      />
    </div>
  );
  }
);
