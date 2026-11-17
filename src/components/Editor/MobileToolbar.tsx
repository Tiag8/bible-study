/**
 * Barra de formatação do celular.
 *
 * Fica fixa logo acima do teclado enquanto o editor está em foco e substitui,
 * em telas de toque, o menu flutuante de seleção (que disputa espaço com o menu
 * nativo de copiar/colar do iOS e do Android) e o menu de "/" (que depende de
 * teclado físico). Os painéis secundários são os mesmos do desktop.
 */

"use client";

import { useEffect, useReducer, useRef, useState, type MouseEvent, type ReactNode } from "react";
import type { Editor } from "@tiptap/react";
import {
  Bold,
  BookOpen,
  ChevronDown,
  ChevronsDownUp,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Italic,
  Link2,
  List,
  ListOrdered,
  MessageSquare,
  Minus,
  Palette,
  Plus,
  Quote,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Underline,
  Undo2,
  Unlink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useKeyboardInset } from "@/hooks/useKeyboardInset";
import { FormatPanels } from "./BubbleMenu/FormatPanels";
import { useBubbleMenuHandlers } from "./BubbleMenu/useBubbleMenuHandlers";
import type { MenuMode } from "./BubbleMenu/types";

type MobileMode = MenuMode | "insert";

interface MobileToolbarProps {
  editor: Editor;
  /** Indicador curto (ex.: estado do salvamento) mostrado no início da barra. */
  status?: ReactNode;
  onAddReference?: (targetStudyId: string) => Promise<boolean>;
  onAddExternalLink?: (url: string) => Promise<boolean>;
  onDeleteReferenceByStudyId?: (targetStudyId: string) => Promise<boolean>;
}

interface ToolButtonProps {
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: ReactNode;
}

