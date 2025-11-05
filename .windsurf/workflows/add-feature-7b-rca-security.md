---
description: Workflow Add-Feature (7b/9) - RCA e Security Analysis
auto_execution_mode: 1
---

# ⏮️ CONTINUAÇÃO DO WORKFLOW 7a

**Este é o Workflow 7b - Continuação de:**

← [Workflow 7a - Quality Gates](.windsurf/workflows/add-feature-7a-quality-gates.md)

**Pré-requisito**: Quality Gates do Workflow 7a devem estar APROVADOS (score ≥ 7.0).

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

# Workflow 7b/11: RCA e Security Analysis

Este é o **sétimo workflow (parte B)** de 11 etapas modulares para adicionar uma nova funcionalidade.

---

## 🔍 Root Cause Analysis (RCA) - FERRAMENTA CRÍTICA

**⚠️ IMPORTANTE**: RCA é a ferramenta PRINCIPAL para identificar POR QUE Quality Gates falharam.

**Objetivo**: Encontrar causa raiz sistêmica (não pontual) usando técnica dos **5 Whys**.

### Quando Usar RCA

- Quality Gates falharam (code review ou security)
- Múltiplos warnings/errors detectados
- Padrões de falhas recorrentes
- Bugs descobertos tarde no processo

---

### Template de RCA para Quality Gates

```markdown
**Problema**: [Descrever falha específica - ex: "10 warnings TypeScript", "3 vulnerabilidades críticas"]

**5 Whys**:
1. Por quê ocorreu? → [Resposta imediata - ex: "falta de validação de tipos"]
2. Por quê [resposta 1]? → [Causa subjacente - ex: "strict mode desabilitado"]
3. Por quê [resposta 2]? → [Causa mais profunda - ex: "configuração inicial não seguiu padrão"]
4. Por quê [resposta 3]? → [Processo/sistema - ex: "falta checklist de configuração"]
5. Por quê [resposta 4]? → [Causa raiz - ex: "sem Gate de configuração no workflow"]

**Causa Raiz**: [Sistêmica, não pontual - ex: "Ausência de Gate de configuração obrigatório"]

**Ação Preventiva**: [Como prevenir em futuros workflows - ex: "Criar Fase 0: Configuração + Validação"]

**Impacto Esperado**: [Quantificar - ex: "Redução 90% de warnings TypeScript em futuras features"]
```

---

### Exemplos Reais de RCA

#### Exemplo 1: TypeScript Warnings
```markdown
Problema: 10 warnings de TypeScript detectados no code review

5 Whys:
1. Por quê 10 warnings? → Tipos implícitos (any) não detectados durante dev
2. Por quê não detectados? → strict mode desabilitado no tsconfig.json
3. Por quê desabilitado? → Configuração inicial permissiva
4. Por quê configuração permissiva? → Falta de validação de tsconfig no início
5. Por quê falta validação? → Sem Gate de configuração no Workflow 4 (Setup)

Causa Raiz: Ausência de validação de tsconfig no Workflow 4

Ação Preventiva: Adicionar validação obrigatória de strict mode no Workflow 4
- Verificar: "strict": true, "noImplicitAny": true, "strictNullChecks": true

Impacto Esperado: Zero warnings TypeScript em futuras features
```

---

#### Exemplo 2: Vulnerabilidades em Dependências
```markdown
Problema: 3 vulnerabilidades críticas detectadas em npm audit

5 Whys:
1. Por quê 3 vulnerabilidades? → Dependências desatualizadas
2. Por quê desatualizadas? → Nenhuma atualização nos últimos 6 meses
3. Por quê sem atualizações? → Processo manual de verificação
4. Por quê processo manual? → Sem automação de security audit
5. Por quê sem automação? → Falta de CI/CD com security checks

Causa Raiz: Ausência de CI/CD com security audit automatizado

Ação Preventiva:
- Adicionar pre-commit hook com npm audit
- Configurar GitHub Actions para rodar security scan semanal
- Documentar em scripts/ e Workflow 7

Impacto Esperado: Detecção em < 7 dias (vs 6 meses manual)
```

