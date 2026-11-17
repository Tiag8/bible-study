-- Migration: Spaced review schedule for concluded studies (1, 7, 21, 60 days)
-- Date: 2026-11-17
-- Idempotent: safe to run more than once. No BEGIN/COMMIT inside: run it in a
-- transaction (the Supabase SQL editor and CLI already do).
--
-- What it does
-- Adds two nullable columns to bible_studies. The app (src/lib/review-schedule.ts)
-- writes them; the database only stores them.
--   review_stage   smallint     number of reviews already done (0..4).
--                                NULL = the study is not in the schedule.
--                                4 with next_review_at NULL = schedule finished.
--   next_review_at timestamptz  when the next review is due; NULL = nothing due.
-- Existing rows, including studies already 'concluído', stay NULL/NULL: only
-- studies concluded from now on (or scheduled explicitly) enter the schedule.
-- Additive only: the code on main does not read these columns.
--
-- Rollback:
--   DROP INDEX IF EXISTS public.idx_bible_studies_next_review;
--   ALTER TABLE public.bible_studies DROP CONSTRAINT IF EXISTS bible_studies_review_stage_check;
--   ALTER TABLE public.bible_studies DROP COLUMN IF EXISTS next_review_at;
--   ALTER TABLE public.bible_studies DROP COLUMN IF EXISTS review_stage;

ALTER TABLE public.bible_studies
  ADD COLUMN IF NOT EXISTS review_stage smallint,
  ADD COLUMN IF NOT EXISTS next_review_at timestamptz;

ALTER TABLE public.bible_studies
  DROP CONSTRAINT IF EXISTS bible_studies_review_stage_check;
ALTER TABLE public.bible_studies
  ADD CONSTRAINT bible_studies_review_stage_check
  CHECK (review_stage IS NULL OR review_stage BETWEEN 0 AND 4);

CREATE INDEX IF NOT EXISTS idx_bible_studies_next_review
  ON public.bible_studies (user_id, next_review_at)
  WHERE next_review_at IS NOT NULL AND deleted_at IS NULL;

COMMENT ON COLUMN public.bible_studies.review_stage IS
  'Revisões já feitas (0 a 4). NULL = fora do agendamento.';
COMMENT ON COLUMN public.bible_studies.next_review_at IS
  'Quando vence a próxima revisão. NULL = nenhuma revisão pendente.';
