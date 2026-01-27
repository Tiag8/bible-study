/**
 * ✅ REFACTORING: Barrel export para BubbleMenu modularizado
 *
 * Exporta todos os subcomponentes e utilities do BubbleMenu.
 */

export { BubbleMenuComponent } from "./BubbleMenuComponent";
export { BubbleMenuToolbar } from "./BubbleMenuToolbar";
export { BubbleMenuHeading } from "./BubbleMenuHeading";
export { BubbleMenuLink } from "./BubbleMenuLink";
export { BubbleMenuReference } from "./BubbleMenuReference";
export { BubbleMenuHighlight } from "./BubbleMenuHighlight";
export { BubbleMenuTextColor } from "./BubbleMenuTextColor";
export { BubbleMenuQuote } from "./BubbleMenuQuote";

export { useBubbleMenuHandlers } from "./useBubbleMenuHandlers";

export type {
  MenuMode,
  BubbleMenuBaseProps,
  BubbleMenuFormattingProps,
  BubbleMenuLinkProps,
  BubbleMenuReferenceProps,
  BubbleMenuColorProps,
} from "./types";
