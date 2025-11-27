# Git Branch Cleanup Guide

**Quando deletar branches?**: APENAS após Workflow 12 (Merge to Main)

---

## Sequência Correta

### Workflow 9a-11 (MANTER Branch)
```bash
# ✅ Branch LOCAL mantida
# ✅ Necessária para deploy (Workflow 11)
# ✅ Necessária para rollback (SE deploy falhar)
```

**Por quê MANTER?**:
- Branch pode ser necessária para rollback
- Deploy (Workflow 11) pode falhar
- Workflows 10-11 podem precisar da branch
- Commits ainda não em main

### Workflow 12 (DELETAR Branch)
```bash
# Após merge + push main
git branch -d feat/landing-page-mvp  # ✅ CORRETO
git push origin --delete feat/landing-page-mvp  # Opcional
```

**Por quê DELETAR AGORA?**:
- ✅ Merge completo em main
- ✅ Deploy validado (Workflow 11)
- ✅ Branch segura em main
- ✅ Reversível: `git checkout -b feat-X <hash>`

### Workflow 14 (ARQUIVAR .context/)
```bash
# Após consolidação meta-learning 3-5 features
mv .context/feat-landing-page-mvp_* .context/.archive-20251120/
```

---

## Por Quê NÃO Workflow 9a?

❌ **Cedo demais**:
- Branch não mergeada ainda
- Deploy (Workflow 11) pode falhar → precisa rollback
- Workflows 10-11 podem precisar da branch
- Commits ainda locais (não em main)

✅ **Workflow 12 é ideal**:
- Merge completo
- Deploy validado
- Branch segura em main
- Reversível: `git checkout -b feat-X <hash>`

---

## Exceções

**NÃO deletar SE**:
1. Deploy staging (não production ainda)
2. Smoke tests falharam (Workflow 13)
3. Rollback necessário
4. PR aberto (GitHub/GitLab)
5. Aguardando validação externa

**AGUARDAR**: Workflow 13 (Post-Deploy) validar → DEPOIS deletar em Workflow 12 atrasado

---

## .context/ vs Branch

| Item | Deletar Quando | Workflow | Motivo |
|------|----------------|----------|--------|
| Branch local | Após merge main | **12** | Commits em main (seguro) |
| Branch remota | Opcional | **12** | PR fechado (opcional) |
| .context/ | Após consolidação | **14** | Meta-learning 3-5 features |

---

## Comandos Detalhados

### Deletar Branch Local (Workflow 12 - Fase 5.1)

```bash
# 1. Verificar branch foi mergeada
git branch --merged main | grep feat/landing-page-mvp

# 2. SE mergeada: Deletar branch local
git branch -d feat/landing-page-mvp

# Output esperado:
# Deleted branch feat/landing-page-mvp (was 337886a).

# 3. SE precisar recuperar (reversível):
git checkout -b feat/landing-page-mvp 337886a
```

### Deletar Branch Remota (Opcional)

```bash
# SE branch foi pushed E PR fechado E não precisa histórico:
git push origin --delete feat/landing-page-mvp

# Output esperado:
# To github.com:user/repo.git
#  - [deleted]         feat/landing-page-mvp
```

**Quando MANTER branch remota?**:
- PR ainda aberto (referência)
- Documentação aponta para branch
- Histórico importante (backup)
- Política de retenção (30/90 dias)

### Arquivar .context/ (Workflow 14)

```bash
# Após consolidar meta-learning de 3-5 features
BACKUP_DIR=".context/.archive-$(TZ='America/Sao_Paulo' date '+%Y%m%d-%H%M%S')"
mkdir -p "$BACKUP_DIR"
mv .context/feat-landing-page-mvp_* "$BACKUP_DIR/"

echo "✅ Context arquivado em $BACKUP_DIR"
```

---

## Checklist Completo

### Pré-Workflow 12
- [ ] Workflows 9a-11 completos
- [ ] Deploy validado (staging → production)
- [ ] Smoke tests passaram (Workflow 13)
- [ ] Zero erros produção (10-15min monitoring)

### Workflow 12 - Fase 5
- [ ] git checkout main
- [ ] git pull origin main
- [ ] git merge --no-ff feat/landing-page-mvp
- [ ] git push origin main
- [ ] **git branch -d feat/landing-page-mvp** ✅
- [ ] git push origin --delete feat/landing-page-mvp (opcional)

### Pós-Workflow 12
- [ ] Branch local deletada
- [ ] Branch remota deletada (se aplicável)
- [ ] .context/ mantido até Workflow 14
- [ ] Reversível via git checkout -b

---

## Regras

**Regra #1**: Branch → Workflow 12 (após merge)
**Regra #2**: .context/ → Workflow 14 (após consolidação)
**Regra #3**: NUNCA deletar antes de Workflow 12
**Regra #4**: Branch remota é OPCIONAL (manter 30-90d OK)

---

## Troubleshooting

### Branch não foi mergeada

```bash
# Erro: The branch 'feat-X' is not fully merged
git branch -d feat-X

# Opção 1: Verificar se realmente não mergeada
git log main..feat-X --oneline

# Opção 2: SE tem certeza (forçar delete)
git branch -D feat-X
```

### Branch já deletada remota mas aparece local

```bash
# Limpar referências stale
git fetch --prune

# Verificar branches remotas
git branch -r
```

### Recuperar branch deletada

```bash
# 1. Encontrar último commit da branch
git reflog | grep feat-X

# 2. Recriar branch
git checkout -b feat-X <hash-encontrado>
```

---

## Benefícios

1. **Segurança**: Branch mantida durante deploy (rollback < 3min)
2. **Rastreabilidade**: Commits em main (histórico completo)
3. **Reversibilidade**: git checkout -b sempre disponível
4. **Zero acidentes**: NUNCA deletar branch antes merge validado
5. **Compliance**: Anthropic 2025 guidelines (human-in-the-loop)

---

**Versão**: 1.0.0
**Data**: 2025-11-20
**Autor**: Life Track Growth
**Referências**: Workflow 12, REGRA #23 (Git Workflow), ADR-031
