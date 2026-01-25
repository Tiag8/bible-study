# 🏗️ Bible Graph - Arquitetura Técnica

## 🛠️ Stack Tecnológica
- **Frontend:** Next.js 15 (App Router), Tailwind CSS.
- **Backend/DB:** Supabase (Auth + PostgreSQL).
- **Editor de Texto:** Tiptap (Headless).
- **Estado:** React Hooks + Server Actions.

## 📂 Estrutura de Pastas (Padrão)
- `src/app/`: Rotas (Dashboard, Editor, Grafo, Config).
- `src/components/`: UI (Cards, Sidebar) e Editor (Tiptap Extensions).
- `src/lib/`: Configurações (Supabase Client, Tiptap Config).
- `src/hooks/`: Lógica de dados (useStudies, useBacklog).

## 🔄 Fluxo de Dados Crítico
1. **Salvamento de Links:** O editor deve extrair IDs de referências e atualizar a tabela `study_links`.
2. **Multi-usuário:** Todas as tabelas devem conter `user_id` e usar RLS (Row Level Security).