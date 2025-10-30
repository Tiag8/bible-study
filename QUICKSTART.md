# Quick Start - Sistema de Templates

> Guia rápido para começar a usar o sistema de templates auto-evolutivo

---

## 🚀 Criar Novo Projeto

### Opção 1: Script Automatizado (Recomendado)

```bash
cd /Users/tiago/Projects/project-template
./scripts/init-new-project.sh
```

**O que o script faz**:
1. ✅ Solicita nome, descrição e stack do projeto
2. ✅ Copia toda estrutura do template
3. ✅ Atualiza README.md e CLAUDE.md com info do projeto
4. ✅ Inicializa Git com commit inicial
5. ✅ Oferece abrir no editor automaticamente

### Opção 2: Manual

```bash
# Copiar template
cp -r /Users/tiago/Projects/project-template /Users/tiago/Projects/meu-projeto
cd /Users/tiago/Projects/meu-projeto

# Limpar
rm -rf .git node_modules

# Inicializar Git
git init
git add .
git commit -m "init: projeto a partir do template"

# Customizar
# - Editar README.md
# - Editar .claude/CLAUDE.md
# - Configurar .env
```

---

## 📂 O que você terá

```
meu-projeto/
├── .claude/
│   ├── CLAUDE.md              # Contexto para Claude Code
│   └── commands/              # Comandos customizados
├── .windsurf/
│   └── workflows/
│       ├── add-feature.md     # 14 fases estruturadas ⭐
│       └── ultra-think.md     # Análise profunda
├── docs/
│   ├── adr/                   # Architecture Decision Records
│   │   ├── TEMPLATE.md
│   │   └── README.md
│   ├── features/              # Mapas de features
│   │   ├── TEMPLATE.md
│   │   └── README.md
│   ├── architecture/          # Docs de arquitetura
│   ├── regras-de-negocio/     # Lógica de negócio
│   ├── ops/                   # Deploy e operações
│   ├── TEMPLATE_SYSTEM.md     # Sistema de templates
│   └── TEMPLATE_EVOLUTION.md  # Histórico de evolução
├── scripts/
│   ├── init-new-project.sh      # Criar novo projeto
│   ├── sync-to-template.sh      # Sincronizar melhorias
│   ├── run-tests.sh             # Executar testes
│   ├── run-security-tests.sh    # Security scan
│   ├── code-review.sh           # Code review automatizado
│   ├── commit-and-push.sh       # Commit com validações
│   ├── create-feature-branch.sh # Criar branch
│   └── create-backup.sh         # Backup
├── AGENTS.md                  # Instruções para AI agents
└── README.md                  # Documentação principal
```

---

## 🎯 Workflow de Feature (14 Fases)

```bash
# Siga: .windsurf/workflows/add-feature.md
```

### Resumo das Fases:

1. **Entendimento e Contexto** - Entender requisito
2. **Análise de Docs** ⭐ - Verificar docs/ existentes ANTES de planejar
3. **Planejamento Profundo** - Ultra-think para decisões complexas
4. **Plano Detalhado** - Checklist multi-step com TodoWrite
5. **Checkpoint** - Backup antes de mudanças
6. **Sincronizar Main** - Evitar conflitos
7. **Criar Branch** - Git workflow
8. **Implementação** ⭐ - TDD + pequenos diffs (8+ commits)
9. **Validação Automática** - Testes passam
10. **Code Review** ⭐ - OBRIGATÓRIO
11. **Security Tests** ⭐ - OBRIGATÓRIO
12. **Documentação** - ADR ou Feature Map
13. **Commit e Push** - Com validações
14. **Meta-Aprendizado** ⭐⭐⭐ - CRÍTICO!

---

## 🧠 Fase 14: Meta-Aprendizado (A MAGIA!)

**Por que existe?**

Cada projeto **ensina** algo. Esta fase captura esse aprendizado e **evolui o template**!

### Como funciona:

