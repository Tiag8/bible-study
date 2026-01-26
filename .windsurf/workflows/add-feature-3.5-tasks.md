# Workflow 3.5: Tasks Breakdown

**Versão**: 1.0.0
**Criado**: 2025-12-28
**Objetivo**: Gerar breakdown atômico de tasks ANTES de validação (WF 4.5)
**Fonte**: GitHub Spec Kit (2025) - TASKS phase

---

## 📋 PRÉ-REQUISITOS

- [ ] Workflow 3 (Risk Analysis) executado
- [ ] `{branch}_spec.md` preenchido (WF 1)
- [ ] `{branch}_plan.md` preenchido (WF 2b)
- [ ] Riscos identificados e mitigados (WF 3)

---

## 🎯 OBJETIVO

Transformar o PLAN em TASKS atômicas executáveis com:
- Ordem de dependência clara
- Tasks paralelas marcadas com `[P]`
- Cada task < 2h de trabalho
- Sincronização com TodoWrite do Claude Code

---

## FASE 1: CARREGAR CONTEXTO

### 1.1 Ler Artefatos Existentes

```bash
# Ler spec e plan
cat .context/${BRANCH}_spec.md
cat .context/${BRANCH}_plan.md
cat .context/${BRANCH}_decisions.md
```

### 1.2 Identificar User Stories

Extrair do `{branch}_spec.md`:
- US-1, US-2, US-3... (cada user story)
- FR-1, FR-2... (functional requirements)
- Critérios de aceite

---

## FASE 2: GERAR TASKS

### 2.1 Para CADA User Story

**Regras**:
1. Cada task deve ser atômica (< 2h trabalho)
2. Dependências explícitas: `(dep: T-1.1, T-1.2)`
3. Tasks paralelas marcadas: `[P]`
4. Path de arquivo quando aplicável

**Template**:
```markdown
### US-1: [Título da User Story]

- [ ] T-1.1: [Descrição atômica] `(dep: nenhuma)` → `path/to/file.ts`
- [ ] T-1.2: [Descrição atômica] `(dep: T-1.1)` → `path/to/file.ts`
- [ ] T-1.3: [Descrição atômica] `(dep: T-1.1)` `[P]` → `path/to/other.ts`
```

### 2.2 Criar Dependency Graph

```
T-1.1 ─────▶ T-1.2 ─────▶ T-1.4
       └───▶ T-1.3 [P] ──┘
```

---

## FASE 3: PREENCHER {branch}_tasks.md

### 3.1 Template Completo

```markdown
# Tasks: [Feature Name]

**Branch**: `{branch}`
**Created**: YYYY-MM-DD HH:MM
**Spec**: [{branch}_spec.md](./{branch}_spec.md)
**Plan**: [{branch}_plan.md](./{branch}_plan.md)

---

## Task Breakdown

### US-1: [User Story do spec.md]

| Task | Descrição | Deps | Paralela | Arquivo | Status |
|------|-----------|------|----------|---------|--------|
| T-1.1 | [Descrição] | - | - | `src/...` | [ ] |
| T-1.2 | [Descrição] | T-1.1 | - | `src/...` | [ ] |
| T-1.3 | [Descrição] | T-1.1 | [P] | `src/...` | [ ] |

### US-2: [User Story do spec.md]

| Task | Descrição | Deps | Paralela | Arquivo | Status |
|------|-----------|------|----------|---------|--------|
| T-2.1 | [Descrição] | T-1.2, T-1.3 | - | `src/...` | [ ] |

---

## Dependency Graph

\`\`\`
T-1.1 ─────▶ T-1.2 ─────▶ T-2.1
       └───▶ T-1.3 [P] ──┘
\`\`\`

---

## Critérios de Done por Task

### T-1.1: [Nome]
- [ ] Código implementado
- [ ] Testes passando
- [ ] Sem erros TypeScript

---

## Progress Tracking

| Task | Status | Notas | Updated |
|------|--------|-------|---------|
| T-1.1 | [ ] Pending | | |
| T-1.2 | [ ] Pending | | |

**Legenda**: [ ] Pending | [~] In Progress | [x] Done | [!] Blocked
```

---

## FASE 4: SINCRONIZAR COM TODOWRITE ⭐

### 4.1 Converter Tasks para TodoWrite

**OBRIGATÓRIO**: Após preencher `{branch}_tasks.md`, sincronizar com TodoWrite do Claude Code.

```typescript
// Exemplo de sincronização
TodoWrite([
  { content: "T-1.1: Criar componente X", status: "pending", activeForm: "Criando componente X" },
  { content: "T-1.2: Implementar hook Y", status: "pending", activeForm: "Implementando hook Y" },
  { content: "T-1.3: Adicionar testes Z [P]", status: "pending", activeForm: "Adicionando testes Z" },
])
```

### 4.2 Regras de Sincronização

| {branch}_tasks.md | TodoWrite |
|-------------------|-----------|
| `[ ] T-1.1: ...` | `status: "pending"` |
| `[~] T-1.1: ...` | `status: "in_progress"` |
| `[x] T-1.1: ...` | `status: "completed"` |
| `[!] T-1.1: ...` | `status: "pending"` + nota "BLOCKED" |

### 4.3 Manter Sincronizado

Durante WF 5a (Implementation):
1. Ao iniciar task → marcar `in_progress` em AMBOS
2. Ao concluir task → marcar `completed` em AMBOS
3. Se bloqueado → marcar `[!]` no tasks.md + nota no TodoWrite

---

## FASE 5: VALIDAR TASKS

### 5.1 Checklist Pré-WF4.5

- [ ] Todas US do spec.md têm tasks?
- [ ] Todas tasks têm dependências explícitas?
- [ ] Tasks paralelas marcadas com `[P]`?
- [ ] Cada task < 2h trabalho?
- [ ] Arquivos target identificados?
- [ ] TodoWrite sincronizado?

### 5.2 Logar Conclusão

```bash
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] WORKFLOW: 3.5 (Tasks) - COMPLETO" >> .context/${BRANCH}_attempts.log
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] ARTIFACT: ${BRANCH}_tasks.md preenchido" >> .context/${BRANCH}_attempts.log
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] ARTIFACT: TodoWrite sincronizado com ${N} tasks" >> .context/${BRANCH}_attempts.log
```

---

## 📊 OUTPUT

| Artefato | Status |
|----------|--------|
| `{branch}_tasks.md` | Preenchido |
| TodoWrite | Sincronizado |
| `{branch}_attempts.log` | Atualizado |

---

## ➡️ PRÓXIMO

**Workflow 4.5**: Pre-Implementation Gates (VALIDATE spec↔plan↔tasks)

---

## 📋 CHECKLIST FINAL

- [ ] `{branch}_tasks.md` criado?
- [ ] Todas US têm tasks?
- [ ] Dependency graph claro?
- [ ] TodoWrite sincronizado?
- [ ] Logged em attempts.log?

**SE TUDO OK**: Prosseguir para Workflow 4.5
**SE FALHOU**: Revisar plan.md ou spec.md

---

**Versão**: 1.0.0 | **Chars**: ~4,500
