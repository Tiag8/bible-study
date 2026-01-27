"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { COLORS } from "@/lib/design-tokens";

interface BackButtonProps {
  /**
   * Destino do botão (padrão: "/" - dashboard)
   */
  href?: string;

  /**
   * Texto do botão (padrão: "Voltar")
   */
  label?: string;

  /**
   * Ícone (padrão: ArrowLeft)
   * - "arrow" - Seta para esquerda
   * - "home" - Ícone de casa (dashboard)
   */
  icon?: "arrow" | "home";

  /**
   * Callback antes de navegar (permite prevenção)
   * - Retornar `false` cancela a navegação
   * - Útil para checar unsaved changes
   */
  onBeforeNavigate?: () => boolean | void | Promise<boolean | void>;

  /**
   * Classes CSS adicionais
   */
  className?: string;
}

/**
 * ✅ CODE QUALITY: Componente compartilhado de navegação (DRY)
 *
 * Botão padronizado para voltar/navegar usado em múltiplas páginas.
 * Suporta verificação de unsaved changes via onBeforeNavigate.
 *
 * @example
 * // Simples (voltar para dashboard)
 * <BackButton />
 *
 * @example
 * // Com verificação de unsaved changes
 * <BackButton
 *   href="/?book=genesis"
 *   onBeforeNavigate={() => {
 *     if (hasUnsavedChanges) {
 *       return confirm("Descartar alterações?");
 *     }
 *   }}
 * />
 *
 * @example
 * // Com ícone de home
 * <BackButton label="Dashboard" icon="home" />
 */
export function BackButton({
  href = "/",
  label = "Voltar",
  icon = "arrow",
  onBeforeNavigate,
  className,
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = async () => {
    // Se tem callback de verificação, chama e respeita o resultado
    if (onBeforeNavigate) {
      const canNavigate = await onBeforeNavigate();
      if (canNavigate === false) {
        return; // Cancela navegação
      }
    }

    // Navega para o destino
    router.push(href);
  };

  const Icon = icon === "home" ? Home : ArrowLeft;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={cn(
        COLORS.neutral.text.muted,
        `hover:${COLORS.neutral.text.primary}`,
        className
      )}
    >
      <Icon className="w-4 h-4 mr-2" />
      {label}
    </Button>
  );
}
