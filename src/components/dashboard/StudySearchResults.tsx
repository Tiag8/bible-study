"use client";

import { useRouter } from "next/navigation";
import { FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PARCHMENT } from "@/lib/design-tokens";
import { useSearch } from "@/hooks/useSearch";

interface StudySearchResultsProps {
  query: string;
}

/** Estudos cujo título, livro ou texto contém a busca do painel. */
export function StudySearchResults({ query }: StudySearchResultsProps) {
  const router = useRouter();
  const { results, loading, error, active } = useSearch(query);

  if (!active) return null;

  return (
    <section className="mb-8" aria-live="polite">
      <h2 className={cn("text-lg font-lora font-semibold mb-3 flex items-center gap-2", PARCHMENT.text.heading)}>
        <FileText className={cn("w-4 h-4", PARCHMENT.accent.text)} />
        Nos seus estudos
      </h2>

      {loading ? (
        <div className={cn("flex items-center gap-2 py-4 text-sm", PARCHMENT.text.muted)}>
          <Loader2 className={cn("w-4 h-4 animate-spin", PARCHMENT.accent.text)} />
          Buscando nos seus estudos...
        </div>
      ) : error ? (
        <p className={cn("py-4 text-sm", PARCHMENT.text.secondary)}>{error}</p>
      ) : results.length === 0 ? (
        <p className={cn("py-4 text-sm", PARCHMENT.text.muted)}>
          Nenhum estudo encontrado para &ldquo;{query.trim()}&rdquo;
        </p>
      ) : (
        <ul className="space-y-2">
          {results.map((result) => (
            <li key={result.id}>
              <button
                type="button"
                onClick={() => router.push(`/estudo/${result.id}`)}
                className={cn(
                  "w-full text-left bg-cream rounded-lg p-4 border transition-colors min-h-[44px]",
                  PARCHMENT.border.default,
                  "hover:border-amber-light"
                )}
              >
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className={cn("font-medium", PARCHMENT.text.heading)}>{result.title}</span>
                  <span className={cn("text-xs", PARCHMENT.text.muted)}>
                    {result.book_name} {result.chapter_number}
                  </span>
                </div>
                {result.excerpt && (
                  <p className={cn("text-sm mt-1 line-clamp-2", PARCHMENT.text.secondary)}>{result.excerpt}</p>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
