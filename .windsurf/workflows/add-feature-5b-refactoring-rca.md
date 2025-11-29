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

### Checklist (14 checks)

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

### Ferramentas

```bash
grep -r "import.*from.*arquivo-afetado" src/ supabase/
grep -r "funçãoProblematica(" src/ supabase/
git log --all --grep="keyword-relacionada"
```

---

## FASE FINAL: UPDATE CONTEXT

```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/feat\//feat-/')
TIMESTAMP=$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')
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
