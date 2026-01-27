"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Editor } from "@tiptap/react";
import {
  BookMarked,
  ListTodo,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  ChevronRight,
} from "lucide-react";
import { bibleBooks } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { COLORS, BORDERS, SHADOWS } from "@/lib/design-tokens";

interface SlashMenuProps {
  editor: Editor;
  isOpen: boolean;
  position: { top: number; left: number };
  onClose: () => void;
  onSelect: (type: string, data?: unknown) => void;
}

interface MenuItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  type: "command" | "backlog";
}

const menuItems: MenuItem[] = [
  {
    id: "backlog",
    label: "Adicionar ao Backlog",
    description: "Adiciona uma referência para estudar depois",
    icon: <BookMarked className="w-4 h-4" />,
    type: "backlog",
  },
  {
    id: "h1",
    label: "Título Grande",
    description: "Cabeçalho de seção principal",
    icon: <Heading1 className="w-4 h-4" />,
    type: "command",
  },
  {
    id: "h2",
    label: "Título Médio",
    description: "Subcabeçalho de seção",
    icon: <Heading2 className="w-4 h-4" />,
    type: "command",
  },
  {
    id: "h3",
    label: "Título Pequeno",
    description: "Subtítulo de seção",
    icon: <Heading3 className="w-4 h-4" />,
    type: "command",
  },
  {
    id: "bullet",
    label: "Lista com Marcadores",
    description: "Cria uma lista não ordenada",
    icon: <List className="w-4 h-4" />,
    type: "command",
  },
  {
    id: "numbered",
    label: "Lista Numerada",
    description: "Cria uma lista ordenada",
    icon: <ListOrdered className="w-4 h-4" />,
    type: "command",
  },
  {
    id: "todo",
    label: "Lista de Tarefas",
    description: "Cria uma lista com checkboxes",
    icon: <ListTodo className="w-4 h-4" />,
    type: "command",
  },
  {
    id: "toggle",
    label: "Lista de Alternantes",
    description: "Cria uma lista que expande/colapsa",
    icon: <ChevronRight className="w-4 h-4" />,
    type: "command",
  },
  {
    id: "quote",
    label: "Citação",
    description: "Adiciona um bloco de citação",
    icon: <Quote className="w-4 h-4" />,
    type: "command",
  },
  {
    id: "code",
    label: "Código",
    description: "Adiciona um bloco de código",
    icon: <Code className="w-4 h-4" />,
    type: "command",
  },
];

