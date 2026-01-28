# Sprint 4 Backlog
## Stabilization & Reference Links

**Sprint:** 4 (Final Polish + Feature Completion)
**Duration:** 2-3 weeks (Est. 10-15 business days)
**Start Date:** 2026-02-03 (Monday)
**End Date:** 2026-02-14 (Friday) or 2026-02-17 (Monday)
**Status:** 🎯 IN PLANNING

---

## 📊 Sprint Overview

### Goals
✅ Complete reference links feature (4.3) — knowledge graph foundation
✅ Polish & stabilization (4.1, 4.2) — prepare for friend sharing
✅ Final testing & bug fixes — zero critical bugs
✅ Ready for launch → share with friends

### Success Criteria
- [ ] All 3 stories DONE (Definition of Ready met)
- [ ] Lighthouse Performance > 80 across all routes
- [ ] WCAG AA accessibility compliance
- [ ] Zero critical/high priority bugs
- [ ] Mobile tested on iOS + Android
- [ ] Friends can onboard in < 5 minutes
- [ ] User feedback incorporated

---

## 💰 Capacity Planning

### Team Availability
| Role | Availability | Capacity |
|------|--------------|----------|
| **@dev (Dex)** | Full-time (5 days/week) | ~40 story points |
| **@qa (Quinn)** | 50% Sprint (testing/review) | ~20 story points |
| **@pm (Morgan)** | Daily standup + unblocking | N/A (coordination) |

### Realistic Capacity
- **Available Points:** 40 (developer) × 70% utilization = **28 points realistic**
- **Sprint Backlog Points:** 13
- **Buffer for Unknowns:** 15 points (unplanned bugs, investigations)
- **Status:** ✅ **SAFE** (13 < 28) with room for scope growth

---

## 📋 Backlog (Prioritized)

### Tier 1: MUST DO (Critical for Launch)
**Owner:** @dev (Dex) | **QA:** @qa (Quinn)

#### 🔴 Story 4.3: Reference Links - UI/UX (8 pts)
**Priority:** P0 — Foundation for knowledge graph
**Owner:** @dev
**Timeline:** Mon 3 Feb - Fri 7 Feb (5 days)
**Status:** 🚀 KICKOFF READY

**Why First:**
- Unblocks Phase 2 features (grafo, search)
- Complex implementation (15 tasks, 5 days)
- Needs full week for testing & polish
- No dependencies blocking (@qa can test in parallel)

