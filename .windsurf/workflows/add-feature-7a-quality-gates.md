---
description: Workflow Add-Feature (7a/9) - Quality Gates (Code Review + Security)
auto_execution_mode: 1
---

## 📚 Pré-requisito: Consultar Documentação Base

Antes de iniciar, SEMPRE ler: `docs/PLAN.md`, `docs/TASK.md`, `README.md`, `AGENTS.md`

---

# Workflow 7a/11: Quality Gates (Code Review + Security)

Sétimo workflow de 11 etapas modulares para adicionar funcionalidade.

---

## ⚠️ REGRA CRÍTICA: USO MÁXIMO DE AGENTES

**SEMPRE usar MÁXIMO de agentes em paralelo** para validação (até 36x mais rápido).

**Exemplo:**
- Fase 14: 3+ agentes (code quality, segurança, performance)
- Fase 15: 4+ agentes (secrets, deps, static analysis, RLS)

---

**O que acontece:**
- Fase 14: Code Review Automatizado (OBRIGATÓRIO)
- Fase 15: Testes de Segurança (OBRIGATÓRIO)

**Por que obrigatórias?**
- ✅ Detectar bugs antes de commit
- ✅ Identificar vulnerabilidades
- ✅ Garantir consistência

**⚠️ Não pular!** Bugs custam 10x mais depois.

---

## 🔍 Fase 14: Code Review Automatizado

### 14.1 Executar Code Review
```bash
# Script automatizado (recomendado)
./scripts/code-review.sh
```

**Analisa:** Code quality, segurança, performance, testes

---

### 14.2 Checklist de Code Review

**Code Quality:**
- [ ] Padrões (ESLint, Prettier)
- [ ] Nomes claros e descritivos
- [ ] SRP, DRY
- [ ] Comentários explicam "por que"

**Segurança:**
- [ ] ZERO secrets hardcoded
- [ ] Inputs sanitizados
- [ ] Queries parametrizadas
- [ ] RLS implementado
- [ ] Logs sem dados sensíveis

**Performance:**
- [ ] Queries otimizadas (índices, limit)
- [ ] Sem N+1 queries
- [ ] Lazy loading libs > 100KB
- [ ] Bundle < 500KB/chunk

**Testes:**
- [ ] Cobertura > 70%
- [ ] Edge cases cobertos
- [ ] Rápidos e determinísticos

---

### 14.3 Resultado

**Status**: ✅ APROVADO / ⚠️ REQUER AJUSTES / ❌ REPROVADO

**Ação**:
- APROVADO → Fase 15
- REQUER AJUSTES → Corrigir e re-revisar
- REPROVADO → Refazer (volta Workflow 5)

---

## 🛡️ Fase 15: Testes de Segurança

### 15.1 Executar Security Tests
```bash
./scripts/run-security-tests.sh
```

**Verifica:** Secrets scan, vulnerabilidades deps, análise estática, SQL Injection, XSS, CSRF

---

### 15.2 Verificações Críticas

**1. Scan de Secrets**
```bash
git diff --cached | grep -iE '(password|api_key|secret|token)' || echo "✅ OK"
git status | grep -E '\.env$' && echo "❌ ERRO" || echo "✅ OK"
```

**2. Vulnerabilidades**
```bash
npm audit
# Se críticas: npm audit fix
```

**3. Análise Estática**
```bash
npm run lint
npx tsc --noEmit
```

**4. SQL Injection**
```typescript
// ❌ ERRADO
const query = `SELECT * FROM users WHERE id = ${userId}`;

// ✅ CORRETO
const { data } = await supabase.from('users').select('*').eq('id', userId);
```

**5. XSS**
```typescript
// ❌ ERRADO: dangerouslySetInnerHTML
// ✅ CORRETO: <div>{userInput}</div>
```

**6. CSRF**
- [ ] RLS configurado
- [ ] Auth tokens em headers
- [ ] CORS correto

---

### 15.3 Checklist Final Segurança

**ANTES DE COMMIT:**
- [ ] ZERO secrets hardcoded
- [ ] ZERO vulnerabilidades críticas
- [ ] SQL Injection: SEGURO
- [ ] XSS: SEGURO
- [ ] CSRF: SEGURO
- [ ] Inputs sanitizados
- [ ] Logs sem dados sensíveis
- [ ] .env não commitado

