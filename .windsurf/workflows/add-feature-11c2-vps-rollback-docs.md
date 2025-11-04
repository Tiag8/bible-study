---
description: Workflow 11/11 - VPS Deployment - Parte 3b/3 (Rollback & Docs)
---

## 📋 Workflow 11 - Parte 3b/3 (Rollback & Documentação)

**Parte final do Deploy. Partes do Workflow 11**:
- Parte 1/3: `add-feature-11a-vps-deployment-prep.md`
- Parte 2/3: `add-feature-11b-vps-deployment-exec.md`
- Parte 3a/3: `add-feature-11c1-vps-monitoring.md`
- Parte 3b/3: `add-feature-11c2-vps-rollback-docs.md` ← **AQUI**

**Objetivo**: Rollback (se necessário) e documentação de deploy.

---

## 🎯 Como Chegou Aqui?

Você chegou aqui após concluir o **Workflow 11c1 (Monitoramento)**. Dependendo dos resultados, siga um dos dois caminhos:

**Cenário 1: Tudo OK ✅**
- Monitoramento passou sem erros críticos (10 minutos)
- Pule **Fase 29** e execute **Fase 30** (Documentação apenas)
- Tempo: ~5-10 minutos

**Cenário 2: Encontrou Problemas ❌**
- Erros críticos detectados durante monitoramento
- Execute **Fase 29** (Rollback) + **Fase 30** (Documentação)
- Tempo: ~10-15 minutos
- Analise problema em `docs/INCIDENTS.md` após concluir

---

## 📋 Dois Caminhos Possíveis

**Monitoramento OK?** Pule Fase 29 e execute Fase 30 (Documentação). Tempo: 5-10min.

**Problemas?** Execute Fase 29 (Rollback) + Fase 30. Tempo: 10-15min.

---

## 🔄 Fase 29: Rollback (Se Necessário)

**Sinais de rollback**: Service não inicia, 500+ erros, restarts frequentes, feature crítica quebrou, dados corrompidos.

### 29.1 Executar Rollback

```bash
# Script automático
./scripts/vps-rollback.sh

# OU manual:
ssh root@31.97.22.151 "docker stack rm lifetracker"
sleep 30
git checkout <commit-anterior>
docker build -t life-tracker:rollback .
./scripts/deploy-vps.sh
```

**Tempo**: 2-3 minutos. Ver `docs/ops/vps-access.md` para detalhes.

### 29.2 Pós-Rollback

1. Documentar problema em `docs/INCIDENTS.md`
2. Analisar commits e identificar causa
3. Corrigir código + adicionar testes
4. Re-executar Workflow 11

---

## 📝 Fase 30: Documentação do Deploy

**IMPORTANTE**: Documentar deploy para histórico e aprendizado.

### 30.1 Atualizar Deploy History

```bash
# Adicionar entry em docs/ops/deploy-history.md
DATE=$(date '+%Y-%m-%d %H:%M')
COMMIT=$(git rev-parse --short HEAD)
BRANCH=$(git branch --show-current)

cat >> docs/ops/deploy-history.md << EOF

### Deploy $DATE
**Branch**: \`$BRANCH\` | **Commit**: \`$COMMIT\`
**Status**: ✅ Sucesso / ❌ Rollback | **Tempo**: ~7-10 min
**Validações**: Testes ✅ | Build ✅ | Smoke tests ✅ | Monitoramento 10min ✅
**Notas**: [Observações, problemas, lições aprendidas]

---
EOF
```

### 30.2 Atualizar Documentação (Se necessário)

Se houve mudanças operacionais importantes:
- Atualizar `docs/ops/README.md` (novos procedimentos)
- Criar ADR em `docs/adr/` (decisões arquiteturais)
- Atualizar `README.md` (seção Deploy)

---

## ✅ Checklist Final

**Monitoramento** (Fase 28):
- [ ] 10min sem erros críticos
- [ ] Service "Running" o tempo todo
- [ ] Testes OK (carga, manual, regressões)

**Rollback** (Fase 29 - se necessário):
- [ ] Executado com sucesso
- [ ] Versão anterior estável

**Documentação** (Fase 30):
- [ ] Deploy history atualizado
- [ ] Problemas documentados
- [ ] ADRs criados (se necessário)

---

## Concluído!

**Workflow 11 completo**: Preparação → Execução → Monitoramento → Rollback & Docs

Tempo: ~20-25 min. Próxima: Voltar ao Workflow 1 (Planning).

Aplicação em produção: **https://life-tracker.stackia.com.br**

Após finalizar:
- [ ] Atualizar `docs/TASK.md`
- [ ] Atualizar `docs/PLAN.md` (se mudança estratégica)
- [ ] Criar ADR (se decisão arquitetural)
- [ ] Adicionar entry em `docs/ops/deploy-history.md`