---

#### Exemplo 3: SQL Injection (detectado tarde)
```markdown
Problema: Query vulnerável a SQL injection descoberta no code review

5 Whys:
1. Por quê SQL injection? → String concatenation em vez de parameterized query
2. Por quê string concatenation? → Desenvolvedor desconhecia padrão seguro
3. Por quê desconhecia? → Padrão não documentado em AGENTS.md
4. Por quê não documentado? → Nenhum exemplo de queries seguras
5. Por quê sem exemplos? → Falta de seção "Segurança" em padrões

Causa Raiz: Falta de documentação de padrões de segurança em AGENTS.md

Ação Preventiva:
- Adicionar seção "Padrões de Segurança" em AGENTS.md
- Incluir exemplos: queries parametrizadas, XSS prevention, CSRF
- Adicionar ESLint rule para detectar string concatenation em queries

Impacto Esperado: Zero SQL injections em futuras features
```

---

### Como Executar RCA na Prática

1. **Detectar Falha**: Quality Gate falhou com N issues
2. **Aplicar 5 Whys**: Iterar até causa raiz sistêmica (não pontual)
3. **Identificar Ação**: Como prevenir em futuras features?
4. **Documentar**: Criar issue ou atualizar workflow imediatamente
5. **Validar**: Próxima feature deve ter ZERO issues similares

---

### Benefícios de RCA

- ✅ **Prevenção**: Causa raiz eliminada = problema não recorre
- ✅ **ROI > 10x**: 1h de RCA economiza 10h+ em bugs futuros
- ✅ **Evolução**: Sistema melhora continuamente
- ✅ **Debugging 36x mais rápido**: Problemas detectados na origem

**⚠️ REGRA CRÍTICA**: Se Quality Gate falhou, RCA é OBRIGATÓRIO!

---

## 🔧 Troubleshooting de Segurança

### Problema 1: Secrets Detectados

**Sintoma**: Script detectou API keys, passwords ou tokens no código

**Diagnóstico**:
```bash
# Verificar o que foi detectado
git diff --cached | grep -iE '(password|api_key|secret|token|credential)'
```

**Solução**:
1. Remover secrets do código
2. Mover para `.env` (NÃO commitar)
3. Verificar se `.env` está no `.gitignore`
4. Usar variáveis de ambiente: `import.meta.env.VITE_*`

**Exemplo**:
```typescript
// ❌ ERRADO
const API_KEY = "sk-1234567890abcdef";

// ✅ CORRETO
const API_KEY = import.meta.env.VITE_API_KEY;
```

---

### Problema 2: Vulnerabilidades em Dependências

**Sintoma**: `npm audit` reporta vulnerabilidades críticas

**Diagnóstico**:
```bash
npm audit --json | jq '.metadata.vulnerabilities'
```

**Solução**:
```bash
# Tentar fix automático
npm audit fix

# Se não resolver, atualizar manualmente
npm update [package-name]

# Em último caso, forçar update (testar!)
npm audit fix --force

# Re-verificar
npm audit
```

**Se ainda houver vulnerabilidades**:
- Verificar se há alternativa ao pacote
- Avaliar se vulnerabilidade afeta o projeto
- Documentar decisão de aceitar risco (se inevitável)

---

### Problema 3: SQL Injection Detectado

**Sintoma**: Code review detectou string concatenation em queries

**Diagnóstico**:
```bash
# Buscar padrões suspeitos
grep -r "SELECT.*\${" src/
grep -r "INSERT.*\${" src/
```

**Solução**:
```typescript
// ❌ ERRADO - SQL Injection
const query = `SELECT * FROM users WHERE id = ${userId}`;

// ✅ CORRETO - Parameterized query
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId);
```

---

### Problema 4: XSS Vulnerabilidade

**Sintoma**: Uso de `dangerouslySetInnerHTML` detectado

**Diagnóstico**:
```bash
# Buscar uso de dangerouslySetInnerHTML
grep -r "dangerouslySetInnerHTML" src/
```

