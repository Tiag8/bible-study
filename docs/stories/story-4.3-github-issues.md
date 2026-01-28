# Story 4.3 — GitHub Issues Templates

**Use these templates to create GitHub issues for each task.**

Copy-paste directly into GitHub: https://github.com/your-repo/issues/new

---

## 📌 Issue 1: Task 4.3.1 — Design & TypeScript Types

```markdown
# 4.3.1: Design & TypeScript Types

**Story:** Story 4.3 — Referências de Estudos - UI/UX
**Task:** 4.3.1
**Points:** 2
**Timeline:** Monday 9:30 AM - 12:30 PM

## Description

Define TypeScript types and component structure for the reference system.

This task establishes the foundation for all subsequent tasks by:
1. Creating `src/types/reference.ts` with interfaces
2. Documenting component hierarchy
3. Defining visual states (default, hover, dragging, error)

## Acceptance Criteria

- [ ] `src/types/reference.ts` created with all interfaces
  - `Reference` interface (from DB)
  - `ReferenceCardProps`
  - `ReferencesSidebarProps`
  - `AddReferenceModalProps`
- [ ] Component structure documented
- [ ] Visual states defined (default, hover, dragging, error, mobile)
- [ ] Commit: `feat(types): add reference type definitions`
- [ ] Build passes: `npm run build` ✅
- [ ] Lint passes: `npm run lint` ✅

## Resources

- Read: `docs/stories/story-4.3-reference-links-ui.md`
- Read: `docs/stories/story-4.3-dev-kickoff.md`
- See: `src/types/` (existing patterns)
- See: `src/components/Editor/index.tsx` (component patterns)

## Notes

- Use TypeScript strict mode
- Document all interface properties
- Consider future extensibility (e.g., snippets, custom metadata)

```

---

## 📌 Issue 2: Task 4.3.2 — ReferencesSidebar Component

```markdown
# 4.3.2: Static ReferencesSidebar Component

**Story:** Story 4.3 — Referências de Estudos - UI/UX
**Task:** 4.3.2
**Points:** 3
**Timeline:** Monday 12:30 PM - 5:00 PM

## Description

Build ReferencesSidebar component (props-driven, no API calls yet).

By EOD today, ReferencesSidebar should render correctly with mock data, displaying references in a sidebar layout with proper styling.

## Acceptance Criteria

- [ ] `src/components/Editor/ReferenceCard.tsx` created
  - Props: reference, onDelete, isDragging, isLoading
  - States: default, hover (delete visible), dragging (0.7 opacity)
  - Icons: GripVertical (drag handle), Trash2 (delete)
  - Uses design tokens for colors

- [ ] `src/components/Editor/ReferencesSidebar.tsx` created
  - Props: references[], loading, error, onAddReference, onDeleteReference
  - States: collapsed/expanded header
  - Shows: Reference list OR skeleton OR empty state OR error
  - Header: "Referências (n)" with + button
  - Uses design tokens
  - Mobile: hidden (will add toggle in Day 4)

- [ ] Helper Components
  - [ ] EmptyState: "Nenhuma referência ainda"
  - [ ] ErrorState: "Erro ao carregar referências" + retry
  - [ ] SkeletonReferences: 4 placeholder cards with shimmer

- [ ] Visual Integration
  - [ ] Import in StudyPageClient.tsx
  - [ ] Pass mock data to test
  - [ ] Verify renders without errors
  - [ ] Sidebar positioned correctly (w-80, right side)

- [ ] Styling
  - [ ] Uses design-tokens.ts (COLORS, SHADOW_CLASSES, etc)
  - [ ] Hover states match design system
  - [ ] 1px gray-200 border default, gray-300 on hover
  - [ ] Proper spacing (p-4, gap-2, etc)
  - [ ] Delete button visible on hover only

- [ ] Component Quality
  - [ ] ReferenceCard memoized: `React.memo()`
  - [ ] Proper TypeScript types (no `any`)
  - [ ] Accessible: aria-labels, semantic HTML
  - [ ] No console errors

- [ ] Build & Lint
  - [ ] `npm run build` ✅ PASS
  - [ ] `npm run lint` ✅ ZERO WARNINGS
  - [ ] TypeScript strict mode ✅
  - [ ] Commit: `feat(components): create ReferencesSidebar & ReferenceCard`

## Files to Create/Modify

**Create:**
- `src/components/Editor/ReferenceCard.tsx`
- `src/components/Editor/ReferencesSidebar.tsx`

**Modify:**
- `src/app/estudo/[id]/StudyPageClient.tsx` (import + test)

## Design Reference

```
SIDEBAR LAYOUT:
┌──────────────────────────┐
│ ▼ Referências (3)   [+]  │ ← Header
├──────────────────────────┤
│ ┌──────────────────────┐ │
│ │ 👇 Genesis 1:1 [🗑] │ │ ← ReferenceCard (default)
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ 👇 John 14:6   [🗑] │ │ ← ReferenceCard (hover)
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ 👇 Exodus 3:14 [🗑] │ │ ← ReferenceCard
│ └──────────────────────┘ │
└──────────────────────────┘
```

## Notes

- Don't call APIs yet (Task 4.3.4 for that)
- Mock data is fine for testing visual layout
- Focus on UX/styling, not data fetching
- Icon library: lucide-react (already installed)

## Blockers

None. Task 4.3.1 must complete first, but no external dependencies.

```

