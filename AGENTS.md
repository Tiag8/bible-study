# AGENTS.md - AI Coding Agent Guidelines

> Instruções para AI coding agents trabalhando no [Nome do Projeto]

---

## 📋 Quick Start

### Setup Commands
```bash
# Clonar e instalar
git clone <repo-url>
cd [nome-do-projeto]
npm install

# Configurar ambiente
cp .env.example .env
# Editar .env com suas credenciais

# Desenvolvimento
npm run dev              # Inicia servidor dev
npm run build            # Build de produção
npm run preview          # Preview do build
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
Frontend (React + TypeScript + Vite)
    ↓
[Backend Provider / API / Database]
    ↓
Database (Tables + Auth + Real-time)
```

### Stack Tecnológica
- **Frontend**: React 18, TypeScript, Vite, TailwindCSS
- **Backend**: [Supabase / Firebase / Custom API]
- **UI**: Lucide Icons, Recharts (ou outras libs de UI)
- **Build**: Vite com code splitting
- **Testing**: Vitest / Jest (quando implementado)

### Principais Serviços
- **[Feature System]**: [Descrição da funcionalidade principal]
- **Auth**: [Tipo de autenticação]
- **Real-time**: [Se aplicável - updates automáticos]

---

## 📂 Estrutura do Projeto

```
[nome-do-projeto]/
├── src/
│   ├── components/        # Componentes React
│   │   ├── [feature]/    # Componentes específicos de feature
│   │   └── ui/           # Componentes base reutilizáveis
│   ├── hooks/            # Custom React hooks
│   │   ├── use[Feature].ts
│   │   └── __tests__/    # Testes de hooks
│   ├── pages/            # Páginas (rotas)
│   ├── utils/            # Funções utilitárias
│   └── lib/
│       └── [api-client].ts   # Cliente da API
│
├── [backend-folder]/     # Se aplicável (migrations, functions, etc)
│   └── migrations/       # Migrations do banco
│
├── docs/                 # Documentação (SEMPRE CONSULTAR!)
│   ├── features/         # Mapas de features existentes
│   ├── adr/              # Architecture Decision Records
│   ├── regras-de-negocio/ # Lógica de negócio
│   └── [backend]/        # Schemas e docs do DB
│
├── scripts/              # Scripts de automação
│   ├── run-tests.sh
│   ├── code-review.sh
│   ├── run-security-tests.sh
│   └── commit-and-push.sh
│
├── .windsurf/workflows/  # Workflows estruturados
├── .claude/             # Configuração Claude Code
├── AGENTS.md            # Este arquivo
└── README.md            # Docs principal
```

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

### Estado e Dados
```typescript
// Padrão: React hooks + API client

// Hook customizado para buscar dados
export function useData(entityId: string) {
  const [data, setData] = useState<Data | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const response = await apiClient
        .from('app_table_name')
        .select('*')
        .eq('entity_id', entityId)
        .single();

      setData(response.data);
      setIsLoading(false);
    };

    fetchData();

    // Real-time subscription (se aplicável)
    const subscription = apiClient
      .channel('data-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'app_table_name' },
        (payload) => setData(payload.new)
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [entityId]);

  return { data, isLoading };
}
```

### API Calls
```typescript
// Padrão: Sempre usar client da API (não fetch direto)

import { apiClient } from '@/lib/api-client';

// SELECT com filtro
const { data, error } = await apiClient
  .from('app_table_name')
  .select('value, metric, status')
  .eq('entity_id', entityId)
  .gte('created_at', '2025-10-01')
  .order('created_at', { ascending: false })
  .limit(10);

// INSERT
const { data, error } = await apiClient
  .from('entities')
  .insert([{ name: 'Entity Name' }])
  .select();

// UPDATE
const { data, error } = await apiClient
  .from('entities')
  .update({ value: 1000 })
  .eq('id', entityId);

// Tratamento de erro
if (error) {
  console.error('Erro ao buscar dados:', error);
  return null;
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

**Última atualização**: 2025-10-28
**Versão**: 1.0
**Autor**: Project Template + Claude Code

---

## 📖 Recursos Adicionais

- `.claude/CLAUDE.md` - Contexto completo do projeto (para humanos)
- `.windsurf/workflows/add-feature.md` - Workflow completo de features
- `.windsurf/workflows/ultra-think.md` - Análise profunda de decisões
- `docs/` - Toda documentação técnica
- `README.md` - Overview do projeto

**Dúvidas?** Consulte `.claude/CLAUDE.md` ou peça clarificação ao desenvolvedor.
