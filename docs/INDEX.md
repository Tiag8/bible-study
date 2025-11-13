# 📚 [PROJECT_NAME] - Índice Completo de Documentação

> **Central navegável de documentação técnica, estratégica e operacional do projeto**
>
> <!-- Preencher com descrição breve do projeto (1-2 linhas) -->

---

## 🚀 COMECE AQUI - 3 Documentos Essenciais

Se você é novo no projeto, comece por estes documentos em ordem:

| Documento | Tempo | O que é | Link |
|-----------|-------|--------|------|
| 🎯 **CLAUDE.md** (projeto) | 5 min | Stack, convenções, regras críticas do projeto | [`../.claude/CLAUDE.md`](../.claude/CLAUDE.md) |
| 📋 **PLAN.md** | 10 min | Visão estratégica: roadmap, fases, objetivos | [PLAN.md](PLAN.md) |
| ✅ **TASK.md** | 15 min | Checklist executável: status atual, próximas etapas | [TASK.md](TASK.md) |

**⚠️ REGRA CRÍTICA**: Sempre ler PLAN.md e TASK.md antes de qualquer tarefa! Eles definem a estratégia atual.

---

## 📂 Mapa Hierárquico de Documentação

```
docs/
├── 📍 ARQUIVOS RAIZ (Este INDEX está aqui)
│   ├── README.md ............................. Visão geral estrutura docs/
│   ├── PLAN.md ............................. Estratégia macro e roadmap
│   ├── TASK.md ............................. Checklist executável
│   ├── TROUBLESHOOTING.md .................. Solução problemas comuns
│   ├── [TEMPLATE_SYSTEM.md] ................ <!-- Opcional: Sistema templates -->
│   ├── [GIT_HOOKS.md] ....................... <!-- Opcional: Documentação Git hooks -->
│   └── [+N docs de setup/análise]
│
├── 🏗️ ARQUITETURA & DECISÕES
│   ├── adr/ ............................... Architecture Decision Records
│   │   ├── README.md ....................... Index de decisões
│   │   ├── TEMPLATE.md ..................... Template para criar ADR
│   │   ├── [001-decisao-importante.md] ... <!-- Exemplo: decisão 1 -->
│   │   ├── [002-decisao-2.md] ............. <!-- Exemplo: decisão 2 -->
│   │   └── [+N outras decisões]
│   │
│   └── architecture/ ....................... Arquitetura geral
│       └── README.md ....................... Overview do sistema
│
├── 🎯 FEATURES DOCUMENTADAS
│   ├── features/ ........................... Mapas completos de features
│   │   ├── README.md ....................... Index de features
│   │   ├── TEMPLATE.md ..................... Template feature map
│   │   ├── [feature-1.md] .................. <!-- Exemplo feature 1 -->
│   │   ├── [feature-2.md] .................. <!-- Exemplo feature 2 -->
│   │   └── [+N outras features]
│   │
│   └── padroes/ ............................ Padrões & Convenções
│       ├── README.md ....................... Guia padrões de código
│       ├── [padrao-1.md] ................... <!-- Exemplo padrão 1 -->
│       ├── [padrao-2.md] ................... <!-- Exemplo padrão 2 -->
│       └── [+N outros padrões]
│
├── 🌐 INTEGRAÇÕES & APIs
│   ├── integrations/ ....................... Documentação de integrações
│   │   ├── README.md ....................... Index de integrações
│   │   ├── [integracao-1.md] .............. <!-- Exemplo integração 1 -->
│   │   └── [+N outras integrações]
│   │
│   └── regras-de-negocio/ .................. Lógica de negócio
│       ├── README.md ....................... Guia regras de negócio
│       ├── [regra-1.md] .................... <!-- Exemplo regra 1 -->
│       └── [+N outras regras]
│
├── 🛠️ OPERAÇÕES & DEPLOYMENT
│   ├── ops/ ................................ Operações e deploy
│   │   ├── README.md ....................... Guia operacional
│   │   ├── [deployment.md] ................. <!-- Procedimento deploy -->
│   │   ├── [deploy-history.md] ............. <!-- Histórico de deploys -->
│   │   └── [+N docs operacionais]
│   │
│   ├── migrations/ ......................... Histórico de migrações
│   │   └── [MIGRATION_HISTORY.md] .......... <!-- Registro de migrações -->
│   │
│   └── [+N docs CI/CD, monitoring, health checks]
│
├── 🐛 DEBUGGING & TROUBLESHOOTING
│   ├── debugging/ .......................... Casos de debug documentados
│   │   ├── README.md ....................... Guia de debugging
│   │   ├── [001-caso-debug.md] ............ <!-- Exemplo problema 1 -->
│   │   ├── [002-caso-debug.md] ............ <!-- Exemplo problema 2 -->
│   │   ├── template-problem-statement.md .. Template para novo problema
│   │   └── [+N outros casos]
│   │
│   └── [troubleshooting geral em raiz]
│
├── 📊 ANÁLISES & PESQUISA
│   ├── analyses/ ........................... Análises técnicas detalhadas
│   │   ├── [2025-XX-XX-analise.md] ........ <!-- Exemplos análises -->
│   │   └── [+N outras análises]
│   │
│   ├── pesquisa/ ........................... Pesquisa de mercado & concorrentes
│   │   └── [pesquisa-mercado.md] .......... <!-- Exemplo pesquisa -->
│   │
│   ├── validation-reports/ ................ Relatórios de validação
│   │   ├── INDEX.md ........................ Index de relatórios
│   │   └── [2025-XX-XX-validation.md] .... <!-- Exemplo relatório -->
│   │
│   └── [+N análises e relatórios]
│
├── ⚖️ LEGAL & COMPLIANCE
│   ├── legal/ .............................. Documentação legal
│   │   ├── README.md ....................... Guia compliance
│   │   ├── [privacidade.md] ................ <!-- Exemplo: política privacidade -->
│   │   ├── [termos-servico.md] ............ <!-- Exemplo: termos -->
│   │   └── [+N docs legais]
│   │
│   └── [LGPD, GDPR, consentimento, etc]
│
└── 🧪 QA & TESTES
    ├── qa/ ................................. Testes & QA
    │   ├── [teste-1.md] .................... <!-- Exemplo teste 1 -->
    │   └── [+N guias de teste]
    │
    └── [smoke-test-results.md] ............ <!-- Resultados testes -->
```

