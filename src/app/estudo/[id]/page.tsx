import { Suspense } from "react";
import { cn } from "@/lib/utils";
import { PARCHMENT } from "@/lib/design-tokens";
import { StudyPageClient } from "./StudyPageClient";
import { Loader2 } from "lucide-react";

interface StudyPageProps {
  params: Promise<{ id: string }>;
}

export default function StudyPage({ params }: StudyPageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-parchment flex items-center justify-center">
        <Loader2 className={cn("w-8 h-8 animate-spin", PARCHMENT.accent.text)} />
        <span className={cn("ml-3", PARCHMENT.text.muted)}>Carregando estudo...</span>
      </div>
    }>
      <StudyPageClient params={params} />
    </Suspense>
  );
}
