'use client';

import { useState } from 'react';
import { RotateCcw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface RestoreButtonProps {
  studyId: string;
  studyTitle: string;
  /** Deve devolver true quando o estudo foi restaurado. */
  onRestore: (studyId: string) => Promise<boolean>;
  disabled?: boolean;
  className?: string;
}

export function RestoreButton({
  studyId,
  studyTitle,
  onRestore,
  disabled = false,
  className,
}: RestoreButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleRestore = async () => {
    setLoading(true);
    const toastId = toast.loading(`Restaurando "${studyTitle}"...`);
    try {
      const ok = await onRestore(studyId);
      if (ok) {
        toast.success(`"${studyTitle}" foi restaurado`, { id: toastId });
      } else {
        toast.error(`Não foi possível restaurar "${studyTitle}". Tente novamente.`, { id: toastId });
      }
    } catch (err) {
      console.error('[TRASH] restore ERROR:', err);
      toast.error(`Não foi possível restaurar "${studyTitle}". Tente novamente.`, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRestore}
      disabled={disabled || loading}
      className={cn('gap-2 bg-warm-white border-linen text-walnut hover:bg-cream hover:text-espresso', className)}
      aria-label={`Restaurar ${studyTitle}`}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
      <span>Restaurar</span>
    </Button>
  );
}
