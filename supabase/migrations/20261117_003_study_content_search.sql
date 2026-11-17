-- Migration: Search inside study titles and content (accent and case insensitive)
-- Date: 2026-11-17
-- Idempotent: safe to run more than once. No BEGIN/COMMIT inside: run it in a
-- transaction (the Supabase SQL editor and CLI already do).
-- Replaces the never-applied 20260127_001 (it referenced a column book_id that
-- does not exist and trusted a caller-supplied user id). Do not apply that file.
--
-- What it does
-- 1. Makes sure the unaccent extension exists (schema extensions).
-- 2. bible_study_plain_text(jsonb) -> text: the readable text of a Tiptap
--    document. Text nodes ({"type":"text","text":...}) of the same block are
--    joined without separator (a word split by bold/highlight marks stays one
--    word); blocks are joined with a space; inline nodes without text
--    (hardBreak, etc.) become a space. JSON keys and attributes are never searched.
-- 3. bible_search_normalize(text) -> text: lower(unaccent(text)).
-- 4. bible_search_studies(p_query text): SECURITY INVOKER, so RLS of
--    bible_studies applies (own rows, deleted_at IS NULL); it also filters
--    user_id = auth.uid() and deleted_at IS NULL explicitly. Every word of the
--    query must appear (substring, accent and case insensitive) in the title,
--    the book name or the content. Title/book matches come first, then the most
--    recently updated. Returns at most 20 rows with an excerpt of about 160
--    characters around the first match in the content.
--
-- Choice: substring matching over unaccented, lower-cased plain text instead of
-- Portuguese full-text search. Full-text search stems words and needs whole
-- words, so a partial word typed in the search box ("sabedo") finds nothing and
-- stems give surprising matches; substring matching behaves like the existing
-- book-name filter and makes the excerpt position easy to compute. Cost: no
-- index can be used for '%word%' on computed text, so each search reads the
-- user's non-deleted rows (index idx_bible_studies_not_deleted) and extracts
-- their text. Measured on 2026-11-17 with EXPLAIN ANALYZE inside a rolled-back
-- transaction, as the user with the most studies (39 studies, about 16 kB of
-- JSON each): 30 to 50 ms per search. Linear extrapolation: about 250 ms for
-- 300 studies of the same size, acceptable behind a debounced search box. If it
-- grows beyond that, add a stored generated column with the normalized text.
-- Not done now because select('*') calls in the app would carry that column.
--
-- Rollback:
--   DROP FUNCTION IF EXISTS public.bible_search_studies(text);
--   DROP FUNCTION IF EXISTS public.bible_search_normalize(text);
--   DROP FUNCTION IF EXISTS public.bible_study_plain_text(jsonb);
--   (the unaccent extension is left installed; it existed before this migration)

CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA extensions;

-- In case the broken 20260127_001 was ever applied somewhere.
DROP FUNCTION IF EXISTS public.bible_search_studies(text, uuid);

-- ============================================
-- 1. Readable text of a Tiptap document
-- ============================================
CREATE OR REPLACE FUNCTION public.bible_study_plain_text(doc jsonb)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
SET search_path = ''
AS $$
  SELECT coalesce(string_agg(block_text, ' '), '')
  FROM (
    SELECT (
      SELECT string_agg(coalesce(child ->> 'text', ' '), '')
      FROM jsonb_array_elements(block -> 'content') AS child
    ) AS block_text
    FROM jsonb_path_query(doc, 'strict $.** ? (@.content[*].type == "text")') AS block
  ) AS blocks;
$$;

-- ============================================
-- 2. Normalization used on both sides of the comparison
-- ============================================
CREATE OR REPLACE FUNCTION public.bible_search_normalize(value text)
RETURNS text
LANGUAGE sql
STABLE
PARALLEL SAFE
SET search_path = ''
AS $$
  SELECT lower(extensions.unaccent('extensions.unaccent'::regdictionary, coalesce(value, '')));
$$;

-- ============================================
-- 3. Search RPC
-- ============================================
CREATE OR REPLACE FUNCTION public.bible_search_studies(p_query text)
RETURNS TABLE (
  id uuid,
  title text,
  book_name text,
  chapter_number integer,
  status text,
  excerpt text
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  WITH q AS (
    SELECT array_remove(
      regexp_split_to_array(btrim(public.bible_search_normalize(p_query)), '\s+'),
      ''
    ) AS words
  ),
  -- MATERIALIZED: extract and normalize each study's text once, not once per
  -- reference below.
  docs AS MATERIALIZED (
    SELECT
      s.id, s.title, s.book_name, s.chapter_number, s.status, s.updated_at,
      public.bible_study_plain_text(s.content) AS body
    FROM public.bible_studies s
    WHERE s.user_id = auth.uid()
      AND s.deleted_at IS NULL
  ),
  normalized AS MATERIALIZED (
    SELECT
      d.*,
      public.bible_search_normalize(d.title || ' ' || d.book_name || ' ' || d.chapter_number) AS head,
      public.bible_search_normalize(d.body) AS norm_body
    FROM docs d
  ),
  matches AS (
    SELECT
      n.*,
      -- all words in title/book/chapter
      NOT EXISTS (
        SELECT 1 FROM unnest(q.words) w WHERE strpos(n.head, w) = 0
      ) AS head_match,
      -- position of the first query word found in the content
      (
        SELECT strpos(n.norm_body, w)
        FROM unnest(q.words) WITH ORDINALITY AS u(w, i)
        WHERE strpos(n.norm_body, w) > 0
        ORDER BY i
        LIMIT 1
      ) AS body_pos
    FROM normalized n, q
    WHERE length(btrim(coalesce(p_query, ''))) >= 2
      AND cardinality(q.words) > 0
      AND NOT EXISTS (
        SELECT 1 FROM unnest(q.words) w
        WHERE strpos(n.head, w) = 0 AND strpos(n.norm_body, w) = 0
      )
  )
  SELECT
    m.id,
    m.title,
    m.book_name,
    m.chapter_number,
    m.status,
    nullif(
      CASE
        WHEN m.body_pos IS NOT NULL THEN
          CASE WHEN m.body_pos > 61 THEN '…' ELSE '' END
          || btrim(regexp_replace(substr(m.body, greatest(m.body_pos - 60, 1), 160), '\s+', ' ', 'g'))
          || CASE WHEN length(m.body) > greatest(m.body_pos - 60, 1) + 159 THEN '…' ELSE '' END
        ELSE
          btrim(regexp_replace(left(m.body, 160), '\s+', ' ', 'g'))
          || CASE WHEN length(m.body) > 160 THEN '…' ELSE '' END
      END,
      ''
    ) AS excerpt
  FROM matches m
  ORDER BY m.head_match DESC, m.updated_at DESC
  LIMIT 20;
$$;

REVOKE ALL ON FUNCTION public.bible_search_studies(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.bible_search_studies(text) TO authenticated;

COMMENT ON FUNCTION public.bible_study_plain_text(jsonb) IS
  'Texto legível de um documento Tiptap (nós de texto), sem chaves JSON.';
COMMENT ON FUNCTION public.bible_search_normalize(text) IS
  'lower(unaccent(texto)) para busca sem acento e sem diferença de maiúsculas.';
COMMENT ON FUNCTION public.bible_search_studies(text) IS
  'Busca nos estudos do usuário autenticado (título, livro, conteúdo), sem acento; ignora a lixeira.';
