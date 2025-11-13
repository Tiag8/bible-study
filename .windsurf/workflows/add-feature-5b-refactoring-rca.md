---
description: Workflow Add-Feature (5b/9) - Refactoring e Root Cause Analysis
auto_execution_mode: 1
---

# ⏮️ CONTINUAÇÃO DO WORKFLOW 5a

**Este é o Workflow 5b - Continuação de:**

← [Workflow 5a - Implementation](.windsurf/workflows/add-feature-5a-implementation.md)

**Pré-requisito**: GATE 2 do Workflow 5a deve estar APROVADO.

---

## ⚠️ REGRA CRÍTICA: USO MÁXIMO DE AGENTES

**SEMPRE usar máximo de agentes em paralelo** (Fase 12: por tipo de erro).

---

## 📚 Pré-requisito: Consultar Documentação Base

Antes de iniciar qualquer planejamento ou ação, SEMPRE ler:
- `docs/PLAN.md` - Visão estratégica atual
- `docs/TASK.md` - Status das tarefas em andamento
- `docs/pesquisa-de-mercado/` - Fundamentos científicos

> **💡 MCPs Úteis**: `supabase_lifetracker` (EXPLAIN ANALYZE queries lentas), `gemini-cli` (RCA profundo)
> Ver: `docs/integrations/MCP.md`

---

# Workflow 5b/9: Refactoring e Root Cause Analysis

Este é o **quinto workflow (parte B)** de 9 etapas modulares para adicionar uma nova funcionalidade.

**O que acontece neste workflow:**
- Instalação de Git Hooks (validação automática)
- Fase 12: Refactoring e Auto-Fix (se testes falharem)
- Root Cause Analysis (quando aplicável)
- Troubleshooting de problemas complexos

---

## 🔒 Git Hook - Validação Automática de Branch

**Instalar** (uma vez por repo):
```bash
./scripts/install-git-hooks.sh
# Ou manualmente:
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
BRANCH=$(git rev-parse --abbrev-ref HEAD)
[[ "$BRANCH" == "main" ]] && echo "❌ Não commit em main!" && exit 1
[[ "$BRANCH" == "HEAD" ]] && echo "❌ Detached HEAD!" && exit 1
exit 0
EOF
chmod +x .git/hooks/pre-commit
```

**Benefícios**: 0% commits acidentais em main, histórico limpo, code review mais fácil

---

## 🔄 Fase 12: Refactoring e Auto-Fix

**Refatorar quando**: Código duplicado, funções > 50 linhas, nomes ruins, magic numbers

**Auto-Fix de Testes**:
1. **Tentativa 1**: Logs → Causa → Fix → Rerun → Commit
2. **Tentativa 2**: Se falhar, solução alternativa
3. **Se falhar 2x**: Pedir ajuda com logs

**Bugs Complexos**: Ver `/debug-complex-problem` workflow (5 agentes paralelos)

---

## 🔍 Root Cause Analysis (RCA) - QUANDO APLICÁVEL

**⚠️ USAR APENAS SE**: Você está debugando bugs de implementação, erros de lógica ou problemas recorrentes.

**PULAR ESTA SEÇÃO SE**: Testes passaram de primeira ou problema era trivial.

---

### Quando Usar RCA Neste Workflow

Use RCA na **Fase 12 (Auto-Fix)** quando:
- ✅ Bug recorrente (mesmo depois de "consertado", volta novamente)
- ✅ Erro de lógica não detectado em code review
- ✅ Testes falharam 2+ vezes (indica padrão)
- ✅ Bug intermitente (difícil de reproduzir consistentemente)
- ✅ Performance degradou após implementação
- ✅ Falha em edge case (volume alto, concorrência, etc)

**Exemplos práticos**:
- "Email não salva - já corrigi mas voltou" → **RCA necessário** (bug recorrente)
- "Typo em variável causou erro TypeScript" → **RCA NÃO necessário** (trivial)
- "Query lenta com > 100 registros" → **RCA necessário** (edge case)
- "Usuário cria 2 hábitos ao clicar rápido" → **RCA necessário** (race condition)
- "Form quebra com email inválido" → **RCA necessário** (falta validação)

---

### Técnica: 5 Whys para Bugs de Implementação

**Objetivo**: Identificar a causa raiz de bugs de código/lógica, não só o sintoma

**Processo**:
1. **Por quê falha?** → Descrição do erro observado no código
2. **Por quê não foi detectado?** → Falta de validação, teste ou review
3. **Por quê a validação não existe?** → Processo ou checklist incompleto
4. **Por quê o processo falhou?** → Ferramenta, documentação ou treinamento faltante
5. **Por quê não foi previsto?** → **CAUSA RAIZ** (fator fundamental)

