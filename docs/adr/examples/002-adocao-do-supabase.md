# ADR 002: Adoção do Supabase como Backend-as-a-Service

**Status**: ✅ Aceito e Implementado
**Data**: 2025-07-20 (estimado)
**Autor(es)**: Equipe CLTeam

## Contexto

O projeto CLTeam é um sistema de gestão de performance para jogadores de poker que requer:

1. **Banco de Dados Relacional**: Armazenamento de jogadores, stats HUD, performance calculada, aulas, finanças
2. **Autenticação**: Sistema de login seguro para coaches e administradores
3. **APIs REST**: Endpoints para CRUD de dados
4. **Real-time (desejável)**: Atualizações em tempo real de stats e rankings
5. **Segurança**: Row Level Security (RLS) para isolamento de dados entre times
6. **Desenvolvimento Rápido**: Equipe pequena (solo dev) necessita de produtividade

### Problema

Precisávamos escolher uma solução de backend que:
- Reduzisse tempo de desenvolvimento (sem criar APIs manualmente)
- Oferecesse PostgreSQL (requisito para queries complexas de stats)
- Incluísse autenticação pronta
- Fosse econômica para um projeto inicial
- Permitisse escalabilidade futura

## Decisão

**Adotamos o Supabase** como nossa plataforma de Backend-as-a-Service (BaaS).

### O que é o Supabase?

Supabase é uma alternativa open-source ao Firebase que oferece:
- **PostgreSQL Database**: Banco de dados relacional completo
- **Authentication**: Sistema de auth pronto (email/senha, OAuth, magic links)
- **Auto-generated APIs**: APIs REST e GraphQL geradas automaticamente
- **Row Level Security (RLS)**: Segurança nativa do Postgres
- **Real-time**: Subscriptions WebSocket para mudanças no DB
- **Storage**: Armazenamento de arquivos (não usado ainda)
- **Edge Functions**: Serverless functions Deno (não usado ainda)

### Stack Técnica Resultante

```
Frontend (React/Vite)
        ↓
Supabase Client (@supabase/supabase-js)
        ↓
Supabase Platform
  ├── PostgreSQL Database (AWS)
  ├── Auth Service
  ├── PostgREST (Auto APIs)
  ├── Realtime Server
  └── Storage (opcional)
```

## Justificativa

### Vantagens do Supabase

#### 1. **PostgreSQL Nativo** ✅
- **Requisito crítico**: Precisamos de queries SQL complexas para calcular performance
- **Funções SQL**: Suporte completo para functions, triggers, CTEs (Common Table Expressions)
- **Migrações SQL**: Controle total sobre o schema com migrations
- **Exemplo prático**: Nossa função `recalculate_stats_for_month()` usa CTEs complexas

```sql
-- Exemplo: CTE complexa que seria difícil em NoSQL
WITH base AS (...),
     per_category AS (...),
     weighted_performance AS (...)
INSERT INTO clteam_stats_performance ...
```

#### 2. **APIs Auto-Geradas** ⚡
- **Zero código backend**: Toda tabela vira automaticamente um endpoint REST
- **Filtros poderosos**: Suporte nativo para queries complexas via URL
- **Exemplo**:

```typescript
// Buscar performance do time no mês de outubro/2025
const { data } = await supabase
  .from('clteam_stats_performance')
  .select('*, clteam_players(name, stakes)')
  .eq('record_month', '2025-10-01')
  .order('performance_score', { ascending: false })
```

Sem Supabase, precisaríamos criar:
- Controller para cada endpoint
- Validação de parâmetros
- Lógica de joins
- Serialização JSON

#### 3. **Row Level Security (RLS)** 🔒
- **Segurança nativa**: Políticas de acesso no nível do banco
- **Isolamento multi-tenant**: Cada time vê apenas seus dados
- **Exemplo**:

```sql
-- Usuários só veem jogadores do seu time
CREATE POLICY "Users view own team players"
ON clteam_players FOR SELECT
USING (
  team_id = (SELECT team_id FROM users WHERE id = auth.uid())
);
```

- **Vantagem**: Segurança mesmo se o frontend for comprometido

#### 4. **Autenticação Pronta** 🔐
- **Login email/senha**: Implementado em 10 linhas de código
- **Gestão de sessões**: Tokens JWT automáticos
- **Recuperação de senha**: Magic links prontos
- **Exemplo**:

```typescript
// Login (tudo que precisamos escrever)
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})
```

#### 5. **Developer Experience** 🚀
- **TypeScript Types**: Geração automática de tipos a partir do schema
- **CLI poderoso**: `supabase db push`, `supabase gen types`
- **Dashboard visual**: Gerenciamento de dados, logs, queries
- **Local development**: `supabase start` roda tudo localmente em Docker

#### 6. **Custo-Benefício** 💰
- **Tier gratuito generoso**: 500 MB DB, 50 GB bandwidth, 2 GB storage
- **Pricing previsível**: Paga por uso, não por feature
- **Sem surpresas**: Tier Pro a $25/mês cobre a maioria dos projetos

### Comparação com Alternativas

#### Firebase (Google)
❌ **Firestore é NoSQL**: Queries complexas de stats seriam difíceis
❌ **Cloud Functions caras**: Cobrança por execução
❌ **Vendor lock-in**: Difícil migrar para outro DB
✅ Melhor para apps real-time simples

#### Backend Customizado (Node.js + Express + Postgres)
✅ Controle total sobre a arquitetura
❌ **Muito tempo de desenvolvimento**: Criar auth, APIs, validações
❌ **Manutenção**: Gerenciar servidor, segurança, backups
❌ **Overhead para solo dev**: Não vale a pena para MVP

