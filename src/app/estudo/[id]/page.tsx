import { Suspense } from "react";
import { cn } from "@/lib/utils";
import { COLORS } from "@/lib/design-tokens";
import { StudyPageClient } from "./StudyPageClient";
import { Loader2 } from "lucide-react";

interface StudyPageProps {
  params: Promise<{ id: string }>;
}

export default function StudyPage({ params }: StudyPageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className={cn("w-8 h-8 animate-spin", COLORS.primary.text)} />
        <span className={cn("ml-3", COLORS.neutral.text.muted)}>Carregando estudo...</span>
      </div>
    }>
      <StudyPageClient params={params} />
    </Suspense>
  );
}