**Legenda**:
- Linhas com `<!-- -->` = pastas/arquivos opcionais ou a serem criados
- `[+N]` = mais arquivos do mesmo tipo
- Mantenha a estrutura mesmo que algumas pastas estejam vazias

---

## 🔧 Scripts Principais

Automações e ferramentas de linha de comando disponíveis no diretório `/scripts`:

| Script | Descrição | Uso |
|--------|-----------|-----|
| **[script-1.sh]** | <!-- Descrição do script 1 --> | `./scripts/[script-1.sh]` |
| **[script-2.sh]** | <!-- Descrição do script 2 --> | `./scripts/[script-2.sh]` |
| **[script-3.js]** | <!-- Descrição do script 3 --> | `node scripts/[script-3.js]` |

**Documentação completa**:
- `[scripts/README-script-1.md]` - <!-- Descrição documentação -->
- `[scripts/README-script-2.md]` - <!-- Descrição documentação -->

<!-- Preencher com scripts específicos do projeto -->

---

## 🔄 Workflows do Projeto

Sistema modular de workflows para desenvolvimento. **Total: [X] workflows ativos**.

### Workflows Principais

| Workflow | Descrição | Arquivo |
|----------|-----------|---------|
| **[Workflow 1]** | <!-- Descrição --> | `[.windsurf/workflows/workflow-1.md]` |
| **[Workflow 2]** | <!-- Descrição --> | `[.windsurf/workflows/workflow-2.md]` |
| **[Workflow 3]** | <!-- Descrição --> | `[.windsurf/workflows/workflow-3.md]` |

