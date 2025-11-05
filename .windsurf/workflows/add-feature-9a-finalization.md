---
description: Workflow Add-Feature (9a/10) - Finalization Part A (Docs + Commit + Summary)
---

## 📚 Pré-requisito: Consultar Documentação Base

Antes de iniciar qualquer planejamento ou ação, SEMPRE ler:
- `docs/PLAN.md` - Visão estratégica atual
- `docs/TASK.md` - Status das tarefas em andamento
- `docs/pesquisa-de-mercado/` - Fundamentos científicos

---

# Workflow 9a/10: Finalization Part A (Finalização - Parte A)

Este é o **nono workflow** de 10 etapas modulares para adicionar uma nova funcionalidade.

**O que acontece neste workflow (Parte A):**
- Fase 19: Atualização de Documentação
- Fase 20: Commit e Push
- Fase 21: Resumo e Métricas
- **⏭️ CONTINUAÇÃO AUTOMÁTICA para Parte 9b**

---

## ⚠️ REGRA CRÍTICA: USO MÁXIMO DE AGENTES

**SEMPRE usar o MÁXIMO de agentes possível em paralelo** para todas as fases deste workflow.

**Benefícios:**
- ⚡ Redução drástica do tempo de execução (até 36x mais rápido)
- 🎯 Melhor cobertura de análise
- 🚀 Maior throughput de tarefas

**Exemplo:**
- Documentação + Commits: 2+ agentes explorando paralelamente
- Validação final: 3+ agentes checando diferentes aspetos (docs, código, build)
- Merge preparation: 2+ agentes verificando branch status e changelog

---

## 📚 Fase 19: Atualização de Documentação

**IMPORTANTE**: A documentação é atualizada **incorporando aprendizados** da Fase 17 (Meta-Learning).

### 19.1 Checklist de Documentação

#### ✅ Atualizar Mapa de Feature (se aplicável)

**Quando**: Adicionar/modificar componentes, hooks ou queries em uma feature existente

**Arquivos**:
- `docs/features/stats.md` - Sistema de performance/stats
- `docs/features/makeup.md` - Gestão financeira
- Criar novo `.md` se for feature totalmente nova

**O que documentar**:
- Componente novo: path, props, uso
- Hook novo: assinatura, query, propósito
- Database: tabelas, colunas, índices

---

#### ✅ Criar ADR (se decisão arquitetural)

**Quando**: Decisão técnica importante (ex: escolher biblioteca, mudar padrão, performance)

**Arquivo**: `docs/adr/XXX-titulo-decisao.md` (XXX = número sequencial)

**Template**: Ver `docs/adr/` (template padrão ADR com Status, Contexto, Decisão, Consequências, Alternativas)

---

#### ✅ Atualizar README.md (se necessário)

**Quando**: Feature nova, mudança no setup, nova otimização

**Seções a considerar**:
- Funcionalidades Principais - Adicionar nova feature
- Stack Tecnológica - Nova dependência importante
- Scripts Disponíveis - Novo script criado
- Otimizações - Nova otimização implementada

---

#### ✅ Atualizar Regras de Negócio (se aplicável)

**Arquivo**: `docs/regras-de-negocio/calculo-de-performance.md`

**Quando**: Mudar fórmulas, pesos, lógica de cálculo

---

## 💾 Fase 20: Commit e Push

```bash
./scripts/commit-and-push.sh "feat: adicionar cards PROFIT (7/14/30/180d) no MakeUp"
```

Script cria múltiplos commits (TDD: tests → implementation → styles → docs). Push realizado! ✅

---

## 🎉 Fase 21: Resumo e Próximos Passos

### ✅ O que foi feito:
- [x] Backup criado
- [x] Branch Git criada
- [x] Código implementado com TDD
- [x] Usuário validou manualmente (2-4 iterações)
- [x] Code review aprovado
- [x] Security scan passou
- [x] Meta-aprendizado realizado
- [x] Documentação atualizada
- [x] Commits e push realizados

### 📊 Métricas:
- **Commits**: 8-15 commits pequenos ✅
- **Cobertura**: Testado manualmente com sucesso

---

## ⏭️ CONTINUAÇÃO AUTOMÁTICA

**Este workflow continua automaticamente em:**

→ [Workflow 9b - Retrospective RCA](.windsurf/workflows/add-feature-9b-retrospective.md)

**Próximas etapas:**
- Análise Root Cause retrospectiva
- Identificação de melhorias sistêmicas
- Consolidação de meta-learnings

*A execução do Workflow 9b deve ser iniciada automaticamente após a conclusão desta parte.*

---

**Workflow criado em**: 2025-11-04
**Versão**: 3.0 (Split em 9a/9b)
**Autor**: Windsurf AI Workflow + Claude Code

---

## 📝 Changelog

**v3.0 (2025-11-04)**:
- ✅ Split de Workflow 9 em Parte A (9a) e Parte B (9b)
- ✅ Parte A: Docs + Commit + Summary (Fases 19-21)
- ✅ Continuidade automática para Parte B (RCA Retrospectivo)
- ✅ Tamanho reduzido para < 12k chars
