import { Suspense } from "react";
import { cn } from "@/lib/utils";
import { PARCHMENT } from "@/lib/design-tokens";
import { DashboardClient } from "./DashboardClient";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-parchment">
        <Loader2 className={cn("w-8 h-8 animate-spin", PARCHMENT.accent.text)} />
        <span className={cn("ml-3", PARCHMENT.text.muted)}>Carregando...</span>
      </div>
    }>
      <DashboardClient />
    </Suspense>
  );
}