**Template**:
- **Problema**: [O quê aconteceu]
- **Análise** (5 Whys): [Cada nível do "por quê"]
- **Causa Raiz**: [Fator fundamental identificado]
- **Fix**: [Correção específica do código]
- **Prevenção**: [Gate/checklist/teste para evitar recorrência]

---

### Exemplo Real 1: Email Não Salva (Schema-First)

```markdown
## 🔍 RCA - Email Não Salva Após Input do Usuário

**Problema**: Email fornecido pelo usuário não foi salvo no banco de dados

**Análise** (5 Whys):
1. Email não salvou → campo metadata.whatsapp_state retornou erro "column does not exist"
2. Coluna não existe → migration JSONB nunca foi executada
3. Migration não executada → código foi implementado ANTES de criar migration
4. Código antes de schema → TDD focou em lógica, não em database schema
5. TDD não incluiu schema → **CAUSA RAIZ**: Falta de checklist "Schema-First"

**Fix Aplicado**: Migration criando coluna antes de código
```sql
ALTER TABLE lifetracker_profiles ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
```

**Prevenção**: Gate "Schema validado?" no Workflow 4 antes de codificar
```

---

### Exemplo Real 2: Query Lenta com Volume Alto

```markdown
## 🔍 RCA - Dashboard Lento com > 100 Habit Entries (Performance)

**Problema**: Dashboard demora 8s para carregar com muitos registros

**Análise** (5 Whys):
1. Demora 8s → Query fazendo full table scan (sem índice)
2. Falta índice → Migration criou tabela sem otimização
3. Migration não otimizou → Workflow não verifica índices necessários
4. Workflow não checa → Performance testing é opcional (poucos dados)
5. Testing optativo → **CAUSA RAIZ**: Testes não incluem volume alto

**Fix Aplicado**: Adicionar índices críticos
```sql
CREATE INDEX idx_habit_entries_user_id ON lifetracker_habit_entries(user_id);
CREATE INDEX idx_habit_entries_created_at ON lifetracker_habit_entries(created_at DESC);
```

**Prevenção**: Workflow 6 adicionar teste com 100+ registros; Code review verificar índices
```

---

**Mais exemplos**: Ver `docs/guides/ROOT_CAUSE_ANALYSIS.md` para race conditions, validação e outros cenários.

---

## 🕸️ Resolução em Teia (DEPOIS do RCA)

**CRÍTICO**: Se você executou RCA (5 Whys), SEMPRE mapear teia completa ANTES de implementar fix.

**Por quê**: Causa raiz pode afetar múltiplos arquivos/features. Resolver apenas 1 arquivo = bug volta em outro lugar.

---

### Quando Aplicar (Mesmo Contexto que RCA)

Use Resolução em Teia quando usar RCA:
- ✅ Bug recorrente (volta mesmo depois de "consertado")
- ✅ Erro de lógica não detectado em code review
- ✅ Testes falharam 2+ vezes (indica padrão)
- ✅ Bug intermitente (difícil reproduzir)
- ✅ Performance degradou após implementação
- ✅ Falha em edge case (volume alto, concorrência)

---

### Checklist Resolução em Teia (OBRIGATÓRIO)

**Ver** `.claude/CLAUDE.md` Regra 4B para metodologia completa.

**Resumo rápido** (14 checks em 3 grupos):

**1. Mapeamento da Teia** (5 checks):
- [ ] Listei TODOS arquivos que importam/exportam código afetado?
- [ ] Identifiquei TODAS funções chamadas/chamadoras?
- [ ] Mapeei TODAS tabelas/queries relacionadas?
- [ ] Encontrei TODOS componentes que consomem dados afetados?
- [ ] Busquei TODA documentação relacionada?

**2. Análise de Impacto** (4 checks):
- [ ] Avaliei impacto da mudança em CADA conexão mapeada?
- [ ] Busquei padrões similares no codebase?
- [ ] Validei se outros lugares têm mesmo problema?
- [ ] Identifiquei testes faltantes?

**3. Resolução Holística** (5 checks):
- [ ] Vou corrigir causa raiz (RCA)?
- [ ] Vou corrigir TODOS padrões similares identificados?
- [ ] Vou atualizar TODA documentação relacionada?
- [ ] Vou adicionar testes para TODA teia mapeada?
- [ ] Vou validar que não introduzi regressões?

---

