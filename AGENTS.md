# AGENTS.md - AI Coding Agent Guidelines

> Instruções para AI coding agents trabalhando no **Life Track Growth** (Life Tracker)

---

## 📋 Quick Start

### Setup Commands
```bash
# Clonar e instalar
git clone <repo-url>
cd life_tracker
npm install

# Configurar ambiente
cp .env.example .env
# Editar .env com credenciais Supabase:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
# - VITE_LOVABLE_AI_GATEWAY_URL (para AI features)

# Desenvolvimento
npm run dev              # Inicia servidor dev (Vite)
npm run build            # Build de produção
npm run preview          # Preview do build

# Supabase (se necessário)
npx supabase status      # Verificar status do projeto
npx supabase db push     # Aplicar migrations pendentes
```

### Verificar Setup
```bash
# Testar se tudo funciona
npm run lint             # Linting OK?
npm run build            # Build OK?
./scripts/run-tests.sh   # Todos testes passando?
```

---

## 🏗️ Arquitetura

### Visão Geral
```
Frontend (React + TypeScript + Vite + TanStack Query)
    ↓
Supabase Backend (PostgreSQL + Auth + Edge Functions)
    ↓
Database (15+ tabelas com RLS) + AI Integration (Lovable AI Gateway)
```

### Stack Tecnológica
- **Frontend**: React 18, TypeScript, Vite, TailwindCSS
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **State Management**: TanStack Query (@tanstack/react-query)
- **UI**: Lucide Icons, Recharts, shadcn/ui components
- **Build**: Vite com code splitting
- **Testing**: Vitest (configurado mas não implementado ainda)
- **AI**: Lovable AI Gateway + Gemini 2.5 Flash

### Principais Serviços
- **Wheel of Life System**: 8 áreas de vida (Saúde, Carreira, Finanças, Relacionamentos, Desenvolvimento Pessoal, Lazer, Família, Espiritualidade)
- **AI Features**: Assessments, AI Coach, Analysis, Content Generation
- **Habit & Goal Tracking**: Sistema completo de hábitos e metas
- **Onboarding System**: 4 estágios (Welcome, Assessment, Setup, Complete)
- **Auth**: Supabase Auth (email/password + OAuth providers)
- **Real-time**: Subscriptions via Supabase Realtime
- **Performance**: Queries paralelas com TanStack Query (useDashboardData, useMetricsData)

---

## 📂 Estrutura do Projeto

```
life_tracker/
├── src/
│   ├── components/        # Componentes React
│   │   ├── assessment/    # AI Assessments
│   │   ├── dashboard/     # Dashboard principal
│   │   ├── goals/         # Sistema de metas
│   │   ├── habits/        # Sistema de hábitos
│   │   ├── onboarding/    # Onboarding (4 estágios)
│   │   ├── wheel/         # Wheel of Life (8 áreas)
│   │   └── ui/            # shadcn/ui components
│   │
│   ├── hooks/             # Custom React hooks
│   │   ├── useDashboardData.ts    # Query paralela do dashboard
│   │   ├── useMetricsData.ts      # Métricas consolidadas
│   │   ├── useWheelOfLife.ts      # Wheel of Life logic
│   │   ├── useOnboarding.ts       # Onboarding state
│   │   └── __tests__/             # Testes de hooks
│   │
│   ├── pages/             # Páginas (rotas)
│   │   ├── Dashboard.tsx
│   │   ├── Habits.tsx
│   │   ├── Goals.tsx
│   │   ├── Assessment.tsx
│   │   ├── AICoach.tsx
│   │   └── Settings.tsx
│   │
│   ├── utils/             # Funções utilitárias
│   │   ├── dateUtils.ts   # Timezone-aware date helpers
│   │   └── wheelCategories.ts  # 8 áreas da vida
│   │
│   └── lib/
│       ├── supabase.ts    # Supabase client
│       └── queryClient.ts # TanStack Query config
│
├── supabase/              # Supabase backend
│   ├── migrations/        # 25 migrations (RLS habilitado)
│   └── functions/         # 6 Edge Functions (AI integration)
│       ├── generate-assessment/
│       ├── analyze-habits/
│       ├── generate-insights/
│       ├── ai-coach-chat/
│       ├── generate-content/
│       └── analyze-wheel/
│
├── docs/                  # Documentação (SEMPRE CONSULTAR!)
│   ├── features/          # Mapas de features existentes
│   ├── adr/               # Architecture Decision Records
│   ├── regras-de-negocio/ # Lógica de negócio
│   └── database/          # Database schema docs
│
├── scripts/               # Scripts de automação
│   ├── run-tests.sh
│   ├── code-review.sh
│   ├── run-security-tests.sh
│   └── commit-and-push.sh
│
├── .windsurf/workflows/   # Workflows estruturados
├── .claude/               # Configuração Claude Code
├── AGENTS.md              # Este arquivo
└── README.md              # Docs principal
```

---

## 🎯 Contexto do Projeto Life Track Growth

