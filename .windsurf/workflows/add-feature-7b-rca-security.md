---
description: Workflow Add-Feature (7b/9) - RCA e Security Analysis
auto_execution_mode: 1
---

# ⏮️ CONTINUAÇÃO DO WORKFLOW 7a

**Este é o Workflow 7b - Continuação de:**

← [Workflow 7a - Quality Gates](.windsurf/workflows/add-feature-7a-quality-gates.md)

**Pré-requisito**: Quality Gates do Workflow 7a devem estar APROVADOS (score ≥ 7.0).

---

## 📚 Pré-requisito: Consultar Documentação Base

Antes de iniciar, SEMPRE ler:
- `docs/PLAN.md` - Visão estratégica atual
- `docs/TASK.md` - Status das tarefas
- `.windsurf/workflows` - Todos workflows
- `docs/` - Documentação importante

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
```

### 0.3. Validação Context Loaded

**Checklist**:
- [ ] Li INDEX.md?
- [ ] Li workflow-progress.md (onde estou)?
- [ ] Li temp-memory.md (estado atual)?
- [ ] Li decisions.md (decisões já tomadas)?
- [ ] Li últimas 30 linhas de attempts.log?

**Se NÃO leu**: ⛔ PARAR e ler AGORA.

### 0.4. Log Início Workflow

```bash
BRANCH_PREFIX=$(git branch --show-current | sed 's/\//-/g')
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] WORKFLOW: 7b (RCA & Security Analysis) - START" >> .context/${BRANCH_PREFIX}_attempts.log
```

---

# Workflow 7b/11: RCA e Security Analysis

---

## 🔍 Root Cause Analysis (RCA)

**⚠️ IMPORTANTE**: RCA é a ferramenta PRINCIPAL para identificar POR QUE Quality Gates falharam.

**Objetivo**: Encontrar causa raiz sistêmica usando técnica dos **5 Whys**.

### Quando Usar RCA

- Quality Gates falharam
- Múltiplos warnings/errors
- Padrões de falhas recorrentes
- Bugs descobertos tarde

---

### Template de RCA
```markdown
**Problema**: [Falha específica - ex: "10 warnings TypeScript"]

**5 Whys**:
1. Por quê ocorreu? → [Resposta imediata]
2. Por quê [resposta 1]? → [Causa subjacente]
3. Por quê [resposta 2]? → [Causa mais profunda]
4. Por quê [resposta 3]? → [Processo/sistema]
5. Por quê [resposta 4]? → [Causa raiz]

**Causa Raiz**: [Sistêmica, não pontual]

**Ação Preventiva**: [Como prevenir em futuros workflows]

**Impacto Esperado**: [Quantificar redução de problemas]
```

---

### Exemplo RCA: TypeScript Warnings
```markdown
Problema: 10 warnings TypeScript no code review

5 Whys:
1. Por quê 10 warnings? → Tipos implícitos (any) não detectados
2. Por quê não detectados? → strict mode desabilitado
3. Por quê desabilitado? → Configuração inicial permissiva
4. Por quê permissiva? → Falta validação tsconfig
5. Por quê falta validação? → Sem Gate no Workflow 4

Causa Raiz: Ausência de validação tsconfig no Workflow 4

Ação Preventiva:
- Adicionar validação strict mode obrigatória
- Verificar: "strict": true, "noImplicitAny": true

Impacto: Zero warnings TypeScript em futuras features
```

---

### Como Executar RCA

1. **Detectar Falha**: Quality Gate falhou com N issues
2. **Aplicar 5 Whys**: Iterar até causa raiz sistêmica
3. **Identificar Ação**: Como prevenir em futuras features?
4. **Documentar**: Atualizar workflow imediatamente
5. **Validar**: Próxima feature deve ter ZERO issues similares

**Benefícios**:
- ✅ Prevenção: Causa raiz eliminada = problema não recorre
- ✅ ROI > 10x: 1h RCA economiza 10h+ em bugs futuros
- ✅ Debugging 36x mais rápido

**⚠️ REGRA**: Se Quality Gate falhou, RCA é OBRIGATÓRIO!

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

## 🔧 Troubleshooting de Segurança

### Problema 1: Secrets Detectados

**Diagnóstico**:
```bash
git diff --cached | grep -iE '(password|api_key|secret|token)'
```

**Solução**:
```typescript
// ❌ ERRADO
const API_KEY = "sk-1234567890abcdef";