### Ferramentas de Mapeamento

```bash
# 1. Buscar imports/exports do arquivo afetado
grep -r "import.*from.*arquivo-afetado" src/ supabase/

# 2. Buscar chamadas da função problemática
grep -r "funçãoProblematica(" src/ supabase/

# 3. Buscar referências no database
grep -r "lifetracker_tabela_afetada" supabase/

# 4. Buscar em documentação
grep -r "feature-afetada" docs/

# 5. Histórico git (casos passados similares)
git log --all --grep="keyword-relacionada"
```

---

### Exemplo Prático

**Problema**: "Email não salva no onboarding"

**RCA identificou**: Faltava validação de formato antes de INSERT

**Resolução em Teia MAPEIA**:
- Backend: 3 Edge Functions fazem INSERT de email (não apenas 1!)
- Frontend: 2 componentes com formulário de email
- Database: Constraint NULL em lifetracker_profiles.email
- Docs: README menciona "email obrigatório" (desatualizado)
- Testes: Zero testes de validação de email

**Resolução COMPLETA** (não apenas pontual):
1. ✅ Adicionar validação em TODOS 3 Edge Functions
2. ✅ Adicionar validação client-side nos 2 formulários
3. ✅ Atualizar constraint DB (NOT NULL + formato)
4. ✅ Atualizar README com regra validação
5. ✅ Adicionar 5 unit tests (validação email)
6. ✅ Adicionar 1 E2E test (fluxo completo onboarding)

---

### ⚠️ Se NÃO Executar Resolução em Teia

**Risco ALTO**: Bug recorre em outros arquivos com mesmo padrão (ex: corrigiu webhook A, mas webhook B continua quebrado).

**Resultado**: Retrabalho, testes quebram novamente, usuário reporta bug "já corrigido".

---

**Próxima Fase**: Após completar Resolução em Teia, prosseguir com implementação dos fixes.

---

### Como Aplicar RCA no Auto-Fix (Fase 12)

**Passo a passo**:
1. Teste falhou (1ª ou 2ª tentativa)
2. Analisar logs detalhadamente → Reproduzir erro
3. Executar 5 Whys → Encontrar causa raiz (não só sintoma)
4. Aplicar fix específico que resolve raiz
5. Adicionar prevenção (teste, checklist, validação)
6. Re-rodar testes → Validar fix
7. Documentar em commit message + TASK.md

**Commit após RCA** (exemplo):
```
fix: adicionar índice user_id para performance

Problema: Dashboard lento (8s) com > 100 habit entries
Causa Raiz: Full table scan → falta índice user_id
Fix: CREATE INDEX idx_habit_entries_user_id
Resultado: 8s → 200ms (40x mais rápido)

Prevenção:
- Teste E2E com 100+ registros
- Code review: verificar índices em foreign keys
- Documentação atualizada
```

---

### Benefícios do RCA:
✅ Bugs não voltam | ✅ Codebase mais robusto | ✅ Time aprende | ✅ Code review melhora

### Quando PULAR RCA:
❌ Erro trivial (typo) | ❌ Testes OK | ❌ Fix óbvio | ❌ Primeira ocorrência

---

### Anti-Patterns a Evitar em RCA

❌ **Tratar sintoma em vez de causa**: Adicionar try/catch sem perguntar "por quê não validou antes?"

❌ **RCA superficial**: Parar no "variável undefined" sem investigar "por quê não foi inicializada?"

❌ **Ignorar padrões**: Arrumar um bug mas não prevenir recorrência (adicionar teste/checklist)

❌ **Prevenção fraca**: "Vou ficar mais atento" não é prevenção. Adicionar checklist/linting/teste

✅ **Padrão correto**: Sintoma → 5 Whys → Causa Raiz → Fix + Prevenção (automática)

---

### Próximo Passo Após RCA

Se identificou causa raiz sistêmica:
1. **Atualizar Workflow**: Adicionar gate/checklist ("Schema validado?" antes de codificar)
2. **Meta-Learning**: Documentar lesson learned + pattern a evitar
3. **Code Review Checklist**: Adicionar item em `scripts/code-review.sh`
4. **Ferramental**: ESLint rule + Teste E2E para caso não coberto

---

## ✅ Checkpoint: Implementação Completa!

**Status**:
- ✅ Código com TDD + Git hooks + RCA documentado
- ✅ Testes passando (TypeScript, ESLint, Vitest, Build)
- ✅ Commits locais (~8-12)
- ⚠️ Código NÃO foi commitado remotamente ainda

