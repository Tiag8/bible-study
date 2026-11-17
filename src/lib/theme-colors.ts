/**
 * Cores de significado do tema pergaminho (status, etiquetas, referências, citações).
 *
 * Decididas em 2026-11-17 por pesquisa em fontes abertas (WCAG 1.4.1/1.4.3/1.4.11,
 * IBM Carbon, Atlassian, GOV.UK, Primer, Datawrapper, Okabe-Ito) e painel de 3 juízes:
 *
 * - STATUS é uma progressão (estudar → concluído), então usa UM só tom, do claro ao
 *   escuro, e todo status leva ícone e nome: a cor nunca é a única pista.
 * - ETIQUETAS têm cor escolhida pelo usuário: viram um ponto e uma tinta leve, com o
 *   texto sempre em marrom, para a leitura não depender da cor escolhida.
 * - O âmbar da marca (#B8860B) não passa de 2,8:1 sobre o creme: serve de preenchimento
 *   e decoração, nunca de texto pequeno nem de borda que carrega significado.
 *
 * Contrastes (WCAG) medidos sobre a página #f0eee4 ou sobre o próprio preenchimento.
 */

import { BookOpen, Check, PencilLine, RefreshCw, type LucideIcon } from 'lucide-react';
import type { StudyStatus } from '@/lib/design-tokens';

export interface StatusTheme {
  label: string;
  icon: LucideIcon;
  /** Preenchimento do selo ou do quadro de capítulo. */
  fill: string;
  /** Texto e ícone sobre o preenchimento (4,5:1 ou mais). */
  ink: string;
  /** Borda (3:1 ou mais contra a página quando carrega o estado). */
  border: string;
  borderStyle: 'solid' | 'dashed';
}

export const STATUS_THEME: Record<StudyStatus, StatusTheme> = {
  estudar: { label: 'Estudar', icon: BookOpen, fill: 'transparent', ink: '#6B4E0A', border: '#8B6508', borderStyle: 'dashed' },
  estudando: { label: 'Estudando', icon: PencilLine, fill: '#EAD9AE', ink: '#6B4E0A', border: '#C9A656', borderStyle: 'solid' },
  revisando: { label: 'Revisando', icon: RefreshCw, fill: '#D4B060', ink: '#3C2415', border: '#B8923C', borderStyle: 'solid' },
  concluído: { label: 'Concluído', icon: Check, fill: '#6B4E0A', ink: '#F0EEE4', border: '#6B4E0A', borderStyle: 'solid' },
};

export const STATUS_ORDER: StudyStatus[] = ['estudar', 'estudando', 'revisando', 'concluído'];

/** Tons terrosos para as cores de etiqueta que o usuário escolhe (chave gravada no banco). */
export const TAG_ACCENTS: Record<string, string> = {
  blue: '#4F6D8A',
  purple: '#6B4C7A',
  green: '#4F6B3A',
  orange: '#A0522D',
  pink: '#9C4A5C',
  cyan: '#3F7A7A',
  red: '#8F3B34',
  yellow: '#8A7A2E',
  'dark-green': '#2F5D50',
};
export const TAG_ACCENT_DEFAULT = '#7A6F64';

export function tagAccent(colorKey: string | null | undefined): string {
  return (colorKey && TAG_ACCENTS[colorKey]) || TAG_ACCENT_DEFAULT;
}

/** Tipos de referência entre estudos: superfície creme com uma faixa fina e o nome do tipo. */
export const REFERENCE_ACCENTS = {
  references: { accent: '#4F6B3A', label: 'Referência' },
  referenced_by: { accent: '#6B4C7A', label: 'Citado por' },
  external: { accent: '#3F5F7A', label: 'Link externo' },
} as const;

/**
 * Citações coloridas: a cor gravada no documento (chave) continua a mesma; na tela ela
 * aparece em tom terroso, com um fundo quente derivado do próprio tom.
 */
export const QUOTE_DISPLAY: Record<string, { border: string; fill: string; name: string }> = {
  '#ca8a04': { border: '#8A6508', fill: '#EEE5CC', name: 'Âmbar' },
  '#3b82f6': { border: '#3F5F7A', fill: '#E3E6E2', name: 'Azul' },
  '#16a34a': { border: '#4F6B3A', fill: '#E3E8D8', name: 'Verde' },
  '#9333ea': { border: '#6B4C7A', fill: '#E7E1E2', name: 'Ameixa' },
  '#ea580c': { border: '#A0522D', fill: '#EFE1D6', name: 'Terracota' },
  '#db2777': { border: '#9C4A5C', fill: '#EEE0DC', name: 'Rosa' },
  '#6b7280': { border: '#7A6F64', fill: '#E9E5DB', name: 'Neutro' },
};
