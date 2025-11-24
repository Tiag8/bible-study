# Parallel Execution Guide

**Purpose**: Guide for orchestrator to identify when agents can execute in parallel vs sequentially.

**Based on**: Anthropic multi-agent research (context isolation, independent tasks)

---

## 🎯 Core Principle

**Parallel Execution** = Agents work on INDEPENDENT tasks simultaneously (no shared state, no dependencies).

**Sequential Execution** = Agents depend on previous agent outputs (must wait).

---

## 🔍 Dependency Analysis Framework

### Step 1: Identify Task Dependencies

For EACH agent task, ask:

1. **Does this task READ output from previous agent?**
   - YES → Sequential (must wait for previous agent)
   - NO → Check next question

2. **Does this task MODIFY shared state?** (files, DB, .context/)
   - YES → Sequential (prevent race conditions)
   - NO → Check next question

3. **Does this task require SAME tool on SAME data?** (e.g., 2 agents both grep same file)
   - YES → Sequential (tool call conflicts)
   - NO → **PARALLEL OK** ✅

### Step 2: Draw Dependency Graph

```
Example: Bug Fix Task

Agent A (rca-analyzer) ──┐
                         ├──> Agent D (documentation-sync-checker)
Agent B (regression-guard)┘

Agent C (meta-learner) ────> (observes A + B, runs after)

Parallel Group 1: A + B (independent - A analyzes code, B tests behavior)
Sequential: D waits for A + B → C waits for all
```

---

## 📋 Common Patterns

### Pattern 1: Analysis + Validation (PARALLEL ✅)

**Scenario**: Need to analyze code AND validate behavior simultaneously.

**Agents**:
- `rca-analyzer`: Analyzes code for root cause
- `regression-guard`: Validates behavior hasn't changed

**Why Parallel**:
- ✅ Independent tasks (code analysis vs behavior testing)
- ✅ No shared state (RCA reads code, regression tests UI)
- ✅ Different tools (Grep/Read vs Screenshots/Logs)

**Example**:
```markdown
## Phase 1: Parallel Analysis (Agents run simultaneously)

### Agent 1: rca-analyzer
- Task: Execute 5 Whys on bug X
- Reads: src/components/habits/*.ts
- Outputs: RCA report (root cause identified)

### Agent 2: regression-guard
- Task: Capture BEFORE snapshot
- Reads: UI screenshots, DB state, logs
- Outputs: BEFORE snapshot document

**Wait for both** → Collect outputs → Phase 2
```

---

### Pattern 2: Multi-Domain Analysis (PARALLEL ✅)

**Scenario**: Need to analyze different aspects of same feature.

**Agents**:
- `database-schema-validator`: Validate DB schema
- `test-coverage-analyzer`: Check test coverage
- `workflow-optimizer`: Optimize related workflow

**Why Parallel**:
- ✅ Different domains (DB vs tests vs docs)
- ✅ No dependencies (each agent self-contained)
- ✅ Independent outputs

**Example**:
```markdown
## Phase 1: Multi-Domain Audit (Parallel)

### Agent 1: database-schema-validator
- Validate lifetracker_ prefix on all tables
- Check RLS policies enabled

### Agent 2: test-coverage-analyzer
- Measure coverage % for habits module
- Identify untested critical paths

### Agent 3: workflow-optimizer
- Check if Workflow 5a size < 12k chars
- Optimize if needed

**All agents report independently** → Aggregate in Phase 2
```

---

### Pattern 3: Sequential Chain (NO PARALLEL ❌)

**Scenario**: Agent B needs Agent A's output to start.

**Agents**:
- `rca-analyzer`: Identify root cause
- `workflow-optimizer`: Update workflow based on RCA findings
- `documentation-sync-checker`: Validate workflow update synced

**Why Sequential**:
- ❌ B reads A's output (dependency)
- ❌ C validates B's changes (dependency)

**Example**:
```markdown
## Phase 1: RCA (Sequential)

### Agent 1: rca-analyzer
- Execute 5 Whys
- Output: Root cause = "Missing validation in Workflow 5a"

**WAIT for Agent 1 to complete**

### Agent 2: workflow-optimizer
- Input: Agent 1's finding (missing validation)
- Task: Add validation step to Workflow 5a
- Output: Updated workflow file

**WAIT for Agent 2 to complete**

### Agent 3: documentation-sync-checker
- Input: Agent 2's updated workflow
- Task: Verify PLAN.md + INDEX.md updated
- Output: Sync validation report
```

---

### Pattern 4: Observer Pattern (PARALLEL + SEQUENTIAL)

**Scenario**: Meta-learner observes other agents, runs after all complete.

**Agents**:
- `rca-analyzer` + `regression-guard` (parallel)
- `agent-meta-learner` (sequential - waits for both)

