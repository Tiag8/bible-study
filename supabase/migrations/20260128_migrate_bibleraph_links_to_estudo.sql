-- Migration: Migrate legacy bible-graph:// links to /estudo/ URLs
-- Purpose: Convert all legacy protocol references in study content to REST-standard URLs
-- Context: Phase 3 removed custom protocol in favor of HTTP relative URLs

-- Step 1: Update all bible_studies.content that contain legacy bible-graph:// protocol
-- Pattern: "href":"bible-graph://study/{id}" → "href":"/estudo/{id}"

UPDATE bible_studies
SET content = jsonb_set(
  content,
  '{blocks}',
  (
    SELECT jsonb_agg(
      CASE
        WHEN block->>'type' = 'paragraph' THEN
          -- Update paragraph content with HTML link replacement
          jsonb_set(
            block,
            '{content}',
            to_jsonb(
              regexp_replace(
                block->'content'->0->>'text',
                'bible-graph://study/([a-f0-9-]+)',
                '/estudo/\1',
                'g'
              )
            )
          )
        ELSE
          block
      END
    )
    FROM jsonb_array_elements(content->'blocks') AS block
  )
)
WHERE content::text LIKE '%bible-graph://%'
  AND user_id = auth.uid();

-- Step 2: Verify conversion (run this separately to check results)
-- SELECT
--   id,
--   book_id,
--   chapter,
--   content::text LIKE '%bible-graph://%' as still_has_legacy,
--   content::text LIKE '%/estudo/%' as has_new_format
-- FROM bible_studies
-- WHERE content::text LIKE '%/estudo/%' OR content::text LIKE '%bible-graph://%'
-- ORDER BY updated_at DESC;

-- Step 3: Add comment documenting the migration
COMMENT ON TABLE bible_studies IS 'Stores user study notes with rich text content. Phase 3 migration (2026-01-28): Converted legacy bible-graph:// protocol links to REST-standard /estudo/ URLs.';
