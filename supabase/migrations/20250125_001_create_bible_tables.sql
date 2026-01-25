-- ============================================
-- Bible Study - Schema Migration
-- Prefixo obrigatório: bible_
-- ============================================

-- Habilitar UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: bible_tags
-- Tags para categorização de estudos
-- ============================================
CREATE TABLE IF NOT EXISTS bible_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('Versículos', 'Temas', 'Princípios')) DEFAULT 'Temas',
  color TEXT DEFAULT 'blue',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- ============================================
-- TABELA: bible_studies
-- Estudos bíblicos com conteúdo do editor Tiptap
-- ============================================
CREATE TABLE IF NOT EXISTS bible_studies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content JSONB DEFAULT '{"type": "doc", "content": [{"type": "paragraph"}]}'::jsonb,
  book_name TEXT NOT NULL,
  chapter_number INTEGER NOT NULL CHECK (chapter_number > 0),
  status TEXT CHECK (status IN ('draft', 'completed')) DEFAULT 'draft',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  -- Índice único por usuário, livro e capítulo
  UNIQUE(user_id, book_name, chapter_number)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_bible_studies_user_id ON bible_studies(user_id);
CREATE INDEX IF NOT EXISTS idx_bible_studies_book ON bible_studies(book_name);
CREATE INDEX IF NOT EXISTS idx_bible_studies_status ON bible_studies(status);
CREATE INDEX IF NOT EXISTS idx_bible_studies_tags ON bible_studies USING GIN(tags);

-- ============================================
-- TABELA: bible_study_links
-- Conexões entre estudos (grafo)
-- ============================================
CREATE TABLE IF NOT EXISTS bible_study_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  source_study_id UUID REFERENCES bible_studies(id) ON DELETE CASCADE,
  target_study_id UUID REFERENCES bible_studies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Evita links duplicados
  UNIQUE(user_id, source_study_id, target_study_id),
  -- Evita self-links
  CHECK (source_study_id != target_study_id)
);

-- Índices para performance do grafo
CREATE INDEX IF NOT EXISTS idx_bible_study_links_user_id ON bible_study_links(user_id);
CREATE INDEX IF NOT EXISTS idx_bible_study_links_source ON bible_study_links(source_study_id);
CREATE INDEX IF NOT EXISTS idx_bible_study_links_target ON bible_study_links(target_study_id);

-- ============================================
-- TABELA: bible_backlog
-- Itens de backlog para estudos futuros
-- ============================================
CREATE TABLE IF NOT EXISTS bible_backlog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reference_label TEXT NOT NULL,
  source_study_id UUID REFERENCES bible_studies(id) ON DELETE SET NULL,
  status BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para backlog
CREATE INDEX IF NOT EXISTS idx_bible_backlog_user_id ON bible_backlog(user_id);
CREATE INDEX IF NOT EXISTS idx_bible_backlog_status ON bible_backlog(status);

-- ============================================
-- TRIGGER: Atualizar updated_at automaticamente
-- ============================================
CREATE OR REPLACE FUNCTION bible_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bible_studies_update_timestamp
  BEFORE UPDATE ON bible_studies
  FOR EACH ROW
  EXECUTE FUNCTION bible_update_timestamp();

-- ============================================
-- RLS POLICIES
-- Row Level Security para isolamento por usuário
-- ============================================

-- Habilitar RLS
ALTER TABLE bible_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE bible_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE bible_study_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE bible_backlog ENABLE ROW LEVEL SECURITY;

-- Policies para bible_tags
CREATE POLICY "Users can view own tags" ON bible_tags
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tags" ON bible_tags
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tags" ON bible_tags
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tags" ON bible_tags
  FOR DELETE USING (auth.uid() = user_id);

-- Policies para bible_studies
CREATE POLICY "Users can view own studies" ON bible_studies
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own studies" ON bible_studies
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own studies" ON bible_studies
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own studies" ON bible_studies
  FOR DELETE USING (auth.uid() = user_id);

-- Policies para bible_study_links
CREATE POLICY "Users can view own links" ON bible_study_links
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own links" ON bible_study_links
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own links" ON bible_study_links
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own links" ON bible_study_links
  FOR DELETE USING (auth.uid() = user_id);

-- Policies para bible_backlog
CREATE POLICY "Users can view own backlog" ON bible_backlog
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own backlog" ON bible_backlog
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own backlog" ON bible_backlog
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own backlog" ON bible_backlog
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- VIEW: bible_graph_data
-- Dados formatados para visualização do grafo
-- ============================================
CREATE OR REPLACE VIEW bible_graph_data AS
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
     FROM bible_study_links l
     WHERE l.source_study_id = s.id),
    '[]'::json
  ) as outgoing_links
FROM bible_studies s;

-- Comentários para documentação
COMMENT ON TABLE bible_studies IS 'Estudos bíblicos com conteúdo do editor Tiptap';
COMMENT ON TABLE bible_study_links IS 'Conexões entre estudos para visualização em grafo';
COMMENT ON TABLE bible_backlog IS 'Lista de referências bíblicas para estudo futuro';
COMMENT ON TABLE bible_tags IS 'Tags para categorização temática dos estudos';
