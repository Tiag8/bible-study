# Sistema de Templates e Melhoria Contínua

> **Filosofia**: Cada projeto melhora o template base. O template evolui com você.

---

## 🎯 Conceito

Este sistema implementa um **ciclo de melhoria contínua** onde:

1. Você desenvolve features usando workflows estruturados
2. Ao final, analisa o que aprendeu (meta-aprendizado)
3. Identifica melhorias em workflows, scripts ou padrões
4. Sincroniza melhorias para o template base
5. Próximos projetos herdam automaticamente as melhorias

**Resultado**: Cada projeto fica melhor que o anterior!

---

## 🏗️ Arquitetura do Sistema

### Template Base
**Localização**: `/Users/tiago/Projects/project-template/`

**Contém**:
- ✅ Workflows estruturados (`.windsurf/workflows/`)
- ✅ Scripts de automação (`scripts/`)
- ✅ Configuração Claude Code (`.claude/`)
- ✅ Templates de documentação (`docs/`)
- ✅ AGENTS.md para AI coding agents
- ✅ Configurações base (`.gitignore`, README)

### Projetos Individuais
**Localização**: `/Users/tiago/Projects/<nome-do-projeto>/`

**Herdam do template**:
- Todos os workflows
- Todos os scripts
- Toda estrutura de docs/
- Configurações base

**Customizam**:
- CLAUDE.md com contexto específico
- Documentação específica (ADRs, feature maps)
- Código fonte

---

## 🔄 Ciclo de Melhoria Contínua

```
┌──────────────────────────────────────────────────────┐
│ 1. Novo Projeto                                      │
│    - Copia estrutura do template                     │
│    - Herda workflows, scripts, configs               │
└───────────────┬──────────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────────────┐
│ 2. Desenvolvimento                                   │
│    - Usa workflows estruturados                      │
│    - Executa scripts de automação                    │
│    - Segue padrões documentados                      │
└───────────────┬──────────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────────────┐
│ 3. Meta-Aprendizado (Fase 14)                        │
│    - Analisa o que funcionou bem                     │
│    - Identifica melhorias possíveis                  │
│    - Documenta novos padrões                         │
└───────────────┬──────────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────────────┐
│ 4. Atualização Local                                 │
│    - Melhora workflows no projeto atual              │
│    - Cria novos scripts úteis                        │
│    - Refina padrões                                  │
└───────────────┬──────────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────────────┐
│ 5. Sincronização                                     │
│    - ./scripts/sync-to-template.sh                   │
│    - Copia melhorias para template base              │
└───────────────┬──────────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────────────┐
│ 6. Template Evoluído                                 │
│    - Template base está melhor                       │
│    - Próximos projetos herdam melhorias              │
│    - Conhecimento preservado                         │
└──────────────────────────────────────────────────────┘
```

---

## 📚 Estrutura de Documentação

### ADRs (Architecture Decision Records)
**Pasta**: `docs/adr/`
**Template**: `docs/adr/TEMPLATE.md`

**Quando criar**:
- Decisão arquitetural importante
- Escolha entre múltiplas alternativas
- Trade-off significativo
- Mudança que afeta sistema todo

**Formato**:
```
ADR-XXX-titulo-da-decisao.md
```

**Conteúdo**:
- Contexto e problema
- Opções consideradas (com prós/contras)
- Decisão tomada
- Consequências
- Alternativas rejeitadas

---

### Feature Maps
**Pasta**: `docs/features/`
**Template**: `docs/features/TEMPLATE.md`

**Quando criar**:
- Nova feature implementada
- Feature significativamente modificada

**Formato**:
```
nome-da-feature.md
```

**Conteúdo**:
- Identidade (nome, rota, status)
- UI - Componentes
- Hooks - Lógica de dados
- Database - Tabelas e schemas
- Performance - Otimizações
- Segurança - RLS e validações

---

### Regras de Negócio
**Pasta**: `docs/regras-de-negocio/`

**Quando criar**:
- Lógica de negócio complexa
- Fórmulas e cálculos
- Validações de negócio

**Conteúdo**:
- Descrição da regra
- Fórmulas matemáticas (se aplicável)
- Casos de uso
- Exemplos

---

### Arquitetura
**Pasta**: `docs/architecture/`

**Quando criar**:
- Overview da arquitetura
- Diagramas de sistema
- Decisões de alto nível

---

## 🛠️ Scripts do Sistema

### `sync-to-template.sh`
**Propósito**: Sincronizar melhorias do projeto para o template base

**Uso**:
```bash
./scripts/sync-to-template.sh
```

**O que faz**:
1. Compara arquivos do projeto com template
2. Identifica mudanças em:
   - `.windsurf/workflows/`
   - `.claude/commands/`
   - `.claude/CLAUDE.md`
   - `scripts/`
   - `AGENTS.md`
3. Permite selecionar quais mudanças sincronizar
4. Copia arquivos selecionados para template
5. Opcionalmente commita mudanças

**Quando usar**:
- Após implementar melhoria em workflow
- Após criar novo script útil
- Após descobrir novo padrão valioso
- Após corrigir bug em script

---

## 📋 Workflows Estruturados

### `add-feature.md`
**14 Fases completas**:
1. Entendimento e Contexto
2. Análise de Documentação Existente ⭐
3. Planejamento Profundo (Ultra Think)
4. Plano Detalhado
5. Checkpoint (Backup)
6. Sincronizar com Main
7. Criar Branch Git
8. Implementação (TDD + Pequenos Diffs) ⭐
9. Validação Automática
10. Code Review (OBRIGATÓRIO) ⭐
11. Testes de Segurança (OBRIGATÓRIO) ⭐
12. Atualização de Documentação
13. Commit e Push
14. **Meta-Aprendizado** ⭐ (NOVA!)

