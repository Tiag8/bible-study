---
description: Workflow 5b - Refactoring e Root Cause Analysis
auto_execution_mode: 1
---

## Pré-requisito

← [Workflow 5a - Implementation](.windsurf/workflows/add-feature-5a-implementation.md)

GATE 2 do Workflow 5a deve estar APROVADO.

---

## FASE 0: LOAD CONTEXT

```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/feat\//feat-/')
./scripts/context-load-all.sh $BRANCH_PREFIX
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] WORKFLOW: 5b - START" >> .context/${BRANCH_PREFIX}_attempts.log
```

---

## Git Hook (Uma vez por repo)

```bash
./scripts/install-git-hooks.sh
```

---

## FASE 12: REFACTORING

**Refatorar quando**: Código duplicado, funções > 50L, nomes ruins, magic numbers

### Auto-Fix de Testes

1. **Tentativa 1**: Logs → Causa → Fix → Rerun
2. **Tentativa 2**: Solução alternativa
3. **Se falhar 2x**: Pedir ajuda com logs

---

## DUPLICATION DEBT CHECK (OBRIGATÓRIO)

### Checklist Duplicação

**Gemini AI** (tool calling):
```bash
grep -r "parse.*function\|extract.*function" supabase/functions/_shared/
```
❌ Parsers que Gemini tool calling JÁ faz

**React Query** (cache):
```bash
grep -r "cache\|memoize\|store" src/hooks/ src/lib/
```
❌ Cache custom (React Query JÁ tem staleTime)

**Supabase** (auth):
```bash
grep -r "validateUser\|checkAuth" supabase/functions/_shared/
```
❌ Auth custom (Supabase Auth JÁ tem)

### SE Duplicação Detectada

1. ⛔ BLOQUEAR refactoring
2. 🔍 RCA (5 Whys)
3. 🗑️ Remover duplicação (commit separado)
4. 📚 Meta-Learning (se sistêmico)

**Red Flags**: Parser/Extractor, Cache custom, Validation layer, Auth custom

---

## ROOT CAUSE ANALYSIS (SE APLICÁVEL)

**USAR SE**: Bug recorrente, testes falharam 2+x, bug intermitente, performance degradou

**PULAR SE**: Testes OK, problema trivial

### Técnica: 5 Whys

```markdown
1. Por quê falha? → [erro observado]
2. Por quê não detectado? → [falta validação]
3. Por quê validação não existe? → [processo incompleto]
4. Por quê processo falhou? → [ferramenta faltante]
5. Por quê não previsto? → **CAUSA RAIZ**

**Fix**: [correção específica]
**Prevenção**: [gate/checklist/teste]
```

### Exemplo: Email Não Salva

```markdown
1. Email não salvou → "column does not exist"
2. Coluna não existe → migration não executada
3. Migration não executada → código ANTES schema
4. Código antes schema → TDD focou em lógica
5. **CAUSA RAIZ**: Falta checklist "Schema-First"

**Fix**: Migration antes de código
**Prevenção**: GATE 6 (Schema-First) no Workflow 4.5
```

---

## RESOLUÇÃO EM TEIA (APÓS RCA)

**SE executou RCA**: Mapear teia ANTES de fix

### Script Automatizado ⭐ RECOMENDADO

```bash
# Teia automática com Serena (14 checks em 2-3 min)
./scripts/serena-teia-mapper.sh <symbol_ou_arquivo_afetado> \
  --output-file .context/${BRANCH_PREFIX}_teia-analysis.md
```

**Benefício Serena**:
- Automatiza os 14 checks sistemáticos
- LSP-based semantic analysis (zero false positives em imports/calls)
- Output estruturado em Markdown (pronto para .context/)
- 10-15 min manual → 2-3 min automatizado

### Checklist (14 checks) - Manual Fallback

**Mapeamento** (5):
- [ ] Arquivos que importam código afetado?
- [ ] Funções chamadas/chamadoras?
- [ ] Tabelas/queries relacionadas?
- [ ] Componentes que consomem dados?
- [ ] Documentação relacionada?

**Impacto** (4):
- [ ] Impacto em CADA conexão?
- [ ] Padrões similares no codebase?
- [ ] Outros lugares com mesmo problema?
- [ ] Testes faltantes?

**Resolução** (5):
- [ ] Corrigir causa raiz?
- [ ] Corrigir TODOS padrões similares?
- [ ] Atualizar documentação?
- [ ] Adicionar testes?
- [ ] Validar zero regressões?

### Ferramentas Manuais (SE Serena indisponível)

```bash
grep -r "import.*from.*arquivo-afetado" src/ supabase/
grep -r "funçãoProblematica(" src/ supabase/
git log --all --grep="keyword-relacionada"
```

---

## AUTO-INVOKE: test-coverage-analyzer (Gap A2) 🆕

**Objetivo**: Garantir cobertura de testes APÓS refactoring/RCA. Previne código modificado sem testes correspondentes.

