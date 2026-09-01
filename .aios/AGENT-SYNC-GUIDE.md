# 🤖 AIOS Agent Sync Guide

**Versão**: 1.0.0
**Data**: 2026-01-27
**Propósito**: Manter sincronização entre agentes AIOS e contexto de sprint

---

## ⚠️ Problema Identificado

A cada execução de task, a sincronização com os agentes AIOS se perdia porque:
1. Cada ativação de agente não mantinha referência dos outros
2. Contexto do sprint era perdido
3. Status de tasks não persistia

**Solução**: Agent Registry + Context Persistence

---

## 📋 Agent Registry - Referência Rápida

### Todos os Agentes Disponíveis

| Agente | Comando | Especialidade |
|--------|---------|---|
| **AIOS Master** | `/AIOS:agents:aios-master` | Orquestração principal |
| **Dev (Dex)** | `/AIOS:agents:dev` | Full Stack Development |
| **QA (Quinn)** | `/AIOS:agents:qa` | Quality & Testing |
| **Architect** | `/AIOS:agents:architect` | System Design |
| **PM** | `/AIOS:agents:pm` | Product Management |
| **PO** | `/AIOS:agents:po` | Product Ownership |
| **SM (River)** | `/AIOS:agents:sm` | Scrum Mastery |
| **DevOps (Gage)** | `/AIOS:agents:devops` | GitHub & Deploy |
| **Analyst** | `/AIOS:agents:analyst` | Business Analysis |
| **Data Engineer** | `/AIOS:agents:data-engineer` | Database |
| **UX Expert** | `/AIOS:agents:ux-design-expert` | UX/UI Design |
| **Squad Creator** | `/AIOS:agents:squad-creator` | Squad Management |

---

## 🔄 Sprint 2 - Status Atual

### Tasks Concluídas ✅

```
Task #1: Story 2.1 - Full-Text Search
├─ Status: COMPLETED
├─ QA: PASSED ✅
└─ Dev Artifacts:
   ├─ Migration: 20260127_001_add_fulltext_search.sql
   ├─ Hook: useSearch.ts
   └─ Component: SearchInput.tsx

Task #2: Story 2.2 - Soft Delete
├─ Status: COMPLETED
├─ QA: PASSED ✅
└─ Dev Artifacts:
   ├─ Migration: 20260127_002_add_soft_delete.sql
   ├─ Hook: useSoftDelete.ts
   ├─ Component: RestoreButton.tsx
   └─ Note: RLS policies precisam update via Supabase Dashboard
```

### Tasks Pending ⏳

```
Task #3: Story 2.3 - Centralizar Design Tokens
├─ Status: PENDING
├─ Assigned to: @dev (Dex)
└─ Next: Ativar /AIOS:agents:dev

Task #4: Story 2.4 - Trigger de Validação
├─ Status: PENDING
├─ Assigned to: @dev (Dex)
└─ Next: Após 2.3 completo
```

---

## 🚀 Como Usar - Workflow Recomendado

### 1. Restaurar Sincronização (Início de Sessão)

```bash
# Ler este arquivo para entender o contexto
cat .aios/AGENT-SYNC-GUIDE.md

# Ler o Agent Registry para ver status
cat .aios/agent-registry.json
```

### 2. Continuar Sprint 2

**Próximo passo**: Ativar Dev para Story 2.3

```
/AIOS:agents:dev
```

Dex vai ler este contexto e saber:
- ✅ Stories 2.1 e 2.2 já estão completas e QA passou
- ⏳ Story 2.3 (Design Tokens) é a próxima
- A cada task, chamar @qa para validação

### 3. QA Validation Loop

Após @dev completar cada story:

```
/AIOS:agents:qa
```

Quinn vai validar a implementação e retornar PASS/CONCERNS/FAIL

---

## 📊 Sprint 2 - Overview

| Story | Título | Pontos | Status | Dev | QA |
|-------|--------|--------|--------|-----|-----|
| 2.1 | Full-Text Search | 5 | ✅ DONE | Dex | Quinn ✅ |
| 2.2 | Soft Delete | 5 | ✅ DONE | Dex | Quinn ✅ |
| 2.3 | Design Tokens | 3 | ⏳ PENDING | Dex | Quinn ⏳ |
| 2.4 | Trigger Validação | 3 | ⏳ PENDING | Dex | Quinn ⏳ |

**Total Story Points**: 16
**Completed**: 10
**Remaining**: 6

---

## 🔐 Context Persistence

O arquivo `agent-registry.json` mantém:

```json
{
  "current_sprint": { /* Sprint 2 tasks */ },
  "active_agents": { /* Lista de agentes */ },
  "context_persistence": {
    "last_active_agent": "qa",
    "last_task_completed": "2.2-soft-delete",
    "session_token": "sess_bible-study_2026-01-27",
    "restore_on_activation": true
  }
}
```

**Como funciona**:
1. Cada vez que um agente é ativado, lê este arquivo
2. Entende o contexto do sprint
3. Sabe que tarefas foram completadas
4. Continua de onde parou

---

## ⚡ Quick Start - Próximas Ações

### Agora:
1. Ativar `/AIOS:agents:dev` para Story 2.3
2. Dev implementa Design Tokens
3. Chamar `/AIOS:agents:qa` para validar
4. Repetir para Story 2.4

### Fim de Sprint:
1. Todas as 4 stories DONE + QA PASSED
2. Chamar `/AIOS:agents:devops` para push
3. Criar commit com todas as mudanças
4. Criar PR
5. Merge para main

---

## 📝 Notas Importantes

### RLS Policies (Story 2.2)
- [ ] Atualizar RLS policies em Supabase Dashboard
- [ ] Adicionar filtro `deleted_at IS NULL` em SELECT policies
- [ ] Testar que queries antigas não retornam soft-deleted

### Design Tokens (Story 2.3)
- Centralizar cores, tamanhos, espaçamento
- Refatorar ColorMap para usar tokens
- 100% coverage de tokens em componentes

### Trigger (Story 2.4)
- Validar que ambos estudos pertencem ao mesmo user_id
- Prevenir links entre estudos de usuários diferentes

---

## 🔗 Referências

- `.aios/agent-registry.json` - Agent registry atual
- `stories/epic-technical-debt.md` - Epic de sprint
- `TaskList` - Tasks em progresso

---

**Mantém esta file atualizado ao longo do sprint para evitar perda de sincronização!**
