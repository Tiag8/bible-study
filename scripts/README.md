# Scripts do Life Track Growth

Documentação de todos os scripts de automação, migração e qualidade disponíveis no projeto.

---

## 📦 Scripts de Migração (Supabase)

Estes scripts foram criados para migrar o projeto do Lovable Cloud Supabase para um Supabase self-hosted com prefixo `lifetracker_` em todas as tabelas.

### 1. `add-lifetracker-prefix.js`

Adiciona o prefixo `lifetracker_` a todos os objetos do banco de dados no SQL consolidado.

```bash
node scripts/add-lifetracker-prefix.js
```

**O que faz:**
- Lê `/Users/tiago/Downloads/consolidated-migration.sql`
- Adiciona prefixo `lifetracker_` em:
  - 21 tabelas
  - 11 functions
  - 12 triggers
  - 5 ENUMs
  - 6 indexes
  - 1 materialized view
- Gera `supabase/lifetracker-consolidated-migration.sql`

**Variáveis de ambiente necessárias:** Nenhuma

---

### 2. `apply-migration-to-supabase.js`

Aplica o SQL modificado (com prefixos) no novo Supabase via conexão direta PostgreSQL.

```bash
node scripts/apply-migration-to-supabase.js
```

**O que faz:**
- Conecta no Supabase via `DATABASE_URL`
- Executa `supabase/lifetracker-consolidated-migration.sql`
- Valida objetos criados (tabelas, functions, triggers, etc)
- Gera `migration-report.json`

**Variáveis de ambiente necessárias:**
- `DATABASE_URL` - Connection string do PostgreSQL

**Saída:**
- `migration-report.json` - Relatório da migração

---

### 3. `migrate-data-from-lovable.js`

Migra dados do Lovable Supabase para o novo Supabase, tabela por tabela.

```bash
node scripts/migrate-data-from-lovable.js
```

**O que faz:**
- Autentica no Lovable Supabase com email/senha
- Exporta dados de 21 tabelas em ordem de dependências
- Inserta no novo Supabase com prefixo `lifetracker_`
- Tratamento de erros (duplicatas, foreign keys, etc)
- Batch processing (100 registros por vez)

**Variáveis de ambiente necessárias:**
- `SUPABASE_URL` - URL do novo Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (bypassa RLS)

**Credenciais Lovable (hardcoded no script - remover antes de commit público):**
- Email: `tiag8guimaraes@gmail.com`
- Password: `123456`

**Saída:**
- `data-migration-report.json` - Relatório detalhado da migração de dados

**Ordem de migração (preserva foreign keys):**
1. `profiles` → `lifetracker_profiles`
2. `user_roles` → `lifetracker_user_roles`
3. `habit_categories` → `lifetracker_habit_categories`
4. `habits` → `lifetracker_habits`
5. `habit_entries` → `lifetracker_habit_entries`
6. (... e assim por diante)

---

### 4. `check-user-uuid.js`

Verifica se o UUID do usuário no novo Supabase corresponde ao UUID do Lovable.

```bash
node scripts/check-user-uuid.js
```

**O que faz:**
- Busca usuário `tiag8guimaraes@gmail.com` no novo Supabase
- Compara com UUID do Lovable (`c68aac85-0829-4eed-9c32-ef09b28e4cc3`)
- Exibe resultado da comparação

**Variáveis de ambiente necessárias:**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

---

### 5. `fix-user-uuid.js`

Deleta usuário com UUID errado e recria com UUID correto do Lovable.

```bash
node scripts/fix-user-uuid.js
```

**O que faz:**
- Deleta usuário com UUID errado via Admin API
- Cria novo usuário via SQL direto em `auth.users`
- Cria identity em `auth.identities`
- Usa UUID do Lovable: `c68aac85-0829-4eed-9c32-ef09b28e4cc3`

