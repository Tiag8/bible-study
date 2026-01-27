import { Suspense } from "react";
import { cn } from "@/lib/utils";
import { COLORS } from "@/lib/design-tokens";
import { DashboardClient } from "./DashboardClient";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className={cn("w-8 h-8 animate-spin", COLORS.primary.text)} />
        <span className={cn("ml-3", COLORS.neutral.text.muted)}>Carregando...</span>
      </div>
    }>
      <DashboardClient />
    </Suspense>
  );
}
