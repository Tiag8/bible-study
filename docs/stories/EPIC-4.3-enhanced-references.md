# EPIC 4.3: Referências Bidirecionais & Links Externos com Colorização

**Status**: 🟡 Planning
**Priority**: 🔴 CRÍTICA (MVP obrigatório)
**Assignee**: @dev
**Arch Review**: @architect (Aria - Decisões finalizadas)
**DB Review**: @data-architect (Delegado a @architect)

---

## 📊 CONTEXTO

### Visão Geral
Expandir o sistema de referências do ReferencesSidebar para suportar:
1. **Referências bidirecionais automáticas** - Adicionar A→B cria B←A
2. **Links externos** - Salvar URLs de sites dentro do estudo
3. **Colorização por tipo** - Visual diferenciado: verde (referencia), vermelho (referenciado), azul (externo)

### Usuário-alvo
Estudioso bíblico que quer:
- Ver conexões em AMBAS as direções (Salmos 10 ↔ Provérbios 21)
- Referenciar artigos/comentários online dentro de estudos
- Identificar visualmente o tipo de referência

### Valor de Negócio
- 🎯 **Usabilidade**: Aumenta contexto de estudo (relacionamentos)
- 📊 **Engajamento**: Links externos incentivam profundidade
- 🧠 **Knowledge Graph**: Padrão Obsidian/Roam (second brain)

---

## 🎯 OBJETIVOS

| Objetivo | Sucesso |
|----------|---------|
| Sincronizar referências bidirecional | A→B, B←A criados simultaneamente (trigger) |
| Permitir links externos | URLs salvos em `external_url` |
| Colorizar cards | Verde (ref), Vermelho (referen), Azul (externo) |
| Deletar atomicamente | Delete em qualquer lugar remove AMBAS as refs |
| Ordenação persistida | `display_order` salvo e restaurado |

---

## 📋 HISTÓRIAS DE USUÁRIO

### **Story 4.3.1: Referências Bidirecionais Automáticas**

**Como** um estudioso
**Quero** que quando eu referencio um estudo, a referência reversa seja criada automaticamente
**Para** ver conexões em ambas as direções sem ação manual

#### Critérios de Aceitação

- [ ] Quando cria referência A→B (Salmos 10 → Provérbios 21):
  - [ ] Referência A→B aparece no sidebar de Salmos 10 (verde)
  - [ ] Referência B←A aparece automaticamente no sidebar de Provérbios 21 (vermelho)

- [ ] Quando deleta referência em QUALQUER lugar:
  - [ ] Deletar em Salmos 10 → remove de Salmos 10 e Provérbios 21
  - [ ] Deletar em Provérbios 21 → remove de ambos os lados
  - [ ] User vê toast confirmação: "Referência removida: {title}"

- [ ] As referências reversas são:
  - [ ] Visualmente diferenciadas (vermelho = "referenciado por")
  - [ ] Clicáveis (navegam para estudo de origem)
  - [ ] NÃO deletáveis diretamente (apenas via origem)

- [ ] RLS garantida:
  - [ ] User A não vê referências de User B (mesmo que estudos compartilhados)
  - [ ] Validação `user_id` em trigger

#### Especificação Técnica

**Database**:
- [ ] Migration adiciona coluna `is_bidirectional BOOLEAN DEFAULT true`
- [ ] Trigger `sync_bidirectional_link()` cria reversa no INSERT
- [ ] Trigger usa `ON CONFLICT DO NOTHING` (idempotente)

**Hook (useReferences.ts)**:
- [ ] `addReference()` marca `is_bidirectional = true`
- [ ] Refetch carrega ambas A→B e B←A
- [ ] Endpoint helper RPC: `delete_bidirectional_link(link_id)`

**UI (ReferencesSidebar.tsx)**:
- [ ] Novo badge "Referenciado por" em vermelho
- [ ] Não renderiza delete button em refs reversas (readonly)
- [ ] Tooltip: "Esta referência foi criada automaticamente"

#### Dependências
- Migration (Aria decidiu usar coluna `is_bidirectional`)
- RPC helper `delete_bidirectional_link()`
- Ajuste em `useReferences()` hook

#### Estimativa
- Backend: 2h (migration + trigger + RPC)
- Frontend: 3h (UI changes + refetch logic)
- Testing: 2h (E2E bidirecional)
- **Total: ~7 pontos (1.5 dias)**