function ToolButton({ label, onClick, active = false, disabled = false, children }: ToolButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={cn(
        "flex h-11 min-w-[44px] shrink-0 items-center justify-center rounded-md transition-colors",
        active ? "bg-amber-light text-amber-dark" : "text-walnut active:bg-warm-white",
        disabled && "opacity-35"
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-6 w-px shrink-0 bg-linen" aria-hidden="true" />;
}

const DETAILS_BLOCK = {
  type: "details",
  content: [
    { type: "detailsSummary", content: [{ type: "text", text: "Toque para expandir" }] },
    { type: "detailsContent", content: [{ type: "paragraph" }] },
  ],
};

export function MobileToolbar({
  editor,
  status,
  onAddReference,
  onAddExternalLink,
  onDeleteReferenceByStudyId,
}: MobileToolbarProps) {
  const [mode, setMode] = useState<MobileMode>("default");
  const [linkUrl, setLinkUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [focused, setFocused] = useState(editor.isFocused);
  const barRef = useRef<HTMLDivElement>(null);

  // Os estados "ativo" dos botões dependem da seleção: redesenhar a cada transação.
  const [, redraw] = useReducer((count: number) => count + 1, 0);
  useEffect(() => {
    editor.on("transaction", redraw);
    return () => {
      editor.off("transaction", redraw);
    };
  }, [editor]);

  useEffect(() => {
    const onFocus = () => setFocused(true);
    const onBlur = () => {
      // O foco pode ter ido para um campo de um painel da própria barra.
      window.setTimeout(() => {
        if (editor.isDestroyed) return;
        const insideBar = barRef.current?.contains(document.activeElement) ?? false;
        setFocused(editor.isFocused || insideBar);
      }, 150);
    };
    editor.on("focus", onFocus);
    editor.on("blur", onBlur);
    return () => {
      editor.off("focus", onFocus);
      editor.off("blur", onBlur);
    };
  }, [editor]);

  const visible = focused || mode !== "default";
  const inset = useKeyboardInset(visible);

  // Outros elementos fixos no rodapé (ex.: botão de referências) saem do caminho.
  useEffect(() => {
    if (!visible) return;
    document.body.dataset.editing = "true";
    return () => {
      delete document.body.dataset.editing;
    };
  }, [visible]);

  const changeMode = (next: MobileMode) => {
    setMode(next);
    // Ao voltar de um painel, devolve o foco (e o teclado) ao texto.
    if (next === "default") editor.commands.focus();
  };

  const handlers = useBubbleMenuHandlers({
    editor,
    setMode: changeMode,
    setLinkUrl,
    setSearchQuery,
    onAddReference,
    onAddExternalLink,
    onDeleteReferenceByStudyId,
  });

  if (!visible) return null;

  // Tocar num botão não pode tirar o foco do texto, senão o teclado fecha.
  const keepEditorFocus = (event: MouseEvent<HTMLDivElement>) => {
    if (!(event.target as HTMLElement).closest("input, textarea")) event.preventDefault();
  };

  const run = (command: () => void) => () => {
    command();
    setMode("default");
  };

  const isLink = editor.isActive("link");
  const noSelection = editor.state.selection.empty;
  const isHeading = editor.isActive("heading");

  const insertItems: Array<{ label: string; icon: ReactNode; action: () => void }> = [
    { label: "Título 1", icon: <Heading1 className="h-5 w-5" />, action: () => editor.chain().focus().toggleHeading({ level: 1 }).run() },
    { label: "Título 2", icon: <Heading2 className="h-5 w-5" />, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: "Título 3", icon: <Heading3 className="h-5 w-5" />, action: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
    { label: "Lista", icon: <List className="h-5 w-5" />, action: () => editor.chain().focus().toggleBulletList().run() },
    { label: "Lista numerada", icon: <ListOrdered className="h-5 w-5" />, action: () => editor.chain().focus().toggleOrderedList().run() },
    { label: "Citação", icon: <Quote className="h-5 w-5" />, action: () => editor.chain().focus().toggleBlockquote().run() },
    { label: "Bloco recolhível", icon: <ChevronsDownUp className="h-5 w-5" />, action: () => editor.chain().focus().insertContent(DETAILS_BLOCK).run() },
    { label: "Linha divisória", icon: <Minus className="h-5 w-5" />, action: () => editor.chain().focus().setHorizontalRule().run() },
    { label: "Bloco de código", icon: <Code className="h-5 w-5" />, action: () => editor.chain().focus().toggleCodeBlock().run() },
  ];

  return (
    <div
      ref={barRef}
      data-mobile-toolbar
      onMouseDown={keepEditorFocus}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-linen bg-cream shadow-[0_-2px_10px_rgba(60,36,21,0.10)]"
      style={{
        transform: inset ? `translateY(-${inset}px)` : undefined,
        paddingBottom: inset ? undefined : "env(safe-area-inset-bottom)",
      }}
    >
      {mode === "insert" && (
        <div className="max-h-[45vh] overflow-y-auto border-b border-linen bg-white p-2">
          <div className="grid grid-cols-2 gap-1">
            {insertItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={run(item.action)}
                className="flex min-h-[48px] items-center gap-3 rounded-md px-3 text-left text-sm text-espresso active:bg-warm-white"
              >
                <span className="text-walnut" aria-hidden="true">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {mode !== "default" && mode !== "insert" && (
        // Campos em 16 px: abaixo disso o iOS dá zoom ao focar.
        <div className="flex max-h-[45vh] justify-center overflow-y-auto border-b border-linen bg-white [&_input]:text-base [&_textarea]:text-base [&_button]:min-h-[36px]">
          <FormatPanels
            editor={editor}
            mode={mode}
            setMode={changeMode}
            linkUrl={linkUrl}
            setLinkUrl={setLinkUrl}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handlers={handlers}
          />
        </div>
      )}

      <div className="flex h-12 items-center">
        {status && <div className="flex h-11 w-9 shrink-0 items-center justify-center">{status}</div>}

        <div
          role="toolbar"
          aria-label="Formatação do texto"
          className="flex flex-1 items-center gap-0.5 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <ToolButton label="Desfazer" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
            <Undo2 className="h-5 w-5" />
          </ToolButton>
          <ToolButton label="Refazer" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
            <Redo2 className="h-5 w-5" />
          </ToolButton>

          <Divider />

          <ToolButton label="Inserir bloco" onClick={() => setMode(mode === "insert" ? "default" : "insert")} active={mode === "insert"}>
            <Plus className="h-5 w-5" />
          </ToolButton>
          <ToolButton label="Títulos" onClick={() => setMode(mode === "heading" ? "default" : "heading")} active={isHeading || mode === "heading"}>
            <Heading1 className="h-5 w-5" />
          </ToolButton>

          <Divider />

          <ToolButton label="Negrito" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>
            <Bold className="h-5 w-5" />
          </ToolButton>
          <ToolButton label="Itálico" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}>
            <Italic className="h-5 w-5" />
          </ToolButton>
          <ToolButton label="Marca-texto" onClick={() => setMode(mode === "highlight" ? "default" : "highlight")} active={editor.isActive("highlight") || mode === "highlight"}>
            <Highlighter className="h-5 w-5" />
          </ToolButton>

          <Divider />

          <ToolButton label="Lista" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}>
            <List className="h-5 w-5" />
          </ToolButton>
          <ToolButton label="Lista numerada" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}>
            <ListOrdered className="h-5 w-5" />
          </ToolButton>
          <ToolButton label="Citação" onClick={() => setMode(mode === "quote" ? "default" : "quote")} active={editor.isActive("blockquote") || mode === "quote"}>
            <Quote className="h-5 w-5" />
          </ToolButton>

          <Divider />

          <ToolButton label="Comentário" onClick={() => setMode("comment")} disabled={noSelection || editor.isActive("comment")} active={mode === "comment"}>
            <MessageSquare className="h-5 w-5" />
          </ToolButton>
          <ToolButton label="Referenciar outro estudo" onClick={() => setMode("reference")} disabled={noSelection} active={mode === "reference"}>
            <BookOpen className="h-5 w-5" />
          </ToolButton>
          <ToolButton label="Link externo" onClick={() => setMode("link")} disabled={noSelection && !isLink} active={isLink || mode === "link"}>
            <Link2 className="h-5 w-5" />
          </ToolButton>
          {isLink && (
            <ToolButton label="Remover link" onClick={handlers.removeLink}>
              <Unlink className="h-5 w-5 text-red-700" />
            </ToolButton>
          )}

          <Divider />

          <ToolButton label="Sublinhado" onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")}>
            <Underline className="h-5 w-5" />
          </ToolButton>
          <ToolButton label="Tachado" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")}>
            <Strikethrough className="h-5 w-5" />
          </ToolButton>
          <ToolButton label="Cor do texto" onClick={() => setMode(mode === "textColor" ? "default" : "textColor")} active={mode === "textColor"}>
            <Palette className="h-5 w-5" />
          </ToolButton>
          <ToolButton label="Limpar formatação" onClick={handlers.clearFormatting}>
            <RemoveFormatting className="h-5 w-5" />
          </ToolButton>
        </div>

        <div className="shrink-0 border-l border-linen px-1">
          <ToolButton
            label="Fechar teclado"
            onClick={() => {
              setMode("default");
              editor.commands.blur();
            }}
          >
            <ChevronDown className="h-5 w-5" />
          </ToolButton>
        </div>
      </div>
    </div>
  );
}
