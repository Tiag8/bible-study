---
description: Workflow Add-Feature (5a/9) - Implementation Core (Código + TDD + Testes)
auto_execution_mode: 1
---

## 📚 Pré-requisito: Consultar Documentação Base

Antes de iniciar qualquer planejamento ou ação, SEMPRE ler:
- `docs/PLAN.md` - Visão estratégica atual
- `docs/TASK.md` - Status das tarefas em andamento
- `docs/pesquisa-de-mercado/` - Fundamentos científicos

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

## 🧠 FASE 0.5: MEMORY RE-CHECK (Pré-Implementação) 🆕

**Objetivo**: Confirmar que conhecimento de memórias ainda está presente antes de escrever código. Evitar erros já documentados.

### Por que Re-Check?

- Memory Audit foi feito em Workflow 2b (planejamento)
- Entre planejamento e implementação pode haver mudança de contexto
- LLMs podem "esquecer" informações entre workflows
- Re-check garante aplicação do conhecimento no momento crítico

### Verificação Rápida (2-3 min)

**1. Revisar Memory Audit do Workflow 2b**:
```bash
# Ver o que foi documentado no planejamento
grep -A 30 "Memory Audit" .context/${BRANCH_PREFIX}_decisions.md
```

**2. Confirmar domínios ainda relevantes**:
- [ ] Domínios identificados ainda aplicam?
- [ ] Algum domínio novo surgiu desde o planejamento?

**3. Re-ler seções críticas** (SE necessário):
```bash
# Se implementação envolve WhatsApp
cat ~/.claude/memory/uazapi.md | head -200

# Se implementação envolve Gemini/AI
cat ~/.claude/memory/gemini.md | head -200

# Se implementação envolve Edge Functions
cat ~/.claude/memory/edge-functions.md | head -200
```

### Checklist Pré-Código

**ANTES de escrever qualquer código, confirmar**:
- [ ] Li os erros conhecidos relevantes (Memory Audit Workflow 2b)?
- [ ] Sei quais padrões aplicar?
- [ ] Sei quais anti-patterns evitar?
- [ ] Tenho checklists específicos do domínio?

### Validação (Script)

```bash
./scripts/validate-memory-consulted.sh --phase=5a
```

**SE REJEITADO**:
- Revisar `.context/{branch}_decisions.md` seção "Memory Audit"
- Se ausente: ⛔ Voltar Workflow 2b Fase 0.2

**SE APROVADO**: ✅ Prosseguir implementação com conhecimento confirmado

---

## 🔒 GATE 6.5: Schema Validation (SE escrever SQL) 🆕

**Objetivo**: Prevenir erros de coluna/tabela inexistente validando schema ANTES de escrever SQL.

### Quando Aplicar?

- [ ] Feature envolve CREATE FUNCTION / RPC?
- [ ] Feature envolve migrations com ALTER/INSERT/UPDATE?
- [ ] Feature envolve queries em lifetracker_* tables?
- [ ] Feature envolve triggers ou stored procedures?

**SE SIM para qualquer item** → Executar validação obrigatória.

### Protocolo de Validação

**1. Identificar tabelas que serão referenciadas**:
```markdown
Tabelas envolvidas:
- lifetracker_profiles
- lifetracker_habits
```

**2. Consultar schema real via MCP** (OBRIGATÓRIO):
```sql
-- Via mcp__supabase_lifetracker__execute_sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'NOME_TABELA'
ORDER BY ordinal_position;
```

**3. Documentar colunas disponíveis** em `.context/{branch}_decisions.md`:
```markdown
## Schema Validation (GATE 6.5) ✅

**Tabelas consultadas:**
| Tabela | Colunas Disponíveis |
|--------|---------------------|
| lifetracker_habits | id, user_id, name, current_streak, longest_streak... |
| lifetracker_profiles | user_id, journey_state, journey_metadata... |

**Colunas que VOU usar:**
- lifetracker_habits.current_streak ✅
- lifetracker_habits.longest_streak ✅

**Colunas que NÃO existem (evitadas):**
- ❌ streak_count (não existe)
```

