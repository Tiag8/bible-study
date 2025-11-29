---
description: Workflow 4.5f - QA & Pre-Deploy Gates (Performance + Pre-Deploy)
auto_execution_mode: 1
---

# Workflow 4.5f: QA & Pre-Deploy Validation

> **Parte de**: Workflow 4.5 Pre-Implementation Gates (decomposto)
> **Pré-requisito**: GATE 0 (4.5a) APROVADO
> **QUANDO**: SEMPRE - obrigatório antes de Workflow 5a

---

## 🎯 Objetivo

Validar performance e deploy readiness ANTES de código.

---

## 🛡️ GATE 7: Performance Validation

### 🚨 QUANDO EXECUTAR
- TODAS features (obrigatório)
- Modificação > 100 linhas

### ✅ Checklist

**1. Console.log Scan**
```bash
grep -r "console.log" src/ --exclude-dir=node_modules || echo "✅ No console.logs"
```
- [ ] 0 console.logs em src/

**2. Bundle Size Check**
```bash
npm run build
du -sh dist/
```
- [ ] Bundle size < 500KB
- [ ] Se > 500KB: Identificar bloat

**3. Performance Budget**
- [ ] Dashboard load: < 2s target
- [ ] Coach Chat: < 5s target
- [ ] Habit Logging: Instantâneo

### 🔴 BLOQUEIO

**SE console.logs > 0 OU bundle > 500KB**: ⛔ PARAR. Limpar antes de prosseguir.

---

## 🛡️ GATE 8: Pre-Deploy Checklist

### 🚨 QUANDO EXECUTAR
- Features que alteram deployment
- OBRIGATÓRIO antes Workflow 5a

### ✅ Checklist

**1. Build Success**
```bash
npm run build
```
- [ ] Build completa sem erros

**2. TypeScript Check**
```bash
npx tsc --noEmit
```
- [ ] 0 type errors

**3. Lint Pass**
```bash
npx eslint "src/**/*.{ts,tsx}"
```
- [ ] 0 lint errors

**4. Tests Pass**
```bash
npm run test 2>/dev/null || echo "N/A"
```
- [ ] Todos testes passam OU N/A

**5. Environment Variables**
- [ ] .env.example atualizado (se novos secrets)
- [ ] Supabase secrets configurados

**6. Migrations Ready**
- [ ] Migration testada localmente
- [ ] Rollback migration criada (se breaking)

### 🔴 BLOQUEIO

**SE 1+ check FALHOU**: ⛔ PARAR. Corrigir antes de Workflow 5a.

---

## 📝 Log

```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] GATE 7+8: QA & Pre-Deploy - ✅ APROVADO" >> .context/${BRANCH_PREFIX}_attempts.log
```

---

## ✅ Aprovação Final

**9 Gates Validados**:
- [ ] GATE 0: Environment (4.5a) - OBRIGATÓRIO
- [ ] GATE 1: Tool Validation (4.5c) - se AI
- [ ] GATE 2: Runtime (4.5d) - se Edge Function
- [ ] GATE 3+6: Database (4.5b) - se migration
- [ ] GATE 4+5: Code Quality (4.5e) - SEMPRE
- [ ] GATE 7+8: QA & Pre-Deploy (4.5f) - OBRIGATÓRIO

**Se TODOS aprovados**: ✅ Prosseguir Workflow 5a

**Se 1+ bloqueado**: ⛔ PARAR. Corrigir antes de codificar.

---

## 📚 Referências

- **CLAUDE.md**: REGRA #25 (Deploy Approval)
- **ADR-021**: Pre-Implementation Quality Gates
- **Guide**: `docs/guides/SCHEMA-FIRST-CHECKLIST.md`

---

**Versão**: 1.0.0 | **Origem**: Decomposição Workflow 4.5 (Pareto fix-coach-web)
