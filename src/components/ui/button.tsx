import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import { COLORS, BORDERS } from "@/lib/design-tokens";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
}

/* TOKENS: COLORS.primary, COLORS.neutral, BORDERS */
const variantStyles = {
  default: `${COLORS.primary.default} text-white hover:${COLORS.primary.dark}`,
  secondary: `${COLORS.neutral[100]} text-gray-800 hover:${COLORS.neutral[200]}`,
  outline: `border ${BORDERS.gray} bg-white text-gray-700 hover:${COLORS.neutral[50]}`,
  ghost: `text-gray-700 hover:${COLORS.neutral[100]}`,
};

const sizeStyles = {
  sm: "px-3 py-2 text-sm min-h-[36px]",
  md: "px-4 py-2.5 text-sm min-h-[44px]",
  lg: "px-6 py-3 text-base min-h-[48px]",
  icon: "h-11 w-11 p-2.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
