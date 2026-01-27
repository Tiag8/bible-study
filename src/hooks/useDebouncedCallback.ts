import { useRef, useCallback } from "react";

/**
 * ✅ PERFORMANCE: Hook para debounce de callbacks (reduz chamadas frequentes)
 *
 * Técnica de otimização que agrupa múltiplas chamadas em uma única execução
 * após um período de inatividade. Útil para inputs, auto-save, busca, etc.
 *
 * @template T - Tipo da função callback
 * @param callback - Função a ser debounced
 * @param delay - Delay em milissegundos após última chamada
 * @returns Função debounced com mesma assinatura da original
 *
 * @example
 * ```tsx
 * // Auto-save com debounce de 300ms
 * const debouncedSave = useDebouncedCallback((content: string) => {
 *   saveToDatabase(content);
 * }, 300);
 *
 * // Chama apenas 1x a cada 300ms (mesmo que dispare 60x/segundo)
 * onChange={(e) => debouncedSave(e.target.value)}
 * ```
 *
 * @example
 * ```tsx
 * // Busca com debounce de 500ms
 * const debouncedSearch = useDebouncedCallback(async (query: string) => {
 *   const results = await api.search(query);
 *   setResults(results);
 * }, 500);
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDebouncedCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  return useCallback(
    (...args: Parameters<T>) => {
      // Cancela timeout anterior
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Agenda nova chamada
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}
