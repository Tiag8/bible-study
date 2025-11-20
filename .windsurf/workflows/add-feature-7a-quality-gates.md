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

## 🧠 FASE 0: LOAD CONTEXT (Script Unificado)

**⚠️ USAR SCRIPT** (não Read manual):

```bash
./scripts/context-load-all.sh feat-nome-feature
```

**Output**: Resumo 6 arquivos .context/ (INDEX, workflow-progress, temp-memory, decisions, attempts.log, validation-loop).

**SE script falhar**: Fallback manual (Read 6 arquivos).

**Benefício**: Consolidated context loading vs manual Fase 0 (redução tempo).
---

## 📋 Fase 0.5: Usar Template Checklist (OBRIGATÓRIO)

**CRÍTICO**: TODAS validações técnicas DEVEM usar formato padronizado.

### 0.5.1. Template Validation Checklist

**Localização**: `.windsurf/templates/validation-checklist-template.md`

**5 Elementos Obrigatórios**:
1. **Título numerado** (ex: "✅ 1. Build produção sem warnings")
2. **Cenário** (contexto específico - ex: "Executar build para validar bundle")
3. **Steps** (lista executável, comandos exatos)
4. **Validação** (métricas objetivas, thresholds)
5. **Screenshots** (logs, relatórios - OPCIONAL)

### 0.5.2. Como Usar

```bash
# 1. Abrir template
cat .windsurf/templates/validation-checklist-template.md

# 2. Copiar exemplo relevante para Workflow 7a (Quality Gates)

# 3. Adaptar para validação técnica específica

# 4. Documentar resultados
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')
# Adicionar checklist completo em validation-loop.md
```

### 0.5.3. Exemplo Workflow 7a

**Ver no template**: Seção "Workflow 7a (Quality Gates)" com 3 exemplos:
- Build produção sem warnings
- Security scan aprovado
- Performance benchmarks (Lighthouse)

### 0.5.4. Anti-Patterns (EVITAR)

❌ **Validação ambígua**: "Build OK"
✅ **Validação objetiva**: "Build exit code 0 + ZERO TS errors + Bundle < 500KB"

❌ **Steps vagos**: "Rodar testes"
✅ **Steps executáveis**: "./scripts/run-security-tests.sh && verificar exit code 0"

### 0.5.5. Benefícios

- **100% reprodutível** (scripts automatizados)
- **Métricas rastreáveis** (evidências em logs)
- **Regressões detectáveis** (comparação com baselines)

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

## ✅ FASE 4: CHECKPOINTS (REGRA #13 - Uma Ação Por Vez)

**CRÍTICO**: Durante todo este workflow, SEMPRE executar checkpoint após CADA ação atômica.

### 4.1. O que é uma Ação Atômica?

**Ação atômica** = Menor unidade testável e reversível.

**Exemplos deste workflow (Quality Gates)**:
- ✅ "Executar TypeScript compiler (tsc)"
- ✅ "Rodar ESLint em arquivo X"
- ✅ "Executar security scan (npm audit)"
- ✅ "Rodar teste unitário de módulo Y"
- ✅ "Executar build de produção"
- ❌ "Rodar todos quality gates de uma vez" (NÃO atômico - múltiplas ações)

### 4.2. Checkpoint Obrigatório (Após Cada Ação)

**Usar script automatizado**:
```bash
./scripts/checkpoint.sh "descrição da ação executada"
```

**Ou manualmente**:

**Template de Checkpoint**:
```
✅ AÇÃO COMPLETA: [descrição da ação]

📸 EVIDÊNCIA:
[output do teste, build success, scan result]

🔍 VALIDAÇÃO:
- [x] Gate passou sem erros
- [x] Output documentado
- [x] Correções aplicadas (se necessário)
- [x] Próximo gate identificado

🎯 PRÓXIMA AÇÃO PROPOSTA:
[descrição do próximo gate]

⏸️ AGUARDANDO APROVAÇÃO do usuário para continuar.
```

### 4.3. Checklist Checkpoint (Executar a Cada Ação)

- [ ] **Executei apenas 1 gate?**
- [ ] **Mostrei evidência ao usuário?** (output, logs, erros)
- [ ] **Gate PASSOU?** (aprovação explícita)
- [ ] **Documentei em `.context/`?** (attempts.log)
- [ ] **Identifiquei próximo gate?** (pipeline sequencial)

### 4.4. Exemplo de Aplicação (Quality Gates)

**Fluxo com Checkpoints**:

```
1. AÇÃO: "Executar TypeScript compiler (npx tsc)"
   → Executar → Checkpoint → Aprovação

2. AÇÃO: "Rodar ESLint (npx eslint src/)"
   → Executar → Checkpoint → Aprovação

3. AÇÃO: "Executar testes unitários (npm test)"
   → Executar → Checkpoint → Aprovação

4. AÇÃO: "Security scan (npm audit --audit-level=moderate)"
   → Executar → Checkpoint → Aprovação

5. AÇÃO: "Build de produção (npm run build)"
   → Executar → Checkpoint → Aprovação
```

### 4.5. Quando NÃO Aplicar Checkpoint

**Exceções** (gates podem ser agrupados):
- ✅ **Gates rápidos**: TSC + ESLint se ambos < 10seg
- ✅ **Suite trivial**: Se apenas 3 testes unitários

**MAS**: Mesmo nas exceções, mostrar resultado ANTES de próximo gate.

### 4.6. Benefícios no Quality Gates

**Eficiência**:
- ✅ Erro identificado no gate específico (não "algo falhou")
- ✅ Correção imediata (sem rodar suite completa novamente)
- ✅ Zero retrabalho (cada gate validado incrementalmente)
- ✅ Debugging trivial (gate X falhou → corrigir → re-run gate X)

