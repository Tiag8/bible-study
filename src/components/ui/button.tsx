import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
}

/*
 * Tema pergaminho. Primário: âmbar escuro #8B6508 com texto branco (5,30:1) e hover
 * #6B4E0A (7,72:1). Os demais em superfícies creme/linho com texto espresso/nogueira.
 */
const variantStyles = {
  default: "bg-amber-dark text-white hover:bg-[#6B4E0A]",
  secondary: "bg-linen text-espresso hover:bg-parchment",
  outline: "border border-linen bg-warm-white text-walnut hover:bg-linen hover:text-espresso",
  ghost: "text-walnut hover:bg-warm-white hover:text-espresso",
};

const sizeStyles = {
  sm: "px-3 py-2 text-sm min-h-[44px] min-w-[44px] md:min-h-[36px] md:min-w-0",
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
          "focus:outline-none focus:ring-2 focus:ring-amber-dark focus:ring-offset-2 focus:ring-offset-cream disabled:opacity-50 disabled:cursor-not-allowed",
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
