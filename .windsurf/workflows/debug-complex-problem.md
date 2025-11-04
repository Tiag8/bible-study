---
description: Workflow Debug - Diagnóstico Sistemático Multi-Agent Paralelo
auto_execution_mode: 1
---

# Workflow: Debug - Diagnóstico Multi-Agent Paralelo

**Metodologia**: 5+ agentes paralelos para resolver problemas complexos em 5-30min (vs 3h+ manual).

**Pré-requisitos**: Ler `docs/PLAN.md`, `docs/TASK.md`, `docs/TROUBLESHOOTING.md`, `docs/debugging/README.md`

**7 Fases**: Problem Statement → Multi-Agent Diagnosis → Root Cause → Solution → Implementation → Validation → Meta-Learning

---

## 🚨 Fase 1: Problem Statement (Captura do Problema)

**Objetivo**: Documentar o problema antes do diagnóstico.

**Use template** em `docs/debugging/template-problem-statement.md` para:
- Descrever sintomas exatos (o que, quando, onde)
- Avaliar impacto (Critical/High/Medium/Low)
- Documentar reprodução (passos, ou padrão de intermitência)
- Contexto técnico (browser/endpoint/tabela/feature)

**Checklist rápido**:
- [ ] Sintomas claros
- [ ] Ambiente identificado (local/staging/prod)
- [ ] Reprodução confirmada (ou padrão documentado)
- [ ] Impacto avaliado

---

## 🔍 Fase 2: Multi-Agent Diagnosis (Diagnóstico Paralelo)

**CRÍTICO**: Lançar 5+ agentes em paralelo para cobertura completa!

**5 Ângulos de Investigação** (cada um em paralelo):

1. **Agent 1 - Database & Schema**: Tabelas, índices, RLS policies, migrations, EXPLAIN ANALYZE
2. **Agent 2 - Frontend Queries**: React Query hooks, Zod schemas, state management, error handling, race conditions
3. **Agent 3 - Backend & Edge**: Funções Deno, middleware, transformações, timeout/retry, memory leaks
4. **Agent 4 - Auth & Security**: JWT tokens, RLS validation, session, user_id passing, data leaks, bucket policies
5. **Agent 5 - Logs & Monitoring**: VPS/Supabase/Sentry logs, timestamps, error patterns, resource usage, latency

**Template detalhado**: `docs/debugging/template-agentes.md`

**Saídas esperadas**:
- Agent 1: Problemas database (queries lenta, índices, RLS)
- Agent 2: Type mismatches, race conditions, cache issues
- Agent 3: Logic errors, middleware issues, timeouts
- Agent 4: Auth/RLS bugs, data leakage
- Agent 5: Error traces, timing, resource bottlenecks

---

## 📊 Fase 3: Root Cause Analysis

**Objetivo**: Correlacionar findings e identificar causa raiz (não sintoma).

**Processo**:
1. **Comparar outputs dos 5 agentes** → Qual padrão emerge?
2. **Montar hipótese** → Qual é o PRIMEIRO evento na cadeia?
3. **Validar** → Conseguimos reproduzir alterando APENAS esse fator?
4. **Procurar por root causes típicos**:
   - Migration com breaking change?
   - Variáveis de ambiente erradas?
   - Data corruption?
   - Rate limiting atingido?
   - Service dependency down?
   - Code regression recente?

**Documentar resultado** (Template: `docs/debugging/001-auth-401-queries-sem-prefixo.md`):
- Problema (sintoma)
- Causa Raiz (verdadeira origem)
- Evidências (de cada agente)
- Confirmação (como validamos)

---

## 🛠️ Fase 4: Solution Design

**Tipos de solução** (escolha 1):
- **Automated Fix**: Script/Query para corrigir dados em massa (testar em staging!)
- **Code Fix**: Patch em arquivo(s) afetado(s)
- **Configuration**: Alterar .env ou database setting
- **Rollback**: Revert para commit anterior

