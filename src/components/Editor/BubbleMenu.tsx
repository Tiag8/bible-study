"use client";

import { BubbleMenu } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import { useState, useCallback } from "react";
import { Link2, Unlink, BookOpen, ExternalLink, Loader2, Highlighter } from "lucide-react";
import { useStudies } from "@/hooks";
import { cn } from "@/lib/utils";

interface BubbleMenuComponentProps {
  editor: Editor;
}

type MenuMode = "default" | "link" | "reference" | "highlight";

const HIGHLIGHT_COLORS = [
  { name: "Amarelo", color: "#fef08a", textColor: "#000" },
  { name: "Verde", color: "#bbf7d0", textColor: "#000" },
  { name: "Azul", color: "#bfdbfe", textColor: "#000" },
  { name: "Rosa", color: "#fbcfe8", textColor: "#000" },
  { name: "Laranja", color: "#fed7aa", textColor: "#000" },
  { name: "Roxo", color: "#ddd6fe", textColor: "#000" },
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
    // Cria um link interno para o estudo referenciado
    const referenceUrl = `bible-graph://study/${studyId}`;
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: referenceUrl, target: "_self" })
      .run();
    setSearchQuery("");
    setMode("default");

    // TODO: Aqui seria feita a chamada para criar o link bidirecional no banco
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

  const filteredStudies = studies.filter((study) =>
    study.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    study.book_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isLinkActive = editor.isActive("link");

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{ duration: 100, placement: "top" }}
      className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
    >
      {mode === "default" && (
        <div className="flex items-center gap-1 p-1">
          <button
            onClick={() => setMode("link")}
            className={cn(
              "p-2 rounded hover:bg-gray-100 transition-colors",
              isLinkActive && "text-blue-600 bg-blue-50"
            )}
            title="Adicionar link externo"
          >
            <Link2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setMode("reference")}
            className="p-2 rounded hover:bg-gray-100 transition-colors"
            title="Referenciar outro estudo"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          <button
            onClick={() => setMode("highlight")}
            className={cn(
              "p-2 rounded hover:bg-gray-100 transition-colors",
              editor.isActive("highlight") && "text-yellow-600 bg-yellow-50"
            )}
            title="Marca-texto"
          >
            <Highlighter className="w-4 h-4" />
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

          <div className="w-px h-6 bg-gray-200 mx-1" />

          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn(
              "p-2 rounded hover:bg-gray-100 transition-colors font-bold",
              editor.isActive("bold") && "text-blue-600 bg-blue-50"
            )}
          >
            B
          </button>

          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn(
              "p-2 rounded hover:bg-gray-100 transition-colors italic",
              editor.isActive("italic") && "text-blue-600 bg-blue-50"
            )}
          >
            I
          </button>
        </div>
      )}

      {mode === "link" && (
        <div className="p-2 w-72">
          <div className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-gray-400" />
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
            className="mt-2 text-xs text-gray-500 hover:text-gray-700"
          >
            ← Voltar
          </button>
        </div>
      )}

      {mode === "reference" && (
        <div className="p-2 w-80">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-gray-400" />
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
                <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
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
        <div className="p-2 w-48">
          <div className="flex items-center gap-2 mb-2">
            <Highlighter className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Marca-texto</span>
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
            className="mt-2 text-xs text-gray-500 hover:text-gray-700"
          >
            ← Voltar
          </button>
        </div>
      )}
    </BubbleMenu>
  );
}
