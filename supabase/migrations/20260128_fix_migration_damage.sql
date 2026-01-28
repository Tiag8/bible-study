-- Migration: Fix migration damage from previous bible-graph:// conversion
-- Issue: Previous migration set content = NULL for studies without bible-graph:// links
-- Solution: Use string replacement (safe) instead of JSONB manipulation

-- Step 1: Restore content structure by replacing bible-graph:// protocol in the JSON text
-- This uses simple string replacement which preserves the entire JSON structure

UPDATE bible_studies
SET content = content::text::regexpreplace(
  'bible-graph://study/([a-f0-9-]{36})',
  '/estudo/\1',
  'g'
)::jsonb
WHERE content IS NOT NULL
  AND content::text LIKE '%bible-graph://%';

-- Step 2: For studies where content became NULL (due to previous migration bug),
-- we need to reset them to default empty structure since we cannot recover the original content
-- This should only affect studies where content IS NULL after the previous migration

-- Note: The study b72da027-fc18-48f3-9c3c-820673e70301 cannot be recovered
-- as the original content was lost in the previous migration.
-- Reset to default empty document so editor can function:
UPDATE bible_studies
SET content = jsonb_build_object(
  'type', 'doc',
  'content', jsonb_build_array()
)
WHERE content IS NULL;

-- Step 3: Verify conversion
SELECT COUNT(*) as total_studies,
       COUNT(CASE WHEN content::text LIKE '%bible-graph://%' THEN 1 END) as still_has_legacy,
       COUNT(CASE WHEN content IS NULL THEN 1 END) as has_null_content
FROM bible_studies;
