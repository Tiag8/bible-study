---
description: Workflow Add-Feature (9/10) - Finalization (Docs + Commit + Merge)
---

# Workflow 9/10: Finalization (Finalização)

Este é o **nono workflow** de 10 etapas modulares para adicionar uma nova funcionalidade.

**O que acontece neste workflow:**
- Fase 19: Atualização de Documentação
- Fase 20: Commit e Push
- Fase 21: Resumo e Métricas
- **⏸️ FIM DO WORKFLOW AUTOMÁTICO**
- Fase 22: Validação do Usuário (build produção - MANUAL)
- Fase 23: Merge na Main (MANUAL - COM APROVAÇÃO!)
- Fase 24: Pós-Merge
- Seção Informativa: Boas Práticas Git/GitHub

---

## 📚 Fase 19: Atualização de Documentação

**IMPORTANTE**: A documentação é atualizada **incorporando aprendizados** da Fase 17 (Meta-Learning).

### 19.1 Checklist de Documentação

#### ✅ Atualizar Mapa de Feature (se aplicável)

**Quando**: Adicionar/modificar componentes, hooks ou queries em uma feature existente

**Arquivos**:
- `docs/features/stats.md` - Sistema de performance/stats
- `docs/features/makeup.md` - Gestão financeira
- Criar novo `.md` se for feature totalmente nova

**O que documentar**:
```markdown
## 🎨 UI - Componentes
- Componente: ProfitCard
- Path: src/components/ProfitCard.tsx
- Props: { period: '7d' | '14d' | '30d' | '180d' }

## 🪝 Hooks - Lógica de Dados
- Hook: useProfit
- Assinatura: useProfit(period: string) => { data, loading, error }
- Query: SELECT * FROM profit_stats WHERE period = ?
- Propósito: Buscar dados de PROFIT por período

## 🗄️ Database
- Tabela: profit_stats
- Colunas novas: period, amount, timestamp
- Índices: idx_profit_stats_period
```

---

#### ✅ Criar ADR (se decisão arquitetural)

**Quando**: Decisão técnica importante (ex: escolher biblioteca, mudar padrão, performance)

**Arquivo**: `docs/adr/XXX-titulo-decisao.md` (XXX = número sequencial)

**Template**:
```markdown
# ADR XXX: Título da Decisão

## Status
Aceito

## Contexto
Por que precisamos tomar essa decisão?

## Decisão
O que decidimos fazer?

## Consequências
### Positivas
- Benefício 1
- Benefício 2

### Negativas
- Trade-off 1

## Alternativas Consideradas
- Opção A: ... (rejeitada porque...)
- Opção B: ... (aceita)
```

---

#### ✅ Atualizar README.md (se necessário)

**Quando**: Feature nova, mudança no setup, nova otimização

**Seções a considerar**:
- Funcionalidades Principais - Adicionar nova feature
- Stack Tecnológica - Nova dependência importante
- Scripts Disponíveis - Novo script criado
- Otimizações - Nova otimização implementada

---

#### ✅ Atualizar Regras de Negócio (se aplicável)

**Arquivo**: `docs/regras-de-negocio/calculo-de-performance.md`

**Quando**: Mudar fórmulas, pesos, lógica de cálculo

---

## 💾 Fase 20: Commit e Push

// turbo

```bash
./scripts/commit-and-push.sh "feat: adicionar cards PROFIT (7/14/30/180d) no MakeUp"
```

### Commits criados:
```
✅ 1. migration: adicionar tabela profit_stats
✅ 2. test: adicionar testes para useProfit - RED
✅ 3. feat: implementar useProfit hook - GREEN
✅ 4. test: adicionar testes para ProfitCard
✅ 5. feat: criar ProfitCard (estrutura básica)
✅ 6. feat: conectar ProfitCard com useProfit
✅ 7. style: estilizar ProfitCard
✅ 8. style: tornar ProfitCard responsivo
✅ 9. fix: corrigir cálculo de PROFIT (feedback do usuário)
✅ 10. docs: atualizar mapa de feature MakeUp
```

**Push realizado com sucesso!** ✅

---

## 🎉 Fase 21: Resumo e Próximos Passos

### ✅ O que foi feito:
- [x] Backup criado
- [x] Branch Git criada
- [x] Código implementado com TDD
- [x] Usuário validou manualmente (2-4 iterações)
- [x] Code review aprovado
- [x] Security scan passou
- [x] Meta-aprendizado realizado
- [x] Documentação atualizada
- [x] Commits e push realizados

