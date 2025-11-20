---
description: Workflow Add-Feature (6b/9) - RCA e Edge Cases (Root Cause Analysis)
auto_execution_mode: 1
---

# ⏮️ CONTINUAÇÃO DO WORKFLOW 6a

**Este é o Workflow 6b - Continuação de:**

← [Workflow 6a - User Validation](.windsurf/workflows/add-feature-6a-user-validation.md)

**Pré-requisito**: GATE 3 do Workflow 6a deve estar APROVADO.

---

## 📚 Pré-requisito: Consultar Documentação Base

Antes de iniciar qualquer planejamento ou ação, SEMPRE ler:
- `docs/PLAN.md` - Visão estratégica atual
- `docs/TASK.md` - Status das tarefas em andamento
- `README.md` - Descrição do projeto
- `AGENTS.md` - Comportamento dos agents
- `.windsurf/workflows` - Todos workflows em etapas (arquivos diferentes)
- `docs/` - Todos documentos importantes
- `scripts/` - Todos scrips importantes

---

## ⚠️ REGRA CRÍTICA: USO MÁXIMO DE AGENTES

**SEMPRE usar o MÁXIMO de agentes possível em paralelo** para todas as fases deste workflow.

**Benefícios:**
- ⚡ Redução drástica do tempo de execução (até 36x mais rápido)
- 🎯 Melhor cobertura de análise
- 🚀 Maior throughput de tarefas

---

## 🧠 FASE 0: LOAD CONTEXT (Script Unificado)

**⚠️ USAR SCRIPT** (não Read manual):

```bash
./scripts/context-load-all.sh feat-nome-feature
```

**Output**: Resumo 6 arquivos .context/ (INDEX, workflow-progress, temp-memory, decisions, attempts.log, validation-loop).

**SE script falhar**: Fallback manual (Read 6 arquivos).

**Benefício**: Consolidated context loading vs manual Fase 0 (redução tempo).
---

## 🔍 Root Cause Analysis (RCA) - QUANDO APLICÁVEL

**⚠️ USAR APENAS SE**: Você encontrou bugs durante validação manual ou problemas reportados por usuário.

**PULAR ESTA SEÇÃO SE**: Feature funcionou perfeitamente de primeira ou problemas eram triviais.

---

### Quando Usar RCA Neste Workflow

Use RCA na **Fase 14 (Feedback)** quando:
- ✅ Bug reportado pelo usuário durante testes manuais
- ✅ Edge case não coberto (dados vazios, muitos dados, inválidos)
- ✅ Problema de UX/UI que deveria ter sido detectado antes
- ✅ Funcionalidade quebrou algo existente (regressão)
- ✅ Performance degradou (lento, travou, vazamento memória)

**Exemplos**:
- "Card não exibe dados vazios corretamente" → RCA necessário (edge case)
- "Botão está desalinhado 2px" → RCA NÃO necessário (ajuste trivial)
- "Clicar rápido 2x cria duplicado" → RCA necessário (race condition)

---

### Técnica: 5 Whys para Bugs de Validação

**Objetivo**: Identificar causa raiz de problemas encontrados em testes manuais

**Template**:

```markdown
## 🔍 Root Cause Analysis (5 Whys)

**Problema Reportado**: [Descrever bug encontrado em testes manuais]

**Análise**:

1. **Por quê o problema não foi detectado antes?**
   → [Resposta - falha em fase anterior]

2. **Por quê essa fase não detectou?**
   → [Resposta - teste/validação faltante]

3. **Por quê teste/validação não existia?**
   → [Resposta - checklist incompleto]

4. **Por quê checklist não cobria?**
   → [Resposta - processo com lacuna]

5. **Por quê processo tem lacuna?**
   → [Resposta - CAUSA RAIZ]

**Causa Raiz Identificada**: [Resumo da causa raiz]

**Fix Aplicado**: [Correção específica do código/UI]

**Prevenção Futura**: [Atualizar workflow/checklist/teste automatizado]
```

---

### Exemplos Reais de RCA (2 Casos Principais)

**Nota**: Para mais exemplos detalhados (regressão, performance, acessibilidade), consulte:
→ `docs/guides/ROOT_CAUSE_ANALYSIS.md`

---

### Exemplo Real 1: Edge Case Não Coberto (dados vazios)

