"use client";

import { cn } from "@/lib/utils";
import { PARCHMENT, SHADOW_WARM, TYPOGRAPHY } from "@/lib/design-tokens";
import { BookOpen, Network, BookMarked, Sparkles } from "lucide-react";

const steps = [
  {
    icon: BookOpen,
    title: "Escolha um livro",
    description: "Clique em qualquer livro da Bíblia para ver seus capítulos",
  },
  {
    icon: BookMarked,
    title: "Crie um estudo",
    description: "Selecione um capítulo e comece a escrever suas anotações",
  },
  {
    icon: Network,
    title: "Conecte ideias",
    description: "Use referências para ligar estudos entre si e visualize no Grafo",
  },
];

export function WelcomeGuide() {
  return (
    <div className={cn(
      "rounded-xl border p-6 md:p-8 mb-6",
      PARCHMENT.bg.card,
      PARCHMENT.border.default,
      SHADOW_WARM.md
    )}>
      <div className="flex items-center gap-3 mb-4">
        <div className={cn("p-2 rounded-full", PARCHMENT.accent.light)}>
          <Sparkles className={cn("w-5 h-5", PARCHMENT.accent.textDark)} />
        </div>
        <div>
          <h2 className={cn(TYPOGRAPHY.sizes.lg, TYPOGRAPHY.weights.bold, TYPOGRAPHY.families.serif, PARCHMENT.text.heading)}>
            Bem-vindo ao Bible Study
          </h2>
          <p className={cn(TYPOGRAPHY.sizes.sm, PARCHMENT.text.secondary)}>
            Seu segundo cérebro para estudos bíblicos
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        {steps.map((step, i) => (
          <div
            key={i}
            className={cn(
              "flex flex-col items-center text-center p-4 rounded-lg",
              PARCHMENT.bg.sidebar
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center mb-3",
              PARCHMENT.accent.light
            )}>
              <step.icon className={cn("w-5 h-5", PARCHMENT.accent.textDark)} />
            </div>
            <p className={cn(TYPOGRAPHY.sizes.sm, TYPOGRAPHY.weights.semibold, PARCHMENT.text.heading, "mb-1")}>
              {step.title}
            </p>
            <p className={cn(TYPOGRAPHY.sizes.xs, PARCHMENT.text.secondary)}>
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
