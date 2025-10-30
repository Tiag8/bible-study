# Projeto Template Base

> Sistema de templates auto-evolutivo para desenvolvimento com Claude Code e Windsurf

---

## 📋 Sobre

Este é um **template base** que implementa um sistema de **melhoria contínua** onde cada projeto contribui para evoluir o template. Inclui workflows estruturados, scripts de automação, validações de segurança e documentação padronizada.

### 🌟 Diferenciais
- ✅ **Meta-aprendizado**: Sistema que aprende e melhora com cada projeto
- ✅ **10 etapas estruturadas**: Workflow completo do planejamento ao deploy + Template Sync
- ✅ **Security-first**: Validações automáticas de segurança
- ✅ **Documentation-first**: Verificação de docs antes de planejar
- ✅ **TDD integrado**: Test-Driven Development no workflow
- ✅ **Scripts de automação**: 12 scripts para tarefas comuns
- ✅ **Templates de docs**: ADRs, Feature Maps, Arquitetura
- ✅ **Template Sync**: Sincronização automática de melhorias genéricas

---

## 🛠️ Stack Tecnológico

### Frontend
- **Framework**: [React/Vue/Next/etc]
- **Language**: TypeScript
- **Styling**: [TailwindCSS/CSS Modules/etc]
- **Build**: [Vite/Webpack/etc]

### Backend
- **Platform**: [Node.js/Python/Go/etc]
- **Framework**: [Express/FastAPI/etc]
- **Database**: [PostgreSQL/MongoDB/etc]

### DevOps
- **Hosting**: [Vercel/AWS/etc]
- **CI/CD**: [GitHub Actions/etc]
- **Monitoring**: [Sentry/etc]

---

## 🚀 Quick Start

### Criar Novo Projeto a partir do Template

```bash
# Executar script de inicialização
cd /Users/tiago/Projects/project-template
./scripts/init-new-project.sh

# O script irá:
# 1. Pedir nome do projeto
# 2. Pedir descrição e stack
# 3. Copiar toda estrutura do template
# 4. Inicializar Git com commit inicial
# 5. Abrir projeto no editor (opcional)
```

### Ou Manualmente

```bash
# Copiar template
cp -r /Users/tiago/Projects/project-template /Users/tiago/Projects/meu-projeto
cd /Users/tiago/Projects/meu-projeto

# Remover .git do template
rm -rf .git

# Inicializar novo repositório
git init
git add .
git commit -m "init: projeto a partir do template"

# Instalar dependências (se aplicável)
npm install

# Configurar ambiente
cp .env.example .env
# Editar .env com suas credenciais

# Iniciar desenvolvimento
npm run dev
```

### Scripts Disponíveis

```bash
npm run dev              # Servidor de desenvolvimento
npm run build            # Build de produção
npm run test             # Rodar testes
npm run lint             # Linting

# Scripts personalizados
./scripts/run-tests.sh                    # Testes completos
./scripts/code-review.sh                  # Code review automatizado
./scripts/run-security-tests.sh           # Security scan (agora com path opcional)
./scripts/run-security-tests.sh src/hooks # Security scan direcionado
./scripts/commit-and-push.sh "msg"        # Commit com validação
./scripts/fix-eslint-any.sh               # Refatorar TypeScript any
./scripts/meta-learning.sh                # Capturar métricas de feature
```

---

## 📚 Documentação

A documentação completa está organizada em `docs/`:

### Estrutura de Docs
- **`docs/features/`** - Mapas de features implementadas (Template: `TEMPLATE.md`)
- **`docs/adr/`** - Architecture Decision Records (Template: `TEMPLATE.md`)
- **`docs/architecture/`** - Arquitetura do sistema
- **`docs/regras-de-negocio/`** - Lógica de negócio e cálculos
- **`docs/ops/`** - Deploy, operações e troubleshooting
- **`docs/TEMPLATE_SYSTEM.md`** - ⭐ Sistema de templates e melhoria contínua
- **`docs/TEMPLATE_EVOLUTION.md`** - Histórico de evolução do template

### Para Desenvolvedores
- `.claude/CLAUDE.md` - Contexto completo do projeto (para humanos e Claude Code)
- `AGENTS.md` - Instruções para AI coding agents (Windsurf, Claude, etc)

### Workflows Disponíveis
- `.windsurf/workflows/add-feature.md` - ⭐ Workflow completo de 10 etapas (inclui Template Sync)
- `.windsurf/workflows/ultra-think.md` - Análise profunda de decisões

### 🔄 Sistema de Melhoria Contínua

Este template evolui continuamente através do **Template Sync**:
- Projetos que usam este template podem sincronizar melhorias de volta
- Etapa 10 do workflow `/add-feature` detecta e sincroniza melhorias genéricas
- Futuros projetos herdam automaticamente os aprendizados

Veja `docs/TEMPLATE_EVOLUTION.md` para histórico completo de melhorias.

---

## 🔒 Segurança

Este projeto implementa múltiplas camadas de segurança:

