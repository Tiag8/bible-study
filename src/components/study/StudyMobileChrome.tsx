/**
 * Moldura da página do estudo no celular (modelo C).
 *
 * - Topo mínimo: voltar, título, status tocável e estado do salvamento. Recolhe ao
 *   rolar para baixo e volta ao rolar para cima.
 * - Barra inferior fixa, ao alcance do polegar: Sumário, Tags, Referências e Mais.
 *   Ao tocar no texto ela dá lugar à barra de formatação do teclado.
 * - Cada ação abre um painel que sobe da base (um por vez).
 *
 * Desfazer e refazer ficam na barra do teclado; não há botão Salvar porque o
 * salvamento é automático (só o estudo novo, ainda não criado, mostra "Salvar").
 */

"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Clock,
  Link2,
  ListTree,
  MoreHorizontal,
  Paperclip,
  Pencil,
  Plus,
  Tag as TagIcon,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PARCHMENT, type StudyStatus } from "@/lib/design-tokens";
import { STATUS_ORDER, STATUS_THEME, tagAccent } from "@/lib/theme-colors";
import { useHideOnScrollDown } from "@/hooks/useHideOnScrollDown";
import type { OutlineItem } from "@/components/Editor";
import { OutlineList } from "@/components/StudyOutline";
import { BottomSheet } from "./BottomSheet";

type Sheet = "outline" | "tags" | "status" | "more" | "rename" | null;
export type SaveState = "saving" | "unsaved" | "saved" | null;

interface StudyMobileChromeProps {
  title: string;
  /** Status do estudo; null enquanto o estudo ainda não foi criado. */
  status: StudyStatus | null;
  saveState: SaveState;
  onSave: () => void;
  onBack: () => void;
  onRename: (title: string) => void;
  onStatusChange: (status: StudyStatus) => Promise<void> | void;
  availableTags: Array<{ id: string; name: string; color: string }>;
  selectedTags: string[];
  onToggleTag: (name: string) => void;
  onCreateTag: () => void;
  getOutline: () => OutlineItem[];
  onSelectOutline: (pos: number) => void;
  referencesCount: number;
  onOpenReferences: () => void;
  onShowAttachments: () => void;
  onTrash: () => void;
}

function BarButton({
  label,
  badge,
  onClick,
  children,
}: {
  label: string;
  badge?: number;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="ink-inherit relative flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-walnut active:bg-linen focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-dark"
    >
      <span className="relative">
        {children}
        {badge ? (
          <span
            className="absolute -right-3 -top-1.5 min-w-[16px] rounded-full bg-amber-dark px-1 text-center text-[10px] font-semibold leading-4 text-white"
            aria-hidden="true"
          >
            {badge}
          </span>
        ) : null}
      </span>
      <span>
        {label}
        {badge ? <span className="sr-only"> ({badge})</span> : null}
      </span>
    </button>
  );
}

function SheetRow({
  onClick,
  icon,
  children,
  trailing,
  danger = false,
  selected = false,
}: {
  onClick: () => void;
  icon: ReactNode;
  children: ReactNode;
  trailing?: ReactNode;
  danger?: boolean;
  selected?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected || undefined}
      className={cn(
        "flex min-h-[48px] w-full items-center gap-3 rounded-lg px-3 text-left text-[15px] font-medium active:bg-linen focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-dark",
        danger ? "text-[#b42318]" : "text-espresso",
        selected && "bg-amber-light"
      )}
    >
      <span className={cn("flex w-6 shrink-0 justify-center", danger ? "text-[#b42318]" : "text-walnut")} aria-hidden="true">
        {icon}
      </span>
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {trailing}
    </button>
  );
}