**Quando executar**: SEMPRE após Workflow 5b (refactoring ou RCA executados).

**Agent**: `test-coverage-analyzer`
**Invocação**: Automática (Claude detecta código modificado sem testes correspondentes)

**O que analisa** (4 phases):
1. **Scan Codebase** (Phase 1): Map source files → test files (coverage mapping)
2. **Prioritize** (Phase 2): Classificar por criticidade (🔴 CRITICAL → ⚪ LOW)
3. **Recommend Strategy** (Phase 3): Test types (unit, integration, e2e) + planos de implementação
4. **Calculate Metrics** (Phase 4): Coverage atual vs target (por prioridade)

**Output esperado**: `.context/{branch}_test-coverage-analysis.md`

**Checklist**:
- [ ] Agent executou 4 phases de análise?
- [ ] Report gerado com coverage mapping (tested vs untested)?
- [ ] Código CRITICAL untested identificado? (auth, payments, data integrity)
- [ ] Estratégia de testes recomendada para critical paths?
- [ ] Coverage targets definidos (CRITICAL 90%, HIGH 80%, MEDIUM 85%, LOW 70%)?

**Priorização de Criticidade**:
| Priority | Category | Risk Level | Target Coverage |
|----------|----------|------------|----------------|
| 🔴 CRITICAL | Auth, Payments, Data Integrity | HIGH (security/money) | 90% |
| 🟡 HIGH | Core Features (habits, goals, assessments) | MEDIUM (user-facing) | 80% |
| 🟢 MEDIUM | UI Components | LOW (visual) | 85% |
| ⚪ LOW | Utils, Helpers | MINIMAL | 70% |

**SE CRITICAL untested detectado**: ⚠️ Adicionar testes ANTES de Workflow 6a (User Validation)

**SE HIGH untested detectado**: ⚠️ Documentar em decisions.md, adicionar durante Workflow 7a (Quality Gates)

**SE MEDIUM/LOW untested**: ✅ Documentar para implementação futura (tech debt)

**Evidence Documentado** (internal):
- Refactoring sem test coverage → 40% regressions (feat-streak vs feat-payment)
- CRITICAL paths untested → 2x bug rate em produção
- Test coverage 90%+ → zero security incidents (auth)

---

## FASE FINAL: UPDATE CONTEXT

```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/feat\//feat-/')
TIMESTAMP=$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')

# Atualizar workflow-progress.md
cat >> .context/${BRANCH_PREFIX}_workflow-progress.md <<EOF

### Workflow 5b: Refactoring & RCA ✅
- **Data**: $TIMESTAMP
- **Refactoring**: [Aplicado/N/A]
- **Duplicação**: [0 detectada ou listar]
- **RCA 5 Whys**: [Executado/N/A]
- **Next**: Workflow 6 (User Validation)
EOF

# Log em attempts.log
echo "[$TIMESTAMP] WORKFLOW: 5b - COMPLETO" >> .context/${BRANCH_PREFIX}_attempts.log
```

---

## Checklist Final

- [ ] **Git Hooks**: Instalados?
- [ ] **Fase 12**: Refactoring aplicado?
- [ ] **Duplication**: Check executado?
- [ ] **RCA**: 5 Whys (se aplicável)?
- [ ] **Teia**: Mapeamento completo (se RCA)?
- [ ] **.context/**: Atualizado?

---

## REGRA ANTI-ROI

**NUNCA**: ROI, tempo, "horas economizadas"
**PERMITIDO**: Evidências concretas, métricas técnicas

---

**Versão**: 2.0 (Otimizado)
**Próximo**: Workflow 6 (User Validation)

---

## 🧭 WORKFLOW NAVIGATOR

### Próximo Workflow Padrão
**[Workflow 6a] - User Validation**: Código implementado e refatorado → validar manualmente com usuário antes de quality gates.

### Quando Desviar do Padrão

| Situação | Workflow | Justificativa |
|----------|----------|---------------|
| RCA detectou problema arquitetural grave | 2b (Technical Design) | Re-projetar antes de continuar |
| Duplicação sistêmica detectada | 8a (Meta-Learning) | Documentar padrão antes de prosseguir |
| Testes falharam 3+ vezes | 5a (Implementation) | Voltar e corrigir implementação base |

### Quando Voltar

| Sinal de Alerta | Voltar para | Por quê |
|-----------------|-------------|---------|
| RCA revelou causa raiz em design | 2b (Technical Design) | Problema está na arquitetura |
| Duplicação com Gemini/React Query/Supabase | 2a (Solutions) | Escolher solução nativa |
| Refactoring quebrou funcionalidade | 5a (Implementation) | Re-implementar com abordagem diferente |

### Regras de Ouro
- ⛔ **NUNCA pular**: RCA 5 Whys quando testes falharam 2+ vezes
- ⚠️ **Duplicação detectada**: BLOQUEAR refactoring até resolver
- 🎯 **Dúvida?**: Usar skill `workflow-navigator` para análise completa do contexto
