# AIOS Installation Guide - Bible Study

**Versão**: 1.0.0
**Data**: 2026-01-26
**AIOS Version**: 4.31.0

---

## 📋 O que é AIOS?

**AIOS (Artificial Intelligence Operating System)** é um framework completo de automação que integra:

- ✅ **12 agentes especializados** (Architect, Dev, QA, UX, PM, etc.)
- ✅ **80+ tarefas parametrizáveis** (database, components, squad management)
- ✅ **44 workflows estruturados** (14 fases de desenvolvimento)
- ✅ **Quality gates automáticos** (3 camadas de validação)
- ✅ **CLI tools** para automação
- ✅ **Meta-agent generation** (cria agentes sob demanda)
- ✅ **Component scaffolding** (geração automática de código)

---

## 🎯 Por que instalar AIOS no Bible Study?

### Antes (sem AIOS):
- ❌ Workflows manuais
- ❌ Sem orquestração de agentes
- ❌ Validações manuais
- ❌ Sem CLI automation

### Depois (com AIOS):
- ✅ Workflows automatizados
- ✅ Orquestração de 3-5 agentes paralelos
- ✅ Quality gates automáticos
- ✅ CLI tools (`aios-core` command)
- ✅ Meta-agents e scaffolding

---

## 🚀 Instalação

### Pré-requisitos

- ✅ Node.js >= 18.x
- ✅ npm instalado
- ✅ Life Tracker acessível em `/Users/tiago/Projects/life_tracker`
- ✅ Git configurado

### Passo 1: Executar Script de Instalação

```bash
cd /Users/tiago/Projects/bible-study
./scripts/install-aios.sh
```

O script fará automaticamente:

