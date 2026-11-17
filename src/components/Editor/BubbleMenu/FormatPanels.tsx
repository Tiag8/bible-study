/**
 * Painéis secundários de formatação (título, link, referência, cores, citação, comentário).
 *
 * Compartilhados entre o menu flutuante do desktop (BubbleMenuComponent) e a
 * barra fixa do celular (MobileToolbar), para as duas superfícies terem as mesmas ações.
 */

"use client";

import type { Editor } from "@tiptap/react";
import type { useBubbleMenuHandlers } from "./useBubbleMenuHandlers";
import { BubbleMenuHeading } from "./BubbleMenuHeading";
import { BubbleMenuLink } from "./BubbleMenuLink";
import { BubbleMenuReference } from "./BubbleMenuReference";
import { BubbleMenuHighlight } from "./BubbleMenuHighlight";
import { BubbleMenuTextColor } from "./BubbleMenuTextColor";
import { BubbleMenuQuote } from "./BubbleMenuQuote";
import { BubbleMenuComment } from "./BubbleMenuComment";
import type { MenuMode } from "./types";

interface FormatPanelsProps {
  editor: Editor;
  mode: MenuMode;
  setMode: (mode: MenuMode) => void;
  linkUrl: string;
  setLinkUrl: (url: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handlers: ReturnType<typeof useBubbleMenuHandlers>;
}

export function FormatPanels({
  editor,
  mode,
  setMode,
  linkUrl,
  setLinkUrl,
  searchQuery,
  setSearchQuery,
  handlers,
}: FormatPanelsProps) {
  switch (mode) {
    case "heading":
      return <BubbleMenuHeading editor={editor} setMode={setMode} />;
    case "link":
      return (
        <BubbleMenuLink
          editor={editor}
          setMode={setMode}
          linkUrl={linkUrl}
          setLinkUrl={setLinkUrl}
          onSetLink={() => handlers.setLink(linkUrl)}
        />
      );
    case "reference":
      return (
        <BubbleMenuReference
          editor={editor}
          setMode={setMode}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSelectReference={handlers.setReference}
        />
      );
    case "highlight":
      return (
        <BubbleMenuHighlight
          editor={editor}
          setMode={setMode}
          onSelectColor={handlers.setHighlight}
          onRemoveColor={handlers.removeHighlight}
        />
      );
    case "textColor":
      return (
        <BubbleMenuTextColor
          editor={editor}
          setMode={setMode}
          onSelectColor={handlers.setTextColor}
          onRemoveColor={handlers.removeTextColor}
        />
      );
    case "quote":
      return (
        <BubbleMenuQuote
          editor={editor}
          setMode={setMode}
          onSelectColor={handlers.setBlockquote}
          onRemoveColor={handlers.removeBlockquote}
        />
      );
    case "comment":
      return <BubbleMenuComment editor={editor} setMode={setMode} onSave={handlers.setComment} />;
    default:
      return null;
  }
}
