# Feature Orchestrator - Cheat Sheet

**Comandos rápidos** para quando você esquecer.

---

## 🚀 COMANDOS PRINCIPAIS

```bash
# Ver todas features
./scripts/feature-dashboard.sh

# Criar nova feature
./scripts/feature-init.sh <nome>

# Atualizar state
./scripts/feature-update-state.sh <nome> <campo> <valor>

# Ver state detalhado
cat .context/feat-<nome>_orchestrator-state.json | jq
```

---

## 📝 ATUALIZAR STATE (Exemplos)

```bash
# Mudar workflow
./scripts/feature-update-state.sh payment workflow 2b

# Mudar fase
./scripts/feature-update-state.sh payment phase "GATE 1"

# Mudar status
./scripts/feature-update-state.sh payment status paused

# Marcar workflow completo
./scripts/feature-update-state.sh payment complete-workflow 1
```

---

## 🚦 GATES (Pausar/Continuar)

```bash
# PAUSAR em gate
./scripts/feature-update-state.sh payment status paused
jq '.gate = {"type": "human", "trigger": "screenshot", "reached_at": "'$(date -Iseconds)'"}' \
  .context/feat-payment_orchestrator-state.json > tmp && mv tmp .context/feat-payment_orchestrator-state.json

# CONTINUAR após aprovação
./scripts/feature-update-state.sh payment status active
jq '.gate = null' .context/feat-payment_orchestrator-state.json > tmp && mv tmp .context/feat-payment_orchestrator-state.json
```

---

## 🔍 CONSULTAS ÚTEIS

```bash
# Quantas features ativas?
./scripts/feature-dashboard.sh | grep active | wc -l

# Listar workflows completados
jq '.workflows_completed' .context/feat-payment_orchestrator-state.json

# Ver último update
jq '.updated_at' .context/feat-payment_orchestrator-state.json

# Features pausadas (action required)
for f in .context/*_orchestrator-state.json; do
  jq -r 'select(.status == "paused") | .feature' "$f"
done
```

---

## 🛠️ TROUBLESHOOTING

```bash
# Validar JSON
jq '.' .context/feat-payment_orchestrator-state.json

# Restaurar backup
cp .context/feat-payment_orchestrator-state.json.bak \
   .context/feat-payment_orchestrator-state.json

# Reinstalar jq
brew install jq
```

---

## 📚 DOCUMENTAÇÃO COMPLETA

```bash
# Guia rápido
cat docs/guides/FEATURE-ORCHESTRATOR-QUICKSTART.md

# Exemplo prático (4 dias)
cat docs/guides/EXAMPLE-PRACTICAL-USE.md

# Schema JSON
cat .context/ORCHESTRATOR-STATE-SCHEMA.json

# Planejamento Solução 2
cat docs/guides/SOLUTION-2-ROADMAP.md
```

---

## 💡 ALIAS ÚTEIS

```bash
# Adicionar ao ~/.zshrc ou ~/.bashrc
alias fd='./scripts/feature-dashboard.sh'
alias fi='./scripts/feature-init.sh'
alias fu='./scripts/feature-update-state.sh'

# Usar
fd                        # Dashboard
fi payment                # Criar feature
fu payment workflow 2b    # Atualizar workflow
```
