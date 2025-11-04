---
description: Proteção de código, salvamento de análises e workflow Git para Ultra Think
---

## Proteção de Código e Git Workflow para Ultra Think

**CRÍTICO**: Ultra-think envolve análises LONGAS (horas/dias). Esta documentação cobre proteção completa de código, branches, commits intermediários e salvamento de análises.

Para o **workflow principal de análise**, consulte: **[`ultra-think.md`](./ultra-think.md)**

---

## 🔒 Checklist Pré-Voo: Proteção Git

Antes de iniciar qualquer análise ultra-think:

- [ ] **Git status limpo?** - Execute `git status` e verifique estado
- [ ] **Branch correta?** - Confirme que está na branch apropriada
- [ ] **Sincronizada com main?** - Execute `git pull origin main` se necessário
- [ ] **Commits não mergeados?** - Se houver trabalho em progresso, faça merge primeiro
- [ ] **Tempo estimado?** - Se >2h, criar branch dedicada (ver abaixo)

---

## 🌿 Para Análises Longas: Branch Dedicada (>2 horas)

**SEMPRE criar branch dedicada** para análises extensas:

```bash
# Usar script automatizado
./scripts/create-feature-branch.sh analysis-[tema]

# Exemplos
./scripts/create-feature-branch.sh analysis-whatsapp-architecture
./scripts/create-feature-branch.sh analysis-supabase-optimization
./scripts/create-feature-branch.sh analysis-database-migration
```

### Naming Convention para Branches
- **Análises estratégicas**: `analysis-[tema-descritivo]`
- **Decisões arquiteturais**: `arch-[decisao]`
- **Exemplos reais**:
  - `analysis-whatsapp-architecture`
  - `analysis-ai-coach-strategy`
  - `analysis-database-migration`
  - `arch-microservices-vs-monolith`
  - `arch-event-driven-refactor`

---

## 💾 Onde Salvar Outputs

Sempre salvar análises completas para referência futura e histórico de decisões.

### Estrutura de Diretório
```
docs/analyses/
```

### Padrão de Nomenclatura
```
YYYY-MM-DD-tema-descritivo.md
```

### Exemplos Reais
- `docs/analyses/2025-11-01-whatsapp-integration-architecture.md`
- `docs/analyses/2025-11-01-supabase-vs-firebase.md`
- `docs/analyses/2025-11-01-microservices-vs-monolith.md`
- `docs/analyses/2025-11-01-coach-ai-implementation-strategy.md`

---

## 📝 Template de Arquivo

Ao salvar sua análise ultra-think, use este template:

```markdown
# Ultra Think: [Título da Análise]

**Data**: 2025-11-01
**Autor**: Claude Code (Ultra Think Workflow)
**Status**: Completo / Em Progresso
**Decisão**: [Se aplicável]

## Contexto
[Problema/Questão original]

## Análise Multidimensional
[Perspectivas técnica, negócio, usuário, sistema]

## Opções Consideradas
[Soluções geradas - Fases 3-4]

## Recomendação
[Solução escolhida com racional - Fase 8]

## Próximos Passos
[Ações concretas e implementação]

## Meta-Análise
[Reflexões e incertezas - Fase 10]
```

---

## 🔄 Commits Intermediários

**Faça commits a cada fase concluída** para evitar perda de código:

```bash
# Após Fase 2 (Análise Multidimensional)
git add docs/analyses/
git commit -m "docs: ultra-think fase 2 - análise multidimensional [tema]"

# Após Fase 5 (Pensamento Cross-Domain)
git add docs/analyses/
git commit -m "docs: ultra-think fase 5 - cross-domain insights [tema]"

# Após Fase 8 (Recomendação Final)
git add docs/analyses/
git commit -m "docs: ultra-think fase 8 - recomendação final [tema]"

# Commit final
git add docs/analyses/
git commit -m "docs: ultra-think completo - [tema-curto]

Análise ultra-think sobre [descrição breve do problema].

Opções consideradas:
- Opção 1: [nome]
- Opção 2: [nome]
- Opção 3: [nome]

Recomendação: [opção escolhida]

Próximos passos: [ação principal]"
```

### Benefícios dos Commits Intermediários
- ✅ Zero risco de perda de código
- ✅ Histórico completo do raciocínio
- ✅ Fácil de revisar/comparar versões
- ✅ Possível reverter se necessário

---

## 🔄 Ciclo Completo: Ultra-Think + Git Workflow

Guia passo-a-passo para executar análise ultra-think com proteção Git:

