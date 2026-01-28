/**
 * ✅ REFACTORING: BubbleMenu principal refatorado
 *
 * Orquestra os subcomponentes de acordo com o modo selecionado.
 * Código reduzido de 594 linhas para ~100 linhas através de componentização.
 */

"use client";

import React, { useState } from "react";
import { BubbleMenu } from "@tiptap/react/menus";
import type { Editor } from "@tiptap/react";
import { cn } from "@/lib/utils";
import { BORDERS, SHADOW_CLASSES } from "@/lib/design-tokens";

import { useBubbleMenuHandlers } from "./useBubbleMenuHandlers";
import { BubbleMenuToolbar } from "./BubbleMenuToolbar";
import { BubbleMenuHeading } from "./BubbleMenuHeading";
import { BubbleMenuLink } from "./BubbleMenuLink";
import { BubbleMenuReference } from "./BubbleMenuReference";
import { BubbleMenuHighlight } from "./BubbleMenuHighlight";
import { BubbleMenuTextColor } from "./BubbleMenuTextColor";
import { BubbleMenuQuote } from "./BubbleMenuQuote";
import type { MenuMode } from "./types";

interface BubbleMenuComponentProps {
  editor: Editor;
  onAddReference?: (targetStudyId: string) => Promise<boolean>;
  onDeleteReferenceByStudyId?: (targetStudyId: string) => Promise<boolean>;
}

/**
 * BubbleMenu principal - Toolbar de formatação que aparece ao selecionar texto
 *
 * Componente orquestrador que gerencia estado e delega rendering para subcomponentes.
 *
 * @example
 * <BubbleMenuComponent editor={editor} onAddReference={addReference} onDeleteReferenceByStudyId={deleteRefByStudyId} />
 */
function BubbleMenuComponentBase({ editor, onAddReference, onDeleteReferenceByStudyId }: BubbleMenuComponentProps) {
  // Estado do menu
  const [mode, setMode] = useState<MenuMode>("default");
  const [linkUrl, setLinkUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Handlers centralizados
  const handlers = useBubbleMenuHandlers({
    editor,
    setMode,
    setLinkUrl,
    setSearchQuery,
    onAddReference,
    onDeleteReferenceByStudyId,
  });

  return (
    <BubbleMenu
      editor={editor}
      options={{
        placement: "top",
        offset: 8,
      }}
      className={cn(
        "bg-white rounded-lg",
        SHADOW_CLASSES.lg,
        BORDERS.gray,
        "max-w-[min(calc(100vw-2rem),40rem)]"
      )}
    >
      {/* Modo default - Toolbar principal */}
      {mode === "default" && (
        <BubbleMenuToolbar
          editor={editor}
          setMode={setMode}
          handlers={handlers}
        />
      )}

      {/* Modo heading - Seleção de títulos */}
      {mode === "heading" && (
        <BubbleMenuHeading
          editor={editor}
          setMode={setMode}
        />
      )}

      {/* Modo link - Input de URL externa */}
      {mode === "link" && (
        <BubbleMenuLink
          editor={editor}
          setMode={setMode}
          linkUrl={linkUrl}
          setLinkUrl={setLinkUrl}
          onSetLink={() => handlers.setLink(linkUrl)}
        />
      )}

      {/* Modo reference - Busca de estudos */}
      {mode === "reference" && (
        <BubbleMenuReference
          editor={editor}
          setMode={setMode}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSelectReference={handlers.setReference}
        />
      )}

      {/* Modo highlight - Seleção de cor de marca-texto */}
      {mode === "highlight" && (
        <BubbleMenuHighlight
          editor={editor}
          setMode={setMode}
          onSelectColor={handlers.setHighlight}
          onRemoveColor={handlers.removeHighlight}
        />
      )}

      {/* Modo textColor - Seleção de cor de texto */}
      {mode === "textColor" && (
        <BubbleMenuTextColor
          editor={editor}
          setMode={setMode}
          onSelectColor={handlers.setTextColor}
          onRemoveColor={handlers.removeTextColor}
        />
      )}

      {/* Modo quote - Seleção de cor de citação */}
      {mode === "quote" && (
        <BubbleMenuQuote
          editor={editor}
          setMode={setMode}
          onSelectColor={handlers.setBlockquote}
          onRemoveColor={handlers.removeBlockquote}
        />
      )}
    </BubbleMenu>
  );
}

// ✅ PERFORMANCE: Exporta com React.memo (só re-renderiza se editor state mudar)
export const BubbleMenuComponent = React.memo(BubbleMenuComponentBase);
