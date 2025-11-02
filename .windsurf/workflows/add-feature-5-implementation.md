---
description: Workflow Add-Feature (5/9) - Implementation (Código + TDD + Testes)
---

## 📚 Pré-requisito: Consultar Documentação Base

Antes de iniciar qualquer planejamento ou ação, SEMPRE ler:
- `docs/PLAN.md` - Visão estratégica atual
- `docs/TASK.md` - Status das tarefas em andamento
- `docs/pesquisa-de-mercado/` - Fundamentos científicos

---

# Workflow 5/9: Implementation (Implementação)

Este é o **quinto workflow** de 9 etapas modulares para adicionar uma nova funcionalidade.

**O que acontece neste workflow:**
- Fase 10: Implementação (Código + TDD + Pequenos Diffs)
- Fase 11: Validação Automática (testes automáticos)
- Fase 12: Auto-Fix (se testes falharem)

**⚠️ IMPORTANTE**: Este workflow **NÃO comita código ainda**!
- Código é implementado e testado automaticamente
- MAS precisa de validação manual do usuário (Workflow 6)
- Só depois de usuário aprovar → Code Review → Security → Commit

**🔀 IMPORTANTE - Branch Isolation**:
- Branch foi criada com **sistema inteligente** no Workflow 4 (Setup)
- ⚠️ NUNCA commite código não relacionado nesta branch!
- ⚠️ Se você tem código em outra branch, NÃO misture aqui!
- ✅ Todos os commits incrementais devem estar NESTA branch
- 🚨 Código não commitado em branch errada = problema sério!

---

## 💻 Fase 10: Implementação (Pequenos Diffs + TDD)

**PRINCÍPIOS DE IMPLEMENTAÇÃO**:
- ✅ **Pequenos diffs**: Commits incrementais e frequentes (8+ commits)
- ✅ **TDD quando apropriado**: Testes primeiro para lógica crítica
- ✅ **Código limpo**: Seguir padrões do projeto (ESLint, Prettier)
- ✅ **Sem secrets**: NUNCA hardcode credenciais
- ✅ **Segurança em mente**: Validações e sanitização
- ✅ **Branch isolation**: Commits SOMENTE relacionados a esta feature

**⚠️ AVISO - Respeite o Isolamento da Branch**:
Esta branch foi criada com **sistema inteligente** que protege contra perda de código.
Se você está trabalhando em múltiplas features, certifique-se de estar na branch correta antes de cada commit!

---

### 10.1 Abordagem: Test-Driven Development (quando apropriado)

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

---

### 10.2 Fluxo TDD: RED → GREEN → REFACTOR

```markdown
1. 🔴 RED: Escrever teste que falha
   - Definir comportamento esperado
   - Criar teste unitário
   - Verificar que o teste FALHA (importante!)

2. 🟢 GREEN: Implementar solução mínima
   - Escrever código mais simples que passa no teste
   - Rodar teste e verificar que PASSA
   - Não se preocupar com otimização ainda

3. 🔵 REFACTOR: Melhorar código
   - Limpar código
   - Otimizar
   - Garantir que testes ainda passam

4. 💾 COMMIT: Commitar teste + implementação
   - Commit pequeno e focado
   - Mensagem descritiva
```

**Exemplo prático:**
```bash
# 1. RED - Criar teste que falha
# Arquivo: src/hooks/__tests__/useProfit.test.ts
git add src/hooks/__tests__/useProfit.test.ts
git commit -m "test: adicionar teste para useProfit - RED"

# 2. GREEN - Implementar solução
# Arquivo: src/hooks/useProfit.ts
git add src/hooks/useProfit.ts
git commit -m "feat: implementar useProfit - GREEN"

# 3. REFACTOR - Otimizar (se necessário)
git add src/hooks/useProfit.ts
git commit -m "refactor: otimizar useProfit - REFACTOR"
```

---

### 10.3 Implementação em Pequenos Diffs

**IMPORTANTE**: NÃO fazer um commit gigante no final. Fazer commits incrementais.

**Ordem recomendada de implementação:**

#### Passo 1: Database (se necessário)
```markdown
- [ ] Criar migration file
- [ ] Testar migration localmente
- [ ] Commit: `git commit -m "migration: adicionar tabela X"`
```

#### Passo 2: Testes Backend (TDD - RED)
```markdown
- [ ] Escrever testes para hooks/lógica
- [ ] Verificar que testes FALHAM
- [ ] Commit: `git commit -m "test: adicionar testes para hook X - RED"`
```

#### Passo 3: Backend/Hooks (TDD - GREEN)
```markdown
- [ ] Implementar hooks customizados
- [ ] Implementar lógica de negócio
- [ ] Adicionar validações
- [ ] Verificar que testes PASSAM
- [ ] Commit: `git commit -m "feat: implementar hook X - GREEN"`
```

#### Passo 4: Testes Frontend
```markdown
- [ ] Escrever testes para componentes
- [ ] Commit: `git commit -m "test: adicionar testes para componente Y"`
```