```markdown
## 🔍 RCA - Card Mostra "undefined" com Dados Vazios

**Problema**: ProfitCard exibe "undefined" quando usuário não tem transações

**Análise**:
1. Por quê mostra "undefined"?
   → Código assume que data sempre existe (data.total)
2. Por quê assume que data existe?
   → Hook useProfit não trata caso de array vazio
3. Por quê hook não trata?
   → TDD (Workflow 5) só testou com dados mockados (happy path)
4. Por quê TDD não testou edge case?
   → Checklist de testes (Fase 11) não incluiu "dados vazios"
5. Por quê checklist não incluiu?
   → CAUSA RAIZ: Workflow 6 tem edge cases, mas não "retrofeed" para Workflow 5

**Causa Raiz**: Edge cases detectados em Workflow 6 não geram testes automatizados retroativos

**Fix Aplicado**:
```typescript
const total = data?.length > 0 ? data[0].total : 0; // ✅ Trata vazio
```

**Prevenção Futura**:
- ✅ Workflow 5: Adicionar teste com dados vazios
- ✅ Workflow 6: Se encontrar edge case, criar teste automatizado
- ✅ Code review: "Código trata dados vazios/null/undefined?"
```

---

### Exemplo Real 2: Problema de UX (double-click)

```markdown
## 🔍 RCA - Usuário Reporta Duplicação ao Clicar Rápido

**Problema**: Se usuário clica botão "Salvar" 2x rápido, cria 2 registros duplicados

**Análise**:
1. Por quê duplica?
   → Botão não tem proteção contra double-click
2. Por quê não tem proteção?
   → Código implementado sem considerar UX de clicks rápidos
3. Por quê não foi considerado?
   → Testes automatizados (Workflow 5) não simulam double-click
4. Por quê não simulam?
   → Vitest testa lógica, não interação de usuário real
5. Por quê interação real não é testada?
   → CAUSA RAIZ: Workflow 6 findings não viram testes E2E

**Causa Raiz**: Problemas de UX encontrados em testes manuais não geram testes E2E automatizados

**Fix Aplicado**:
```typescript
<Button disabled={isLoading || isSaving}>
  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isLoading ? 'Salvando...' : 'Salvar'}
</Button>
```

**Prevenção Futura**:
- ✅ Workflow 5: Template de Button com disabled={isLoading} por padrão
- ✅ Workflow 6: Adicionar teste de double-click na Fase 13.3
- ✅ Code review: "Botões de mutation têm disabled={isLoading}?"
```

---

### Como Aplicar RCA na Validação Manual (Fase 14)

**Fluxo de RCA**:
1. Usuário reporta problema (Fase 13)
2. Reproduzir bug + Executar 5 Whys
3. Aplicar fix que resolve causa raiz
4. Atualizar Workflow 6 (checklist permanente)
5. Criar teste automatizado se aplicável
6. Re-testar + Commit

**Exemplo de commit após RCA**:
```bash
git commit -m "fix: double-click protection em SaveButton

Problema: Usuário reportou duplicação ao clicar rápido
Causa Raiz: Workflow 6 não testava interações de usuário real
Fix: disabled={isLoading} + loading spinner

Prevenção: Checklist de double-click adicionado ao Workflow 6"
```

---

### Benefícios do RCA em Validação Manual:

- ✅ Bugs não voltam (checklist permanente)
- ✅ Testes E2E crescem com problemas reais
- ✅ Qualidade aumenta (detecta classes de problemas, não instâncias isoladas)

---

### Quando PULAR RCA

**NÃO usar RCA se**:
- ❌ Ajuste trivial de UI (cor, espaçamento, typo)
- ❌ Feature funcionou perfeitamente de primeira
- ❌ Bug óbvio com causa clara (ex: variável com nome errado)
- ❌ Primeira ocorrência sem padrão

**Economiza tempo**: Use RCA para problemas que revelam lacunas sistêmicas.

---

## 🕸️ DEPOIS DO RCA: Resolução em Teia (OBRIGATÓRIO)

**CRÍTICO**: Após executar 5 Whys e identificar causa raiz, aplicar **Resolução em Teia**.

**Objetivo**: Mapear TODA teia de código/docs/testes conectados à causa raiz e resolver holisticamente (não apenas 1 arquivo).

