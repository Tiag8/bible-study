# 🗄️ Bible Graph - Schema do Banco de Dados

## Tabelas Principais

### `studies`
- `id`: uuid (primary key)
- `user_id`: uuid (auth.users)
- `title`: text
- `content`: jsonb (Tiptap JSON)
- `book`: text
- `chapter`: int
- `status`: text (draft, completed)
- `created_at`, `updated_at`, `completed_at`: timestamp

### `study_links` (Tabela de Junção para o Grafo)
- `id`: uuid
- `source_id`: uuid (fk studies.id)
- `target_id`: uuid (fk studies.id)
- `user_id`: uuid

### `backlog`
- `id`: uuid
- `user_id`: uuid
- `reference_label`: text (ex: "Êxodo 20")
- `source_study_id`: uuid (fk studies.id)
- `status`: boolean