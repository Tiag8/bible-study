---
description: Workflow Add-Feature (7a/9) - Quality Gates (Code Review + Security)
auto_execution_mode: 1
---

## 📚 Pré-requisito: Consultar Documentação Base

Antes de iniciar qualquer planejamento ou ação, SEMPRE ler:
- `docs/PLAN.md` - Visão estratégica atual
- `docs/TASK.md` - Status das tarefas em andamento
- `README.md` - Descrição do projeto
- `AGENTS.md` - Comportamento dos agents
- `.windsurf/workflows` - Todos workflows em etapas (arquivos diferentes)
- `docs/` - Todos documentos importantes
- `scripts/` - Todos scrips importantes

---

# Workflow 7a/11: Quality Gates (Code Review + Security)

Este é o **sétimo workflow (parte A)** de 11 etapas modulares para adicionar uma nova funcionalidade.

---

## ⚠️ REGRA CRÍTICA: USO MÁXIMO DE AGENTES

**SEMPRE usar o MÁXIMO de agentes possível em paralelo** para todas as fases de validação deste workflow.

**Benefícios:**
- ⚡ Redução drástica do tempo de execução (até 36x mais rápido)
- 🎯 Melhor cobertura de análise
- 🚀 Maior throughput de tarefas

**Exemplo:**
- Phase 14 (Code Review): 3+ agentes analisando diferentes aspectos (code quality, segurança, performance)
- Phase 15 (Security): 4+ agentes realizando verificações paralelas (secrets scan, dependencies, static analysis, RLS)
- Validações paralelas: ESLint, TypeScript, SQL Security, XSS Prevention, CSRF Prevention

---

**O que acontece neste workflow:**
- Fase 14: Code Review Automatizado (OBRIGATÓRIO)
- Fase 15: Testes de Segurança (OBRIGATÓRIO)

**Por que essas etapas são obrigatórias?**
- ✅ Detectar bugs antes de commit (economiza tempo)
- ✅ Identificar vulnerabilidades de segurança
- ✅ Garantir consistência com codebase
- ✅ Detectar código ineficiente
- ✅ Melhorar código continuamente

**⚠️ Não pular mesmo sob pressão!**
- Bugs custam 10x mais para corrigir depois
- Um vazamento de dados é irreversível
- Security scan economiza problemas futuros

---

## 🔍 Fase 14: Code Review Automatizado (OBRIGATÓRIO)

### 14.1 Por que Code Review é obrigatório?

- ✅ **Qualidade**: Detectar bugs antes de commit
- ✅ **Segurança**: Identificar vulnerabilidades
- ✅ **Padrões**: Garantir consistência com codebase
- ✅ **Performance**: Detectar código ineficiente
- ✅ **Aprendizado**: Melhorar código continuamente

---

### 14.2 Executar Code Review

```bash
# Opção 1: Script automatizado (recomendado)
./scripts/code-review.sh

# Opção 2: Review manual com deep think
# Pedir para AI revisar com pensamento profundo
```

**O que o script analisa:**
- Code quality (ESLint, Prettier, naming conventions)
- Segurança (secrets, SQL injection, XSS)
- Performance (N+1 queries, bundle size)
- Testes (cobertura, edge cases)
- Padrões do projeto

---

### 14.3 Checklist de Code Review

#### Code Quality:
- [ ] Código segue padrões do projeto (ESLint, Prettier)
- [ ] Nomes de variáveis/funções são claros e descritivos
- [ ] Funções têm responsabilidade única (SRP)
- [ ] Código não está duplicado (DRY)
- [ ] Comentários explicam "por que", não "o que"
- [ ] Código é testável e manutenível

#### Segurança:
- [ ] ZERO secrets hardcoded (API keys, passwords, tokens)
- [ ] Inputs de usuário são sanitizados
- [ ] Queries usam prepared statements (Supabase query builder)
- [ ] Validações no backend (não só frontend)
- [ ] RLS (Row Level Security) implementado
- [ ] Logs não contêm dados sensíveis

#### Performance:
- [ ] Queries otimizadas (índices, limit, select específico)
- [ ] Sem N+1 queries
- [ ] Lazy loading para libs pesadas (> 100KB)
- [ ] Memoization quando apropriado (useMemo, useCallback)
- [ ] Bundle size aceitável (< 500KB por chunk)

