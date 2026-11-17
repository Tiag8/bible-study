import { cn } from '@/lib/utils';
import { tagAccent } from '@/lib/theme-colors';

interface TagChipProps {
  name: string;
  /** Chave de cor gravada na tag (blue, purple, ...). */
  colorKey?: string | null;
  className?: string;
}

/**
 * Etiqueta no tema pergaminho: ponto na cor escolhida pelo usuário, tinta leve da mesma
 * cor e texto sempre em marrom (a leitura não depende da cor escolhida).
 */
export function TagChip({ name, colorKey, className }: TagChipProps) {
  const accent = tagAccent(colorKey);
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium text-espresso',
        className
      )}
      style={{
        backgroundColor: `color-mix(in srgb, ${accent} 12%, #f0eee4)`,
        borderColor: `color-mix(in srgb, ${accent} 28%, #f0eee4)`,
      }}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: accent }} aria-hidden="true" />
      <span className="truncate">{name}</span>
    </span>
  );
}
