# Phase 2 Test Setup - Parallelization Analysis

**Date**: 2026-01-28
**Status**: Analysis Complete
**Critical Path**: 4 sequential steps → 45-60 minutes
**Parallel Streams**: 2 independent streams → Can overlap 20-25 minutes

---

## Executive Summary

```
┌─────────────────────────────────────────────────────────────┐
│ CRITICAL PATH (Sequential, Must-Do First)                  │
├─────────────────────────────────────────────────────────────┤
│ 1. Install Vitest + Testing Libraries    [5-8 min]         │
│ 2. Create vitest.config.ts               [3-5 min]         │
│ 3. Create test infrastructure setup      [8-12 min]        │
└─────────────────────────────────────────────────────────────┘
                      ↓
         BOTH STREAMS CAN START HERE
         ↙                                    ↘
    ┌────────────────────┐            ┌────────────────────┐
    │ STREAM A: UNIT     │            │ STREAM B: E2E +    │
    │ TESTS              │            │ CI/CD              │
    │ [25-35 min]        │            │ [15-25 min]        │
    └────────────────────┘            └────────────────────┘
         ↓ (after done)                    ↓ (after done)
    [TESTS RUNNING]              [WORKFLOW CREATED]
         ↓                             ↓
    [Unit tests pass]          [E2E tests running]
         ↓                             ↓
         └─────────────┬──────────────┘
                       ↓
              BRANCH PROTECTION
              (Final Step) [2-3 min]
```

---

## 1. CRITICAL PATH (Sequential - Must Execute First)

### Task 1A: Install Vitest + @testing-library/react + @testing-library/jest-dom
- **Duration**: 5-8 minutes
- **Commands**:
  ```bash
  npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom
  ```
- **Deliverable**: Updated `package.json` with test dependencies
- **Blockers**: None (can start immediately)
- **Why First**: All downstream tasks depend on these packages existing

### Task 1B: Create vitest.config.ts
- **Duration**: 3-5 minutes
- **File**: `/Users/tiago/Projects/bible-study/vitest.config.ts`
- **Contents**:
  ```typescript
  import { defineConfig } from 'vitest/config'
  import react from '@vitejs/plugin-react'
  import path from 'path'

  export default defineConfig({
    plugins: [react()],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
      exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  })
  ```
- **Blockers**: Task 1A must complete
- **Why**: Vitest needs this configuration before tests can run

### Task 1C: Create Test Infrastructure (Setup Files, Mocks, Helpers)
- **Duration**: 8-12 minutes
- **Files to create**:
  - `src/test/setup.ts` - Vitest setup with jest-dom matchers
  - `src/test/mocks/supabase.ts` - Mock Supabase client
  - `src/test/mocks/auth-context.ts` - Mock AuthContext provider
  - `src/test/helpers.tsx` - Custom render function with providers
  - `src/test/fixtures.ts` - Test data fixtures (books, studies, etc)

- **Setup.ts example**:
  ```typescript
  import '@testing-library/jest-dom'
  import { expect, afterEach, vi } from 'vitest'
  import { cleanup } from '@testing-library/react'

  afterEach(() => cleanup())

  // Mock Supabase client
  vi.mock('@/lib/supabase/client', () => ({
    supabase: { /* ... */ }
  }))
  ```

- **Blockers**: Task 1B must complete
- **Why**: Tests won't run without setup, mocks, and helper utilities

---

## 2. PARALLEL STREAMS (Can Execute Simultaneously)

### STREAM A: Unit Tests
**Start After**: Critical Path complete
**Duration**: 25-35 minutes
**Parallelization**: Tests can be written independently, run in parallel

#### Task 2A: Write 17 Unit Tests
**Files to create** (can be done in any order or in parallel):