### Propósito
Aplicação de desenvolvimento pessoal com IA, baseada na metodologia **"Roda da Vida" (Wheel of Life)**, que permite aos usuários avaliar, monitorar e melhorar 8 áreas fundamentais de suas vidas com suporte de inteligência artificial.

### Wheel of Life - 8 Áreas
```typescript
// src/utils/wheelCategories.ts
export const WHEEL_CATEGORIES = [
  { id: 'health', name: 'Saúde', icon: '💪', color: '#10b981' },
  { id: 'career', name: 'Carreira', icon: '💼', color: '#3b82f6' },
  { id: 'finance', name: 'Finanças', icon: '💰', color: '#eab308' },
  { id: 'relationships', name: 'Relacionamentos', icon: '❤️', color: '#ec4899' },
  { id: 'personal', name: 'Desenvolvimento Pessoal', icon: '📚', color: '#8b5cf6' },
  { id: 'leisure', name: 'Lazer', icon: '🎮', color: '#f97316' },
  { id: 'family', name: 'Família', icon: '👨‍👩‍👧', color: '#06b6d4' },
  { id: 'spirituality', name: 'Espiritualidade', icon: '🙏', color: '#a855f7' }
] as const;
```

### Database Schema (21+ Tabelas com prefixo `lifetracker_`)

> **IMPORTANTE**: Todas as tabelas utilizam o prefixo `lifetracker_` para evitar conflitos de nomenclatura.

#### Tabelas Principais
```sql
-- Perfil e Onboarding
lifetracker_profiles                 # Perfil do usuário (extends auth.users)
lifetracker_user_onboarding         # Progresso do onboarding
lifetracker_user_roles              # Roles dos usuários

-- Assessments e Respostas
lifetracker_assessment_history      # Histórico de assessments
lifetracker_assessment_responses    # Respostas dos assessments

-- Habits & Goals
lifetracker_habits                  # Hábitos do usuário
lifetracker_habit_entries           # Logs diários de hábitos
lifetracker_habit_categories        # Categorias de hábitos
lifetracker_habit_refinements       # Refinamentos de hábitos
lifetracker_goals                   # Metas SMART
lifetracker_goal_entries            # Progresso das metas
lifetracker_milestones              # Marcos das metas

-- AI Features
lifetracker_ai_suggestions          # Sugestões geradas por IA
lifetracker_coach_conversations     # Conversas do AI Coach
lifetracker_coach_messages          # Mensagens do coach
lifetracker_daily_insights          # Insights diários
lifetracker_growth_insights         # Insights de crescimento
lifetracker_focus_area_suggestions  # Sugestões de áreas de foco

-- Áreas da Vida
lifetracker_life_areas              # 8 áreas da Roda da Vida

-- Versioning e Logs
lifetracker_entity_versions         # Versionamento de entidades
lifetracker_change_logs             # Logs de mudanças
```

#### RLS (Row Level Security)
**TODAS as tabelas têm RLS habilitado** com políticas baseadas em `auth.uid()`:
- SELECT: `user_id = auth.uid()`
- INSERT: `user_id = auth.uid()`
- UPDATE: `user_id = auth.uid() AND id = old.id`
- DELETE: `user_id = auth.uid() AND id = old.id`

### Edge Functions (6 funções)

#### 1. generate-assessment
```typescript
// POST /functions/v1/generate-assessment
// Gera assessment inicial com IA baseado em respostas do usuário
Input: { userId, answers: { category: string, responses: string[] }[] }
Output: { assessment: { category, score, insights, recommendations } }
```

#### 2. analyze-habits
```typescript
// POST /functions/v1/analyze-habits
// Analisa padrões de hábitos e sugere melhorias
Input: { userId, habitIds: string[], period: '7d' | '30d' }
Output: { analysis: { patterns, suggestions, streaks } }
```

#### 3. generate-insights
```typescript
// POST /functions/v1/generate-insights
// Gera insights sobre progresso do usuário
Input: { userId, categories?: string[] }
Output: { insights: { category, type, message, priority }[] }
```

#### 4. ai-coach-chat
```typescript
// POST /functions/v1/ai-coach-chat
// Chat com AI Coach (contexto-aware)
Input: { userId, message: string, context?: object }
Output: { response: string, suggestions?: string[] }
```

#### 5. generate-content
```typescript
// POST /functions/v1/generate-content
// Gera artigos e dicas personalizadas
Input: { userId, category: string, contentType: 'article' | 'tip' | 'exercise' }
Output: { content: { title, body, category } }
```

#### 6. analyze-wheel
```typescript
// POST /functions/v1/analyze-wheel
// Analisa Wheel of Life e identifica áreas críticas
Input: { userId, assessmentId: string }
Output: { analysis: { balanceScore, criticalAreas, strengths, recommendations } }
```

### Onboarding System (4 estágios)

