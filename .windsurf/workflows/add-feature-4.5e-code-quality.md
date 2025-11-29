---
description: Workflow 4.5e - Code Quality Gates (File Size + Anti-Over-Engineering)
auto_execution_mode: 1
---

# Workflow 4.5e: Code Quality Validation

> **Parte de**: Workflow 4.5 Pre-Implementation Gates (decomposto)
> **Pré-requisito**: GATE 0 (4.5a) APROVADO
> **QUANDO**: SEMPRE - antes de criar código novo

---

## 🎯 Objetivo

Validar qualidade de código ANTES de implementar.

---

## 🛡️ GATE 4: File Size Limit

### 🚨 QUANDO EXECUTAR
- Arquivo novo > 500 linhas
- Modificação aumenta arquivo > 500L

### ✅ Checklist

**1. Context Decay Evidence**
- **Fonte**: NPR/Medium 2025 - "LLM esquece contexto em arquivos 300+ linhas"
- **Caso Real**: Handler 1,491L causou inconsistências

**2. File Size Check**
```bash
wc -l src/path/to/file.ts
# Se > 500L, considerar divisão
```

**3. Divisão Proposta (se > 500L)**
```typescript
// Exemplo: gemini-chat-handler-v2.ts (1,491L)
// DIVIDIR EM:
// - gemini-tools-habits.ts (275L)
// - gemini-tools-stats.ts (186L)
// - handler-v2.ts (270L - apenas orchestration)
```

**4. Alternativas**
- [ ] Extrair utils/helpers para _shared/
- [ ] Extrair constants para arquivo separado
- [ ] Extrair types para types.ts

### 🟡 AVISO (não bloqueio)

**SE arquivo > 500L**: ⚠️ CONSIDERAR divisão. Documentar razão se não dividir.

---

## 🛡️ GATE 5: Anti-Over-Engineering

### 🚨 QUANDO EXECUTAR
- ANTES de criar novo módulo/classe/abstração
- Feature que adiciona 3+ arquivos

### ✅ Checklist

**1. Funcionalidade Nativa Existe?**
- [ ] Gemini AI já faz? (parsing, extração, NLP)
- [ ] React/Supabase tem built-in? (cache, RLS, auth)
- [ ] Biblioteca instalada cobre? (Zod, Recharts)

**2. Gap Real Comprovado?**
```typescript
// ✅ TESTE OBRIGATÓRIO
// 1. Testar solução atual
// 2. Falhou em caso REAL (não hipotético)
// 3. Gap é SISTÊMICO (3+ casos) ou pontual?
```

**3. Alternativas Simples?**
- [ ] Ajustar prompt resolve?
- [ ] Parâmetro/config resolve?
- [ ] Doc adicional resolve?

**4. Script YAGNI Validation**
```bash
./scripts/validate-yagni.sh "Feature X" "Solução proposta"
```

**5. Red Flags (bloqueio imediato)**
- ❌ Parser/Extractor custom → Gemini já faz
- ❌ Cache custom → React Query já tem
- ❌ Validation layer → Zod já valida
- ❌ Auth custom → Supabase já tem
- ❌ "Futuramente vai precisar..." (YAGNI violation)

### 🔴 BLOQUEIO

**SE 1+ red flag**: ⛔ PARAR. Usar funcionalidade nativa.

---

## 📝 Log

```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] GATE 4+5: Code Quality - ✅ APROVADO" >> .context/${BRANCH_PREFIX}_attempts.log
```

---

## 📚 Referências

- **CLAUDE.md**: REGRA #11 (Anti-Over-Engineering)
- **ML-CONTEXT-10**: Context Decay 300+ linhas
- **ADR-021**: Pre-Implementation Quality Gates

---

**Versão**: 1.0.0 | **Origem**: Decomposição Workflow 4.5 (Pareto fix-coach-web)
