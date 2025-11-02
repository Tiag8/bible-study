---
description: Workflow Add-Feature (3/9) - Risk Analysis (Análise de Riscos)
---

## 📚 Pré-requisito: Consultar Documentação Base

Antes de iniciar qualquer planejamento ou ação, SEMPRE ler:
- `docs/PLAN.md` - Visão estratégica atual
- `docs/TASK.md` - Status das tarefas em andamento
- `docs/pesquisa-de-mercado/` - Fundamentos científicos

---

# Workflow 3/9: Risk Analysis (Análise de Riscos e Mitigações)

Este é o **terceiro workflow** de 9 etapas modulares para adicionar uma nova funcionalidade.

**O que acontece neste workflow:**
- Fase 5: Análise de Riscos Detalhada
- Fase 6: Estratégias de Mitigação
- **GATE 2**: Usuário aprova plano de riscos

**Por que etapa dedicada para riscos?**
- ✅ Análise profunda APÓS escolher solução
- ✅ Riscos específicos da solução escolhida
- ✅ Não sobrecarrega planejamento inicial
- ✅ Usuário pode ajustar mitigações

---

## 🛡️ Fase 5: Análise de Riscos Detalhada

### 5.1 Riscos Técnicos

#### Performance
- **Risco**: [Descrever potencial impacto em performance]
  - Query lenta? N+1 queries? Tabela sem índice?
  - Volume de dados esperado?
  - Tempo de resposta aceitável? (< 500ms ideal)

- **Probabilidade**: Alta / Média / Baixa
- **Impacto**: Alto / Médio / Baixo
- **Severidade**: 🔴 Crítico / 🟡 Moderado / 🟢 Baixo

#### Breaking Changes
- **Risco**: [Pode quebrar funcionalidades existentes?]
  - Mudanças em schema que afetam outras features?
  - Mudanças em APIs/contratos?
  - Mudanças em componentes compartilhados?

- **Probabilidade**: Alta / Média / Baixa
- **Impacto**: Alto / Médio / Baixo
- **Severidade**: 🔴 Crítico / 🟡 Moderado / 🟢 Baixo

#### Escalabilidade
- **Risco**: [Solução escala com crescimento de dados/usuários?]
  - Preparado para 10x o volume atual?
  - Queries otimizadas?
  - Cache/memoization necessário?

- **Probabilidade**: Alta / Média / Baixa
- **Impacto**: Alto / Médio / Baixo
- **Severidade**: 🔴 Crítico / 🟡 Moderado / 🟢 Baixo

#### Complexidade
- **Risco**: [Código muito complexo, difícil de manter?]
  - Muitas dependências?
  - Lógica difícil de testar?
  - Poucos devs entendem?

- **Probabilidade**: Alta / Média / Baixa
- **Impacto**: Alto / Médio / Baixo
- **Severidade**: 🔴 Crítico / 🟡 Moderado / 🟢 Baixo

---

### 5.2 Riscos de Segurança

#### Exposição de Dados Sensíveis
- **Risco**: [Dados sensíveis podem vazar?]
  - RLS (Row Level Security) configurado?
  - Logs expõem dados sensíveis?
  - API expõe mais dados que necessário?

- **Probabilidade**: Alta / Média / Baixa
- **Impacto**: Alto / Médio / Baixo
- **Severidade**: 🔴 Crítico / 🟡 Moderado / 🟢 Baixo

#### SQL Injection / XSS
- **Risco**: [Vulnerável a ataques de injeção?]
  - Queries usam parameterização?
  - Inputs são sanitizados?
  - Outputs são escapados?

- **Probabilidade**: Alta / Média / Baixa
- **Impacto**: Alto / Médio / Baixo
- **Severidade**: 🔴 Crítico / 🟡 Moderado / 🟢 Baixo

#### Autenticação/Autorização
- **Risco**: [Controle de acesso adequado?]
  - RLS valida ownership?
  - Auth tokens validados?
  - CORS configurado corretamente?

- **Probabilidade**: Alta / Média / Baixa
- **Impacto**: Alto / Médio / Baixo
- **Severidade**: 🔴 Crítico / 🟡 Moderado / 🟢 Baixo

---

### 5.3 Riscos de Negócio

#### Impacto no Usuário
- **Risco**: [UX pode piorar? Usuários podem ficar confusos?]
  - Mudança na interface familiar?
  - Fluxo mais complexo?
  - Performance perceptível?

- **Probabilidade**: Alta / Média / Baixa
- **Impacto**: Alto / Médio / Baixo
- **Severidade**: 🔴 Crítico / 🟡 Moderado / 🟢 Baixo

#### Reversibilidade
- **Risco**: [Difícil de reverter se der errado?]
  - Migration é reversível?
  - Dados podem ser restaurados?
  - Deploy pode ser revertido?
  - Branch foi criada com proteção (via script)?