```typescript
type OnboardingStage = 'welcome' | 'assessment' | 'setup' | 'complete';

// Fluxo:
// 1. Welcome: Introdução ao app e Wheel of Life
// 2. Assessment: AI Assessment inicial (8 áreas)
// 3. Setup: Criar primeiros hábitos e metas
// 4. Complete: Dashboard desbloqueado
```

### Hooks Importantes

#### useDashboardData (Performance Critical)
```typescript
// Queries paralelas com TanStack Query
export function useDashboardData(userId: string) {
  // Fetch paralelo de:
  // - Wheel scores recentes
  // - Hábitos ativos
  // - Metas em progresso
  // - Insights recentes

  return useQueries({
    queries: [
      { queryKey: ['wheel-scores', userId], queryFn: fetchWheelScores },
      { queryKey: ['habits', userId], queryFn: fetchHabits },
      { queryKey: ['goals', userId], queryFn: fetchGoals },
      { queryKey: ['insights', userId], queryFn: fetchInsights }
    ]
  });
}
```

#### useMetricsData
```typescript
// Métricas consolidadas com cache
export function useMetricsData(userId: string, period: '7d' | '30d' | '90d') {
  // Retorna:
  // - Completion rate de hábitos
  // - Progress rate de metas
  // - Wheel balance score
  // - Activity streak

  return useQuery({
    queryKey: ['metrics', userId, period],
    queryFn: fetchMetrics,
    staleTime: 5 * 60 * 1000 // Cache 5min
  });
}
```

### AI Integration (Lovable AI Gateway)

```typescript
// Configuração
const AI_GATEWAY_URL = import.meta.env.VITE_LOVABLE_AI_GATEWAY_URL;

// Modelo: Gemini 2.5 Flash
// Features:
// - Context-aware responses
// - Personalized insights
// - Brazilian Portuguese (pt-BR)
// - Timezone: America/Sao_Paulo

// Exemplo de chamada:
const response = await fetch(`${AI_GATEWAY_URL}/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: userMessage,
    context: {
      userId,
      wheelScores,
      recentHabits,
      currentGoals
    }
  })
});
```

### Timezone & Data (CRÍTICO)

```typescript
// SEMPRE usar timezone local do Brasil
const TIMEZONE = 'America/Sao_Paulo'; // UTC-3
const currentYear = 2025;
const currentMonth = 10; // Outubro

// ❌ NUNCA fazer isso
const query = `WHERE created_at >= '2024-10-01'`; // Ano errado!

// ✅ SEMPRE usar data dinâmica
const today = new Date();
const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

const { data } = await supabase
  .from('habit_logs')
  .select('*')
  .gte('created_at', startOfMonth.toISOString());
```

### Performance Optimizations

#### 1. TanStack Query
- Queries paralelas no dashboard (useQueries)
- Cache inteligente (staleTime: 5min)
- Optimistic updates em mutations
- Background refetch

#### 2. Code Splitting
```typescript
// Vite config - chunks otimizados
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor': ['react', 'react-dom', 'react-router-dom'],
        'ui': ['lucide-react', 'recharts'],
        'supabase': ['@supabase/supabase-js'],
        'query': ['@tanstack/react-query']
      }
    }
  }
}
```

#### 3. Lazy Loading
```typescript
// Componentes pesados
const AICoach = lazy(() => import('./pages/AICoach'));
const Assessment = lazy(() => import('./pages/Assessment'));
```

### Supabase Project Info
- **Project ID**: fjddlffnlbrhgogkyplq
- **Region**: South America (São Paulo)
- **Database**: PostgreSQL 15
- **Auth**: Habilitado (email/password + OAuth)
- **Realtime**: Habilitado
- **Storage**: Configurado (avatars, attachments)

---

## 🎨 Coding Style

### TypeScript
- **Strict mode**: Habilitado
- **Tipos explícitos**: Preferir sobre inferência quando melhora legibilidade
- **Interfaces over types**: Para objetos e shapes
- **Null safety**: Sempre tratar undefined/null

```typescript
// ✅ BOM
interface Entity {
  id: string;
  name: string;
  value: number | null;
}

const getValue = (entity: Entity): number => {
  return entity.value ?? 0;
};

// ❌ RUIM
const getValue = (entity: any) => {
  return entity.value;
};
```

### React Components
- **Functional components**: Sempre (sem classes)
- **Hooks**: useState, useEffect, custom hooks
- **Props**: Tipadas com interface
- **Export**: Named exports preferidos

```typescript
// ✅ BOM
interface CardProps {
  value: number;
  period: '7d' | '14d' | '30d' | '180d';
}

export function Card({ value, period }: CardProps) {
  const [isLoading, setIsLoading] = useState(false);
  // ...
  return <div>...</div>;
}

// ❌ RUIM
export default ({ value, period }) => {
  return <div>...</div>;
};
```

### Naming
- **Componentes**: PascalCase (`MetricCard.tsx`)
- **Hooks**: camelCase com prefixo `use` (`useMetric.ts`)
- **Funções**: camelCase (`calculateValue`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_VALUE`)
- **Variáveis**: camelCase (`totalValue`)

