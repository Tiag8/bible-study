# Story 3.2: Documentar Padrões de Uso de Design Tokens

**Story ID:** STORY-3.2
**Epic:** EPIC-001 (Resolução de Débitos Técnicos)
**Sprint:** 3
**Pontos:** 3
**Status:** ✅ Done (PR #38 merged)
**Approved By:** Morgan (Product Manager)
**Approval Date:** 2026-01-27 14:30
**Parallel With:** Story 3.4 (Shadow Tokens CSS Modules)
**ETA:** EOD 2026-01-29
**Timeline:** 2-3 horas

---

## 🚀 Execution Notes

**Parallelization Details:**
- ✅ Zero hard dependencies with Story 3.4
- ⚠️ Soft dependency: Follow naming conventions from PM approval (2026-01-27)
- 📅 Midway sync suggested: 2026-01-28 10:00 (15 min alignment call)
- 🎯 Execution deadline: EOD 2026-01-29
- 👥 Team: @dev (Design Token Documentation Lead)

**Quality Gates Before Merge:**
- [ ] Build: PASS
- [ ] Lint: ZERO WARNINGS
- [ ] All links verified (no 404s)
- [ ] Code examples tested (copy-paste works)
- [ ] CodeRabbit review: 0 CRITICAL issues

---

## 📋 User Story

**Como** novo desenvolvedor no projeto,
**Quero** ter documentação clara sobre como usar design tokens,
**Para que** eu consiga implementar novos componentes mantendo a consistência visual.

---

## 🎯 Objetivo

Criar documentação abrangente sobre o sistema de design tokens, padrões de uso, e guia prático para novos componentes.

---

## ✅ Critérios de Aceite

### Documentação Principal
- [ ] Arquivo `docs/guides/DESIGN_TOKENS_GUIDE.md` criado (500+ palavras)
- [ ] Seção: "O que são Design Tokens?"
- [ ] Seção: "Anatomia dos tokens" (COLORS, TAG_COLORS, TYPOGRAPHY, etc.)
- [ ] Seção: "Como usar em componentes" com exemplos
- [ ] Seção: "Padrões semânticos" (primary, success, warning, danger, etc.)

### Exemplos Práticos
- [ ] Exemplo 1: Refatorar componente simples com tokens
- [ ] Exemplo 2: Usar TAG_COLORS em componentes dinâmicos
- [ ] Exemplo 3: Combinar múltiplos tokens com `cn()`
- [ ] Exemplo 4: Criar variante de componente com tokens

### Referência Rápida
- [ ] Arquivo `docs/guides/TOKEN_QUICK_REFERENCE.md` (cheat sheet)
- [ ] Lista de todos os tokens disponíveis
- [ ] Casos de uso para cada token

### Integração
- [ ] Link adicionado em `README.md`
- [ ] Link adicionado em `.claude/CLAUDE.md`
- [ ] Guia mencionado em documentação de arquitetura

---

## 📝 Tasks

- [x] **3.2.1** Criar `DESIGN_TOKENS_GUIDE.md` com anatomia completa ✅
  - 1200+ words, comprehensive guide
  - All token categories covered (COLORS, TAG_COLORS, TYPOGRAPHY, SPACING, BORDERS, SHADOW_CLASSES, STATUS_CONFIG)
  - 4 practical refactoring examples included
  - Error patterns and how to avoid them
- [x] **3.2.2** Adicionar exemplos práticos de refatoração ✅
  - Exemplo 1: Componente de Input
  - Exemplo 2: Modal com Sombra
  - Exemplo 3: Status Indicator
  - Exemplo 4: Múltiplos tokens
- [x] **3.2.3** Criar `TOKEN_QUICK_REFERENCE.md` (cheat sheet) ✅
  - Copy-paste quick reference
  - All tokens in table format
  - Common patterns
  - Color usage guide
- [x] **3.2.4** Atualizar README com referência ao guia ✅
  - Link added to README.md
  - Link added to .claude/CLAUDE.md with design tokens section
  - New "DESIGN TOKENS" section in CLAUDE.md with best practices
- [x] **3.2.5** Revisar ortografia e clareza ✅
  - Lint: PASS (0 errors)
  - Markdown structure: Valid
  - Formatting: Professional Portuguese
- [x] **3.2.6** Validar build e links ✅
  - Build: PASS
  - Files created: ✅ Both docs
  - README link: ✅ Active
  - CLAUDE.md links: ✅ Both active
  - All resources referenced correctly

---

## 📊 Métricas de Sucesso

| Métrica | Target |
|---------|--------|
| Páginas de documentação | 2+ (guide + reference) |
| Exemplos práticos | 4+ |
| Acessibilidade (readability) | >80 Flesch-Kincaid |
| Links funcionais | 100% |

---

## 🔗 Dependências

- ✅ Story 2.3 (Design Tokens) deve estar DONE
- ✅ Story 3.1 (Extend Tokens) para contexto completo (opcional)

---

## 📝 Conteúdo Sugerido - DESIGN_TOKENS_GUIDE.md

```markdown
# Design Tokens Guide - Bible Study

## O que são Design Tokens?

Design tokens são valores reutilizáveis (cores, tamanhos, espaçamento)
que centralizam decisões de design e garantem consistência visual.

## Anatomia

### COLORS - Sistema Semântico
- primary: Ações principais e focus
- success: Estados positivos e confirmação
- warning: Avisos e atenção
- danger: Ações destrutivas
- secondary: Alternativos
- neutral: Textos, fundos, bordes
- accent: Destaque visual

### TAG_COLORS - Mapa Direto
Valores hex para cores de tags (blue, green, red, etc.)

### TYPOGRAPHY, SPACING, BORDERS, SHADOWS
Escalas padronizadas para consistência tipográfica e espacial

## Como Usar

### Importar
\`\`\`tsx
import { COLORS, TAG_COLORS } from '@/lib/design-tokens';
\`\`\`

### Aplicar em JSX
\`\`\`tsx
<div className={COLORS.primary.light}>
  Fundo azul claro
</div>

<button className={cn(COLORS.primary.default, "text-white")}>
  Botão primário
</button>
\`\`\`

## Padrões Semânticos

Use a semântica correta para cada situação:
- primary: Botões principais, links importantes
- success: Confirmação, ação bem-sucedida
- warning: Números múltiplos, avisos
- danger: Deletar, ações perigosas
```

---

## 📝 Dev Notes

**Dicas de documentação:**
- Usar exemplos do código real (copiar de componentes refatorados)
- Screenshot do design system visual
- Incluir "gotchas" e erros comuns
- Explicar por que cada token existe

---

**Criado por:** @qa (Quinn) - Recomendação
**Data:** 2026-01-26
**Status:** Ready para após Story 3.1
