# Story 4.3 Dev Kickoff
## Referências de Estudos - UI/UX

**Prepared by:** Morgan (Product Manager)
**For:** @dev (Dex)
**Date:** 2026-01-28
**Status:** 🚀 READY TO START
**Est. Timeline:** 5 days | 8 story points

---

## ⚡ Quick Start (READ FIRST)

### What You're Building
A **reference sidebar** that lets users view, add, remove, and reorder links between their Bible study notes. Think of it like Obsidian's backlinks panel.

### Architecture Overview
```
User highlights text → Click "Referenciar" → Modal opens → Select study → Link created
                                                                           ↓
                                     ReferencesSidebar updates automatically
```

### Tech Stack
- **Components:** React + TypeScript + Tailwind + shadcn/ui
- **State:** Custom `useReferences` hook (Supabase)
- **Drag-Drop:** `@dnd-kit` (install today)
- **Styling:** `design-tokens.ts` (already exists)

### Why This Story Matters
User research shows that **reference management is critical** for building a knowledge graph. Your implementation unblocks future features (grafo visualization, search by connections, etc).

---

## 📅 DAY 1 CHECKLIST (Monday)

**Goal:** Get visual feedback + types defined. By EOD, you should see ReferencesSidebar rendering statically.

### ✅ Pre-Work (9:00 AM - 9:30 AM)

- [ ] **Read Story & Plan**
  - [ ] Read `story-4.3-reference-links-ui.md` (full requirements) — 10 min
  - [ ] Read `story-4.3-implementation-plan.md` (technical plan) — 15 min
  - [ ] Skim this kickoff document — 5 min

- [ ] **Setup Environment**
  - [ ] Pull latest `main` branch: `git pull origin main`
  - [ ] Install new dependency: `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`
  - [ ] Verify build: `npm run build` ✅
  - [ ] Start dev server: `npm run dev`