### Comentários
- **Idioma**: Português
- **JSDoc**: Para funções/hooks exportados
- **Inline**: Para lógica complexa (explicar "por que", não "o que")

```typescript
/**
 * Calcula a métrica para um período específico
 *
 * @param entityId - ID da entidade
 * @param days - Período em dias (7, 14, 30, 180)
 * @returns Valor total ou 0 se sem dados
 */
export function useMetric(entityId: string, days: number) {
  // Usar data atual do sistema (timezone crítico para queries corretas)
  const today = new Date();
  // ...
}
```

---

## 🧪 Testing Workflow

### Estratégia de Testes
- **Preferência**: Testes integrados/E2E sobre unitários
- **Coverage**: Mínimo 70% para lógica crítica
- **TDD**: Para hooks, cálculos, validações

### Estrutura de Testes
```typescript
// src/hooks/__tests__/useMetric.test.ts
import { renderHook } from '@testing-library/react-hooks';
import { useMetric } from '../useMetric';

describe('useMetric', () => {
  it('deve retornar 0 quando sem dados', () => {
    const { result } = renderHook(() => useMetric('entity-id', 7));
    expect(result.current.value).toBe(0);
  });

  it('deve calcular valor corretamente', () => {
    // ...
  });
});
```

### Comandos de Teste
```bash
# Testes completos (TypeScript, ESLint, Build, Secrets)
./scripts/run-tests.sh

# Code review automatizado
./scripts/code-review.sh

# Security scan
./scripts/run-security-tests.sh
```

---

## 🔒 Security Guidelines

### CRÍTICO - SEMPRE VERIFICAR

#### 1. Secrets
```typescript
// ❌ NUNCA fazer isso
const API_KEY = "sk-1234567890";
const PASSWORD = "senha123";

// ✅ SEMPRE usar variáveis de ambiente
const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;
```

#### 2. SQL Injection
```typescript
// ❌ NUNCA fazer isso
const query = `SELECT * FROM users WHERE id = ${userId}`;

// ✅ SEMPRE usar parameterized queries
const { data } = await apiClient
  .from('users')
  .select('*')
  .eq('id', userId);
```

#### 3. XSS
```typescript
// ❌ NUNCA fazer isso
<div dangerouslySetInnerHTML={{__html: userInput}} />

// ✅ React escapa automaticamente
<div>{userInput}</div>
```

#### 4. RLS (Row Level Security)
- **Sempre habilitado** no backend (se aplicável)
- Queries filtradas por `user_id` automaticamente
- Testar com diferentes usuários

### Security Scan Automático
```bash
# OBRIGATÓRIO antes de commit
./scripts/run-security-tests.sh

# Verifica:
# - Secrets hardcoded
# - .env não commitado
# - Vulnerabilidades em deps
# - SQL Injection
# - XSS
# - ESLint + TypeScript
```

---

## 📝 Git Workflow

### Branch Strategy
```bash
# Main branch
main                    # Sempre funcional, sempre testada

# Feature branches (efêmeras)
feat/add-new-feature   # Nova funcionalidade
fix/bug-description    # Correção de bug
refactor/cleanup-code  # Refatoração
docs/update-features   # Documentação
```

### Commit Messages (Conventional Commits)
```bash
# Formato: tipo: descrição

# Tipos
feat: adicionar componente de métricas
fix: corrigir cálculo de valor
refactor: otimizar hook useMetric
docs: atualizar mapa de features
test: adicionar testes para useMetric
style: ajustar responsividade do dashboard
migration: adicionar índice em created_at
```

### Commits Incrementais (NÃO fazer 1 commit gigante!)
```bash
# ✅ BOM - 8 commits pequenos
git commit -m "test: adicionar testes para useMetric - RED"
git commit -m "feat: implementar useMetric hook - GREEN"
git commit -m "refactor: otimizar query do useMetric"
git commit -m "feat: criar componente MetricCard"
git commit -m "feat: conectar MetricCard com useMetric"
git commit -m "style: estilizar MetricCard"
git commit -m "style: tornar MetricCard responsivo"
git commit -m "docs: atualizar docs/features/metrics.md"

# ❌ RUIM - 1 commit gigante
git commit -m "feat: adicionar tudo de uma vez"
```

---

## 🔄 Pull Request Guidelines

### Antes de Criar PR

#### 1. Testes DEVEM passar
```bash
./scripts/run-tests.sh              # ✅ Todos passando?
./scripts/code-review.sh            # ✅ Aprovado?
./scripts/run-security-tests.sh     # ✅ Sem vulnerabilidades?
```

#### 2. Documentação DEVE estar atualizada
- [ ] `docs/features/` atualizado se feature nova/modificada
- [ ] ADR criado se decisão arquitetural importante
- [ ] README.md atualizado se necessário
- [ ] Comentários em código para lógica complexa