<!-- Adicionar mais workflows conforme necessário -->

**Documentação**:
- Workflows completos em `.windsurf/workflows/`
- Templates em `.windsurf/workflows/TEMPLATE.md`
- Ver [ADR relevante] para decisões de design

---

## 📖 Documentos Críticos (Top 10)

Estes 10 documentos são a base para trabalhar com o projeto:

### 1️⃣ **PLAN.md** - Estratégia Macro
- <!-- Descrição do conteúdo de PLAN.md -->
- Link: [PLAN.md](PLAN.md)

### 2️⃣ **TASK.md** - Checklist Executável
- <!-- Descrição do conteúdo de TASK.md -->
- Link: [TASK.md](TASK.md)

### 3️⃣ **TROUBLESHOOTING.md** - Solução de Problemas
- <!-- Descrição dos problemas cobertos -->
- Link: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

### 4️⃣ **[ADR 001]** - [Decisão Arquitetural Importante]
- <!-- Descrição da decisão -->
- Link: [adr/001-decisao.md](adr/001-decisao.md)

### 5️⃣ **[ADR 002]** - [Segunda Decisão Importante]
- <!-- Descrição da decisão -->
- Link: [adr/002-decisao.md](adr/002-decisao.md)

### 6️⃣ **features/README.md** - Mapas de Features
- <!-- Descrição das features -->
- Link: [features/README.md](features/README.md)

### 7️⃣ **integrations/[INTEGRACAO].md** - Documentação Integração
- <!-- Descrição da integração -->
- Link: [integrations/[INTEGRACAO].md](integrations/[INTEGRACAO].md)

### 8️⃣ **ops/[DEPLOYMENT].md** - Procedimento Deploy
- <!-- Descrição do deployment -->
- Link: [ops/[DEPLOYMENT].md](ops/[DEPLOYMENT].md)

### 9️⃣ **[ADR 003]** - [Terceira Decisão Importante]
- <!-- Descrição da decisão -->
- Link: [adr/003-decisao.md](adr/003-decisao.md)

### 🔟 **TEMPLATE_SYSTEM.md** - Manutenção Documentação
- Sistema de templates (ADR, features, debugging)
- Padrões de documentação e melhoria contínua
- Link: [TEMPLATE_SYSTEM.md](TEMPLATE_SYSTEM.md)

---

## 👥 Para Novos Desenvolvedores

### Primeira Semana - Onboarding

#### Dia 1: Orientação Geral
1. Ler [`../.claude/CLAUDE.md`](../.claude/CLAUDE.md) (stack, convenções)
2. Ler [PLAN.md](PLAN.md) (estratégia atual)
3. Ler [TASK.md](TASK.md) (o que fazer agora)
4. Clone projeto e rodar setup inicial

#### Dia 2: Arquitetura Sistema
1. Ler [architecture/README.md](architecture/README.md)
2. Ler [features/README.md](features/README.md) (visão geral features)
3. Explorar banco de dados / ambiente
4. Rodar testes automatizados

#### Dia 3: Feature Específica
1. Escolher uma feature de interesse
2. Ler feature map completa
3. Examinar código fonte relevante
4. Fazer uma pequena alteração e testar