**Solução**:
```typescript
// ❌ ERRADO - XSS vulnerability
<div dangerouslySetInnerHTML={{__html: userInput}} />

// ✅ CORRETO - React escapa automaticamente
<div>{userInput}</div>

// Se HTML é necessário, sanitizar primeiro
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(userInput)}} />
```

---

### Problema 5: RLS (Row Level Security) Não Configurado

**Sintoma**: Tabelas sem políticas RLS no Supabase

**Diagnóstico**:
```sql
-- No Supabase Dashboard → Authentication → Policies
-- Verificar tabelas sem políticas
```

**Solução**:
```sql
-- Habilitar RLS na tabela
ALTER TABLE lifetracker_habits ENABLE ROW LEVEL SECURITY;

-- Criar política de leitura (usuário vê apenas seus dados)
CREATE POLICY "Users can view own habits" ON lifetracker_habits
  FOR SELECT USING (auth.uid() = user_id);

-- Criar política de escrita
CREATE POLICY "Users can insert own habits" ON lifetracker_habits
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

### Problema 6: CORS Configuration

**Sintoma**: Erros de CORS no console do navegador

**Diagnóstico**:
```bash
# Verificar configuração CORS no Supabase
# Dashboard → Settings → API → CORS Configuration
```

**Solução**:
- Adicionar domínio à lista de allowed origins
- Em desenvolvimento: `http://localhost:5173`
- Em produção: `https://life-tracker.stackia.com.br`

---

## 📊 Quality Score (Opcional)

Se quiser quantificar a qualidade do código:

```markdown
**Quality Score**: [0-10]

**Critérios** (0-10 cada, média final):
- Code Quality: [0-10] (ESLint, patterns, readability)
- Security: [0-10] (secrets, SQL injection, XSS, CSRF)
- Performance: [0-10] (queries, bundle size, memoization)
- Tests: [0-10] (coverage, edge cases)
- Documentation: [0-10] (comments, README, ADR)

**Cálculo**:
Quality Score = (Code Quality + Security + Performance + Tests + Documentation) / 5

**Aprovação**: Score ≥ 7.0 → APROVADO
```

---

## 📝 Fase 16: Atualização de Documentação

Após completar este workflow:
- [ ] Atualizar `docs/TASK.md` com status das tarefas completadas
- [ ] Atualizar `docs/PLAN.md` se houve mudança estratégica
- [ ] Criar ADR em `docs/adr/` se houve decisão arquitetural
- [ ] **⚠️ IMPORTANTE**: Se criar novo ADR, atualizar `docs/adr/INDEX.md` com referência ao novo ADR (adicionar entry em tabela/lista com título, descrição e data)
- [ ] Documentar problemas encontrados e RCA realizado (se aplicável)

---

## ✅ Checkpoint Final: Quality Completo!

**O que foi validado:**
- ✅ Code review passou (código limpo, padrões OK)
- ✅ Security scan passou (ZERO vulnerabilidades críticas)
- ✅ ZERO secrets hardcoded
- ✅ Queries seguras (parameterized)
- ✅ Outputs escapados (XSS safe)
- ✅ RLS configurado (CSRF safe)
- ✅ RCA realizado (se houve falhas)
- ✅ Documentação atualizada

**Código está pronto para:**
- Meta-Learning (identificar aprendizados)
- Documentação final
- Commit e push

**Status atual**:
- Branch: `feat/add-profit-cards-makeup`
- Commits locais: ~8-15 commits
- Qualidade: ✅ Code Review + ✅ Security + ✅ RCA
- Aprovação: ✅ Usuário + ✅ Automatizada

**Próxima etapa:** Meta-Learning - Identificar aprendizados ANTES de documentar!

---

## 🔄 Próximo Workflow (Automático)

```
Acionar workflow: .windsurf/workflows/add-feature-8-meta-learning.md
```

**Ou você pode continuar manualmente digitando**: `/add-feature-8-meta-learning`

---

**Workflow criado em**: 2025-10-27 (modificado: 2025-11-04)
**Parte**: 7b de 11
**Próximo**: Meta-Learning (Aprender ANTES de Documentar)
