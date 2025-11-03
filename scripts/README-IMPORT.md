# Guia de Importação de Dados para Novo Supabase

Este guia explica como usar o script de importação para migrar todos os dados do Life Tracker para uma nova instância do Supabase.

## Pré-requisitos

### 1. Dependências
Certifique-se de ter as dependências instaladas:
```bash
npm install @supabase/supabase-js dotenv
```

### 2. Dados Exportados
Os arquivos JSON devem estar no diretório `data/`:
- `profiles.json`
- `user_roles.json`
- `habit_categories.json`
- `habits.json`
- `goals.json`
- `habit_entries.json`
- `goal_entries.json`
- `assessment_responses.json`
- `assessment_history.json`
- `ai_suggestions.json`
- `coach_conversations.json`
- `coach_messages.json`
- `milestones.json`
- `user_onboarding.json`

### 3. Novo Projeto Supabase
Crie um novo projeto no Supabase e:
1. Execute as migrations para criar as tabelas
2. Configure as policies RLS
3. Obtenha as credenciais (URL e Service Role Key)

## Configuração

### Passo 1: Configure as Variáveis de Ambiente

Copie o arquivo de exemplo:
```bash
cp .env.import.example .env
```

Ou adicione ao seu `.env` existente:
```env
NEW_SUPABASE_URL=https://[seu-novo-projeto].supabase.co
NEW_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEW_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**IMPORTANTE:** A Service Role Key é sensível e bypassa todas as políticas RLS. Mantenha-a segura!

### Passo 2: Obter Credenciais do Supabase

1. Acesse o dashboard do seu novo projeto: `https://supabase.com/dashboard/project/[project-id]`
2. Vá em **Settings → API**
3. Copie:
   - **URL** (Project URL)
   - **service_role key** (em "Project API keys" → service_role)

## Executando a Importação

### Modo Básico
```bash
node scripts/import-to-new-supabase.js
```

### Com Logs Detalhados
```bash
node scripts/import-to-new-supabase.js 2>&1 | tee import.log
```

## O Que o Script Faz

### 1. Validação
- Verifica variáveis de ambiente
- Testa conexão com Supabase
- Valida existência das tabelas
- Verifica estrutura dos arquivos JSON

### 2. Importação em Ordem
O script importa as tabelas respeitando as foreign keys:

1. **profiles** (cria usuários em auth.users primeiro)
2. **user_roles**
3. **habit_categories**
4. **habits**
5. **goals**
6. **habit_entries**
7. **goal_entries**
8. **assessment_responses**
9. **assessment_history**
10. **ai_suggestions**
11. **coach_conversations**
12. **coach_messages**
13. **milestones**
14. **user_onboarding**

### 3. Features do Script

#### Criação Automática de Usuários Auth
Para cada profile, o script:
- Verifica se o usuário já existe em `auth.users`
- Cria o usuário se não existir
- Preserva o UUID original
- Adiciona metadata de importação

#### Upsert (INSERT ON CONFLICT)
- Usa `UPSERT` em todas as tabelas
- Atualiza registros existentes em caso de conflito
- Preserva UUIDs originais quando possível

#### Importação em Lotes
- Processa registros em lotes de 100
- Mostra progresso em tempo real
- Continua mesmo se um lote falhar

#### Tratamento de Erros
- Captura erros por lote
- Continua importação de outras tabelas
- Registra todos os erros no relatório

### 4. Relatório Final
Ao finalizar, o script gera:
- Sumário no console com cores
- Arquivo JSON detalhado: `data/import-report-[timestamp].json`
- Estatísticas por tabela
- Lista de erros encontrados

## Exemplo de Saída

```
═══════════════════════════════════════════════════════
  Iniciando Importação de Dados para Novo Supabase
═══════════════════════════════════════════════════════

URL: https://xyz123.supabase.co
Data/Hora: 29/10/2025 14:30:00

Testando conexão com Supabase...
✓ Conexão estabelecida com sucesso

Importando: profiles
  Total de registros: 5
  ℹ Usuário auth já existe: user@example.com
  ✓ Usuário auth criado: newuser@example.com
  Progresso: 5/5 registros
✓ Importação completa: 5 registros em 2.3s

Importando: habit_categories
  Total de registros: 8
  Progresso: 8/8 registros
✓ Importação completa: 8 registros em 0.5s

...

═══════════════════════════════════════════════════════
  Relatório de Importação
═══════════════════════════════════════════════════════

Duração total: 45.2s
Tabelas processadas: 14
Total de registros: 1247
Sucessos: 1245
Falhas: 2

Detalhes por Tabela:
  ✓ profiles: 5/5 (2.3s)
  ✓ user_roles: 3/3 (0.4s)
  ✓ habit_categories: 8/8 (0.5s)
  ✓ habits: 15/15 (1.2s)
  ...

Relatório salvo em: data/import-report-1730217000000.json

✓ Importação concluída com sucesso!
```