**4. Validação por Script** (opcional):
```bash
./scripts/validate-columns-exist.sh --interactive
```

### Checklist GATE 6.5

- [ ] Listei todas tabelas que vou referenciar?
- [ ] Consultei information_schema para CADA tabela?
- [ ] Documentei colunas disponíveis?
- [ ] Confirmei que colunas que vou usar EXISTEM?
- [ ] Evitei assumir nomes baseado em convenção?

### Red Flags (Bloqueio)

- ❌ Escrever SQL sem consultar schema primeiro
- ❌ Assumir nome de coluna (ex: `streak_count` vs `current_streak`)
- ❌ Copiar código antigo sem validar se schema mudou
- ❌ Usar apenas types.ts (pode estar desatualizado)

### ROI

- **Tempo validação:** 3-5 min
- **Tempo debug evitado:** 15-60 min por erro
- **Fonte:** feat-flight-deck-dashboard (erro streak_count → current_streak)

---

### ⚠️ GATE: Spec Review (SE > 10 itens)
- [ ] Spec tem > 10 itens detalhados?
  - SE SIM → Apresentar spec ao usuário e aguardar aprovação explícita
  - SE NÃO → Prosseguir implementação

---

## ⚠️ REGRA CRÍTICA: USO MÁXIMO DE AGENTES

**SEMPRE usar máximo de agentes em paralelo** (Fase 10: 4+, Fase 11: 3+).

---

# Workflow 5a/9: Implementation Core (Implementação)

**O que acontece neste workflow:**
- Fase 10: Implementação (Código + TDD + Pequenos Diffs)
- Fase 11: Integração de Componentes
- GATE 2: Validação de Implementação Core

**⚠️ IMPORTANTE**: Código implementado e testado automaticamente, MAS precisa validação manual (Workflow 6). Só depois: Code Review → Security → Commit.

**🔀 Branch Isolation**:
- Branch criada no Workflow 4 com sistema inteligente
- ⚠️ NUNCA commite código não relacionado nesta branch!
- ✅ Todos commits incrementais devem estar NESTA branch
- 🚨 Código não commitado em branch errada = problema sério!

---

## 📸 Fase 9.5: Screenshot ANTES (Baseline Visual)

**⚠️ CRÍTICO**: Capturar estado ANTES de modificar código (ADR-029).

### Executar Validação

```bash
./scripts/validate-screenshot-gate.sh 5a
```

**SE APROVADO** (exit 0):
- ✅ Screenshot ANTES existe em `screenshots/before/`
- 🎯 Prosseguir Fase 10 (Implementação)

**SE REJEITADO** (exit 1):
- ❌ Screenshot ANTES faltando
- 🎯 AÇÃO: Capturar screenshot → Salvar `screenshots/before/feature-before.png`
- ⛔ BLOQUEIO: Fase 10 NÃO pode iniciar sem baseline

---

### Como Capturar

1. **Abrir aplicação**: `npm run dev` → http://localhost:8080
2. **Navegar**: Página/componente que será modificado
3. **Screenshot**: Cmd+Shift+4 (Mac) OU PrtScn (Windows)
4. **Salvar**: `screenshots/before/[feature]-before-[timestamp].png`

**Exemplo**: `screenshots/before/landing-page-before-20251120.png`

---

**Por quê Screenshot-First?**:
- Previne regressões visuais (baseline comparação)
- Validação usuário informada (vê estado atual)
- Documentação visual (evidência mudanças)

**Evidência**: ADR-029 (feat-landing-page-mvp 6 iterações visuais)

---

## 💻 Fase 10: Implementação (Pequenos Diffs + TDD)

**PRINCÍPIOS**:
- ✅ Pequenos diffs: 8+ commits incrementais
- ✅ TDD quando apropriado: Testes primeiro para lógica crítica
- ✅ Código limpo: ESLint, Prettier
- ✅ Sem secrets: NUNCA hardcode credenciais
- ✅ Segurança: Validações e sanitização
- ✅ Branch isolation: Commits SOMENTE desta feature

