---
description: Workflow Add-Feature (6a/9) - User Validation (Validação Manual - CRÍTICO!)
auto_execution_mode: 1
---

## 📚 Pré-requisito
Ler: `docs/PLAN.md`, `docs/TASK.md`, `.windsurf/workflows/`, `docs/`

---

## ⚠️ REGRA CRÍTICA: USO MÁXIMO DE AGENTES
**SEMPRE usar o MÁXIMO de agentes possível em paralelo** (até 36x mais rápido).

---

# Workflow 6a/11: User Validation

---

## 🧠 FASE 0: LOAD CONTEXT (.context/ - OBRIGATÓRIO)

**⚠️ CRÍTICO**: SEMPRE ler `.context/` ANTES de qualquer ação.

### 0.1. Ler INDEX.md (Guia de Leitura)

```bash
cat .context/INDEX.md
```

**Entender**:
- Ordem de leitura dos arquivos
- O que cada arquivo faz
- Checklists obrigatórios

### 0.2. Ler Context Files (Ordem Definida em INDEX.md)

```bash
# Prefixo da branch (ex: feat-members)
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')

# 1. Onde estou agora?
cat .context/${BRANCH_PREFIX}_workflow-progress.md

# 2. Estado atual resumido
cat .context/${BRANCH_PREFIX}_temp-memory.md

# 3. Decisões já tomadas
cat .context/${BRANCH_PREFIX}_decisions.md

# 4. Histórico completo (últimas 30 linhas)
tail -30 .context/${BRANCH_PREFIX}_attempts.log

# 5. Loop de validação (CRÍTICO para Workflow 6)
cat .context/${BRANCH_PREFIX}_validation-loop.md
```

### 0.3. Validação Context Loaded

**Checklist**:
- [ ] Li INDEX.md?
- [ ] Li workflow-progress.md (onde estou)?
- [ ] Li temp-memory.md (estado atual)?
- [ ] Li decisions.md (decisões já tomadas)?
- [ ] Li últimas 30 linhas de attempts.log?
- [ ] Li validation-loop.md (tentativas anteriores)?

**Se NÃO leu**: ⛔ PARAR e ler AGORA.

### 0.4. Log Início Workflow

```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] WORKFLOW: 6a (User Validation) - START" >> .context/${BRANCH_PREFIX}_attempts.log
```

---

**O que acontece**:
- Fase 12.5: Reframing Pré-Validação
- Fase 13: PARADA OBRIGATÓRIA - Testar Manualmente
- Fase 14: Ciclo de Feedback
- GATE 3: Usuário confirma "funciona perfeitamente!"

**⚠️ NENHUM commit foi feito ainda!** Código está na branch local esperando SUA aprovação.

---

## 🔄 Fase 12.5: Reframing Pré-Validação

**ANTES de testar**, validar se estamos testando o problema CERTO.

### 3 Passos
1. **Questionar**: O que usuário REALMENTE pediu? Resolve raiz ou sintoma?
2. **Perspectiva**: Como usuário usaria? Qual dor resolvemos? Casos não considerados?
3. **⭐ Pergunta Forte**:
   > "Qual problema, se resolvido, eliminaria múltiplos sintomas?"

**Exemplo**:
```
❌ "Botão export PDF"
⭐ "Qual problema PDF + impressão + compartilhamento resolvem?"
✅ "Compartilhar progresso" → Link público + PDF opcional
```

**Decisão**:
- [ ] ✅ Continuar (problema CERTO)
- [ ] ⚠️ Ajustar (solução melhor)
- [ ] ❌ Repensar (problema mal definido)

---

## 🧪 Fase 13: PARADA OBRIGATÓRIA - Testar

> **💡 MCPs Úteis**: `playwright` (testes E2E automatizados)
> Ver: `docs/integrations/MCP.md`

```bash
npm run dev  # http://localhost:5173/
```

### 6.1 Batch Validation Pattern (RECOMENDADO) 🚀

**Objetivo**: Executar TODOS cenários → Coletar screenshots → Aprovar em BATCH (1 pausa vs 4 pausas).

**Benefício**: -50% tempo validação (6h → 3h), -75% pausas (4 → 1), menor fadiga usuário.

**Baseado em**: ML-CONTEXT-05 (Checkpoint Assíncrono - Batch Permitido para validações relacionadas)

---

#### Metodologia Batch