// ✅ CORRETO
const API_KEY = import.meta.env.VITE_API_KEY;
```

1. Remover secrets do código
2. Mover para `.env` (NÃO commitar)
3. Verificar `.env` no `.gitignore`

---

### Problema 2: Vulnerabilidades em Dependências

**Diagnóstico**:
```bash
npm audit --json | jq '.metadata.vulnerabilities'
```

**Solução**:
```bash
npm audit fix                    # Fix automático
npm update [package-name]        # Manual
npm audit fix --force            # Último caso (testar!)
```

Se ainda houver: verificar alternativa ao pacote ou documentar decisão de aceitar risco.

---

### Problema 3: SQL Injection

**Diagnóstico**:
```bash
grep -r "SELECT.*\${" src/
grep -r "INSERT.*\${" src/
```

**Solução**:
```typescript
// ❌ ERRADO - SQL Injection
const query = `SELECT * FROM users WHERE id = ${userId}`;

// ✅ CORRETO - Parameterized query
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId);
```

---

### Problema 4: XSS Vulnerabilidade

**Diagnóstico**:
```bash
grep -r "dangerouslySetInnerHTML" src/
```

**Solução**:
```typescript
// ❌ ERRADO - XSS
<div dangerouslySetInnerHTML={{__html: userInput}} />

// ✅ CORRETO - React escapa automaticamente
<div>{userInput}</div>

// Se HTML necessário, sanitizar
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(userInput)}} />
```

---

### Problema 5: RLS Não Configurado

**Solução**:
```sql
-- Habilitar RLS
ALTER TABLE lifetracker_habits ENABLE ROW LEVEL SECURITY;

-- Política de leitura
CREATE POLICY "Users view own habits" ON lifetracker_habits
  FOR SELECT USING (auth.uid() = user_id);

-- Política de escrita
CREATE POLICY "Users insert own habits" ON lifetracker_habits
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

### Problema 6: CORS Configuration

**Solução**:
- Adicionar domínio à allowed origins no Supabase Dashboard
- Dev: `http://localhost:5173`
- Prod: `https://life-tracker.stackia.com.br`

---

## 📊 Quality Score (Opcional)

```markdown
**Quality Score**: [0-10]

**Critérios** (0-10 cada, média final):
- Code Quality: [0-10] (ESLint, patterns, readability)
- Security: [0-10] (secrets, SQL injection, XSS)
- Performance: [0-10] (queries, bundle size)
- Tests: [0-10] (coverage, edge cases)
- Documentation: [0-10] (comments, README, ADR)

**Aprovação**: Score ≥ 7.0 → APROVADO
```

---

## 📝 Fase 16: Atualização de Documentação

- [ ] Atualizar `docs/TASK.md` com tarefas completadas
- [ ] Atualizar `docs/PLAN.md` se mudança estratégica
- [ ] Criar ADR em `docs/adr/` se decisão arquitetural
- [ ] **⚠️ IMPORTANTE**: Atualizar `docs/adr/INDEX.md` com novo ADR
- [ ] Documentar problemas e RCA (se aplicável)

---

## ✅ Checkpoint Final

**Validado:**
- ✅ Code review OK
- ✅ Security scan OK (ZERO vulnerabilidades críticas)
- ✅ ZERO secrets hardcoded
- ✅ Queries seguras (parameterized)
- ✅ Outputs escapados (XSS safe)
- ✅ RLS configurado
- ✅ RCA realizado (se houve falhas)
- ✅ Documentação atualizada

**Próxima etapa:** Meta-Learning - Identificar aprendizados ANTES de documentar!

---

## 🧠 Meta-Learning: Captura de Aprendizados

**⚠️ CRÍTICO - NÃO PULE**: Fundamental para evolução contínua.

**Objetivo**: Identificar melhorias nos workflows/scripts/processos.

### Questões de Reflexão (Responder TODAS)

**1. Eficiência do Workflow (Nota 1-10):**
- [ ] Nota: __/10
- [ ] Se < 8: Qual fase ineficiente? Como melhorar?
- [ ] Alguma fase lenta? Qual? Por quê?

**2. Iterações com Usuário:**
- [ ] Número de iterações: __
- [ ] Se > 3: O que causou idas e vindas?
- [ ] Como tornar mais autônomo/claro?

**3. Gaps Identificados:**
- [ ] Alguma validação faltou? Onde inserir?
- [ ] Algum gate falhou? Como melhorar?
- [ ] Comando repetido 3+ vezes? Automatizar?

**4. RCA - Se identificou problema:**
- [ ] Problema: [descrever]
- [ ] 5 Whys aplicados? (causa raiz sistêmica)
- [ ] Afeta múltiplas features? (senão: descartar)
- [ ] Meta-learning previne recorrência?

### Ações de Melhoria

**Documentação a atualizar:**
- [ ] Este workflow precisa melhorias? → Descrever
- [ ] CLAUDE.md precisa novo padrão? → Especificar
- [ ] Novo script útil? → Nome + função
- [ ] ADR necessário? → Decisão a documentar

**ROI Esperado:** [Estimar ganho - ex: "20min/feature" ou "Previne 2h debugging"]

### ⚠️ IMPORTANTE

- **Só learnings SISTÊMICOS** (não pontuais)
- **RCA obrigatório** para validar se é sistêmico
- **Consolidação final** no Workflow 8a