---

### 10.1 Test-Driven Development (quando apropriado)

> **💡 MCPs Úteis**: `gemini-cli sandbox` (testar lógica isolada), `context7` (consultar docs)
> Ver: `docs/integrations/MCP.md`

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

**Fluxo TDD**: 🔴 RED (teste falha) → 🟢 GREEN (implementação mínima) → 🔵 REFACTOR (limpar) → 💾 COMMIT (pequeno e focado)

---

### 10.2 Implementação em Pequenos Diffs

**ORDEM**: Database → Backend Tests → Backend Code → Frontend Tests → Frontend UI → Refactor

**Commits incrementais (8+)**: `migration`, `test: RED`, `feat: GREEN`, `feat: connect`, `style`, `refactor`

**IMPORTANTE**: Verificar branch: `git branch` (deve ser da Workflow 4)

**Benefícios**: Code review fácil, bug tracking, rollback simples, histórico claro.

**SE NA BRANCH ERRADA**: `git stash save` → `git checkout correta` → `git stash pop` → commits aqui

---

### 10.3 Validações de Segurança Durante Implementação

- NUNCA hardcode secrets (.env, API keys)
- Sanitizar inputs (React escapa automaticamente)
- Usar Supabase query builder (prepared statements)
- Validar dados no backend
- Implementar RLS no Supabase
- Logs sem dados sensíveis

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

## 🛡️ Fase 11.5: Quality Gates Pré-Deploy (OBRIGATÓRIO)

**⚠️ CRÍTICO**: Executar ANTES de deploy para prevenir bugs recorrentes.

### **Gate 1: Tool Validation** (se criou novo Gemini tool)

**Checklist**:
- [ ] Import `FunctionDeclaration` type do `@google/generative-ai`
- [ ] Description detalhada com seções "QUANDO CHAMAR" e "RETORNA"
- [ ] Parameters type: `'OBJECT'` (uppercase, não lowercase)
- [ ] Tool exportado em array `TOOLS`

**Validação**:
```bash
# Verificar formato correto
grep -A 10 "FunctionDeclaration" supabase/functions/_shared/gemini-tools-*.ts
```

**Exemplo correto**:
```typescript
import type { FunctionDeclaration } from "@google/generative-ai";

export const MY_TOOL: FunctionDeclaration = {
  name: 'my_tool',
  description: `Descrição detalhada.

QUANDO CHAMAR:
- Condição 1
- Condição 2

RETORNA:
- campo1: Descrição
- campo2: Descrição`,
  parameters: {
    type: 'OBJECT',  // ⚠️ UPPERCASE
    properties: { /* ... */ },
    required: []
  }
};
```

**ROI**: Previne 15-30min debug por tool

---

### **Gate 2: Runtime Compatibility** (Edge Functions)

**Checklist**:
- [ ] Runtime: Deno Edge Runtime (não Node.js)
- [ ] APIs async: Usar versões async (ex: `constructEventAsync` não `constructEvent`)
- [ ] Crypto: SubtleCrypto é async (sempre `await`)
- [ ] Env vars: `Deno.env.get()` (não `process.env`)
- [ ] Pesquisou: "[lib] + Deno Edge Runtime" (ex: "Stripe Deno webhook")

**Validação**:
```bash
# Verificar imports Deno
grep -E "(Deno\\.env|constructEventAsync|await.*crypto)" supabase/functions/*/index.ts
```

**Padrões Deno**:
- ✅ Imports: `https://esm.sh/` ou `https://deno.land/`
- ✅ Async crypto: `await stripe.webhooks.constructEventAsync()`
- ✅ Env: `Deno.env.get('VAR')`

**ROI**: Previne 20-40min debug runtime issues

---

### **Gate 3: FK Reference Validation** (Migrations com Foreign Keys)

