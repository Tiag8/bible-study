import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import { COLORS, BORDERS } from "@/lib/design-tokens";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

/* TOKENS: COLORS.primary, COLORS.neutral, BORDERS */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          `w-full px-3 py-2 text-sm ${COLORS.neutral.text.primary}`,
          `bg-white ${BORDERS.gray} rounded-md`,
          `placeholder:${COLORS.neutral.text.light}`,
          `focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`,
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