1. `src/hooks/__tests__/useBubbleMenuHandlers.test.ts` - 2-3 min
2. `src/components/editor/__tests__/editor-link-click.test.ts` - 3-4 min
3. `src/lib/__tests__/mock-data.test.ts` - 2-3 min
4. `src/hooks/__tests__/useStudies.test.ts` - 4-5 min
5. `src/hooks/__tests__/useBacklog.test.ts` - 4-5 min
6. `src/hooks/__tests__/useTags.test.ts` - 3-4 min
7. `src/hooks/__tests__/useGraph.test.ts` - 3-4 min
8. `src/contexts/__tests__/AuthContext.test.tsx` - 3-4 min
9. `src/lib/__tests__/design-tokens.test.ts` - 2-3 min
10. `src/components/dashboard/__tests__/BookGrid.test.tsx` - 3-4 min
11. `src/components/dashboard/__tests__/ChapterView.test.tsx` - 3-4 min
12. `src/components/dashboard/__tests__/Sidebar.test.tsx` - 3-4 min
13. `src/components/ui/__tests__/Button.test.tsx` - 2-3 min
14. `src/components/ui/__tests__/Card.test.tsx` - 2-3 min
15. `src/lib/__tests__/utils.test.ts` - 2-3 min
16. `src/components/editor/__tests__/BubbleMenu.test.tsx` - 3-4 min
17. `src/components/editor/__tests__/SlashMenu.test.tsx` - 3-4 min

**Run Command**:
```bash
npm run test -- --run --reporter=verbose
# OR watch mode during development
npm run test -- --watch
```

**Can be parallelized**: ✅ YES
- Each test file is independent
- Can write tests 1-5 in parallel group A
- Write tests 6-11 in parallel group B
- Write tests 12-17 in parallel group C
- Or distribute across team members

**Blockers**: Critical Path complete
**Expected Outcome**: 17 test files, all passing

---

### STREAM B: E2E Tests + CI/CD Setup
**Start After**: Critical Path complete
**Duration**: 15-25 minutes
**Note**: Can start BEFORE Unit Tests complete (independent path)

#### Task 2B: Write 5 E2E Tests (Playwright)
**Files to create** (can be done in any order):

1. `e2e/dashboard.spec.ts` - Books grid, search, chapter view - 4-5 min
2. `e2e/editor.spec.ts` - Editor create, edit, save, delete - 5-6 min
3. `e2e/authentication.spec.ts` - Login, signup, logout - 4-5 min
4. `e2e/graph.spec.ts` - Graph visualization, zoom, navigation - 3-4 min
5. `e2e/tags.spec.ts` - Create, edit, delete tags - 3-4 min

**Test infrastructure** (Playwright already installed):
- Uses `playwright.config.ts` (if exists, or create minimal)
- Can reuse fixtures from `src/test/fixtures.ts`

**Run Command**:
```bash
npx playwright test e2e/
# OR headed mode for development
npx playwright test e2e/ --headed
```

**Can be parallelized**: ✅ YES
- Each E2E test is independent
- Can run tests 1-2 in group A (ui tests)
- Tests 3-4 in group B (auth + graph)
- Test 5 in group C (tags)
- Playwright naturally parallelizes via workers

**Blockers**: Critical Path complete
**Expected Outcome**: 5 E2E test files, all passing

#### Task 2C: Create CI/CD Workflow (.github/workflows/test.yml)
**Duration**: 8-12 minutes
**File**: `/Users/tiago/Projects/bible-study/.github/workflows/test.yml`

**Contents**:
```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: npm ci
      - run: npm run test -- --run

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npx playwright test

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: npm ci
      - run: npm run lint
```

**Can start**: After Critical Path complete, BUT doesn't depend on tests existing yet
- Can create workflow structure while tests are being written
- Tests will run on next push/PR

**Blockers**: None (workflow file can exist before tests)
**Expected Outcome**: Workflow file committed, ready to execute

---

## 3. FINAL SEQUENTIAL STEP (After Both Streams)

