import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "outline";
  className?: string;
}

/* Tema pergaminho: âmbar escuro com branco (5,30:1), linho com espresso, contorno linho */
const variantStyles = {
  default: "bg-amber-dark text-white",
  secondary: "bg-linen text-espresso",
  outline: "border border-linen text-walnut bg-transparent",
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