- **Probabilidade**: Alta / Média / Baixa
- **Impacto**: Alto / Médio / Baixo
- **Severidade**: 🔴 Crítico / 🟡 Moderado / 🟢 Baixo

> **💡 Nota**: Usar `./scripts/create-feature-branch.sh` ao invés de `git checkout -b` protege contra perda de código ao criar novas branches.

#### Time to Market
- **Risco**: [Pode atrasar outras prioridades?]
  - Bloqueador para outras features?
  - Deadline apertado?
  - Recursos limitados?

- **Probabilidade**: Alta / Média / Baixa
- **Impacto**: Alto / Médio / Baixo
- **Severidade**: 🔴 Crítico / 🟡 Moderado / 🟢 Baixo

---

### 5.4 Plano de Rollback

**Se algo der errado, como reverter?**

> **💡 Dica**: O histórico de branches em `.git/branch-history.log` ajuda a rastrear de onde cada branch foi criada, facilitando recuperação e rollback.

#### Opção 1: Revert Git
```bash
# Reverter commits específicos
git revert <commit-hash>
git push origin main
```
**Quando usar**: Código tem bugs, mas banco OK

#### Opção 2: Restaurar Backup do Banco
```bash
# Restaurar backup
./scripts/restore-supabase.sh backups/backup-YYYYMMDD-HHMMSS.sql
```
**Quando usar**: Migration quebrou dados, precisa restaurar estado anterior

#### Opção 3: Feature Flag (se implementado)
```typescript
// Desabilitar feature remotamente
if (featureFlags.newFeature === false) {
  return <OldComponent />;
}
```
**Quando usar**: Feature deployada mas tem problema, desabilitar sem redeploy

#### Opção 4: Deploy Previous Version
```bash
# Redeploy versão anterior (Vercel/Netlify)
# Via dashboard ou CLI
```
**Quando usar**: Bugs críticos em produção, reverter tudo

**Tempo estimado de rollback**: [X minutos]

---

## 🔧 Fase 6: Estratégias de Mitigação

### 6.1 Mitigações de Riscos Técnicos

#### Performance
**Mitigações**:
- ✅ Criar índices nas colunas usadas em WHERE/JOIN
- ✅ Usar `.select()` específico (não SELECT *)
- ✅ Adicionar limite (LIMIT) em queries que podem retornar muitos registros
- ✅ Implementar cache/memoization (useMemo, React Query)
- ✅ Monitorar tempo de queries (< 500ms)

**Script de monitoramento**:
```sql
-- Verificar queries lentas no Supabase Dashboard
-- Ou adicionar logging no hook:
console.time('query-profit-cards');
const { data } = await supabase.from('profit_stats').select('*');
console.timeEnd('query-profit-cards');
```

#### Breaking Changes
**Mitigações**:
- ✅ Testes de regressão (rodar testes de features existentes)
- ✅ Migration backward-compatible quando possível
- ✅ Versionar APIs se mudar contrato
- ✅ Testar manualmente features relacionadas
- ✅ Criar branch usando script protegido (`./scripts/create-feature-branch.sh`)

**Checklist de features a testar**:
- [ ] [Feature 1 que pode ser afetada]
- [ ] [Feature 2 que pode ser afetada]
- [ ] [Feature 3 que pode ser afetada]

#### Escalabilidade
**Mitigações**:
- ✅ Queries otimizadas desde o início
- ✅ Paginação/Infinite scroll para listas grandes
- ✅ Lazy loading de componentes pesados
- ✅ Code splitting de libs grandes

#### Complexidade
**Mitigações**:
- ✅ Documentação inline (comentários explicando "por que")
- ✅ Testes unitários (comportamento documentado em testes)
- ✅ Código modular (funções pequenas, SRP)
- ✅ ADR se decisão arquitetural importante

---

### 6.2 Mitigações de Riscos de Segurança

#### Exposição de Dados
**Mitigações**:
- ✅ RLS (Row Level Security) habilitado no Supabase
- ✅ Queries usam filtros de ownership (user_id, etc)
- ✅ API retorna apenas campos necessários (select específico)
- ✅ Logs não contêm dados sensíveis (sanitizar antes de logar)

**Exemplo de RLS**:
```sql
-- Política RLS exemplo
CREATE POLICY "Users can only see their own data"
ON profit_stats FOR SELECT
USING (auth.uid() = user_id);
```

#### SQL Injection / XSS
**Mitigações**:
- ✅ SEMPRE usar Supabase query builder (parameterized queries)
- ✅ NUNCA concatenar strings em SQL
- ✅ Validar inputs no backend (não confiar só no frontend)
- ✅ React escapa automaticamente (evitar dangerouslySetInnerHTML)

