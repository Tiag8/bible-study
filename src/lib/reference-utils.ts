/**
 * Reference Utilities
 * Story 4.3.3: Colorização por Tipo de Referência
 *
 * Helper functions for reference colorization, URL handling, and type labels
 */

import { Reference } from '@/hooks/useReferences';
import type { REFERENCE_ACCENTS } from './theme-colors';

export type ReferenceKind = keyof typeof REFERENCE_ACCENTS;

/**
 * Tipo da referência, chave de REFERENCE_ACCENTS (faixa e nome do tipo no cartão):
 *
 * - external: link para um site
 * - referenced_by: referência interna criada pelo gatilho (is_bidirectional=false)
 * - references: referência interna criada pelo usuário (e qualquer outro caso)
 */
export function getReferenceKind(ref: Pick<Reference, 'link_type' | 'is_bidirectional'>): ReferenceKind {
  if (ref.link_type === 'external') return 'external';
  if (ref.link_type === 'internal' && ref.is_bidirectional === false) return 'referenced_by';
  return 'references';
}

/**
 * Get Portuguese label for reference type
 *
 * @param ref - Reference object
 * @returns Human-readable label in Portuguese
 */
export function getReferenceTypeLabel(ref: Reference): string {
  if (ref.link_type === 'external') {
    return 'Link Externo';
  }

  // Internal references
  if (ref.link_type === 'internal') {
    if (ref.is_bidirectional === false) {
      return 'Referenciado por';
    }
    return 'Referência';
  }

  return 'Referência';
}

/**
 * Validate if URL has valid protocol (http:// or https://)
 *
 * @param url - URL string to validate
 * @returns true if URL is valid, false otherwise
 */
export function isValidUrl(url: string): boolean {
  if (!url) return false;

  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Get display title for URL
 *
 * Falls back to hostname if no custom title provided
 *
 * @param url - URL string
 * @param customTitle - Optional custom title to display
 * @returns Display title for the URL
 */
export function getUrlDisplayTitle(url: string, customTitle?: string): string {
  if (customTitle) {
    return customTitle;
  }

  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url;
  }
}

/**
 * Get short hostname for URL display (without www. prefix)
 *
 * @param url - URL string
 * @returns Hostname without 'www.' prefix
 */
export function getShortHostname(url: string): string {
  try {
    const urlObj = new URL(url);
    let hostname = urlObj.hostname;

    // Remove 'www.' prefix if present
    if (hostname.startsWith('www.')) {
      hostname = hostname.slice(4);
    }

    return hostname;
  } catch {
    return url;
  }
}

/**
 * Get contrasting color for a given background color (HSL)
 * Used for text overlays on colored backgrounds
 *
 * @param hslColor - HSL color string (e.g., "120, 100%, 50%")
 * @returns Either 'white' or 'black' based on luminance
 */
export function getContrastColor(hslColor: string): 'white' | 'black' {
  // Parse HSL string to extract lightness value
  const match = hslColor.match(/(\d+)%/);
  if (!match) return 'black';

  const lightness = parseInt(match[1], 10);

  // If lightness > 50%, use dark text; otherwise use white text
  return lightness > 50 ? 'black' : 'white';
}
