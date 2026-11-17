-- Migration: Reference-link RPCs callable only by signed-in users
-- Date: 2026-11-17
-- Idempotent: safe to run more than once.
--
-- delete_bidirectional_link(uuid) and swap_display_order(uuid, uuid) are
-- SECURITY DEFINER and check ownership with `user_id != auth.uid()`. For a
-- caller without a session auth.uid() is NULL, the comparison yields NULL and
-- the check never fires, and both functions were executable by PUBLIC and anon:
-- with the public anon key, anyone who knew a link id could delete it or
-- reorder another user's links. Signed-in callers are unaffected (for them the
-- ownership check works), so this only removes the anonymous access.
--
-- Rollback:
--   GRANT EXECUTE ON FUNCTION public.delete_bidirectional_link(uuid) TO PUBLIC, anon;
--   GRANT EXECUTE ON FUNCTION public.swap_display_order(uuid, uuid) TO PUBLIC, anon;

REVOKE ALL ON FUNCTION public.delete_bidirectional_link(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.swap_display_order(uuid, uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.delete_bidirectional_link(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.swap_display_order(uuid, uuid) TO authenticated;