**Colaboração**:
- ✅ Usuário vê progresso gate-by-gate (TSC ✅ → ESLint ✅ → Tests ✅)
- ✅ Feedback loop rápido (30seg por gate)
- ✅ Deploy bloqueado apenas se gate CRÍTICO falha

### 4.7. Documentação Automática

Cada checkpoint DEVE logar em `.context/attempts.log`:

```bash
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] CHECKPOINT: [gate] - SUCCESS" >> .context/${BRANCH_PREFIX}_attempts.log
```

**Ver**: REGRA #13 em `.claude/CLAUDE.md` para detalhes completos.

---

## 🧠 FASE FINAL: UPDATE CONTEXT (.context/ - OBRIGATÓRIO)

**⚠️ CRÍTICO**: SEMPRE atualizar `.context/` APÓS workflow.

### F.1. Atualizar workflow-progress.md

```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')

cat >> .context/${BRANCH_PREFIX}_workflow-progress.md <<EOF

### Workflow 7a: Quality Gates ✅ COMPLETO
- **Data**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')
- **Actions**:
  - Code review automatizado executado
  - Security scan completo (secrets, vulnerabilidades, SQL injection, XSS)
  - Análise estática (TypeScript, ESLint)
  - Validação RLS e CORS
- **Outputs**:
  - Code quality score aprovado
  - ZERO vulnerabilidades críticas
  - ZERO secrets hardcoded
  - Queries seguras (parameterized)
- **Next**: Workflow 7b (RCA & Security Analysis)
EOF
```

### F.2. Atualizar temp-memory.md

```bash
# Atualizar seção "Estado Atual"
cat > /tmp/temp-memory-update.md <<'EOF'
## Estado Atual

Workflow 7a (Quality Gates) concluído com sucesso.

**Quality Gates**: APROVADOS (code review + security scan)

**Próximo passo**: Executar Workflow 7b (RCA & Security Analysis) para análise de causas raiz (se issues encontrados).

---

## Próximos Passos

- [ ] Executar Workflow 7b (RCA & Security Analysis)
- [ ] Atualizar documentação
- [ ] Prosseguir para commit/push

---

## Decisões Pendentes

Nenhuma (Quality Gates aprovados).

EOF

# Substituir seção no arquivo original (preservar "Última Atualização")
sed -i.bak '/## Estado Atual/,/## Bloqueios\/Questões/{//!d;}' .context/${BRANCH_PREFIX}_temp-memory.md
cat /tmp/temp-memory-update.md >> .context/${BRANCH_PREFIX}_temp-memory.md
rm /tmp/temp-memory-update.md
```

### F.3. Atualizar decisions.md (Se Decisões Tomadas)

**⚠️ Só atualizar se DECISÃO foi tomada no workflow.**

```bash
# Exemplo: Se decidimos aceitar warning não-crítico
cat >> .context/${BRANCH_PREFIX}_decisions.md <<EOF

## Workflow 7a - Quality Gates
- **Decisão**: [Descrever decisão - ex: "Aceitar warning ESLint no-explicit-any"]
- **Por quê**: [Motivo - ex: "Caso edge, não afeta segurança"]
- **Trade-off**: [Ex: "Mantém código flexível, mas reduz type safety"]
- **Alternativas consideradas**: [Listar opções rejeitadas]
- **Data**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')
EOF
```

### F.4. Log em attempts.log

```bash
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] WORKFLOW: 7a (Quality Gates) - COMPLETO" >> .context/${BRANCH_PREFIX}_attempts.log
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] QUALITY: Code review APROVADO" >> .context/${BRANCH_PREFIX}_attempts.log
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] SECURITY: Scan APROVADO (ZERO vulnerabilidades críticas)" >> .context/${BRANCH_PREFIX}_attempts.log
```

### F.5. Validação Context Updated

**Checklist Pós-Workflow**:
- [ ] Atualizei workflow-progress.md?
- [ ] Atualizei temp-memory.md (Estado Atual + Próximos Passos)?
- [ ] Atualizei decisions.md (se decisão tomada)?
- [ ] Logei em attempts.log (WORKFLOW COMPLETO + Quality + Security)?

**Se NÃO atualizou**: ⛔ PARAR e atualizar AGORA.

---

## 🔄 VALIDATION LOOP (OBRIGATÓRIO - Workflows Iterativos)

**APLICÁVEL**: Se workflow envolve code review iterativo ou correções de quality gates.

**Sistema**: Registrar iterações em `.context/{branch}_validation-loop.md`.

### Quando Usar

**Usar SE**:
- [ ] Quality gates falharam (iterações de correção)
- [ ] Code review encontrou issues (ajustes necessários)
- [ ] Security scan detectou vulnerabilidades (fixes iterativos)

**Criar Validation Loop** (SE aplicável):

```bash
BRANCH=$(git branch --show-current | sed 's/\//-/g')

cat > .context/${BRANCH}_validation-loop.md <<'EOF'
# Validation Loop - Workflow 7a (Quality Gates)

**Data Início**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')
**Status**: 🔄 Em Progresso

## Iteração 1

**Gate**: [Code Review / Security Scan / Tests]
**Issue**: [Descrição do problema encontrado]
**Fix**: [Correção aplicada]
**Resultado**: ✅ SUCESSO | ❌ FALHA

EOF
```

**Benefícios**: Zero perda contexto, rastreabilidade 100%, meta-learnings emergem.

**Ref**: Workflow 6a (aprovado - "foi sensacional")

---

**Criado**: 2025-10-27 (modificado: 2025-11-08)
**Parte**: 7a de 11
**Próximo**: Workflow 7b