**Variáveis de ambiente necessárias:**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`

**IMPORTANTE:** Senha do usuário será temporária. Redefinir no Supabase Dashboard depois.

---

### 6. `create-identity-final.js`

Cria entrada em `auth.identities` para o usuário (caso não exista).

```bash
node scripts/create-identity-final.js
```

**O que faz:**
- Insere record em `auth.identities` via SQL direto
- Usa UUID do Lovable: `c68aac85-0829-4eed-9c32-ef09b28e4cc3`
- Skip se identity já existir (erro 23505)

**Variáveis de ambiente necessárias:**
- `DATABASE_URL`

---

### 7. `add-yearly-to-enum.js`

Adiciona valor `'yearly'` ao ENUM `lifetracker_timeframe_type`.

```bash
node scripts/add-yearly-to-enum.js
```

**O que faz:**
- Adiciona `'yearly'` ao ENUM (goals tinham esse valor no Lovable)
- Skip se valor já existir

**Variáveis de ambiente necessárias:**
- `DATABASE_URL`

---

### 8. `update-table-names.js`

Atualiza código do frontend para usar nomes de tabelas com prefixo `lifetracker_`.

```bash
node scripts/update-table-names.js
```

**O que faz:**
- Substitui `.from('tabela')` por `.from('lifetracker_tabela')`
- Atualiza 22 arquivos do código fonte
- Total de 67 substituições

**Variáveis de ambiente necessárias:** Nenhuma

**Arquivos atualizados:**
- `src/pages/*.tsx` (7 arquivos)
- `src/hooks/*.ts` (5 arquivos)
- `src/components/**/*.tsx` (9 arquivos)
- `src/contexts/*.tsx` (1 arquivo)

---

### 9. `update-edge-functions.js`

Atualiza Edge Functions do Supabase para usar nomes de tabelas com prefixo.

```bash
node scripts/update-edge-functions.js
```

**O que faz:**
- Substitui `.from('tabela')` por `.from('lifetracker_tabela')`
- Atualiza 4 Edge Functions
- Total de 15 substituições

**Variáveis de ambiente necessárias:** Nenhuma

**Edge Functions atualizadas:**
- `supabase/functions/analyze-assessment/index.ts`
- `supabase/functions/analyze-habit-performance/index.ts`
- `supabase/functions/coach-chat/index.ts`
- `supabase/functions/compare-assessments/index.ts`

**IMPORTANTE:** Após executar, fazer deploy das Edge Functions:
```bash
supabase functions deploy analyze-assessment analyze-habit-performance coach-chat compare-assessments
```

---

## 🧪 Scripts de Qualidade e Testes

### `run-tests.sh`

Executa todos os testes do projeto (TypeScript, ESLint, Build, Security).

```bash
./scripts/run-tests.sh
```

**O que faz:**
- TypeScript type checking
- ESLint linting
- Build de produção
- Scan de secrets

---

### `code-review.sh`

Executa code review automatizado.

```bash
./scripts/code-review.sh
```

**O que faz:**
- Análise de qualidade do código
- Verifica padrões e convenções
- Identifica code smells

---

### `run-security-tests.sh`

Executa security scan completo.

```bash
./scripts/run-security-tests.sh
```

**O que faz:**
- Scan de secrets hardcoded
- Verifica vulnerabilidades em dependências
- Valida .env não commitado
- Checa SQL injection e XSS

---

## 🔧 Scripts de Desenvolvimento

### `create-feature-branch.sh`

Cria nova branch de feature a partir da main.

```bash
./scripts/create-feature-branch.sh "nome-da-feature"
```

**O que faz:**
- Checkout na main e pull
- Cria branch `feat/nome-da-feature`
- Checkout na nova branch

---

### `commit-and-push.sh`

Commit com validação e push.

```bash
./scripts/commit-and-push.sh "mensagem do commit"
```

**O que faz:**
- Valida código (linting, tests, security)
- Faz commit com mensagem
- Push para remote

---

## 💾 Scripts de Backup/Restore (Supabase)

### `backup-supabase.sh`

Cria backup do banco de dados Supabase.

```bash
./scripts/backup-supabase.sh
```

**O que faz:**
- Exporta schema e dados
- Salva em `backups/`
- Timestamp no nome do arquivo

**Variáveis de ambiente necessárias:**
- `DATABASE_URL`

---

### `restore-supabase.sh`

Restaura backup do banco de dados.

```bash
./scripts/restore-supabase.sh <backup-file>
```

**O que faz:**
- Restaura schema e dados de backup
- Valida integridade

**Variáveis de ambiente necessárias:**
- `DATABASE_URL`

---

## 📚 Scripts de Documentação

### `update-docs.sh`

Atualiza documentação do projeto.

```bash
./scripts/update-docs.sh
```

**O que faz:**
- Gera documentação de API
- Atualiza índices
- Valida links

---

### `meta-learning.sh`

Extrai aprendizados de commits recentes.

```bash
./scripts/meta-learning.sh
```

**O que faz:**
- Analisa commits recentes
- Identifica padrões
- Gera relatório de aprendizados

---

## 🔄 Scripts de Sincronização

### `sync-to-template.sh`

Sincroniza melhorias genéricas para o project-template.

```bash
./scripts/sync-to-template.sh
```

**O que faz:**
- Identifica melhorias genéricas
- Copia para project-template
- Documenta mudanças

---

## 🔑 Variáveis de Ambiente Necessárias

Criar arquivo `.env` na raiz do projeto com:

```env
# Novo Supabase (fjddlffnlbrhgogkyplq)
VITE_SUPABASE_URL=https://fjddlffnlbrhgogkyplq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
DATABASE_URL=postgresql://postgres.[ID]:[PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres

# Gemini AI (para AI features)
VITE_GEMINI_API_KEY=AIza...
```

---

## 📝 Ordem Recomendada de Execução (Migração)

Para realizar uma migração completa do Lovable para novo Supabase:

```bash
# 1. Preparar SQL com prefixos
node scripts/add-lifetracker-prefix.js

# 2. Aplicar schema no novo Supabase
node scripts/apply-migration-to-supabase.js

# 3. Corrigir UUID do usuário (se necessário)
node scripts/check-user-uuid.js
node scripts/fix-user-uuid.js  # Se UUIDs diferentes
node scripts/create-identity-final.js

# 4. Adicionar ENUMs extras (se necessário)
node scripts/add-yearly-to-enum.js

# 5. Migrar dados
node scripts/migrate-data-from-lovable.js

# 6. Atualizar código da aplicação
node scripts/update-table-names.js
node scripts/update-edge-functions.js

# 7. Deploy Edge Functions
supabase functions deploy analyze-assessment analyze-habit-performance coach-chat compare-assessments

# 8. Gerar types TypeScript
npx supabase gen types typescript --project-id fjddlffnlbrhgogkyplq > src/integrations/supabase/types.ts

# 9. Testar aplicação
npm run dev
```

---

## 🐛 Troubleshooting

### Erro: "Cannot find module 'pg'"
```bash
npm install pg
```

### Erro: "Connection refused"
```bash
# Verificar DATABASE_URL no .env
# Verificar se Supabase está online
```

### Erro: "Table already exists"
```bash
# Limpar banco antes de aplicar migration
# Ou usar migrations incrementais
```

---

**Última atualização:** 2025-10-29
**Versão do projeto:** 1.0.0