- [ ] **Review Current Code**
  - [ ] Check `src/hooks/useReferences.ts` (partially implemented)
  - [ ] Check `src/lib/design-tokens.ts` (colors, spacing, shadows)
  - [ ] Check `src/components/ui/` (shadcn components you'll use)
  - [ ] Check existing editor components for patterns

### ✅ Task 4.3.1: Design & TypeScript Types (9:30 AM - 12:30 PM)

**Deliverable:** Type definitions + component structure

**Step 1: Create Types File**
```bash
touch src/types/reference.ts
```

**Step 2: Add Type Definitions**
```typescript
// src/types/reference.ts

export interface Reference {
  id: string;
  source_study_id: string;
  target_study_id: string;
  user_id: string;
  display_order: number;
  created_at: string;

  // Denormalized for display (optional)
  target_study?: {
    id: string;
    title: string;
    book_id: string;
    chapter: number;
    content?: string; // snippet
  };
}

export interface ReferenceCardProps {
  reference: Reference;
  onDelete?: (referenceId: string) => void | Promise<void>;
  onSelect?: (reference: Reference) => void;
  isDragging?: boolean;
  isLoading?: boolean;
}

export interface ReferencesSidebarProps {
  references: Reference[];
  loading: boolean;
  error?: string | null;
  onAddReference: () => void;
  onDeleteReference: (referenceId: string) => Promise<boolean>;
  onReorderReference?: (referenceId: string, newOrder: number) => Promise<boolean>;
}

export interface AddReferenceModalProps {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onSelect: (targetStudyId: string) => Promise<boolean>;
  currentStudyId: string;
  existingReferenceIds?: string[];
}
```

**Step 3: Design Component Structure**
```
ReferencesSidebar (container)
├─ Header (with collapse button)
├─ ReferenceList (or) SkeletonList (or) EmptyState (or) ErrorState
│  └─ ReferenceCard (draggable)
│     ├─ Title
│     ├─ Book/Chapter
│     └─ DeleteButton

AddReferenceModal (dialog)
├─ SearchInput
├─ StudyList
│  └─ StudyItem (clickable)
└─ Buttons (Cancel, Add)
```

**Step 4: Document Visual States**
Create a simple design doc (text is fine):

```
REFERENCE CARD STATES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Default:
  Border: 1px solid gray-200
  BG: white
  Text: gray-900
  Delete button: hidden (shown on hover)

Hover:
  Border: 1px solid gray-300
  BG: gray-50
  Delete button: visible (red)

Dragging:
  Opacity: 0.7
  Shadow: sm
  Cursor: grabbing

Error (invalid reference):
  Border: 1px solid red-300
  BG: red-50
  Text: red-700
  Delete button: always visible

Mobile (<768px):
  Full width
  Larger touch targets (44x44px)
```

**Checklist:**
- [ ] `src/types/reference.ts` created with all interfaces
- [ ] Component structure documented
- [ ] Visual states defined
- [ ] Commit: `feat(types): add reference type definitions`

**Time Estimate:** 3 hours (design decisions take time)

---

### ✅ Task 4.3.2: Static ReferencesSidebar (12:30 PM - 5:00 PM)

**Deliverable:** ReferencesSidebar component (props-driven, no data yet)

**Step 1: Create ReferenceCard Component**
```bash
touch src/components/Editor/ReferenceCard.tsx
```

**Code Template:**
```typescript
// src/components/Editor/ReferenceCard.tsx
'use client';

import React from 'react';
import { Trash2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { COLORS } from '@/lib/design-tokens';
import type { ReferenceCardProps } from '@/types/reference';

export const ReferenceCard = React.memo(function ReferenceCard({
  reference,
  onDelete,
  isDragging,
  isLoading,
}: ReferenceCardProps) {
  const [showDelete, setShowDelete] = React.useState(false);

  return (
    <div
      className={cn(
        'flex items-center gap-2 p-3 rounded-md border',
        'transition-all duration-200 cursor-grab',
        isDragging && 'opacity-70 shadow-sm cursor-grabbing',
        showDelete && 'bg-red-50 border-red-300',
        !showDelete && 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      )}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
      role="article"
      aria-label={`Reference to ${reference.target_study?.title || 'Unknown'}`}
    >
      {/* Grip Handle (for drag-drop) */}
      <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0 hover:text-gray-600" />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 truncate">
          {reference.target_study?.title || 'Untitled'}
        </h4>
        <p className="text-xs text-gray-500">
          {reference.target_study?.book_id} {reference.target_study?.chapter}
        </p>
      </div>

      {/* Delete Button */}
      <button
        onClick={() => onDelete?.(reference.id)}
        disabled={isLoading}
        className={cn(
          'flex-shrink-0 p-1.5 rounded transition-colors',
          'text-red-600 hover:text-red-700 hover:bg-red-50',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          showDelete ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        )}
        aria-label="Delete reference"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
});
```

**Step 2: Create ReferencesSidebar Component**
```bash
touch src/components/Editor/ReferencesSidebar.tsx
```

**Code Template:**
```typescript
// src/components/Editor/ReferencesSidebar.tsx
'use client';

import React from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { COLORS } from '@/lib/design-tokens';
import { Button } from '@/components/ui/button';
import { ReferenceCard } from './ReferenceCard';
import type { ReferencesSidebarProps } from '@/types/reference';

export function ReferencesSidebar({
  references,
  loading,
  error,
  onAddReference,
  onDeleteReference,
}: ReferencesSidebarProps) {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-2 font-semibold text-gray-900 hover:opacity-80 transition-opacity"
          aria-expanded={!collapsed}
        >
          <ChevronDown
            className={cn('w-4 h-4 transition-transform', collapsed && '-rotate-90')}
          />
          Referências ({references.length})
        </button>

        <Button
          onClick={onAddReference}
          size="sm"
          variant="ghost"
          className="bg-blue-600 hover:bg-blue-700 text-white hover:text-white"
          title="Adicionar referência"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <SkeletonReferences count={4} />
          ) : error ? (
            <ErrorState />
          ) : references.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-2">
              {references.map((ref) => (
                <ReferenceCard
                  key={ref.id}
                  reference={ref}
                  onDelete={onDeleteReference}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Empty State
function EmptyState() {
  return (
    <div className="text-center py-8 text-gray-500">
      <p className="text-sm">Nenhuma referência ainda</p>
      <p className="text-xs text-gray-400 mt-1">
        Selecione texto e clique em "Referenciar"
      </p>
    </div>
  );
}

// Error State
function ErrorState() {
  return (
    <div className="text-center py-8 text-red-500">
      <p className="text-sm">Erro ao carregar referências</p>
      <Button size="sm" variant="outline" className="mt-2">
        Tentar novamente
      </Button>
    </div>
  );
}

// Skeleton Loader
function SkeletonReferences({ count }: { count: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-12 bg-gray-200 rounded-md animate-pulse"
        />
      ))}
    </div>
  );
}
```

**Step 3: Test Component Rendering**
- [ ] Import ReferencesSidebar in StudyPageClient
- [ ] Pass mock data: `references={[{ id: '1', target_study: { title: 'Genesis 1:1', ... } }]}`
- [ ] Verify sidebar renders without errors
- [ ] Check styling with design tokens

**Step 4: Refine Styling**
- [ ] Use `design-tokens.ts` colors instead of hardcoded values
- [ ] Update hover/active states to match design system
- [ ] Test dark mode (if applicable)
- [ ] Mobile: Hide sidebar (will add toggle in day 4)

**Checklist:**
- [ ] `src/components/Editor/ReferenceCard.tsx` created
- [ ] `src/components/Editor/ReferencesSidebar.tsx` created
- [ ] Mock data renders correctly
- [ ] Styling uses design tokens
- [ ] Build passes: `npm run build` ✅
- [ ] Lint passes: `npm run lint` ✅
- [ ] Commit: `feat(components): create ReferencesSidebar & ReferenceCard`

**Time Estimate:** 4-5 hours

---

## 📝 END OF DAY 1 CHECKLIST

By 5:00 PM Friday, you should have:

- [ ] ✅ Environment set up (dependencies installed)
- [ ] ✅ Types defined (`src/types/reference.ts`)
- [ ] ✅ ReferenceCard component working
- [ ] ✅ ReferencesSidebar component rendering
- [ ] ✅ Mock data displays correctly
- [ ] ✅ Build passing (`npm run build`)
- [ ] ✅ Lint passing (`npm run lint`)
- [ ] ✅ Git commit pushed: `feat(components): create Reference...`

**Expected Output:**
```
Sidebar with 3 sample references:
┌─────────────────────────────────────┐
│ ▼ Referências (3)        [+]        │
├─────────────────────────────────────┤
│ ├─ 👇 Genesis 1:1        [🗑]       │
│ ├─ 👇 Exodus 3:14        [🗑]       │
│ └─ 👇 John 14:6          [🗑]       │
│                                     │
│ Nenhuma referência ainda            │
│ (when empty)                        │
└─────────────────────────────────────┘
```

---

## 🎯 DAY 2 PREVIEW (Don't Start Yet!)

**Morning:** Task 4.3.3 — AddReferenceModal with search
**Afternoon:** Task 4.3.4 — Update useReferences hook with add/delete/reorder

By EOD Day 2, you'll have full CRUD working. Then Days 3-5 are polish.

---

## 🔗 Useful Links & Resources

### Code References
- **Design Tokens:** `src/lib/design-tokens.ts` (colors, spacing, typography)
- **Button Component:** `src/components/ui/button.tsx` (shadcn)
- **Dialog/Modal:** `src/components/ui/dialog.tsx` (Radix)
- **Existing Editor:** `src/components/Editor/index.tsx` (pattern to follow)
- **Existing Hook:** `src/hooks/useStudies.ts` (pattern for useReferences)

### Documentation
- **Story Requirements:** `docs/stories/story-4.3-reference-links-ui.md`
- **Tech Plan:** `docs/stories/story-4.3-implementation-plan.md`
- **TypeScript Guide:** `src/types/` (existing types)

### Dependencies
```bash
# Already installed
- @tiptap/react (editor)
- @radix-ui/* (modals, dialogs)
- sonner (toasts)
- lucide-react (icons)
- tailwindcss (styling)

# Installed today
- @dnd-kit/core (drag-drop)
- @dnd-kit/sortable
- @dnd-kit/utilities
```

---

## 🐛 Common Pitfalls (Avoid These!)

❌ **Mistake 1:** Not using design tokens for colors
```typescript
// ❌ WRONG
className="bg-blue-600 text-white"

// ✅ RIGHT
className={cn(COLORS.primary.default, COLORS.neutral.text.default)}
```

❌ **Mistake 2:** Forgetting to memoize components
```typescript
// ❌ WRONG
export function ReferenceCard(props) { ... }

// ✅ RIGHT
export const ReferenceCard = React.memo(function ReferenceCard(props) { ... })
```

❌ **Mistake 3:** Not handling loading states
```typescript
// ❌ WRONG - user sees nothing while loading
{loading && <div>Loading...</div>}

// ✅ RIGHT - skeleton placeholder
{loading && <SkeletonReferences count={4} />}
```

❌ **Mistake 4:** Hardcoding strings instead of aria-labels
```typescript
// ❌ WRONG
<button>X</button>

// ✅ RIGHT
<button aria-label="Delete reference"><Trash2 /></button>
```

❌ **Mistake 5:** Using `any` type
```typescript
// ❌ WRONG
const ref: any = ...

// ✅ RIGHT
const ref: Reference = ...
```

---

## 💬 How to Unblock Me

If you get stuck:

1. **Quick Questions:** Ping me in chat (1-2 min answers)
2. **Design Decisions:** Open a PR draft, I'll review ASAP
3. **Type Issues:** Check `src/types/` for patterns
4. **Styling Issues:** Reference `design-tokens.ts`
5. **Performance:** Profile with React DevTools Profiler first

---

## ✅ Approval & Sign-Off

**Story 4.3 Status:** 🚀 **APPROVED - READY TO START**

**PM:** Morgan
**Kickoff Date:** 2026-01-28
**Target Completion:** 2026-02-02 (5 business days)

---

## 📋 Next Steps (After You Read This)

1. [ ] Read this entire kickoff document
2. [ ] Start pre-work setup (git pull, npm install)
3. [ ] Slack/chat me when ready to start Task 4.3.1
4. [ ] I'll be available for daily standups at 10:00 AM
5. [ ] End-of-day syncs to unblock & review progress

**Ready to start? Say "KICKOFF CONFIRMED" and I'll create the GitHub issues.**

---

## 📞 Contact & Support

- **PM (Morgan):** Sprint planning, backlog refinement, unblocking
- **QA (Quinn):** Testing strategy, accessibility audit
- **Architecture (Aria):** Technical decisions, performance guidance
- **DevOps (Gage):** Build/deploy issues, CI/CD pipeline

---

**Good luck, @dev! 🚀 Let's build amazing reference features.**

— Morgan, orquestrando o sistema 📊
