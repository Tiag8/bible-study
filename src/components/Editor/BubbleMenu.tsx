"use client";

import { BubbleMenu } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import { useState, useCallback } from "react";
import {
  Link2,
  Unlink,
  BookOpen,
  ExternalLink,
  Loader2,
  Highlighter,
  Palette,
  Quote,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Code,
  Heading1,
  Heading2,
  Heading3,
  RemoveFormatting,
} from "lucide-react";
import { useStudies } from "@/hooks";
import { cn } from "@/lib/utils";

interface BubbleMenuComponentProps {
  editor: Editor;
}

type MenuMode = "default" | "link" | "reference" | "highlight" | "textColor" | "heading" | "quote";

const HIGHLIGHT_COLORS = [
  { name: "Amarelo", color: "#fef08a" },
  { name: "Verde", color: "#bbf7d0" },
  { name: "Azul", color: "#bfdbfe" },
  { name: "Rosa", color: "#fbcfe8" },
  { name: "Laranja", color: "#fed7aa" },
  { name: "Roxo", color: "#ddd6fe" },
];

const TEXT_COLORS = [
  { name: "Preto", color: "#1f2937" },
  { name: "Cinza", color: "#6b7280" },
  { name: "Vermelho", color: "#dc2626" },
  { name: "Laranja", color: "#ea580c" },
  { name: "Verde", color: "#16a34a" },
  { name: "Azul", color: "#2563eb" },
  { name: "Roxo", color: "#9333ea" },
  { name: "Rosa", color: "#db2777" },
];

const QUOTE_COLORS = [
  { name: "Amarelo", color: "#ca8a04" },
  { name: "Azul", color: "#3b82f6" },
  { name: "Verde", color: "#16a34a" },
  { name: "Roxo", color: "#9333ea" },
  { name: "Laranja", color: "#ea580c" },
  { name: "Rosa", color: "#db2777" },
  { name: "Cinza", color: "#6b7280" },
];

