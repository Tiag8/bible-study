# Definition of Done - Feature Completion Checklist

**Purpose**: Ensure every feature is fully implemented, tested, and ready for production before merge to main

**Apply to**: All Pull Requests marked as "Feature", "Enhancement", or "Critical Fix"

---

## Tier 1: Must Have (Blocking)

These MUST be complete before merge. PR is blocked if any FAIL.

### Code Completeness

- [ ] **Feature fully implemented** - All acceptance criteria from user story/requirements met
  - [ ] User-facing UI works end-to-end
  - [ ] Backend logic complete (database, API, business rules)
  - [ ] No TODO/FIXME comments in production code
  - [ ] Error handling implemented (not just happy path)

- [ ] **No debugging code** - All console.logs, debugger statements removed
  - [ ] `console.log()` only in development mode checks
  - [ ] No `debugger;` statements
  - [ ] No commented-out code blocks

### Testing (Critical Path)

- [ ] **Critical path has E2E test** - Happy path scenario automated
  - Feature Type | Test Coverage |
    |---|---|
    | User navigation | 1 E2E test min |
    | Database operation | 1 integration test min |
    | API endpoint | 1 unit test min |
    | UI component | 1 unit test min |
    | Cross-system (like internal links) | 3+ E2E tests min |

- [ ] **Tests pass locally** - Run before push
  ```bash
  npm run test           # Unit tests
  npm run test:e2e       # E2E tests
  npm run test:coverage  # Check coverage
  ```

- [ ] **Manual test report** - QA tested critical scenarios
  - [ ] Test case results documented (PASS/FAIL with screenshots)
  - [ ] At least 3 manual scenarios tested
  - [ ] No critical bugs found

### Code Quality

- [ ] **Linting passes** - No ESLint or TypeScript errors
  ```bash
  npm run lint
  npm run build  # TypeScript check
  ```

- [ ] **No console warnings** - Browser dev tools clean
  - [ ] No React warnings about missing keys
  - [ ] No Tailwind warnings
  - [ ] No font/resource loading errors

- [ ] **Security validation** - No new vulnerabilities introduced
  - [ ] No hardcoded secrets (API keys, passwords)
  - [ ] SQL injection risks assessed (if database changes)
  - [ ] XSS risks assessed (if handling user input)
  - [ ] CORS/authentication properly handled

### Database

- [ ] **Migrations applied and tested**
  ```bash
  # Applied to local Supabase instance
  npm run db:migrate
  ```

- [ ] **RLS policies reviewed** - If new tables/records accessed
  - [ ] Policies restrict to authenticated users
  - [ ] User isolation enforced (user_id filters)
  - [ ] No data leakage between users

- [ ] **Schema changes documented** - If modifying database
  - [ ] Migration file has comment block explaining changes
  - [ ] Backwards compatibility verified (if applicable)

### Documentation

- [ ] **Code comments added** - For complex logic
  - [ ] Non-obvious algorithms explained
  - [ ] API contracts documented (params, return types)
  - [ ] Edge cases noted

- [ ] **README/docs updated** - If feature affects setup
  - [ ] New environment variables documented
  - [ ] New dependencies listed
  - [ ] Breaking changes flagged

---

## Tier 2: Should Have (Review Focus)

These should be complete. PR can proceed if some issues, but code review focuses here.

### Testing Coverage

- [ ] **Reasonable test coverage** - 60%+ on changed files
  ```bash
  npm run test:coverage
  # Check report: coverage/ folder
  ```

- [ ] **Edge cases tested** - Not just happy path
  - [ ] Empty/null inputs
  - [ ] Boundary conditions
  - [ ] Error scenarios
  - [ ] Concurrent operations (if applicable)

- [ ] **No flaky tests** - Tests pass consistently
  - [ ] No race conditions
  - [ ] No hardcoded timeouts (use `waitFor`)
  - [ ] Proper test data setup

### Performance

- [ ] **No N+1 queries** - If database queries added
  - [ ] Use relationships/joins where needed
  - [ ] Consider query batching
  - [ ] Profile slow queries (Supabase Dashboard)

- [ ] **No memory leaks** - If using useEffect/listeners
  - [ ] Cleanup functions implemented
  - [ ] Event listeners removed
  - [ ] Timers cleared

- [ ] **Responsive design** - Works on mobile
  - [ ] Tested on 375px (mobile) viewport
  - [ ] Touch targets ≥ 44px
  - [ ] No horizontal scroll on mobile

### Accessibility (WCAG AA)