export function SlashMenu({
  editor,
  isOpen,
  position,
  onClose,
  onSelect,
}: SlashMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [query, setQuery] = useState("");
  const [showBacklogForm, setShowBacklogForm] = useState(false);
  const [backlogReference, setBacklogReference] = useState("");
  const [bookSuggestions, setBookSuggestions] = useState<string[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

  const filteredItems = menuItems.filter(
    (item) =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase())
  );

  // Atualiza sugestões de livros conforme digita
  useEffect(() => {
    if (backlogReference.length > 0) {
      const matches = bibleBooks.filter((book) =>
        book.toLowerCase().startsWith(backlogReference.toLowerCase())
      );
      setBookSuggestions(matches.slice(0, 5));
    } else {
      setBookSuggestions([]);
    }
  }, [backlogReference]);

  // Reset quando menu abre/fecha
  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0);
      setQuery("");
      setShowBacklogForm(false);
      setBacklogReference("");
    }
  }, [isOpen]);

  // Handler para seleção de item (definido antes do useEffect que o usa)
  const handleItemSelect = useCallback(
    (item: MenuItem) => {
      if (item.type === "backlog") {
        setShowBacklogForm(true);
      } else {
        onSelect(item.id);
        onClose();
      }
    },
    [onSelect, onClose]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (showBacklogForm) {
        if (e.key === "Escape") {
          setShowBacklogForm(false);
          setBacklogReference("");
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredItems.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredItems.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (filteredItems[selectedIndex]) {
            handleItemSelect(filteredItems[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, filteredItems, showBacklogForm, onClose, handleItemSelect]);

  const handleBacklogSubmit = useCallback(() => {
    if (backlogReference.trim()) {
      onSelect("backlog", { reference: backlogReference.trim() });

      // TODO: Aqui seria feita a chamada para adicionar ao backlog no banco
      console.log(`Adicionado ao backlog: ${backlogReference.trim()}`);

      // Insere um marcador no editor
      editor
        .chain()
        .focus()
        .insertContent(`📖 [Backlog: ${backlogReference.trim()}]`)
        .run();

      setBacklogReference("");
      setShowBacklogForm(false);
      onClose();
    }
  }, [backlogReference, editor, onSelect, onClose]);

  const handleSuggestionSelect = useCallback((book: string) => {
    setBacklogReference(book + " ");
  }, []);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className={cn("fixed z-50 bg-white rounded-lg overflow-hidden w-[min(18rem,calc(100vw-2rem))]", SHADOWS.lg, BORDERS.gray)}
      style={{
        top: position.top,
        left: Math.min(position.left, typeof window !== 'undefined' ? window.innerWidth - 300 : position.left)
      }}
    >
      {/* TOKENS: COLORS.primary, COLORS.neutral, BORDERS */}
      {!showBacklogForm ? (
        <>
          <div className="p-2 border-b border-gray-100">
            <input
              type="text"
              placeholder="Filtrar comandos..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              className="w-full px-2 py-1 text-sm border-0 focus:outline-none"
              autoFocus
            />
          </div>

          <div className="max-h-64 overflow-y-auto py-1">
            {filteredItems.length > 0 ? (
              filteredItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => handleItemSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    "w-full flex items-start gap-3 px-3 py-2 text-left transition-colors",
                    selectedIndex === index
                      ? `${COLORS.primary.light} ${COLORS.primary.text}`
                      : `hover:${COLORS.neutral[50]}`
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5",
                      selectedIndex === index ? COLORS.primary.text : COLORS.neutral.text.light
                    )}
                  >
                    {item.icon}
                  </span>
                  <div>
                    <div className="font-medium text-sm">{item.label}</div>
                    <div className="text-xs text-gray-500">
                      {item.description}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className={cn("px-3 py-4 text-sm text-center", COLORS.neutral.text.muted)}>
                Nenhum comando encontrado
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <BookMarked className={cn("w-4 h-4", COLORS.primary.text)} />
            <span className="font-medium text-sm">Adicionar ao Backlog</span>
          </div>

          <input
            type="text"
            placeholder="Ex: Êxodo 20 ou Mateus 5-7"
            value={backlogReference}
            onChange={(e) => setBacklogReference(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleBacklogSubmit();
              }
              if (e.key === "Escape") {
                setShowBacklogForm(false);
                setBacklogReference("");
              }
            }}
            className={cn("w-full px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-2", BORDERS.gray, "focus:ring-blue-500")}
            autoFocus
          />

          {bookSuggestions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {bookSuggestions.map((book) => (
                <button
                  key={book}
                  onClick={() => handleSuggestionSelect(book)}
                  className={cn("px-2 py-1 text-xs rounded transition-colors", COLORS.neutral[100], `hover:${COLORS.neutral[200]}`)}
                >
                  {book}
                </button>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={() => {
                setShowBacklogForm(false);
                setBacklogReference("");
              }}
              className={cn("px-3 py-1.5 text-sm transition-colors", COLORS.neutral.text.secondary, `hover:${COLORS.neutral.text.primary}`)}
            >
              Cancelar
            </button>
            <button
              onClick={handleBacklogSubmit}
              disabled={!backlogReference.trim()}
              className={cn("px-3 py-1.5 text-sm text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed", COLORS.primary.default, `hover:${COLORS.primary.dark}`)}
            >
              Adicionar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