#### Testes:
- [ ] Cobertura de testes adequada (mínimo 70%)
- [ ] Testes testam comportamento, não implementação
- [ ] Edge cases cobertos (dados vazios, muitos dados, inválidos)
- [ ] Testes são rápidos e determinísticos (sem flakiness)

---

### 14.4 Deep Think Review (features complexas)

Para features complexas ou críticas, usar pensamento profundo:

```markdown
**Prompt para AI:**
"Faça um code review profundo (deep think) dos arquivos modificados.
Analise:
- Bugs potenciais
- Vulnerabilidades de segurança
- Problemas de performance
- Violações de padrões
- Sugestões de melhoria

Arquivos para revisar:
- src/hooks/useProfit.ts
- src/components/ProfitCard.tsx
"
```

---

### 14.5 Resultado do Code Review

**Status**: ✅ APROVADO / ⚠️ REQUER AJUSTES / ❌ REPROVADO

**Issues encontrados**: [Listar]

**Recomendações**: [Listar]

**Ação**:
- Se APROVADO → Prosseguir para Fase 15 (Security)
- Se REQUER AJUSTES → Corrigir e re-revisar
- Se REPROVADO → Refazer implementação (volta para Workflow 5)

---

## 🛡️ Fase 15: Testes de Segurança (OBRIGATÓRIO)

**IMPORTANTE**: Verificação de segurança é OBRIGATÓRIA antes de commit.

### 15.1 Executar Security Tests

```bash
# Rodar script de segurança
./scripts/run-security-tests.sh
```

**O que o script verifica:**
1. Scan de secrets (API keys, passwords, tokens)
2. Vulnerabilidades em dependências (npm audit)
3. Análise estática de segurança (ESLint security rules)
4. SQL Injection (queries parametrizadas?)
5. XSS (outputs escapados? dangerouslySetInnerHTML?)
6. CSRF (RLS configurado? Auth tokens corretos?)

---

### 15.2 Verificações de Segurança

#### 1. Scan de Secrets
```bash
# Verificar se há secrets no código
git diff --cached | grep -iE '(password|api_key|secret|token|credential)' || echo "✅ Nenhum secret detectado"

# Verificar arquivos .env não commitados
git status | grep -E '\.env$' && echo "❌ ERRO: .env detectado!" || echo "✅ .env não será commitado"
```

**Resultado**: ✅ PASSOU / ❌ FALHOU

**Se falhar**:
- Remover secrets do código
- Mover para variáveis de ambiente (.env)
- Adicionar .env ao .gitignore
- Re-rodar security scan

---

#### 2. Scan de Vulnerabilidades (dependências)
```bash
# NPM audit
npm audit

# Ou yarn audit
yarn audit
```

**Resultado**: ✅ Sem vulnerabilidades críticas / ⚠️ Vulnerabilidades encontradas

**Se houver vulnerabilidades críticas**:
```bash
# Tentar fix automático
npm audit fix

# Se não resolver, atualizar deps manualmente
npm update [package-name]

# Re-rodar audit
npm audit
```

---

#### 3. Análise Estática de Segurança
```bash
# ESLint com regras de segurança
npm run lint

# TypeScript strict mode
npx tsc --noEmit
```

**Resultado**: ✅ PASSOU / ❌ FALHOU

---

#### 4. Verificação de SQL Injection
- [ ] Queries usam parameterized queries (não string concatenation)
- [ ] Supabase queries usam `.eq()`, `.filter()` (não raw SQL)
- [ ] Se usar raw SQL, está sanitizado

**Exemplo**:
```typescript
// ❌ ERRADO - SQL Injection vulnerability
const query = `SELECT * FROM users WHERE id = ${userId}`;

// ✅ CORRETO - Parameterized query
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId);
```

---

#### 5. Verificação de XSS
- [ ] Outputs são escapados (React faz automaticamente)
- [ ] `dangerouslySetInnerHTML` NÃO usado (ou justificado e sanitizado)
- [ ] Inputs são validados e sanitizados

**Exemplo**:
```typescript
// ❌ ERRADO - XSS vulnerability
<div dangerouslySetInnerHTML={{__html: userInput}} />

// ✅ CORRETO - React escapa automaticamente
<div>{userInput}</div>
```

