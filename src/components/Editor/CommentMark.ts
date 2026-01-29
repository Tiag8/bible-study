import { Mark, mergeAttributes } from "@tiptap/core";

/**
 * Custom Mark para comentarios inline no editor
 *
 * Armazena comentarios como marks no JSONB do Tiptap.
 * Persistencia automatica via auto-save existente.
 *
 * @example
 * editor.chain().focus().setMark('comment', {
 *   commentId: crypto.randomUUID(),
 *   commentText: 'Minha reflexao',
 *   createdAt: new Date().toISOString(),
 * }).run()
 */
export const CommentMark = Mark.create({
  name: "comment",

  // Impede sobreposicao de comentarios no mesmo trecho
  excludes: "comment",

  addAttributes() {
    return {
      commentId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-comment-id"),
        renderHTML: (attributes) => ({
          "data-comment-id": attributes.commentId,
        }),
      },
      commentText: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-comment-text"),
        renderHTML: (attributes) => ({
          "data-comment-text": attributes.commentText,
        }),
      },
      createdAt: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-comment-created-at"),
        renderHTML: (attributes) => ({
          "data-comment-created-at": attributes.createdAt,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-comment-id]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes({ class: "comment-highlight" }, HTMLAttributes),
      0,
    ];
  },
});
