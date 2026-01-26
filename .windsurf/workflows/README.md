# THE METHOD - Sistema de Workflows para Vibe Coding Profissional

**Versão**: 1.0.0 | **Data**: 2026-01-01

---

## O que é?

Sistema de workflows estruturados para desenvolvimento AI-assisted que garante:
- ✅ Qualidade consistente
- ✅ Zero regressões
- ✅ Rastreabilidade completa
- ✅ Escalabilidade para qualquer projeto

---

## Quick Start (5 min)

| Situação | Ação |
|----------|------|
| Nova feature? | WF-00 Setup → WF-01 Planning |
| Bug crítico? | `SPECIAL-fast-track.md` |
| Debug complexo? | `/rca-debugger` skill |
| Dúvida qual workflow? | `/workflow-navigator` skill |

---

## Fluxo Principal

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           WORKFLOW SEQUENCE                                   │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│   WF-00 Setup ──────► WF-01 Planning ──────► WF-02a/b Design                 │
│        │                    │                      │                          │
│        └────────────────────┼──────────────────────┘                          │
│                             │                                                 │
│                             ▼                                                 │
│   WF-03/3.5 Tasks ◄── WF-04.5 Gates (a-f) ──► WF-05a Implementation          │
│                                                      │                        │
│                                                      ▼                        │
│   WF-05b Refactoring ◄────► WF-06a/b/c Validation                            │
│        │                          │                                           │
│        │    (Max 5 iterações)     │                                           │
│        └──────────────────────────┘                                           │
│                                                                               │
│                             ▼                                                 │
│   WF-07a/b Quality ──► WF-08a/b Meta-Learning ──► WF-09a/b Finalization      │
│                                                          │                    │
│                                                          ▼                    │
│   WF-10 Template ──► WF-11a/b Deploy ──► WF-12 Merge ──► WF-13a/b Post-Deploy │
│                                                                │              │
│                                                                ▼              │
│                                                        WF-14 Consolidation   │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Índice de Workflows

### Fase 0: Setup
| Arquivo | Descrição |
|---------|-----------|
| `add-feature-0-setup-unified.md` | Setup unificado (Context + Backup + Branch) |

### Fase 1-3: Planning & Design
| Arquivo | Descrição |
|---------|-----------|
| `add-feature-1-planning.md` | Planning + GATE 1 Reframing |
| `add-feature-2a-solutions.md` | Research & Decision (3 soluções) |
| `add-feature-2b-technical-design.md` | Technical Design |
| `add-feature-3-risk-analysis.md` | Risk Analysis |
| `add-feature-3.5-tasks.md` | Task Breakdown (tasks.md) |

### Fase 4.5: Pre-Implementation Gates
| Arquivo | Descrição |
|---------|-----------|
| `add-feature-4.5-pre-implementation-gates.md` | Orchestrador dos gates |
| `add-feature-4.5a-environment.md` | Environment validation (SEMPRE PRIMEIRO) |
| `add-feature-4.5b-database.md` | Database/FK validation |
| `add-feature-4.5c-ai-tools.md` | AI/Gemini tools validation |
| `add-feature-4.5d-edge-functions.md` | Edge Functions validation |
| `add-feature-4.5e-code-quality.md` | Code quality gates (SEMPRE) |
| `add-feature-4.5f-qa-deploy.md` | QA & pre-deploy (SEMPRE ÚLTIMO) |

### Fase 5-6: Implementation & Validation
| Arquivo | Descrição |
|---------|-----------|
| `add-feature-5a-implementation.md` | Implementation (TDD, Gates) |
| `add-feature-5b-refactoring-rca.md` | Refactoring + RCA 5 Whys |
| `add-feature-6a-user-validation.md` | User Validation |
| `add-feature-6b-rca-edge-cases.md` | RCA Edge Cases |
| `add-feature-6c-visual-refinement.md` | Visual Refinement (UI-heavy) |

### Fase 7-9: Quality & Finalization
| Arquivo | Descrição |
|---------|-----------|
| `add-feature-7a-quality-gates.md` | Quality Gates (Build, Tests) |
| `add-feature-7b-rca-security.md` | RCA Security |
| `add-feature-8a-meta-learning.md` | Meta-Learning |
| `add-feature-8b-pareto-analysis.md` | Pareto 80/20 Analysis |
| `add-feature-9a-finalization.md` | Finalization |
| `add-feature-9b-retrospective.md` | Retrospective |

