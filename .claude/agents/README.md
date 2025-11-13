# Agent System - Color Convention & Guidelines

> **Purpose**: Standardize agent creation, color assignment, and maintenance

---

## 🎨 Color Convention Strategy

**Last Updated**: 2025-11-08

### Color Mapping by Agent Category

Use these colors when creating new agents to maintain visual consistency:

| Category | Color | When to Use | Examples |
|----------|-------|-------------|----------|
| **🔴 Critical/Protection** | `red` | Root cause analysis, security, regression prevention | `rca-analyzer`, `regression-guard` |
| **🔵 Learning/Improvement** | `blue` | Meta-learning, continuous improvement, PDCA cycles | `agent-meta-learner`, `meta-learning-extractor` |
| **🟢 Performance/Execution** | `green` | Optimization, parallel execution, resource efficiency | `context-optimizer`, `multi-script-runner` |
| **🟠 Validation/Analysis** | `orange` | Schema validation, coverage analysis, quality checks | `database-schema-validator`, `test-coverage-analyzer` |
| **🟡 Documentation** | `yellow` | Docs sync, README generation, ADR management | `documentation-sync-checker` |
| **🩷 Workflow Optimization** | `pink` | Workflow compression, size optimization, refactoring | `workflow-optimizer` |
| **⚫ Generation/Templates** | `gray` | Template creation, scaffolding, boilerplate generation | `workflow-template-generator` |
| **🟣 Coordination/Master** | `purple` | Orchestration, multi-agent coordination (usually only 1 agent) | `orchestrator` |

### Available Colors

Claude Code supports: `red`, `orange`, `yellow`, `green`, `blue`, `purple`, `pink`, `gray`

---

## 📋 Agent Creation Checklist

When creating a new agent:

### 1. Choose Category & Color

- [ ] Identify agent's primary purpose (see table above)
- [ ] Select color based on category
- [ ] If category has multiple agents, reuse same color (maintains grouping)

### 2. Define Agent Metadata

```yaml
---
name: agent-name                    # kebab-case
description: One-line description   # Under 100 chars
tools: Read, Write, Edit, Grep      # Comma-separated
model: sonnet                       # or haiku for simple tasks
color: <color-from-table>           # Use convention above
---
```

### 3. Mandatory Sections

- [ ] **Role**: One-line role definition
- [ ] **Expertise**: 3-5 key areas
- [ ] **Key Capabilities**: Bulleted list
- [ ] **When to Use**: Clear trigger conditions
- [ ] **Validation Checklist**: Quality gates for outputs
- [ ] **ROI Calculation**: Expected time savings

### 3B. Special Patterns for RCA-Related Agents

**If agent performs Root Cause Analysis** (category: Critical/Protection):

- [ ] **Include "Web Resolution" phase** after 5 Whys methodology
- [ ] **Output must list ALL connected files/features/docs** (not just root cause)
- [ ] **Validation checklist must include**:
  - [ ] Mapped entire web of connections (7 layers)
  - [ ] Identified all similar patterns in codebase
  - [ ] Listed all documentation to update
  - [ ] Specified all tests to add

**Reference Pattern**: See `rca-analyzer.md` → "Phase 3: Web Resolution"

**Why**: Root causes rarely affect only 1 file. Agents must map entire dependency web to prevent recurring bugs.

**Related**: `.claude/CLAUDE.md` → Rule 4B (Web Resolution methodology)

### 4. Integration

- [ ] Add to `AGENTS.md` (system overview)
- [ ] Add to `INDEX.md` (under Subagents section)
- [ ] Add to `orchestrator.md` (if orchestrator should use it)
- [ ] Document in relevant workflows (if workflow-specific)

---

## 🗂️ Current Agent Inventory (12 Agents)

### Master Coordination (1)
- 🟣 **orchestrator** - Coordinates 3-5 specialist agents, validates via checklists

### Critical Analysis & Protection (2)
- 🔴 **rca-analyzer** - Root Cause Analysis via 5 Whys
- 🔴 **regression-guard** - Pre-deploy regression prevention (BEFORE/AFTER snapshots)

### Learning & Improvement (2)
- 🔵 **agent-meta-learner** - PDCA agent evaluator (merge/split/deprecate)
- 🔵 **meta-learning-extractor** - Extracts systemic learnings from implementations

### Performance & Execution (2)
- 🟢 **context-optimizer** - Maximizes token usage (80-90% target)
- 🟢 **multi-script-runner** - Parallel script execution (3-5x speedup)

### Validation & Analysis (2)
- 🟠 **database-schema-validator** - Validates Supabase schema (prefix, RLS, migrations)
- 🟠 **test-coverage-analyzer** - Identifies untested code, recommends strategies

### Documentation (1)
- 🟡 **documentation-sync-checker** - Validates 7 critical docs (INDEX, PLAN, TASK, etc.)

### Workflow Management (2)
- 🩷 **workflow-optimizer** - Optimizes workflows (< 12k chars)
- ⚫ **workflow-template-generator** - Generates 9-phase compliant workflows

---

## 🎯 Decision Tree: When to Create a New Agent

### Ask These Questions:

1. **Is this a recurring task?** (> 3 uses/month)
   - NO → Use general-purpose or manual
   - YES → Continue

2. **Does existing agent cover 80%+ of use case?**
   - YES → Extend existing agent (add to capabilities)
   - NO → Continue

3. **Can task be done in < 5 min manually?**
   - YES → Not worth automation
   - NO → Continue

4. **Is ROI > 5x?** (time saved vs creation cost)
   - NO → Reconsider
   - YES → **Create new agent**

### Red Flags (Don't Create Agent)

- ❌ Task happens < 3 times/month
- ❌ ROI < 5x
- ❌ Existing agent already covers 80%+
- ❌ Task is too simple (< 5 min manual)
- ❌ Task is too complex (needs human judgment)

---

## 🔄 Agent Lifecycle Management

### When to Deprecate an Agent

- Usage < 1 time/month for 3 consecutive months
- ROI dropped below 3x
- Functionality absorbed by another agent
- Technology/workflow changed (agent obsolete)

### When to Merge Agents

- Two agents with > 70% overlapping use cases
- Combined usage < 5 times/month
- Maintenance burden > value delivered

### When to Split Agents

- Agent doing > 3 distinct tasks
- Agent file > 500 lines
- Usage patterns show clear separation (e.g., 80% use feature A, 20% use feature B)

---

## 📊 Performance Metrics

Track these for each agent:

- **Usage Count**: Times invoked per month
- **Success Rate**: % of invocations that complete successfully
- **ROI**: Time saved vs maintenance cost
- **User Satisfaction**: Feedback from developers

**Review Cycle**: Quarterly (every 3 months) via `agent-meta-learner`

---

## 🔗 Related Documentation

- **`AGENTS.md`**: System overview and usage patterns
- **`INDEX.md`**: Project navigation (includes Subagents section)
- **`orchestrator.md`**: Master coordinator agent
- **`.windsurf/workflows/`**: Workflow templates that reference agents

---

**Version**: 1.1 (Web Resolution Pattern)
**Last Review**: 2025-11-09
**Next Review**: 2026-02-09 (3 months)

**Changelog v1.1**:
- Added section 3B: Special Patterns for RCA-Related Agents
- Documented Web Resolution requirement for Critical/Protection agents
- Cross-referenced CLAUDE.md Rule 4B and rca-analyzer.md Phase 3