#### Passo 5: Frontend/UI
```markdown
- [ ] Criar componente básico
- [ ] Commit: `git commit -m "feat: criar componente Y (estrutura básica)"`
- [ ] Conectar com hooks
- [ ] Commit: `git commit -m "feat: conectar componente Y com hook X"`
- [ ] Aplicar estilos
- [ ] Commit: `git commit -m "style: estilizar componente Y"`
- [ ] Garantir responsividade
- [ ] Commit: `git commit -m "style: tornar componente Y responsivo"`
```

#### Passo 6: Refatoração (se necessário)
```markdown
- [ ] Otimizar código
- [ ] Limpar código duplicado
- [ ] Commit: `git commit -m "refactor: otimizar componente Y"`
```

**🔀 LEMBRETE IMPORTANTE - Branch Isolation**:
- Todos estes commits devem estar na branch criada no Workflow 4
- Verifique com `git branch` se você está na branch correta
- Se implementação vai quebrar estrutura, VOLTE ao Workflow 4 (Setup)
- NUNCA misture código de features diferentes na mesma branch

---

### 10.4 Validações de Segurança Durante Implementação

**CHECKLIST DE SEGURANÇA** (verificar durante código):
- [ ] NUNCA hardcode secrets (.env, API keys, passwords)
- [ ] Sempre sanitizar inputs de usuário
- [ ] Usar prepared statements para queries (Supabase query builder)
- [ ] Validar dados no backend (não confiar só no frontend)
- [ ] Implementar RLS (Row Level Security) no Supabase
- [ ] Logs não contêm dados sensíveis
- [ ] Headers de segurança configurados (CORS, CSP)

**Exemplos de código seguro:**
```typescript
// ✅ CORRETO - Usar variável de ambiente
const API_KEY = import.meta.env.VITE_API_KEY;

// ✅ CORRETO - Parameterized query
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId);

// ✅ CORRETO - React escapa automaticamente
<div>{userInput}</div>
```

---

### 10.5 Exemplo de Fluxo Completo

**⚠️ ANTES DE COMEÇAR**: Verifique que você está na branch correta!
```bash
git branch  # Deve mostrar a branch criada no Workflow 4
```

```bash
# 1. Database
git add supabase/migrations/20251027_add_profit_table.sql
git commit -m "migration: adicionar tabela profit_stats"

# 2. Testes Backend (RED)
git add src/hooks/__tests__/useProfit.test.ts
git commit -m "test: adicionar testes para useProfit - RED"

# 3. Hook Backend (GREEN)
git add src/hooks/useProfit.ts
git commit -m "feat: implementar useProfit hook - GREEN"

# 4. Testes Frontend
git add src/components/__tests__/ProfitCard.test.tsx
git commit -m "test: adicionar testes para ProfitCard"

# 5. Componente básico
git add src/components/ProfitCard.tsx
git commit -m "feat: criar ProfitCard (estrutura básica)"

# 6. Conectar hook
git add src/components/ProfitCard.tsx
git commit -m "feat: conectar ProfitCard com useProfit"

# 7. Estilos
git add src/components/ProfitCard.tsx
git commit -m "style: estilizar ProfitCard"

# 8. Responsividade
git add src/components/ProfitCard.tsx
git commit -m "style: tornar ProfitCard responsivo"

# Total: 8 commits pequenos e focados ✅
```

**Benefícios de pequenos diffs:**
- ✅ Fácil fazer code review
- ✅ Fácil identificar onde bug foi introduzido
- ✅ Fácil fazer rollback de mudança específica
- ✅ Histórico git mais claro e útil
- ✅ Merge conflicts menores

**🚨 SE VOCÊ ESTÁ NA BRANCH ERRADA**:
```bash
# 1. NÃO entre em pânico!
# 2. Verifique o que foi alterado
git status

# 3. Stash as mudanças (preservar trabalho)
git stash save "WIP: mudanças da feature X"

# 4. Volte para a branch correta
git checkout feat/sua-branch-correta

# 5. Aplique as mudanças na branch correta
git stash pop

# 6. Agora sim, faça seus commits incrementais aqui!
```

---

## 🧪 Fase 11: Validação Automática

// turbo

```bash
./scripts/run-tests.sh
```

### Testes Executados:
1. ✅ TypeScript compilation (`npx tsc --noEmit`)
2. ✅ ESLint (code quality) (`npm run lint`)
3. ✅ Unit tests (Vitest) (`npm run test`)
4. ✅ Build production (`npm run build`)

### Resultado Esperado:
```
✅ TypeScript: 0 errors
✅ ESLint: 0 warnings, 0 errors
✅ Tests: 45 passed, 0 failed
✅ Build: successful
```

---

### 📦 Warnings Comuns de Build (e como resolver)

#### 1. "Chunk larger than 500 kB" - Chunk muito grande
**Causa**: Bibliotecas pesadas importadas estaticamente

