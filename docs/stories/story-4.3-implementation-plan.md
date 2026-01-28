# Story 4.3: Plano de Implementação
## Referências de Estudos - UI/UX

**Criado:** 2026-01-28
**PM:** Morgan
**Status:** Ready for Development
**Assignee:** @dev (Dex)

---

## 📊 Visão Geral do Plano

| Aspecto | Detalhes |
|---------|----------|
| **Total Story Points** | 8 |
| **Total Tasks** | 15 |
| **Timeline Estimado** | 5-8 dias (1-1.5 sprint) |
| **Fases** | 4 (Components → Add → Delete/Reorder → Polish) |
| **Bloqueadores** | ✅ NENHUM (Story 2.4 já completa) |
| **Dependencies** | `useReferences.ts`, `design-tokens.ts`, `@radix-ui` |

---

## 🎯 Sequência de Implementação (Order Matters!)

### **FASE 1: Componentes Base (Days 1-2) — 5 Story Points**

#### Task 4.3.1: Design & Component Structure
**Complexidade:** Medium | **Estimativa:** 2-3h
**Owner:** @dev
**Objetivo:** Definir arquitetura de componentes e design

**Subtasks:**
- [ ] Criar tipos TypeScript para `Reference` e `ReferenceCardProps`
  ```typescript
  interface Reference {
    id: string;
    source_study_id: string;
    target_study_id: string;
    display_order: number;
    created_at: string;
    target_study?: {
      id: string;
      title: string;
      book_id: string;
      chapter: number;
      snippet?: string;
    };
  }
  ```
- [ ] Design 4 estados visuais: default, hover, active, error
- [ ] Definir responsive breakpoints:
  - Desktop (1024px+): sidebar visível
  - Tablet (768px-1023px): toggle button
  - Mobile (<768px): modal/drawer

**Files to Create:**
- `src/components/Editor/ReferenceCard.tsx` (component)
- `src/components/Editor/ReferencesSidebar.tsx` (container)
- `src/types/reference.ts` (TypeScript types)

**Deliverable:** Figma design + TypeScript types

---

#### Task 4.3.2: ReferencesSidebar Component (Static)
**Complexidade:** Medium | **Estimativa:** 3-4h
**Owner:** @dev
**Objective:** Build sidebar component (no data yet)

**Requirements:**
- [ ] Sidebar component receives `references` array as prop
- [ ] Header com título "Referências (n)" e botão collapse
- [ ] List references com ReferenceCard para cada
- [ ] EmptyState component: "Nenhuma referência ainda"
- [ ] Skeleton loader while fetching (4 placeholder cards)
- [ ] Use `cn()` + design tokens para styling
- [ ] Mobile: hidden by default, accessible via modal

**Code Template:**
```tsx
// src/components/Editor/ReferencesSidebar.tsx
export function ReferencesSidebar({
  references,
  loading,
  onAddReference,
  onDeleteReference,
  onReorder
}) {
  return (
    <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col h-full">
      <Header title={`Referências (${references.length})`} />
      {loading ? <SkeletonLoader /> : (
        <>
          {references.length === 0 ? <EmptyState /> : (
            <ReferenceList references={references} />
          )}
        </>
      )}
    </div>
  );
}
```

**Files to Create/Modify:**
- `src/components/Editor/ReferencesSidebar.tsx` (new)
- `src/components/Editor/ReferenceCard.tsx` (new)
- `src/components/Editor/EmptyStateReferences.tsx` (new)
- `src/components/Editor/SkeletonReferences.tsx` (new)

**Deliverable:** Static sidebar (props-driven, no API)

---

### **FASE 2: Add References Flow (Days 2-3) — 3 Story Points**

#### Task 4.3.3: AddReferenceModal Component
**Complexidade:** High | **Estimativa:** 4-5h
**Owner:** @dev
**Objective:** Build modal para adicionar referências

**Requirements:**
- [ ] Modal com searchable list de studies
- [ ] Filter por: book_id, title, chapter
- [ ] Show snippet preview ao selecionar
- [ ] Prevent duplicate (if reference already exists, show warning)
- [ ] "Cancelar" e "Adicionar" buttons
- [ ] Keyboard: Esc to close, Enter to select
- [ ] Use Radix Dialog + Input + Select components