**Checklist**:
- [ ] Query schema da tabela referenciada executado
- [ ] Coluna referenciada existe e é UNIQUE ou PRIMARY KEY
- [ ] Tipo de dados compatível (UUID = UUID, TEXT = TEXT)
- [ ] ON DELETE CASCADE apropriado para o caso de uso

**Validação**:
```sql
-- Ver schema completo da tabela
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'tabela_referenciada';

-- Ver constraints
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'tabela_referenciada';
```

**Comando alternativo**:
```bash
# Dump schema
supabase db dump --schema-only | grep -A 20 "CREATE TABLE tabela_referenciada"
```

**Exemplo correto**:
```sql
-- ❌ ERRADO: Referenciar coluna errada
REFERENCES lifetracker_profiles(id)

-- ✅ CORRETO: Validar schema primeiro
REFERENCES lifetracker_profiles(user_id)
```

**ROI**: Previne 10-20min debug FK errors

---

### **Checkpoint Gates**

**ANTES de prosseguir para deploy**:
- [ ] Gate 1 validado (se aplicável)
- [ ] Gate 2 validado (se aplicável)
- [ ] Gate 3 validado (se aplicável)

**Se algum gate falhar**: Corrigir ANTES de deploy

**Referência**: Ver `docs/meta-learnings/ML-15-payment-gateway-learnings.md`

---

## 📝 Convenção de Nomes de Branches

**Padrões**: `feat/add-[feature]`, `fix/[bug]`, `refactor/[change]`, `docs/[topic]`, `test/[test]`

**Sistema inteligente (Workflow 4)**: Detecta WIP, preserva código em `.branch-history.log`.

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
- Precisa validação manual do usuário antes de prosseguir
- Code Review e Security Scan vêm depois

**Status atual**:
- Branch: Criada com sistema inteligente no Workflow 4
- Commits locais: ~8-12 commits
- Testes: ✅ Todos passando
- Build: ✅ Sem erros

**🔀 Verificação de Branch Isolation**:
- ✅ Branch criada com sistema inteligente no Workflow 4
- ✅ Protegido contra perda de código por WIP/uncommitted changes
- ✅ Histórico de branches registrado em `.branch-history.log`
- ⚠️ Código não commitado em outra branch foi preservado

---

## 🚨 Validação Anti-Over-Engineering (OBRIGATÓRIO)

**CRÍTICO**: Validar implementação ANTES de prosseguir para validação manual.

### Checklist YAGNI/KISS para Código
- [ ] **Código resolve problema REAL** (não edge cases hipotéticos)?
  - Feature pedida: [requisito original]
  - vs "adicionar por precaução" ❌

- [ ] **Implementação mais SIMPLES possível**?
  - Abstrações desnecessárias removidas?
  - Padrões de design justificados?
  - Refactoring prematuro evitado?

- [ ] **Dependências justificadas por EVIDÊNCIA**?
  - Cada dep em package.json tem uso real?
  - Alternativa nativa/já instalada verificada?
  - Tamanho bundle impacto calculado?

- [ ] **Testes cobrem casos REAIS** (não teóricos)?
  - Baseados em requisitos documentados?
  - vs "testar tudo que pode acontecer" ❌
  - Coverage > 80% em código crítico?

### Red Flags em Implementação
- [ ] ❌ Classes/interfaces para problema que cabe em função
- [ ] ❌ Hooks customizados sem reuso (usado 1x)
- [ ] ❌ Componentes genéricos "para o futuro"
- [ ] ❌ Otimizações sem profiling prévio

**Se 2+ red flags**: ⛔ REFATORAR para simplificar

**Exemplo Real**:
- ❌ Criar factory pattern para 1 tipo de objeto
- ✅ Função direta, refatorar DEPOIS se precisar 3+ tipos

**Ver**: `.claude/CLAUDE.md` → REGRA #10 Anti-Over-Engineering

---

## 📝 Fase 15: Commit Implementation

**Commit dos arquivos implementados (seguindo Conventional Commits)**:

