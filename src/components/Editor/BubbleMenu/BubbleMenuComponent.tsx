/**
 * ✅ REFACTORING: BubbleMenu principal refatorado
 *
 * Orquestra os subcomponentes de acordo com o modo selecionado.
 * Código reduzido de 594 linhas para ~100 linhas através de componentização.
 */

"use client";

import React, { useEffect, useState } from "react";
import { BubbleMenu } from "@tiptap/react/menus";
import type { Editor } from "@tiptap/react";
import { cn } from "@/lib/utils";
import { BORDERS, SHADOW_CLASSES } from "@/lib/design-tokens";

import { useBubbleMenuHandlers } from "./useBubbleMenuHandlers";
import { BubbleMenuToolbar } from "./BubbleMenuToolbar";
import { FormatPanels } from "./FormatPanels";
import type { MenuMode } from "./types";

interface BubbleMenuComponentProps {
  editor: Editor;
  onAddReference?: (targetStudyId: string) => Promise<boolean>;
  onAddExternalLink?: (url: string) => Promise<boolean>;
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
function BubbleMenuComponentBase({ editor, onAddReference, onAddExternalLink, onDeleteReferenceByStudyId }: BubbleMenuComponentProps) {
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
    onAddExternalLink,
    onDeleteReferenceByStudyId,
  });

  // Sem isto, sair de um painel (link, referência, comentário) tocando fora fazia a
  // seleção seguinte reabrir o menu naquele painel em vez da barra principal.
  useEffect(() => {
    const resetWhenSelectionEmpties = () => {
      if (editor.state.selection.empty) setMode("default");
    };
    editor.on("selectionUpdate", resetWhenSelectionEmpties);
    return () => {
      editor.off("selectionUpdate", resetWhenSelectionEmpties);
    };
  }, [editor]);

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

      {/* Demais modos - painéis compartilhados com a barra do celular */}
      <FormatPanels
        editor={editor}
        mode={mode}
        setMode={setMode}
        linkUrl={linkUrl}
        setLinkUrl={setLinkUrl}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handlers={handlers}
      />
    </BubbleMenu>
  );
}

// ✅ PERFORMANCE: Exporta com React.memo (só re-renderiza se editor state mudar)
export const BubbleMenuComponent = React.memo(BubbleMenuComponentBase);