**1. Executar Cenários Sequencialmente (SEM pausas)**:
```markdown
**Cenário 1: Signup Web** ✅
- [ ] Executado
- [ ] Screenshot capturado (`screenshots/scenario-1-signup-web.png`)
- [ ] Resultado documentado

**Cenário 2: Signup WhatsApp** ✅
- [ ] Executado
- [ ] Screenshot capturado (`screenshots/scenario-2-signup-whatsapp.png`)
- [ ] Resultado documentado

**Cenário 3: Validação Cross-Channel** ✅
- [ ] Executado
- [ ] Screenshot capturado (`screenshots/scenario-3-cross-channel.png`)
- [ ] Resultado documentado

**Cenário 4: Constraint UNIQUE** ✅
- [ ] Executado
- [ ] Screenshot capturado (`screenshots/scenario-4-unique-constraint.png`)
- [ ] Resultado documentado
```

**2. Apresentar Batch Consolidado**:
```markdown
📸 **EVIDÊNCIAS BATCH (4 Cenários)**:

**Cenário 1: Signup Web**
![Screenshot 1](screenshots/scenario-1-signup-web.png)
- ✅ Signup completou
- ✅ DB atualizado
- ✅ Redirect funcionou

**Cenário 2: Signup WhatsApp**
![Screenshot 2](screenshots/scenario-2-signup-whatsapp.png)
- ✅ Phone validado
- ✅ Edge Function sucesso
- ✅ Profile criado

**Cenário 3: Validação Cross-Channel**
![Screenshot 3](screenshots/scenario-3-cross-channel.png)
- ✅ Trigger disparou
- ✅ Verificações invalidadas
- ✅ Log PostgreSQL confirmado

**Cenário 4: Constraint UNIQUE**
![Screenshot 4](screenshots/scenario-4-unique-constraint.png)
- ✅ Duplicação bloqueada
- ✅ Error code 23505
- ✅ Toast exibido

---

⏸️ **APROVAR BATCH (4 cenários)?**
- ✅ Aprovar todos (se todos passaram)
- ⚠️ Rejeitar parcial (especificar quais falharam)
```

**3. Aguardar 1 Aprovação (não 4)**

---

#### Quando NÃO usar Batch

❌ **Cenários independentes** (ex: signup Web + API externa não relacionada)
❌ **Ação crítica** (pode quebrar sistema, requer aprovação individual)
❌ **Contextos diferentes** (frontend + backend + DB em áreas desconectadas)

✅ **Usar Batch SE**:
- Cenários relacionados (mesmo fluxo E2E)
- Validação manual (não código)
- 3-5 cenários max (não 10+)

---

### Checklist Funcional
- [ ] Feature funciona (comportamento, dados, interações)
- [ ] Não quebrou features existentes
- [ ] UI correta (layout, cores, espaçamento)
- [ ] Responsivo OK (mobile < 640px, tablet, desktop)
- [ ] Performance < 500ms, sem travamentos
- [ ] Console limpo (F12 → sem erros)
- [ ] TypeScript OK (terminal)

### Edge Cases
- [ ] **Dados vazios**: Exibir mensagem amigável (não quebrar UI)
- [ ] **Muitos dados**: Testar com 100+ itens (verificar paginação/scroll virtual)
- [ ] **Dados inválidos**: Validação clara com mensagens de erro (form validation)
- [ ] **Offline**: DevTools → Network → Offline (se feature usa API externa)
- [ ] **Paths críticos** (testar TODOS os caminhos):
  - Happy path (fluxo principal sem erros)
  - Error path (falha de API, timeout, 500)
  - Recovery path (retry automático, fallback, cache)
  - Navigation path (voltar, cancelar, fechar modal)
- [ ] **Múltiplos usuários**: Testar com 2+ contas (validar RLS, isolamento de dados)
- [ ] **Performance edge**: Response > 1MB, renderização > 100 componentes

### Integração
- [ ] Supabase OK (busca, mutations, RLS)
- [ ] Queries < 500ms (DevTools → Network)
- [ ] Sem vazamento memória (interagir 1-2min)
- [ ] Build produção (`npm run build`)

---

## 🔄 Fase 14: Ciclo de Feedback

### 14.1 Problemas ⚠️

**NÃO prossiga! Descreva**:
- O que está errado?
- Como reproduzir?
- Esperado vs. atual?
- Screenshot/video?

**Fluxo**: Descreve → IA corrige (`fix:`) → Testes auto (Fase 11) → Testa (Fase 13) → Repete até perfeito