**Checklist de segurança**:
- [ ] Queries usam `.eq()`, `.filter()` (não raw SQL)
- [ ] Inputs validados (tipo, range, format)
- [ ] Sem `dangerouslySetInnerHTML` no código
- [ ] Security scan passa (./scripts/run-security-tests.sh)

#### Autenticação/Autorização
**Mitigações**:
- ✅ Supabase Auth tokens em headers (não URL/query params)
- ✅ RLS valida ownership em TODAS as tabelas
- ✅ CORS configurado para domínios específicos (não *)
- ✅ Tokens expiram (não tokens eternos)

---

### 6.3 Backup e Contingência

#### Estratégia de Backup

**Opção A: Dump Lógico (Recomendado para mudanças pequenas)**
```bash
./scripts/backup-supabase.sh
```
**Quando usar**:
- ✅ Não tem migration (só código)
- ✅ Migration pequena (adicionar coluna, índice)
- ✅ Rollback rápido (< 5min)

**Prós**: Rápido, simples, restauração fácil
**Contras**: Não testa migration em ambiente separado

---

**Opção B: Preview Branch (Recomendado para mudanças grandes)**
```bash
# Criar Preview Branch no Supabase Dashboard
# Ou via CLI:
supabase branches create feature-backup

# IMPORTANTE: Ao criar branch Git, use o script protegido:
./scripts/create-feature-branch.sh nome-da-feature
# → Script verifica estrutura e previne perda de código
```
**Quando usar**:
- ✅ Migration complexa (mudar schema, adicionar tabelas)
- ✅ Quer testar antes em ambiente isolado
- ✅ Precisa garantir que migration funciona

**Prós**: Ambiente isolado, testa migration, zero risco (script protege contra perda de commits não mergeados)
**Contras**: Mais lento, requer Supabase Pro

---

**Decisão**: [Dump Lógico / Preview Branch]

**Justificativa**: [Por que esta opção é adequada para este caso]

---

### 6.4 Checklist de Testes

**Antes de prosseguir, garantir**:

#### Testes Automáticos
- [ ] TypeScript compilation passa (npx tsc --noEmit)
- [ ] ESLint passa (npm run lint)
- [ ] Testes unitários passam (npm run test)
- [ ] Build produção funciona (npm run build)

#### Testes Manuais (Fase 6)
- [ ] Feature funciona como esperado
- [ ] UI está correta
- [ ] Performance aceitável (< 500ms)
- [ ] Não quebrou features existentes

#### Testes de Segurança (Fase 7)
- [ ] Security scan passa (./scripts/run-security-tests.sh)
- [ ] ZERO secrets hardcoded
- [ ] RLS configurado
- [ ] Inputs sanitizados

---

## ✋ GATE 2: Aprovação do Plano de Riscos

**⚠️ PARADA OBRIGATÓRIA - Revisão do Usuário**

**Revise a análise de riscos acima e confirme:**

1. **Os riscos identificados fazem sentido?**
   - Falta algum risco importante?
   - Algum risco está superestimado/subestimado?

2. **As mitigações são adequadas?**
   - Mitigações são suficientes?
   - Precisa de mitigação adicional?

3. **Estratégia de backup é apropriada?**
   - Dump lógico suficiente ou precisa Preview Branch?
   - Tempo de rollback aceitável?

4. **Plano de rollback está claro?**
   - Sabe exatamente o que fazer se der errado?
   - Tempo de recuperação aceitável?

**Opções**:
- **Aprovar** - Digite: `Aprovar` ou `OK` ou `Prosseguir`
- **Ajustar** - Digite: `Ajustar` e explique o que mudar
- **Adicionar risco** - Digite: `Risco: [descrição]`
- **Modificar mitigação** - Digite: `Mitigação: [mudança]`

**Aguardando sua aprovação...** 🚦

---

## ✅ Checkpoint: Riscos Analisados e Mitigados!

**Plano de riscos aprovado!**

**Próxima etapa:** Preparar ambiente (backup, branch, sync) e começar implementação!

---

## 🔄 Próximo Workflow (Automático)

```
Acionar workflow: .windsurf/workflows/add-feature-4-setup.md
```

**Ou você pode continuar manualmente digitando**: `/add-feature-4-setup`

---

**Workflow criado em**: 2025-10-27
**Parte**: 3 de 9
**Próximo**: Setup (Preparação do Ambiente)


## 📝 Atualização de Documentação

Após completar este workflow:
- [ ] Atualizar `docs/TASK.md` com status das tarefas completadas
- [ ] Atualizar `docs/PLAN.md` se houve mudança estratégica
- [ ] Criar ADR em `docs/adr/` se houve decisão arquitetural

---

## 🔗 Referências

- **Workflow de Branches**: Ver `docs/WORKFLOW_BRANCHES.md` para detalhes sobre criação segura de branches
- **Script de Branches**: `./scripts/create-feature-branch.sh` - protege contra perda de código

---