**Features:**
- [ ] Real-time search debounced (200ms)
- [ ] Show "Nenhum estudo encontrado" if no matches
- [ ] Sort by relevance ou recency
- [ ] Max height with scroll if > 10 studies

**Code Structure:**
```tsx
export function AddReferenceModal({
  open,
  onClose,
  onSelect,
  currentStudyId,
  loading
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [studies, setStudies] = useState([]);

  // TODO: Fetch studies filtered by query
  // TODO: Exclude currentStudyId
  // TODO: Exclude already-referenced studies
}
```

**Files to Create:**
- `src/components/Editor/AddReferenceModal.tsx` (new)
- `src/hooks/useSearchStudies.ts` (new hook — searches DB)

**Dependencies:**
- Usa `useAuth()` para pegar `user.id`
- Usa `useStudies()` hook existente (adaptar)
- Usa Radix Dialog, Input, Button do shadcn/ui

**Deliverable:** Modal funcional com search

---

#### Task 4.3.4: Integration com useReferences Hook
**Complexidade:** Medium | **Estimativa:** 3-4h
**Owner:** @dev
**Objective:** Atualizar hook para suportar add + CRUD completo

**Current State:**
```typescript
// src/hooks/useReferences.ts (partially implemented)
export function useReferences(studyId, handleRemoveLink) {
  const { references, loading, addReference, deleteReference, reorderReference } = ...
  return { references, loading, addReference, deleteReference, reorderReference };
}
```

**Requirements:**
- [ ] `addReference(targetStudyId)` → POST to Supabase
  - Create row in `bible_study_links`
  - Return new reference object
  - Trigger toast: "Referência adicionada"
  - Return `boolean` (success)

- [ ] `deleteReference(referenceId)` → DELETE from Supabase
  - Delete row from `bible_study_links`
  - Call `handleRemoveLink()` to remove editor link
  - Trigger toast: "Referência removida"
  - Return `boolean` (success)

- [ ] `reorderReference(referenceId, newPosition)` → UPDATE
  - Update `display_order` in DB
  - Reorder local state
  - Return `boolean` (success)

- [ ] Error handling: Show error toast if mutation fails

**Code Pattern:**
```typescript
const addReference = useCallback(async (targetStudyId) => {
  try {
    const { data, error } = await supabase
      .from('bible_study_links')
      .insert([{
        source_study_id: id,
        target_study_id: targetStudyId,
        user_id: user.id,
        display_order: references.length + 1
      }])
      .select();

    if (error) throw error;

    setReferences([...references, data[0]]);
    toast.success('Referência adicionada');
    return true;
  } catch (error) {
    toast.error('Erro ao adicionar referência');
    return false;
  }
}, [references, id, user.id]);
```

**Files to Modify:**
- `src/hooks/useReferences.ts` (update existing)

**Deliverable:** Hook com CRUD funcional + error handling

---

### **FASE 3: Delete & Reorder (Days 3-4) — 2 Story Points**

#### Task 4.3.5: Delete Reference Flow
**Complexidade:** Medium | **Estimativa:** 2-3h
**Owner:** @dev
**Objective:** Implementar delete com confirmação

**Requirements:**
- [ ] Delete button em cada ReferenceCard
- [ ] Click trigger ConfirmModal: "Remover referência?"
- [ ] On confirm: Call `deleteReference(referenceId)`
- [ ] On success: Update sidebar + call `handleRemoveLink(targetStudyId)`
- [ ] On error: Show error toast with retry option
- [ ] Keyboard: Delete key removes reference

**Code Pattern:**
```tsx
// ReferenceCard.tsx
<Button
  variant="ghost"
  size="sm"
  onClick={() => setShowDeleteConfirm(true)}
  className="text-red-600 hover:text-red-700"
>
  <Trash2 className="w-4 h-4" />
</Button>

<ConfirmModal
  open={showDeleteConfirm}
  title="Remover referência?"
  description={`Deseja remover "${reference.target_study?.title}"?`}
  onConfirm={() => handleDelete(reference.id)}
  confirmText="Remover"
  variant="destructive"
/>
```

**Files to Modify:**
- `src/components/Editor/ReferenceCard.tsx` (add delete button)
- `src/components/Editor/ReferencesSidebar.tsx` (handle delete callback)