**🐛 Complexos**: Use `debug-complex-problem.md` (5 agentes, 5 Whys)

**Iterações esperadas**: 2-4 (normal)

### 14.2 Tudo OK ✅

**Confirme**:
- ✅ TODOS checkboxes marcados
- ✅ Performance OK, UI/UX como esperado
- ✅ Sem erros console, build OK

**Digite**: `Aprovar` ou `OK` ou `Funciona perfeitamente`

---

## ✅ GATE 3 CHECKLIST

**⛔ NÃO prosseguir sem ✅ em TODOS**

**Funcionalidade**
- [ ] Feature funciona conforme especificado
- [ ] Casos de uso testados (happy + edge)
- [ ] Integração OK

**Design & UX**
- [ ] Layout correto
- [ ] Cores consistentes
- [ ] Responsivo (375px, 768px, 1440px)
- [ ] Navegação teclado (Tab, Enter, Esc)
- [ ] Contraste WCAG AA
- [ ] Animações < 16ms/frame

**Qualidade Técnica**
- [ ] Console limpo (0 erros, 0 warnings críticos)
- [ ] Vite compila sem TS errors
- [ ] Performance (queries < 500ms, interações < 100ms)
- [ ] Build produção funciona
- [ ] TypeScript compila

**Integração**
- [ ] Supabase: salva/carrega OK
- [ ] RLS: não vê outros usuários
- [ ] Mutations funcionam
- [ ] Sem vazamento memória
- [ ] Queries otimizadas (sem N+1)

**Edge Cases**
- [ ] Dados vazios OK
- [ ] Muitos dados (> 100)
- [ ] Dados inválidos OK
- [ ] Offline testado
- [ ] Erros tratados

**Validação Executada**
- [ ] Batch validation executado (4 cenários em 1 aprovação) OU
- [ ] Validação individual justificada (cenários críticos/independentes)
- [ ] Screenshots de TODOS cenários coletados
- [ ] Aprovação recebida (batch ou individual)

**Se item NÃO está ✅**: Voltar Fase 14.1!

---

## ✋ GATE 3: Confirmação

**⚠️ PARADA OBRIGATÓRIA**

**Decisão**:
- **✅ APROVAR** - Todos checkboxes ✅
- **⚠️ AJUSTAR** - Problemas, volta 14.1

**Aguardando confirmação...** 🚦

---

## 🧠 Meta-Learning

**⚠️ NÃO PULE**: Fundamental para evolução.

### Questões (TODAS)

**1. Eficiência (1-10):**
- [ ] Nota: __/10
- [ ] Se < 8: Qual fase? Como melhorar?

**2. Iterações:**
- [ ] Número: __
- [ ] Se > 3: O que causou? Como automatizar?

**3. Gaps:**
- [ ] Validação faltou? Gate falhou?
- [ ] Comando repetido 3+ vezes? Automatizar?

**4. RCA (se problema):**
- [ ] Problema: [breve]
- [ ] 5 Whys? Causa raiz sistêmica?
- [ ] Afeta múltiplas features? (SE NÃO: descartar)
- [ ] Meta-learning previne?

### Ações (Se Aplicável)
- [ ] Workflow precisa melhorias?
- [ ] CLAUDE.md precisa seção?
- [ ] Novo script? Nome + função
- [ ] ADR necessário?

**ROI**: [Ex: "20min/feature" ou "Previne 2h debug"]

**Só learnings SISTÊMICOS** (não pontuais)

**Validar tamanho**:
```bash
wc -c .windsurf/workflows/add-feature-6a-user-validation.md  # ✅ < 12000
```

**Se > 11k**: Remover exemplos, consolidar checklists, extrair para docs/

---

## ⏭️ CONTINUAÇÃO

**Continua em**: [Workflow 6b - RCA e Edge Cases](.windsurf/workflows/add-feature-6b-rca-edge-cases.md)

**Próximas etapas**:
- Análise Root Cause
- Testes edge cases
- Validação final

---

## 📝 Atualização Docs

**Obrigatório**
- [ ] Atualizar `docs/TASK.md`
- [ ] Atualizar `docs/PLAN.md` (se mudança estratégica)

**Se Criou Docs**
- [ ] Adicionar em `docs/INDEX.md`, `README.md`
- [ ] Nomes consistentes
- [ ] "Última atualização"