**Solução**: Usar lazy loading (dynamic imports)
```typescript
// ❌ Errado - importação estática
import jsPDF from 'jspdf';

// ✅ Correto - importação dinâmica
const { default: jsPDF } = await import('jspdf');
```

#### 2. "Dynamically imported but also statically imported"
**Causa**: Mesma lib importada de duas formas diferentes

**Solução**: Usar APENAS importação dinâmica em todos os lugares

#### 3. "browsers data is X months old"
**Solução**: Atualizar browserslist
```bash
npx update-browserslist-db@latest
```

#### 4. Code-Splitting Otimizado
Configure no `vite.config.ts`:
```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'pdf-libs': ['jspdf', 'html2canvas'],
        'vendor': ['react', 'react-dom'],
        'ui': ['lucide-react', 'recharts'],
      },
    },
  },
  chunkSizeWarningLimit: 1000,
}
```

**Benefícios**:
- ✅ Bibliotecas pesadas carregam sob demanda
- ✅ Bundle inicial menor e mais rápido
- ✅ Melhor cache (chunks separados)

---

---

### 10.6 Convenção de Nomes de Branches e Sistema Inteligente

**Sistema Inteligente de Branches** (implementado no Workflow 4):
- ✅ Detecta código não commitado (WIP) antes de criar branch
- ✅ Preserva trabalho em progresso automaticamente
- ✅ Registra histórico em `.branch-history.log`
- ✅ Protege contra perda acidental de código
- ✅ Sugere stash/commit quando necessário

**Convenção de Nomes**:
```bash
feat/add-[feature-name]      # Nova funcionalidade
fix/[bug-description]        # Correção de bug
refactor/[what-changed]      # Refatoração
docs/[documentation-topic]   # Documentação
test/[test-description]      # Testes
```

**Verificar Branch Atual**:
```bash
# Ver branch ativa
git branch

# Ver histórico de branches criadas
cat .branch-history.log

# Verificar se há código não commitado
git status
```

**⚠️ IMPORTANTE**:
- Se você vê código não commitado durante implementação, **NÃO IGNORE**!
- Commite incrementalmente (small diffs) ou stash temporariamente
- NUNCA troque de branch com código não commitado desta feature
- Sistema inteligente só protege na CRIAÇÃO da branch, não durante uso

---

## 🔄 Fase 12: Auto-Fix (se testes falharem)

**Se algum teste falhar:**

### Tentativa 1: Correção Automática
1. Analiso logs de erro
2. Identifico causa raiz
3. Aplico correção
4. Rodo testes novamente
5. Commit da correção: `git commit -m "fix: corrigir erro X detectado nos testes"`

### Tentativa 2: Abordagem Alternativa
- Se primeira correção falhar
- Tento solução diferente
- Rodo testes novamente
- Commit da correção: `git commit -m "fix: resolver problema Y com abordagem alternativa"`

### Se falhar 2x:
- **Paro e peço sua ajuda** 🚨
- Mostro logs detalhados
- Sugiro possíveis soluções manuais
- Aguardo seu direcionamento

---

## ✅ Checkpoint: Implementação Completa!

**O que temos até agora:**
- ✅ Código implementado com TDD
- ✅ Commits pequenos e incrementais (8+ commits)
- ✅ Testes automáticos passando (TypeScript, ESLint, Vitest, Build)
- ✅ Sem warnings críticos
- ✅ Segurança validada durante implementação

**⚠️ IMPORTANTE**: Código ainda NÃO foi commitado no histórico remoto!
- Commits estão apenas locais (na sua branch)
- Precisa validação manual do usuário (você!) antes de prosseguir
- Code Review e Security Scan vêm depois

**Status atual**:
- Branch: `feat/add-profit-cards-makeup` (criada com sistema inteligente)
- Commits locais: ~8-12 commits
- Testes: ✅ Todos passando
- Build: ✅ Sem erros

**🔀 Verificação de Branch Isolation**:
- ✅ Branch foi criada com sistema inteligente no Workflow 4
- ✅ Protegido contra perda de código por WIP/uncommitted changes
- ✅ Histórico de branches registrado em `.branch-history.log`
- ⚠️ Se houver código não commitado em outra branch, ele foi preservado

**Próxima etapa:** **PARADA OBRIGATÓRIA** para você testar manualmente! 🚦

---

## 🔄 Próximo Workflow (Automático)

```
Acionar workflow: .windsurf/workflows/add-feature-6-user-validation.md
```

**Ou você pode continuar manualmente digitando**: `/add-feature-6-user-validation`

---

**Workflow criado em**: 2025-10-27
**Parte**: 5 de 9
**Próximo**: User Validation (Validação Manual - CRÍTICO!)


## 📝 Atualização de Documentação

Após completar este workflow:
- [ ] Atualizar `docs/TASK.md` com status das tarefas completadas
- [ ] Atualizar `docs/PLAN.md` se houve mudança estratégica
- [ ] Criar ADR em `docs/adr/` se houve decisão arquitetural

---