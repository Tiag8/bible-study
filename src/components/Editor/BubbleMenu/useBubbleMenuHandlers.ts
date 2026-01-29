/**
 * ✅ REFACTORING: Hook centralizado com handlers do BubbleMenu
 *
 * Extrai toda a lógica de handlers para reutilização entre componentes.
 * Dependency injection via editor + setters para facilitar testes.
 */

import { useCallback } from "react";
import type { Editor } from "@tiptap/react";
import type { MenuMode } from "./types";

interface UseBubbleMenuHandlersProps {
  editor: Editor;
  setMode: (mode: MenuMode) => void;
  setLinkUrl: (url: string) => void;
  setSearchQuery: (query: string) => void;
  onAddReference?: (targetStudyId: string) => Promise<boolean>;
  onAddExternalLink?: (url: string) => Promise<boolean>;
  onDeleteReferenceByStudyId?: (targetStudyId: string) => Promise<boolean>;
}

export function useBubbleMenuHandlers({
  editor,
  setMode,
  setLinkUrl,
  setSearchQuery,
  onAddReference,
  onAddExternalLink,
  onDeleteReferenceByStudyId,
}: UseBubbleMenuHandlersProps) {
  /**
   * Define link externo na seleção atual
   * Story 4.3.2: Também salva no banco como referência externa
   */
  const handleSetLink = useCallback(async (url: string) => {
    if (url) {
      // Aplicar link visual no editor
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();

      // Story 4.3.2: Salvar link externo no banco (cria card no sidebar)
      if (onAddExternalLink && url.startsWith('http')) {
        await onAddExternalLink(url);
      }

      setLinkUrl("");
      setMode("default");
    }
  }, [editor, setLinkUrl, setMode, onAddExternalLink]);

  /**
   * Remove link da seleção atual
   * Se for um link de referência (/estudo/{id}), também remove do banco de dados
   */
  const handleRemoveLink = useCallback(async () => {
    // Obter URL do link antes de remover
    const mark = editor.getAttributes('link');
    const href = mark.href || '';

    // Se é um link de referência, extrair study_id e deletar
    if (href?.startsWith('/estudo/')) {
      const studyId = href.replace('/estudo/', '');
      if (onDeleteReferenceByStudyId) {
        await onDeleteReferenceByStudyId(studyId);
      }
    }

    editor.chain().focus().unsetLink().run();
  }, [editor, onDeleteReferenceByStudyId]);

  /**
   * Cria referência interna para outro estudo
   *
   * @param studyId - UUID do estudo
   * @param studyTitle - Título do estudo (para logs)
   */
  const handleReference = useCallback(async (studyId: string, studyTitle: string) => {
    const referenceUrl = `/estudo/${studyId}`;
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: referenceUrl })
      .run();
    setSearchQuery("");
    setMode("default");

    // Salvar referência no banco de dados
    if (onAddReference) {
      await onAddReference(studyId);
    }

    // ✅ CODE QUALITY: Console.log apenas em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log(`Referência criada para: ${studyTitle} (ID: ${studyId})`);
    }
  }, [editor, setSearchQuery, setMode, onAddReference]);

  /**
   * Aplica highlight (marca-texto) com cor específica
   */
  const handleHighlight = useCallback((color: string) => {
    editor.chain().focus().toggleHighlight({ color }).run();
    setMode("default");
  }, [editor, setMode]);

  /**
   * Remove highlight da seleção atual
   */
  const handleRemoveHighlight = useCallback(() => {
    editor.chain().focus().unsetHighlight().run();
    setMode("default");
  }, [editor, setMode]);

  /**
   * Aplica cor de texto
   */
  const handleTextColor = useCallback((color: string) => {
    editor.chain().focus().setColor(color).run();
    setMode("default");
  }, [editor, setMode]);

  /**
   * Remove cor de texto (volta ao padrão)
   */
  const handleRemoveTextColor = useCallback(() => {
    editor.chain().focus().unsetColor().run();
    setMode("default");
  }, [editor, setMode]);

  /**
   * Cria/atualiza blockquote com cor de borda
   *
   * Se já é blockquote, atualiza a cor.
   * Senão, cria blockquote e define a cor.
   */
  const handleSetBlockquote = useCallback((color: string) => {
    // Se já é blockquote, atualiza a cor; senão, cria com a cor
    if (editor.isActive("blockquote")) {
      editor.chain().focus().updateAttributes("blockquote", { borderColor: color }).run();
    } else {
      editor.chain().focus().toggleBlockquote().updateAttributes("blockquote", { borderColor: color }).run();
    }
    setMode("default");
  }, [editor, setMode]);

  /**
   * Remove blockquote da seleção atual
   */
  const handleRemoveBlockquote = useCallback(() => {
    editor.chain().focus().toggleBlockquote().run();
    setMode("default");
  }, [editor, setMode]);

  /**
   * Limpa toda formatação (nodes + marks)
   */
  const handleClearFormatting = useCallback(() => {
    editor.chain().focus().clearNodes().unsetAllMarks().run();
  }, [editor]);

  return {
    setLink: handleSetLink,
    removeLink: handleRemoveLink,
    setReference: handleReference,
    setHighlight: handleHighlight,
    removeHighlight: handleRemoveHighlight,
    setTextColor: handleTextColor,
    removeTextColor: handleRemoveTextColor,
    setBlockquote: handleSetBlockquote,
    removeBlockquote: handleRemoveBlockquote,
    clearFormatting: handleClearFormatting,
  };
}
