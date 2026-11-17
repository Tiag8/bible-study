-- Migration: Study attachments (files and images stored with each study)
-- Date: 2026-11-17
-- Idempotent: safe to run more than once.
--
-- Files live in a private Storage bucket under the path
--   <user_id>/<study_id>/<timestamp>-<file name>
-- so ownership is enforced by the first path segment. No table is needed:
-- the app lists the study folder directly.
--
-- Rollback:
--   DROP POLICY IF EXISTS "bible_attachments_select_own" ON storage.objects;
--   DROP POLICY IF EXISTS "bible_attachments_insert_own" ON storage.objects;
--   DROP POLICY IF EXISTS "bible_attachments_delete_own" ON storage.objects;
--   then empty and delete the bucket 'bible-attachments' through the Storage API.

-- ============================================
-- 1. Private bucket, 10 MB per file
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'bible-attachments',
  'bible-attachments',
  false,
  10485760,
  ARRAY[
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/gif',
    'image/heic',
    'application/pdf',
    'text/plain',
    'text/markdown',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. RLS: each user reaches only their own folder
-- ============================================
DROP POLICY IF EXISTS "bible_attachments_select_own" ON storage.objects;
CREATE POLICY "bible_attachments_select_own"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'bible-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "bible_attachments_insert_own" ON storage.objects;
CREATE POLICY "bible_attachments_insert_own"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'bible-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "bible_attachments_delete_own" ON storage.objects;
CREATE POLICY "bible_attachments_delete_own"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'bible-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