```bash
git add .
git commit -m "feat: [descrição da feature implementada]

- Implementação de [componente/função/feature]
- Testes adicionados para [casos cobertos]
- Integrações com [backend/frontend/database]

Refs: #[issue-number] (se aplicável)"
```

**Checklist Commit**:
- [ ] Mensagem segue Conventional Commits (feat:, fix:, refactor:)?
- [ ] Commit é atômico (1 feature/mudança)?
- [ ] Arquivos corretos incluídos (sem arquivos temporários)?
- [ ] Sem secrets/PII commitados?

---

## ⏸️ Fase 15.5: Git Approval Checkpoint (Commit Local)

**OBRIGATÓRIO**: Aprovação explícita para commit local

**Validação:**
- [ ] Executei `git status` e `git diff`?
- [ ] Mensagem commit segue Conventional Commits?
- [ ] Commit é atômico (1 feature/mudança)?
- [ ] Arquivos corretos incluídos?

**Template Checkpoint:**
```
✅ COMMIT PREPARADO:
Arquivos: [listar arquivos staged]
Mensagem: [mostrar mensagem]

⏸️ APROVAR commit local? (yes/no)
```

**SE APROVADO**: Prosseguir Fase 16
**SE REJEITADO**: Corrigir e repetir Fase 15.5

---

## 📝 Fase 16: Documentation Update

**Atualizar documentação do projeto (se aplicável)**:

```bash
# Atualizar TASK.md com status
# Atualizar ADRs se decisões arquiteturais foram tomadas
# Atualizar docs/ se features novas foram adicionadas
```

---

## 📤 Fase 17: Prepare Remote Push

**Validação pré-push**:

```bash
# Verificar branch
git branch

# Verificar remote
git remote -v

# Verificar commits a enviar
git log origin/main..HEAD --oneline
```

---

## 📤 Fase 18: Push to Remote

**Push da branch para remote**:

```bash
git push -u origin [branch-name]
```

---

## 🚫 Fase 18.5: Git Approval Checkpoint (Push Remote)

**CRÍTICO**: Push é irreversível (operação pública)

**Validação:**
- [ ] Branch correta? (verificar `git branch`)
- [ ] Remote correto? (verificar `git remote -v`)
- [ ] Todos commits locais incluídos?
- [ ] Nenhum secret/PII commitado?

**Template Checkpoint:**
```
🔴 PUSH TO REMOTE:
Branch: [branch-name]
Remote: origin
Commits: [listar commits a enviar]
Destino: [remote/branch]

⚠️ Operação irreversível!
⏸️ APROVAR push to remote? (yes/no)
```

**SE APROVADO**: Prosseguir Fase 19
**SE REJEITADO**: Corrigir localmente e repetir

---

## 🧠 Fase 19: Meta-Learning: Captura de Aprendizados

**⚠️ CRÍTICO - NÃO PULE**: Fundamental para evolução contínua do sistema.

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
wc -c .windsurf/workflows/add-feature-5a-implementation.md
# ✅ Espera: < 12000 chars (12k limit)
# ❌ Se > 12000: Comprimir ou dividir workflow
```

**Checklist de Otimização** (se workflow > 11k chars):
- [ ] Remover exemplos redundantes
- [ ] Consolidar checklists similares
- [ ] Extrair detalhes para docs/
- [ ] Dividir em 2 workflows (se > 12k)

---

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

**Exemplos deste workflow (Implementation)**:
- ✅ "Criar migration para adicionar coluna X"
- ✅ "Implementar componente React ComponentY"
- ✅ "Criar Edge Function /api/Z"
- ✅ "Adicionar hook useCustomHook()"
- ✅ "Executar teste unitário para função W"
- ❌ "Implementar feature completa de uma vez" (NÃO atômico - múltiplas ações)

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
[código implementado, teste passando, migration aplicada]

🔍 VALIDAÇÃO:
- [x] Ação executada com sucesso
- [x] Código compila sem erros
- [x] Testes passando (se aplicável)
- [x] Próxima ação identificada

🎯 PRÓXIMA AÇÃO PROPOSTA:
[descrição da próxima ação]

⏸️ AGUARDANDO APROVAÇÃO do usuário para continuar.
```

