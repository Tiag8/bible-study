# Documentação do Projeto

> Central de documentação técnica e decisões arquiteturais

---

## 📂 Estrutura

```
docs/
├── adr/                    # Architecture Decision Records
├── features/               # Mapas de features implementadas
├── architecture/           # Documentação de arquitetura
├── regras-de-negocio/     # Lógica de negócio e cálculos
├── ops/                   # Operações e deploy
└── TEMPLATE_SYSTEM.md     # Sistema de templates e melhoria contínua
```

---

## 📚 O que documentar em cada pasta?

### `adr/` - Architecture Decision Records
**Quando**: Decisão arquitetural importante

**Usar template**: `adr/TEMPLATE.md`

**Exemplos**:
- Escolha de framework (React vs Vue)
- Decisão de banco de dados
- Padrão de autenticação
- Estratégia de deploy

---

### `features/` - Mapas de Features
**Quando**: Feature nova ou modificada

**Usar template**: `features/TEMPLATE.md`

**Contém**:
- Componentes UI
- Hooks de dados
- Tabelas de banco
- Performance e segurança

---

### `architecture/` - Arquitetura
**Quando**: Documentar sistema como um todo

**Contém**:
- Diagramas de arquitetura
- Overview de componentes
- Fluxo de dados
- Integrações externas

---

### `regras-de-negocio/` - Lógica de Negócio
**Quando**: Lógica complexa ou cálculos

**Contém**:
- Fórmulas matemáticas
- Regras de validação
- Processos de negócio
- Casos de uso especiais

---

### `ops/` - Operações
**Quando**: Documentar deploy e operações

**Contém**:
- Guias de deploy
- Configuração de ambientes
- Runbooks
- Troubleshooting

---

## 🚀 Como Usar

### Criar Nova Documentação

```bash
# ADR
cp docs/adr/TEMPLATE.md docs/adr/001-titulo-da-decisao.md
# Editar arquivo

# Feature Map
cp docs/features/TEMPLATE.md docs/features/nome-da-feature.md
# Editar arquivo
```

### Manter Atualizado

- ✅ Atualizar ADRs quando decisão é substituída
- ✅ Atualizar feature maps quando feature muda
- ✅ Revisar docs regularmente (mensal/trimestral)

---

## 📖 Templates Disponíveis

- **ADR**: `adr/TEMPLATE.md`
- **Feature Map**: `features/TEMPLATE.md`

---

## 🎯 Princípios

1. **Documentação viva**: Manter sempre atualizada
2. **Decisões explícitas**: ADRs documentam o "por quê"
3. **Conhecimento preservado**: Docs sobrevivem à rotatividade
4. **Fácil encontrar**: Estrutura clara e consistente

---

**Leia também**: `TEMPLATE_SYSTEM.md` - Sistema de melhoria contínua
