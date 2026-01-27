"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Editor } from "@tiptap/react";
import { searchEmojis, type EmojiData } from "@/lib/emoji-data";

interface EmojiMenuState {
  isOpen: boolean;
  position: { top: number; left: number };
  emojis: EmojiData[];
  query: string;
  selectedIndex: number;
}

/**
 * Hook para gerenciar emoji suggestion com trigger ":"
 * Suporta navegação com setas e seleção com Enter
 *
 * Padrão de uso:
 * 1. Digite ":" para abrir menu
 * 2. Digite nome do emoji (ex: ":fire", ":love")
 * 3. Navegue com ↑↓ ou clique
 * 4. Pressione Enter ou clique para selecionar
 */
export function useEmojiSuggestion(editor: Editor | null) {
  const [state, setState] = useState<EmojiMenuState>({
    isOpen: false,
    position: { top: 0, left: 0 },
    emojis: [],
    query: "",
    selectedIndex: 0,
  });

  const triggerPosRef = useRef<number | null>(null);

  /**
   * Insere emoji selecionado no editor
   * Remove ":" + query e insere emoji com espaço
   */
  const selectEmoji = useCallback(
    (emoji: EmojiData) => {
      if (!editor) return;

      const { from } = editor.state.selection;

      // Encontra a posição do ":" antes do cursor
      const textBefore = editor.state.doc.textBetween(
        Math.max(0, from - 50),
        from
      );

      const colonPos = textBefore.lastIndexOf(":");

      if (colonPos === -1) return;

      // Calcula posições absolutas para delete/insert
      const deleteFrom = from - (textBefore.length - colonPos);
      const deleteTo = from;

      // Remove ":" + query e insere emoji com espaço
      editor
        .chain()
        .focus()
        .deleteRange({ from: deleteFrom, to: deleteTo })
        .insertContent(emoji.emoji + " ")
        .run();

      // Fecha menu e reseta state
      setState((prev) => ({ ...prev, isOpen: false }));
      triggerPosRef.current = null;
    },
    [editor]
  );

  // Detecta ":" digitado e abre menu
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!editor) return;

      // ESCAPE: fecha menu
      if (event.key === "Escape" && state.isOpen) {
        event.preventDefault();
        setState((prev) => ({ ...prev, isOpen: false }));
        return;
      }

      // Se menu está aberto, processa navegação
      if (state.isOpen) {
        // ArrowDown: próximo emoji
        if (event.key === "ArrowDown") {
          event.preventDefault();
          setState((prev) => ({
            ...prev,
            selectedIndex: Math.min(
              prev.selectedIndex + 1,
              prev.emojis.length - 1
            ),
          }));
          return;
        }

        // ArrowUp: emoji anterior
        if (event.key === "ArrowUp") {
          event.preventDefault();
          setState((prev) => ({
            ...prev,
            selectedIndex: Math.max(prev.selectedIndex - 1, 0),
          }));
          return;
        }

        // Enter: seleciona emoji atual
        if (event.key === "Enter") {
          event.preventDefault();
          const selected = state.emojis[state.selectedIndex];
          if (selected) selectEmoji(selected);
          return;
        }

        // Backspace dentro de ":" - atualiza query
        if (event.key === "Backspace") {
          // Deixa o keyup/input handler atualizar
          return;
        }
      }
    },
    [editor, state.isOpen, state.selectedIndex, state.emojis, selectEmoji]
  );

  // Detecta digitação normal e atualiza query
  const handleInput = useCallback(() => {
    if (!editor) return;

    const { from } = editor.state.selection;
    const textBeforeCursor = editor.state.doc.textBetween(
      Math.max(0, from - 50),
      from
    );

    // Padrão: ":" seguido de letras/números/underscore
    const emojiMatch = textBeforeCursor.match(/:([a-z0-9_]*)$/i);

    if (!emojiMatch) {
      // Não está no padrão ":query" - fecha menu se estava aberto
      setState((prev) => (prev.isOpen ? { ...prev, isOpen: false } : prev));
      return;
    }

    // Está no padrão - abre/atualiza menu
    const newQuery = emojiMatch[1];

    // Se é a primeira vez que vê ":", abre com posição
    if (!state.isOpen) {
      const { view } = editor;
      const coords = view.coordsAtPos(from);
      triggerPosRef.current = from;

      setState({
        isOpen: true,
        position: {
          top: coords.bottom + 8,
          left: coords.left,
        },
        emojis: searchEmojis(newQuery),
        query: newQuery,
        selectedIndex: 0,
      });
    } else {
      // Já está aberto, atualiza query e resultados
      setState((prev) => ({
        ...prev,
        query: newQuery,
        emojis: searchEmojis(newQuery),
        selectedIndex: 0,
      }));
    }
  }, [editor, state.isOpen]);

  // Fecha menu ao clicar fora
  useEffect(() => {
    if (!state.isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".emoji-menu")) {
        setState((prev) => ({ ...prev, isOpen: false }));
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [state.isOpen]);

  // Adiciona event listeners ao editor
  useEffect(() => {
    if (!editor) return;

    const editorDom = editor.view.dom;
    editorDom.addEventListener("keydown", handleKeyDown);
    editorDom.addEventListener("input", handleInput);

    return () => {
      editorDom.removeEventListener("keydown", handleKeyDown);
      editorDom.removeEventListener("input", handleInput);
    };
  }, [editor, handleKeyDown, handleInput]);

  return {
    isOpen: state.isOpen,
    position: state.position,
    emojis: state.emojis,
    query: state.query,
    selectedIndex: state.selectedIndex,
    selectEmoji,
    close: () => setState((prev) => ({ ...prev, isOpen: false })),
  };
}
