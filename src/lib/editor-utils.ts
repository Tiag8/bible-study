/**
 * ✅ REFACTORING: Utilities do editor Tiptap
 *
 * Funções compartilhadas para manipulação de conteúdo do editor.
 */

import DOMPurify from "isomorphic-dompurify";

/**
 * Parseia e sanitiza conteúdo do editor (JSON, HTML ou objeto TiptapContent).
 *
 * **SECURITY:** Sanitiza HTML para prevenir XSS attacks usando DOMPurify.
 *
 * **Suporta 3 formatos:**
 * 1. Objeto TiptapContent - Retorna diretamente
 * 2. String JSON - Tenta parsear, sanitiza se falhar
 * 3. String HTML - Sanitiza sempre
 *
 * @param content - Conteúdo a ser parseado (string, objeto ou null)
 * @returns String HTML sanitizado ou objeto TiptapContent
 *
 * @example
 * ```ts
 * // Objeto TiptapContent (formato Tiptap nativo)
 * const obj = { type: 'doc', content: [...] };
 * parseContent(obj); // → Retorna objeto intacto
 * ```
 *
 * @example
 * ```ts
 * // JSON string válido
 * const json = '{"type":"doc","content":[...]}';
 * parseContent(json); // → Objeto TiptapContent parseado
 * ```
 *
 * @example
 * ```ts
 * // HTML malicioso (XSS)
 * const html = '<p>Texto<script>alert("xss")</script></p>';
 * parseContent(html); // → '<p>Texto</p>' (script removido)
 * ```
 */
export function parseContent(content: unknown): string | object {
  // Caso null/undefined → retorna vazio
  if (!content) return "";

  // Se já for objeto → retorna diretamente (TiptapContent)
  if (typeof content === "object") return content;

  // Se não for string → retorna vazio
  if (typeof content !== "string") return "";

  // Tenta parsear como JSON se começa com "{"
  if (content.trim().startsWith("{")) {
    try {
      return JSON.parse(content);
    } catch (error) {
      // JSON inválido - trata como HTML e sanitiza
      if (process.env.NODE_ENV === 'development') {
        console.warn("[parseContent] JSON parse failed, sanitizing as HTML", {
          contentPreview: content.slice(0, 100),
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
      // ✅ SECURITY: Sanitiza HTML antes de retornar
      return DOMPurify.sanitize(content);
    }
  }

  // ✅ SECURITY: Sanitiza qualquer HTML string
  return DOMPurify.sanitize(content);
}

/**
 * Valida se uma cor está na whitelist permitida.
 *
 * **SECURITY:** Previne CSS injection validando cores contra whitelist.
 *
 * @param color - Cor hex a ser validada (ex: "#3b82f6")
 * @param allowedColors - Set com cores permitidas
 * @param fallbackColor - Cor padrão se inválida
 * @returns Cor validada ou fallback
 *
 * @example
 * ```ts
 * const SAFE_COLORS = new Set(["#3b82f6", "#16a34a"]);
 * validateColor("#3b82f6", SAFE_COLORS, "#000"); // → "#3b82f6"
 * validateColor("#malicious", SAFE_COLORS, "#000"); // → "#000" (fallback)
 * ```
 */
export function validateColor(
  color: string,
  allowedColors: Set<string>,
  fallbackColor: string
): string {
  if (allowedColors.has(color)) {
    return color;
  }

  if (process.env.NODE_ENV === 'development') {
    console.warn("[validateColor] Invalid color blocked:", color);
  }

  return fallbackColor;
}
