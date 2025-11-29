# ADR-025: Vite Environment Variables Priority e System Env Pollution

**Data**: 2025-11-15
**Status**: ⚠️ Aceito (Implementação Parcial)
**Contexto**: Workflow 6a - feat/modal-primeiro-acesso-web
**Problema**: Erros 401 recorrentes causados por variáveis de ambiente do sistema sobrescrevendo .env

---

## Contexto

Durante Workflow 6a (User Validation), erros 401 "Invalid API key" e "Invalid JWT" bloquearam testes.

**Sintomas**:
- Signup retorna 401 "Invalid API key"
- Check-whatsapp retorna 401 "Invalid JWT"
- Teste Node.js direto funciona (status 200)
- Frontend (browser) falha consistentemente

**Debugging (4 iterações, ~3h)**:
1. **Iteração 1**: Suspeita cleanup localStorage → Desabilitado → ❌ Não resolveu
2. **Iteração 2**: Suspeita cache Vite → Limpado → ❌ Não resolveu
3. **Iteração 3**: Suspeita Vite não recarrega .env → Restart completo → ❌ Não resolveu
4. **Iteração 4**: **ROOT CAUSE** → System env vars sobrescrevem .env → ✅ RESOLVEU

---

## Problema

### Descoberta Crítica

Vite lê variáveis de ambiente nesta **ordem de prioridade**:
1. **System environment variables** (mais alta)
2. `.env.local`
3. `.env.[mode]` (ex: `.env.development`)
4. `.env`

**Evidência do problema**:
```bash
# Sistema tinha token ANTIGO (projeto Supabase migrado):
$ env | grep VITE_SUPABASE_PUBLISHABLE_KEY
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...fjddlfnlbrhh...
# Decodifica para: "ref":"fjddlfnlbrhh..." (PROJETO ANTIGO)

# .env tinha token CORRETO:
$ cat .env | grep VITE_SUPABASE_PUBLISHABLE_KEY
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...fjddlffnlbrh...
# Decodifica para: "ref":"fjddlffnlbrhgogkyplq" (PROJETO ATUAL)

# Vite injetou token do SISTEMA (não do .env):
$ curl http://localhost:8080/src/integrations/supabase/client.ts
import.meta.env = {..., "VITE_SUPABASE_PUBLISHABLE_KEY": "eyJ...fjddlfnlbrhh..."}
                                                         ^^^^^^^^^^^^^^^^^^^
                                                         TOKEN ANTIGO DO SISTEMA!
```

### Root Cause (5 Whys)

1. **Por quê erro 401?** → Supabase recebeu API key inválida
2. **Por quê API key inválida?** → Token apontava para projeto antigo (ref: fjddlfnlbrhh...)
3. **Por quê token antigo?** → Vite injetou variável do sistema, não do .env
4. **Por quê não leu do .env?** → System env vars têm prioridade no Vite
5. **Por quê vars antigas no sistema?** → Projeto Supabase foi recriado (nov/2024), mas variáveis do sistema não foram limpas

### Causa Raiz Sistêmica

**Problem statement**: Projeto Supabase foi migrado/recriado, mas variáveis de ambiente do **sistema operacional** não foram atualizadas, causando **token mismatch recorrente**.

**Histórico**: Este erro já ocorreu OUTRAS VEZES (confirmado pelo usuário), indicando problema sistêmico não resolvido.

---

## Decisão

### 1. Comando de Inicialização Limpo (Imediato)

**Sempre iniciar Vite com ambiente limpo**:
```bash
# ❌ EVITAR (lê system env vars)
npm run dev

# ✅ USAR (ignora system env vars, lê apenas .env)
env -i PATH=$PATH HOME=$HOME npm run dev
```

**Justificativa**: Garante que Vite lê APENAS do .env, ignorando poluição do sistema.

### 2. Script de Validação Pré-Dev (package.json)

Criar script que valida env vars ANTES de iniciar Vite:

```json
{
  "scripts": {
    "dev": "vite",
    "dev:clean": "node scripts/validate-env.js && env -i PATH=$PATH HOME=$HOME npm run dev"
  }
}
```

### 3. Script de Validação (scripts/validate-env.js)

```javascript
// Valida que system env vars não conflitam com .env
const dotenv = require('dotenv');
const fs = require('fs');

const envFile = dotenv.parse(fs.readFileSync('.env'));
const conflicts = [];

for (const key in envFile) {
  if (key.startsWith('VITE_') && process.env[key]) {
    if (process.env[key] !== envFile[key]) {
      conflicts.push({
        key,
        system: process.env[key].substring(0, 30) + '...',
        envFile: envFile[key].substring(0, 30) + '...'
      });
    }
  }
}

if (conflicts.length > 0) {
  console.error('❌ ERRO: System env vars conflitam com .env!');
  console.error('\nConflitos detectados:');
  conflicts.forEach(c => {
    console.error(`  ${c.key}:`);
    console.error(`    Sistema: ${c.system}`);
    console.error(`    .env:    ${c.envFile}`);
  });
  console.error('\n🔧 Fix: Use "npm run dev:clean" ou remova vars do sistema');
  process.exit(1);
}

console.log('✅ Env vars validadas - nenhum conflito detectado');
```