**Why Hybrid**:
- ✅ A + B parallel (independent tasks)
- ❌ Meta-learner sequential (needs A + B outputs to extract patterns)

**Example**:
```markdown
## Phase 1: Parallel Execution
- Agent A: rca-analyzer (15min)
- Agent B: regression-guard (10min)

**WAIT for both A + B**

## Phase 2: Meta-Learning (Sequential)
- Agent C: agent-meta-learner
  - Input: A's RCA + B's regression report
  - Task: Identify systemic patterns
  - Output: Meta-learning document
```

---

## 🚨 Anti-Patterns (When NOT to Parallelize)

### ❌ Anti-Pattern 1: Shared File Modification

**BAD**:
```markdown
Agent A: Edit PLAN.md (add feature X)
Agent B: Edit PLAN.md (update roadmap)
```

**Problem**: Race condition - both agents modify same file simultaneously.

**Solution**: Sequential OR split files (A edits PLAN.md, B edits ROADMAP.md).

---

### ❌ Anti-Pattern 2: Cascading Dependencies

**BAD**:
```markdown
Agent A: Analyze code
Agent B: (parallel with A) Needs A's findings ← IMPOSSIBLE
```

**Problem**: B claims parallel but actually depends on A.

**Solution**: Honest dependency graph (A → B sequential).

---

### ❌ Anti-Pattern 3: Over-Parallelization

**BAD**:
```markdown
Agent A: Grep src/
Agent B: Grep src/ (same search, different agent)
Agent C: Grep src/ (redundant)
```

**Problem**: Wastes resources, no real parallelism benefit.

**Solution**: Single agent does comprehensive search (interleaved thinking).

---

## 📊 Decision Tree

```
START
  │
  ├─> Does Agent B need Agent A's output?
  │     YES → SEQUENTIAL
  │     NO  → Continue
  │
  ├─> Do agents modify same file/DB/state?
  │     YES → SEQUENTIAL
  │     NO  → Continue
  │
  ├─> Do agents use same tool on same data?
  │     YES → SEQUENTIAL (or merge into 1 agent)
  │     NO  → Continue
  │
  └─> PARALLEL ✅
```

---

## 🎯 Orchestrator Checklist

Before invoking agents in parallel, verify:

- [ ] **Independence**: No agent reads another's output?
- [ ] **No Shared State**: No agents modify same file/DB/state?
- [ ] **No Tool Conflicts**: No agents use same tool on same data?
- [ ] **Clear Deliverables**: Each agent has own distinct deliverable?
- [ ] **Context Isolation**: Each agent has independent context window?

**IF ANY FAILS** → Execute sequentially.

**IF ALL PASS** → Execute in parallel ✅

---

## 📚 Examples by Workflow

### Workflow 1 (Planning)

**Parallel**:
- Agent A: Analyze current state (Read PLAN.md, TASK.md)
- Agent B: Research alternatives (WebFetch external docs)
- Agent C: Check constraints (Read .claude/CLAUDE.md rules)

**Sequential**:
- Agent D: Synthesize findings (waits for A + B + C)

---

### Workflow 5a (Implementation)

**Parallel**:
- Agent A: Implement feature (Edit src/components/)
- Agent B: Update tests (Edit tests/)
- Agent C: Update docs (Edit docs/)

**Sequential**:
- Agent D: Validate all changes (regression-guard - waits for A + B + C)

---

### Workflow 7a (Quality Gates)

**Parallel**:
- Agent A: Run security tests (bash scripts/run-security-tests.sh)
- Agent B: Run coverage tests (bash npm test -- --coverage)
- Agent C: Run linting (bash npm run lint)

**Sequential**:
- Agent D: Aggregate results (wait for A + B + C)

---

## 🔧 Implementation Notes

### Orchestrator Step 3 Integration

When defining phases (orchestrator.md Step 3), use this guide to determine:

```markdown
### Phase 1: [Name]
**Execution Mode**: PARALLEL | SEQUENTIAL

**If PARALLEL**:
- List agents + tasks
- Verify independence checklist
- Estimate completion: MAX(agent times), not SUM

**If SEQUENTIAL**:
- List agents in order
- Show dependencies explicitly (A → B → C)
- Estimate completion: SUM(agent times)
```

---

## 📖 References

**Anthropic Research**:
- "Effective context engineering for AI agents" (Sep 2025)
  - Context isolation prevents confirmation bias
  - Parallel agents have independent context windows

**Project Docs**:
- `.claude/agents/orchestrator.md` - Step 3 (Define Phases)
- `.claude/agents/orchestrator.md` - Step 4 (Execute in Parallel)

---

**Version**: 1.0.0
**Created**: 2025-11-12
**Owner**: orchestrator.md
**Related**: AGENT_OUTPUT_TEMPLATE.md, orchestrator.md