```bash
# 1. Ao final da feature, responda:
# - O workflow funcionou bem?
# - Alguma fase foi confusa?
# - Descobriu um script útil?
# - Encontrou novo padrão valioso?

# 2. Implemente melhorias no projeto atual

# 3. Sincronize melhorias para template
./scripts/sync-to-template.sh

# 4. Próximos projetos herdam automaticamente!
```

### Ciclo de Evolução:

```
Projeto A → Feature → Meta-Learn → Melhoria X → Sync → Template v1.1
                                                            ↓
Projeto B (novo) ─────────────────────────────────────> Herda v1.1 com Melhoria X!
```

**Resultado**: Cada projeto fica **melhor** que o anterior!

---

## 🛠️ Scripts Principais

### Desenvolvimento

```bash
# Criar branch de feature
./scripts/create-feature-branch.sh "nome-da-feature"

# Code review automatizado
./scripts/code-review.sh

# Executar testes completos
./scripts/run-tests.sh

# Security scan (OBRIGATÓRIO)
./scripts/run-security-tests.sh

# Commit com validações
./scripts/commit-and-push.sh "feat: descrição"
```

### Melhoria Contínua ⭐

```bash
# Sincronizar melhorias para template
./scripts/sync-to-template.sh

# Criar novo projeto do template
cd /Users/tiago/Projects/project-template
./scripts/init-new-project.sh
```

---

## 📝 Templates de Documentação

### ADR (Architecture Decision Record)

```bash
# Criar novo ADR
cp docs/adr/TEMPLATE.md docs/adr/001-titulo-da-decisao.md
# Preencher template

# Quando usar:
# - Escolha entre alternativas técnicas
# - Trade-off importante
# - Decisão que afeta sistema todo
```

### Feature Map

```bash
# Criar novo Feature Map
cp docs/features/TEMPLATE.md docs/features/nome-da-feature.md
# Preencher template

# Quando usar:
# - Feature nova implementada
# - Feature significativamente modificada
```

---

## 🔒 Segurança (Obrigatória!)

### Validações Automáticas:

```bash
# Antes de CADA commit
./scripts/run-security-tests.sh

# O que verifica:
# ✅ Secrets hardcoded no código
# ✅ .env sendo commitado
# ✅ Vulnerabilidades em dependências
# ✅ SQL Injection patterns
# ✅ XSS patterns
# ✅ Arquivos grandes (>1MB)
```

**IMPORTANTE**: Nunca pular security scan!

---

## 🧪 Testes (Obrigatórios!)

### Estratégia:

- **TDD**: Test-Driven Development quando apropriado
- **Small diffs**: 8+ commits por feature
- **RED → GREEN → REFACTOR**: Ciclo TDD

### Executar:

```bash
# Todos os testes
./scripts/run-tests.sh

# Validações incluem:
# ✅ Linting
# ✅ Type checking
# ✅ Unit tests
# ✅ Integration tests (se existir)
# ✅ Secrets verification
```

---

## 📚 Leituras Importantes

### MUST READ:

1. **`docs/TEMPLATE_SYSTEM.md`** ⭐⭐⭐
   - Entenda o sistema de melhoria contínua
   - Como o ciclo funciona
   - Filosofia do template

2. **`.windsurf/workflows/add-feature.md`** ⭐⭐
   - Workflow completo de 14 fases
   - Fase 14 (Meta-Aprendizado) é CRÍTICA!

3. **`AGENTS.md`** ⭐
   - Instruções para AI agents
   - Convenções de código
   - Security guidelines

### Documentação de Referência:

- `docs/adr/TEMPLATE.md` - Como escrever ADRs
- `docs/features/TEMPLATE.md` - Como documentar features
- `docs/TEMPLATE_EVOLUTION.md` - Histórico de evolução

---

## 💡 Dicas de Ouro

### 1. SEMPRE Verificar docs/ Antes de Planejar

```bash
# Fase 2 do workflow
# Evita retrabalho e aproveita código existente
```

### 2. Ultra-Think para Decisões Complexas

