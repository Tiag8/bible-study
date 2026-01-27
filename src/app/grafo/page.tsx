import { Suspense } from "react";
import { cn } from "@/lib/utils";
import { COLORS } from "@/lib/design-tokens";
import { GrafoPageClient } from "./GrafoPageClient";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Loader2 } from "lucide-react";

export default function GrafoPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center" style={{ backgroundColor: '#030712' }}>
        <Loader2 className={cn("w-12 h-12 animate-spin", COLORS.primary.text)} />
        <span className={cn("ml-4 text-xl", COLORS.neutral.text.muted)}>Carregando grafo...</span>
      </div>
    }>
      <GrafoPageClient />
    </Suspense>
  );
}