#### 3. Checklist Pré-PR
- [ ] Build passa sem erros (`npm run build`)
- [ ] Sem console.log esquecido
- [ ] Sem TODOs críticos não resolvidos
- [ ] Sem secrets hardcoded
- [ ] TypeScript strict sem erros
- [ ] ESLint sem erros
- [ ] Testado manualmente no navegador

### Formato do PR

```markdown
## Summary
- Adicionar feature de métricas
- Hook `useMetric` para buscar dados
- Componente `MetricCard` com Tailwind

## Test Plan
- [ ] Build passa sem erros
- [ ] Testes unitários passam (se aplicável)
- [ ] Security scan passa
- [ ] Testado manualmente com dados reais
- [ ] Testado em mobile/tablet/desktop
- [ ] Sem erros no console

## Screenshots
[Cole screenshots se relevante]

## Breaking Changes
Nenhuma / [Descrever se houver]

## Related Issues
Closes #123

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

---

## 🎯 Key Patterns

### Estado e Dados (TanStack Query)
```typescript
// Padrão: TanStack Query para server state

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Hook customizado para buscar dados
export function useHabits(userId: string) {
  return useQuery({
    queryKey: ['habits', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lifetracker_habits')
        .select('id, name, category, frequency, streak')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // Cache 5min
    gcTime: 10 * 60 * 1000 // GC após 10min
  });
}

// Mutation para criar/atualizar
export function useCreateHabitLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ habitId, userId, completed }: {
      habitId: string;
      userId: string;
      completed: boolean;
    }) => {
      const { data, error } = await supabase
        .from('lifetracker_habit_entries')
        .insert([{
          habit_id: habitId,
          user_id: userId,
          completed,
          logged_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['habit-logs', data.user_id] });
      queryClient.invalidateQueries({ queryKey: ['metrics', data.user_id] });
    }
  });
}

// Real-time subscription (opcional - usar com cuidado)
export function useHabitsRealtime(userId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('habits-changes')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lifetracker_habits',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          // Invalidar query para refetch
          queryClient.invalidateQueries({ queryKey: ['habits', userId] });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId, queryClient]);
}
```

### API Calls (Supabase)
```typescript
// Padrão: Sempre usar supabase client (não fetch direto)

import { supabase } from '@/lib/supabase';

// SELECT com filtro (exemplo: buscar hábitos)
const { data, error } = await supabase
  .from('lifetracker_habits')
  .select('id, name, category, frequency, streak')
  .eq('user_id', userId) // RLS já filtra, mas explícito é melhor
  .gte('created_at', startDate.toISOString())
  .order('created_at', { ascending: false })
  .limit(10);

// INSERT (exemplo: criar habit log)
const { data, error } = await supabase
  .from('lifetracker_habit_entries')
  .insert([{
    habit_id: habitId,
    user_id: userId, // Obrigatório para RLS
    completed: true,
    logged_at: new Date().toISOString()
  }])
  .select();

// UPDATE (exemplo: atualizar assessment response)
const { data, error } = await supabase
  .from('lifetracker_assessment_responses')
  .update({
    score: newScore,
    notes: userNotes,
    updated_at: new Date().toISOString()
  })
  .eq('id', responseId)
  .eq('user_id', userId); // RLS check

// JOIN com tabelas relacionadas
const { data, error } = await supabase
  .from('lifetracker_goals')
  .select(`
    id,
    title,
    category:lifetracker_life_areas(id, name, icon),
    entries:lifetracker_goal_entries(value, date)
  `)
  .eq('user_id', userId)
  .order('created_at', { ascending: false });

// Tratamento de erro
if (error) {
  console.error('Erro ao buscar dados:', error);
  // Toast ou feedback para usuário
  throw new Error(`Database error: ${error.message}`);
}
```

### Form Handling
```typescript
// Padrão: React state + validação manual

function EditEntityForm({ entityId }: { entityId: string }) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação
    if (name.trim().length < 3) {
      setError('Nome deve ter no mínimo 3 caracteres');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    // Submit
    const { error: submitError } = await apiClient
      .from('entities')
      .update({ name: name.trim() })
      .eq('id', entityId);

    if (submitError) {
      setError('Erro ao salvar: ' + submitError.message);
      setIsSubmitting(false);
      return;
    }

    // Sucesso
    setIsSubmitting(false);
    // Redirect ou feedback
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={isSubmitting}
      />
      {error && <p className="text-red-500">{error}</p>}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  );
}
```

### Error Handling
```typescript
// Padrão: Try-catch + user feedback