### 📊 Métricas:
- **Arquivos modificados**: [X]
- **Linhas adicionadas**: +XXX
- **Linhas removidas**: -XX
- **Testes adicionados**: [X]
- **Cobertura**: XX%
- **Commits**: 8-15 commits pequenos ✅

---

## ⏸️ FIM DO WORKFLOW AUTOMÁTICO

**🎯 O workflow automático para aqui!**

Código está commitado e push feito para `feat/add-profit-cards-makeup`.

**⚠️ IMPORTANTE**: O merge para `main` **NÃO é automático**. Você decide quando fazer!

**As próximas fases são MANUAIS e opcionais:**

---

## 🧪 Fase 22: Validação do Usuário (build produção - MANUAL)

**Esta fase é MANUAL e OPCIONAL antes do merge!**

### Checklist de Testes Finais

Antes de fazer merge na main, recomenda-se testar build de produção:

```bash
npm run build
```

**Verificar**:
- [ ] Build completa sem erros
- [ ] Sem warnings críticos (chunk size OK)
- [ ] Bundle size aceitável

**Se build passar**:
```bash
npm run preview
```

Testar app no preview (http://localhost:4173):
- [ ] Feature funciona em build de produção
- [ ] Performance está OK
- [ ] Não há regressões

**Se tudo OK → Prossiga para Fase 23 (Merge).**

---

## 🔀 Fase 23: Merge na Main (APENAS COM SUA APROVAÇÃO!)

**⚠️ ATENÇÃO**: Esta fase só deve ser executada quando:
1. ✅ Você validou TUDO na Fase 22 (ou testou suficientemente)
2. ✅ Está 100% confiante que o código está pronto
3. ✅ Não há mais ajustes a fazer

### Opção A: Merge Direto (Projeto Solo/Pequeno)

```bash
# 1. Ir para main
git checkout main

# 2. Atualizar main (sempre!)
git pull origin main

# 3. Fazer merge da sua feature
git merge feat/add-profit-cards-makeup

# 4. Resolver conflitos se houver
# (edite arquivos, depois):
git add .
git merge --continue

# 5. Push para main
git push origin main

# 6. Deletar branch (opcional - boa prática)
git branch -d feat/add-profit-cards-makeup
git push origin --delete feat/add-profit-cards-makeup
```

---

### Opção B: Pull Request (Projeto com Time/Revisão)

```bash
# Criar PR via GitHub CLI
gh pr create \
  --title "feat: adicionar cards PROFIT no MakeUp" \
  --body "## Mudanças
- Card PROFIT 7 dias
- Card PROFIT 14 dias
- Card PROFIT 30 dias
- Card PROFIT 180 dias

## Testes
- [x] Testado manualmente
- [x] Build passa
- [x] Sem warnings
- [x] Code review aprovado
- [x] Security scan passou

## Screenshots
[adicione screenshots se relevante]"

# Aguardar aprovação de code review
# Depois: Merge pelo GitHub UI
```

---

### Opção C: Não Fazer Merge Ainda

**Situações onde NÃO deve fazer merge**:
- ❌ Encontrou bugs nos testes manuais
- ❌ Precisa fazer mais ajustes
- ❌ Quer que alguém revise antes
- ❌ Feature ainda não está completa
- ❌ Está esperando feedback do cliente

**Neste caso**: Continue trabalhando na branch e repita validação depois.

---

## 🎉 Fase 24: Pós-Merge (Apenas se fez merge)

### ✅ O que acontece após merge?

1. **Main está atualizada**: `git log main --oneline -5`
2. **Novas branches herdam tudo**: Próxima feature criada terá seu código
3. **Código em produção** (se deploy automático habilitado)

### 🧹 Limpeza (Opcional)

```bash
# Deletar branch local
git branch -d feat/add-profit-cards-makeup

# Deletar branch remota
git push origin --delete feat/add-profit-cards-makeup

# Limpar branches remotas já deletadas
git fetch --prune
```

### 📊 Próxima Feature

Quando for criar nova feature:

```bash
# Sempre partir da main ATUALIZADA!
git checkout main
git pull origin main

# Criar nova branch
./scripts/create-feature-branch.sh "proxima-funcionalidade"
```

Sua nova branch terá:
- ✅ Código da feature anterior (já na main)
- ✅ Documentação atualizada
- ✅ Scripts mais recentes
- ✅ Tudo sincronizado

---

## 🔄 Rollback (Se necessário após merge)

**Se fez merge mas precisa reverter**:

### Opção 1: Revert (Recomendado - Seguro)
```bash
# Criar commit que desfaz a merge
git checkout main
git revert -m 1 HEAD  # Reverte último merge
git push origin main
```

### Opção 2: Reset (Perigoso - Use com cuidado!)
```bash
# Voltar para commit anterior ao merge
git checkout main
git reset --hard HEAD~1
git push origin main --force  # ⚠️ CUIDADO: Force push!
```

### Opção 3: Restaurar Backup do Banco
```bash
# Se mudanças no banco precisam ser revertidas
./scripts/restore-supabase.sh backups/backup-YYYYMMDD-HHMMSS.sql
```

---

## 📝 Notas Finais

- **Backup salvo em**: `backups/backup-YYYYMMDD-HHMMSS.sql`
- **Branch feature**: `feat/add-profit-cards-makeup`
- **Status**: ⏸️ Aguardando validação manual e decisão de merge
- **Documentação atualizada**: `docs/features/makeup.md`
- **Tempo de workflow**: ~XX minutos (automático) + validação manual

### ⚡ Lembretes Importantes

1. **Workflow para na Fase 21**: Push foi feito, mas merge NÃO
2. **Fase 22 é SUA responsabilidade**: Testar build de produção (opcional)
3. **Fase 23 precisa de SUA aprovação**: Você decide quando fazer merge
4. **Main sempre funcional**: Só faça merge de código 100% testado
5. **Branch efêmera**: Após merge, pode deletar a branch

---

## 🔄 Boas Práticas Git/GitHub (Seção Informativa)

### Regra de Ouro: Sempre Partir da Main Atualizada

**Problema comum**: Criar branch sem arquivos recentes (docs, scripts, migrations)

**Solução**: Seguir sempre este fluxo:

```bash
# 1. Ir para main
git checkout main

# 2. Atualizar com remote
git pull origin main

# 3. Criar nova branch a partir da main
git checkout -b feat/nova-funcionalidade
```

### Quando Fazer Merge na Main?

**Frequência recomendada**: Sempre que uma feature estiver **completa e testada**

**Benefícios**:
- ✅ Novas branches criadas terão tudo atualizado
- ✅ Menos conflitos de merge
- ✅ Código sempre funcional na main
- ✅ Facilita rollback se necessário

### Checklist Pré-Branch

Antes de criar nova branch, confirme:

- [ ] Estou na main? (`git branch --show-current`)
- [ ] Main está atualizada? (`git pull origin main`)
- [ ] Tem docs/? (`ls docs/`)
- [ ] Tem scripts/? (`ls scripts/`)
- [ ] Tem .env.example? (`ls .env.example`)

### Estratégia de Branches

**Branches efêmeras (feature branches)**:
- `feat/add-ranking-stats` → Adiciona funcionalidade
- `fix/performance-bug` → Corrige bug
- `refactor/cleanup-hooks` → Refatoração
- `docs/update-architecture` → Documentação

**Lifetime**: Curto (1-3 dias) → Merge para main → Delete

**Main/Master**:
- Sempre funcional
- Sempre testada
- Sempre documentada
- Base para novas branches

---

## 🎉 FIM DO WORKFLOW ADD-FEATURE COMPLETO!

**Parabéns! Você completou o workflow de adicionar uma nova funcionalidade!**

**O que foi conquistado:**
- ✅ Planejamento profundo (3 soluções consideradas)
- ✅ Análise de riscos (mitigações planejadas)
- ✅ Setup seguro (backup + branch)
- ✅ Implementação com TDD (pequenos commits)
- ✅ Validação manual (feedback iterativo) ⭐
- ✅ Code review + Security scan
- ✅ Meta-aprendizado (sistema evoluindo)
- ✅ Documentação atualizada
- ✅ Commits + Push

**Próximo passo**: Iniciar próxima feature (começar do zero, Workflow 1)!

**Dúvidas?** É só me chamar! 🎉

---

**Workflow criado em**: 2025-10-27
**Versão**: 2.0 (Modular + Validação do Usuário + Meta-Learning)
**Autor**: Windsurf AI Workflow + Claude Code
