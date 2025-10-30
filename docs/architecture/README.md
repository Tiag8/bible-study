# Arquitetura

> Documentação da arquitetura do sistema

---

## O que é?

Documentação de alto nível sobre a arquitetura do sistema: componentes, fluxos de dados, integrações, infraestrutura.

---

## Quando criar?

- Novo projeto (overview inicial)
- Mudança significativa na arquitetura
- Adição de novo componente/serviço
- Nova integração externa
- Decisão de infraestrutura

---

## O que documentar?

### Diagramas de Arquitetura
- C4 Model (Context, Container, Component, Code)
- Diagramas de fluxo de dados
- Diagramas de sequência
- Diagramas de deploy

### Componentes do Sistema
- Frontend (React, páginas principais)
- Backend (APIs, serviços)
- Banco de dados (estrutura, views, functions)
- Integrações externas (APIs, webhooks)

### Infraestrutura
- Ambientes (dev, staging, prod)
- Serviços utilizados (Supabase, Vercel, etc)
- CI/CD pipeline
- Monitoramento e logs

### Decisões de Arquitetura
- Padrões arquiteturais aplicados
- Trade-offs importantes
- Referência a ADRs relacionados

---

## Como criar?

```bash
# Criar documento de overview
touch docs/architecture/overview.md

# Criar documentos específicos
touch docs/architecture/frontend.md
touch docs/architecture/backend.md
touch docs/architecture/database.md
touch docs/architecture/infrastructure.md
```

---

## Estrutura Sugerida

```
architecture/
├── README.md                 # Este arquivo
├── overview.md               # Visão geral do sistema
├── frontend.md               # Arquitetura frontend
├── backend.md                # Arquitetura backend
├── database.md               # Arquitetura de dados
├── infrastructure.md         # Infraestrutura e deploy
├── integrations.md           # Integrações externas
└── diagrams/                 # Pasta para diagramas
    ├── c4-context.png
    ├── c4-container.png
    ├── data-flow.png
    └── deployment.png
```

---

## Ferramentas Úteis

- **Mermaid**: Diagramas em markdown
- **PlantUML**: Diagramas UML
- **Excalidraw**: Diagramas manuais
- **Draw.io**: Diagramas profissionais
- **C4 Model**: Framework de arquitetura

---

## Exemplo: Overview

```markdown
# Arquitetura - Overview

## Visão Geral
Sistema web de [descrição] construído com React + Supabase.

## Componentes Principais
1. **Frontend**: React SPA hospedado no Vercel
2. **Backend**: Supabase (PostgreSQL + Auth + Storage)
3. **APIs Externas**: [Lista de integrações]

## Fluxo de Dados
[Diagrama ou descrição do fluxo]

## Decisões Arquiteturais
- [ADR-001](../adr/001-escolha-supabase.md): Por que Supabase
- [ADR-002](../adr/002-react-framework.md): Por que React
```

---

## Manter Atualizado

- ✅ Atualizar quando adicionar novo componente
- ✅ Atualizar quando mudar infraestrutura
- ✅ Revisar trimestralmente
- ✅ Manter diagramas sincronizados com código

---

**Dica**: Use diagramas Mermaid no markdown para diagramas que mudam frequentemente.
