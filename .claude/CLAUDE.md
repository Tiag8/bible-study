# Claude Code - Configuração do Projeto

> [Adicione uma breve descrição do projeto aqui]

---

## 📚 ESTRUTURA DE DOCUMENTAÇÃO

Este arquivo contém instruções **específicas deste projeto**. Para regras **globais**, consulte:
- **`/Users/tiago/.codeium/windsurf/memories/global_rules.md`**: Regras universais

**Hierarquia**: Regras deste arquivo têm prioridade para este projeto.

---

## 🤖 USO DE AGENTES (Claude Code)

**REGRA CRÍTICA**: SEMPRE avaliar possibilidade de usar o **máximo de agentes possível** em paralelo.

### Quando Usar Múltiplos Agentes
- Tarefas independentes executáveis simultaneamente
- Exploração de código + análise de dependências + verificação de configurações
- Personalização de múltiplos arquivos
- Testes em diferentes módulos
- Análise de diferentes aspectos do projeto

### Benefícios
- ⚡ Redução drástica do tempo de execução
- 🎯 Melhor uso de recursos
- 🚀 Maior throughput de tarefas

**Nota**: Esta regra aplica-se ao **Claude Code** (suporta multi-agentes). O Windsurf não tem suporte a múltiplos agentes.

---

## ⏰ CONTEXTO TEMPORAL (SEMPRE LER PRIMEIRO!)

**CRÍTICO**: Sempre usar timezone local do Brasil e data/hora atual do sistema.

- **Timezone**: America/Sao_Paulo (UTC-3)
- **Verificar data**: `TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M:%S %Z'`

### Regras:
1. **NUNCA hardcode anos/meses** - Sempre `new Date()`
2. **Queries**: Datas dinâmicas (`WHERE data >= CURRENT_DATE`)
3. **Logs**: Sempre incluir timestamp com timezone

### Erros Comuns:
- ❌ `WHERE data = '2024-10-01'` (hardcoded)
- ✅ `WHERE data >= CURRENT_DATE` (dinâmico)

---

## 🛠️ STACK CORE

> **IMPORTANTE**: Atualizar esta seção com a stack específica do projeto

### Frontend
- **Framework**: [React/Vue/Angular/etc]
- **Language**: TypeScript
- **Build Tool**: [Vite/Webpack/etc]
- **Styling**: [TailwindCSS/CSS Modules/etc]
- **UI**: [shadcn/ui/Material-UI/etc]
- **Router**: [React Router/Vue Router/etc]
- **State**: [React Query/Redux/Zustand/etc]
- **Forms**: [React Hook Form/Formik/etc]

### Backend
- **Platform**: [Supabase/Node.js/Python/etc]
- **Framework**: [Express/FastAPI/Django/etc]
- **Database**: [PostgreSQL/MongoDB/MySQL/etc]
- **Auth**: [Supabase Auth/Auth0/JWT/etc]

---

## 🗄️ DATABASE SCHEMA (Resumo)

> **IMPORTANTE**: Documentar schema principal

**Convenção de nomes**: [snake_case/camelCase/PascalCase]

**Tabelas principais**:
- `table_1`: [Descrição]
- `table_2`: [Descrição]
- ...

**Ver detalhes**: `docs/ARCHITECTURE.md` ou migrations em `[caminho]`

---

## 📐 CONVENÇÕES DE CÓDIGO

### Naming:
- **Variáveis/funções**: camelCase (inglês)
- **Componentes**: PascalCase
- **Database**: snake_case
- **API Routes**: kebab-case (`/api/resource-name`)

### Comentários:
- **Código**: Português
- **Commits**: Português + Conventional Commits (`feat:`, `fix:`, `refactor:`)

---

## 🔄 WORKFLOWS DISPONÍVEIS

Ver `.windsurf/workflows/`:

1. **`/add-feature-1-planning`**: Sistema modular 10 etapas (Planning → Solution → Implementation → Validation → Docs → Template Sync)
2. **`/ultra-think`**: Análise profunda para decisões arquiteturais

**Regra**: SEMPRE seguir workflows. NUNCA pular etapas.

---

## 🔒 SEGURANÇA CRÍTICA

1. **ZERO secrets hardcoded** - Sempre `.env` + variáveis de ambiente
2. **RLS obrigatório** - Row Level Security (se Supabase)
3. **NUNCA logar**: Dados sensíveis do usuário
4. **Anonimização**: Analytics agregadas sem identificação
5. **GDPR/LGPD**: Direito ao esquecimento, exportação de dados
6. **Queries parametrizadas**: NUNCA SQL injection

---

## 🚀 PERFORMANCE CRÍTICA

### Targets:
- **Dashboard**: < 2s load
- **API Responses**: < 500ms
- **Page Load**: < 3s (First Contentful Paint)

### Técnicas:
- **React Query**: Cache agressivo (5 min staleTime)
- **Lazy Loading**: Componentes pesados
- **Optimistic Updates**: UI responde antes de API
- **Memoização**: useMemo/useCallback em cálculos pesados

---

## 💰 CUSTOS DE AI (se aplicável)

> **IMPORTANTE**: Atualizar se o projeto usa LLMs/AI

- **Modelo**: [Gemini/GPT-4/Claude/etc]
- **Context Caching**: [Economia esperada]
- **Rate Limiting**: [Limites por usuário/hora]
- **Token Limits**: [Limites por operação]

**Orçamento**: [Estimativa mensal]

---

## 🧪 TESTES PRIORITÁRIOS

1. **Auth/Autorização**: Usuário não vê dados de outros
2. **API Validations**: Validação Zod/Yup/Joi
3. **Critical Paths**: [Listar fluxos críticos]
4. **Edge Cases**: [Casos específicos do negócio]

**TDD obrigatório**: Lógica de negócio (hooks, cálculos, validações).

---

## 🔄 FLUXO TÍPICO

```bash
# 1. Branch
git checkout main && git pull
git checkout -b feat/nome-feature

# 2. Desenvolver (TDD)
npm run dev
# ... código ...

# 3. Quality Gates
./scripts/run-tests.sh
./scripts/code-review.sh
./scripts/run-security-tests.sh

# 4. Commit
git add .
git commit -m "feat: descrição"
git push

# 5. Merge (manual após validação)
```

---

## 📚 DOCUMENTAÇÃO COMPLEMENTAR

**Para informações detalhadas removidas desta versão otimizada**, consulte:

- **Features detalhadas**: `docs/FEATURES.md`
- **Arquitetura completa**: `docs/ARCHITECTURE.md`
- **Troubleshooting**: `docs/TROUBLESHOOTING.md`
- **Comandos úteis**: `docs/COMMANDS.md`
- **Workflows detalhados**: `.windsurf/workflows/`
- **Design Principles**: `docs/DESIGN_PRINCIPLES.md`

---

**Última atualização**: [Data]
**Versão**: 2.0.0 (Otimizada para performance IA)
**Projeto**: [Nome do Projeto]
**Stack Core**: [Resumo da stack]

**Changelog v2.0.0**:
- Versão otimizada baseada em pesquisa (Cursor, Copilot, Anthropic)
- Redução de ~88% no tamanho (alinhado com 2 páginas recomendadas)
- Adicionado: Seção "Uso de Agentes" para Claude Code (multi-agente)
- Foco em: Regras críticas, convenções, segurança, performance
- Documentação detalhada movida para `docs/` (referências adicionadas)