try {
  const { data, error } = await apiClient
    .from('app_table_name')
    .select('*')
    .eq('entity_id', entityId);

  if (error) throw error;

  return data;
} catch (error) {
  console.error('Erro ao buscar dados:', error);

  // User feedback
  toast.error('Não foi possível carregar os dados. Tente novamente.');

  return null;
}
```

---

## 📐 Regras de Negócio Específicas

### Wheel of Life System
1. **Score Range**: Sempre 0-10 (inteiro)
2. **8 Áreas Fixas**: Não permitir criar novas categorias
3. **Balance Score**: Média dos 8 scores (arredondado 1 decimal)
4. **Assessment Frequency**: Mínimo 7 dias entre assessments completos

### Habits System
1. **Frequency Options**: daily, weekly, custom
2. **Streak Calculation**: Dias consecutivos com log completed=true
3. **Miss Tolerance**: 0 dias (streak quebra imediatamente)
4. **Category Link**: Todo habit DEVE estar vinculado a uma das 8 áreas

### Goals System
1. **SMART Format**: Specific, Measurable, Achievable, Relevant, Time-bound
2. **Progress Tracking**: 0-100% (calculado automaticamente)
3. **Status**: not_started, in_progress, completed, abandoned
4. **Deadline Required**: Todo goal DEVE ter uma data limite
5. **Category Link**: Todo goal DEVE estar vinculado a uma das 8 áreas

### AI Features
1. **Rate Limiting**: Máximo 50 requests/hour por usuário
2. **Context Window**: Últimos 30 dias de dados do usuário
3. **Language**: Sempre Portuguese (pt-BR)
4. **Personalization**: Usar nome do usuário em respostas
5. **Safety**: Filtrar conteúdo sensível/inapropriado

### Onboarding Flow
1. **Sequential**: Não pode pular estágios
2. **Assessment Required**: Não pode completar sem assessment inicial
3. **Minimum Setup**: Pelo menos 1 habit OU 1 goal para completar
4. **Skip Prevention**: Não permitir "pular onboarding"

### Data Retention
1. **Habit Logs**: Manter indefinidamente
2. **Goal Progress**: Manter indefinidamente
3. **Wheel Scores**: Manter indefinidamente
4. **AI Chat History**: Últimos 90 dias
5. **Activity Logs**: Últimos 180 dias

### Performance Targets
1. **Dashboard Load**: < 2 segundos (first paint)
2. **Query Response**: < 500ms para queries simples
3. **AI Response**: < 5 segundos para AI features
4. **Bundle Size**: < 500KB por chunk principal

---

## ⚠️ Common Pitfalls (Supabase)

### RLS (Row Level Security)
```typescript
// ❌ ERRO: Esquecer user_id no INSERT
const { data, error } = await supabase
  .from('lifetracker_habits')
  .insert([{ name: 'Exercise' }]); // FALTA user_id!

// ✅ CORRETO: Sempre incluir user_id
const { data, error } = await supabase
  .from('lifetracker_habits')
  .insert([{
    name: 'Exercise',
    user_id: userId // RLS vai verificar se é o usuário autenticado
  }]);
```

### Timezone Issues
```typescript
// ❌ ERRO: Usar data local sem timezone
const today = '2025-10-29'; // String sem timezone!

// ✅ CORRETO: Sempre usar ISO string
const today = new Date().toISOString(); // "2025-10-29T10:30:00.000Z"
```

### N+1 Queries
```typescript
// ❌ ERRO: Loop com queries
for (const habit of habits) {
  const logs = await supabase
    .from('lifetracker_habit_entries')
    .select('*')
    .eq('habit_id', habit.id);
}

// ✅ CORRETO: Single query com join
const { data } = await supabase
  .from('lifetracker_habits')
  .select(`
    id,
    name,
    entries:lifetracker_habit_entries(*)
  `)
  .eq('user_id', userId);
```

### Real-time Overhead
```typescript
// ❌ ERRO: Subscription desnecessária (dados mudam pouco)
const channel = supabase
  .channel('assessment-responses')
  .on('postgres_changes', { table: 'lifetracker_assessment_responses' }, handler)
  .subscribe();

// ✅ CORRETO: Usar TanStack Query com refetch interval
const { data } = useQuery({
  queryKey: ['assessment-responses', userId],
  queryFn: fetchAssessmentResponses,
  refetchInterval: 5 * 60 * 1000 // Refetch a cada 5min se necessário
});
```

### Error Handling
```typescript
// ❌ ERRO: Não tratar erro
const { data } = await supabase.from('lifetracker_habits').select('*');

// ✅ CORRETO: Sempre verificar error
const { data, error } = await supabase.from('lifetracker_habits').select('*');
if (error) {
  console.error('Database error:', error);
  throw new Error(`Failed to fetch habits: ${error.message}`);
}
```

### Select Specific Columns
```typescript
// ❌ ERRO: SELECT * (traz colunas desnecessárias)
const { data } = await supabase
  .from('lifetracker_habits')
  .select('*');

// ✅ CORRETO: Selecionar apenas colunas necessárias
const { data } = await supabase
  .from('lifetracker_habits')
  .select('id, name, category, streak');
