# Git Hooks Setup Guide - Life Track Growth

**Objetivo**: Automatizar validações críticas em workflows via git hooks.

**Status**: 🚧 PLANEJADO (não implementado ainda)

**Data**: 2025-11-20 | **Versão**: 1.0

---

## 📋 ÍNDICE

1. [Hooks Planejados](#hooks-planejados)
2. [Implementação Manual](#implementação-manual)
3. [Roadmap](#roadmap)
4. [Scripts Disponíveis](#scripts-disponíveis)
5. [Referências](#referências)

---

## 🎯 Hooks Planejados (3)

### 1. Pre-Workflow 2b: GATE 1 Validation

**Script**: `scripts/validate-gate-1-executed.sh`

**Trigger**: ANTES iniciar Workflow 2b (Technical Design)

**Validação**: GATE 1 Reframing executado? (attempts.log contém "GATE 1.*Reframing")

**Enforcement**: BLOQUEIA Workflow 2b SE GATE 1 ausente

**Por quê**:
- Taxa sucesso: 100% (3/3 features ZERO pivots)
- ROI: 10x+ (15min reframing vs 5-50h pivots)
- CSF: Critical Success Factor (ADR-031)

**Implementação Futura**:
```bash
# .git/hooks/pre-workflow-2b
#!/bin/bash
echo "🚨 Validando GATE 1 Reframing (CSF)..."
./scripts/validate-gate-1-executed.sh || exit 1
```

**Status**: ✅ Integrado em Workflow 2b (markdown), git hook NÃO implementado

---

### 2. Pre-Workflow 5a Fase 10: Screenshot ANTES

**Script**: `scripts/validate-screenshot-gate.sh 5a`

**Trigger**: ANTES iniciar implementação (Fase 10)

**Validação**: Screenshot ANTES existe? (`screenshots/before/` não vazio)

**Enforcement**: BLOQUEIA implementação SE baseline ausente

**Por quê**:
- Previne: "Esqueci como era ANTES"
- Garante: Comparação visual objetiva
- Documentação: Mudanças visuais rastreáveis

**Implementação Futura**:
```bash
# Workflow 5a Fase 9.5 (já integrado)
./scripts/validate-screenshot-gate.sh 5a || exit 1
```

**Status**: ✅ Integrado em Workflow 5a Fase 9.5 (markdown)

---

### 3. Pre-Workflow 6a Fase 12.5: Screenshot DEPOIS

**Script**: `scripts/validate-screenshot-gate.sh 6a`

**Trigger**: ANTES Reframing visual (Fase 12.5)

**Validação**: Screenshots ANTES + DEPOIS existem?

**Enforcement**: BLOQUEIA Reframing SE comparação impossível

**Por quê**:
- Reframing visual requer comparação objetiva
- ANTES vs DEPOIS = validação concreta
- Evita debates subjetivos ("acho que mudou X")

**Implementação Futura**:
```bash
# Workflow 6a Fase 12 (já integrado)
./scripts/validate-screenshot-gate.sh 6a || exit 1
```

**Status**: ✅ Integrado em Workflow 6a Fase 12 (markdown)

---

## 🛠️ Implementação Manual (Quando Necessário)

### Passo 1: Tornar hook executável
```bash
chmod +x .git/hooks/pre-workflow-2b
```

### Passo 2: Testar hook
```bash
.git/hooks/pre-workflow-2b
```

### Passo 3: Validar bloqueio
SE validação falhar, deve `exit 1` (bloquear workflow).

---

## 🗺️ Roadmap

### v1.0 (Atual) ✅
- ✅ Scripts criados (validate-gate-1, validate-screenshot-gate)
- ✅ Integração markdown workflows (5a, 6a, 2b)
- ⏸️ Git hooks NÃO implementados (executar manual)

### v2.0 (Futuro) 🚧
- 🚧 Git hooks automáticos
- 🚧 Pre-commit validações
- 🚧 Pre-push quality gates

**Decisão**: v1.0 suficiente (validações manuais OK por enquanto)

**Razão**:
1. Baixo volume features (não precisa automação ainda)
2. Workflows markdown já referenciam scripts
3. Adicionar git hooks quando volume aumentar (3+ devs)

---

## 📊 Scripts Disponíveis

| Script | Workflow | Validação | Status |
|--------|----------|-----------|--------|
| `validate-gate-1-executed.sh` | 2b (pre-req) | GATE 1 Reframing CSF | ✅ Criado |
| `validate-screenshot-gate.sh 5a` | 5a Fase 9.5 | Screenshot ANTES | ✅ Criado |
| `validate-screenshot-gate.sh 6a` | 6a Fase 12 | Screenshots ANTES+DEPOIS | ✅ Criado |
| `validate-screenshot-gate.sh 9a` | 9a Pre-merge | Evidências (não crítico) | ✅ Criado |
| `validate-yagni.sh` | 2b Fase 3.5 | Anti-Over-Engineering | ✅ Criado |
| `context-load-all.sh` | Todos Fase 0 | Load context unificado | ✅ Criado |

**Total**: 6 scripts, TODOS operacionais

---

## 🎯 Como Usar (Manual)

### Workflow 2b (Technical Design)
```bash
# ANTES iniciar design técnico
./scripts/validate-gate-1-executed.sh
```

**Se passar**: Prosseguir Workflow 2b
**Se falhar**: Executar Workflow 1 Fase 1.5 (Reframing) primeiro

---

### Workflow 5a Fase 9.5 (Implementation)
```bash
# ANTES implementar (Fase 10)
./scripts/validate-screenshot-gate.sh 5a
```

**Se passar**: Implementar (Fase 10)
**Se falhar**: Tirar screenshot ANTES → Salvar em `screenshots/before/`

---

### Workflow 6a Fase 12 (Validation)
```bash
# ANTES Reframing Visual (Fase 12.5)
./scripts/validate-screenshot-gate.sh 6a
```

**Se passar**: Reframing Visual (Fase 12.5)
**Se falhar**: Tirar screenshot DEPOIS → Salvar em `screenshots/after/`

---

### Workflow 9a (Pre-Merge)
```bash
# ANTES merge (documentação)
./scripts/validate-screenshot-gate.sh 9a
```

**Resultado**: SEMPRE passa (não bloqueante), apenas avisa se screenshots ausentes.

---

## 📁 Convenção Screenshots

### Nomenclatura
```
screenshots/before/ANTES-[feature]-[componente]-[timestamp].png
screenshots/after/DEPOIS-[feature]-[componente]-[timestamp].png
```

### Exemplos
```bash
# ANTES
screenshots/before/ANTES-landing-hero-20251120-143022.png
screenshots/before/ANTES-landing-pricing-20251120-143045.png

# DEPOIS
screenshots/after/DEPOIS-landing-hero-20251120-154510.png
screenshots/after/DEPOIS-landing-pricing-20251120-154532.png
```

### Best Practices
1. **Timestamp**: `YYYYMMDD-HHMMSS` (ordenação cronológica)
2. **Feature**: Nome feature sem `feat/` (ex: `landing`, `habits`, `assessment`)
3. **Componente**: Componente específico (ex: `hero`, `header`, `pricing`)
4. **Formato**: PNG (melhor qualidade) ou JPG (menor tamanho)

---

## 🚨 Red Flags

### ❌ NÃO fazer:
1. Pular GATE 1 → Implementar direto (70-90% chance pivot)
2. Implementar sem screenshot ANTES → Perder baseline
3. Reframing Visual sem screenshots → Debate subjetivo
4. Adicionar git hooks agora → Over-engineering (baixo volume)

### ✅ Fazer:
1. Executar scripts MANUALMENTE (Workflows markdown referenciam)
2. Documentar screenshots (convenção acima)
3. Adicionar git hooks SOMENTE quando volume aumentar (3+ devs)

---

## 📚 Referências

### ADRs
- **ADR-031**: GATE 1 Reframing CSF Non-Negotiable
- **ADR-029**: Screenshot-First Development
- **ADR-021**: Pre-Implementation Gates

### REGRAS (CLAUDE.md)
- **REGRA #26**: GATE 1 Non-Negotiable (projeto)
- **REGRA #3**: Reframing Antes de RCA (global)

### Workflows
- **Workflow 1**: Requirements Analysis (Fase 1.5 - Reframing)
- **Workflow 2b**: Technical Design (GATE 1 pre-req)
- **Workflow 5a**: Implementation (Fase 9.5 - Screenshot ANTES)
- **Workflow 6a**: User Validation (Fase 12 - Screenshot DEPOIS)
- **Workflow 9a**: Pre-Merge (Evidências visuais)

---

## 🔄 Changelog

### v1.0.0 (2025-11-20)
- ✅ Criação inicial
- ✅ 3 hooks planejados (GATE 1, Screenshot ANTES/DEPOIS)
- ✅ 6 scripts operacionais
- ✅ Roadmap v1.0 (manual) vs v2.0 (automático)
- ✅ Convenção screenshots
- ✅ Integração workflows markdown

---

**Última Atualização**: 2025-11-20
**Versão**: 1.0.0
**Status**: Scripts criados, hooks planejados (não implementados)