---

## 📌 Issue 3: Task 4.3.3 — AddReferenceModal

```markdown
# 4.3.3: AddReferenceModal Component

**Story:** Story 4.3 — Referências de Estudos - UI/UX
**Task:** 4.3.3
**Points:** 3
**Timeline:** Tuesday 9:00 AM - 1:00 PM

## Description

Build modal for adding new references. Users will:
1. Click "+" button in sidebar (or "Referenciar" in editor)
2. Modal opens with searchable list of studies
3. Select a study
4. Reference is created

This task creates the modal UI (task 4.3.4 integrates with API).

## Acceptance Criteria

- [ ] `src/components/Editor/AddReferenceModal.tsx` created
  - Props: open, onClose, onSelect, currentStudyId, loading
  - Modal uses Radix Dialog (from shadcn/ui)

- [ ] Search Functionality
  - [ ] Real-time search by book or title
  - [ ] Debounced 200ms
  - [ ] Filter results as user types
  - [ ] Show "Nenhum estudo encontrado" if no matches

- [ ] Study List
  - [ ] Show all studies except:
    - [ ] Current study (currentStudyId)
    - [ ] Already-referenced studies
  - [ ] Display: book + chapter + title
  - [ ] Scrollable if > 10 studies
  - [ ] Clickable items

- [ ] User Interactions
  - [ ] Click study → calls onSelect(targetStudyId)
  - [ ] Keyboard: Esc to close
  - [ ] Keyboard: Enter to select (if focused)
  - [ ] Keyboard: Arrow keys to navigate list

- [ ] Visual States
  - [ ] Loading: Show spinner + "Carregando..."
  - [ ] Error: "Erro ao carregar estudos" + retry
  - [ ] Empty: "Nenhum estudo encontrado"
  - [ ] Normal: List of studies

- [ ] Styling
  - [ ] Uses design tokens (COLORS, TYPOGRAPHY)
  - [ ] Modal centered on screen
  - [ ] Touch-friendly on mobile (44x44px targets)
  - [ ] Proper spacing and contrast

- [ ] Accessibility
  - [ ] ARIA labels on all buttons
  - [ ] Search input has label
  - [ ] List items have role="option"
  - [ ] Dialog has role="dialog"
  - [ ] Focus trap (Tab stays within modal)

- [ ] Code Quality
  - [ ] No hardcoded strings (use translations if needed)
  - [ ] Proper TypeScript (no any)
  - [ ] Memoized if passed as prop
  - [ ] `npm run build` ✅
  - [ ] `npm run lint` ✅

## Files to Create

- `src/components/Editor/AddReferenceModal.tsx`

## Dependencies

**Requires task 4.3.4** (useSearchStudies hook) — can be done in parallel

**Libraries (already installed):**
- Radix Dialog (shadcn/ui)
- lucide-react (icons)
- design-tokens.ts

## Notes

- For now, use mock data or simple filter of all studies
- Task 4.3.4 will add real Supabase search
- Focus on UX, not data fetching

## Example Usage

```typescript
<AddReferenceModal
  open={showModal}
  onClose={() => setShowModal(false)}
  onSelect={async (targetStudyId) => {
    // Will implement in 4.3.4
    console.log('Selected:', targetStudyId);
  }}
  currentStudyId={id}
  loading={false}
/>
```

```

---

## 📌 Issue 4: Task 4.3.4 — useReferences Hook (CRUD)