```

---

## 🚫 DO NOT

### ❌ Configuração e Ambiente
- **Modificar .env sem instruções explícitas**
  - .env contém secrets e configurações críticas
  - Sempre pedir confirmação antes de modificar

- **Commitar .env**
  - NUNCA commitar .env (já está no .gitignore)
  - Usar .env.example para template

- **Hardcode secrets**
  - NUNCA colocar API keys, passwords, tokens no código
  - Sempre usar `import.meta.env.VITE_*`

### ❌ Código
- **Pular testes em features novas**
  - Toda lógica de negócio DEVE ter testes
  - Mínimo: testes para hooks customizados

- **Fazer breaking changes sem discussão**
  - Mudanças que quebram API existente precisam aprovação
  - Criar ADR para mudanças arquiteturais

- **Usar `any` no TypeScript**
  - Sempre tipar explicitamente
  - Se tipo complexo, criar interface

- **Usar `var`**
  - Sempre usar `const` ou `let`

- **Concatenar SQL strings**
  - Sempre usar métodos parametrizados do API client

### ❌ Git
- **Commit gigante**
  - Fazer commits incrementais (8+ por feature)
  - Histórico git claro é crucial

- **Merge sem testes**
  - NUNCA mergear código não testado
  - NUNCA pular security scan

- **Force push na main**
  - NUNCA fazer `git push --force` na main

### ❌ Performance
- **Importações estáticas de libs pesadas**
  ```typescript
  // ❌ RUIM
  import jsPDF from 'jspdf';

  // ✅ BOM
  const { default: jsPDF } = await import('jspdf');
  ```

- **SELECT * em queries**
  ```typescript
  // ❌ RUIM
  .select('*')

  // ✅ BOM
  .select('id, name, value')
  ```

- **N+1 queries**
  ```typescript
  // ❌ RUIM - Loop com query
  for (const entity of entities) {
    const data = await fetchData(entity.id);
  }

  // ✅ BOM - Single query com join
  const { data } = await apiClient
    .from('entities')
    .select('*, related_data(*)')
    .in('id', entityIds);
  ```

---

## 🔄 Workflow Completo (TDD + Small Diffs)

### Exemplo: Adicionar Nova Feature

```bash
# 1. Criar branch
git checkout main
git pull origin main
./scripts/create-feature-branch.sh "add-new-feature"

# 2. TDD - RED (testes primeiro)
# Criar: src/hooks/__tests__/useFeature.test.ts
git add src/hooks/__tests__/useFeature.test.ts
git commit -m "test: adicionar testes para useFeature - RED"

# 3. TDD - GREEN (implementação mínima)
# Criar: src/hooks/useFeature.ts
git add src/hooks/useFeature.ts
git commit -m "feat: implementar useFeature hook - GREEN"

# 4. TDD - REFACTOR (otimizar)
# Editar: src/hooks/useFeature.ts
git add src/hooks/useFeature.ts
git commit -m "refactor: otimizar query do useFeature"

# 5. Componente básico
# Criar: src/components/FeatureCard.tsx
git add src/components/FeatureCard.tsx
git commit -m "feat: criar componente FeatureCard (estrutura básica)"

# 6. Conectar hook
# Editar: src/components/FeatureCard.tsx
git add src/components/FeatureCard.tsx
git commit -m "feat: conectar FeatureCard com useFeature"

# 7. Estilos
# Editar: src/components/FeatureCard.tsx
git add src/components/FeatureCard.tsx
git commit -m "style: estilizar FeatureCard com Tailwind"

# 8. Responsividade
# Editar: src/components/FeatureCard.tsx
git add src/components/FeatureCard.tsx
git commit -m "style: tornar FeatureCard responsivo"

# 9. Documentação
# Editar: docs/features/feature.md
git add docs/features/feature.md
git commit -m "docs: atualizar mapa de feature com novo componente"

# 10. Code Review
./scripts/code-review.sh

# 11. Testes
./scripts/run-tests.sh

# 12. Security Scan
./scripts/run-security-tests.sh

# 13. Push
git push -u origin feat/add-new-feature

# 14. Testar manualmente
npm run dev
# Abrir navegador e testar tudo

# 15. Merge (quando 100% testado e aprovado)
git checkout main
git merge feat/add-new-feature
git push origin main
git branch -d feat/add-new-feature