1. **Validar ambiente** (Node, npm, git)
2. **Copiar .aios-core/** do Life Tracker
3. **Instalar dependências NPM** (`@aios-fullstack/core@4.31.0`)
4. **Copiar comandos AIOS** (`.claude/commands/AIOS/`)
5. **Copiar workflows essenciais** (README.md, AI tools, tasks)
6. **Criar project-manifest.json** customizado para Bible Study
7. **Validar instalação** (10 checks)

### Passo 2: Validar Instalação

```bash
./scripts/validate-aios-installation.sh
```

**Output esperado**:
```
════════════════════════════════════════════════════════════
  Validando Instalação AIOS - Bible Study
════════════════════════════════════════════════════════════

✓ .aios-core/ instalado
✓ AIOS package.json válido (v4.31.0)
✓ AIOS CLI executável
✓ Core modules instalados (15 módulos)
✓ Development tools instalados (80 tasks)
✓ Comandos AIOS instalados (12 commands)
✓ Agentes instalados (17 agents)
✓ Workflows instalados (40 workflows)
✓ project-manifest.json configurado
✓ @aios-fullstack/core no package.json

════════════════════════════════════════════════════════════
  Resumo da Validação
════════════════════════════════════════════════════════════

Total de verificações: 10
Passou: 10
Avisos: 0
Falhou: 0

Taxa de sucesso: 100%

✅ INSTALAÇÃO VÁLIDA
AIOS está instalado e pronto para uso!
```

### Passo 3: Reiniciar Servidor

```bash
npm run restart
```

---

## 📁 Estrutura Instalada

```
bible-study/
├── .aios-core/                         # Motor AIOS
│   ├── bin/aios-core.js                # CLI executável
│   ├── core/                           # Core modules
│   │   ├── orchestration/              # Workflow orchestrator
│   │   ├── quality-gates/              # Quality gate manager
│   │   ├── health-check/               # Health check engine
│   │   └── ... (15 módulos)
│   ├── development/                    # Dev tools
│   │   ├── tasks/                      # 80+ tarefas
│   │   ├── templates/                  # 17 templates
│   │   └── checklists/                 # Checklists executáveis
│   ├── package.json (v4.31.0)
│   └── user-guide.md
├── .claude/
│   ├── commands/
│   │   └── AIOS/                       # Comandos AIOS
│   │       ├── agents/                 # 12 agentes core
│   │       └── ... (integração CLI)
│   ├── agents/                         # 17 agentes totais
│   └── project-manifest.json           # Config AIOS
└── .windsurf/workflows/
    ├── README.md                       # Documentação workflows
    ├── add-feature-3.5-tasks.md        # Task breakdown
    ├── add-feature-4.5c-ai-tools.md    # AI tools workflow
    └── ... (40 workflows)
```

---

## 🛠️ Componentes Instalados

### 1. Core Modules (15)

| Módulo | Descrição |
|--------|-----------|
| `orchestration/` | Workflow orchestrator, parallel executor |
| `quality-gates/` | 3 camadas de validação |
| `health-check/` | 60+ verificações sistema |
| `config/` | Config loader e caching |
| `elicitation/` | Motor coleta interativa |
| `manifest/` | Validação manifests |
| `registry/` | Service registry |
| `migration/` | Module mapping |

### 2. Agentes (12 AIOS + 17 locais)

**AIOS Core Agents**:
- `aios-master` - Orquestrador universal
- `architect` - Design de sistema
- `dev` - Implementação
- `data-engineer` - Schema, migrations
- `devops` - Deploy, CI/CD
- `qa` - Testes, validação
- `ux-design-expert` - Interface
- `pm` - Planejamento
- `po` - Gestão backlog
- `analyst` - Análise dados
- `sm` - Facilitação
- `squad-creator` - Composição equipes

**Agentes Locais Bible Study**:
- `orchestrator` - Coordenação agents
- `rca-analyzer` - Root cause analysis
- `regression-guard` - Prevenção regressões
- ... (14 agentes especializados)

### 3. Development Tools

- **80+ Tasks**: Database, components, squad management
- **17 Templates**: Services, components, agents, scripts
- **Checklists**: Executáveis automáticos

### 4. Workflows Essenciais

- `README.md` - Documentação central
- `add-feature-3.5-tasks.md` - Task breakdown
- `add-feature-4.5c-ai-tools.md` - AI tools workflow

---

## 🧪 Testando AIOS

### Teste 1: Verificar CLI

```bash
node .aios-core/bin/aios-core.js --help
```

### Teste 2: Listar Agentes

```bash
ls .claude/agents/
```

**Output esperado**: 17 agentes markdown

### Teste 3: Listar Comandos AIOS

```bash
ls .claude/commands/AIOS/
```

### Teste 4: Verificar Workflows

```bash
cat .windsurf/workflows/README.md
```

### Teste 5: Ver Tasks Disponíveis

```bash
ls .aios-core/development/tasks/ | head -20
```

---

## 📚 Documentação

| Documento | Localização |
|-----------|-------------|
| **User Guide** | `.aios-core/user-guide.md` |
| **Workflows Guide** | `.windsurf/workflows/README.md` |
| **Project Manifest** | `.claude/project-manifest.json` |
| **Core Config** | `.aios-core/core-config.yaml` |

---

## 🔧 Configuração

### Project Manifest (`.claude/project-manifest.json`)

```json
{
  "version": "1.0.0",
  "project": {
    "name": "Bible Study (Segundo Cérebro)",
    "slug": "bible-study",
    "type": "web-app"
  },
  "variables": {
    "PROJECT_PREFIX": "bible_",
    "PROJECT_NAME": "Bible Study",
    "SUPABASE_PROJECT_REF": "vcqgalxnapxerqcycieu"
  },
  "stack": {
    "frontend": "React 19 + TypeScript + Next.js 15",
    "database": "Supabase PostgreSQL"
  },
  "sync": {
    "enabled": true,
    "layers": [
      "core",
      "workflows",
      "stack-react-supabase",
      "quality-gates",
      "context-system"
    ]
  },
  "aios": {
    "version": "4.31.0",
    "installed": "2026-01-26",
    "agents_enabled": true,
    "workflows_enabled": true,
    "commands_enabled": true
  }
}
```

---

## 🎯 Próximos Passos

### 1. Explorar User Guide

```bash
cat .aios-core/user-guide.md
```

### 2. Testar Workflow

Escolha um workflow em `.windsurf/workflows/` e siga os passos.

### 3. Usar Agentes

Invoque agentes especializados via Claude Code:
- `/architect` - Design de sistema
- `/dev` - Implementação
- `/qa` - Testes

### 4. Explorar Tasks

```bash
ls .aios-core/development/tasks/
```

Cada task é parametrizável e reutilizável.

---

## 🐛 Troubleshooting

### Erro: "AIOS não encontrado"

**Solução**: Reinstalar
```bash
./scripts/install-aios.sh
```

### Erro: "CLI não executável"

**Solução**: Dar permissões
```bash
chmod +x .aios-core/bin/aios-core.js
```

### Validação falha

**Solução**: Verificar o que falhou
```bash
./scripts/validate-aios-installation.sh
```

Se `Taxa de sucesso < 90%`, reinstalar.

---

## 📝 Changelog

### v1.0.0 (2026-01-26)
- ✅ Instalação inicial AIOS v4.31.0
- ✅ 12 agentes AIOS core
- ✅ 80+ tasks development
- ✅ Workflows essenciais
- ✅ Project manifest customizado
- ✅ Scripts de instalação/validação

---

## 🔗 Referências

- **Life Tracker**: `/Users/tiago/Projects/life_tracker` (fonte AIOS)
- **AIOS Core**: `.aios-core/` (motor instalado)
- **User Guide**: `.aios-core/user-guide.md`

---

**Última atualização**: 2026-01-26
**Versão AIOS**: 4.31.0
**Status**: ✅ Instalado e validado
