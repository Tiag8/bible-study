---
description: Workflow Add-Feature (5a/9) - Implementation Core (Código + TDD + Testes)
auto_execution_mode: 1
---

## ⚠️ REGRA CRÍTICA: USO MÁXIMO DE AGENTES

**SEMPRE usar máximo de agentes em paralelo** (Fase 10: 4+, Fase 11: 3+).

---

## 📚 Pré-requisito: Consultar Documentação Base

Antes de iniciar qualquer planejamento ou ação, SEMPRE ler:
- `docs/PLAN.md` - Visão estratégica atual
- `docs/TASK.md` - Status das tarefas em andamento
- `docs/pesquisa-de-mercado/` - Fundamentos científicos

---

# Workflow 5a/9: Implementation Core (Implementação)

Este é o **quinto workflow (parte A)** de 9 etapas modulares para adicionar uma nova funcionalidade.

**O que acontece neste workflow:**
- Fase 10: Implementação (Código + TDD + Pequenos Diffs)
- Fase 11: Integração de Componentes
- GATE 2: Validação de Implementação Core

**⚠️ IMPORTANTE**: Este workflow **NÃO comita código ainda**!
- Código é implementado e testado automaticamente
- MAS precisa de validação manual do usuário (Workflow 6)
- Só depois de usuário aprovar → Code Review → Security → Commit

**🔀 IMPORTANTE - Branch Isolation**:
- Branch foi criada com **sistema inteligente** no Workflow 4 (Setup)
- ⚠️ NUNCA commite código não relacionado nesta branch!
- ⚠️ Se você tem código em outra branch, NÃO misture aqui!
- ✅ Todos os commits incrementais devem estar NESTA branch
- 🚨 Código não commitado em branch errada = problema sério!

---

## 💻 Fase 10: Implementação (Pequenos Diffs + TDD)

**PRINCÍPIOS DE IMPLEMENTAÇÃO**:
- ✅ **Pequenos diffs**: Commits incrementais e frequentes (8+ commits)
- ✅ **TDD quando apropriado**: Testes primeiro para lógica crítica
- ✅ **Código limpo**: Seguir padrões do projeto (ESLint, Prettier)
- ✅ **Sem secrets**: NUNCA hardcode credenciais
- ✅ **Segurança em mente**: Validações e sanitização
- ✅ **Branch isolation**: Commits SOMENTE relacionados a esta feature

**⚠️ AVISO - Respeite o Isolamento da Branch**:
Esta branch foi criada com **sistema inteligente** que protege contra perda de código.
Se você está trabalhando em múltiplas features, certifique-se de estar na branch correta antes de cada commit!

---

### 10.1 Abordagem: Test-Driven Development (quando apropriado)

**Usar TDD quando:**
- ✅ Lógica de negócio complexa
- ✅ Cálculos ou algoritmos
- ✅ Validações críticas
- ✅ Hooks customizados
- ✅ Funções utilitárias

**Pular TDD quando:**
- ❌ Componente UI simples (visual apenas)
- ❌ Integração direta com API (difícil de mockar)
- ❌ Protótipo descartável

---

### 10.2 Fluxo TDD: RED → GREEN → REFACTOR

1. 🔴 **RED**: Teste que falha
2. 🟢 **GREEN**: Implementação mínima que passa
3. 🔵 **REFACTOR**: Limpar + otimizar
4. 💾 **COMMIT**: Pequeno e focado

---

### 10.3 Implementação em Pequenos Diffs

**ORDEM**: Database → Backend Tests → Backend Code → Frontend Tests → Frontend UI → Refactor

Commits incrementais (8+): `migration`, `test: RED`, `feat: GREEN`, `feat: connect`, `style`, `refactor`

**IMPORTANTE**: Todos commits nesta branch (criada Workflow 4). Verificar: `git branch`

---

### 10.4 Validações de Segurança Durante Implementação

- NUNCA hardcode secrets (.env, API keys)
- Sanitizar inputs (React escapa automaticamente)
- Usar Supabase query builder (prepared statements)
- Validar dados no backend
- Implementar RLS no Supabase
- Logs sem dados sensíveis

