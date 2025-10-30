# Mapa de Feature - [Nome da Feature]

> [Breve descrição da feature em uma linha]

---

## 📋 Identidade

| Campo | Valor |
|-------|-------|
| **Nome** | [Nome da Feature] |
| **Rota** | `/caminho` |
| **Página** | `src/pages/NomeDaPagina.tsx` |
| **Prioridade** | Alta / Média / Baixa |
| **Owner** | [Equipe/Pessoa responsável] |
| **Status** | 🚧 Em Desenvolvimento / ✅ Produção / 📝 Planejamento / ❌ Deprecated |
| **Criado em** | YYYY-MM-DD |
| **Última atualização** | YYYY-MM-DD |

---

## 🎯 Objetivo

**Problema que resolve**:
[Descrever o problema ou necessidade]

**Valor de negócio**:
[Explicar o valor que esta feature traz]

**Usuários impactados**:
- [Tipo de usuário 1]
- [Tipo de usuário 2]

---

## 🎨 UI - Componentes

### Página Principal
**Arquivo**: `src/pages/NomeDaPagina.tsx`

**Responsabilidade**: [Descrição do que a página faz]

**Seções**:
1. **[Nome da Seção]**
   - Descrição
   - Componentes usados

2. **[Nome da Seção]**
   - Descrição
   - Componentes usados

### Componentes Reutilizáveis

| Componente | Arquivo | Responsabilidade | Props Principais |
|------------|---------|------------------|------------------|
| **[NomeComponente]** | `src/components/pasta/Nome.tsx` | [O que faz] | `prop1`, `prop2` |
| **[NomeComponente]** | `src/components/pasta/Nome.tsx` | [O que faz] | `prop1`, `prop2` |

---

## 🪝 Hooks - Lógica de Dados

### 1. `[useNomeDoHook]`
**Arquivo**: `src/hooks/useNome.ts:XXX`

**Assinatura**:
```typescript
useNomeDoHook(parametro1: Type, parametro2: Type): {
  data: DataType | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}
```

**Responsabilidade**:
[O que o hook faz]

**Query/Mutation Supabase**:
```typescript
supabase
  .from("tabela")
  .select("colunas")
  .eq("filtro", valor)
```

**Quando usar**:
[Casos de uso]

---

### 2. `[useOutroHook]`
[Mesma estrutura]

---

## 🗄️ Database

### Tabelas Utilizadas

#### 1. `[nome_da_tabela]`

| Coluna | Tipo | Descrição | Constraints |
|--------|------|-----------|-------------|
| `id` | uuid | ID único | PK, NOT NULL |
| `campo1` | tipo | Descrição | NOT NULL |
| `campo2` | tipo | Descrição | NULL |

**Índices**:
- `idx_tabela_campo1` - Para otimizar queries por campo1

**RLS (Row Level Security)**:
```sql
-- SELECT: Usuários podem ver apenas seus próprios dados
CREATE POLICY "select_own_data" ON tabela
  FOR SELECT USING (auth.uid() = user_id);
```

**Relacionamentos**:
- FK para `outra_tabela.id`

---

### Views Utilizadas (se aplicável)

#### `[nome_da_view]`
**Propósito**: [O que a view agrega]

**SQL**:
```sql
CREATE VIEW nome_da_view AS
SELECT ...
FROM ...
WHERE ...
```

---

### Functions Utilizadas (se aplicável)

#### `[nome_da_function]`
**Propósito**: [O que a function faz]

**Parâmetros**: `param1 TYPE, param2 TYPE`
**Retorna**: `TYPE`

---

## 📊 Performance

### Otimizações Implementadas
- ✅ [Otimização 1]: [Benefício]
- ✅ [Otimização 2]: [Benefício]

### Índices de Performance
- Query tempo médio: [X ms]
- Tamanho do bundle: [X KB]
- Lazy loading: [Sim/Não]

### Gargalos Conhecidos
- ⚠️ [Gargalo 1]: [Descrição e plano de melhoria]

---

## 🔒 Segurança

### RLS Configurado
- ✅ Usuários veem apenas seus dados
- ✅ Insert/Update/Delete restritos

### Validações
- ✅ Frontend: [Validações implementadas]
- ✅ Backend: [Validações RLS/Functions]

### Dados Sensíveis
- [Como dados sensíveis são tratados]

---

## 🧪 Testes

### Testes Unitários
- [ ] `useNomeDoHook.test.ts` - [Status]
- [ ] `Componente.test.tsx` - [Status]

### Testes de Integração
- [ ] [Cenário 1] - [Status]
- [ ] [Cenário 2] - [Status]

### Casos de Teste Manual
1. **[Caso 1]**
   - Passos: [1, 2, 3]
   - Resultado esperado: [X]

2. **[Caso 2]**
   - Passos: [1, 2, 3]
   - Resultado esperado: [Y]

---

## 📝 Decisões Arquiteturais

### ADRs Relacionados
- [ADR-XXX: Título](../adr/XXX-titulo.md)
- [ADR-YYY: Título](../adr/YYY-titulo.md)

### Padrões Aplicados
- [Padrão 1]: [Por que]
- [Padrão 2]: [Por que]

---

## 🔄 Fluxo de Dados

```
┌─────────────┐
│  Usuário    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Componente │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Hook      │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Supabase   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Database   │
└─────────────┘
```

---

## 🚀 Roadmap

### Próximas Melhorias
- [ ] [Melhoria 1]
- [ ] [Melhoria 2]
- [ ] [Melhoria 3]

### Backlog
- [ ] [Item futuro 1]
- [ ] [Item futuro 2]

---

## 📚 Referências

- **Design**: [Link para Figma/design]
- **Documentação API**: [Link]
- **Issues Relacionadas**: [#123, #456]

---

## 🐛 Bugs Conhecidos

- [ ] [Bug 1]: [Descrição] - Issue #XXX
- [ ] [Bug 2]: [Descrição] - Issue #YYY

---

## 💡 Notas

[Qualquer informação adicional relevante]

---

**Última atualização**: YYYY-MM-DD
**Autor**: [Nome]
**Revisores**: [Nome(s)]
