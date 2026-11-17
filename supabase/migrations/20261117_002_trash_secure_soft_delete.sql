-- Migration: Trash (soft delete) with owner checks based on auth.uid()
-- Date: 2026-11-17
-- Idempotent: safe to run more than once. No BEGIN/COMMIT inside: run it in a
-- transaction (the Supabase SQL editor and CLI already do).
--
-- What it does
-- 1. Replaces the three soft-delete RPCs from 20260127_002. The old versions
--    were SECURITY DEFINER, took the user id as a parameter and never compared
--    it with auth.uid(), and were executable by anon: anyone holding the public
--    anon key could move to the trash, restore or list the trashed studies of
--    any user by passing that user's id. The new versions take no user id and
--    act only on rows where user_id = auth.uid().
--      bible_soft_delete_study(p_study_id uuid)  -> boolean
--      bible_restore_study(p_study_id uuid)      -> boolean
--      bible_get_deleted_studies()               -> setof (id, title, book_name, chapter_number, deleted_at)
--    The old (uuid, uuid) / (uuid) signatures are dropped; the app on main does
--    not call them.
-- 2. Adds bible_purge_study(p_study_id uuid) -> boolean: permanent deletion of a
--    study that is already in the trash. It must be SECURITY DEFINER because the
--    SELECT policy on bible_studies hides rows with deleted_at set, so a plain
--    DELETE from the client would match zero rows. Links cascade by FK.
--    Attachments in Storage are removed by the app after this returns true.
-- 3. Recreates the view bible_graph_data with security_invoker = true and a
--    deleted_at IS NULL filter. Before, the view ran with its owner's rights
--    (bypassing RLS) and anon/authenticated had every privilege on it, so the
--    anon key could read, and through the auto-updatable view also modify or
--    delete, the studies of every user. The app does not read this view; it is
--    kept (same columns) for compatibility, readable only by authenticated users
--    and only for their own non-deleted rows.
--
-- Rollback (restores the previous, insecure state exactly):
--   BEGIN;
--   DROP FUNCTION IF EXISTS public.bible_purge_study(uuid);
--   DROP FUNCTION IF EXISTS public.bible_soft_delete_study(uuid);
--   DROP FUNCTION IF EXISTS public.bible_restore_study(uuid);
--   DROP FUNCTION IF EXISTS public.bible_get_deleted_studies();
--   CREATE FUNCTION public.bible_soft_delete_study(p_study_id uuid, p_user_id uuid) RETURNS boolean
--     LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $f$
--     BEGIN UPDATE bible_studies SET deleted_at = NOW() WHERE id = p_study_id AND user_id = p_user_id; RETURN FOUND; END; $f$;
--   CREATE FUNCTION public.bible_restore_study(p_study_id uuid, p_user_id uuid) RETURNS boolean
--     LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $f$
--     BEGIN UPDATE bible_studies SET deleted_at = NULL WHERE id = p_study_id AND user_id = p_user_id; RETURN FOUND; END; $f$;
--   CREATE FUNCTION public.bible_get_deleted_studies(p_user_id uuid)
--     RETURNS TABLE(id uuid, title text, book_name text, chapter_number integer, deleted_at timestamptz)
--     LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $f$
--     BEGIN RETURN QUERY SELECT s.id, s.title, s.book_name, s.chapter_number, s.deleted_at FROM bible_studies s
--       WHERE s.user_id = p_user_id AND s.deleted_at IS NOT NULL ORDER BY s.deleted_at DESC LIMIT 100; END; $f$;
--   GRANT EXECUTE ON FUNCTION public.bible_soft_delete_study(uuid, uuid), public.bible_restore_study(uuid, uuid),
--     public.bible_get_deleted_studies(uuid) TO PUBLIC, anon, authenticated, service_role;
--   CREATE OR REPLACE VIEW public.bible_graph_data AS
--     SELECT s.id, s.user_id, s.title, s.book_name, s.chapter_number, s.status, s.tags,
--       COALESCE((SELECT json_agg(json_build_object('target_id', l.target_study_id)) FROM bible_study_links l
--         WHERE l.source_study_id = s.id), '[]'::json) AS outgoing_links
--     FROM bible_studies s;
--   ALTER VIEW public.bible_graph_data RESET (security_invoker);
--   GRANT ALL ON public.bible_graph_data TO anon, authenticated, service_role;
--   COMMIT;

-- ============================================
-- 1. Drop the insecure signatures
-- ============================================
DROP FUNCTION IF EXISTS public.bible_soft_delete_study(uuid, uuid);
DROP FUNCTION IF EXISTS public.bible_restore_study(uuid, uuid);
DROP FUNCTION IF EXISTS public.bible_get_deleted_studies(uuid);

-- ============================================
-- 2. Owner-checked RPCs (auth.uid(), never a caller-supplied id)
-- ============================================
CREATE OR REPLACE FUNCTION public.bible_soft_delete_study(p_study_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  UPDATE public.bible_studies
  SET deleted_at = now()
  WHERE id = p_study_id
    AND user_id = auth.uid()
    AND deleted_at IS NULL;

  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.bible_restore_study(p_study_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  UPDATE public.bible_studies
  SET deleted_at = NULL
  WHERE id = p_study_id
    AND user_id = auth.uid()
    AND deleted_at IS NOT NULL;

  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.bible_get_deleted_studies()
RETURNS TABLE (
  id uuid,
  title text,
  book_name text,
  chapter_number integer,
  deleted_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT s.id, s.title, s.book_name, s.chapter_number, s.deleted_at
  FROM public.bible_studies s
  WHERE s.user_id = auth.uid()
    AND s.deleted_at IS NOT NULL
  ORDER BY s.deleted_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.bible_purge_study(p_study_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  -- Only studies already in the trash can be deleted permanently.
  DELETE FROM public.bible_studies
  WHERE id = p_study_id
    AND user_id = auth.uid()
    AND deleted_at IS NOT NULL;

  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.bible_soft_delete_study(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.bible_restore_study(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.bible_get_deleted_studies() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.bible_purge_study(uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.bible_soft_delete_study(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.bible_restore_study(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.bible_get_deleted_studies() TO authenticated;
GRANT EXECUTE ON FUNCTION public.bible_purge_study(uuid) TO authenticated;

COMMENT ON FUNCTION public.bible_soft_delete_study(uuid) IS
  'Move um estudo do usuário autenticado para a lixeira (deleted_at = now()).';
COMMENT ON FUNCTION public.bible_restore_study(uuid) IS
  'Restaura um estudo da lixeira do usuário autenticado (deleted_at = NULL).';
COMMENT ON FUNCTION public.bible_get_deleted_studies() IS
  'Lista os estudos na lixeira do usuário autenticado, mais recentes primeiro.';
COMMENT ON FUNCTION public.bible_purge_study(uuid) IS
  'Apaga definitivamente um estudo que já está na lixeira do usuário autenticado.';

-- ============================================
-- 3. bible_graph_data: invoker rights, hide deleted rows, read-only
-- ============================================
CREATE OR REPLACE VIEW public.bible_graph_data
WITH (security_invoker = true)
AS
SELECT
  s.id,
  s.user_id,
  s.title,
  s.book_name,
  s.chapter_number,
  s.status,
  s.tags,
  COALESCE(
    (SELECT json_agg(json_build_object('target_id', l.target_study_id))
     FROM public.bible_study_links l
     WHERE l.source_study_id = s.id),
    '[]'::json
  ) AS outgoing_links
FROM public.bible_studies s
WHERE s.deleted_at IS NULL;

REVOKE ALL ON public.bible_graph_data FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.bible_graph_data TO authenticated;