### Fase 10-14: Deploy & Post-Deploy
| Arquivo | Descrição |
|---------|-----------|
| `add-feature-10-template-sync.md` | Template Sync |
| `add-feature-11-vps-deployment-unified.md` | VPS Deployment Unificado (Prep + Exec) ⭐ |
| ~~`add-feature-11a-vps-deployment-prep.md`~~ | ~~VPS Deployment Prep~~ (DEPRECATED - usar unified) |
| ~~`add-feature-11b-vps-deployment-exec.md`~~ | ~~VPS Deployment Exec~~ (DEPRECATED - usar unified) |
| `add-feature-11c1a-vps-monitoring.md` | VPS Monitoring |
| `add-feature-11c1b-rca-rollback.md` | RCA Rollback |
| `add-feature-11c2-vps-rollback-docs.md` | Rollback Docs |
| `add-feature-12-merge-to-main.md` | Merge to Main |
| `add-feature-13a-post-deploy.md` | Post-Deploy Validation |
| `add-feature-13b-rca-metrics.md` | RCA Metrics |
| `add-feature-14-meta-learning-consolidation.md` | Meta-Learning Consolidation |

### Special Workflows
| Arquivo | Descrição |
|---------|-----------|
| `add-feature-fast-track-critical-bug.md` | Fast-track para bugs críticos |
| `debug-complex-problem.md` | Debug multi-agent |
| `ultra-think.md` | Deep thinking mode |

---

## Padronização de Severidade de GATEs (GAP-012)

### Níveis de Severidade

| Símbolo | Nível | Significado | Ação |
|---------|-------|-------------|------|
| ⛔ | **BLOQUEIO ABSOLUTO** | Impede prosseguimento | PARAR e resolver antes de continuar |
| 🔴 | **CRÍTICO** | Problema grave | Resolver imediatamente (< 15min) |
| ⚠️ | **WARNING** | Atenção necessária | Avaliar e documentar decisão |
| 🟡 | **MÉDIO** | Problema moderado | Resolver antes do merge |
| 🟢 | **BAIXO** | Problema menor | Documentar para próxima iteração |
| ℹ️ | **INFO** | Informativo | Opcional, boa prática |

### Quando Usar Cada Nível

```
⛔ BLOQUEIO ABSOLUTO - Usar quando:
├── Segurança comprometida (RLS bypass, secrets expostos)
├── Data integrity em risco (migrations sem rollback)
├── Produção vai quebrar (deploy sem validação)
└── Regra sistêmica violada (GATE 1 não executado)

🔴 CRÍTICO - Usar quando:
├── Funcionalidade core quebrada
├── Performance degradada > 5x
├── Testes críticos falhando
└── Schema-code mismatch

⚠️ WARNING - Usar quando:
├── Best practice não seguida
├── Documentação desatualizada
├── Coverage < target
└── Decisão precisa aprovação

🟡 MÉDIO - Usar quando:
├── Bug não-bloqueante
├── Technical debt identificado
├── Refactoring desejável
└── Teste faltante (não crítico)

🟢 BAIXO - Usar quando:
├── Melhoria cosmética
├── Otimização opcional
├── Documentação extra
└── Nice-to-have

ℹ️ INFO - Usar quando:
├── Contexto adicional
├── Referência a docs
├── Dica de produtividade
└── Sugestão não obrigatória
```

### Escalação de Severidade

```
┌─────────────────────────────────────────────────────────────────┐
│  REGRA DE ESCALAÇÃO                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  SE ⚠️ WARNING ignorado 2x consecutivas:                        │
│     → Escalar para 🔴 CRÍTICO                                   │
│                                                                  │
│  SE 🔴 CRÍTICO não resolvido em 15min:                          │
│     → Escalar para ⛔ BLOQUEIO                                  │
│                                                                  │
│  SE ⛔ BLOQUEIO encontrado:                                     │
│     → PARAR IMEDIATAMENTE                                       │
│     → Documentar em .context/{branch}_decisions.md              │
│     → Resolver antes de qualquer outra ação                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Limite de Iterações (GAP-010)

### Loop WF-5a ↔ WF-5b

| Iterações | Status | Ação |
|-----------|--------|------|
| 1-2 | ✅ Normal | Continuar ciclo |
| 3 | ⚠️ Alerta | Documentar padrão de falha |
| 4 | 🔴 Crítico | Consultar skill `party-mode` |
| 5+ | ⛔ BLOQUEIO | Regredir para workflow anterior |

Ver detalhes em `add-feature-5b-refactoring-rca.md` seção "LIMITE DE ITERAÇÕES".

---

## Critérios de Entrada por Workflow

### WF-6c (Visual Refinement) - Critérios Objetivos (GAP-009)

**EXECUTAR SE**:
- ✅ Feature tem 80%+ código frontend (landing, dashboard, onboarding)
- ✅ Workflow 6a (Validação Técnica) completo com GATE 3 aprovado
- ✅ Screenshots BEFORE/AFTER capturados
- ✅ Usuário explicitamente pediu refinamento visual OU múltiplos aspectos visuais a ajustar

**SKIP SE**:
- ❌ Feature é 80%+ backend (Edge Functions, migrations)
- ❌ Workflow 6a não completo
- ❌ Apenas 1-2 ajustes visuais menores (fazer inline no WF-5a)

---

## Output Templates

### WF-8b (Pareto Analysis) - Template de Output (GAP-015)

```markdown
## Análise Pareto 80/20 - [Feature Name]