**Plano**:
1. Qual tipo? (Automated/Code/Config/Rollback)
2. Qual arquivo(s) alterar?
3. Rollback plan (se fix falhar)?
4. Validation criteria (como confirmar sucesso?)

---

## ⚙️ Fase 5: Implementation & Testing

**Setup**: `git pull origin main && npm install && npm run dev` (verificar .env)

**Implementar**:
1. Reproduzir bug ANTES de fix (confirmar que existe)
2. Aplicar fix (editar ou rodar script)
3. Testar que bug desapareceu DEPOIS de fix
4. Rodar testes: `npm run test -- [arquivo-afetado]`
5. Build production: `npm run build`

**Commit**:
```bash
git add . && git commit -m "fix: [descrição]

Causa: [causa raiz breve]
Testes: [quais validados]"
```

---

## ✅ Fase 6: Validation & Monitoring

**Deploy**:
- Critical bug: Merge para `main` + Deploy imediato (`./scripts/deploy-vps.sh production`)
- Non-critical: Merge via PR + Deploy em janela planejada

**Smoke tests** (pós-deploy):
- Feature afetada funciona?
- Health checks passam?
- Logs limpos de novos erros?
- Users conseguem usar?

**Monitorar** (10-15min): `./scripts/vps-logs.sh production | tail -f` + Sentry/CloudWatch

---

## 🧠 Fase 7: Meta-Learning & Documentation

**Lições aprendidas**: O que funcionou? O que não? Como melhorar?

**Criar documentação** (escolha 1):
- **Novo tipo de bug**: `docs/debugging/problema-nome.md` (causa, sintomas, solução)
- **Regressão conhecida**: Atualizar `docs/TROUBLESHOOTING.md`
- **Issue arquitetural**: Criar ADR em `docs/adr/XXX-titulo.md`

**Melhorias sistêmicas**: Adicionar test? Monitoring? Logging? Workflow?

**Commit docs**:
```bash
git add docs/ && git commit -m "docs: debug [problema]

Lições: [aprendizados principais]"
```

---

## ✅ Checklist Final

**Antes de considerar problema RESOLVIDO**:

- [ ] **Fase 1**: Sintomas documentados, impacto avaliado, reprodução confirmada
- [ ] **Fase 2**: 5 agentes executados em paralelo, findings correlacionados
- [ ] **Fase 3**: Causa raiz identificada (não sintoma), hipótese validada
- [ ] **Fase 4**: Plan definido, rollback plan preparado
- [ ] **Fase 5**: Fix testado localmente, bug reproduzido ANTES/DEPOIS fix
- [ ] **Fase 6**: Deploy OK, smoke tests passaram, monitoring 10+ min limpo
- [ ] **Fase 7**: Lições documentadas, novo doc criado se necessário

---

## 🎯 Success Metrics

Debugging bem-sucedido quando:
- Bug identificado + causa raiz documentada
- Fix aplicado + testado
- Sintoma desapareceu
- Zero regressões
- Documentação criada
- Sistema melhorado (test/monitoring)

---

## 🔄 Próximos Passos (Obrigatórios)

1. [ ] Atualizar `docs/TASK.md` - Marcar issue como resolvida
2. [ ] Atualizar `docs/PLAN.md` - Se mudança estratégica
3. [ ] Criar ADR - Se decisão arquitetural importante
4. [ ] Documentar em `docs/debugging/` - Caso documentado

---

## 📊 Cenários & Tempo Estimado

| Cenário | Tempo | Risco |
|---------|-------|-------|
| Bug crítico em prod | 30-45min | Medium |
| Bug em staging | 45-90min | Low |
| Performance issue | 60-120min | Low |
| Data corruption | 45-60min | Medium |
| Intermittent bug | 90-180min | Medium |

---

**Workflow**: Multi-Agent Parallel Debugging (5+ agentes)
**Data**: 2025-11-03 | **Tempo esperado**: 30-120 minutos
**Refs**: ADR 008, `docs/debugging/`, `docs/PLAN.md`, `docs/TASK.md`