**Se Decisão Arquitetural**
- [ ] Criar ADR `docs/adr/`
- [ ] Referenciar `docs/ARCHITECTURE.md`

**Boas Práticas**: Não criar docs desnecessários, manter atualizados, links absolutos (`/docs/`), versionamento

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

## ✅ FASE 4: CHECKPOINTS (REGRA #13 - Uma Ação Por Vez)

**CRÍTICO**: Durante todo este workflow, SEMPRE executar checkpoint após CADA ação atômica.

### 4.1. O que é uma Ação Atômica?

**Ação atômica** = Menor unidade testável e reversível.

**Exemplos deste workflow (User Validation)**:
- ✅ "Testar fluxo de login manualmente"
- ✅ "Validar responsividade em mobile (screenshot)"
- ✅ "Executar teste E2E com Playwright"
- ✅ "Validar performance de query (< 2s)"
- ✅ "Coletar feedback do usuário sobre feature X"
- ❌ "Validar tudo de uma vez" (NÃO atômico - múltiplas ações)

### 4.2. Checkpoint Obrigatório (Após Cada Ação)

**Usar script automatizado**:
```bash
./scripts/checkpoint.sh "descrição da ação executada"
```

**Ou manualmente**:

**Template de Checkpoint**:
```
✅ AÇÃO COMPLETA: [descrição da ação]

📸 EVIDÊNCIA:
[screenshot ANTES/DEPOIS, log de teste, feedback usuário]

🔍 VALIDAÇÃO:
- [x] Teste executado com sucesso
- [x] Comportamento esperado confirmado
- [x] Screenshot capturado (se UI)
- [x] Próxima ação identificada

🎯 PRÓXIMA AÇÃO PROPOSTA:
[descrição da próxima ação]

⏸️ AGUARDANDO APROVAÇÃO do usuário para continuar.
```

### 4.3. Checklist Checkpoint (Executar a Cada Ação)

- [ ] **Executei apenas 1 ação?**
- [ ] **Mostrei evidência ao usuário?** (screenshot, log, feedback)
- [ ] **Usuário validou?** (aprovação explícita)
- [ ] **Documentei em `.context/`?** (attempts.log + validation-loop.md)
- [ ] **Identifiquei próxima ação?** (próximo teste a executar)

### 4.4. Exemplo de Aplicação (User Validation)

**Fluxo com Checkpoints**:

```
1. AÇÃO: "Screenshot ANTES da mudança (baseline)"
   → Executar → Checkpoint → Aprovação

2. AÇÃO: "Testar fluxo de login manualmente"
   → Executar → Checkpoint → Aprovação

3. AÇÃO: "Screenshot DEPOIS (validar UI)"
   → Executar → Checkpoint → Aprovação

4. AÇÃO: "Executar teste E2E com Playwright"
   → Executar → Checkpoint → Aprovação

5. AÇÃO: "Validar performance (latência < 2s)"
   → Executar → Checkpoint → Aprovação
```

### 4.5. Quando NÃO Aplicar Checkpoint

**Exceções** (ações podem ser agrupadas):
- ✅ **Testes E2E suite**: Se suite rápida (< 1min total)
- ✅ **Screenshots múltiplos**: Se mesma página, viewports diferentes

**MAS**: Mesmo nas exceções, mostrar resultado ANTES de próxima ação.

### 4.6. Benefícios no User Validation

**Eficiência**:
- ✅ Bug UI identificado ANTES de deploy
- ✅ Performance validada ANTES de usuários reais
- ✅ Zero retrabalho (cada teste validado incrementalmente)
- ✅ Snapshot ANTES/DEPOIS comparação exata

**Colaboração**:
- ✅ Usuário vê validação incremental (login → UI → E2E → performance)
- ✅ Feedback loop rápido (30seg por teste)
- ✅ Correção imediata (se teste falhar)

### 4.7. Documentação Automática

Cada checkpoint DEVE logar em `.context/attempts.log` E `validation-loop.md`:

```bash
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] CHECKPOINT: [ação] - SUCCESS" >> .context/${BRANCH_PREFIX}_attempts.log
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] VALIDATION: [teste] - PASS" >> .context/${BRANCH_PREFIX}_validation-loop.md
```

**Ver**: REGRA #13 em `.claude/CLAUDE.md` para detalhes completos.

---

## 🧠 FASE FINAL: UPDATE CONTEXT (.context/ - OBRIGATÓRIO)