export function BubbleMenuComponent({ editor }: BubbleMenuComponentProps) {
  const [mode, setMode] = useState<MenuMode>("default");
  const [linkUrl, setLinkUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Hook Supabase
  const { studies, loading: studiesLoading } = useStudies();

  const handleSetLink = useCallback(() => {
    if (linkUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run();
      setLinkUrl("");
      setMode("default");
    }
  }, [editor, linkUrl]);

  const handleRemoveLink = useCallback(() => {
    editor.chain().focus().unsetLink().run();
  }, [editor]);

  const handleReference = useCallback((studyId: string, studyTitle: string) => {
    const referenceUrl = `bible-graph://study/${studyId}`;
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: referenceUrl, target: "_self" })
      .run();
    setSearchQuery("");
    setMode("default");
    console.log(`Referência criada para: ${studyTitle} (ID: ${studyId})`);
  }, [editor]);

  const handleHighlight = useCallback((color: string) => {
    editor.chain().focus().toggleHighlight({ color }).run();
    setMode("default");
  }, [editor]);

  const handleRemoveHighlight = useCallback(() => {
    editor.chain().focus().unsetHighlight().run();
    setMode("default");
  }, [editor]);

  const handleTextColor = useCallback((color: string) => {
    editor.chain().focus().setColor(color).run();
    setMode("default");
  }, [editor]);

  const handleRemoveTextColor = useCallback(() => {
    editor.chain().focus().unsetColor().run();
    setMode("default");
  }, [editor]);

  const handleSetBlockquote = useCallback((color: string) => {
    // Se já é blockquote, atualiza a cor; senão, cria com a cor
    if (editor.isActive("blockquote")) {
      editor.chain().focus().updateAttributes("blockquote", { borderColor: color }).run();
    } else {
      editor.chain().focus().toggleBlockquote().updateAttributes("blockquote", { borderColor: color }).run();
    }
    setMode("default");
  }, [editor]);

  const handleRemoveBlockquote = useCallback(() => {
    editor.chain().focus().toggleBlockquote().run();
    setMode("default");
  }, [editor]);

  const handleClearFormatting = useCallback(() => {
    editor.chain().focus().clearNodes().unsetAllMarks().run();
  }, [editor]);

  const filteredStudies = studies.filter((study) =>
    study.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    study.book_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isLinkActive = editor.isActive("link");

  // Base button style with black icons - compact for horizontal fit
  const buttonBase = "p-1.5 rounded hover:bg-gray-100 transition-colors text-gray-700";
  const buttonActive = "text-blue-600 bg-blue-50";

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{ duration: 100, placement: "top" }}
      className="bg-white rounded-lg shadow-lg border border-gray-200"
    >
      {mode === "default" && (
        <div className="flex items-center gap-0.5 p-1.5 flex-nowrap min-w-max">
          {/* Formatting Group */}
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn(buttonBase, editor.isActive("bold") && buttonActive)}
            title="Negrito (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn(buttonBase, editor.isActive("italic") && buttonActive)}
            title="Itálico (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={cn(buttonBase, editor.isActive("underline") && buttonActive)}
            title="Sublinhado (Ctrl+U)"
          >
            <Underline className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={cn(buttonBase, editor.isActive("strike") && buttonActive)}
            title="Tachado"
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={cn(buttonBase, editor.isActive("code") && buttonActive)}
            title="Código"
          >
            <Code className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-gray-300 mx-1" />

          {/* Headings */}
          <button
            onClick={() => setMode("heading")}
            className={cn(
              buttonBase,
              (editor.isActive("heading", { level: 1 }) ||
                editor.isActive("heading", { level: 2 }) ||
                editor.isActive("heading", { level: 3 })) && buttonActive
            )}
            title="Títulos"
          >
            <Heading1 className="w-4 h-4" />
          </button>

          {/* Lists */}
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn(buttonBase, editor.isActive("bulletList") && buttonActive)}
            title="Lista com marcadores"
          >
            <List className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={cn(buttonBase, editor.isActive("orderedList") && buttonActive)}
            title="Lista numerada"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <button
            onClick={() => setMode("quote")}
            className={cn(buttonBase, editor.isActive("blockquote") && buttonActive)}
            title="Citação"
          >
            <Quote className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-gray-300 mx-1" />

          {/* Colors & Highlight */}
          <button
            onClick={() => setMode("highlight")}
            className={cn(
              buttonBase,
              editor.isActive("highlight") && "text-yellow-600 bg-yellow-50"
            )}
            title="Marca-texto"
          >
            <Highlighter className="w-4 h-4" />
          </button>

          <button
            onClick={() => setMode("textColor")}
            className={cn(buttonBase)}
            title="Cor do texto"
          >
            <Palette className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-gray-300 mx-1" />

          {/* Links */}
          <button
            onClick={() => setMode("link")}
            className={cn(buttonBase, isLinkActive && buttonActive)}
            title="Adicionar link externo"
          >
            <Link2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setMode("reference")}
            className={cn(buttonBase)}
            title="Referenciar outro estudo"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {isLinkActive && (
            <button
              onClick={handleRemoveLink}
              className="p-2 rounded hover:bg-gray-100 text-red-600 transition-colors"
              title="Remover link"
            >
              <Unlink className="w-4 h-4" />
            </button>
          )}

          <div className="w-px h-5 bg-gray-300 mx-1" />

          {/* Clear Formatting */}
          <button
            onClick={handleClearFormatting}
            className={cn(buttonBase)}
            title="Limpar formatação"
          >
            <RemoveFormatting className="w-4 h-4" />
          </button>
        </div>
      )}

      {mode === "heading" && (
        <div className="p-3 w-56">
          <div className="flex items-center gap-2 mb-3">
            <Heading1 className="w-4 h-4 text-gray-900" />
            <span className="text-sm font-medium text-gray-900">Títulos</span>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => {
                editor.chain().focus().toggleHeading({ level: 1 }).run();
                setMode("default");
              }}
              className={cn(
                "w-full text-left px-3 py-2 rounded hover:bg-gray-100 flex items-center gap-2 text-gray-900",
                editor.isActive("heading", { level: 1 }) && "bg-blue-50 text-blue-600"
              )}
            >
              <Heading1 className="w-5 h-5" />
              <span className="text-lg font-bold">Título 1</span>
            </button>

            <button
              onClick={() => {
                editor.chain().focus().toggleHeading({ level: 2 }).run();
                setMode("default");
              }}
              className={cn(
                "w-full text-left px-3 py-2 rounded hover:bg-gray-100 flex items-center gap-2 text-gray-900",
                editor.isActive("heading", { level: 2 }) && "bg-blue-50 text-blue-600"
              )}
            >
              <Heading2 className="w-5 h-5" />
              <span className="text-base font-semibold">Título 2</span>
            </button>

            <button
              onClick={() => {
                editor.chain().focus().toggleHeading({ level: 3 }).run();
                setMode("default");
              }}
              className={cn(
                "w-full text-left px-3 py-2 rounded hover:bg-gray-100 flex items-center gap-2 text-gray-900",
                editor.isActive("heading", { level: 3 }) && "bg-blue-50 text-blue-600"
              )}
            >
              <Heading3 className="w-5 h-5" />
              <span className="text-sm font-semibold">Título 3</span>
            </button>

            <button
              onClick={() => {
                editor.chain().focus().setParagraph().run();
                setMode("default");
              }}
              className={cn(
                "w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-gray-900",
                !editor.isActive("heading") && "bg-blue-50 text-blue-600"
              )}
            >
              <span className="text-sm">Parágrafo normal</span>
            </button>
          </div>

          <button
            onClick={() => setMode("default")}
            className="mt-3 text-xs text-gray-500 hover:text-gray-700"
          >
            ← Voltar
          </button>
        </div>
      )}

      {mode === "link" && (
        <div className="p-3 w-80">
          <div className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-gray-900" />
            <input
              type="url"
              placeholder="https://..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSetLink();
                }
                if (e.key === "Escape") {
                  setMode("default");
                  setLinkUrl("");
                }
              }}
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              onClick={handleSetLink}
              disabled={!linkUrl}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              OK
            </button>
          </div>
          <button
            onClick={() => {
              setMode("default");
              setLinkUrl("");
            }}
            className="mt-3 text-xs text-gray-500 hover:text-gray-700"
          >
            ← Voltar
          </button>
        </div>
      )}

      {mode === "reference" && (
        <div className="p-3 w-80">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-gray-900" />
            <input
              type="text"
              placeholder="Buscar estudo para referenciar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setMode("default");
                  setSearchQuery("");
                }
              }}
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          <div className="max-h-48 overflow-y-auto">
            {studiesLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-4 h-4 text-gray-700 animate-spin" />
                <span className="ml-2 text-sm text-gray-500">Carregando...</span>
              </div>
            ) : filteredStudies.length > 0 ? (
              filteredStudies.map((study) => (
                <button
                  key={study.id}
                  onClick={() => handleReference(study.id, study.title)}
                  className="w-full text-left px-2 py-2 text-sm hover:bg-gray-100 rounded transition-colors"
                >
                  <div className="font-medium text-gray-900 truncate">
                    {study.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {study.book_name} {study.chapter_number} • {study.status === "completed" ? "Concluído" : "Rascunho"}
                  </div>
                </button>
              ))
            ) : (
              <div className="text-sm text-gray-500 text-center py-4">
                Nenhum estudo encontrado
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setMode("default");
              setSearchQuery("");
            }}
            className="mt-2 text-xs text-gray-500 hover:text-gray-700"
          >
            ← Voltar
          </button>
        </div>
      )}

      {mode === "highlight" && (
        <div className="p-3 w-52">
          <div className="flex items-center gap-2 mb-3">
            <Highlighter className="w-4 h-4 text-gray-900" />
            <span className="text-sm font-medium text-gray-900">Marca-texto</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {HIGHLIGHT_COLORS.map((hl) => (
              <button
                key={hl.color}
                onClick={() => handleHighlight(hl.color)}
                className="w-full aspect-square rounded-md border-2 border-transparent hover:border-gray-400 transition-colors"
                style={{ backgroundColor: hl.color }}
                title={hl.name}
              />
            ))}
          </div>

          {editor.isActive("highlight") && (
            <button
              onClick={handleRemoveHighlight}
              className="w-full mt-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
            >
              Remover marca-texto
            </button>
          )}

          <button
            onClick={() => setMode("default")}
            className="mt-3 text-xs text-gray-500 hover:text-gray-700"
          >
            ← Voltar
          </button>
        </div>
      )}

      {mode === "textColor" && (
        <div className="p-3 w-52">
          <div className="flex items-center gap-2 mb-3">
            <Palette className="w-4 h-4 text-gray-900" />
            <span className="text-sm font-medium text-gray-900">Cor do texto</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {TEXT_COLORS.map((tc) => (
              <button
                key={tc.color}
                onClick={() => handleTextColor(tc.color)}
                className="w-full aspect-square rounded-full border-2 border-gray-200 hover:border-gray-400 transition-colors flex items-center justify-center"
                style={{ backgroundColor: tc.color }}
                title={tc.name}
              >
                <span className="text-white text-xs font-bold drop-shadow-sm">A</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleRemoveTextColor}
            className="w-full mt-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded transition-colors"
          >
            Cor padrão
          </button>

          <button
            onClick={() => setMode("default")}
            className="mt-3 text-xs text-gray-500 hover:text-gray-700"
          >
            ← Voltar
          </button>
        </div>
      )}

      {mode === "quote" && (
        <div className="p-3 w-60">
          <div className="flex items-center gap-2 mb-3">
            <Quote className="w-4 h-4 text-gray-900" />
            <span className="text-sm font-medium text-gray-900">Cor da citação</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {QUOTE_COLORS.map((qc) => (
              <button
                key={qc.color}
                onClick={() => handleSetBlockquote(qc.color)}
                className="w-full aspect-square rounded-md border-2 border-gray-200 hover:border-gray-400 transition-colors flex items-center justify-center"
                style={{
                  backgroundColor: '#f3f4f6',
                  borderLeftWidth: '4px',
                  borderLeftColor: qc.color
                }}
                title={qc.name}
              >
                <Quote className="w-4 h-4" style={{ color: qc.color }} />
              </button>
            ))}
          </div>

          {editor.isActive("blockquote") && (
            <button
              onClick={handleRemoveBlockquote}
              className="w-full mt-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
            >
              Remover citação
            </button>
          )}

          <button
            onClick={() => setMode("default")}
            className="mt-3 text-xs text-gray-500 hover:text-gray-700"
          >
            ← Voltar
          </button>
        </div>
      )}
    </BubbleMenu>
  );
}
