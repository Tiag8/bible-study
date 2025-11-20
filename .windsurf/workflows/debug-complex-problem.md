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

## 🕸️ Fase 3.5: Web Resolution (NOVA FASE CRÍTICA)

**Objetivo**: Após RCA identificar causa raiz, mapear TODA teia de conexões para solução completa.

**Por quê CRÍTICO**: Problemas complexos raramente afetam apenas 1 arquivo. Resolver apenas causa raiz = bug recorre em outros lugares.

---

### Processo: Cross-Reference dos 5 Agentes (Fase 2)

Use os findings dos 5 agentes da Fase 2 (Multi-Agent Diagnosis) para mapear teia completa:

**Agent 1 (Database & Schema)** → Quais outras tabelas/queries afetadas?
- Foreign keys de outras tabelas
- Functions/triggers que usam mesmos dados
- RLS policies similares
- Migrations relacionadas

**Agent 2 (Frontend Queries)** → Quais outros componentes consomem dados?
- Hooks com lógica similar
- Componentes que fazem queries parecidas
- Types/interfaces compartilhados
- Cache/state management relacionado

**Agent 3 (Backend & Edge)** → Quais outras Edge Functions têm padrão similar?
- Funções em _shared/ usadas por múltiplas edges
- Middleware comum
- Transformações/validações similares
- Error handling patterns

**Agent 4 (Auth & Security)** → Impacto em outras policies/validações?
- RLS policies em outras tabelas
- Auth checks similares
- Session/token handling
- Data isolation patterns

**Agent 5 (Logs & Monitoring)** → Outros erros relacionados nos logs?
- Padrões de erro similares
- Timing correlations
- Resource usage patterns
- Failed requests com mesma causa

---

### Ferramentas de Mapeamento

```bash
# 1. Buscar imports/exports do arquivo da causa raiz
grep -r "import.*from.*arquivo-causa-raiz" src/ supabase/

# 2. Buscar chamadas da função problemática
grep -r "funçãoProblematica(" src/ supabase/

# 3. Buscar referências no database
grep -r "lifetracker_tabela_afetada" supabase/

# 4. Buscar em documentação relacionada
grep -r "feature-afetada" docs/

# 5. Git log de casos passados similares
git log --all --grep="keyword-relacionada" --since="2024-01-01"
```

---

### Checklist Web Resolution (OBRIGATÓRIO)

**Mapeamento** (usar outputs dos 5 agentes):
- [ ] Listei TODOS arquivos conectados à causa raiz?
- [ ] Identifiquei TODAS funções que chamam/são chamadas?
- [ ] Mapeei TODAS tabelas/queries relacionadas?
- [ ] Encontrei TODOS componentes que consomem dados?
- [ ] Busquei TODA documentação relacionada?

**Análise**:
- [ ] Avaliei impacto da mudança em CADA conexão?
- [ ] Busquei padrões similares no codebase?
- [ ] Validei se outros lugares têm mesmo problema?
- [ ] Identifiquei testes faltantes para teia completa?

**Resolução Holística** (não apenas pontual):
- [ ] Vou corrigir causa raiz (de RCA)?
- [ ] Vou corrigir TODOS padrões similares identificados (teia)?
- [ ] Vou atualizar TODA documentação relacionada?
- [ ] Vou adicionar testes para TODA teia mapeada?
- [ ] Vou validar que não introduzi regressões?

---

### Output da Fase 3.5

**Entregar**:
1. **Lista completa de arquivos afetados** (não apenas 1 arquivo):
   - Arquivo causa raiz (de RCA)
   - + N arquivos com padrão similar
   - + M arquivos de documentação
   - + K testes a criar

2. **Mapa de dependências**:
   ```
   arquivo-causa-raiz.ts
   ├── importado por: arquivo-A.ts, arquivo-B.ts
   └── usa função de: _shared/util.ts
       └── também usada por: arquivo-C.ts (RISCO!)
   ```

3. **Plano de resolução holística**:
   - [ ] Fix causa raiz (arquivo X)
   - [ ] Fix padrão similar (arquivo Y, Z)
   - [ ] Update docs (A.md, B.md)
   - [ ] Add tests (3 unit, 1 integration, 1 E2E)

---

### Exemplo Prático

**Problema**: "Webhook WhatsApp não salva mensagem"

**RCA (Fase 3)**: Missing INSERT em `webhook-whatsapp-natural/index.ts`

**Web Resolution (Fase 3.5) MAPEIA**:

**Backend** (Agent 3):
- ✅ webhook-whatsapp-natural/index.ts (causa raiz)
- ⚠️ webhook-whatsapp-adapter/index.ts (usa lógica similar)
- ⚠️ _shared/message-processor.ts (helper function compartilhada)

**Database** (Agent 1):
- ⚠️ lifetracker_conversations (missing index para user_id)
- ⚠️ RLS policy permite INSERT? (checagem necessária)

**Docs** (nossa análise):
- ⚠️ docs/integrations/UAZAPI.md (fluxo desatualizado)

**Tests** (nossa análise):
- ❌ Unit test save message (MISSING)
- ❌ Integration test webhook → DB (MISSING)

**Resolução COMPLETA**:
1. ✅ Fix webhook-whatsapp-natural (causa raiz)
2. ✅ Fix webhook-whatsapp-adapter (padrão similar)
3. ✅ Add index em lifetracker_conversations
4. ✅ Validate RLS policy
5. ✅ Update docs/integrations/UAZAPI.md
6. ✅ Add 2 unit tests + 1 integration test

**Total**: 7 fixes (não apenas 1!)

---

**Ver**: `.claude/CLAUDE.md` → Regra 4B para metodologia completa.

**Próxima Fase**: Fase 4 (Solution Design) com plano completo de todos os fixes mapeados.

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

**Root Cause Analysis (RCA)**: Use técnica dos **5 Whys** para identificar causa raiz sistêmica (não apenas sintoma). Ver guia completo: `docs/guides/ROOT_CAUSE_ANALYSIS.md`

**Criar documentação** (escolha 1):
- **Novo tipo de bug**: `docs/debugging/problema-nome.md` (causa, sintomas, solução, RCA)
- **Regressão conhecida**: Atualizar `docs/TROUBLESHOOTING.md`
- **Issue arquitetural**: Criar ADR em `docs/adr/XXX-titulo.md`

**Melhorias sistêmicas**: Adicionar test? Monitoring? Logging? Workflow? Pre-commit hook?

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
