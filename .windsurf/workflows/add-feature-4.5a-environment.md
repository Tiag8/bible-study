---
description: Workflow 4.5a - GATE 0 Environment Validation (SEMPRE PRIMEIRO)
auto_execution_mode: 1
---

# Workflow 4.5a: Environment Validation

> **Parte de**: Workflow 4.5 Pre-Implementation Gates (decomposto)
> **OBRIGATÓRIO**: SEMPRE executar ANTES de qualquer outro GATE

---

## 🎯 Objetivo

Validar ambiente de desenvolvimento ANTES de qualquer código.

**Por quê primeiro**: ADR-025 (90x ROI, recorrência 3+ features - system env vars sobrescrevem .env local)

---

## 🚨 GATE 0: Environment Validation

### ✅ Checklist

**1. System Env Conflicts**
```bash
./scripts/validate-env-conflicts.sh
```
- [ ] Script passou sem erros (exit 0)
- [ ] SE exit 1: Limpar conflicts (`unset VITE_*`)
- [ ] SE exit 0: Prosseguir

**2. Schema Validation**
```bash
./scripts/validate-schema-first.sh
```
- [ ] DB real como source of truth
- [ ] Migrations aplicadas e sincronizadas
- [ ] Types regenerados após migrations
- [ ] SE failed: Executar REGRA #8 checklist completo

### 🔴 BLOQUEIO ABSOLUTO

**SE GATE 0 FALHOU**: ⛔ PARAR → Corrigir → Re-executar → ENTÃO outros GATEs

### 📝 Log

```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] GATE 0: Environment - ✅ APROVADO" >> .context/${BRANCH_PREFIX}_attempts.log
```

---

## ✅ Próximo

GATE 0 Aprovado → Executar GATEs aplicáveis:
- **SE AI/Gemini**: Workflow 4.5c (Tool Validation)
- **SE Edge Function**: Workflow 4.5d (Runtime)
- **SE Migration/FK**: Workflow 4.5b (Database)
- **SEMPRE**: Workflow 4.5e (Code Quality) + 4.5f (QA)

---

**Versão**: 1.0.0 | **Origem**: Decomposição Workflow 4.5 (Pareto fix-coach-web)