### Validação de Tamanho
```bash
wc -c .windsurf/workflows/add-feature-7b-rca-security.md
# ✅ < 12000 chars
# ❌ Se > 12000: Comprimir ou dividir
```

**Checklist Otimização** (se > 11k chars):
- [ ] Remover exemplos redundantes
- [ ] Consolidar checklists
- [ ] Extrair detalhes para docs/
- [ ] Dividir em 2 workflows

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

### Workflow 7b: RCA & Security Analysis ✅ COMPLETO
- **Data**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')
- **Actions**:
  - RCA executado (se Quality Gates falharam)
  - 5 Whys para causa raiz de falhas
  - Resolução em Teia (mapeamento completo)
  - Troubleshooting de segurança completo
  - Documentação atualizada
- **Outputs**:
  - Causa raiz identificada (se aplicável)
  - Workflows atualizados (prevenção)
  - ADR criado (se decisão arquitetural)
  - Quality score final aprovado
- **Next**: Workflow 8 (Meta-Learning)
EOF
```

### F.2. Atualizar temp-memory.md

```bash
# Atualizar seção "Estado Atual"
cat > /tmp/temp-memory-update.md <<'EOF'
## Estado Atual

Workflow 7b (RCA & Security Analysis) concluído com sucesso.

**RCA executado**: [SIM/NÃO - se SIM, descrever causa raiz]

**Próximo passo**: Executar Workflow 8 (Meta-Learning) para consolidar aprendizados.

---

## Próximos Passos

- [ ] Executar Workflow 8 (Meta-Learning)
- [ ] Consolidar learnings sistêmicos
- [ ] Prosseguir para commit/push

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
# Exemplo: Se decidimos atualizar workflow permanentemente
cat >> .context/${BRANCH_PREFIX}_decisions.md <<EOF

## Workflow 7b - RCA & Security Analysis
- **Decisão**: [Descrever decisão - ex: "Adicionar validação tsconfig no Workflow 4"]
- **Por quê**: [Motivo - ex: "RCA identificou gap sistêmico"]
- **Trade-off**: [Ex: "+2min por feature, previne 1h debugging"]
- **Alternativas consideradas**: [Listar opções rejeitadas]
- **Data**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')
EOF
```

### F.4. Log em attempts.log

```bash
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] WORKFLOW: 7b (RCA & Security Analysis) - COMPLETO" >> .context/${BRANCH_PREFIX}_attempts.log
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] RCA: [Executado/Não aplicável] - [Causa raiz se executado]" >> .context/${BRANCH_PREFIX}_attempts.log
echo "[$(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')] QUALITY SCORE: [Score final 0-10]" >> .context/${BRANCH_PREFIX}_attempts.log
```

### F.5. Validação Context Updated

**Checklist Pós-Workflow**:
- [ ] Atualizei workflow-progress.md?
- [ ] Atualizei temp-memory.md (Estado Atual + Próximos Passos)?
- [ ] Atualizei decisions.md (se decisão tomada)?
- [ ] Logei em attempts.log (WORKFLOW COMPLETO + RCA + Quality Score)?

**Se NÃO atualizou**: ⛔ PARAR e atualizar AGORA.

---

## 🔄 VALIDATION LOOP (OBRIGATÓRIO - Workflows Iterativos)

**APLICÁVEL**: Se workflow envolve RCA iterativo ou troubleshooting de segurança.

**Sistema**: Registrar iterações em `.context/{branch}_validation-loop.md`.

### Quando Usar

**Usar SE**:
- [ ] RCA executado (5 Whys iterativos)
- [ ] Security issues encontrados (troubleshooting iterativo)
- [ ] Vulnerabilidades corrigidas (validação pós-fix)

**Criar Validation Loop** (SE aplicável):

```bash
BRANCH=$(git branch --show-current | sed 's/\//-/g')

cat > .context/${BRANCH}_validation-loop.md <<'EOF'
# Validation Loop - Workflow 7b (RCA & Security)

**Data Início**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M')
**Status**: 🔄 Em Progresso

## Iteração 1

**Problema**: [Descrição]
**RCA (5 Whys)**:
1. Por quê X? → Y
2. ...
5. **Causa Raiz**: [Sistêmica]

**Fix**: [Aplicado]
**Resultado**: ✅ | ❌

EOF
```

**Benefícios**: RCA rastreável, padrões sistêmicos visíveis, meta-learnings ricos.

**Ref**: Workflow 6a aprovado, Meta-Learning #3

---

## 🔄 Próximo Workflow

Acionar: `.windsurf/workflows/add-feature-8-meta-learning.md`

Ou digite: `/add-feature-8-meta-learning`

---

**Workflow criado**: 2025-10-27 (mod: 2025-11-08)
**Parte**: 7b de 11
**Próximo**: Meta-Learning
