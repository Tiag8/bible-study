import { cn } from "@/lib/utils";
import { forwardRef } from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

/* Tema pergaminho: fundo warm-white, borda linho, texto espresso, foco âmbar escuro */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "w-full px-3 py-2 text-base md:text-sm text-espresso",
          "bg-warm-white border border-linen rounded-md",
          "placeholder:text-stone",
          "focus:outline-none focus:ring-2 focus:ring-amber-dark focus:border-transparent",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