```markdown
# 4.3.4: Update useReferences Hook (Full CRUD)

**Story:** Story 4.3 — Referências de Estudos - UI/UX
**Task:** 4.3.4
**Points:** 3
**Timeline:** Tuesday 1:00 PM - 5:00 PM

## Description

Update `src/hooks/useReferences.ts` to support full CRUD operations:
- Add reference (POST)
- Delete reference (DELETE)
- Reorder reference (PATCH)
- Fetch references (GET)

This hook is the bridge between UI components and Supabase database.

## Acceptance Criteria

- [ ] `useReferences` Hook Updated
  - [ ] `addReference(targetStudyId)` → POST
    - Creates row in bible_study_links
    - Validates targetStudyId != currentStudyId
    - Prevents duplicates
    - Returns boolean (success/fail)
    - Toast: "Referência adicionada"

  - [ ] `deleteReference(referenceId)` → DELETE
    - Deletes row from bible_study_links
    - Calls handleRemoveLink callback (removes editor link)
    - Returns boolean (success/fail)
    - Toast: "Referência removida"

  - [ ] `reorderReference(referenceId, newPosition)` → PATCH
    - Updates display_order in DB
    - Optimistic UI (update local state immediately)
    - Returns boolean (success/fail)
    - Toast: "Ordem atualizada"

  - [ ] `fetchReferences(studyId)` → GET
    - Fetches all references for a study
    - Includes target_study details (denormalized)
    - Sorted by display_order
    - Returns Reference[]

- [ ] Error Handling
  - [ ] Network errors show toast
  - [ ] DB errors caught and logged
  - [ ] Optimistic UI reverts on failure
  - [ ] User-friendly error messages (PT-BR)

- [ ] Loading States
  - [ ] loading: boolean (true while fetching)
  - [ ] isAdding, isDeleting, isReordering (per-operation)

- [ ] Auth Integration
  - [ ] Uses useAuth() hook
  - [ ] Filters by user_id (RLS)
  - [ ] Validates user owns both studies

- [ ] Supabase Queries
  - [ ] Uses parameterized queries (no SQL injection)
  - [ ] Respects RLS policies
  - [ ] Efficient queries (no N+1)

- [ ] TypeScript
  - [ ] Proper return types
  - [ ] Uses Reference type
  - [ ] No any types
  - [ ] Strict mode ✅

- [ ] Code Quality
  - [ ] Follows pattern of useStudies.ts
  - [ ] useCallback for functions
  - [ ] Proper cleanup on unmount
  - [ ] `npm run build` ✅
  - [ ] `npm run lint` ✅
  - [ ] Commit: `feat(hooks): implement useReferences CRUD operations`

## Database Schema (Already Exists)

```sql
CREATE TABLE bible_study_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_study_id UUID NOT NULL REFERENCES bible_studies(id) ON DELETE CASCADE,
  target_study_id UUID NOT NULL REFERENCES bible_studies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies (already configured)
