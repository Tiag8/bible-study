import Blockquote from "@tiptap/extension-blockquote";

// Extensão customizada do Blockquote com suporte a cores
export const ColoredBlockquote = Blockquote.extend({
  addAttributes() {
    return {
      borderColor: {
        default: "#3b82f6", // Azul padrão
        parseHTML: (element) => element.style.borderLeftColor || "#3b82f6",
        renderHTML: (attributes) => {
          return {
            style: `border-left-color: ${attributes.borderColor}`,
          };
        },
      },
    };
  },
});
