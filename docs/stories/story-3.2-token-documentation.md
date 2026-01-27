# Story 3.2: Documentar Padrões de Uso de Design Tokens

**Story ID:** STORY-3.2
**Epic:** EPIC-001 (Resolução de Débitos Técnicos)
**Sprint:** 3
**Pontos:** 3
**Status:** 📋 READY FOR DEVELOPMENT

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

- [ ] **3.2.1** Criar `DESIGN_TOKENS_GUIDE.md` com anatomia completa
- [ ] **3.2.2** Adicionar exemplos práticos de refatoração
- [ ] **3.2.3** Criar `TOKEN_QUICK_REFERENCE.md` (cheat sheet)
- [ ] **3.2.4** Adicionar screenshots/diagrama de hierarquia
- [ ] **3.2.5** Atualizar README com referência ao guia
- [ ] **3.2.6** Revisar ortografia e clareza

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