---

### 10.5 Exemplo de Fluxo Completo

Verificar branch: `git branch` (deve ser da Workflow 4)

Commits: `migration` → `test: RED` → `feat: GREEN` → `test` → `feat` → `feat: connect` → `style` → `style: responsive`

Benefícios: Code review fácil, bug tracking, rollback simples, histórico claro.

**SE NA BRANCH ERRADA**: `git stash save` → `git checkout correta` → `git stash pop` → commits aqui

---

## 🔗 Fase 11: Implementação de Integrações

**Objetivo**: Conectar componentes, APIs e state management

**Checklist de Integrações**:
- ✅ Conectar componentes frontend com hooks de state management
- ✅ Integrar APIs do Supabase (queries, mutations)
- ✅ Validar fluxo de dados end-to-end
- ✅ Implementar error handling e loading states
- ✅ Adicionar optimistic updates (quando aplicável)
- ✅ Testar edge cases e validações

**Testes de Integração**:
```bash
./scripts/run-tests.sh
```

Esperado: 0 errors, 0 warnings, todos testes passam.

**Warnings de Build**: Ver `docs/TROUBLESHOOTING.md`

---

## 📝 Convenção de Nomes de Branches

Padrões: `feat/add-[feature]`, `fix/[bug]`, `refactor/[change]`, `docs/[topic]`, `test/[test]`

Sistema inteligente (Workflow 4): Detecta WIP, preserva código em `.branch-history.log`.

⚠️ Código não commitado? Commite incrementalmente ou stash. NUNCA troque sem commitar.

---

## ✅ GATE 2: Validação de Implementação Core

**Critérios de aprovação**:
- ✅ Todos os testes TypeScript passam (0 type errors)
- ✅ ESLint: 0 errors, 0 warnings críticos
- ✅ Vitest: Todos os unit tests passam
- ✅ Build: Compilação sem erros
- ✅ Commits: 8+ commits incrementais na branch correta
- ✅ Integrações: Componentes conectados e funcionais

**Se algum critério falhar**:
→ Voltar à Fase 10 ou 11 e corrigir
→ Rodar `./scripts/run-tests.sh` novamente
→ Só prosseguir quando GATE 2 estiver 100% aprovado

**Status atual verificado em**: [timestamp]

---

## ✅ Checkpoint: Implementação Core Completa!

**O que temos até agora:**
- ✅ Código implementado com TDD
- ✅ Commits pequenos e incrementais (8+ commits)
- ✅ Testes automáticos passando (TypeScript, ESLint, Vitest, Build)
- ✅ Integrações conectadas e validadas
- ✅ Sem warnings críticos
- ✅ Segurança validada durante implementação

**⚠️ IMPORTANTE**: Código ainda NÃO foi commitado no histórico remoto!
- Commits estão apenas locais (na sua branch)
- Precisa validação manual do usuário (você!) antes de prosseguir
- Code Review e Security Scan vêm depois

**Status atual**:
- Branch: Criada com sistema inteligente no Workflow 4
- Commits locais: ~8-12 commits
- Testes: ✅ Todos passando
- Build: ✅ Sem erros

**🔀 Verificação de Branch Isolation**:
- ✅ Branch foi criada com sistema inteligente no Workflow 4
- ✅ Protegido contra perda de código por WIP/uncommitted changes
- ✅ Histórico de branches registrado em `.branch-history.log`
- ⚠️ Se houver código não commitado em outra branch, ele foi preservado

---

## ⏭️ CONTINUAÇÃO AUTOMÁTICA

**Este workflow continua automaticamente em:**

→ [Workflow 5b - Refactoring e RCA](.windsurf/workflows/add-feature-5b-refactoring-rca.md)

**Próximas etapas:**
- Instalação de Git Hooks
- Fase 12: Refactoring de código
- Análise Root Cause de problemas (se aplicável)
- Troubleshooting e correções

*A execução do Workflow 5b deve ser iniciada automaticamente após a conclusão desta parte.*

---

**Workflow criado em**: 2025-11-04
**Parte**: 5a de 9
**Próximo**: Workflow 5b - Refactoring e RCA