**Checklist rápido**:
- [ ] Mapeei TODOS arquivos conectados (import/export)?
- [ ] Identifiquei TODAS funções relacionadas?
- [ ] Busquei padrões similares no codebase?
- [ ] Vou atualizar TODA documentação relacionada?
- [ ] Vou adicionar testes para TODA teia?

**Ferramentas**:
```bash
# Buscar conexões
grep -r "import.*from.*arquivo-afetado" src/ supabase/
grep -r "funçãoAfetada(" src/ supabase/
grep -r "tabela_afetada" supabase/
```

**Ver metodologia completa**: `.claude/CLAUDE.md` → Regra 4B (Resolução em Teia)

**Workflows relacionados**:
- Workflow 5b (Refactoring & RCA) - Metodologia completa
- debug-complex-problem (Fase 3.5) - Multi-agent approach

---

### Próximo Passo Após RCA

Se identificou causa raiz sistêmica:

1. **Atualizar Workflow 6**: Adicionar item em checklist (Fase 13.2/13.3)
2. **Atualizar Workflow 5**: Criar teste automatizado se aplicável
3. **Criar Teste E2E**: Para problemas de UX/interação (Playwright)
4. **Meta-Learning**: Documentar padrão a evitar/adotar (Workflow 8)

---

## ✅ Checkpoint: Validação Manual Completa!

**Feature validada e aprovada pelo usuário!**

**Próximas etapas**:
- Code Review (Workflow 7)
- Security Scan (Workflow 7)
- Documentação + Commit + Push

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

## 🧠 FASE FINAL: UPDATE CONTEXT (.context/ - OBRIGATÓRIO)

**⚠️ CRÍTICO**: SEMPRE atualizar `.context/` APÓS workflow.

### F.1. Atualizar workflow-progress.md

```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')

cat >> .context/${BRANCH_PREFIX}_workflow-progress.md <<EOF

### Workflow 6b: RCA & Edge Cases ✅ COMPLETO
- **Data**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')
- **Actions**:
  - RCA realizado (se bugs encontrados)
  - 5 Whys executados para causa raiz
  - Resolução em Teia (mapeamento completo)
  - Edge cases validados
- **Outputs**:
  - Causa raiz identificada e corrigida (se aplicável)
  - Documentação atualizada
  - Testes adicionados para prevenir recorrência
- **Next**: Workflow 7a (Quality Gates)
EOF
```

### F.2. Atualizar temp-memory.md

```bash
# Atualizar seção "Estado Atual"
cat > /tmp/temp-memory-update.md <<'EOF'
## Estado Atual

Workflow 6b (RCA & Edge Cases) concluído com sucesso.

**RCA executado**: [SIM/NÃO - se SIM, descrever causa raiz]

**Próximo passo**: Executar Workflow 7a (Quality Gates) para code review e security scan.

---

## Próximos Passos

- [ ] Executar Workflow 7a (Quality Gates)
- [ ] Code review automatizado
- [ ] Security scan

---

## Decisões Pendentes

Nenhuma.

EOF

# Substituir seção no arquivo original (preservar "Última Atualização")
sed -i.bak '/## Estado Atual/,/## Bloqueios\/Questões/{//!d;}' .context/${BRANCH_PREFIX}_temp-memory.md
cat /tmp/temp-memory-update.md >> .context/${BRANCH_PREFIX}_temp-memory.md
rm /tmp/temp-memory-update.md
```

### F.3. Atualizar decisions.md (Se Decisões Tomadas)

**⚠️ Só atualizar se DECISÃO foi tomada no workflow.**

```bash
# Exemplo: Se identificamos necessidade de atualizar workflow
cat >> .context/${BRANCH_PREFIX}_decisions.md <<EOF

## Workflow 6b - RCA & Edge Cases
- **Decisão**: [Descrever decisão - ex: "Adicionar teste automatizado para edge case"]
- **Por quê**: [Motivo - ex: "RCA identificou gap no Workflow 5"]
- **Trade-off**: [Ex: "+30min implementação, previne bugs futuros"]
- **Alternativas consideradas**: [Listar opções rejeitadas]
- **Data**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')
EOF
```

### F.4. Log em attempts.log

```bash
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] WORKFLOW: 6b (RCA & Edge Cases) - COMPLETO" >> .context/${BRANCH_PREFIX}_attempts.log
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] RCA: [Executado/Não aplicável] - [Causa raiz se executado]" >> .context/${BRANCH_PREFIX}_attempts.log
```