---

#### 6. Verificação de CSRF
- [ ] Supabase RLS configurado
- [ ] Auth tokens em headers (não URL/query params)
- [ ] CORS configurado corretamente

**Verificar RLS**:
```sql
-- No Supabase Dashboard → Authentication → Policies
-- Verificar que TODAS as tabelas têm políticas RLS
```

---

### 15.3 Checklist Final de Segurança

**ANTES DE COMMIT, verificar**:
- [ ] ✅ ZERO secrets hardcoded
- [ ] ✅ ZERO vulnerabilidades críticas em deps
- [ ] ✅ SQL Injection: SEGURO (parameterized queries)
- [ ] ✅ XSS: SEGURO (outputs escapados)
- [ ] ✅ CSRF: SEGURO (RLS + auth tokens)
- [ ] ✅ Inputs sanitizados
- [ ] ✅ Logs sem dados sensíveis
- [ ] ✅ .env não será commitado

---

### 15.4 Se Falhar Security Tests

**AÇÃO IMEDIATA**:
1. ❌ **NÃO COMMITAR** código inseguro
2. 🔧 Corrigir issues de segurança
3. 🔄 Re-rodar security tests
4. ✅ Só prosseguir quando TODOS os testes passarem

**Exemplos de correções**:

```typescript
// ❌ ERRADO - Secret hardcoded
const API_KEY = "sk-1234567890abcdef";

// ✅ CORRETO - Usar variável de ambiente
const API_KEY = import.meta.env.VITE_API_KEY;
```

---

## ⚡ OTIMIZAÇÃO: Executar Code Review + Security em PARALELO

**Economia**: 15-20 min por feature (de sequencial para paralelo)

#### Opção 1: Scripts Bash em Paralelo

```bash
# Rodar ambos ao mesmo tempo (& = background, wait = aguardar ambos)
./scripts/code-review.sh &
./scripts/run-security-tests.sh &
wait

# Verificar exit codes
if [ $? -eq 0 ]; then
  echo "✅ Quality Gates PASSOU"
else
  echo "❌ Quality Gates FALHOU"
fi
```

#### Opção 2: Usar Múltiplos Agentes (Claude Code)

Lance 2 agentes em paralelo em UMA mensagem:
- **Agent 1**: Executar `./scripts/code-review.sh`
- **Agent 2**: Executar `./scripts/run-security-tests.sh`

Aguardar ambos completarem antes de prosseguir.

#### Opção 3: Manual (se scripts falharem)

Execute simultaneamente em 2 terminais diferentes:
- **Terminal 1**: `./scripts/code-review.sh`
- **Terminal 2**: `./scripts/run-security-tests.sh`

**Benefício**: De 8 min sequencial → 5 min paralelo (economia 3-5 min)

---

## ✅ Checkpoint: Quality Gates Aprovados!

**O que foi validado:**
- ✅ Code review passou (código limpo, padrões OK)
- ✅ Security scan passou (ZERO vulnerabilidades críticas)
- ✅ ZERO secrets hardcoded
- ✅ Queries seguras (parameterized)
- ✅ Outputs escapados (XSS safe)
- ✅ RLS configurado (CSRF safe)

**Código está pronto para:**
- Root Cause Analysis (se houver falhas)
- Troubleshooting de segurança
- Atualização de documentação

**Status atual**:
- Branch: `feat/add-profit-cards-makeup`
- Commits locais: ~8-15 commits
- Qualidade: ✅ Code Review + ✅ Security
- Aprovação: ✅ Usuário + ✅ Automatizada

---

## ⏭️ CONTINUAÇÃO AUTOMÁTICA

**Este workflow continua automaticamente em:**

→ [Workflow 7b - RCA e Security Analysis](.windsurf/workflows/add-feature-7b-rca-security.md)

**Próximas etapas:**
- Análise Root Cause de problemas de qualidade
- Troubleshooting de segurança
- Atualização de documentação

*A execução do Workflow 7b deve ser iniciada automaticamente após a conclusão desta parte.*

---

**Workflow criado em**: 2025-10-27 (modificado: 2025-11-04)
**Parte**: 7a de 11
**Próximo**: Workflow 7b (RCA e Security Analysis)
