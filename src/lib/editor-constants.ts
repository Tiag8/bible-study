/**
 * ✅ CODE QUALITY: Constantes centralizadas do editor (DRY principle)
 *
 * Cores, configurações e constantes compartilhadas entre componentes do Editor.
 */

/**
 * ✅ SECURITY: Whitelist de cores permitidas para blockquotes
 * Previne CSS injection via borderColor attribute
 */
export const ALLOWED_QUOTE_COLORS = new Set([
  "#ca8a04", // Amber
  "#3b82f6", // Blue
  "#16a34a", // Green
  "#9333ea", // Purple
  "#ea580c", // Orange
  "#db2777", // Pink
  "#6b7280", // Gray
]);

export const DEFAULT_BORDER_COLOR = "#3b82f6" as const;

/**
 * Cores disponíveis para highlight no BubbleMenu
 */
export const HIGHLIGHT_COLORS = [
  { name: "Amarelo", color: "#fef08a" },
  { name: "Verde", color: "#bbf7d0" },
  { name: "Azul", color: "#bfdbfe" },
  { name: "Rosa", color: "#fbcfe8" },
  { name: "Laranja", color: "#fed7aa" },
  { name: "Roxo", color: "#ddd6fe" },
] as const;

/**
 * Cores disponíveis para texto no BubbleMenu
 */
export const TEXT_COLORS = [
  { name: "Preto", color: "#1f2937" },
  { name: "Cinza", color: "#6b7280" },
  { name: "Vermelho", color: "#dc2626" },
  { name: "Laranja", color: "#ea580c" },
  { name: "Verde", color: "#16a34a" },
  { name: "Azul", color: "#2563eb" },
  { name: "Roxo", color: "#9333ea" },
  { name: "Rosa", color: "#db2777" },
] as const;

/**
 * Cores disponíveis para blockquotes (SlashMenu)
 */
export const QUOTE_COLORS = [
  { name: "Amarelo", color: "#ca8a04" },
  { name: "Azul", color: "#3b82f6" },
  { name: "Verde", color: "#16a34a" },
  { name: "Roxo", color: "#9333ea" },
  { name: "Laranja", color: "#ea580c" },
  { name: "Rosa", color: "#db2777" },
  { name: "Cinza", color: "#6b7280" },
] as const;

/**
 * Delay para debounce do onChange (milissegundos)
 */
export const EDITOR_DEBOUNCE_DELAY = 300 as const;

/**
 * ✅ SECURITY: Whitelist de comandos permitidos no SlashMenu
 * Previne command injection
 */
export const ALLOWED_COMMANDS = new Set([
  'h1', 'h2', 'h3', 'bullet', 'numbered', 'todo', 'quote', 'code', 'toggle', 'backlog'
]);