**Fase 14 - Meta-Aprendizado**:
- Deep think sobre o que aprendeu
- Identificar melhorias possíveis
- Sincronizar com template
- Documentar evolução

### `ultra-think.md`
**Análise profunda** para decisões complexas

**Quando usar**:
- Decisões arquiteturais
- Problemas complexos
- Trade-offs não óbvios
- Planejamento estratégico

---

## 🎯 Boas Práticas

### Ao Iniciar Projeto Novo
```bash
# 1. Copiar template
cp -r /Users/tiago/Projects/project-template /Users/tiago/Projects/meu-projeto
cd /Users/tiago/Projects/meu-projeto

# 2. Inicializar Git
git init
git add .
git commit -m "init: projeto base do template"

# 3. Customizar
# - Editar README.md com nome/descrição do projeto
# - Editar .claude/CLAUDE.md com contexto específico
# - Editar AGENTS.md se necessário

# 4. Remover .git do template (se copiou)
rm -rf .git
git init

# 5. Primeiro commit
git add .
git commit -m "init: projeto a partir do template"
```

### Durante Desenvolvimento
1. **Sempre** usar workflows estruturados
2. **Sempre** executar scripts de validação
3. **Sempre** documentar decisões (ADRs)
4. **Sempre** manter feature maps atualizados

### Após Feature Completa
1. **Executar Fase 14** - Meta-Aprendizado
2. **Identificar melhorias** em workflows/scripts
3. **Sincronizar com template** (se aplicável)
4. **Documentar evolução** em `TEMPLATE_EVOLUTION.md`

---

## 📊 Rastreamento de Evolução

### `TEMPLATE_EVOLUTION.md`
**Localização**: `docs/TEMPLATE_EVOLUTION.md`

**Propósito**: Historiar melhorias do template

**Formato**:
```markdown
# Evolução do Template

## 2025-10-27 - Projeto: CLTeam
### Melhorias Adicionadas
- ✅ Script de code review automatizado
- ✅ Fase de security scan no workflow
- ✅ Template de feature map estruturado

### Aprendizados
- Security scan detectou X issues que não estavam no radar
- TDD reduziu bugs em Y%
- Feature maps facilitaram onboarding

## 2025-11-XX - Projeto: [Próximo]
### Melhorias Adicionadas
- [ ] ...
```

---

## 🔐 Princípios do Sistema

### 1. DRY (Don't Repeat Yourself)
- Workflows reutilizáveis
- Scripts parametrizáveis
- Templates padronizados

### 2. Melhoria Contínua
- Cada projeto ensina algo
- Aprendizados são capturados
- Template sempre evolui

### 3. Conhecimento Explícito
- Decisões documentadas (ADRs)
- Padrões explicitados (docs)
- Processos estruturados (workflows)

### 4. Segurança por Padrão
- Security scan obrigatório
- Code review obrigatório
- Validações automáticas

### 5. Qualidade > Velocidade
- TDD quando apropriado
- Commits pequenos
- Testes abrangentes

---

## 🚀 Benefícios do Sistema

### Para Você (Desenvolvedor)
✅ **Menos decisões repetitivas**: Workflows guiam
✅ **Mais produtividade**: Scripts automatizam
✅ **Melhor qualidade**: Validações automáticas
✅ **Conhecimento preservado**: Docs capturam aprendizados
✅ **Evolução constante**: Cada projeto fica melhor

### Para o Projeto
✅ **Consistência**: Padrões claros
✅ **Manutenibilidade**: Docs atualizados
✅ **Segurança**: Validações automáticas
✅ **Qualidade**: Testes e reviews

### Para o Template
✅ **Evolução orgânica**: Melhora com uso real
✅ **Validação prática**: Padrões testados em produção
✅ **Conhecimento acumulado**: Cada projeto contribui

---

## 💡 Dicas de Uso

### Quando Sincronizar
**SEMPRE sincronizar**:
- Novo script útil
- Melhoria significativa em workflow
- Nova validação de segurança
- Padrão valioso descoberto
- Bug corrigido em script

**Avaliar antes de sincronizar**:
- Mudanças muito específicas do projeto
- Melhorias experimentais (esperar validação)
- Customizações de nicho

### Como Manter Template Limpo
- Não sincronizar código específico do projeto
- Manter apenas estrutura e ferramentas
- Generalizar antes de sincronizar
- Remover hardcoded values

### Versioning
- Atualizar número de versão em workflows quando mudar
- Documentar breaking changes
- Manter changelog em TEMPLATE_EVOLUTION.md

---

## 📖 Recursos Adicionais

- `.windsurf/workflows/add-feature.md` - Workflow completo
- `.claude/CLAUDE.md` - Contexto e padrões
- `AGENTS.md` - Instruções para AI agents
- `docs/adr/TEMPLATE.md` - Template de ADR
- `docs/features/TEMPLATE.md` - Template de Feature Map

---

## 🎓 Filosofia

> "A excelência não é um ato, mas um hábito" - Aristóteles

Este sistema transforma boas práticas em **hábitos estruturados** através de:
- Workflows que guiam
- Scripts que automatizam
- Documentação que preserva conhecimento
- Meta-aprendizado que captura insights

**Resultado**: Evolução contínua e sustentável.

---

**Criado em**: 2025-10-27
**Autor**: Tiago
**Versão**: 1.0
