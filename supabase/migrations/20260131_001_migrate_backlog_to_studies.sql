-- Migration: Unificar bible_backlog em bible_studies
-- Epic 7.1 - Story 7.1.1
-- Idempotente: pode rodar múltiplas vezes sem duplicar dados

-- Migrar items de bible_backlog SEM source_study_id
-- (items COM source_study_id já existem em bible_studies)
-- Parse de reference_label para extrair book_name e chapter_number

DO $$
DECLARE
  rec RECORD;
  v_book_name TEXT;
  v_chapter INT;
  v_parts TEXT[];
  v_last_part TEXT;
BEGIN
  FOR rec IN
    SELECT id, user_id, reference_label, created_at
    FROM bible_backlog
    WHERE source_study_id IS NULL
  LOOP
    -- Parse reference_label: "Gênesis 1", "1 Samuel 3", "Êxodo 20"
    -- Estratégia: última parte numérica é o capítulo, resto é o nome do livro
    v_parts := string_to_array(rec.reference_label, ' ');
    v_last_part := v_parts[array_length(v_parts, 1)];

    -- Tenta extrair número do capítulo da última parte
    IF v_last_part ~ '^\d+$' THEN
      v_chapter := v_last_part::INT;
      v_book_name := array_to_string(v_parts[1:array_length(v_parts, 1) - 1], ' ');
    ELSE
      -- Fallback: capítulo 1, nome literal completo
      v_chapter := 1;
      v_book_name := rec.reference_label;
    END IF;

    -- Garantir que book_name não fique vazio
    IF v_book_name IS NULL OR v_book_name = '' THEN
      v_book_name := rec.reference_label;
    END IF;

    -- Inserir apenas se não existe estudo idêntico (idempotência)
    INSERT INTO bible_studies (user_id, title, book_name, chapter_number, status, content, tags, created_at, updated_at)
    SELECT
      rec.user_id,
      rec.reference_label,
      v_book_name,
      v_chapter,
      'estudar',
      '{"type": "doc", "content": [{"type": "paragraph"}]}'::jsonb,
      '[]'::jsonb,
      rec.created_at,
      rec.created_at
    WHERE NOT EXISTS (
      SELECT 1 FROM bible_studies bs
      WHERE bs.user_id = rec.user_id
        AND bs.book_name = v_book_name
        AND bs.chapter_number = v_chapter
        AND bs.title = rec.reference_label
        AND bs.status = 'estudar'
    );
  END LOOP;
END $$;
