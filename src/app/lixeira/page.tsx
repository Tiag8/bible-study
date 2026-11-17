"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PARCHMENT } from "@/lib/design-tokens";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { RestoreButton } from "@/components/ui/restore-button";
import { useAuth } from "@/contexts/AuthContext";
import { useStudies } from "@/hooks";
import { useSoftDelete, type DeletedStudy } from "@/hooks/useSoftDelete";

function formatDeletedAt(value: string): string {
  const date = new Date(value);
  const day = date.toLocaleDateString("pt-BR");
  const time = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${day} às ${time}`;
}

export default function LixeiraPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { fetchStudies } = useStudies();
  const { deletedStudies, loading, error, fetchDeletedStudies, restore, purge } = useSoftDelete();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toPurge, setToPurge] = useState<DeletedStudy | null>(null);
  const [purging, setPurging] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    fetchDeletedStudies();
  }, [fetchDeletedStudies]);

  const handleRestore = async (studyId: string) => {
    const ok = await restore(studyId);
    if (ok) await fetchStudies();
    return ok;
  };

  const handleConfirmPurge = async () => {
    if (!toPurge) return;
    setPurging(true);
    const ok = await purge(toPurge.id);
    if (ok) {
      toast.success(`"${toPurge.title}" foi apagado definitivamente`);
      setToPurge(null);
    } else {
      toast.error("Não foi possível apagar o estudo. Tente novamente.");
    }
    setPurging(false);
  };

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-parchment">
        <Loader2 className={cn("w-8 h-8 animate-spin", PARCHMENT.accent.text)} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-parchment">
      <div className="hidden lg:block">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="p-4 md:p-6 max-w-4xl mx-auto w-full">
          <Link
            href="/"
            className={cn(
              "lg:hidden inline-flex items-center gap-2 mb-4 min-h-[44px] text-sm font-medium",
              PARCHMENT.text.secondary,
              "hover:text-walnut"
            )}
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>

          <div className="mb-6">
            <h1 className={cn("text-2xl md:text-3xl font-lora font-bold", PARCHMENT.text.heading)}>Lixeira</h1>
            <p className={cn("mt-2 text-sm md:text-base", PARCHMENT.text.secondary)}>
              Estudos apagados ficam aqui até você restaurá-los ou apagá-los definitivamente.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className={cn("w-6 h-6 animate-spin", PARCHMENT.accent.text)} />
              <span className={cn("ml-3", PARCHMENT.text.muted)}>Carregando...</span>
            </div>
          ) : error ? (
            <div className={cn("bg-cream rounded-lg p-6 border text-center", PARCHMENT.border.default)}>
              <p className={PARCHMENT.text.secondary}>{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 bg-warm-white border-linen text-walnut hover:bg-cream"
                onClick={() => fetchDeletedStudies()}
              >
                Tentar novamente
              </Button>
            </div>
          ) : deletedStudies.length === 0 ? (
            <div className="text-center py-16">
              <Trash2 className="w-12 h-12 mx-auto mb-3 text-linen" />
              <p className={cn("font-lora text-lg", PARCHMENT.text.secondary)}>A lixeira está vazia</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {deletedStudies.map((study) => (
                <li
                  key={study.id}
                  className={cn(
                    "bg-cream rounded-lg p-4 border flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4",
                    PARCHMENT.border.default
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <h2 className={cn("font-medium truncate", PARCHMENT.text.heading)}>{study.title}</h2>
                    <p className={cn("text-sm", PARCHMENT.text.secondary)}>
                      {study.book_name} {study.chapter_number}
                    </p>
                    <p className={cn("text-xs mt-1", PARCHMENT.text.muted)}>
                      Apagado em {formatDeletedAt(study.deleted_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <RestoreButton
                      studyId={study.id}
                      studyTitle={study.title}
                      onRestore={handleRestore}
                      className="min-h-[44px]"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setToPurge(study)}
                      className="gap-2 min-h-[44px] bg-warm-white border-linen text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Apagar definitivamente
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <ConfirmModal
        open={toPurge !== null}
        onConfirm={handleConfirmPurge}
        onCancel={() => setToPurge(null)}
        title="Apagar definitivamente?"
        description={`"${toPurge?.title ?? "Este estudo"}" e os anexos dele serão apagados para sempre. Esta ação não pode ser desfeita.`}
        confirmText="Apagar definitivamente"
        cancelText="Cancelar"
        variant="destructive"
        isLoading={purging}
      />
    </div>
  );
}