**Deliverable:** Delete flow functional + edge cases handled

---

#### Task 4.3.6: Drag-and-Drop Reordering
**Complexidade:** High | **Estimativa:** 3-4h
**Owner:** @dev
**Objective:** Implementar reordenação visual + persistência

**Library Choice:**
- Opção 1: `react-beautiful-dnd` (mais fácil, bem mantido)
- Opção 2: `dnd-kit` (mais moderno, melhor performance)
- **Recomendação:** `dnd-kit` (melhor mobile, sem react-dom issues)

**Requirements:**
- [ ] Wrap ReferenceList com DndContext
- [ ] ReferenceCard com draggable handle
- [ ] Smooth animation ao arrastar
- [ ] On drop: Update `display_order` no DB
- [ ] Optimistic UI (update local state immediately)
- [ ] If mutation fails: Revert order + show error toast
- [ ] Keyboard accessibility: Tab + arrow keys para reordenar

**Code Pattern:**
```tsx
// ReferencesSidebar.tsx
<DndContext onDragEnd={handleDragEnd}>
  <SortableContext items={references.map(r => r.id)}>
    {references.map(ref => (
      <SortableReferenceCard key={ref.id} reference={ref} />
    ))}
  </SortableContext>
</DndContext>

const handleDragEnd = async (event) => {
  const { active, over } = event;
  // Reorder local state
  // Call reorderReference() hook
  // Handle errors
};
```

**Installation:**
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**Files to Create/Modify:**
- `src/components/Editor/ReferencesSidebar.tsx` (add DnD wrapper)
- `src/components/Editor/SortableReferenceCard.tsx` (new, draggable)

**Deliverable:** Drag-and-drop functional com persistência

---

### **FASE 4: Polish & QA (Days 4-5) — 4+ Story Points**

#### Task 4.3.7: Responsive Mobile Layout
**Complexidade:** Medium | **Estimativa:** 2-3h
**Owner:** @dev
**Objective:** Mobile-first responsiveness

**Requirements:**
- [ ] **Desktop (1024px+):** Sidebar visível, layout atual
- [ ] **Tablet (768px-1023px):**
  - Toggle button para show/hide sidebar
  - References count badge na header
  - Drawer/panel quando aberto
- [ ] **Mobile (<768px)**
  - Sidebar hidden por default
  - Button "Referências (n)" na header
  - Click abre modal/bottom-sheet fullscreen
  - List scrollable dentro modal

**Breakpoints:**
```tsx
const isDesktop = useMediaQuery('(min-width: 1024px)');
const isTablet = useMediaQuery('(min-width: 768px)');

return isDesktop ? <Sidebar /> : isTablet ? <DrawerButton /> : <ModalButton />;
```

**Files to Modify:**
- `src/components/Editor/ReferencesSidebar.tsx` (add responsive wrapper)
- `src/app/estudo/[id]/StudyPageClient.tsx` (layout adjustments)

**Deliverable:** Mobile responsive + tested

---

#### Task 4.3.8: Loading States & Error Handling
**Complexidade:** Low | **Estimativa:** 1.5-2h
**Owner:** @dev
**Objective:** UX polish com skeleton + error states

**Requirements:**
- [ ] Skeleton loader enquanto references carregam
- [ ] Show 4 placeholder cards com shimmer effect
- [ ] Error state: "Erro ao carregar referências" + retry button
- [ ] Network error handling (offline detection)
- [ ] Optimistic UI: Update immediately, rollback on error
- [ ] Toast notifications: success, error, info

**Files to Create:**
- `src/components/Editor/SkeletonReferences.tsx` (new)

**Code Pattern:**
```tsx
{loading ? (
  <SkeletonReferences count={4} />
) : error ? (
  <ErrorState retry={refetch} />
) : references.length === 0 ? (
  <EmptyState />
) : (
  <ReferenceList references={references} />
)}
```

**Deliverable:** Smooth loading UX

---

#### Task 4.3.9: Keyboard Navigation & Accessibility
**Complexidade:** Medium | **Estimativa:** 2-3h
**Owner:** @dev
**Objective:** WCAG AA compliance