- ✅ Scan automático de secrets antes de commit
- ✅ Verificação de vulnerabilidades em dependências
- ✅ Code review obrigatório
- ✅ Validações de SQL Injection, XSS, CSRF

### Antes de Commit
```bash
# OBRIGATÓRIO - Executar antes de cada commit
./scripts/run-security-tests.sh
```

---

## 🧪 Testing

### Estratégia de Testes
- **Preferência**: Testes integrados/E2E sobre unitários
- **Coverage**: Mínimo 70% para lógica crítica
- **TDD**: Para hooks, cálculos, validações

### Executar Testes
```bash
./scripts/run-tests.sh    # Todos os testes
npm run test              # Unit tests
npm run test:e2e          # E2E tests
```

---

## 🔄 Workflow de Desenvolvimento

### Workflow Completo de 10 Etapas ⭐

O workflow está documentado em `.windsurf/workflows/add-feature.md` e inclui:

**Etapas 1-9**: Entendimento → Análise → Planejamento → Implementação → Validação → Documentação → Commit

**Etapa 10 (Template Sync)** ⭐: Sistema de melhoria contínua
- Analisa o que foi aprendido nesta feature
- Identifica melhorias genéricas (workflows, scripts, padrões)
- Sincroniza melhorias para o template base automaticamente
- Próximos projetos herdam automaticamente as melhorias

### Ciclo de Melhoria Contínua

```
Projeto → Desenvolvimento → Template Sync → Melhorias → Template Evoluído
   ↑                                                            ↓
   └────────────────── Próximos projetos herdam ───────────────┘
```

### Scripts de Desenvolvimento

```bash
# 1. Criar branch
./scripts/create-feature-branch.sh "nome-da-feature"

# 2. Desenvolver (TDD + commits pequenos)
git commit -m "test: adicionar testes - RED"
git commit -m "feat: implementar funcionalidade - GREEN"
git commit -m "refactor: otimizar código"

# 3. Code Review
./scripts/code-review.sh

# 4. Testes
./scripts/run-tests.sh

# 5. Security Scan
./scripts/run-security-tests.sh           # Scan completo
./scripts/run-security-tests.sh src/      # Scan direcionado

# 6. Refatorar TypeScript any (se necessário)
./scripts/fix-eslint-any.sh

# 7. Commit e Push
./scripts/commit-and-push.sh "feat: descrição da feature"

# 8. Template Sync (Etapa 10)
./scripts/sync-to-template.sh            # Sincronizar melhorias genéricas para template
# - Detecta automaticamente melhorias (scripts, workflows, docs)
# - Copia para /Users/tiago/Projects/project-template
# - Futuros projetos herdam as melhorias

# 9. Merge (quando 100% testado)
git checkout main
git merge feat/nome-da-feature
git push origin main
```

---

## 🛠️ Scripts de Automação

Este template inclui 12 scripts prontos para uso em `scripts/`:

### Desenvolvimento e Testing
#### `run-tests.sh`
Executa todos os testes (TypeScript, ESLint, build, unit tests).

**Uso**:
```bash
./scripts/run-tests.sh
```

#### `code-review.sh`
Code review automatizado (qualidade, complexidade, documentação).

**Uso**:
```bash
./scripts/code-review.sh
```

### Segurança
#### `run-security-tests.sh` ⭐ Melhorado
Scan de segurança completo ou direcionado. Detecta secrets, vulnerabilidades, SQL Injection, XSS.

**Uso**:
```bash
./scripts/run-security-tests.sh              # Scan completo
./scripts/run-security-tests.sh src/hooks    # Scan apenas src/hooks
./scripts/run-security-tests.sh src/components/Auth  # Path específico
```

**Novidade**: Agora aceita path opcional para scan direcionado (mais rápido em projetos grandes).

### Refatoração e Qualidade
#### `fix-eslint-any.sh` ⭐ Novo
Identifica e sugere refatorações de TypeScript `any` warnings.

**Uso**:
```bash
./scripts/fix-eslint-any.sh

# Output exemplo:
# ❌ 3 warnings encontrados em src/hooks/useStats.ts
# 💡 Sugestões de refatoração:
#    - Linha 42: any → StatsData
#    - Linha 58: any → Player[]
```

**Dicas**:
- Executar após criar ADR (Fase 6C do workflow)
- Implementar refatorações antes de commit
- Verificar `docs/adr/` para decisões de tipos

### Git e Deploy
#### `create-feature-branch.sh`
Cria branch de feature a partir da main atualizada.

**Uso**:
```bash
./scripts/create-feature-branch.sh "nome-da-feature"
# Cria: feat/nome-da-feature
```

#### `commit-and-push.sh`
Commit com validação automática de segurança.

**Uso**:
```bash
./scripts/commit-and-push.sh "feat: descrição da feature"
```

### Meta-Aprendizado
#### `meta-learning.sh` ⭐ Novo
Captura métricas automáticas da feature implementada (commits, arquivos, linhas modificadas).

