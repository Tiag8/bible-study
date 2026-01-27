import Blockquote from "@tiptap/extension-blockquote";
import { ALLOWED_QUOTE_COLORS, DEFAULT_BORDER_COLOR } from "@/lib/editor-constants";
import { validateColor } from "@/lib/editor-utils";

/**
 * Valida cor de blockquote contra whitelist
 *
 * @param color - Cor a validar
 * @returns Cor validada ou padrão
 */
function validateQuoteColor(color: string): string {
  return validateColor(color, ALLOWED_QUOTE_COLORS, DEFAULT_BORDER_COLOR);
}

// Extensão customizada do Blockquote com suporte a cores validadas
export const ColoredBlockquote = Blockquote.extend({
  addAttributes() {
    return {
      borderColor: {
        default: DEFAULT_BORDER_COLOR,
        parseHTML: (element) => {
          const color = element.style.borderLeftColor || DEFAULT_BORDER_COLOR;
          // ✅ SECURITY: Valida cor ao parsear HTML
          return validateQuoteColor(color);
        },
        renderHTML: (attributes) => {
          // ✅ SECURITY: Valida cor antes de renderizar
          const safeColor = validateQuoteColor(attributes.borderColor);
          return {
            style: `border-left-color: ${safeColor}`,
          };
        },
      },
    };
  },
});
