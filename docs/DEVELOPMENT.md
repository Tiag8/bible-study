# Guia de Desenvolvimento - Bible Study

## 🚀 Setup Inicial

```bash
# 1. Clonar repositório
git clone https://github.com/Tiag8/bible-study.git
cd bible-study

# 2. Instalar dependências
npm install

# 3. Configurar ambiente
cp .env.example .env.local
# Editar .env.local com credenciais do Supabase

# 4. Iniciar servidor
npm run dev
```

---

## 🔄 Workflow Diário

### Começar o Dia
```bash
# 1. Atualizar código
git pull origin main

# 2. Restart limpo (IMPORTANTE!)
npm run restart

# 3. Abrir no navegador
open http://localhost:3000
```

### Durante Desenvolvimento
```bash
# Hot reload automático
# Apenas edite os arquivos - Next.js recompila automaticamente

# Se hot reload não funcionar:
npm run restart
```

### Fim do Dia / Antes de Commit
```bash
# 1. Verificar build
npm run build

# 2. Rodar testes (quando implementados)
# npm test

# 3. Commit
git add .
git commit -m "feat: descrição da mudança"
git push
```

---

## 📜 Scripts NPM Disponíveis

| Comando | Descrição | Quando Usar |
|---------|-----------|-------------|
| `npm run dev` | Inicia servidor dev | Desenvolvimento normal |
| `npm run build` | Build production | Antes de deploy, verificar erros |
| `npm run start` | Inicia servidor prod | Testar build localmente |
| `npm run lint` | Verifica código | Antes de commit |
| `npm run clean` | Remove .next | Problemas de cache |
| `npm run clean:full` | Remove tudo e reinstala | Problemas graves |
| `npm run restart` | Restart limpo | **Após git pull/merge** |
| `npm run restart:full` | Restart completo | Após npm install |

---

## 🎯 Quando Usar Cada Comando

### `npm run restart` (Mais Comum)
Use sempre que:
- ✅ Fez `git pull` ou `git merge`
- ✅ Hot reload não funcionou
- ✅ Erros 404 de recursos estáticos
- ✅ Mudou estrutura de pastas
- ✅ Adicionou/removeu páginas

### `npm run restart:full` (Menos Comum)
Use quando:
- ✅ Instalou/atualizou dependências (`npm install`)
- ✅ Problemas persistem após restart normal
- ✅ Mudou Next.js ou React version
- ✅ Node modules parecem corrompidos

### `npm run build` (Sempre Antes de Deploy)
Use para:
- ✅ Verificar se código compila sem erros
- ✅ Testar build production localmente
- ✅ Antes de criar Pull Request
- ✅ Antes de fazer deploy

---

## 🔧 Troubleshooting

### Problema: Erros 404 de recursos estáticos
```bash
npm run restart
# Hard reload navegador (Cmd+Shift+R / Ctrl+Shift+R)
```

### Problema: Hot reload não funciona
```bash
npm run restart
```

### Problema: Build com erros
```bash
# Ver erros detalhados
npm run build

# Se necessário, restart completo
npm run restart:full
```

### Problema: Servidor não inicia
```bash
# Parar processos na porta 3000
lsof -ti:3000 | xargs kill -9

# Restart limpo
npm run restart
```

### Problema: Tudo quebrou
```bash
# Nuclear option - reset completo
npm run clean:full
npm run build
npm run dev
```

Ver mais: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

## 📝 Convenções de Código

### Commits
```bash
# Conventional Commits
feat: adiciona nova funcionalidade
fix: corrige bug
refactor: refatora código
docs: atualiza documentação
chore: tarefas de manutenção
```

### Branches
```bash
# Pattern: tipo/descrição-curta
feat/delete-button
fix/editor-save-bug
refactor/auth-system
```

### Código
- **Comentários**: Português
- **Variáveis/Funções**: camelCase
- **Componentes**: PascalCase
- **Database**: snake_case + prefixo `bible_`

---

## 🗂️ Estrutura do Projeto

```
src/
├── app/                 # Pages (Next.js App Router)
│   ├── page.tsx        # Dashboard
│   ├── login/          # Auth
│   ├── estudo/[id]/    # Editor
│   └── grafo/          # Grafo
├── components/         # Componentes React
│   ├── dashboard/      # Dashboard components
│   ├── Editor/         # Tiptap editor
│   └── ui/             # shadcn/ui components
├── hooks/              # Custom hooks
├── lib/                # Utilitários
└── contexts/           # React contexts

scripts/                # Scripts úteis
docs/                   # Documentação
supabase/
└── migrations/         # Database migrations
```

---

## 🔐 Variáveis de Ambiente

```bash
# .env.local (NÃO commitar!)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
DATABASE_URL=postgresql://xxx
```

---

## 🚦 CI/CD

### Pull Request
```bash
# 1. Criar branch
git checkout -b feat/nova-feature

# 2. Fazer mudanças + commit
git add .
git commit -m "feat: descrição"

# 3. Push
git push -u origin feat/nova-feature

# 4. Criar PR no GitHub
gh pr create --title "Título" --body "Descrição"

# 5. Merge (após review)
gh pr merge <número> --merge --delete-branch
```

### Deploy
- **Automático**: Push para `main` → Vercel deploy automático
- **Manual**: Vercel dashboard → Deploy

---

## 📚 Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tiptap Docs](https://tiptap.dev)
- [shadcn/ui](https://ui.shadcn.com)

---

**Última atualização**: 2026-01-26