```bash
# 1. ANTES de começar ultra-think
git status                          # Verificar estado
git checkout main                   # Ir para main
git pull origin main                # Sincronizar

# 2. Criar branch dedicada (se análise >2h)
./scripts/create-feature-branch.sh analysis-[tema]

# 3. Executar ultra-think (Fases 1-10)
# ... análise em progresso ...

# 4. Commits intermediários
# Após Fase 2
git add docs/analyses/
git commit -m "docs: ultra-think fase 2 - [tema]"

# Após Fase 5
git add docs/analyses/
git commit -m "docs: ultra-think fase 5 - [tema]"

# Após Fase 8
git add docs/analyses/
git commit -m "docs: ultra-think fase 8 - recomendação [tema]"

# 5. Commit final
git add docs/analyses/
git commit -m "docs: ultra-think completo - [tema]

[descrição detalhada da análise e recomendação]"

# 6. Push e PR (se necessário)
git push origin feat/analysis-[tema]
# Criar PR no GitHub se decisão precisa de revisão
```

---

## ⚠️ Verificações e Avisos

**SEMPRE verificar antes de começar**:

```bash
# Comando rápido de verificação
git status && git branch && echo "--- PRONTO PARA ULTRA-THINK ---"
```

### Se Ver Estas Mensagens, PARAR
- "Changes not staged for commit" → Commitar ou stash primeiro
- "Your branch is behind" → Fazer pull primeiro
- "You are in detached HEAD state" → Checkout para branch apropriada

---

## 🆘 Cenários de Recuperação

### Se esquecer de criar branch e já começou análise
```bash
git stash                                           # Salvar trabalho
./scripts/create-feature-branch.sh "analysis-tema" # Criar branch CORRETAMENTE
git stash pop                                       # Recuperar trabalho
```

### Se perder progresso (sem commit)
```bash
# Verificar se ainda há no histórico do editor
# Ou usar git reflog se houve algum commit
git reflog
git checkout [hash-do-commit-perdido]
```

---

## ✅ Checklist de Salvamento

Após completar análise ultra-think:

- [ ] Arquivo criado em `docs/analyses/` com nome padronizado
- [ ] Conteúdo inclui todas as fases relevantes (1-10)
- [ ] Recomendação final está clara e documentada
- [ ] Próximos passos estão explícitos
- [ ] Arquivo commitado com mensagem descritiva
- [ ] Se análise >2h, está em branch dedicada
- [ ] README.md em `docs/analyses/` atualizado com nova entrada
- [ ] Atualizado `docs/TASK.md` com conclusões
- [ ] Se decisão arquitetural, criado ADR em `docs/adr/`

---

## 🎯 Benefícios do Salvamento de Análises

- ✅ **Zero risco de perda**: Análise preservada permanentemente
- ✅ **Histórico de decisões**: Entender por que escolhemos X em vez de Y
- ✅ **Reutilização**: Problemas similares no futuro
- ✅ **Onboarding**: Novos devs entendem raciocínio
- ✅ **Auditoria**: Compliance e governança
- ✅ **Aprendizado**: Revisar decisões passadas

---

## 📊 Exemplo Real: Análise de Integração WhatsApp

Cenário: Análise de integração WhatsApp (3 horas)

```bash
# 1. Criar branch
./scripts/create-feature-branch.sh analysis-whatsapp

# 2. Executar ultra-think (fases 1-10)
# [Análise complexa em progresso...]

# 3. Salvar em arquivo
# Criar: docs/analyses/2025-11-01-whatsapp-integration.md
# [Copiar output do ultra-think para arquivo]

# 4. Commit intermediário (após fase 5)
git add docs/analyses/
git commit -m "docs: ultra-think fase 5 - cross-domain WhatsApp insights"

# 5. Commit final
git add docs/analyses/
git commit -m "docs: ultra-think completo - integração WhatsApp

Análise ultra-think sobre estratégia de integração WhatsApp WZAPI.

Opções consideradas:
- Opção 1: Edge Functions + Webhooks
- Opção 2: Node.js Backend
- Opção 3: Híbrido (Edge + Backend)

Recomendação: Opção 3 (Híbrido)

Próximos passos:
- Implementar Edge Functions para validação HMAC
- Setup webhooks em WZAPI
- Testes de integração E2E"

# 6. Push
git push origin feat/analysis-whatsapp
```

---

## 📚 Documentação Relacionada

Ver também:
- **`ultra-think.md`** - Workflow principal (10 fases de análise)
- **`docs/WORKFLOW_BRANCHES.md`** - Workflow completo de Git
- **`scripts/create-feature-branch.sh`** - Automação de branches
- **`docs/analyses/README.md`** - Índice de análises salvas

---

## 🎯 Lembrete Final

**Ultra-think SEM proteção Git = RISCO ALTO**

- Análises longas (3-8 horas) podem ser perdidas
- SEMPRE usar branch dedicada para análises >2h
- SEMPRE salvar em `docs/analyses/`
- SEMPRE fazer commits intermediários
- SEMPRE seguir este workflow de Git

**Recomendação**: Imprimir este checklist e usar durante análises críticas!

---

**Última atualização**: 2025-11-03
**Versão**: 1.0 (Primeira versão - Split de ultra-think.md v2.0)
**Autor**: Windsurf AI Workflow
**Foco**: Proteção de código, branches, commits e salvamento de análises