---

### **Story 4.3.2: Links Externos (URLs de Sites)**

**Como** um estudioso
**Quero** salvar referências para artigos/comentários online
**Para** manter contexto externo linkado ao estudo bíblico

#### Critérios de Aceitação

- [ ] Ao clicar "+" no ReferencesSidebar:
  - [ ] Modal "Adicionar Referência" tem tab "Link Externo"
  - [ ] User digita URL + (opcional) título customizado
  - [ ] Botão "Adicionar" salva com validação de URL

- [ ] Link externo aparece no sidebar:
  - [ ] Card azul com ícone 🔗 (ou apenas cor)
  - [ ] URL renderizada como clicável (target="_blank")
  - [ ] Título fallback é domínio se não fornecido

- [ ] Deletar link externo:
  - [ ] Clica X → confirmação modal
  - [ ] Remove de `bible_study_links` com `link_type = 'external'`
  - [ ] NÃO cria referência reversa (links externos são unidirecionais)

- [ ] Validações:
  - [ ] URL válida (https://... ou http://...)
  - [ ] Não duplicar mesmo URL no mesmo estudo
  - [ ] Max length 2048 caracteres

#### Especificação Técnica

**Database**:
- [ ] Migration adiciona colunas `link_type` (VARCHAR 20, CHECK)
- [ ] Nova coluna `external_url` (VARCHAR 2048, nullable)
- [ ] Quando `link_type = 'external'`, `target_study_id = NULL`

**Hook (useReferences.ts)**:
```typescript
// Nova função
async function addExternalLink(
  url: string,
  title?: string
): Promise<boolean> {
  // Validar URL (regex ou URLPattern API)
  // INSERT com link_type='external', target_study_id=NULL
}
```

**UI (AddReferenceModal.tsx)**:
- [ ] Tab switcher: "Estudo Interno" | "Link Externo"
- [ ] Form para URL + título opcional
- [ ] Preview de URL ao digitar (fetch Open Graph?)

**Component (ReferenceCard.tsx)**:
- [ ] Renderizar `external_url` como `<a target="_blank">`
- [ ] Ícone ou cor azul para diferenciação

#### Dependências
- URL validation library (nativa do JS: `new URL()`)
- Ajuste em `Reference` type
- AddReferenceModal nova tab

#### Estimativa
- Backend: 1.5h (migration + validation)
- Frontend: 3h (modal tab + form + rendering)
- Testing: 1.5h (E2E URL add/delete)
- **Total: ~6 pontos (1.5 dias)**

---

### **Story 4.3.3: Colorização por Tipo de Referência**

**Como** um estudioso
**Quero** ver cores diferentes para tipos de referência
**Para** identificar rapidamente o tipo (referen, referenciado, externo)

#### Critérios de Aceitação

- [ ] Cards renderizam com cores corretas:
  - [ ] **Verde claro** = "Eu referencio" (link_type=internal, is_bidirectional=true)
  - [ ] **Vermelho claro** = "Fui referenciado" (link_type=internal, is_bidirectional=false)
  - [ ] **Azul claro** = "Link externo" (link_type=external)

- [ ] Cores são **acessíveis**:
  - [ ] Contraste WCAG AA contra text preto/branco
  - [ ] Não apenas cor (adicionar ícone/badge se necessário)

- [ ] Cores aplicadas em **todos os estados**:
  - [ ] Normal
  - [ ] Hover
  - [ ] Loading (skeleton com cor)
  - [ ] Drag (manter cor mas opacity 0.5)

- [ ] Design tokens utilizados:
  - [ ] Usar `COLORS` de `src/lib/design-tokens.ts`
  - [ ] Se não existir, criar novo token (ex: `REFERENCE_TYPE_COLORS`)

#### Especificação Técnica

**Design Tokens** (`src/lib/design-tokens.ts`):
```typescript
export const REFERENCE_TYPE_COLORS = {
  references: 'bg-green-50 border-green-200',      // Verde claro
  referenced_by: 'bg-red-50 border-red-200',       // Vermelho claro
  external: 'bg-blue-50 border-blue-200'           // Azul claro
} as const;
```

**Component (SortableReferenceItem.tsx)**:
```typescript
// Função helper determina cor baseada em link_type + is_bidirectional
function getReferenceTypeColor(ref: Reference): string {
  if (ref.link_type === 'external') return REFERENCE_TYPE_COLORS.external;
  if (ref.is_bidirectional === true) return REFERENCE_TYPE_COLORS.references;
  return REFERENCE_TYPE_COLORS.referenced_by;
}

// Aplicar no className
<div className={cn(
  'px-4 py-3 rounded-lg border',
  getReferenceTypeColor(reference)
)}>
```

**Testing**:
- [ ] Visual regression test (Playwright visual snapshot)
- [ ] Acessibilidade: axe-core color contrast check

#### Dependências
- Nenhuma (apenas UI + design tokens)
- Pode ser feito em paralelo com outras stories

#### Estimativa
- Backend: 0h (zero mudanças)
- Frontend: 1.5h (design tokens + component updates)
- Testing: 1h (visual + accessibility)
- **Total: ~3 pontos (4-6 horas)**

---

### **Story 4.3.4: Persistência de Ordem (Display Order)**

**Como** um estudioso
**Quero** reordenar minhas referências e que a ordem seja salva
**Para** organizar referências por importância/contexto

#### Critérios de Aceitação

- [ ] Arrastar referência para nova posição:
  - [ ] Reorder salvo no DB (`display_order` atualizado)
  - [ ] Próxima vez que abre, ordem é restaurada
  - [ ] Toast: "Ordem salva"

- [ ] `display_order` gerencia múltiplas referências:
  - [ ] Se insere nova ref, recebe `display_order = MAX()+1`
  - [ ] Reordenar: swap `display_order` entre itens

- [ ] Validações:
  - [ ] `display_order >= 0`
  - [ ] Não há gaps (ex: [0, 2, 3] é inválido)

#### Especificação Técnica

**Database**:
- [ ] Migration adiciona `display_order SMALLINT DEFAULT 0`
- [ ] Índice em `(source_study_id, display_order)`

**Hook (useReferences.ts)**:
```typescript
// Já existe, apenas completar:
async function reorderReference(
  referenceId: string,
  direction: 'up' | 'down'
): Promise<boolean> {
  // Swap display_order com vizinho
  // UPDATE + UPDATE em transação
}
```

**UI**: Já implementado (não-blocking)

#### Dependências
- Migration apenas

#### Estimativa
- Backend: 1h (migration + reorder logic)
- Frontend: 0h (já existe)
- Testing: 0.5h
- **Total: ~2 pontos**

---

## 📊 ROADMAP & PRIORIZAÇÃO

| # | Story | MVPpriority | Pontos | Caminho Crítico |
|---|-------|----------|--------|-----------------|
| 1 | 4.3.1 | 🔴 | 7 | ✅ Migration → Hook → UI |
| 2 | 4.3.2 | 🔴 | 6 | ✅ Migration → Hook → Modal → UI |
| 3 | 4.3.3 | 🔴 | 3 | ✅ Design tokens → Component |
| 4 | 4.3.4 | 🟡 | 2 | ✅ Índice → Reorder logic |

**Total MVP**: 18 pontos (~4.5 dias)
**Recomendação**: Executar todas juntas (dependências inter-relacionadas)

---

## 🏗️ DEPENDÊNCIAS DE ARQUITETURA

### Decisões Finalizadas (@architect)

1. **Schema**: Adicionar `link_type`, `external_url`, `is_bidirectional`, `display_order` a `bible_study_links`
2. **Sincronização**: Trigger automático no INSERT (Opção A)
3. **Deletar**: Usando helper RPC `delete_bidirectional_link()` (Opção A híbrido)
4. **Tipagem**: CHECK constraint (Opção A)

### Migrações Necessárias

```sql
-- FASE 1: Schema
ALTER TABLE bible_study_links ADD COLUMN (
  link_type VARCHAR(20) DEFAULT 'internal' CHECK (...),
  external_url VARCHAR(2048),
  is_bidirectional BOOLEAN DEFAULT true,
  display_order SMALLINT DEFAULT 0
);

-- FASE 2: Triggers
CREATE OR REPLACE FUNCTION sync_bidirectional_link() ...
CREATE OR REPLACE FUNCTION delete_bidirectional_link(link_id UUID) ...

-- FASE 3: Índices
CREATE INDEX idx_bible_study_links_by_type ...
CREATE INDEX idx_bible_study_links_by_order ...
```

**Responsibility**: @data-architect valida schema, @architect aprova arquitetura

---

## ⚙️ CHECKLIST DE IMPLEMENTAÇÃO

### Gate 1: Planning & Architecture ✅
- [x] Epic definido com 4 stories
- [x] Schema desenhado (Aria)
- [x] Triggers definidas (Aria)
- [x] Estimativas em pontos

### Gate 2: Database & Backend
- [ ] Migration criada e testada (supabase migrate)
- [ ] Trigger `sync_bidirectional_link` validada
- [ ] RPC helper `delete_bidirectional_link` funcionando
- [ ] RLS policies atualizadas (se necessário)
- [ ] Tests: SQL validation + RPC tests

### Gate 3: Frontend & Integration
- [ ] `useReferences()` hook atualizado com novo tipo
- [ ] `ReferencesSidebar` renderiza cores por tipo
- [ ] `AddReferenceModal` tem tab de link externo
- [ ] `SortableReferenceItem` mostra badge de tipo
- [ ] Delete handler usa RPC helper

### Gate 4: Testing & QA
- [ ] E2E: Create bidirecional (ambos lados aparecem)
- [ ] E2E: Delete de qualquer lugar (ambos desaparecem)
- [ ] E2E: Add link externo (URL válida)
- [ ] E2E: Cores renderizam corretamente (visual snapshot)
- [ ] Accessibility: axe-core sem erros (WCAG AA)

### Gate 5: Code Review & Deployment
- [ ] CodeRabbit review: Padrões arquiteturais, security
- [ ] PR review: Lógica, testes, documentação
- [ ] Manual QA em staging
- [ ] Deployment para produção
- [ ] Monitoring: Logs de erro + performance

---

## 🚨 RISCOS & MITIGAÇÕES

| Risco | Probabilidade | Impacto | Mitigação |
|-------|------------|--------|-----------|
| Loop infinito de triggers | Baixa | Alta | ON CONFLICT DO NOTHING, pg_trigger_depth() |
| Orphaned refs se deletar estudo | Média | Alta | ON DELETE CASCADE (FK constraint) |
| Performance com muitas refs | Baixa | Média | Índices em source + display_order |
| Race condition no reorder | Baixa | Baixa | Transação (UPDATE + UPDATE) |
| URL inválida salva | Média | Baixa | Validação frontend + trigger |

---

## 📈 MÉTRICAS DE SUCESSO

| Métrica | Target | Como Medir |
|---------|--------|-----------|
| Taxa de criação bidirecional | 100% | Analytics: refs com is_bidirectional=true |
| Links externos salvos | > 5% de estudos | DB query: COUNT(*) link_type='external' |
| Reorder persistência | 100% | E2E test: order mantido após reload |
| Performance (load refs) | < 200ms | Lighthouse, Chrome DevTools |
| Acessibilidade | WCAG AA | axe-core automated test |

---

## 📝 HANDOFF (Para @sm)

### Próximos Passos
1. Quebrar Epic em 4 stories detalhadas (User Story Template)
2. Assignar developers (Backend + Frontend)
3. Criar branches: `feature/4.3-*`
4. Executar sequencialmente ou em paralelo (sem dependências bloqueantes)

### Comunicação
- Daily standups: Status de migration + trigger + UI changes
- Code review inline: Padrões de bidireção
- QA em staging antes de merge

### Success Criteria
- ✅ Todas 4 stories em DONE
- ✅ Código mergead em `main`
- ✅ Zero bugs críticos em produção (primeira semana)

---

## 📚 REFERÊNCIAS

- **Arquitetura**: `/docs/architecture/references-bidirectional.md` (a ser criado)
- **Código Existente**: `src/components/Editor/ReferencesSidebar.tsx` (364L)
- **Padrões**: `~/.claude/memory/supabase-rls.md` (Dual Source Sync #42)
- **Pesquisa**: Bidirectional database design patterns (2019-2025)

---

## 🎯 CONCLUSÃO

Este Epic define uma **expansão crítica** do sistema de referências:
- ✅ MVP completo: bidireção + externo + cores
- ✅ Arquitetura validada por @architect
- ✅ Estimativas realistas: 4-5 dias
- ✅ Riscos identificados e mitigados
- ✅ Quality gates embutidas

**Recomendação**: Prioridade CRÍTICA, iniciar imediatamente após aprovação.

---

**Criado por**: Morgan (Product Manager) 📋
**Aprovado por**: Aria (Architect) 🏛️
**Data**: 2026-01-28
**Versão**: 1.0