**Uso**:
```bash
./scripts/meta-learning.sh

# Output:
# 📊 Meta-Aprendizado - Feature: add-profit-cards
#
# Commits: 8
# Arquivos modificados: 12
# Linhas adicionadas: 324
# Linhas removidas: 45
# Tempo total: 3h 42min
#
# Arquivos por tipo:
# - TypeScript: 6 arquivos
# - Markdown: 4 arquivos
# - JSON: 2 arquivos
```

**Quando usar**: Etapa 10 do workflow (Template Sync).

### Template Evolution
#### `sync-to-template.sh` ⭐ Novo
Sincroniza melhorias genéricas do projeto atual para o template base (Etapa 10 do workflow).

**Uso**:
```bash
./scripts/sync-to-template.sh

# Detecta automaticamente:
# ✅ Novos scripts em scripts/
# ✅ Melhorias em workflows (.windsurf/workflows/)
# ✅ Novos templates de docs (docs/TEMPLATE_*.md)
# ✅ Atualizações em .claude/CLAUDE.md
# ✅ Melhorias genéricas (não código específico do projeto)

# Output exemplo:
# 🔄 Template Sync - Detectando melhorias...
#
# Melhorias encontradas:
# ✅ scripts/fix-any-warnings.sh (novo)
# ✅ .windsurf/workflows/add-feature.md (atualizado)
# ✅ docs/TEMPLATE_EVOLUTION.md (atualizado)
#
# Sincronizando para /Users/tiago/Projects/project-template...
# ✅ 3 arquivos copiados com sucesso!
```

**Quando usar**: Etapa 10 do workflow, após implementar feature com aprendizados reutilizáveis.

### Database (se aplicável)
#### `backup-supabase.sh`
Backup completo do banco de dados.

**Uso**:
```bash
./scripts/backup-supabase.sh
```

#### `restore-supabase.sh`
Restaura backup do banco de dados.

**Uso**:
```bash
./scripts/restore-supabase.sh backups/backup-2025-10-28.sql
```

#### `supabase-query.sh`
Executa query SQL direta no Supabase.

**Uso**:
```bash
./scripts/supabase-query.sh "SELECT * FROM users LIMIT 5;"
```

---

## 📦 Estrutura do Projeto

```
projeto/
├── .claude/                   # Configuração Claude Code
├── .windsurf/                 # Workflows Windsurf
├── scripts/                   # Automações
├── docs/                      # Documentação
├── src/                       # Código fonte
├── AGENTS.md                  # Instruções para AI
└── README.md                  # Este arquivo
```

---

## 🤝 Contribuindo

### Git Workflow
- **Commits**: Conventional Commits (feat:, fix:, docs:, test:, refactor:, etc)
- **Branches**: `feat/`, `fix/`, `refactor/`, `docs/`
- **Commits pequenos**: 8+ commits por feature (não 1 gigante)
- **Code review**: OBRIGATÓRIO antes de merge
- **Security scan**: OBRIGATÓRIO - deve passar
- **Testes**: Devem estar verdes

### Contribuir para o Template

Se você descobriu uma melhoria valiosa:

1. **Implemente no projeto atual** e teste
2. **Execute Etapa 10** (Template Sync) do workflow
3. **Sincronize com template**: `./scripts/sync-to-template.sh`
4. **Documente**: Adicione entrada em `docs/TEMPLATE_EVOLUTION.md`

**O que sincronizar**:
- ✅ Novo script útil e generalizado
- ✅ Melhoria significativa em workflow
- ✅ Nova validação de segurança
- ✅ Padrão valioso descoberto
- ✅ Bug corrigido em script
- ❌ Código específico do projeto
- ❌ Configurações hardcoded

---

## 🎯 Filosofia do Template

> "Cada projeto melhora o template. O template evolui com você."

Este sistema implementa **melhoria contínua estruturada**:

1. **Desenvolvimento**: Usa workflows e scripts estruturados
2. **Template Sync**: Analisa o que funcionou bem (Etapa 10)
3. **Captura**: Identifica melhorias em processos
4. **Sincronização**: Copia melhorias para template base
5. **Evolução**: Próximos projetos herdam automaticamente

**Resultado**: Cada projeto fica melhor que o anterior!

Leia mais em: `docs/TEMPLATE_SYSTEM.md`

---

## 📊 Status do Template

| Métrica | Valor |
|---------|-------|
| **Versão** | 2.2 |
| **Workflows** | 2 (add-feature com 10 etapas, ultra-think) |
| **Scripts** | 12 automações |
| **Templates de docs** | 3 (ADR, Feature Map, System) |
| **Etapas no workflow** | 10 (inclui Template Sync) |
| **Última atualização** | 2025-10-28 |

Veja histórico completo em: `docs/TEMPLATE_EVOLUTION.md`

---

## 📄 Licença

MIT License - Use livremente em seus projetos.

---

## 🙏 Créditos

**Criado por**: Tiago
**Versão**: 1.0
**Data**: 2025-10-27

Desenvolvido com:
- Claude Code (Anthropic)
- Windsurf IDE
- Muita ☕ e aprendizado

---

**Última atualização**: 2025-10-28
**Versão**: 1.0
**Mantido por**: Tiago
