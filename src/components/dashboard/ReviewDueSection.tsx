"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PARCHMENT } from "@/lib/design-tokens";
import { Button } from "@/components/ui/button";
import { useStudies } from "@/hooks";
import { REVIEW_INTERVALS_DAYS, isReviewDue, reviewLabel } from "@/lib/review-schedule";

/** "Para revisar": estudos concluídos com revisão vencendo hoje ou atrasada. */
export function ReviewDueSection() {
  const router = useRouter();
  const { studies, markReviewed } = useStudies();
  const [savingId, setSavingId] = useState<string | null>(null);

  const now = new Date();
  const due = studies
    .filter((s) => s.review_stage !== null && isReviewDue(s.next_review_at, now))
    .sort((a, b) => (a.next_review_at ?? "").localeCompare(b.next_review_at ?? ""));

  if (due.length === 0) return null;

  const handleReviewed = async (id: string) => {
    setSavingId(id);
    const schedule = await markReviewed(id);
    if (!schedule) {
      toast.error("Não foi possível registrar a revisão. Tente novamente.");
    } else if (schedule.next_review_at === null) {
      toast.success("Revisões deste estudo concluídas");
    } else {
      const days = REVIEW_INTERVALS_DAYS[schedule.review_stage ?? 0];
      toast.success(`Revisão registrada. A próxima é daqui a ${days} dias`);
    }
    setSavingId(null);
  };

  return (
    <section className="mb-8">
      <h2 className={cn("text-lg font-lora font-semibold mb-3 flex items-center gap-2", PARCHMENT.text.heading)}>
        <CalendarCheck className={cn("w-4 h-4", PARCHMENT.accent.text)} />
        Para revisar
        <span className={cn("text-sm font-inter font-normal", PARCHMENT.text.muted)}>({due.length})</span>
      </h2>
      <ul className="space-y-2">
        {due.map((study) => (
          <li
            key={study.id}
            className={cn(
              "bg-cream rounded-lg p-4 border flex flex-col sm:flex-row sm:items-center gap-3",
              PARCHMENT.border.default
            )}
          >
            <div className="flex-1 min-w-0">
              <p className={cn("font-medium truncate", PARCHMENT.text.heading)}>{study.title}</p>
              <p className={cn("text-sm", PARCHMENT.text.secondary)}>
                {study.book_name} {study.chapter_number}
                <span className={PARCHMENT.text.muted}> · {reviewLabel(study.review_stage ?? 0)}</span>
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/estudo/${study.id}`)}
                className="min-h-[44px] bg-warm-white border-linen text-walnut hover:bg-cream hover:text-espresso"
              >
                Abrir
              </Button>
              <Button
                size="sm"
                onClick={() => handleReviewed(study.id)}
                disabled={savingId === study.id}
                className="gap-2 min-h-[44px] bg-amber hover:bg-amber-dark text-white"
              >
                {savingId === study.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Revisei
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
