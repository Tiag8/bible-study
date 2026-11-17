"use client";

import { useState } from "react";
import { CalendarPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PARCHMENT } from "@/lib/design-tokens";
import { useStudies, type StudySummary } from "@/hooks";
import { canStartSchedule } from "@/lib/review-schedule";

/**
 * "Agendar revisão" para estudo concluído antes da revisão espaçada existir.
 * Não renderiza nada para os demais estudos.
 */
export function ScheduleReviewButton({ study }: { study: StudySummary }) {
  const { startReviewSchedule } = useStudies();
  const [saving, setSaving] = useState(false);

  if (!canStartSchedule(study.status, study.review_stage)) return null;

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaving(true);
    const ok = await startReviewSchedule(study.id);
    if (ok) {
      toast.success("Revisão agendada para amanhã");
    } else {
      toast.error("Não foi possível agendar a revisão. Tente novamente.");
    }
    setSaving(false);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={saving}
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border transition-colors disabled:opacity-50",
        "bg-warm-white border-linen hover:bg-cream",
        PARCHMENT.text.secondary
      )}
      aria-label={`Agendar revisão de ${study.title}`}
    >
      {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <CalendarPlus className="w-3 h-3" />}
      Agendar revisão
    </button>
  );
}