- [ ] **Color contrast sufficient** - 4.5:1 for text
  - [ ] Use WebAIM contrast checker
  - [ ] Test with ColorOracle (color blindness simulator)

- [ ] **Keyboard navigable** - All interactive elements
  - [ ] Tab order logical
  - [ ] No keyboard traps
  - [ ] Focus indicators visible

- [ ] **Semantic HTML** - Proper tags and ARIA
  - [ ] `<button>` for buttons (not `<div onClick>`)
  - [ ] `<a>` for links
  - [ ] Form labels associated
  - [ ] `aria-label` for icon-only buttons

---

## Tier 3: Nice to Have (Enhancement)

These are optional but encouraged.

- [ ] Analytics/tracking added (if user behavior feature)
- [ ] Error boundary added (if new component)
- [ ] Loading skeleton implemented (for async operations)
- [ ] Storybook stories added (for reusable components)
- [ ] Sentry error capture (for critical operations)
- [ ] Performance metrics logged (for performance-critical features)

---

## Pre-Merge Checklist (Use Before Creating PR)

**Developer**: Run this before pushing to GitHub

```bash
# 1. Run all tests
npm run test              # Unit tests
npm run test:e2e          # E2E tests
npm run test:coverage     # Coverage report

# 2. Check linting
npm run lint              # ESLint
npm run build             # TypeScript

# 3. Visual check
npm run dev               # Start dev server
# Manually test critical paths in browser
# Open DevTools and check for errors/warnings

# 4. Database changes
# If applicable, test migrations locally
npm run db:migrate
npm run db:seed           # If applicable

# 5. Security check
# Review any new auth, database queries, or user input

# If any FAIL, fix before pushing
```

**Checklist** (Copy-paste into PR description):

```markdown
## Pre-Merge Checklist ✅

### Tier 1: Must Have
- [ ] Feature fully implemented (all acceptance criteria met)
- [ ] No debugging code (console.logs, debuggers)
- [ ] Critical path has E2E test
- [ ] Manual test report: Test Cases X-Y (PASS/FAIL)
- [ ] Linting passes (`npm run lint`)
- [ ] TypeScript compiles (`npm run build`)
- [ ] Security validated (no hardcoded secrets, RLS checked)
- [ ] Tests pass locally (`npm run test`)

### Tier 2: Should Have
- [ ] Test coverage 60%+ on changed files
- [ ] Edge cases tested (empty, null, boundary, error)
- [ ] No N+1 queries / memory leaks
- [ ] Responsive design (mobile tested)
- [ ] WCAG AA accessibility (contrast, keyboard, semantic)

### Tier 3: Nice to Have
- [ ] Analytics events added
- [ ] Storybook stories added
- [ ] Performance metrics logged

**Test Results Summary**:
- Unit tests: X passed, 0 failed
- E2E tests: Y passed, 0 failed
- Manual tests: Z scenarios tested, all PASS

**Blockers**: [None / List any known issues]
```

---

## Code Review Checklist (Use When Reviewing PR)

**Reviewer**: Apply this before approving

### Functionality Review

- [ ] Feature works as described in PR/story
  - Manually test critical paths
  - Verify database changes saved correctly
  - Check error messages are user-friendly

- [ ] No regression
  - Does it break existing features?
  - Test related features

- [ ] Code is maintainable
  - Clear variable names
  - Functions have single responsibility
  - Comments explain "why" not "what"

### Testing Review

- [ ] Tests cover critical paths
  - [ ] Happy path tested
  - [ ] Error scenarios tested
  - [ ] Edge cases covered

- [ ] Tests are not flaky
  - [ ] No hardcoded waits (`await new Promise(resolve => setTimeout(...))`)
  - [ ] Use `waitFor` for async operations
  - [ ] Proper test data isolation

### Security Review

- [ ] No hardcoded secrets
- [ ] User data properly authenticated
- [ ] Database queries use parameterization (Supabase handles this)
- [ ] RLS policies reviewed (if applicable)
- [ ] No XSS vulnerabilities (DOMPurify used if HTML input)
- [ ] No SQL injection risks

### Performance Review

- [ ] No N+1 queries
  ```typescript
  // Bad: N queries (1 study + N tags)
  const study = await getStudy(id);
  const tags = await getTags(study.id);

  // Good: 1 query with relationships
  const study = await getStudyWithTags(id);
  ```

- [ ] useCallback/useMemo used appropriately
- [ ] useEffect dependencies correct
- [ ] Images optimized (use Next Image)

### Accessibility Review

- [ ] ARIA labels present for icon-only buttons
- [ ] Color not only means of communication
- [ ] Keyboard navigation works
- [ ] No keyboard traps