## Estrutura do Relatório JSON

```json
{
  "startTime": "2025-10-29T14:30:00.000Z",
  "endTime": "2025-10-29T14:30:45.200Z",
  "tablesProcessed": 14,
  "totalRecords": 1247,
  "successfulImports": 1245,
  "failedImports": 2,
  "errors": [],
  "tableStats": {
    "profiles": {
      "total": 5,
      "success": 5,
      "failed": 0,
      "duration": "2.3s",
      "errors": []
    },
    ...
  }
}
```

## Troubleshooting

### Erro: "Variáveis de ambiente faltando"
**Solução:** Verifique se `.env` contém `NEW_SUPABASE_URL` e `NEW_SUPABASE_SERVICE_ROLE_KEY`

### Erro: "Tabela não existe"
**Solução:** Execute as migrations no novo projeto antes de importar:
```bash
# Se usando migrations locais
supabase db push
```

### Erro: "foreign key constraint"
**Solução:** O script já importa na ordem correta. Se persistir, verifique se:
- Todas as tabelas foram criadas no novo projeto
- As migrations foram executadas completamente

### Erro: "Usuário já existe em auth.users"
**Solução:** Isso é esperado! O script detecta e pula a criação, apenas log informativo.

### Importação Muito Lenta
**Solução:** Ajuste `BATCH_SIZE` no script (padrão: 100):
```javascript
const BATCH_SIZE = 500; // Aumentar para redes rápidas
```

### Rollback em Caso de Erro
O script **não faz rollback automático**. Para limpar e recomeçar:
```sql
-- No SQL Editor do Supabase, delete todos os dados:
TRUNCATE profiles, user_roles, habit_categories, habits, goals CASCADE;
```

## Verificação Pós-Importação

### 1. Conferir Contagens
```sql
-- Compare com o número de registros nos JSONs
SELECT 'profiles' as table_name, COUNT(*) as total FROM profiles
UNION ALL
SELECT 'habits', COUNT(*) FROM habits
UNION ALL
SELECT 'goals', COUNT(*) FROM goals
-- ... etc
```

### 2. Verificar Usuários Auth
```sql
-- Deve ter usuários criados
SELECT id, email, created_at
FROM auth.users
ORDER BY created_at DESC;
```

### 3. Testar Relacionamentos
```sql
-- Verificar foreign keys funcionando
SELECT
  h.name as habit_name,
  p.display_name as user_name,
  COUNT(he.id) as entries
FROM habits h
JOIN profiles p ON h.user_id = p.id
LEFT JOIN habit_entries he ON h.id = he.habit_id
GROUP BY h.name, p.display_name;
```

## Segurança

### Service Role Key
- **NUNCA** exponha no frontend
- **NUNCA** commite no git
- Use apenas em scripts server-side
- Rotacione se comprometida

### Após Importação
1. Verifique políticas RLS estão ativas
2. Teste acesso com anon key
3. Confirme usuários só veem seus dados
4. Remova Service Role Key do `.env` se não precisar mais

## Próximos Passos

1. Verifique contagens no dashboard do Supabase
2. Teste login com usuários importados
3. Verifique se dados aparecem no app
4. Configure Edge Functions (se houver)
5. Atualize variáveis de ambiente do frontend:
   ```env
   VITE_SUPABASE_URL=https://[novo-projeto].supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=[nova-anon-key]
   ```

## Suporte

Se encontrar problemas:
1. Confira o relatório JSON gerado
2. Verifique logs de erro no console
3. Revise migrations no novo projeto
4. Teste conexão manualmente com Supabase

## Limpeza

Após importação bem-sucedida:
```bash
# Opcional: Remover credenciais do .env
# (mantenha backup em gerenciador de senhas!)

# Manter arquivos JSON para backup
# Não delete data/*.json até confirmar tudo funcionando
```