### Task 3: Configure GitHub Branch Protection Rules
- **Duration**: 2-3 minutes
- **Steps**:
  1. Go to: `Settings → Branches → Add rule`
  2. Pattern: `main` and `develop`
  3. Require:
     - ✅ PR reviews (1 approval)
     - ✅ Status checks pass (from test.yml)
     - ✅ Branches up to date
     - ✅ Dismiss stale reviews
  4. Require status checks:
     - `unit-tests` (from test.yml)
     - `e2e-tests` (from test.yml)
     - `lint` (from test.yml)

**Blockers**: Test.yml workflow must be committed and executed once
**Expected Outcome**: Branch protection active, enforces tests on PRs

---

## Timeline Visualization

### Optimal Execution Plan (45-60 minutes total)

```
TIME    CRITICAL PATH           STREAM A (UNIT)    STREAM B (E2E+CI/CD)
───────────────────────────────────────────────────────────────────
0:00    [INSTALL VITEST]        (WAITING)          (WAITING)
│       └─ 5-8 min              │                  │
│                               │                  │
0:08    [CREATE CONFIG]         (WAITING)          (WAITING)
│       └─ 3-5 min              │                  │
│                               │                  │
0:13    [CREATE INFRASTRUCTURE] (WAITING)          (WAITING)
│       └─ 8-12 min             │                  │
│                               │                  │
0:25    [DONE - CRITICAL PATH]  │                  │
│       ├──────────────────────▶│                  │
│       └──────────────────────────────────────────▶
│                               │                  │
0:25    ░░░░░░░░░░░░░░░░░░░░░░ [START UNIT]      [START E2E+CI]
│                               ├─ 25-35 min       ├─ 15-25 min
│                               │                  │
0:50    ░░░░░░░░░░░░░░░░░░░░░░ [UNIT DONE]       [E2E+CI DONE]
│       (some unit tests done)   │                  │
│       (E2E still running)      │                  │
│                               │                  │
1:00    ░░░░░░░░░░░░░░░░░░░░░░ [ALL TESTS OK]    [WORKFLOW ACTIVE]
│                               │                  │
1:02    ─────────────────────────────────────────▶ [BRANCH PROTECTION]
│                               │                  └─ 2-3 min
│                               │
1:05    ✓ COMPLETE             ✓ 17 tests       ✓ Workflow + Rules

Legend:
  ▓▓▓ = Can execute in parallel
  ─── = Sequential dependency
  ✓   = Complete

TOTAL TIME: 48 minutes (optimistic case)
           65 minutes (pessimistic case)
```

---

## Parallelization Breakdown

### Can Run in Parallel (Independent)
1. ✅ **Write Unit Tests (Task 2A)** - All 17 tests are independent
   - Supabase mocks isolate them from API
   - Each hook/component has own test file
   - Can distribute across team: 5 tests/person = 3x faster

2. ✅ **Write E2E Tests (Task 2B)** - All 5 tests are independent
   - Playwright runs tests in parallel by default
   - Each spec file tests different feature area
   - Minimal dependency on each other

3. ✅ **Create CI/CD Workflow (Task 2C)** - Can start immediately after Critical Path
   - Doesn't wait for tests to exist
   - Can be committed before tests written
   - GitHub will queue job until tests added

### CANNOT Parallelize (Sequential Blockers)
1. ❌ Install Vitest → before Config
   - Config imports `defineConfig` from vitest
   - Package must exist in `node_modules`

2. ❌ Config → before Test Infrastructure
   - Setup files reference `vitest` imports
   - Config file validates via `vitest` CLI

3. ❌ Infrastructure → before Writing Tests
   - Tests import mocks from `src/test/mocks/`
   - Tests use `describe`, `it`, `expect` from vitest setup

4. ❌ Test.yml created → before Branch Protection
   - GitHub must recognize workflow first
   - Protection rules reference job IDs from workflow

---

## Critical Dependencies Map