### Approval Decision

```
[ ] APPROVE - All checks pass
[ ] REQUEST CHANGES - Issues found (list below)
[ ] COMMENT - Questions/suggestions (non-blocking)

Issues found:
1. ...
2. ...
```

---

## Failed PR Example: Internal Links Feature

**Why it failed Tier 1**:

| Check | Status | Evidence |
|-------|--------|----------|
| Feature fully implemented | ❌ FAIL | Click handler missing - links not navigable |
| Critical path E2E test | ❌ FAIL | No E2E tests written |
| Manual test report | ❌ FAIL | No manual testing done |
| Tests pass locally | ⚠️ MISSING | No tests created |
| Security validated | ❌ FAIL | RLS not verified for cross-user links |

**Root Cause**: No Definition of Done enforcement. Code review approved despite incomplete feature.

**Prevention**: Use this checklist in PR template.

---

## Integration with GitHub

### Option 1: PR Template (Automatic)

**File**: `.github/pull_request_template.md`

```markdown
## Description
[Describe the feature]

## Type
- [ ] Feature
- [ ] Bug Fix
- [ ] Chore
- [ ] Docs

## Definition of Done Checklist

### Tier 1: Must Have (Blocking)
- [ ] Feature fully implemented
- [ ] No debugging code
- [ ] Critical path E2E test added
- [ ] Manual test report (link or paste results)
- [ ] Linting passes
- [ ] TypeScript compiles
- [ ] Tests pass locally
- [ ] Security validated

### Tier 2: Should Have
- [ ] Test coverage 60%+
- [ ] Edge cases tested
- [ ] No N+1 queries
- [ ] Responsive design
- [ ] WCAG AA accessibility

## Test Results
- Unit tests: [X passed, 0 failed]
- E2E tests: [Y passed, 0 failed]
- Coverage: [Z%]

## Screenshots/Videos (if applicable)
[Paste here]

## Blockers
[None / List any known issues]
```

### Option 2: GitHub Branch Protection Rule

**Settings** → **Branches** → **main** → **Branch protection rules**:

```
✅ Require pull request reviews before merging
   ✅ Require code review (min 2 reviewers)
   ✅ Require approval from code owners

✅ Require status checks to pass
   ✅ test (npm run test)
   ✅ lint (npm run lint)
   ✅ build (npm run build)
   ✅ e2e (npm run test:e2e)

✅ Require branches to be up to date
   ✅ Include administrators
```

This **blocks merge if**:
- Tests fail
- Linting fails
- Code review not approved
- Build fails

---

## Success Metrics

Track these over time:

| Metric | Target | Current |
|--------|--------|---------|
| Features blocked by test failures | 80% | 0% ❌ |
| Test coverage (avg) | 70% | TBD |
| Critical bugs in production (per release) | 0 | 1 🔴 |
| Time to fix critical bugs | < 4 hours | TBD |
| Revert rate (commits reverted) | < 2% | TBD |

---

## Questions for Reviewers

Use these to assess readiness:

1. **Can you manually test the critical path in 5 minutes without instructions?** If no → not ready
2. **If this code breaks in production, would automated tests catch it?** If no → needs tests
3. **Would you be comfortable deploying this at 2am?** If no → ask why
4. **Are there any hardcoded strings/values?** If yes → might be secrets
5. **Does this feature work on mobile?** If unsure → not tested enough

---

## Troubleshooting

### "Tests pass locally but fail in CI"

**Common causes**:
- Different Node versions
- Environment variables missing
- Database state differs
- Flaky tests (race conditions)

**Fix**:
```bash
# Match CI environment
node --version   # Compare with .github/workflows
npm ci            # Use CI-safe install
npm run test:local  # Run in CI mode
```

### "Linting passes but eslint-config differs"

**Cause**: Local config differs from CI

**Fix**:
```bash
npx eslint --fix .
npm run lint
```

### "Test coverage shows 0% but tests exist"

**Cause**: Coverage reporter misconfiguration or tests not running

**Fix**:
```bash
npm run test:coverage -- --reporter=html
open coverage/index.html
```

---

## References

- [WCAG 2.1 AA Checklist](https://www.w3.org/WAI/WCAG21/checklist/)
- [OWASP Security Checklist](https://owasp.org/www-project-top-ten/)
- [Testing Library Best Practices](https://testing-library.com/docs/queries/about#priority)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

**Version**: 1.0
**Last Updated**: 2026-01-27
**Next Review**: After first feature completion following this checklist
