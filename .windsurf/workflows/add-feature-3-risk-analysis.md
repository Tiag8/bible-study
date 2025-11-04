---
description: Workflow Add-Feature (3/9) - Risk Analysis (Análise de Riscos)
auto_execution_mode: 1
---

## 📚 Pré-requisito

Ler ANTES de iniciar: `docs/PLAN.md`, `docs/TASK.md`, `README.md`, `AGENTS.md`

---

# Workflow 3/11: Risk Analysis (Análise de Riscos e Mitigações)

Este é o **terceiro workflow** de 11 etapas modulares para adicionar uma nova funcionalidade.

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

## 🤖 USO MÁXIMO DE AGENTES

**SEMPRE paralelo** (nunca sequencial):
- 3 agentes: Análise técnica + segurança + negócio
- 4-5 agentes: Mitigações em diferentes áreas
- Benefício: 20-30 minutos vs 2-3 horas

---

## 🛡️ Fase 5: Análise de Riscos Detalhada

### 5.1 Riscos Técnicos

#### Performance
- **Risco**: [Impacto em performance, queries lentas, escalabilidade]
- **Probabilidade**: Alta / Média / Baixa
- **Impacto**: Alto / Médio / Baixo
- **Severidade**: 🔴 / 🟡 / 🟢

#### Breaking Changes
- **Risco**: [Quebra de funcionalidades, mudanças em schema/APIs]
- **Probabilidade**: Alta / Média / Baixa
- **Impacto**: Alto / Médio / Baixo
- **Severidade**: 🔴 / 🟡 / 🟢

#### Escalabilidade & Complexidade
- **Risco**: [Código complexo, difícil de manter, escalabilidade limitada]
- **Probabilidade**: Alta / Média / Baixa
- **Impacto**: Alto / Médio / Baixo
- **Severidade**: 🔴 / 🟡 / 🟢

---

### 5.2 Riscos de Segurança

#### Exposição de Dados & Injeção
- **Risco**: [Vazamento de dados sensíveis, SQL injection/XSS]
- **Probabilidade**: Alta / Média / Baixa
- **Impacto**: Alto / Médio / Baixo
- **Severidade**: 🔴 / 🟡 / 🟢

#### Autenticação/Autorização
- **Risco**: [RLS, tokens, CORS mal configurados]
- **Probabilidade**: Alta / Média / Baixa
- **Impacto**: Alto / Médio / Baixo
- **Severidade**: 🔴 / 🟡 / 🟢

---

### 5.3 Riscos de Negócio

#### Impacto no Usuário & Reversibilidade
- **Risco**: [UX piora, difícil reverter mudanças de schema/dados]
- **Probabilidade**: Alta / Média / Baixa
- **Impacto**: Alto / Médio / Baixo
- **Severidade**: 🔴 / 🟡 / 🟢

#### Time to Market
- **Risco**: [Bloqueador para outras features, deadline apertado]
- **Probabilidade**: Alta / Média / Baixa
- **Impacto**: Alto / Médio / Baixo
- **Severidade**: 🔴 / 🟡 / 🟢

---

### 5.4 Plano de Rollback

**Opções** (em ordem de preferência):
1. **Git revert**: Bugs no código, banco OK → `git revert <hash>`
2. **Restaurar backup**: Migration quebrou dados → `./scripts/restore-supabase.sh`
3. **Feature flag**: Desabilitar sem redeploy (se implementado)
4. **Redeploy anterior**: Bugs críticos em produção

**Tempo estimado**: [X minutos]

---

## 🔧 Fase 6: Estratégias de Mitigação

### 6.1 Mitigações de Riscos Técnicos

#### Performance & Escalabilidade
- ✅ Índices em WHERE/JOIN, `.select()` específico, LIMIT em queries
- ✅ Cache (useMemo, React Query), paginação, lazy loading
- ✅ Monitorar tempo queries (< 500ms)

#### Breaking Changes & Complexidade
- ✅ Testes de regressão, migration backward-compatible
- ✅ Testar features relacionadas
- ✅ Documentação inline, testes unitários, código modular
- ✅ ADR se decisão arquitetural importante

---

### 6.2 Mitigações de Riscos de Segurança

#### Dados Sensíveis & Injeção
- ✅ RLS habilitado, queries com filtros ownership, `.select()` específico
- ✅ Supabase query builder (`.eq()`, `.filter()`), NUNCA raw SQL
- ✅ Inputs validados, sem `dangerouslySetInnerHTML`
- ✅ Logs sanitizados

#### Autenticação/Autorização
- ✅ Auth tokens em headers (não URL/params)
- ✅ RLS valida ownership em TODAS tabelas
- ✅ CORS para domínios específicos (não *)
- ✅ Tokens expiram (não eternos)

---

### 6.3 Backup e Contingência

**Opção A: Dump Lógico** (mudanças pequenas)
- `./scripts/backup-supabase.sh`
- Prós: Rápido, rollback < 5min
- Cons: Não testa migration em ambiente isolado

**Opção B: Preview Branch** (mudanças complexas)
- `supabase branches create feature-backup`
- Prós: Ambiente isolado, testa migration
- Cons: Mais lento, requer Supabase Pro

**Escolher**: [Dump Lógico / Preview Branch]
**Justificativa**: [Por que]

---

### 6.4 Checklist de Testes

- [ ] TypeScript, ESLint, testes unitários, build produção passam
- [ ] Feature funciona, UI correta, performance < 500ms
- [ ] Não quebrou features existentes
- [ ] Security scan passa, ZERO secrets, RLS, inputs sanitizados

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
**Workflow atualizado em**: 2025-11-03
**Parte**: 3 de 11
**Próximo**: Setup (Preparação do Ambiente)

---

## 🔗 Referências

- `docs/WORKFLOW_BRANCHES.md`: Criação segura de branches
- `./scripts/create-feature-branch.sh`: Proteção contra perda de código

---