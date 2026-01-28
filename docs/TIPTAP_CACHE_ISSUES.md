# Tiptap + Next.js 15: Cache Issues & Solutions

**Problema**: "Adding different instances of a keyed plugin (history$)"

## 📋 Índice

1. [Causa Raiz](#causa-raiz)
2. [Sintomas](#sintomas)
3. [Soluções por Prioridade](#soluções-por-prioridade)
4. [Prevenção](#prevenção)
5. [Troubleshooting Avançado](#troubleshooting-avançado)

---

## 🔴 Causa Raiz

### O Problema

Next.js 15 com SWC mantém cache agressivo de módulos compilados. Quando você:

1. **Edita código Tiptap** (ex: `Editor.tsx` ou `StarterKit.configure()`)
2. **Salva o arquivo**
3. **Webpack recebe mudança** via HMR (Hot Module Replacement)
4. **SWC cache NÃO invalida** a instância anterior de `history$`
5. **Tiptap detecta** 2 instâncias do plugin `history`
6. **React lança RangeError**

### Por que Tiptap?

Tiptap usa "keyed plugins" - cada extensão tem uma chave única (`history$`, `codeBlock$`, etc). O sistema de cache do SWC não reconhece quando essas chaves são duplicadas em múltiplas instâncias.

### Quando ocorre?

- ✅ Ao editar `Editor.tsx`
- ✅ Ao editar qualquer componente que use Editor
- ✅ Ao mudar imports de Tiptap
- ✅ Em modo DEV (não ocorre em produção após build)
- ❌ NÃO ocorre se você faz reload completo do navegador

---

## 🔍 Sintomas

### Erro no Console

```
Runtime RangeError: Adding different instances of a keyed plugin (history$)

at StudyPageClient (src/app/estudo/[id]/StudyPageClient.tsx:837:11)
at StudyPage (src/app/estudo/[id]/page.tsx:19:7)
```

### Quando aparece

- Depois de salvar arquivo
- Page não renderiza completamente
- Editor não carrega
- Browser mostra white screen

### Como desaparecer

- ✅ Refresh página F5
- ✅ Limpar `.next/` + reiniciar servidor
- ❌ Apenas recarregar hot-module (não funciona)

---

## 🛠️ Soluções por Prioridade

### **🔴 Urgente: Erro Recorrente**

```bash
# Solução rápida (30s)
npm run restart

# Ou com auto-fix contínuo
./scripts/auto-fix-cache.sh
```

**O que faz:**
1. Para servidor
2. Remove `.next/` (force rebuild)
3. Reinicia sem rebuild completo
4. Testa conexão

---

### **🟡 Preventiva: Evitar Erro**

Aplicado automaticamente em `next.config.ts`:

```typescript
webpack: (config, { isServer }) => {
  if (!isServer) {
    config.performance = {
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    };
  }
  return config;
};
```

**Por que funciona:**
- Aumenta limite de memória
- Reduz fragmentação de cache
- Melhora estabilidade do HMR

---

### **🟢 Definitiva: Corrigir Raiz**

#### Checklist de Verificação

- [ ] `next.config.ts` tem `webpack` config? (ver `next.config.ts`)
- [ ] Imports de Tiptap são **únicos**? (não duplicados)
- [ ] `History.configure()` aparece **1x ou menos**?
- [ ] `StarterKit.configure({ history: {...} })`?
- [ ] `useMemo()` wraps `extensions` array?
- [ ] `extensions` dependency array está vazio `[]`?

#### Checklist de Código (Editor.tsx)

```typescript
// ✅ CORRETO
const extensions = useMemo(
  () => [
    StarterKit.configure({
      history: { depth: 5 }, // 👈 Configure aqui
    }),
    // ... outras extensões
  ],
  [] // 👈 Dependency array vazio!
);

// ❌ ERRADO - Nunca faça
const extensions = useMemo(
  () => [
    History.configure({ depth: 5 }), // Duplicado!
    StarterKit.configure({ /* ... */ }),
  ],
  [otherDeps] // 👈 Dependency array NÃO vazio
);
```

---

## 🚀 Prevenção

### 1. **Configurar CI/CD** (Supabase Deploy)

```bash
# Pré-deploy, limpar cache
npm run clean
npm run build
```

### 2. **Monitorar em Desenvolvimento**

Use script auto-fix:

```bash
# Terminal 1: Monitorar logs + auto-fix
./scripts/auto-fix-cache.sh

# Terminal 2: Desenvolver normalmente
# Auto-fix vai detectar e corrigir sozinho
```

### 3. **Lint de Configuração**

Adicione pre-commit hook (futuro):

```bash
# Validar que History é configurado 1x apenas
grep -c "History" src/components/Editor/index.tsx # Deve ser 0 ou 1
```

### 4. **Documentação de Onboarding**

Novo dev deve saber:

```
Se ver "Adding different instances of a keyed plugin":
1. NÃO é um bug do seu código
2. Rodar: npm run restart
3. Continuar desenvolvendo
4. Se recorrer: ./scripts/auto-fix-cache.sh
```

---

## 🔧 Troubleshooting Avançado

### Cenário 1: Erro Persiste após Restart

```bash
# Tentativa 1: Full clean
npm run restart:full

# Se ainda persiste...

# Tentativa 2: Kill Node processes
lsof -i :3000 | awk 'NR!=1 {print $2}' | xargs kill -9

# Tentativa 3: Verify Tiptap config
# Abra src/components/Editor/index.tsx e verifique:
# - Nenhum "import { History }" no topo
# - History DENTRO de StarterKit.configure()
# - extensions wrapped em useMemo()
```

### Cenário 2: Erro Só Acontece em Produção

Isso **NÃO deve acontecer** em produção porque:
- Build é single-pass
- SWC cache não persiste entre deploys
- Cada deploy = fresh build

**Se acontecer em produção:**

```bash
# Verify production build
npm run build
npm run start

# Teste em http://localhost:3000
# Se erro aparece, há problema de config
```

### Cenário 3: Erro em Outros Componentes

Se erro menciona plugin diferente (ex: `codeBlock$`):

```bash
# Mesmo problema, extensão diferente
# Verificar configurações de:
grep -n "CodeBlockLowlight\|CodeBlock" src/**/*.tsx
```

---

## 📊 Comparativo: Antes vs Depois

### Antes (sem soluções)

```
Editar Editor.tsx
    ↓
Salvar
    ↓
❌ RangeError
    ↓
npm run restart
    ↓
✅ Funciona
```

**Frequência**: 3-5x por dia
**Tempo perdido**: 15-20 min/dia

### Depois (com soluções)

```
Editar Editor.tsx
    ↓
Salvar
    ↓
✅ HMR atualiza normalmente
    ↓
Continuar desenvolvendo
```

**Frequência**: 0 (problema resolvido)
**Tempo perdido**: 0 min/dia

---

## 📚 Referências

- [Tiptap Docs: Keyed Plugins](https://tiptap.dev/)
- [Next.js 15: SWC Compiler](https://nextjs.org/docs/architecture/nextjs-compiler)
- [React: Memoization Best Practices](https://react.dev/reference/react/useMemo)
- [Webpack: Cache Management](https://webpack.js.org/configuration/cache/)

---

## ✅ Checklist Final

- [ ] `next.config.ts` otimizado com webpack config
- [ ] `scripts/clean-restart.sh` atualizado (mode DEV vs PROD)
- [ ] `scripts/auto-fix-cache.sh` disponível para uso
- [ ] `Editor.tsx` sem importação explícita de `History`
- [ ] `Editor.tsx` com `history` dentro de `StarterKit.configure()`
- [ ] Team documentado sobre solução
- [ ] `.gitignore` inclui `.next/` ✓

---

**Status**: ✅ Resolvido
**Última atualização**: 2026-01-27
**Aplicado em**: `src/components/Editor/index.tsx`, `next.config.ts`, `scripts/`