```
Install Vitest (1A)
    ↓
    └─→ Create Config (1B)
             ↓
             └─→ Create Infrastructure (1C)
                      ↓
          ┌───────────┴───────────┐
          ↓                       ↓
    Write 17 Unit Tests    Write 5 E2E Tests
    (Task 2A)             (Task 2B)
    ├─ 17 files              ├─ 5 files
    └─ Can split 3 ways      └─ Can run parallel
          ↓                       ↓
    Run: npm test           Create CI/CD (2C)
    Expected: All pass      ├─ 1 workflow file
         ↓                   └─ Ready to merge
         │                        ↓
         │                   Run: git push
         │                   Check: Actions tab
         └─────────┬─────────┘
                   ↓
            Both Streams Done
            (Unit + E2E + CI/CD)
                   ↓
            Configure Branch Protection (Task 3)
                   ↓
            ✓ COMPLETE - All quality gates active
```

---

## Execution Recommendations

### Option A: Solo Developer (Sequential)
**Total Time**: 60-65 minutes
```
1. Install Vitest (5-8 min)
2. Create Config (3-5 min)
3. Create Infrastructure (8-12 min)
4. Write Unit Tests (25-35 min)
5. Write E2E Tests (15-20 min)
6. Create CI/CD Workflow (8-10 min)
7. Configure Branch Protection (2-3 min)
Total: ~60-65 min
```

### Option B: 2-Person Team (Parallel After Critical Path)
**Total Time**: 45-50 minutes
```
Person A (Leader):
- 0:00  Install Vitest (5-8 min)
- 0:08  Create Config (3-5 min)
- 0:13  Create Infrastructure (8-12 min)
- 0:25  Write Unit Tests 1-6 (10-15 min) [while B writes E2E]

Person B (Developer):
- 0:25  Write E2E Tests 1-3 (8-12 min) [while A writes Unit]
- 0:33  Create CI/CD Workflow (8-10 min)
- 0:43  Review Unit Tests
- 0:50  Configure Branch Protection (2-3 min)

Total: ~50 minutes
```

### Option C: 3-Person Team (Optimal Parallelization)
**Total Time**: 40-45 minutes
```
Person A (Installer/Config):
- 0:00  Install Vitest (5-8 min)
- 0:08  Create Config (3-5 min)
- 0:13  Create Infrastructure (8-12 min)
- 0:25  Review all tests

Person B (Unit Tests):
- 0:25  Write Unit Tests 1-9 (12-18 min)
- 0:40  Write Unit Tests 10-17 (12-18 min)

Person C (E2E + CI/CD):
- 0:25  Write E2E Tests 1-3 (8-12 min)
- 0:33  Create CI/CD Workflow (8-10 min)
- 0:41  Write E2E Tests 4-5 (6-8 min)
- 0:48  Configure Branch Protection (2-3 min)

Total: ~48 minutes
All 17 unit + 5 E2E tests done in parallel
Both streams finish ~same time
```

---

## Quality Checkpoints

### After Critical Path (Task 1C):
```bash
✓ npm ls vitest
✓ npm ls @testing-library/react
✓ npm ls @testing-library/jest-dom
✓ vitest --version
✓ cat vitest.config.ts (exists)
✓ cat src/test/setup.ts (exists)
✓ cat src/test/mocks/supabase.ts (exists)
```

### After Unit Tests (Task 2A):
```bash
✓ npm run test -- --run
✓ All 17 test files run
✓ All tests PASS or FAIL clearly (no hanging)
✓ npm run test -- --coverage (optional, shows coverage %)
```

### After E2E Tests (Task 2B):
```bash
✓ npx playwright test e2e/ --list (shows all 5 specs)
✓ npx playwright test e2e/ --headed (visual check if needed)
✓ All 5 tests PASS or clear failure reason
```

### After CI/CD (Task 2C):
```bash
✓ cat .github/workflows/test.yml (exists)
✓ git push (workflow triggered in GitHub Actions)
✓ Actions tab shows 3 jobs: unit-tests, e2e-tests, lint
✓ All jobs pass (green checkmarks)
```

### After Branch Protection (Task 3):
```bash
✓ Settings → Branches → branch rule "main" exists
✓ Status checks required: unit-tests, e2e-tests, lint
✓ PR creation: requires status checks to pass
✓ Direct push to main: BLOCKED (can only merge via PR)
```