**Requirements:**
- [ ] Keyboard navigation: Tab through all interactive elements
- [ ] Delete key triggers delete reference
- [ ] Esc closes modal
- [ ] Enter selects reference em AddReferenceModal
- [ ] Arrow keys reorder references (alternative to drag)
- [ ] ARIA labels on buttons
- [ ] role="region" na sidebar
- [ ] aria-live="polite" para dynamic updates
- [ ] Screen reader announces: "Referência adicionada" etc
- [ ] Focus visible (outline/ring)
- [ ] Color contrast >= 4.5:1

**Testing:**
- [ ] Test with keyboard only (no mouse)
- [ ] Test with screen reader (NVDA/JAWS)
- [ ] Test focus order (Tab key)

**Files to Modify:**
- `src/components/Editor/ReferenceCard.tsx` (add ARIA)
- `src/components/Editor/ReferencesSidebar.tsx` (add ARIA)
- `src/components/Editor/AddReferenceModal.tsx` (add ARIA)

**Deliverable:** WCAG AA compliant

---

#### Task 4.3.10-4.3.13: Testing & Performance
**Complexidade:** Medium | **Estimativa:** 3-4h
**Owner:** @dev + @qa
**Objective:** Comprehensive testing

**Task 4.3.10: Desktop Testing (1920px, 1440px, 1024px)**
- [ ] Sidebar renders correctly at all widths
- [ ] Add/delete/reorder flows work smoothly
- [ ] No layout shift (CLS < 0.1)
- [ ] Tooltips position correctly
- [ ] Performance: Lighthouse > 80

**Task 4.3.11: Tablet Testing (iPad 768px)**
- [ ] Sidebar toggle works
- [ ] Drawer opens/closes smoothly
- [ ] Touch targets >= 44x44px
- [ ] No horizontal scroll
- [ ] Performance: Lighthouse > 75

**Task 4.3.12: Mobile Testing (iPhone 375px, 667px)**
- [ ] Modal fullscreen layout
- [ ] Scrollable list
- [ ] Touch-friendly buttons
- [ ] No layout shift
- [ ] Safe area respected (notch)
- [ ] Performance: Lighthouse > 70

**Task 4.3.13: Accessibility Audit (WCAG AA)**
- [ ] Use axe-core or WebAIM tools
- [ ] Color contrast check
- [ ] Keyboard navigation audit
- [ ] Screen reader test
- [ ] Fix any violations

**Testing Tools:**
```bash
npm install --save-dev @axe-core/react axe-playwright
```

**Deliverable:** Test report + screenshots

---

#### Task 4.3.14: CodeRabbit Review & Security
**Complexidade:** Low | **Estimativa:** 1h
**Owner:** @qa
**Objective:** Code quality & security

**Checks:**
- [ ] SQL injection risks (use parameterized queries — Supabase does)
- [ ] XSS vulnerabilities (sanitize user input)
- [ ] CSRF protection (Supabase handles)
- [ ] Rate limiting on add/delete (consider implementing)
- [ ] Proper error handling (no stack traces exposed)
- [ ] No hardcoded secrets

**Deliverable:** CodeRabbit approval + security sign-off

---

#### Task 4.3.15: Performance Optimization
**Complexidade:** Medium | **Estimativa:** 2-3h
**Owner:** @dev
**Objective:** Optimize render performance

**Optimizations:**
- [ ] Memoize ReferenceCard: `React.memo(ReferenceCard)`
- [ ] useCallback for delete/reorder handlers
- [ ] useMemo for filtered references (if search)
- [ ] Virtualize list if > 50 references (`react-window`)
- [ ] Lazy load full reference details on hover
- [ ] Debounce search in AddReferenceModal (200ms)
- [ ] Profile with React DevTools Profiler

**Target Metrics:**
- Sidebar render: < 500ms
- Add reference: < 300ms
- Delete reference: < 1s
- Lighthouse Performance: > 80

**Files to Check:**
- `src/components/Editor/ReferencesSidebar.tsx`
- `src/hooks/useReferences.ts`
- `src/components/Editor/ReferenceCard.tsx`

**Deliverable:** Performance report + optimizations applied

---

## 🔄 Sequência de Desenvolvimento (Ordem Recomendada)

