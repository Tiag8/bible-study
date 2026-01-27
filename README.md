# Bible Study - Segundo Cérebro

Aplicativo de estudo bíblico com editor rico e visualização em grafo estilo "Segundo Cérebro" (Obsidian/Roam Research).

## Features

- **Dashboard**: Visualização dos 66 livros da Bíblia organizados por categorias
- **Editor Rico**: Tiptap Editor com Bubble Menu e Slash Menu para anotações
- **Grafo Interativo**: Visualização das conexões entre estudos (react-force-graph)
- **Auto-save**: Salvamento automático a cada 30 segundos
- **Backlog**: Painel lateral com referências para estudo futuro

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: React 18 + TypeScript + TailwindCSS
- **Componentes**: shadcn/ui (Radix UI)
- **Editor**: Tiptap
- **Grafo**: react-force-graph-2d
- **Ícones**: Lucide React

## Instalação

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

Acesse http://localhost:3000

### ⚠️ Após Git Pull/Merge
```bash
# SEMPRE executar após pull/merge para evitar erros 404
npm run restart
```

Ver: [Guia de Desenvolvimento](./docs/DEVELOPMENT.md) | [Troubleshooting](./docs/TROUBLESHOOTING.md) | [Design Tokens Guide](./docs/guides/DESIGN_TOKENS_GUIDE.md)

## Estrutura

```
src/
├── app/
│   ├── page.tsx           # Dashboard principal
│   ├── estudo/[id]/       # Página de estudo (editor)
│   └── grafo/             # Visualização do grafo
├── components/
│   ├── dashboard/         # Sidebar, TopBar, BookGrid, etc.
│   ├── Editor/            # Tiptap Editor
│   └── ui/                # shadcn/ui components
└── lib/
    └── mock-data.ts       # Dados mockados (66 livros, estudos, links)
```

## Screenshots

### Dashboard
Navegue pelos 66 livros da Bíblia organizados por categoria (Pentateuco, Históricos, Poéticos, etc.)

### Editor de Estudo
Editor rico com suporte a formatação, listas, citações e mais.

### Grafo - Segundo Cérebro
Visualização interativa das conexões entre seus estudos bíblicos.

## Licença

MIT