---

## Risk Mitigation

### Potential Blockers & Solutions

| Blocker | Symptom | Solution |
|---------|---------|----------|
| **Missing @vitejs/plugin-react** | `vitest.config.ts` fails to load | `npm install --save-dev @vitejs/plugin-react` |
| **jsdom not installed** | Tests fail with "document is not defined" | `npm install --save-dev jsdom` |
| **Circular imports in mocks** | Tests hang or timeout | Check `src/test/mocks/` for imports from `src/components/` |
| **Playwright browsers missing** | E2E tests hang | `npx playwright install --with-deps` |
| **Node version mismatch** | Module resolution errors | Use `node --version` (should be 22.x) |
| **ESM/CJS mismatch** | "Cannot use import statement" | Update `vitest.config.ts` to handle module type |
| **AuthContext not exported** | Mock fails to import | Check `src/contexts/AuthContext.tsx` exports `useAuth` |

---

## Recommended Parallel Execution Matrix

```
TASK DEPENDENCIES (Critical Path First)

├─ [CRITICAL PATH] ──────────────────────────┐
│  ├─ Install Vitest (1A)        [5-8m]      │
│  ├─ Create Config (1B)         [3-5m]      │
│  └─ Create Infrastructure (1C) [8-12m]     │
└────────────────────────────────┬───────────┘
                                 ↓
          ┌──────────────────────┴──────────────────────┐
          ↓                                              ↓
    [STREAM A - UNIT TESTS]           [STREAM B - E2E + CI/CD]
    ├─ Task 2A: Write 17 tests        ├─ Task 2B: Write 5 E2E tests
    │  └─ [25-35 min, PARALLEL OK]    │  └─ [15-20 min, PARALLEL OK]
    └─────────────┬────────────────────└──────────┬──────────────
                  ↓                                ↓
             Tests: PASS              Task 2C: Create CI/CD
                                      └─ [8-10 min, can overlap]
                                           ↓
                  ├──────────────────────────┘
                  ↓
            Merge & Verify:
            - All tests passing
            - CI/CD workflow active
            - Code on main/develop
                  ↓
            [FINAL] Task 3: Branch Protection [2-3m]
                  ↓
            ✓ All quality gates ACTIVE
```

---

## Summary Table

| Phase | Task | Duration | Parallelizable | Start After |
|-------|------|----------|-----------------|-------------|
| **1-Critical** | Install Vitest | 5-8m | ❌ | Immediate |
| **1-Critical** | Config | 3-5m | ❌ | Phase 1A |
| **1-Critical** | Infrastructure | 8-12m | ❌ | Phase 1B |
| **2A-Unit** | 17 Unit Tests | 25-35m | ✅ YES | Phase 1C |
| **2B-E2E** | 5 E2E Tests | 15-20m | ✅ YES | Phase 1C |
| **2C-CI/CD** | Create Workflow | 8-10m | ✅ YES | Phase 1C |
| **3-Final** | Branch Protection | 2-3m | ❌ | Phase 2C |
| **TOTAL** | | **45-60m** | ✅ 60% parallelizable | — |

---

## Key Insights

1. **Critical Path is Short**: 16-21 minutes of truly sequential work
2. **Parallel Potential**: 40-55 minutes can run in 2 streams simultaneously
3. **Time Saved**: ~25 minutes if you parallelize (team) vs solo
4. **Scalability**: 3-person team saves ~15-20 minutes vs 2-person team
5. **No Test Dependencies**: Each unit test is isolated; each E2E test independent
6. **Workflow is "Free"**: CI/CD workflow can be created in parallel, doesn't block tests

---

## Next Steps

1. **Start Critical Path NOW** - Don't wait
2. **After Critical Path (step 3)**: Split team into Stream A (Unit) and Stream B (E2E)
3. **During execution**: Stream B creates workflow file while Stream A finalizes tests
4. **After both complete**: One person configures branch protection (2-3 min)
5. **Verify**: All workflows pass in GitHub Actions before merging to main