---

### 15.4 Se Falhar

**AÇÃO IMEDIATA:**
1. ❌ NÃO COMMITAR
2. 🔧 Corrigir issues
3. 🔄 Re-rodar tests
4. ✅ Prosseguir quando passar

**Exemplo correção:**
```typescript
// ❌ ERRADO: const API_KEY = "sk-1234567890abcdef";
// ✅ CORRETO: const API_KEY = import.meta.env.VITE_API_KEY;
```

---

## ⚡ OTIMIZAÇÃO: Paralelo

**Economia**: 15-20min por feature

**Opção 1: Scripts Paralelos**
```bash
./scripts/code-review.sh &
./scripts/run-security-tests.sh &
wait
```

**Opção 2: Múltiplos Agentes** (code review + security tests simultâneos)

**Benefício**: 8min → 5min

---

## ✅ Checkpoint: Quality Gates Aprovados

**Validado:**
- ✅ Code review passou
- ✅ Security scan passou
- ✅ ZERO secrets
- ✅ Queries seguras
- ✅ RLS configurado

**Código pronto para Workflow 7b**

---

## 🧠 Meta-Learning: Captura de Aprendizados

**⚠️ CRÍTICO - NÃO PULE**: Fundamental para evolução contínua.

### Questões de Reflexão (Responder TODAS)

**1. Eficiência (Nota 1-10):**
- [ ] Nota: __/10
- [ ] Se < 8: Fase ineficiente? Como melhorar?

**2. Iterações:**
- [ ] Número: __
- [ ] Se > 3: Causa? Como tornar mais autônomo?

**3. Gaps:**
- [ ] Validação faltou? (qual? onde inserir?)
- [ ] Gate falhou? (qual melhorar?)
- [ ] Comando repetido 3+? (automatizar?)

**4. RCA (Se problema):**
- [ ] Problema: [descrever]
- [ ] 5 Whys aplicados?
- [ ] Afeta múltiplas features? (SE NÃO: descartar)
- [ ] Meta-learning previne recorrência?

### Ações de Melhoria

**Documentação:**
- [ ] Workflow precisa melhorias? → Descrever
- [ ] CLAUDE.md precisa novo padrão? → Especificar
- [ ] Novo script útil? → Nome + função
- [ ] ADR necessário? → Decisão arquitetural

**ROI Esperado:** [Ganho - ex: "20min/feature" ou "Previne 2h debugging"]

### ⚠️ IMPORTANTE

- Só learnings SISTÊMICOS (não pontuais)
- RCA obrigatório para validar se sistêmico
- Consolidação final no Workflow 8a

### Validação Tamanho
```bash
wc -c .windsurf/workflows/add-feature-7a-quality-gates.md
# ✅ < 12000 chars | ❌ > 12000: Comprimir ou dividir
```

**Checklist Otimização (se > 11k):**
- [ ] Remover exemplos redundantes
- [ ] Consolidar checklists
- [ ] Extrair para docs/
- [ ] Dividir em 2 workflows

---

## ⏭️ CONTINUAÇÃO AUTOMÁTICA

**Continua em:** [Workflow 7b - RCA e Security Analysis](.windsurf/workflows/add-feature-7b-rca-security.md)

**Próximas etapas:**
- RCA problemas de qualidade
- Troubleshooting segurança
- Atualização docs

---

## 🚨 REGRA CRÍTICA: ANTI-ROI

**NUNCA calcule ou mencione**:
- ❌ ROI (Return on Investment)
- ❌ Tempo de execução/produção
- ❌ "Horas economizadas"
- ❌ Estimativas temporais (Xmin vs Ymin)

**Por quê**:
- Projeto desenvolvido por IA (não humanos)
- IA executa tarefas em paralelo (não linear)
- Cálculos consomem tokens sem valor
- Polui documentação com dados irrelevantes

**Permitido**:
- ✅ Evidências concretas (código, logs, testes)
- ✅ Comparações qualitativas ("mais rápido", "mais eficiente")
- ✅ Métricas técnicas (latência, throughput, memory usage)

**Regra**: NEVER guess time/ROI. Use dados concretos ou não mencione.


---

**Criado**: 2025-10-27 (modificado: 2025-11-08)
**Parte**: 7a de 11
**Próximo**: Workflow 7b