**Próxima etapa**: **PARADA OBRIGATÓRIA** para você testar manualmente!

---

---

## 🧠 Meta-Learning: Captura de Aprendizados

**⚠️ CRÍTICO - NÃO PULE**: Esta fase é fundamental para evolução contínua do sistema.

**Objetivo**: Identificar melhorias nos workflows, scripts e processos baseado na execução desta feature.

### Questões de Reflexão (Responder TODAS)

**1. Eficiência do Workflow (Nota 1-10):**
- [ ] Nota atribuída: __/10
- [ ] Se nota < 8: Qual fase foi ineficiente? Como melhorar?
- [ ] Alguma fase tomou muito tempo? Qual? Por quê?

**2. Iterações com Usuário:**
- [ ] Número de iterações necessárias: __
- [ ] Se > 3 iterações: O que causou múltiplas idas e vindas?
- [ ] Como tornar workflow mais autônomo/claro para próxima vez?

**3. Gaps Identificados:**
- [ ] Alguma validação faltou? (Se SIM: qual? onde inserir checklist?)
- [ ] Algum gate falhou para detectar erro? (Se SIM: qual gate melhorar?)
- [ ] Algum comando foi repetido 3+ vezes? (Se SIM: automatizar em script?)

**4. Root Cause Analysis (RCA) - Se identificou problema:**
- [ ] Problema: [descrever brevemente]
- [ ] 5 Whys aplicados? (validar causa raiz sistêmica, não sintoma pontual)
- [ ] Causa raiz afeta múltiplas features? (SE NÃO: descartar learning - não é sistêmico)
- [ ] Meta-learning previne recorrência? (não apenas corrige sintoma desta feature)

### Ações de Melhoria (Se Aplicável)

**Documentação a atualizar:**
- [ ] Este workflow (.md) precisa melhorias? → Descrever alterações necessárias
- [ ] CLAUDE.md precisa novo padrão/seção? → Especificar o quê
- [ ] Novo script seria útil? → Nome do script + função
- [ ] ADR necessário? → Decisão arquitetural a documentar

**ROI Esperado:** [Estimar ganho - ex: "20min economizadas por feature futura" ou "Previne bug que custaria 2h debugging"]

### ⚠️ IMPORTANTE

- **Só documentar learnings SISTÊMICOS** (não pontuais/específicos desta feature)
- **Aplicar RCA obrigatoriamente** para validar se é realmente sistêmico
- **Consolidação final** acontece no Workflow 8a (Meta-Learning centralizado)

### Validação de Tamanho do Workflow

```bash
# Se você fez alterações neste workflow, validar tamanho
wc -c .windsurf/workflows/NOME_DESTE_WORKFLOW.md
# ✅ Espera: < 12000 chars (12k limit)
# ❌ Se > 12000: Comprimir ou dividir workflow
```

**Checklist de Otimização** (se workflow > 11k chars):
- [ ] Remover exemplos redundantes
- [ ] Consolidar checklists similares
- [ ] Extrair detalhes para docs/
- [ ] Dividir em 2 workflows (se > 12k)

---

## 🚨 REGRA CRÍTICA: ANTI-ROI

**NUNCA calcule ou mencione**:
- ❌ ROI (Return on Investment)
- ❌ Tempo de execução/produção
- ❌ "Horas economizadas"
- ❌ Estimativas temporais (Xmin vs Ymin)

**Por quê**:
- Projeto desenvolvido por IA (não humanos)
- IA executa tarefas em paralelo (não linear)
- Cálculos consomem tokens sem valor
- Polui documentação com dados irrelevantes

**Permitido**:
- ✅ Evidências concretas (código, logs, testes)
- ✅ Comparações qualitativas ("mais rápido", "mais eficiente")
- ✅ Métricas técnicas (latência, throughput, memory usage)

**Regra**: NEVER guess time/ROI. Use dados concretos ou não mencione.

---

## 🔄 Próximo Workflow (Automático)

```
Acionar workflow: .windsurf/workflows/add-feature-6-user-validation.md
```

**Ou você pode continuar manualmente digitando**: `/add-feature-6-user-validation`

---

## 📝 Atualização Obrigatória de Documentação

Após completar este workflow, SEMPRE atualizar:

1. **`docs/TASK.md`**: Marcar tarefas implementadas como concluídas
2. **`docs/PLAN.md`**: Se houver mudança estratégica ou aprendizado importante

---

**Workflow criado em**: 2025-11-04
**Parte**: 5b de 9
**Próximo**: User Validation (Validação Manual - CRÍTICO!)
