import { cn } from "@/lib/utils";
import { COLORS, BORDERS } from "@/lib/design-tokens";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "outline";
  className?: string;
}

/* TOKENS: COLORS.primary, COLORS.neutral, BORDERS */
const variantStyles = {
  default: `${COLORS.primary.default} text-white`,
  secondary: `${COLORS.neutral[100]} text-gray-800`,
  outline: `${BORDERS.gray} text-gray-700 bg-transparent`,
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