**Data**: [YYYY-MM-DD HH:MM]
**Agentes**: 5 paralelos (Workflows, Scripts, Docs, Padrões, Consolidação)

### Top 5-7 Melhorias Identificadas

| # | Ação | Categoria | Tempo (h) | RCA? | Causa Raiz | Score |
|---|------|-----------|-----------|------|------------|-------|
| 1 | [Ação] | [Cat] | [X.X] | ✅/❌ | [Causa] | [N]/10 |
| 2 | [Ação] | [Cat] | [X.X] | ✅/❌ | [Causa] | [N]/10 |
| ... | ... | ... | ... | ... | ... | ... |

### Justificativa

[Por que estas melhorias foram selecionadas]

### Ordem de Execução Recomendada

1. [Melhoria X] - [Por que primeiro]
2. [Melhoria Y] - [Dependência de X]
3. ...

### Score Projetado

- **Antes**: [X]/10
- **Depois**: [Y]/10
- **Ganho**: +[Z] pontos

### Decisão do Usuário

- [ ] Implementar TODAS
- [ ] Implementar selecionadas: [listar]
- [ ] Não implementar (aceitar score atual)

**Aguardando aprovação...** 🚦
```

---

## Convenções de Arquivos

### Nomenclatura
- Prefixo: `add-feature-[N]-nome.md`
- N = número do workflow (0-14)
- Letras para sub-workflows: `a`, `b`, `c`...

### Estrutura Obrigatória
```markdown
---
description: Workflow [N] - [Nome]
auto_execution_mode: 1
---

## 📚 Pré-requisito
[Links para workflows anteriores]

## 🧠 FASE 0: LOAD CONTEXT
[Script de carregamento]

## [FASES DO WORKFLOW]
[Conteúdo...]

## 🧭 WORKFLOW NAVIGATOR
[Próximo, desvios, quando voltar]

## 🧠 FASE FINAL: UPDATE CONTEXT
[Scripts de atualização]
```

### Limite de Tamanho
- **Máximo**: 12.000 caracteres
- **Se exceder**: Dividir em partes (a, b, c...)

---

## Scripts Relacionados

| Script | Função |
|--------|--------|
| `./scripts/context-init.sh` | Criar estrutura .context/ |
| `./scripts/context-load-all.sh` | Carregar contexto |
| `./scripts/context-read-all.sh` | Ler todos arquivos .context/ |
| `./scripts/validate-gate-1-executed.sh` | Validar GATE 1 |
| `./scripts/impact-mapper.sh` | Mapear impacto 4 camadas |
| `./scripts/db-dependency-checker.sh` | Verificar dependências DB |
| `./scripts/deploy-vps-rsync.sh` | Deploy VPS (recomendado) |
| `./scripts/vps-rollback.sh` | Rollback VPS |

---

## Skills Relacionadas

| Skill | Quando Usar |
|-------|-------------|
| `/workflow-navigator` | Dúvida qual workflow executar |
| `/party-mode` | Decisão complexa (multi-agente) |
| `/rca-debugger` | Debug sistemático |
| `/serena` | Impact mapping semântico |
| `/supabase-expert` | Migrations, RLS, schema |

---

## Troubleshooting

### "Qual workflow devo usar?"
Execute `/workflow-navigator` com contexto da tarefa.

### "Loop infinito entre 5a↔5b"
Verificar contador de iterações. Se >= 5, regredir conforme árvore de decisão em WF-5b.

### "GATE bloqueando sem razão clara"
Verificar `.context/{branch}_attempts.log` para histórico de tentativas.

### "Workflow muito grande (> 12k chars)"
Dividir em partes (a, b, c...) mantendo referências cruzadas.

---

## Changelog

**v1.0.0** (2026-01-01):
- Criação do README.md
- Padronização de severidade (GAP-012)
- Documentação de limite de iterações (GAP-010)
- Critérios de entrada WF-6c (GAP-009)
- Template output WF-8b (GAP-015)

---

*Criado como parte do sistema THE METHOD para vibe coding profissional.*
