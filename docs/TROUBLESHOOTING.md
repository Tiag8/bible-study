# Troubleshooting - Bible Study

## 🔴 Erros 404 de Recursos Estáticos Next.js

### Sintomas
```
Failed to load resource: the server responded with a status of 404 (Not Found)
- layout.css:1
- _next/static/chunks/...
```

### Causas Comuns

1. **Cache corrompido** - Build anterior com problemas
2. **Hot reload não funcionou** - Servidor não recompilou após mudanças
3. **Git pull/merge** - Build não atualizado após merge
4. **Processo zombie** - Servidor antigo ainda rodando
5. **Node modules desatualizados** - Dependências inconsistentes

---

## ✅ Soluções Rápidas

### Solução 1: Restart Limpo (Recomendado)
```bash
./scripts/clean-restart.sh
```

### Solução 2: Restart Completo (com reinstalação)
```bash
./scripts/clean-restart.sh --full
```

### Solução 3: Manual
```bash
# Parar servidor
lsof -ti:3000 | xargs kill -9

# Limpar cache
rm -rf .next

# Reiniciar
npm run dev
```

---

## 🛡️ Prevenção

### 1. Sempre Após Git Pull/Merge
```bash
git pull origin main
./scripts/clean-restart.sh  # ← SEMPRE executar
```

**Por quê**: Build pode estar desatualizado após merge

### 2. Sempre Após Instalar/Atualizar Dependências
```bash
npm install
./scripts/clean-restart.sh --full
```

**Por quê**: Node modules podem estar inconsistentes

### 3. Sempre Após Mudanças Estruturais
```bash
# Mudou estrutura de pastas em src/
# Adicionou/removeu páginas
# Mudou next.config.js
./scripts/clean-restart.sh
```

**Por quê**: Next.js precisa reconstruir mapeamento de rotas

### 4. Hard Reload no Navegador
```
Mac: Cmd + Shift + R
Windows/Linux: Ctrl + Shift + R
```

**Por quê**: Limpa cache do navegador

---

## 📋 Checklist de Prevenção

**Antes de começar a trabalhar**:
- [ ] `git pull origin main`
- [ ] `./scripts/clean-restart.sh`
- [ ] Hard reload no navegador

**Após fazer mudanças significativas**:
- [ ] Mudou estrutura? → `./scripts/clean-restart.sh`
- [ ] Instalou deps? → `./scripts/clean-restart.sh --full`
- [ ] Merge/pull? → `./scripts/clean-restart.sh`

**Se hot reload não funcionar**:
- [ ] `./scripts/clean-restart.sh`
- [ ] Hard reload navegador

---

## 🔧 Scripts Disponíveis

| Script | Uso | Quando Usar |
|--------|-----|-------------|
| `./scripts/clean-restart.sh` | Restart limpo | Erros 404, após pull/merge |
| `./scripts/clean-restart.sh --full` | Restart completo | Após npm install, problemas persistentes |
| `npm run build` | Build production | Antes de deploy, testar build |
| `npm run dev` | Servidor dev | Desenvolvimento normal |

---

## 🚨 Quando Nada Funciona

```bash
# 1. Parar TUDO
lsof -ti:3000 | xargs kill -9
pkill -f "next dev"

# 2. Limpar TUDO
rm -rf .next node_modules package-lock.json

# 3. Reinstalar TUDO
npm install

# 4. Build LIMPO
npm run build

# 5. Iniciar
npm run dev
```

---

## 📝 Logs e Debug

### Ver logs do servidor
```bash
tail -f /tmp/nextjs-dev.log
```

### Ver processos na porta 3000
```bash
lsof -ti:3000
```

### Verificar build status
```bash
npm run build
```

---

## 🎯 Boas Práticas

1. **Sempre usar script de restart** após pull/merge
2. **Hard reload no navegador** após mudanças
3. **Verificar logs** se algo não funcionar
4. **Build limpo** antes de deploy
5. **Nunca commitar `.next/`** (já está no .gitignore)

---

**Última atualização**: 2026-01-26