#### PlanetScale (MySQL)
✅ Serverless MySQL com branching
❌ **Não é Postgres**: Sem functions complexas, triggers limitados
❌ **Sem auth nativa**: Precisaríamos de outra solução
❌ **Foco em scale**: Overkill para nosso caso de uso

#### Hasura (GraphQL)
✅ PostgreSQL + GraphQL auto-gerado
❌ **Complexidade**: GraphQL tem curva de aprendizado
❌ **Sem auth nativa**: Precisamos integrar com Auth0, Clerk, etc
❌ **Overkill**: Não precisamos de GraphQL agora

## Consequências

### Positivas ✅

1. **Velocidade de desenvolvimento**: Redução de ~70% no tempo de backend
2. **Menos código**: Foco em lógica de negócio, não em infraestrutura
3. **Segurança out-of-the-box**: RLS + Auth prontos
4. **Type safety**: TypeScript end-to-end (DB → API → Frontend)
5. **SQL puro**: Queries complexas sem limitações de ORM
6. **Migrações versionadas**: Histórico completo de mudanças no schema

### Negativas ⚠️

1. **Vendor lock-in parcial**: Usar features específicas do Supabase dificulta migração
   - **Mitigação**: Evitamos Edge Functions e Storage por enquanto
2. **Limitações do tier gratuito**: 500 MB pode ser pouco no futuro
   - **Mitigação**: Upgrade para Pro ($25/mês) quando necessário
3. **Controle reduzido**: Não gerenciamos o servidor Postgres diretamente
   - **Mitigação**: Backup manual via `pg_dump` periodicamente
4. **Performance de APIs REST**: PostgREST pode ser mais lento que endpoints customizados
   - **Mitigação**: Criar functions SQL para queries pesadas

### Decisões Técnicas Derivadas

#### 1. **Migrations SQL Puras**
- Usamos SQL puro nas migrations (não ORMs)
- Controle total sobre o schema
- Facilita migração futura se necessário

#### 2. **Functions SQL para Lógica Complexa**
- Cálculo de performance no banco (não no frontend)
- Função `recalculate_stats_for_month()` em PL/pgSQL
- Melhor performance e consistência

#### 3. **RLS para Multi-Tenancy**
- Cada time tem seus dados isolados
- Políticas RLS em todas as tabelas principais

#### 4. **Real-time Desabilitado (por enquanto)**
- Não precisamos de updates em tempo real ainda
- Economiza recursos do tier gratuito

## Implementação

### Setup Inicial

```bash
# 1. Criar projeto no Supabase Dashboard
# 2. Copiar credenciais para .env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...

# 3. Instalar cliente
npm install @supabase/supabase-js

# 4. Criar client
// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(url, key)
```

### Migrations

```bash
# Criar nova migration
supabase migration new nome_descritivo

# Aplicar migrations
supabase db push
```

### Geração de Types

```bash
# Gerar tipos TypeScript do schema
supabase gen types typescript --local > src/integrations/supabase/types.ts
```

### Exemplo de Hook

```typescript
// Hook para buscar performance dos jogadores
export function useStatsTeamOverview(month: string) {
  return useQuery({
    queryKey: ['team-overview', month],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clteam_stats_performance')
        .select(`
          *,
          clteam_players (
            id,
            name,
            stakes
          )
        `)
        .eq('record_month', month)

      if (error) throw error
      return data
    }
  })
}
```

## Riscos e Mitigações

### Risco 1: Supabase descontinua o serviço
**Probabilidade**: Baixa (projeto open-source com investimento)
**Impacto**: Alto
**Mitigação**:
- Supabase é self-hostable (PostgreSQL + PostgREST + Auth)
- Backups regulares com `pg_dump`
- SQL puro facilita migração

### Risco 2: Custo escala rapidamente
**Probabilidade**: Média (se o time crescer muito)
**Impacto**: Médio
**Mitigação**:
- Tier Pro ($25/mês) cobre até 8 GB DB
- Self-hosting possível se necessário
- Monitorar uso mensal

### Risco 3: Limitações de performance
**Probabilidade**: Baixa (queries estão rápidas)
**Impacto**: Médio
**Mitigação**:
- Índices no banco para queries frequentes
- Functions SQL para cálculos pesados
- Caching no frontend com TanStack Query

## Métricas de Sucesso

Após 3 meses de uso (2025-10):

✅ **Tempo de desenvolvimento**: Economizamos ~40 horas não criando backend
✅ **Performance**: Queries de stats < 200ms (aceitável)
✅ **Estabilidade**: 0 downtime relacionado ao Supabase
✅ **Custo**: $0 (tier gratuito suficiente por enquanto)
✅ **Developer Experience**: Equipe satisfeita com produtividade

## Alternativas Futuras

Se Supabase não atender mais:

1. **Self-hosting Supabase**: Rodar nossa própria instância
2. **Backend customizado**: Node.js + Express + Postgres (RDS/Railway)
3. **Migração para Hasura**: Se precisarmos de GraphQL

## Referências

- [Supabase Docs](https://supabase.com/docs)
- [PostgREST API](https://postgrest.org)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- Implementação: `src/integrations/supabase/client.ts`

## Notas de Revisão

- **2025-07-20**: Decisão inicial e implementação
- **2025-10-26**: Revisão após 3 meses - decisão mantida

---

**Status**: ✅ Implementado e Validado
**Próxima Revisão**: 2026-01-01 (após 6 meses de uso)
