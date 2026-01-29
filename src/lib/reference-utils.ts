/**
 * Reference Utilities
 * Helper functions for reference management and colorization
 * Story 4.3.3 - Colorização por Tipo de Referência
 */

import { REFERENCE_TYPE_COLORS } from './design-tokens'

/**
 * Representa uma referência no sistema
 * Este tipo deve estar sincronizado com src/types/reference.ts
 */
export interface Reference {
  id: string
  source_study_id: string
  target_study_id?: string | null
  target_title?: string
  target_book_name?: string
  target_chapter_number?: number
  target_tags?: Array<{ name: string; type: string; color: string }>

  // New fields for 4.3.x features
  link_type: 'internal' | 'external'
  external_url?: string | null
  is_bidirectional?: boolean
  display_order?: number

  created_at?: string
}

/**
 * Determine the color className for a reference based on its type and direction
 *
 * Rules:
 * - Internal + is_bidirectional=true → "references" (green) = "Eu referencio"
 * - Internal + is_bidirectional=false → "referenced_by" (red) = "Fui referenciado"
 * - External → "external" (blue) = "Link externo"
 *
 * @param reference - A Reference object
 * @returns Tailwind className string for the card background and border
 *
 * @example
 * const cardColor = getReferenceTypeColor(reference)
 * return <div className={cn('px-4 py-3 rounded-lg border', cardColor)}>...</div>
 */
export function getReferenceTypeColor(reference: Reference): string {
  // External link
  if (reference.link_type === 'external') {
    return REFERENCE_TYPE_COLORS.external
  }

  // Internal reference
  if (reference.link_type === 'internal') {
    // Eu referencio (criada por mim, is_bidirectional=true)
    if (reference.is_bidirectional === true) {
      return REFERENCE_TYPE_COLORS.references
    }

    // Fui referenciado (criada por trigger, is_bidirectional=false)
    if (reference.is_bidirectional === false) {
      return REFERENCE_TYPE_COLORS.referenced_by
    }
  }

  // Fallback (nunca deve chegar aqui se os dados estão corretos)
  return REFERENCE_TYPE_COLORS.references
}

/**
 * Get human-readable label for a reference type
 *
 * @param reference - A Reference object
 * @returns Portuguese label for the reference type
 *
 * @example
 * getReferenceTypeLabel(ref) // → "Referência" or "Referenciado por"
 */
export function getReferenceTypeLabel(reference: Reference): string {
  if (reference.link_type === 'external') {
    return 'Link Externo'
  }

  if (reference.is_bidirectional === true) {
    return 'Referência'
  }

  if (reference.is_bidirectional === false) {
    return 'Referenciado por'
  }

  return 'Referência'
}

/**
 * Validate if a URL is valid (https:// or http://)
 *
 * @param url - URL string to validate
 * @returns true if URL is valid, false otherwise
 *
 * @example
 * isValidUrl('https://example.com') // → true
 * isValidUrl('not-a-url') // → false
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

/**
 * Get display title for a URL (hostname if no custom title provided)
 *
 * @param url - URL string
 * @param customTitle - Optional custom title
 * @returns Display title for the URL
 *
 * @example
 * getUrlDisplayTitle('https://www.spurgeon.org', 'Comentário')
 * // → "Comentário"
 *
 * getUrlDisplayTitle('https://www.spurgeon.org')
 * // → "spurgeon.org"
 */
export function getUrlDisplayTitle(url: string, customTitle?: string): string {
  if (customTitle) {
    return customTitle
  }

  try {
    return new URL(url).hostname || url
  } catch {
    return url
  }
}

/**
 * Get a short hostname from a URL for compact display
 *
 * @param url - URL string
 * @returns Hostname without 'www.' prefix if present
 *
 * @example
 * getShortHostname('https://www.example.com') // → "example.com"
 * getShortHostname('https://api.github.com') // → "api.github.com"
 */
export function getShortHostname(url: string): string {
  try {
    let hostname = new URL(url).hostname || url
    // Remove 'www.' prefix if present
    return hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}