### F.5. Validação Context Updated

**Checklist Pós-Workflow**:
- [ ] Atualizei workflow-progress.md?
- [ ] Atualizei temp-memory.md (Estado Atual + Próximos Passos)?
- [ ] Atualizei decisions.md (se decisão tomada)?
- [ ] Logei em attempts.log (WORKFLOW COMPLETO + RCA)?

**Se NÃO atualizou**: ⛔ PARAR e atualizar AGORA.

---

## 🔄 VALIDATION LOOP (OBRIGATÓRIO - Workflows Iterativos)

**APLICÁVEL**: Se este workflow envolve validação manual/iterativa (RCA, edge cases, debugging).

**Sistema**: Registrar TODAS interações em `.context/{branch}_validation-loop.md`.

### Quando Usar Validation Loop

**Usar SE**:
- [ ] RCA executado (bugs encontrados durante validação)
- [ ] Iterações esperadas (edge cases, ajustes descobertos)
- [ ] Feedback qualitativo (causa raiz, padrões sistêmicos)

**NÃO usar SE**:
- Workflow 100% automatizado
- Zero interação usuário/tester
- Output determinístico

### Criar Validation Loop File (SE aplicável)

```bash
BRANCH=$(git branch --show-current | sed 's/\//-/g')

cat > .context/${BRANCH}_validation-loop.md <<'EOF'
# Validation Loop - Workflow 6b (RCA & Edge Cases)

**Data Início**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')
**Status**: 🔄 Em Progresso

---

## Iteração 1 - $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')

### ✅ 1. [TÍTULO VALIDAÇÃO]

**Cenário**: [Contexto específico - ex: Edge case dados vazios]

**Steps**:
1. [Reproduzir bug]
2. [Executar 5 Whys]
3. [Aplicar fix]

**Validação**:
- [ ] [Critério 1 - ex: Bug reproduzido]
- [ ] [Critério 2 - ex: Causa raiz identificada]

**Resultado**: ✅ SUCESSO | ❌ FALHA

**RCA (se falha)**:
1. Por quê X? → Y
2. Por quê Y? → Z
...
5. **Causa Raiz**: [Sistêmica]

**Fix Aplicado**: [Descrição]

**Meta-Learning**: [Se sistêmico - adicionar ao Workflow 8]

---

EOF

echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] VALIDATION LOOP: Created ${BRANCH}_validation-loop.md" >> .context/${BRANCH}_attempts.log
```

### Atualizar a Cada Iteração

```bash
cat >> .context/${BRANCH}_validation-loop.md <<'EOF'

## Iteração [N] - [DATA HORA ATUAL]

[Preencher template acima]

EOF
```

### Consolidar ao Final

```bash
# Atualizar status
sed -i 's/Status\*\*: 🔄 Em Progresso/Status**: ✅ Completo/' .context/${BRANCH}_validation-loop.md

# Adicionar resumo
cat >> .context/${BRANCH}_validation-loop.md <<'EOF'

---

## 📊 Resumo Final

- **Total Iterações**: [NÚMERO]
- **Bugs Encontrados**: [NÚMERO]
- **RCAs Executados**: [NÚMERO]
- **Meta-Learnings**: [NÚMERO sistêmicos]
- **Taxa Sucesso**: [%]

EOF
```

### Benefícios

**Evidência** (Meta-Learning #3 - Workflow 6a aprovado):
- Zero perda contexto (LLMs não perdem estado)
- 100% rastreabilidade (debugging cases futuros)
- Meta-learnings emergem (padrões visíveis)
- Sistema de loop "foi sensacional" (aprovação usuário)

**Referências**:
- Template: `.windsurf/templates/validation-checklist-template.md`
- Exemplo: `.context/feat-modal-primeiro-acesso-web_validation-loop.md` (24 iterações)
- Meta-Learning #3: Validation Loop Pattern

---

## 🔄 Próximo Workflow (Automático)

```
Acionar workflow: .windsurf/workflows/add-feature-7-quality.md
```

**Ou você pode continuar manualmente digitando**: `/add-feature-7-quality`

---

**Workflow criado em**: 2025-10-27 | **Dividido em**: 2025-11-04
**Parte**: 6b de 11 (Parte 2 de 2)
**Próximo**: Quality (Code Review + Security)