### 4.3. Checklist Checkpoint (Executar a Cada Ação)

- [ ] **Executei apenas 1 ação?**
- [ ] **Mostrei evidência ao usuário?** (código, teste, migration)
- [ ] **Usuário validou?** (aprovação explícita)
- [ ] **Documentei em `.context/`?** (attempts.log)
- [ ] **Identifiquei próxima ação?** (próximo componente/função)

### 4.4. Exemplo de Aplicação (Implementation)

**Fluxo com Checkpoints**:

```
1. AÇÃO: "Criar migration 20250111_add_column_X.sql"
   → Executar → Checkpoint → Aprovação

2. AÇÃO: "Aplicar migration (supabase db push)"
   → Executar → Checkpoint → Aprovação

3. AÇÃO: "Implementar componente <FeatureX />"
   → Executar → Checkpoint → Aprovação

4. AÇÃO: "Criar hook useFeatureX() para lógica"
   → Executar → Checkpoint → Aprovação

5. AÇÃO: "Adicionar teste unitário para useFeatureX()"
   → Executar → Checkpoint → Aprovação
```

### 4.5. Quando NÃO Aplicar Checkpoint

**Exceções** (ações podem ser agrupadas):
- ✅ **Refactor trivial**: Renomear variável em 3 linhas
- ✅ **Import/Export**: Adicionar imports necessários

**MAS**: Mesmo nas exceções, mostrar resultado ANTES de próxima ação.

### 4.6. Benefícios no Implementation

**Eficiência**:
- ✅ Migration validada ANTES de componente
- ✅ Componente validado ANTES de hook
- ✅ Zero retrabalho (cada parte testada incrementalmente)
- ✅ Bug identificado em 1 ação vs 10 ações

**Colaboração**:
- ✅ Usuário vê progresso incremental (migration → componente → hook → teste)
- ✅ Feedback loop rápido (30seg por checkpoint)
- ✅ Rollback trivial (git revert 1 commit)

### 4.7. Documentação Automática

Cada checkpoint DEVE logar em `.context/attempts.log`:

```bash
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] CHECKPOINT: [ação] - SUCCESS" >> .context/${BRANCH_PREFIX}_attempts.log
```

**Ver**: REGRA #13 em `.claude/CLAUDE.md` para detalhes completos.

---

## 🧠 Fase 20: FASE FINAL: UPDATE CONTEXT (.context/ - OBRIGATÓRIO)

**⚠️ CRÍTICO**: SEMPRE atualizar `.context/` APÓS workflow.

### 20.1. Atualizar workflow-progress.md

```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')

cat >> .context/${BRANCH_PREFIX}_workflow-progress.md <<EOF

### Workflow 5a: Implementation Core ✅ COMPLETO
- **Data**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')
- **Actions**:
  - Implementação com TDD (testes primeiro quando apropriado)
  - Código em pequenos diffs (8+ commits incrementais)
  - Integração de componentes (frontend + backend + database)
  - Validações de segurança durante implementação
  - GATE 2 aprovado (TypeScript, ESLint, Vitest, Build)
  - Git approval checkpoints (commit local + push remote)
- **Outputs**:
  - Código implementado (8+ commits locais)
  - Testes automatizados passando (0 errors)
  - Integrações conectadas e validadas
  - Segurança validada (RLS, sanitização, sem secrets)
  - Anti-Over-Engineering checklist validado
  - Código commitado e pushed para remote
- **Next**: Workflow 5b (Refactoring & RCA)
EOF
```

### 20.2. Atualizar temp-memory.md