-- Trigger validation (already configured in Story 2.4)
```

## Implementation Pattern

```typescript
export function useReferences(studyId: string | null, onRemoveLink?: (targetStudyId: string) => void) {
  const { user } = useAuth();
  const [references, setReferences] = useState<Reference[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch references
  const fetchReferences = useCallback(async () => {
    if (!user?.id || !studyId) return;

    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('bible_study_links')
        .select('*, target_study:target_study_id(...)')
        .eq('source_study_id', studyId)
        .eq('user_id', user.id)
        .order('display_order', { ascending: true });

      if (err) throw err;
      setReferences(data);
    } catch (err) {
      toast.error('Erro ao carregar referências');
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [studyId, user?.id]);

  // Add reference
  const addReference = useCallback(async (targetStudyId: string) => {
    try {
      // Prevent duplicate
      if (references.some(r => r.target_study_id === targetStudyId)) {
        toast.error('Referência já existe');
        return false;
      }

      const { error: err } = await supabase
        .from('bible_study_links')
        .insert([{
          source_study_id: studyId,
          target_study_id: targetStudyId,
          user_id: user?.id,
          display_order: references.length + 1
        }]);

      if (err) throw err;

      toast.success('Referência adicionada');
      await fetchReferences();
      return true;
    } catch (err) {
      toast.error('Erro ao adicionar referência');
      return false;
    }
  }, [references, studyId, user?.id, fetchReferences]);

  // Delete reference
  const deleteReference = useCallback(async (referenceId: string) => {
    try {
      const ref = references.find(r => r.id === referenceId);

      const { error: err } = await supabase
        .from('bible_study_links')
        .delete()
        .eq('id', referenceId);

      if (err) throw err;

      // Remove link from editor
      if (ref && onRemoveLink) {
        onRemoveLink(ref.target_study_id);
      }

      toast.success('Referência removida');
      setReferences(prev => prev.filter(r => r.id !== referenceId));
      return true;
    } catch (err) {
      toast.error('Erro ao remover referência');
      return false;
    }
  }, [references, onRemoveLink]);

  // Reorder reference
  const reorderReference = useCallback(async (referenceId: string, newPosition: number) => {
    try {
      // Optimistic UI
      const updated = references.map(r =>
        r.id === referenceId ? { ...r, display_order: newPosition } : r
      ).sort((a, b) => a.display_order - b.display_order);

      setReferences(updated);

      // Update DB
      const { error: err } = await supabase
        .from('bible_study_links')
        .update({ display_order: newPosition })
        .eq('id', referenceId);

      if (err) throw err;

      toast.success('Ordem atualizada');
      return true;
    } catch (err) {
      toast.error('Erro ao reordenar');
      // Revert optimistic update
      await fetchReferences();
      return false;
    }
  }, [references, fetchReferences]);

  useEffect(() => {
    fetchReferences();
  }, [fetchReferences]);

  return {
    references,
    loading,
    error,
    addReference,
    deleteReference,
    reorderReference,
    refetch: fetchReferences
  };
}
```

## Files to Modify

- `src/hooks/useReferences.ts` (update existing)

## Notes

- Story 2.4 already implemented DB layer (triggers, RLS)
- This task adds the API/hook layer
- Test with real data from DB (not mocks)

```

---

## 📌 Issue 5: Task 4.3.5 — Delete Reference Flow

```markdown
# 4.3.5: Delete Reference Flow

**Story:** Story 4.3 — Referências de Estudos - UI/UX
**Task:** 4.3.5
**Points:** 2
**Timeline:** Wednesday 9:00 AM - 11:00 AM

## Description

Implement delete reference flow with confirmation modal and error handling.

## Acceptance Criteria

- [ ] Delete Button in ReferenceCard
  - [ ] Click trigger ConfirmModal
  - [ ] Red text color, hover effect
  - [ ] Disabled during loading

- [ ] Delete Confirmation Modal
  - [ ] Title: "Remover referência?"
  - [ ] Description: Show target study title
  - [ ] Buttons: "Remover" (red) + "Cancelar"
  - [ ] Uses ConfirmModal component (already exists)

- [ ] Delete Flow
  - [ ] On confirm: Call deleteReference(referenceId)
  - [ ] Success: Remove from sidebar, show toast
  - [ ] Error: Show error toast with retry
  - [ ] Call handleRemoveLink() to remove editor link

- [ ] Accessibility
  - [ ] Keyboard: Delete key to delete reference
  - [ ] Modal is keyboard accessible
  - [ ] Focus trap in modal

- [ ] `npm run build` ✅
- [ ] `npm run lint` ✅

## Files to Modify

- `src/components/Editor/ReferenceCard.tsx` (add delete state)
- `src/components/Editor/ReferencesSidebar.tsx` (handle callback)

```

---

## 📌 Issue 6: Task 4.3.6 — Drag-and-Drop Reordering

```markdown
# 4.3.6: Drag-and-Drop Reordering

**Story:** Story 4.3 — Referências de Estudos - UI/UX
**Task:** 4.3.6
**Points:** 3
**Timeline:** Wednesday 11:00 AM - 3:00 PM

## Description

Implement drag-and-drop reordering of references using @dnd-kit library.

## Acceptance Criteria

- [ ] DnD Setup
  - [ ] Install @dnd-kit: `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`
  - [ ] Import DndContext, SortableContext, useSortable
  - [ ] Wrap ReferenceList with DnD provider

- [ ] Draggable Cards
  - [ ] GripVertical icon visible (handle)
  - [ ] Cursor changes to grab/grabbing
  - [ ] Opacity 0.7 while dragging
  - [ ] Smooth animation

- [ ] Drop & Reorder
  - [ ] On drop: Call reorderReference()
  - [ ] Update display_order in DB
  - [ ] Optimistic UI (update immediately)
  - [ ] Rollback on error

- [ ] Keyboard Navigation
  - [ ] Tab to reference
  - [ ] Space to pickup
  - [ ] Arrow keys to move
  - [ ] Enter to drop

- [ ] Mobile Support
  - [ ] Touch to drag
  - [ ] Long-press to activate (optional)

- [ ] `npm run build` ✅
- [ ] `npm run lint` ✅

## Files to Create/Modify

- Create: `src/components/Editor/SortableReferenceCard.tsx`
- Modify: `src/components/Editor/ReferencesSidebar.tsx`

```

---

## 📌 Issue 7: Task 4.3.7 — Mobile Responsive Layout

```markdown
# 4.3.7: Mobile Responsive Layout

**Story:** Story 4.3 — Referências de Estudos - UI/UX
**Task:** 4.3.7
**Points:** 2
**Timeline:** Thursday 9:00 AM - 11:00 AM

## Description

Implement responsive layouts for tablet and mobile devices.

## Acceptance Criteria

- [ ] Desktop (1024px+)
  - [ ] Sidebar visible (w-80)
  - [ ] Layout unchanged from current

- [ ] Tablet (768px-1023px)
  - [ ] Sidebar hidden by default
  - [ ] Toggle button in header
  - [ ] Click shows sidebar as drawer/panel
  - [ ] References count badge visible

- [ ] Mobile (<768px)
  - [ ] Sidebar hidden
  - [ ] "Referências (n)" button in header
  - [ ] Click opens modal/bottom-sheet
  - [ ] Fullscreen or nearly fullscreen
  - [ ] Scrollable content

- [ ] Breakpoints
  - [ ] Use useMediaQuery hook or Tailwind @media
  - [ ] Test at 1920px, 1440px, 1024px, 768px, 667px, 375px

- [ ] Touch Targets
  - [ ] All buttons: min 44x44px
  - [ ] List items: min 44px height

- [ ] `npm run build` ✅
- [ ] `npm run lint` ✅

```

---

## 📌 Issue 8: Task 4.3.8 — Loading & Error States

```markdown
# 4.3.8: Loading States & Error Handling

**Story:** Story 4.3 — Referências de Estudos - UI/UX
**Task:** 4.3.8
**Points:** 2
**Timeline:** Thursday 11:00 AM - 1:00 PM

## Description

Add skeleton loaders, error states, and optimistic UI.

## Acceptance Criteria

- [ ] Skeleton Loader
  - [ ] 4 placeholder cards while loading
  - [ ] Shimmer animation
  - [ ] Natural placeholder proportions

- [ ] Error State
  - [ ] "Erro ao carregar referências"
  - [ ] Retry button
  - [ ] Clear error message

- [ ] Optimistic UI
  - [ ] Add reference: Update sidebar immediately
  - [ ] Delete reference: Remove immediately
  - [ ] Reorder: Visual feedback immediately
  - [ ] Rollback on API failure

- [ ] Toast Notifications
  - [ ] Success: "Referência adicionada"
  - [ ] Error: "Erro ao adicionar referência"
  - [ ] Info: "Ordem atualizada"
  - [ ] Using sonner (already installed)

- [ ] `npm run build` ✅
- [ ] `npm run lint` ✅

```

---

## 📌 Issue 9: Task 4.3.9 — Accessibility & Keyboard Navigation

```markdown
# 4.3.9: Accessibility & Keyboard Navigation (WCAG AA)

**Story:** Story 4.3 — Referências de Estudos - UI/UX
**Task:** 4.3.9
**Points:** 2
**Timeline:** Thursday 1:00 PM - 3:00 PM

## Description

Implement full keyboard navigation and WCAG AA accessibility compliance.

## Acceptance Criteria

- [ ] Keyboard Navigation
  - [ ] Tab through all interactive elements
  - [ ] Delete key removes reference
  - [ ] Escape closes modals
  - [ ] Enter selects in modal
  - [ ] Arrow keys move focus
  - [ ] Space activates buttons

- [ ] ARIA Labels
  - [ ] Buttons have aria-label
  - [ ] Modal has role="dialog"
  - [ ] Sidebar has role="region"
  - [ ] List items have role="article"
  - [ ] aria-live="polite" for updates

- [ ] Semantic HTML
  - [ ] Buttons are `<button>` (not divs)
  - [ ] Links are `<a>` (if applicable)
  - [ ] Headings in hierarchy (h1 → h4)

- [ ] Color Contrast
  - [ ] All text: 4.5:1 minimum
  - [ ] Icons: 3:1 minimum
  - [ ] Test with contrast checker

- [ ] Focus Management
  - [ ] Focus visible (outline/ring)
  - [ ] Focus trap in modals
  - [ ] Focus restoration after close

- [ ] Testing
  - [ ] Keyboard only (no mouse)
  - [ ] Screen reader (NVDA/JAWS)
  - [ ] axe-core automated tests

- [ ] `npm run build` ✅
- [ ] `npm run lint` ✅

```

---

## 📌 Issue 10-13: Testing & QA

```markdown
# 4.3.10-13: Testing & Quality Assurance

**Story:** Story 4.3 — Referências de Estudos - UI/UX
**Tasks:** 4.3.10, 4.3.11, 4.3.12, 4.3.13, 4.3.14, 4.3.15
**Points:** 4
**Timeline:** Friday 9:00 AM - 5:00 PM

## Description

Comprehensive testing across all devices and quality gates.

## 4.3.10: Desktop Testing

Test on: 1920px, 1440px, 1024px

- [ ] Sidebar renders correctly
- [ ] Add/delete/reorder flows work
- [ ] No layout shift (CLS < 0.1)
- [ ] Tooltips position correctly
- [ ] Lighthouse Performance > 80

## 4.3.11: Tablet Testing

Test on: iPad (768px)

- [ ] Sidebar toggle works
- [ ] Drawer opens/closes
- [ ] Touch targets >= 44x44px
- [ ] No horizontal scroll
- [ ] Lighthouse Performance > 75

## 4.3.12: Mobile Testing

Test on: iPhone (375px, 667px)

- [ ] Modal fullscreen
- [ ] Scrollable list
- [ ] Touch-friendly
- [ ] No layout shift
- [ ] Safe area respected
- [ ] Lighthouse Performance > 70

## 4.3.13: Accessibility Audit

- [ ] axe-core scan (zero violations)
- [ ] Manual keyboard test
- [ ] Screen reader test
- [ ] WCAG AA compliance ✅

## 4.3.14: CodeRabbit Review

- [ ] No SQL injection
- [ ] No XSS vulnerabilities
- [ ] No hardcoded secrets
- [ ] Proper error handling

## 4.3.15: Performance Optimization

- [ ] React.memo on components
- [ ] useCallback for handlers
- [ ] No N+1 queries
- [ ] Debounced search
- [ ] React Profiler clean

## Test Cases Matrix

| Flow | Desktop | Tablet | Mobile |
|------|---------|--------|--------|
| Add reference | ✅ | ✅ | ✅ |
| Delete reference | ✅ | ✅ | ✅ |
| Reorder references | ✅ | ✅ | ❌ (not on mobile) |
| Search modal | ✅ | ✅ | ✅ |
| Error handling | ✅ | ✅ | ✅ |

## Deliverables

- [ ] Test report (screenshots)
- [ ] Performance report
- [ ] Accessibility report
- [ ] Security sign-off
- [ ] All checks ✅

```

---

## 🎯 How to Use These Templates

1. **Go to:** https://github.com/your-repo/issues/new
2. **Copy entire template** (from ```markdown to ``` )
3. **Paste into issue body**
4. **Click "Create issue"**
5. **Assign to yourself** (@dev)
6. **Add to milestone** (Sprint 4)
7. **Add label:** `4.3-reference-links`, `type:implementation`

---

## 📊 Template Summary

| Task | Template | Points | Timeline |
|------|----------|--------|----------|
| 4.3.1 | Design & Types | 2 | Mon 9:30-12:30 |
| 4.3.2 | ReferencesSidebar | 3 | Mon 12:30-5:00 |
| 4.3.3 | AddReferenceModal | 3 | Tue 9:00-1:00 |
| 4.3.4 | useReferences Hook | 3 | Tue 1:00-5:00 |
| 4.3.5 | Delete Flow | 2 | Wed 9:00-11:00 |
| 4.3.6 | Drag-Drop | 3 | Wed 11:00-3:00 |
| 4.3.7 | Mobile Layout | 2 | Thu 9:00-11:00 |
| 4.3.8 | Loading/Error | 2 | Thu 11:00-1:00 |
| 4.3.9 | Accessibility | 2 | Thu 1:00-3:00 |
| 4.3.10-15 | Testing & QA | 4 | Fri 9:00-5:00 |

---

**All templates ready to use. Copy-paste directly into GitHub Issues! 🚀**