**⚠️ CRÍTICO**: SEMPRE atualizar `.context/` APÓS workflow.

### F.1. Atualizar workflow-progress.md

```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')

cat >> .context/${BRANCH_PREFIX}_workflow-progress.md <<EOF

### Workflow 6a: User Validation ✅ COMPLETO
- **Data**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')
- **Actions**:
  - Reframing pré-validação (problema CERTO confirmado)
  - Testes manuais completos (funcionalidade + edge cases)
  - Ciclo de feedback (iterações até perfeito)
  - GATE 3 aprovado (todos checkboxes validados)
- **Outputs**:
  - Feature funcionando perfeitamente
  - Screenshots de validação
  - Problemas reportados e corrigidos (se aplicável)
- **Next**: Workflow 6b (RCA & Edge Cases)
EOF
```

### F.2. Atualizar temp-memory.md

```bash
# Atualizar seção "Estado Atual"
cat > /tmp/temp-memory-update.md <<'EOF'
## Estado Atual

Workflow 6a (User Validation) concluído com sucesso.

**Feature validada**: [Descrever feature testada]

**Próximo passo**: Executar Workflow 6b (RCA & Edge Cases) para análise de causa raiz (se bugs encontrados).

---

## Próximos Passos

- [ ] Executar Workflow 6b (RCA & Edge Cases)
- [ ] Documentar RCA (se problemas encontrados)
- [ ] Prosseguir para Workflow 7 (Quality Gates)

---

## Decisões Pendentes

Nenhuma (GATE 3 aprovado).

EOF

# Substituir seção no arquivo original (preservar "Última Atualização")
sed -i.bak '/## Estado Atual/,/## Bloqueios\/Questões/{//!d;}' .context/${BRANCH_PREFIX}_temp-memory.md
cat /tmp/temp-memory-update.md >> .context/${BRANCH_PREFIX}_temp-memory.md
rm /tmp/temp-memory-update.md
```

### F.3. Atualizar validation-loop.md (CRÍTICO para Workflow 6)

```bash
cat >> .context/${BRANCH_PREFIX}_validation-loop.md <<EOF

### Iteração N ([✅ SUCESSO / ❌ FALHA])
- **Data**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')
- **Tentativa**: [O que tentei implementar]
- **Resultado**: [O que aconteceu]
- **Erro** (se falha): [Mensagem de erro completa]
- **Causa Root** (se falha): [Análise RCA]
- **Fix Aplicado** (se falha): [O que mudei]
- **Screenshot** (se sucesso): [Link para validação]
EOF
```

### F.4. Atualizar decisions.md (Se Decisões Tomadas)

**⚠️ Só atualizar se DECISÃO foi tomada no workflow.**

```bash
# Exemplo: Se decidimos ajustar solução após reframing
cat >> .context/${BRANCH_PREFIX}_decisions.md <<EOF

## Workflow 6a - User Validation
- **Decisão**: [Descrever decisão - ex: "Ajustar UI após reframing"]
- **Por quê**: [Motivo - ex: "Problema CERTO era compartilhamento, não apenas export"]
- **Trade-off**: [Ex: "+1h desenvolvimento, mas solução melhor"]
- **Alternativas consideradas**: [Listar opções rejeitadas]
- **Data**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')
EOF
```

### F.5. Log em attempts.log

```bash
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] WORKFLOW: 6a (User Validation) - COMPLETO" >> .context/${BRANCH_PREFIX}_attempts.log
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] GATE 3: APROVADO - Feature validada manualmente" >> .context/${BRANCH_PREFIX}_attempts.log
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] VALIDATION: [N iterações até sucesso]" >> .context/${BRANCH_PREFIX}_attempts.log
```

### F.6. Validação Context Updated

**Checklist Pós-Workflow**:
- [ ] Atualizei workflow-progress.md?
- [ ] Atualizei temp-memory.md (Estado Atual + Próximos Passos)?
- [ ] Atualizei validation-loop.md (tentativas e resultado)?
- [ ] Atualizei decisions.md (se decisão tomada)?
- [ ] Logei em attempts.log (WORKFLOW COMPLETO + GATE 3)?

**Se NÃO atualizou**: ⛔ PARAR e atualizar AGORA.

---

**Workflow criado**: 2025-10-27 | **Dividido**: 2025-11-04
**Parte**: 6a de 11 (Parte 1 de 2)
**Próximo**: Workflow 6b