**What's Included:**
- ✅ 12 GitHub issues (#41-52) already created
- ✅ Detailed dev kickoff document
- ✅ Technical implementation plan
- ✅ Full CRUD operations (add, delete, reorder)
- ✅ Mobile responsive (3 breakpoints)
- ✅ WCAG AA accessibility
- ✅ Drag-and-drop reordering
- ✅ Loading states + error handling
- ✅ Performance optimization (Lighthouse > 80)

**Success Metrics:**
- Sidebar renders without errors ✅
- Add/delete/reorder flows working ✅
- All 12 tasks completed ✅
- CodeRabbit: zero critical issues ✅
- Mobile tested (iOS/Android) ✅

**Deliverables:**
- `src/components/Editor/ReferencesSidebar.tsx`
- `src/components/Editor/ReferenceCard.tsx`
- `src/components/Editor/AddReferenceModal.tsx`
- `src/hooks/useReferences.ts` (updated)
- GitHub PR merged to main

---

### Tier 2: SHOULD DO (Polish & User Experience)
**Owner:** @dev | **QA:** @qa

#### 🟡 Story 4.2: Bug Bash + Testing (3 pts)
**Priority:** P0 — Zero critical bugs before friends
**Owner:** @qa (Quinn) + @dev (Dex)
**Timeline:** Mon 10 Feb - Wed 12 Feb (3 days)
**Status:** 📋 Ready for Planning

**What's Included:**
- Comprehensive E2E testing (Playwright)
- Edge case testing (offline, errors, limits)
- Performance validation (Lighthouse audit)
- Mobile testing (iOS Safari, Android Chrome)
- Manual smoke testing (happy path)
- Bug triage & prioritization

**Testing Matrix:**
```
Routes to test:
├─ / (Dashboard)
├─ /login (Auth)
├─ /estudo/[id] (Editor + References)
├─ /grafo (Graph visualization)
├─ /settings (User settings)
└─ Mobile (all routes at 375px, 667px)

Flows to test:
├─ Create study
├─ Edit study content
├─ Add/remove references (4.3)
├─ Add/remove tags
├─ Undo/redo content
├─ Change status (estudando → revisando → concluído)
├─ Delete study
├─ Error scenarios (network down, DB errors)
└─ Mobile-specific (keyboard, touch, safe area)
```

**Success Metrics:**
- Zero critical bugs found ✅
- All core workflows tested ✅
- Edge cases documented ✅
- Performance report generated ✅

**Deliverables:**
- Test report (PDF/Markdown)
- Bug list (prioritized by severity)
- Performance metrics
- Accessibility audit results
- Sign-off: "Ready for friends" ✅

---

#### 🟡 Story 4.1: Friend Onboarding Guide (2 pts)
**Priority:** P1 — Self-service learning for friends
**Owner:** @dev (Dex)
**Timeline:** Thu 13 Feb - Fri 14 Feb (2 days)
**Status:** 📋 Draft (review before sprint)

**What's Included:**
- Interactive welcome screen (first-time user detection)
- 5-step guided tutorial (2-3 minutes)
- FAQ/Help page (basic usage, shortcuts, troubleshooting)
- Keyboard shortcuts reference
- Toast notifications (helpful tips while using)
- Tutorial persistence (skip/resume options)

**Tutorial Flow:**
1. Finding a book to study (66 Livros)
2. Reading & creating a study note
3. Saving the study
4. Using tags to organize
5. Viewing the graph of connections

**Success Metrics:**
- New user can complete first study in < 5 min ✅
- Tutorial is skippable & resumable ✅
- FAQ answers common questions ✅
- Help content is encouraging (tone) ✅

**Deliverables:**
- `src/components/Onboarding/WelcomeScreen.tsx`
- `src/components/Onboarding/Tutorial.tsx`
- `src/pages/help.tsx` (FAQ page)
- `src/components/KeyboardShortcuts.tsx`

---

### Tier 3: NICE TO HAVE (If Time Permits)

| Item | Points | Purpose |
|------|--------|---------|
| Performance micro-optimizations | 2-3 | Lighthouse refinement |
| Dark mode setup | 3-5 | Nice feature (deferred to Phase 2) |
| Advanced error recovery | 2-3 | Edge case handling |
| Analytics setup | 2 | Track usage patterns |

**Status:** 🚫 **OUT OF SCOPE for Sprint 4** (add to Phase 2)

---

## 🎯 Execution Plan

### Week 1: Reference Links Feature (Mon 3 - Fri 7 Feb)

**Monday 3 Feb - Day 1**
- [ ] @dev: Kickoff meeting (9:00 AM)
- [ ] @dev: Task 4.3.1 — Design & TypeScript types
- [ ] @dev: Task 4.3.2 — ReferencesSidebar component
- [ ] @qa: Start environment setup + test planning

**Tuesday 4 Feb - Day 2**
- [ ] @dev: Task 4.3.3 — AddReferenceModal
- [ ] @dev: Task 4.3.4 — useReferences Hook (CRUD)
- [ ] @qa: Begin component testing (4.3.1-2)

**Wednesday 5 Feb - Day 3**
- [ ] @dev: Task 4.3.5 — Delete reference flow
- [ ] @dev: Task 4.3.6 — Drag-and-drop reordering
- [ ] @qa: Integration testing (4.3.3-4)

**Thursday 6 Feb - Day 4**
- [ ] @dev: Task 4.3.7 — Mobile responsive layout
- [ ] @dev: Task 4.3.8 — Loading states & error handling
- [ ] @dev: Task 4.3.9 — Accessibility & keyboard navigation
- [ ] @qa: Mobile testing begins (iPad 768px, iPhone 375px)

**Friday 7 Feb - Day 5**
- [ ] @dev: Task 4.3.10-13 — Testing & QA
- [ ] @dev: Task 4.3.14 — CodeRabbit review
- [ ] @dev: Task 4.3.15 — Performance optimization
- [ ] @qa: Final testing + approval
- [ ] @pm: Sprint review + demo

**Deliverable:** Story 4.3 DONE ✅ (PR merged)

---

### Week 2: Polish & Onboarding (Mon 10 - Fri 14 Feb)

**Monday 10 Feb - Day 6**
- [ ] @qa: Bug bash begins (comprehensive testing)
- [ ] @dev: Story 4.2 — Review test cases + create test suite
- [ ] @dev: Start edge case testing (offline, errors)

**Tuesday 11 Feb - Day 7**
- [ ] @qa: Continue bug finding
- [ ] @dev: Debug + fix bugs (triage with @qa)
- [ ] @dev: Performance refinement (Lighthouse)

**Wednesday 12 Feb - Day 8**
- [ ] @qa: Final round testing + sign-off
- [ ] @dev: Bug fixes + polish
- [ ] @pm: Checkpoint: "Ready for friends?" assessment

**Thursday 13 Feb - Day 9**
- [ ] @dev: Story 4.1 — Onboarding guide start
- [ ] Create welcome screen
- [ ] Build tutorial component

**Friday 14 Feb - Day 10**
- [ ] @dev: Story 4.1 — Complete FAQ & help
- [ ] @qa: Test onboarding (new user flow)
- [ ] @pm: Sprint review + final demo
- [ ] Prepare launch plan

**Deliverable:** Stories 4.2 + 4.1 DONE ✅

---

### Week 3 (If extended): Final Polish (Mon 17 Feb)

**Monday 17 Feb - Day 11**
- [ ] Any remaining bug fixes
- [ ] Final accessibility audit
- [ ] Performance validation
- [ ] Documentation updates
- [ ] **EPIC-002 COMPLETE** ✅

---

## 🔄 Daily Standup Structure

**Time:** 10:00 AM (15 minutes)
**Attendees:** @dev, @qa, @pm
**Format:**
1. Yesterday: What did you complete?
2. Today: What will you do?
3. Blockers: Any issues preventing progress?

**Weekly Review:** Friday 3:00 PM (30 minutes)
- Demo completed work
- Discuss learnings
- Adjust plan if needed

---

## 🚨 Risk Management

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Story 4.3 takes longer than 5 days | Medium | High | Daily standup, early warning, reduce scope |
| Unexpected bugs in 4.3 | Medium | High | Comprehensive testing, 1 day buffer |
| Mobile testing delays | Low | Medium | Real devices + emulator, parallel testing |
| Team member unavailable | Low | Medium | Cross-training, clear documentation |
| Performance issues (Lighthouse) | Medium | Medium | Early profiling, performance budget |

**Mitigation Strategy:**
- Buffer day: Friday 7 Feb for 4.3 overflow
- Parallel testing: @qa tests while @dev builds
- Early warning: Daily standup identifies issues
- Scope negotiation: If 4.3 overflows, reduce 4.1 features

---

## 📈 Definition of Ready (Before Sprint Starts)

Each story must meet DoR before starting:

### Story 4.3 ✅
- [x] Story document complete
- [x] Acceptance criteria clear
- [x] 12 GitHub issues created
- [x] Dev kickoff document ready
- [x] Tech plan documented
- [x] Dependencies identified (none blocking)
- [x] @dev has read all docs

### Story 4.2 ✅
- [x] Test cases documented
- [x] Testing matrix defined
- [x] Tools identified (Playwright, axe-core)
- [x] @qa ready to execute

### Story 4.1 ⚠️ (NEEDS REFINEMENT)
- [ ] Content written (tutorial text)
- [ ] Wireframes sketched
- [ ] Tech approach decided (modal vs page)
- [ ] Acceptance criteria final

**Action:** Review 4.1 before sprint starts

---

## 📋 Definition of Done (Acceptance Criteria)

### For Each Story
- [ ] All tasks completed
- [ ] Build: `npm run build` ✅
- [ ] Lint: `npm run lint` ✅
- [ ] TypeScript: No errors
- [ ] Tests: Passing
- [ ] Code review: APPROVED
- [ ] PR: Merged to main
- [ ] GitHub issue: CLOSED

### For Sprint 4 Overall
- [ ] All 3 stories marked DONE
- [ ] Lighthouse Performance > 80
- [ ] WCAG AA accessibility ✅
- [ ] Zero critical bugs
- [ ] Mobile tested
- [ ] QA sign-off: YES
- [ ] Ready for launch ✅

---

## 👥 Team Assignments

### @dev (Dex)
- **Story 4.3:** Full ownership (12 tasks, 8 pts)
- **Story 4.2:** Support (bug fixes, 1 pt)
- **Story 4.1:** Full ownership (2 pts)
- **Total:** 11 pts (realistic: 9-10 pts after Q&A)

### @qa (Quinn)
- **Story 4.3:** Component testing + accessibility audit (parallel, 1 pt)
- **Story 4.2:** Full ownership — bug bash (3 pts)
- **Story 4.1:** Onboarding testing (1 pt)
- **Total:** 5 pts (realistic)

### @pm (Morgan)
- **Daily:** Standup + unblocking (10 min/day)
- **Weekly:** Review + sprint demo (1 hour/week)
- **As-Needed:** Scope negotiation, priority decisions
- **Total:** 0 pts (coordination only)

---

## 📊 Burndown Projection

```
Sprint 4 Backlog: 13 points

Week 1 (Mon 3 - Fri 7):
└─ Story 4.3: 0 → 8 pts ✅ (daily progress: 1.6pts/day)
   Expected: Friday 7 Feb EOD = DONE

Week 2 (Mon 10 - Fri 14):
├─ Story 4.2: 0 → 3 pts ✅ (Wed 12 Feb)
└─ Story 4.1: 0 → 2 pts ✅ (Fri 14 Feb)
   Expected: Friday 14 Feb EOD = ALL DONE

Buffer: 1 day (Fri 7 Feb overflow or Mon 10 if needed)
```

**Projection:** 🟢 **ON TRACK** (13 pts should complete in 10 business days)

---

## 🎯 Success Metrics (How We'll Know)

By Friday 14 February 2026, Sprint 4 is successful if:

✅ **Functionality**
- All reference features working (add/delete/reorder)
- Onboarding complete (tutorial + help)
- Zero critical bugs found

✅ **Quality**
- Lighthouse Performance > 80
- WCAG AA accessibility passed
- Mobile tested on 2+ devices
- CodeRabbit: zero critical issues

✅ **Readiness**
- Friends can use without help
- Can onboard in < 5 minutes
- Feels polished & professional
- You're confident recommending it

✅ **Process**
- All sprints ceremonies completed
- Team feedback incorporated
- Documentation updated
- Retrospective notes captured

---

## 📌 Pre-Sprint Checklist (Due Before 3 Feb)

- [ ] All 3 stories in DoR
- [ ] GitHub issues assigned
- [ ] Dev environment ready (@dev)
- [ ] Testing environment ready (@qa)
- [ ] Slack/communication channel set up
- [ ] Sprint board created (GitHub Projects)
- [ ] Daily standup time blocked
- [ ] This backlog document reviewed & approved
- [ ] Team ready to kick off Monday 3 Feb

---

## 🚀 Launch Readiness (After Sprint 4)

When EPIC-002 is complete, assess:

| Aspect | Ready? | Evidence |
|--------|--------|----------|
| **Features** | Yes | All P0 stories done |
| **Quality** | Yes | Zero critical bugs, WCAG AA, Lighthouse > 80 |
| **User Ready** | Yes | Onboarding complete, friends can self-serve |
| **Performance** | Yes | Mobile tested, offline handling works |
| **Documentation** | Yes | Help + FAQ + keyboard shortcuts |
| **Team Ready** | Yes | Sprint 4 retrospective + lessons learned |

**Decision Point:** Friday 14 Feb 5:00 PM
- Decide: Launch to friends or defer Phase 2?
- Recommended: Launch on Monday 17 Feb (or whenever you're ready)

---

## 📝 Revision History

| Date | Status | Changes |
|------|--------|---------|
| 2026-01-28 | Created | Initial Sprint 4 backlog with 3 stories |
| - | - | |

---

## 👤 Approvals

**PM (Morgan):** ✅ APPROVED
**Date:** 2026-01-28
**Status:** 🎯 **READY FOR TEAM REVIEW**

---

**Next Steps:**
1. [ ] @dev: Read and approve backlog
2. [ ] @qa: Read and approve testing plan
3. [ ] Team: Sprint planning meeting (final Wed 29 Jan or Thu 30 Jan)
4. [ ] Launch sprint kickoff: Monday 3 February 2026

---

**Good luck, team! 🚀 Let's make Bible Study ready for friends.**

— Morgan, orquestrando o sistema 📊