export function StudyMobileChrome({
  title,
  status,
  saveState,
  onSave,
  onBack,
  onRename,
  onStatusChange,
  availableTags,
  selectedTags,
  onToggleTag,
  onCreateTag,
  getOutline,
  onSelectOutline,
  referencesCount,
  onOpenReferences,
  onShowAttachments,
  onTrash,
}: StudyMobileChromeProps) {
  const [sheet, setSheet] = useState<Sheet>(null);
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const [draftTitle, setDraftTitle] = useState("");
  const topHidden = useHideOnScrollDown(sheet !== null);
  const close = () => setSheet(null);

  const theme = status ? STATUS_THEME[status] : null;
  const StatusIcon = theme?.icon;

  const openRename = () => {
    setDraftTitle(title);
    setSheet("rename");
  };

  const submitRename = (event: FormEvent) => {
    event.preventDefault();
    const next = draftTitle.trim();
    if (next && next !== title) onRename(next);
    close();
  };

  return (
    <div className="md:hidden">
      {/* Reserva o espaço do topo fixo */}
      <div className="h-[68px]" aria-hidden="true" />

      <header
        className={cn(
          "fixed inset-x-0 top-0 z-30 flex h-[68px] items-center gap-1 border-b border-linen bg-cream pl-1 pr-3",
          "transition-transform duration-300 motion-reduce:transition-none",
          // Com o foco dentro do topo (teclado, leitor de tela) ele nunca fica escondido.
          topHidden && "-translate-y-full focus-within:translate-y-0"
        )}
      >
        <button
          type="button"
          onClick={onBack}
          aria-label="Voltar para o livro"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-walnut active:bg-linen focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-dark"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={openRename}
            aria-label={`Renomear estudo: ${title || "Sem título"}`}
            className="block max-w-full rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-dark"
          >
            <h1 className={cn("truncate font-lora text-[17px] font-semibold leading-6", PARCHMENT.text.heading)}>
              {title || "Sem título"}
            </h1>
          </button>

          <div className="flex items-center gap-2">
            {theme && StatusIcon ? (
              <button
                type="button"
                onClick={() => setSheet("status")}
                aria-label={`Status: ${theme.label}. Tocar para mudar`}
                className="-my-1 flex min-h-[36px] items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-dark rounded-full"
              >
                <span
                  className="ink-inherit inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: theme.fill,
                    color: theme.ink,
                    borderColor: theme.border,
                    borderStyle: theme.borderStyle,
                  }}
                >
                  <StatusIcon className="h-3 w-3" aria-hidden="true" />
                  {theme.label}
                  <ChevronDown className="h-3 w-3" aria-hidden="true" />
                </span>
              </button>
            ) : (
              <span className={cn("text-xs", PARCHMENT.text.secondary)}>Estudo novo</span>
            )}

            <span className="text-xs" role="status" aria-live="polite">
              {saveState === "saving" && <span className={PARCHMENT.text.secondary}>Salvando...</span>}
              {saveState === "saved" && (
                <span className="inline-flex items-center gap-1 text-[#4A6741]">
                  <Check className="h-3 w-3" aria-hidden="true" />
                  Salvo
                </span>
              )}
              {saveState === "unsaved" && status && (
                <span className="inline-flex items-center gap-1 text-[#6B4E0A]">
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  Não salvo
                </span>
              )}
            </span>
            {/* Estudo novo só é criado no primeiro salvar: aqui o botão é necessário. */}
            {saveState === "unsaved" && !status && (
              <button
                type="button"
                onClick={onSave}
                className="-my-1 min-h-[36px] rounded-md bg-amber-dark px-3 text-xs font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-dark focus-visible:ring-offset-2"
              >
                Salvar
              </button>
            )}
          </div>
        </div>
      </header>

      <nav
        aria-label="Ações do estudo"
        className="fixed inset-x-0 bottom-0 z-30 flex border-t border-linen bg-ivory [body[data-editing='true']_&]:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <BarButton
          label="Sumário"
          onClick={() => {
            setOutline(getOutline());
            setSheet("outline");
          }}
        >
          <ListTree className="h-5 w-5" aria-hidden="true" />
        </BarButton>
        <BarButton label="Tags" badge={selectedTags.length} onClick={() => setSheet("tags")}>
          <TagIcon className="h-5 w-5" aria-hidden="true" />
        </BarButton>
        <BarButton label="Referências" badge={referencesCount} onClick={onOpenReferences}>
          <Link2 className="h-5 w-5" aria-hidden="true" />
        </BarButton>
        <BarButton label="Mais" onClick={() => setSheet("more")}>
          <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
        </BarButton>
      </nav>

      <BottomSheet open={sheet === "outline"} onClose={close} title="Sumário">
        <OutlineList
          items={outline}
          onSelect={(pos) => {
            close();
            onSelectOutline(pos);
          }}
        />
      </BottomSheet>

      <BottomSheet open={sheet === "tags"} onClose={close} title="Tags do estudo">
        {availableTags.length === 0 ? (
          <p className={cn("px-3 py-3 text-sm", PARCHMENT.text.secondary)}>Você ainda não criou nenhuma tag.</p>
        ) : (
          availableTags.map((tag) => {
            const selected = selectedTags.includes(tag.name);
            return (
              <SheetRow
                key={tag.id}
                onClick={() => onToggleTag(tag.name)}
                selected={selected}
                icon={<span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: tagAccent(tag.color) }} />}
                trailing={selected ? <Check className="h-4 w-4 text-[#6B4E0A]" aria-hidden="true" /> : undefined}
              >
                {tag.name}
              </SheetRow>
            );
          })
        )}
        <div className="mx-2 my-1 h-px bg-linen" />
        <SheetRow
          onClick={() => {
            close();
            onCreateTag();
          }}
          icon={<Plus className="h-5 w-5" />}
        >
          Nova tag
        </SheetRow>
      </BottomSheet>

      <BottomSheet open={sheet === "status"} onClose={close} title="Status do estudo">
        {STATUS_ORDER.map((option) => {
          const optionTheme = STATUS_THEME[option];
          const Icon = optionTheme.icon;
          const selected = option === status;
          return (
            <SheetRow
              key={option}
              selected={selected}
              onClick={async () => {
                close();
                if (!selected) await onStatusChange(option);
              }}
              icon={
                <span
                  className="ink-inherit flex h-6 w-6 items-center justify-center rounded-full border"
                  style={{
                    backgroundColor: optionTheme.fill,
                    color: optionTheme.ink,
                    borderColor: optionTheme.border,
                    borderStyle: optionTheme.borderStyle,
                  }}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
              }
              trailing={selected ? <Check className="h-4 w-4 text-[#6B4E0A]" aria-hidden="true" /> : undefined}
            >
              {optionTheme.label}
            </SheetRow>
          );
        })}
      </BottomSheet>

      <BottomSheet open={sheet === "more"} onClose={close} title="Mais ações">
        <SheetRow
          onClick={() => {
            close();
            onShowAttachments();
          }}
          icon={<Paperclip className="h-5 w-5" />}
        >
          Anexos
        </SheetRow>
        <SheetRow onClick={openRename} icon={<Pencil className="h-5 w-5" />}>
          Renomear
        </SheetRow>
        {status && (
          <>
            <div className="mx-2 my-1 h-px bg-linen" />
            <SheetRow
              danger
              onClick={() => {
                close();
                onTrash();
              }}
              icon={<Trash2 className="h-5 w-5" />}
            >
              Mover para a lixeira
            </SheetRow>
          </>
        )}
      </BottomSheet>

      <BottomSheet open={sheet === "rename"} onClose={close} title="Renomear estudo">
        <form onSubmit={submitRename} className="px-2 pb-1 pt-1">
          <label htmlFor="study-title-input" className="sr-only">
            Título do estudo
          </label>
          <input
            id="study-title-input"
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            placeholder="Título do estudo"
            enterKeyHint="done"
            // 16 px: abaixo disso o iOS dá zoom ao focar.
            className="h-12 w-full rounded-lg border border-linen bg-cream px-3 text-base text-espresso focus:outline-none focus:ring-2 focus:ring-amber-dark"
          />
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={close}
              className="min-h-[44px] rounded-lg px-4 text-sm font-medium text-walnut active:bg-linen focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-dark"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!draftTitle.trim()}
              className="min-h-[44px] rounded-lg bg-amber-dark px-5 text-sm font-semibold text-white disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-dark focus-visible:ring-offset-2"
            >
              Salvar
            </button>
          </div>
        </form>
      </BottomSheet>
    </div>
  );
}
