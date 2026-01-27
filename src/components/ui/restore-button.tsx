'use client';

import { useState } from 'react';
import { RotateCcw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { COLORS } from '@/lib/design-tokens';

export interface RestoreButtonProps {
  studyId: string;
  studyTitle: string;
  onRestore?: (studyId: string) => void | Promise<void>;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export function RestoreButton({
  studyId,
  studyTitle,
  onRestore,
  disabled = false,
  className,
  variant = 'outline',
  size = 'md',
}: RestoreButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleRestore = async () => {
    try {
      setLoading(true);
      toast.loading(`Restaurando "${studyTitle}"...`);

      if (onRestore) {
        await onRestore(studyId);
      }

      toast.dismiss();
      toast.success(`"${studyTitle}" restaurado com sucesso`);
    } catch (err) {
      toast.dismiss();
      toast.error(`Erro ao restaurar "${studyTitle}"`);
      console.error('Restore error:', err);
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  const variantClasses = {
    default:
      `${COLORS.primary.default} text-white hover:${COLORS.primary.dark} focus:ring-blue-500`,
    ghost:
      `${COLORS.neutral.text.secondary} ${COLORS.neutral[100]} focus:ring-gray-300`,
    outline:
      `border ${COLORS.neutral.text.secondary} hover:${COLORS.neutral[50]} focus:ring-gray-300`,
  };

  return (
    <button
      onClick={handleRestore}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center gap-2',
        'rounded-lg font-medium',
        'transition-all focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      aria-label={`Restaurar ${studyTitle}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <RotateCcw className="w-4 h-4" />
      )}
      <span>Restaurar</span>
    </button>
  );
}