### 4. Documentação TROUBLESHOOTING.md

Adicionar seção dedicada:

```markdown
## Erro 401 "Invalid API key" / "Invalid JWT"

### Sintoma
- Signup/login retornam 401
- Teste direto na API funciona (Node.js/curl)
- Frontend (browser) falha consistentemente

### Causa Comum
**System environment variables** sobrescrevendo .env

### Diagnóstico
```bash
# 1. Verificar se sistema tem variáveis VITE_*
env | grep VITE_SUPABASE

# 2. Comparar com .env
cat .env | grep VITE_SUPABASE_PUBLISHABLE_KEY

# 3. Se diferentes → System vars estão sobrescrevendo!
```

### Fix
```bash
# Opção 1: Usar script limpo
npm run dev:clean

# Opção 2: Remover vars do sistema (permanente)
unset VITE_SUPABASE_URL
unset VITE_SUPABASE_PUBLISHABLE_KEY
# etc...
```
```

---

## Consequências

### Positivas ✅

1. **Previne token mismatch** recorrente
2. **Detecção precoce** de conflitos env vars
3. **Comando explícito** (`dev:clean`) documenta intenção
4. **Zero modificação** no código-fonte (apenas scripts)

### Negativas ⚠️

1. **Extra step** developers devem usar `dev:clean` em vez de `dev`
2. **Overhead** ~100ms validação pré-dev (aceitável)
3. **Educação** time deve entender prioridade env vars

### Riscos Mitigados 🛡️

1. **Reincidência**: Script valida ANTES de iniciar (bloqueia se conflito)
2. **Onboarding**: README.md atualizado com comando correto
3. **CI/CD**: Ambientes controlados não têm vars do sistema

---

## Implementação

### Checklist

- [x] Documentar root cause em attempts.log
- [x] Criar ADR-025
- [ ] Criar scripts/validate-env.js
- [ ] Adicionar script `dev:clean` em package.json
- [ ] Atualizar TROUBLESHOOTING.md
- [ ] Atualizar README.md (seção "Development")
- [ ] Testar comando `npm run dev:clean`
- [ ] Commit com mensagem descritiva

### Comandos de Implementação

```bash
# 1. Criar script de validação
cat > scripts/validate-env.js << 'EOF'
[código do script acima]
EOF

# 2. Atualizar package.json
npm pkg set scripts.dev:clean="node scripts/validate-env.js && env -i PATH=\$PATH HOME=\$HOME npm run dev"

# 3. Testar
npm run dev:clean

# 4. Commit
git add docs/adr/ADR-025* scripts/validate-env.js package.json
git commit -m "feat: adicionar validação env vars pré-dev (ADR-025)"
```

---

## 🔄 Cross-Feature Validation

### feat-super-admin-dashboard (2025-11-20)
**Status**: ⚠️ Potencialmente Afetado (não confirmado)

Durante Workflow 6a (Screenshot Validation), verificou-se que:
- Login funcionou corretamente após apply migrations
- **Sistema env vars NÃO bloquearam** esta feature
- Validação `validate-env-conflicts.sh` não executada (oportunidade perdida)

**Learning**: Mesmo quando env vars OK, SEMPRE validar PRÉ-WORKFLOW 5a:
```bash
./scripts/validate-env-conflicts.sh
# SE exit 0: Prosseguir
# SE exit 1: Limpar conflicts ANTES de continuar
```

**ROI Claim "90x"**:
- ❌ Script `validate-env.js` (linha 103-136) NÃO ENCONTRADO no codebase
- ⚠️ Implementação PENDENTE (recomendado Workflow 10)
- ✅ Padrão documentado (3h debugging vs 2min detection = 90x potencial)

---

## Referências

- **Workflow**: add-feature-6a-user-validation.md
- **Context**: .context/feat-modal-primeiro-acesso-web_attempts.log (Iteração 4)
- **Vite Docs**: https://vite.dev/guide/env-and-mode.html#env-files
- **Debugging Case**: TBD (criar em docs/debugging-cases/)
- **Meta-Learning**: TBD (adicionar em WORKFLOW_META_LEARNING.md)

---

## Notas

**Este problema é SISTÊMICO** - ocorreu múltiplas vezes no passado. A solução proposta DEVE ser aplicada SEMPRE, não apenas em casos específicos.

**Regra**: Antes de debugar erro 401, SEMPRE verificar `env | grep VITE_` PRIMEIRO.