```bash
# Fase 3 do workflow
# Use .windsurf/workflows/ultra-think.md
# Análise profunda antes de decisões importantes
```

### 3. Commits Pequenos (8+ por feature)

```bash
# ❌ NÃO fazer:
git commit -m "feat: feature completa"  # 1 commit gigante

# ✅ FAZER:
git commit -m "test: adicionar testes para X - RED"
git commit -m "feat: implementar X básico - GREEN"
git commit -m "test: adicionar testes para Y - RED"
git commit -m "feat: implementar Y - GREEN"
git commit -m "refactor: extrair função Z"
git commit -m "docs: documentar X e Y"
git commit -m "test: adicionar edge cases"
git commit -m "fix: corrigir edge case A"
# 8+ commits rastreáveis!
```

### 4. Nunca Pular Steps Sob Pressão

```bash
# Code Review e Security Scan são OBRIGATÓRIOS
# Mesmo com "pressa" - economiza tempo a longo prazo
```

### 5. Meta-Aprendizado é Poder

```bash
# Fase 14 parece "extra", mas é o que faz o sistema evoluir
# 5 minutos nesta fase = horas economizadas em projetos futuros
```

---

## 🎯 Checklist do Primeiro Uso

Ao criar seu primeiro projeto com o template:

### Setup Inicial
- [ ] Executou `./scripts/init-new-project.sh` ou copiou manualmente
- [ ] Customizou `README.md` com info do projeto
- [ ] Atualizou `.claude/CLAUDE.md` com contexto específico
- [ ] Criou `.env` e configurou variáveis
- [ ] Leu `docs/TEMPLATE_SYSTEM.md`
- [ ] Leu `.windsurf/workflows/add-feature.md`
- [ ] Leu `AGENTS.md`

### Primeira Feature
- [ ] Seguiu workflow de 14 fases
- [ ] Verificou docs/ antes de planejar (Fase 2)
- [ ] Fez 8+ commits pequenos
- [ ] Executou code review
- [ ] Executou security scan
- [ ] Documentou (ADR ou Feature Map)
- [ ] Executou Fase 14 (Meta-Aprendizado)

### Melhoria Contínua
- [ ] Identificou pelo menos 1 melhoria possível
- [ ] Testou melhoria no projeto atual
- [ ] Sincronizou com template (`./scripts/sync-to-template.sh`)
- [ ] Documentou em `docs/TEMPLATE_EVOLUTION.md`

---

## 🆘 Problemas Comuns

### "Script não executa"
```bash
# Tornar executável
chmod +x scripts/*.sh
```

### "Git status mostra muitos arquivos"
```bash
# Já tem .gitignore configurado
# Verifique se node_modules está no .gitignore
```

### "Security scan falhou"
```bash
# NÃO ignore! Revise o que foi detectado
# Remova secrets antes de commitar
# Use .env para credenciais
```

### "Não sei quando criar ADR vs Feature Map"
```bash
# ADR: Decisão arquitetural (escolha de tecnologia, padrão, etc)
# Feature Map: Feature implementada (componentes, hooks, database)
```

---

## 🎉 Próximos Passos

1. **Criar seu primeiro projeto**: `./scripts/init-new-project.sh`
2. **Ler documentação**: `docs/TEMPLATE_SYSTEM.md`
3. **Implementar primeira feature**: Seguir `.windsurf/workflows/add-feature.md`
4. **Executar Fase 14**: Meta-aprendizado
5. **Sincronizar melhoria**: `./scripts/sync-to-template.sh`
6. **Ver template evoluir**: Cada projeto melhora o próximo!

---

## 🔗 Links Úteis

- **Template base**: `/Users/tiago/Projects/project-template/`
- **Documentação completa**: `docs/`
- **Workflows**: `.windsurf/workflows/`
- **Scripts**: `scripts/`

---

**Versão**: 1.0
**Última atualização**: 2025-10-27
**Criado por**: Tiago com Claude Code

---

> "Cada projeto melhora o template. O template evolui com você."

**🚀 Bom desenvolvimento!**