#### Dia 4-5: Integração & Deployment
1. Ler [integrations/README.md](integrations/README.md)
2. Ler [ops/README.md](ops/README.md)
3. Familiarizar-se com [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
4. Fazer um pequeno PR com documentação

### Recurso de Referência Rápida

| Precisa de... | Vá para... |
|---|---|
| **Stack tecnológico** | [`../.claude/CLAUDE.md`](../.claude/CLAUDE.md) seção "Stack Core" |
| **Roadmap do projeto** | [PLAN.md](PLAN.md) |
| **Status do que fazer** | [TASK.md](TASK.md) |
| **Entender uma feature** | [features/README.md](features/README.md) |
| **API / Integração** | [integrations/README.md](integrations/README.md) |
| **Banco de dados** | [regras-de-negocio/README.md](regras-de-negocio/README.md) |
| **Problema com deploy** | [TROUBLESHOOTING.md](TROUBLESHOOTING.md) |
| **Problema com código** | [debugging/README.md](debugging/README.md) |
| **Padrões de código** | [padroes/README.md](padroes/README.md) |
| **Decisão arquitetural** | [adr/README.md](adr/README.md) |
| **Histórico de mudanças** | [migrations/MIGRATION_HISTORY.md](migrations/MIGRATION_HISTORY.md) |
| **Scripts de automação** | Ver seção "Scripts Principais" acima |

---

## 🎯 Guias por Tipo de Tarefa

### 1. Implementar Nova Feature

**Checklist**:
- [ ] Ler [PLAN.md](PLAN.md) para contexto estratégico
- [ ] Ler [TASK.md](TASK.md) para alinhar com etapa atual
- [ ] Criar ADR se decisão arquitetural (usar [adr/TEMPLATE.md](adr/TEMPLATE.md))
- [ ] Criar feature map (usar [features/TEMPLATE.md](features/TEMPLATE.md))
- [ ] Implementar seguindo padrões em [padroes/](padroes/)
- [ ] Testar e documentar
- [ ] Atualizar [TASK.md](TASK.md) com status

**Documentos chave**: [PLAN.md](PLAN.md), [TASK.md](TASK.md), [adr/README.md](adr/README.md), [features/README.md](features/README.md)

### 2. Debugar Problema em Produção

**Checklist**:
- [ ] Consultar [TROUBLESHOOTING.md](TROUBLESHOOTING.md) para problema similar
- [ ] Se não encontrado, ler [debugging/README.md](debugging/README.md)
- [ ] Criar novo caso em [debugging/](debugging/) (usar template)
- [ ] Documentar descoberta para próximas vezes

**Documentos chave**: [TROUBLESHOOTING.md](TROUBLESHOOTING.md), [debugging/README.md](debugging/README.md)

### 3. Fazer Deploy em Produção

**Checklist**:
- [ ] Ler [ops/README.md](ops/README.md) passo-a-passo
- [ ] Verificar credentials e acesso
- [ ] Rodar testes automatizados
- [ ] Executar procedimento deploy
- [ ] Validar health checks
- [ ] Ter rollback pronto

**Documentos chave**: [ops/README.md](ops/README.md), [ops/deploy-history.md](ops/deploy-history.md)

### 4. Integrar Novo Serviço

**Checklist**:
- [ ] Pesquisar alternativas e fazer benchmark
- [ ] Criar ADR com decisão (usar [adr/TEMPLATE.md](adr/TEMPLATE.md))
- [ ] Documentar integração em [integrations/](integrations/)
- [ ] Seguir padrões em [padroes/](padroes/)
- [ ] Testar conformidade e segurança
- [ ] Atualizar [TASK.md](TASK.md)

**Documentos chave**: [adr/README.md](adr/README.md), [integrations/README.md](integrations/README.md)

### 5. Melhorar Performance

**Checklist**:
- [ ] Ler [TROUBLESHOOTING.md](TROUBLESHOOTING.md) seção Performance
- [ ] Verificar feature maps para targets
- [ ] Usar profiler (DevTools, Lighthouse, etc)
- [ ] Documentar otimização em [analyses/](analyses/)
- [ ] Atualizar feature maps com novos números

**Documentos chave**: [features/README.md](features/README.md), [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

## 🔍 Buscar & Navegar

### Procurando Documentação Sobre...

**[Tema 1]**:
- ADR: `[adr/001-tema.md]`
- Integração: `[integrations/TEMA.md]`
- Feature: `[features/tema.md]`

**[Tema 2]**:
- Feature Map: `[features/tema.md]`
- Padrões: `[padroes/README.md]`

**[Tema 3]**:
- Operações: `[ops/README.md]`
- Troubleshooting: `[TROUBLESHOOTING.md]`

<!-- Preencher com temas específicos do projeto -->

---

## 📊 Estatísticas de Documentação

| Métrica | Valor |
|---------|-------|
| **Total de arquivos .md** | [X]+ |
| **Pastas de conteúdo** | [X] |
| **ADRs (decisões)** | [X] |
| **Features documentadas** | [X] |
| **Padrões** | [X] |
| **Integrações** | [X]+ |
| **Casos de debug** | [X]+ |
| **Scripts automatizados** | [X] |

<!-- Atualizar com números reais do projeto -->

---

## 🔄 Manutenção de Documentação

### Quando Atualizar Documentos

- **PLAN.md**: Quando estratégia macro muda (trimestral ou menos)
- **TASK.md**: Diariamente durante execução de etapa (status, próximos passos)
- **Feature maps**: Quando feature muda arquitetura/comportamento
- **ADRs**: Quando decisão é substituída (copiar, criar nova com status "Substituído")
- **TROUBLESHOOTING.md**: Quando novo problema é resolvido ou padrão identificado

### Como Manter Docs Vivas

1. **Templates**: Sempre usar templates em `docs/TEMPLATE_SYSTEM.md`
2. **Versionamento**: Incluir "Última atualização" e versão em cada doc
3. **Links**: Manter links internos atualizados
4. **Revisão mensal**: ~1h/mês revisando docs relevantes

---

## 🚀 Workflow Típico

```
1. Tarefa designada
   ↓
2. Ler PLAN.md + TASK.md (entender contexto)
   ↓
3. Consultar docs relevantes (features, ADRs, padrões)
   ↓
4. Implementar (seguindo padrões documentados)
   ↓
5. Documentar (criar/atualizar feature maps, ADRs, etc)
   ↓
6. Atualizar TASK.md com novo status
   ↓
7. Commit com mensagem descritiva
   ↓
8. PR com link para documentação relevante
```

---

## 📞 Suporte & Contato

- **Project Owner**: [OWNER_NAME]
- **Documentation Owner**: [DOC_OWNER_NAME]
- **Issues com docs**: Criar issue em GitHub com label `docs`
- **Perguntas estratégicas**: Consultar [PLAN.md](PLAN.md) e [TASK.md](TASK.md) primeiro

<!-- Preencher com contatos específicos -->

---

## 📝 Versionamento deste INDEX

| Data | Versão | Mudanças |
|------|--------|----------|
| [DATE] | 1.0 | Criado INDEX.md template com navegação estruturada, 3 docs essenciais, top 10 críticos, guias por tipo de tarefa |

<!-- Atualizar com histórico real de mudanças -->

---

**Última atualização**: [AAAA-MM-DD]
**Versão**: 1.0 (Template)
**Autoria**: Claude Code (Documentação Estruturada)
**Status**: Template - Adapte para seu projeto

🎯 **Dica**: Use Cmd+F (ou Ctrl+F) para buscar palavras-chave neste INDEX quando não sabe por onde começar!

---

## 📋 Instruções para Preenchimento

Este é um **template INDEX.md**. Para adaptá-lo ao seu projeto:

1. **Substituir placeholders**:
   - `[PROJECT_NAME]` → nome do seu projeto
   - `[X]` → números reais
   - `[DATE]` → data atual
   - `[OWNER_NAME]` → seu nome

2. **Ajustar estrutura de pastas**:
   - Manter seções que sua documentação possui
   - Remover seções opcionais não utilizadas
   - Adicionar novas seções conforme necessário

3. **Preencher conteúdo específico**:
   - Descrições em `<!-- Preencher... -->`
   - Exemplos de features, integrações, workflows
   - Links reais para seus documentos

4. **Manter a hierarquia**:
   - 3 docs essenciais (CLAUDE.md, PLAN.md, TASK.md)
   - Top 10 críticos (ajustar para seu projeto)
   - Guias por tipo de tarefa (customizar conforme necessário)

5. **Revisar regularmente**:
   - Atualizar PLAN.md/TASK.md frequentemente
   - Manter referências cruzadas consistentes
   - Adicionar novos documentos conforme criados
