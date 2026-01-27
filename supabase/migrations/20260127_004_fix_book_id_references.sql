-- Migration: Fix book_id references (should be book_name)
-- Issue: Migrations 20260127_001 and 20260127_002 used book_id but schema has book_name
-- This causes INSERT errors: "record 'new' has no field 'book_id'"
-- Date: 2026-01-27

-- ============================================
-- 1. Drop problematic trigger and functions
-- ============================================

-- Drop trigger que tenta acessar NEW.book_id (não existe)
DROP TRIGGER IF EXISTS bible_trigger_update_search_vector ON bible_studies;

-- Drop functions que retornam/usam book_id
DROP FUNCTION IF EXISTS bible_update_search_vector() CASCADE;
DROP FUNCTION IF EXISTS bible_search_studies(TEXT, UUID) CASCADE;
DROP FUNCTION IF EXISTS bible_get_deleted_studies(UUID) CASCADE;

-- ============================================
-- 2. Remove search_vector column (optional cleanup)
-- ============================================
ALTER TABLE bible_studies
DROP COLUMN IF EXISTS search_vector;

-- Drop associated index
DROP INDEX IF EXISTS idx_bible_studies_search;

-- ============================================
-- 3. Recreate bible_get_deleted_studies() with correct column (book_name)
-- ============================================
CREATE OR REPLACE FUNCTION bible_get_deleted_studies(
  p_user_id UUID
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  book_name TEXT,
  chapter_number INTEGER,
  deleted_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.title,
    s.book_name,
    s.chapter_number,
    s.deleted_at
  FROM bible_studies s
  WHERE s.user_id = p_user_id AND s.deleted_at IS NOT NULL
  ORDER BY s.deleted_at DESC
  LIMIT 100;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- ============================================
-- 4. Grant permissions
-- ============================================
GRANT EXECUTE ON FUNCTION bible_get_deleted_studies(UUID) TO authenticated;

-- ============================================
-- 5. Documentation
-- ============================================
COMMENT ON FUNCTION bible_get_deleted_studies(UUID) IS
  'RPC para listar studies deletados do usuário (corrected: book_name not book_id)';