```bash
# Atualizar seção "Estado Atual"
cat > /tmp/temp-memory-update.md <<'EOF'
## Estado Atual

Workflow 5a (Implementation Core) concluído com sucesso.

**Código implementado**:
- Commits locais: [número de commits, ex: 10 commits]
- Testes: ✅ Todos passando
- Build: ✅ Sem erros
- Git: ✅ Commitado e pushed para remote

**Próximo passo**: Executar Workflow 5b (Refactoring & RCA) para refactoring, git hooks e análise de causas raiz (se aplicável).

---

## Próximos Passos

- [ ] Executar Workflow 5b (Refactoring & RCA)
- [ ] Instalar git hooks (pre-commit validation)
- [ ] Refactoring se necessário
- [ ] RCA se testes falharam 2+ vezes

---

## Decisões Pendentes

- [ ] Nenhuma (Implementation Core concluída)

EOF

# Substituir seção no arquivo original (preservar "Última Atualização")
sed -i.bak '/## Estado Atual/,/## Bloqueios\/Questões/{//!d;}' .context/${BRANCH_PREFIX}_temp-memory.md
cat /tmp/temp-memory-update.md >> .context/${BRANCH_PREFIX}_temp-memory.md
rm /tmp/temp-memory-update.md
```

### 20.3. Atualizar decisions.md (Se Decisões Tomadas)

**⚠️ Só atualizar se DECISÃO foi tomada no workflow.**

```bash
# Exemplo: Se escolhemos padrão específico de implementação
cat >> .context/${BRANCH_PREFIX}_decisions.md <<EOF

## Workflow 5a - Implementation Core
- **Decisão**: [TDD aplicado / Padrão usado / Arquitetura escolhida]
- **Por quê**: [Justificativa técnica]
- **Trade-off**: [Benefícios vs custos]
- **Alternativas consideradas**: [Opções rejeitadas]
- **Data**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')
EOF
```

### 20.4. Log em attempts.log

```bash
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] WORKFLOW: 5a (Implementation) - COMPLETO" >> .context/${BRANCH_PREFIX}_attempts.log
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] DECISION: Código implementado - [resumo commits/testes]" >> .context/${BRANCH_PREFIX}_attempts.log
```

### 20.5. Validação Context Updated

**Checklist Pós-Workflow**:
- [ ] Atualizei workflow-progress.md?
- [ ] Atualizei temp-memory.md (Estado Atual + Próximos Passos)?
- [ ] Atualizei decisions.md (se decisão tomada)?
- [ ] Logei em attempts.log (WORKFLOW COMPLETO + decisões)?

**Se NÃO atualizou**: ⛔ PARAR e atualizar AGORA.

---

## 🧭 WORKFLOW NAVIGATOR

### Próximo Workflow Padrão
**[Workflow 6a] - User Validation**: Código implementado precisa validação manual com screenshots ANTES/DEPOIS.

### Quando Desviar do Padrão

| Situação | Workflow | Justificativa |
|----------|----------|---------------|
| Bug encontrado durante implementação | 5b (Refactoring RCA) | Corrigir bug com RCA 5 Whys antes de validar |
| Código precisa refactor significativo | 5b (Refactoring RCA) | Limpar código antes de mostrar ao usuário |
| Descobriu edge case crítico | 6b (Edge Cases) | Tratar edge case antes de validação geral |

### Quando Voltar

| Sinal de Alerta | Voltar para | Por quê |
|-----------------|-------------|---------|
| Escopo mudou durante implementação | 1 (Planning) | Re-planejar com GATE 1 Reframing |
| Design não funciona na prática | 2b (Technical Design) | Redesenhar solução técnica |
| Risco novo identificado | 3 (Risk Analysis) | Avaliar e mitigar antes de continuar |
| Gate de pre-implementation falhou | 4.5 (Pre-Implementation) | Resolver gate antes de código |

### Regras de Ouro
- ⛔ **NUNCA pular**: Workflow 6a - código NÃO vai para quality gates sem validação manual
- ⚠️ **Loop 5a→6a→5a (3+x)**: Voltar para 2b - problema é de design, não implementação
- 🎯 **Dúvida?**: Usar skill `workflow-navigator` para análise completa do contexto