# 16. Template Sync (se houver melhorias genéricas)
./scripts/sync-to-template.sh
# Selecionar melhorias genéricas para sincronizar com template
```

---

## 📊 Performance Checklist

- [ ] Lazy loading para libs >100KB (jspdf, html2canvas, etc)
- [ ] Memoization quando apropriado (useMemo, useCallback)
- [ ] Queries otimizadas (.select específico, .limit, índices)
- [ ] Code splitting configurado (vendor, ui, libs chunks)
- [ ] Bundle size monitorado (<500KB por chunk)
- [ ] Sem N+1 queries
- [ ] Images otimizadas (webp, lazy loading)

### Padrão: Adaptive Parser para APIs de Terceiros

**Quando usar**: Integrações com APIs mal documentadas ou instáveis (WhatsApp, SMS, payment gateways)

**Problema**: Documentação de APIs muitas vezes não corresponde ao formato real dos payloads

**Como fazer**:
```typescript
// ✅ Padrão: Parser Universal com Descoberta Empírica
function parseUniversalMessage(message: UnknownMessage) {
  // 1. Priorizar formato REAL (descoberto com testes)
  if (message.content?.selectedButtonID) { // Formato real UAZAPI
    return parseRealFormat(message);
  }
  
  // 2. Tentar formato documentado (fallback)
  if (message.content?.ButtonsResponseMessage) { // Docs teóricas
    return parseDocumentedFormat(message);
  }
  
  // 3. Logar desconhecido para aprendizado contínuo
  logUnknownFormat(message);
  return null;
}
```

**Benefícios**:
- ✅ Funciona mesmo com documentação incorreta
- ✅ Aprende formatos reais automaticamente
- ✅ Reutiliza lógica existente para novos tipos

**Exemplo Real**: UAZAPI WhatsApp buttons - docs diziam `selectedButtonId` mas real é `selectedButtonID` (com 'D' maiúsculo)

---

## 🎯 Timezone & Data

### CRÍTICO: Sempre usar timezone correto

```typescript
// ❌ NUNCA hardcode data/mês/ano
const query = `WHERE created_at = '2024-10-01'`;

// ✅ SEMPRE usar data dinâmica
const today = new Date();
const currentDate = today.toISOString().slice(0, 10); // "2025-10-28"

// ✅ Para queries
const { data } = await apiClient
  .from('app_table_name')
  .select('*')
  .gte('created_at', currentDate);

// ✅ Timezone explícito (se necessário)
const localDate = new Date().toLocaleString('pt-BR', {
  timeZone: 'America/Sao_Paulo'
});
```

---

## 📚 Documentação Obrigatória

### Antes de Planejar Qualquer Feature
```bash
# 1. SEMPRE verificar docs/ primeiro
ls -la docs/features/        # Features similares?
cat docs/features/feature.md # Código reutilizável?

# 2. Consultar ADRs
ls -la docs/adr/             # Decisões já tomadas?

# 3. Regras de negócio
cat docs/regras-de-negocio/regra-especifica.md
```

### Após Implementar Feature
```bash
# Atualizar documentação apropriada

# Se feature nova/modificada
docs/features/<feature>.md

# Se decisão arquitetural
docs/adr/XXX-titulo-decisao.md

# Se mudança em schema
docs/[backend]/schemas.md

# README.md (se necessário)
README.md
```

---

## 🤖 AI Agent Tips

### Context Gathering
1. **Sempre ler docs/ antes de implementar**
2. **Consultar CLAUDE.md para contexto do projeto**
3. **Ver código similar existente antes de criar novo**
4. **Usar workflows em .windsurf/workflows/ para tarefas complexas**

### Code Generation
1. **Seguir padrões existentes no código**
2. **Gerar testes junto com código (TDD)**
3. **Commits pequenos e frequentes (não batch gigante)**
4. **Documentar decisões não-óbvias**

### Quality Assurance
1. **Executar ./scripts/code-review.sh antes de sugerir commit**
2. **Executar ./scripts/run-security-tests.sh sempre**
3. **Testar código gerado (npm run dev)**
4. **Verificar TypeScript strict passa**

### Communication
1. **Explicar decisões técnicas**
2. **Avisar sobre trade-offs**
3. **Sugerir melhorias de performance/segurança**
4. **Pedir clarificação quando ambíguo**

---

## 🎉 Success Criteria

### Uma feature está PRONTA quando:
- ✅ Código implementado seguindo padrões
- ✅ Testes escritos e passando (TDD aplicado)
- ✅ Code review aprovado
- ✅ Security scan passou sem issues críticos
- ✅ Documentação atualizada
- ✅ Testado manualmente no navegador
- ✅ Commits pequenos e descritivos
- ✅ Performance aceitável (bundle size OK)
- ✅ TypeScript strict sem erros
- ✅ ESLint sem erros

### Uma feature NÃO está pronta quando:
- ❌ Secrets hardcoded
- ❌ Testes falhando
- ❌ Security scan com issues críticos
- ❌ TypeScript errors
- ❌ ESLint errors
- ❌ Documentação não atualizada
- ❌ Não testado manualmente
- ❌ Performance ruim (bundle >500KB)

---

**Última atualização**: 2025-10-29
**Versão**: 1.1 (Life Track Growth)
**Autor**: Project Template + Claude Code
**Projeto**: Life Track Growth (Supabase ID: fjddlffnlbrhgogkyplq)

---

## 📖 Recursos Adicionais

- `.claude/CLAUDE.md` - Contexto completo do projeto (para humanos)
- `.windsurf/workflows/add-feature.md` - Workflow completo de features
- `.windsurf/workflows/ultra-think.md` - Análise profunda de decisões
- `docs/` - Toda documentação técnica
- `README.md` - Overview do projeto

**Dúvidas?** Consulte `.claude/CLAUDE.md` ou peça clarificação ao desenvolvedor.
