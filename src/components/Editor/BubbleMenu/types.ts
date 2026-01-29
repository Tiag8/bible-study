/**
 * ✅ REFACTORING: Types compartilhados do BubbleMenu
 *
 * Centraliza tipos para evitar duplicação entre subcomponentes.
 */

import type { Editor } from "@tiptap/react";

/**
 * Modos disponíveis no BubbleMenu
 */
export type MenuMode = "default" | "link" | "reference" | "highlight" | "textColor" | "heading" | "quote" | "comment";

/**
 * Props base para componentes do BubbleMenu
 */
export interface BubbleMenuBaseProps {
  /**
   * Instância do editor Tiptap
   */
  editor: Editor;

  /**
   * Callback para mudar o modo do menu
   */
  setMode: (mode: MenuMode) => void;
}

/**
 * Props para componentes que precisam de handlers de formatação
 */
export interface BubbleMenuFormattingProps extends BubbleMenuBaseProps {
  /**
   * Handlers para ações de formatação
   */
  handlers: {
    setLink: (url: string) => void;
    removeLink: () => void;
    setReference: (studyId: string, studyTitle: string) => void;
    setHighlight: (color: string) => void;
    removeHighlight: () => void;
    setTextColor: (color: string) => void;
    removeTextColor: () => void;
    setBlockquote: (color: string) => void;
    removeBlockquote: () => void;
    clearFormatting: () => void;
  };
}

/**
 * Props para BubbleMenuLink
 */
export interface BubbleMenuLinkProps extends BubbleMenuBaseProps {
  /**
   * Valor atual da URL
   */
  linkUrl: string;

  /**
   * Callback para atualizar URL
   */
  setLinkUrl: (url: string) => void;

  /**
   * Handler para confirmar link
   */
  onSetLink: () => void;
}

/**
 * Props para BubbleMenuReference
 */
export interface BubbleMenuReferenceProps extends BubbleMenuBaseProps {
  /**
   * Query de busca de estudos
   */
  searchQuery: string;

  /**
   * Callback para atualizar query
   */
  setSearchQuery: (query: string) => void;

  /**
   * Handler para selecionar estudo
   */
  onSelectReference: (studyId: string, studyTitle: string) => void;
}

/**
 * Props para componentes de seleção de cor (Highlight, TextColor, Quote)
 */
export interface BubbleMenuColorProps extends BubbleMenuBaseProps {
  /**
   * Handler para aplicar cor
   */
  onSelectColor: (color: string) => void;

  /**
   * Handler para remover cor (opcional)
   */
  onRemoveColor?: () => void;
}
