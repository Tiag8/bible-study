import { Suspense } from "react";
import { cn } from "@/lib/utils";
import { PARCHMENT } from "@/lib/design-tokens";
import { GrafoPageClient } from "./GrafoPageClient";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Loader2 } from "lucide-react";

export default function GrafoPage() {
  return (
    <Suspense fallback={
      <div className={cn("flex h-dvh items-center justify-center", PARCHMENT.bg.page)}>
        <Loader2 className={cn("w-12 h-12 animate-spin", PARCHMENT.accent.text)} />
        <span className={cn("ml-4 text-xl", PARCHMENT.text.subheading)}>Carregando grafo...</span>
      </div>
    }>
      <GrafoPageClient />
    </Suspense>
  );
}