```
DAY 1 (Monday)
├─ 4.3.1 Design & Types (2-3h)
└─ 4.3.2 ReferencesSidebar Static (3-4h)

DAY 2 (Tuesday)
├─ 4.3.3 AddReferenceModal (4-5h)
└─ 4.3.4 useReferences Hook (3-4h)

DAY 3 (Wednesday)
├─ 4.3.5 Delete Flow (2-3h)
└─ 4.3.6 Drag-and-Drop (3-4h)

DAY 4 (Thursday)
├─ 4.3.7 Mobile Responsive (2-3h)
├─ 4.3.8 Loading/Error States (1.5-2h)
└─ 4.3.9 Accessibility (2-3h)

DAY 5 (Friday)
├─ 4.3.10-13 Testing (3-4h)
├─ 4.3.14 CodeRabbit (1h)
└─ 4.3.15 Performance (2-3h)
```

---

## 🔗 Dependências & Bloqueadores

### Removidas ✅
- ✅ Story 2.4 (Trigger Validation) — COMPLETE
- ✅ Story 2.1 (RLS Policies) — COMPLETE
- ✅ Story 2.2 (Soft Delete) — COMPLETE

### Novas Dependências
- **useReferences.ts** — Hook (criar nesta story)
- **design-tokens.ts** — Já existe ✅
- **@dnd-kit** — Library (instalar)
- **sonner** — Toasts (já existe) ✅
- **@radix-ui** — Dialogs (já existe) ✅

### Parallel Dependencies (Não bloqueiam)
- Story 3.6 (Accessibility WCAG AA) — Pode rodar em paralelo
- Story 4.1 (Onboarding) — Pode incorporar feature walkthrough

---

## 🎯 Definição de Pronto (DoD)

A story é considerada **DONE** quando:

- [ ] Todos os 15 tasks completados
- [ ] Build: `npm run build` passa ✅
- [ ] Lint: `npm run lint` zero warnings ✅
- [ ] TypeScript: Sem erros
- [ ] Tests: Unit + E2E passing
- [ ] Accessibility: WCAG AA pass
- [ ] Performance: Lighthouse > 80
- [ ] CodeRabbit: Sem issues críticos/altos
- [ ] Mobile tested: iOS/Android
- [ ] Responsiveness: Desktop/tablet/mobile
- [ ] PR merged para main
- [ ] Changelog atualizado

---

## 📋 Checklist de Commits

Commits esperados (Conventional Commits):

```bash
feat(references): create ReferencesSidebar & ReferenceCard components
feat(references): add AddReferenceModal with search
feat(references): implement delete reference with confirmation
feat(references): add drag-and-drop reordering
feat(references): implement mobile responsive layout
feat(references): add loading states & error handling
feat(references): implement keyboard navigation & accessibility
test(references): add unit tests for useReferences hook
test(references): add E2E tests for add/delete/reorder flows
chore(references): optimize performance (memoization, debounce)
```

---

## 🚀 Recomendações

### For @dev (Dex)
1. **Start with 4.3.1-4.3.2**: Get visual feedback early
2. **Complete 4.3.4 quickly**: Core hook logic
3. **Test as you build**: Don't leave testing for last
4. **Use Playwright for E2E**: Record flows for regression testing
5. **Profile with React DevTools**: Catch performance issues early

### For @qa (Quinn)
1. **Review as tasks complete**: Don't wait for end
2. **Mobile testing on real devices**: Not just browser emulation
3. **Run accessibility audit early**: Fixes are cheaper upfront
4. **Create test case matrix**: 3 devices × 4 flows × 3 states

### For PM (Morgan)
1. **Daily standup**: Monitor progress vs. timeline
2. **Unblock dependencies**: Get dnd-kit library approved ASAP
3. **Plan user feedback**: Consider demo to beta users after complete

---

## 📊 Burndown Projection

| Day | Tasks Complete | Story Points | Status |
|-----|-----------------|--------------|--------|
| Monday | 2/15 | 1 | ✅ On track |
| Tuesday | 4/15 | 2 | ✅ On track |
| Wednesday | 6/15 | 3 | ✅ On track |
| Thursday | 9/15 | 5 | ✅ On track |
| Friday | 15/15 | 8 | ✅ Complete |

**Buffer:** 1 day for unplanned issues

---

## 🔐 Sign-Off

**PM:** Morgan
**Date:** 2026-01-28
**Approval:** ✅ APPROVED — Ready for @dev

**Next Step:** Assign to @dev, kick off Day 1 planning
