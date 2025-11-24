# Agent Output Template

**Purpose**: Structured format for agent-to-agent communication to enable quality validation, peer review, and iterative refinement.

**Usage**: ALL agents MUST follow this template when delivering final outputs to orchestrator or peer validators.

---

## 📋 Template Structure

```markdown
# [Agent Name] - Final Deliverable

**Task ID**: [unique identifier, e.g., "WF-5a-RCA-001"]
**Agent**: [agent-name from .md filename]
**Timestamp**: [YYYY-MM-DD HH:MM -03]
**Workflow Phase**: [e.g., "Workflow 5b - RCA Analysis"]
**Iterations**: [number of quality loops performed, min 2]

---

## 🎯 Task Summary

**Objective**: [1-2 sentences describing what was asked]

**Scope**: [boundaries - what WAS included, what was NOT]

**Context**: [key info from orchestrator, previous agents, or .context/]

---

## 🔍 Analysis Process

**Method Used**: [e.g., "5 Whys RCA", "BEFORE/AFTER snapshots", "Fuzzy matching test suite"]

**Tools Executed**:
- [Tool 1]: [purpose] → [output summary]
- [Tool 2]: [purpose] → [output summary]
- [Tool N]: [purpose] → [output summary]

**Iterations Log**:
1. **Iteration 1** (Initial Pass):
   - Query: [what I searched/analyzed]
   - Result: [findings]
   - Quality Score: [1-5] - [reasoning]
   - Refinement: [what I adjusted for next iteration]

2. **Iteration 2** (Refined):
   - Query: [improved search/analysis]
   - Result: [new findings]
   - Quality Score: [1-5] - [reasoning]
   - Refinement: [if score < 4, what I adjusted]

3. **Iteration N** (Final):
   - Query: [most precise version]
   - Result: [comprehensive findings]
   - Quality Score: [4-5] - [reasoning]

---

## 📊 Findings

### Primary Finding (Core Result)

**[Heading - e.g., "Root Cause Identified"]**

[Detailed description of main finding]

**Evidence**:
- **Internal**: [file:line, log snippet, test output]
- **External** (if applicable): [URL + quote + relevance]
- **Measurement**: [concrete numbers - "12 occurrences", "500ms latency"]

**Impact**: [what this means for the project]

---

### Secondary Findings (Supporting Results)

#### Finding 2: [Title]

[Description]

**Evidence**: [same format as above]

#### Finding 3: [Title]

[Description]

**Evidence**: [same format as above]

---

## ✅ Validation

**Self-Validation** (before submission):
- [ ] Evidence is PRIMARY SOURCE (not assumption)
- [ ] Measurements are CONCRETE (not "slow", but "12min")
- [ ] External links are ACCESSIBLE (tested < 24h)
- [ ] Iterations performed (min 2, target 3+)
- [ ] Quality score final iteration ≥ 4/5

**Peer Validation Request**:
- **Validator Agent**: [which agent should check this work]
- **What to Validate**: [specific aspects - "Check if cause is systemic", "Verify no regressions"]
- **Validation Criteria**: [checklist for validator to use]

---

## 🚨 Anti-Patterns Checked

**Anti-Over-Engineering**:
- [ ] Proposed solution is SIMPLEST that works?
- [ ] Checked if native functionality exists? (Gemini/React/Supabase)
- [ ] Complexity justified by EVIDENCE (not theory)?

**Anti-ROI**:
- [ ] ZERO mentions of time saved, ROI, or hour estimates?

**Evidence-Based**:
- [ ] ALL claims cite source (internal OR external with link)?
- [ ] No assumptions presented as facts?

---

## 📝 Recommendations

**Immediate Actions** (must-do):
1. [Action 1] - [why critical] - [owner: who executes]
2. [Action 2] - [why critical] - [owner]
3. [Action N] - [why critical] - [owner]

**Preventive Measures** (systemic fixes):
1. [Fix 1] - [prevents recurrence of what issue]
2. [Fix 2] - [prevents recurrence of what issue]
3. [Fix N] - [prevents recurrence of what issue]

**Nice-to-Have** (optional, low priority):
1. [Enhancement 1] - [benefit if done]
2. [Enhancement 2] - [benefit if done]

---

## 📂 Artifacts Created

**Files Created/Modified**:
- `path/to/file1.ts` - [what changed]
- `path/to/file2.md` - [what changed]
- `path/to/fileN.sql` - [what changed]

**Commands to Reproduce**:
```bash
# If user wants to validate findings manually
command1 arg1 arg2
command2 arg3 arg4
```

**Git Diff Summary** (if code changes):
```
+42 lines added
-15 lines removed
3 files changed
```

---

## 🔗 Cross-References

**Related Documents**:
- `docs/adr/ADR-XXX.md` - [relevant decision]
- `docs/debugging-cases/XXX.md` - [similar case]
- `.context/{branch}_decisions.md` - [decision logged]

**Related Workflows**:
- Workflow [X]: [how this connects]
- Workflow [Y]: [next step after this]

**Related Agents**:
- [agent-name]: [should review aspect Z]
- [agent-name]: [depends on this output]

---

## 💭 Meta-Learning Extraction

**What Went Well**:
- [Pattern 1] - [why it worked]
- [Pattern 2] - [why it worked]

**What Could Improve**:
- [Gap 1] - [how to fix for next time]
- [Gap 2] - [how to fix for next time]

**Systemic Pattern** (if applicable):
- **Observation**: [pattern seen 3+ times]
- **Root Cause**: [why this pattern exists]
- **Prevention**: [how to avoid in future features]
- **Document Where**: [ADR/Debugging Case/PLAN.md]

---

## 🏁 Completion Checklist

**Before marking COMPLETE**:
- [ ] All sections above filled (no "TODO" placeholders)
- [ ] Evidence is PRIMARY + ACCESSIBLE
- [ ] Iterations ≥ 2 performed
- [ ] Final quality score ≥ 4/5
- [ ] Anti-patterns checklist passed
- [ ] Peer validator identified
- [ ] Artifacts listed (files/commands)
- [ ] Meta-learning extracted (if applicable)
- [ ] Cross-references added
- [ ] Orchestrator notified (this submission)

---

**Agent Signature**: [agent-name] v[version]
**Orchestrator Review Status**: [ ] PENDING | [ ] APPROVED | [ ] REJECTED

---

## 📖 Usage Notes for Agents

### When to Use This Template

**MANDATORY for**:
- ✅ Final deliverables to orchestrator
- ✅ Outputs requiring peer validation
- ✅ RCA results (rca-analyzer)
- ✅ Regression reports (regression-guard)
- ✅ Meta-learnings (meta-learning-extractor)
- ✅ Workflow optimization (workflow-optimizer)

**NOT NEEDED for**:
- ❌ Internal iterations (within agent)
- ❌ Quick status updates ("still analyzing...")
- ❌ Clarification questions to orchestrator

### How to Fill Sections

**Iterations Log**:
- Start WIDE (broad search/grep), narrow with each iteration
- Score 1-5: 1=unusable, 2=needs major work, 3=acceptable, 4=good, 5=excellent
- If score < 4, MUST do another iteration (don't submit yet)

**Evidence**:
- **Internal**: Always include file:line or bash command to reproduce
- **External**: MUST be accessible link (no 404s), quote relevant snippet
- **Measurement**: Concrete numbers ("12 files", "500ms", "3 occurrences")

**Anti-Patterns Checklist**:
- Read `.claude/CLAUDE.md` Rules 6, 10, 11 BEFORE filling this
- If ANY checkbox fails, REJECT output and rework

**Meta-Learning**:
- Only extract if you see SYSTEMIC pattern (3+ occurrences)
- Pontual issues = don't extract (just fix)
- Systemic = extract + document + prevent

### Quality Rubric (Self-Score)

**5 - Excellent**:
- All evidence primary source + accessible
- 3+ iterations performed
- Zero assumptions, 100% facts
- Systemic pattern identified + prevention proposed
- Anti-patterns: 100% pass

**4 - Good**:
- Most evidence primary source
- 2-3 iterations performed
- < 10% assumptions (clearly marked)
- Anti-patterns: 100% pass

**3 - Acceptable**:
- 50%+ evidence primary source
- 2 iterations minimum
- Some assumptions (marked)
- Anti-patterns: 80%+ pass

**2 - Needs Major Work**:
- < 50% evidence
- Only 1 iteration
- Many assumptions
- Anti-patterns: < 80% pass

**1 - Unusable**:
- No evidence
- Zero iterations
- Pure assumptions
- Anti-patterns: multiple failures

**DO NOT SUBMIT if score < 4. Iterate again.**

---

## 🔧 Template Maintenance

**Version**: 1.0.0
**Created**: 2025-11-12
**Updated**: 2025-11-12
**Owner**: orchestrator.md
**Review Cycle**: Every 10 agent uses (check if improvements needed)

**Changelog**:
- v1.0.0 (2025-11-12): Initial template based on Anthropic multi-agent best practices

---

## 📚 References

**Anthropic Best Practices**:
- [Effective context engineering for AI agents](https://anthropic.com/research/context-engineering) (Sep 2025)
- [Claude Code: Best practices for agentic coding](https://anthropic.com/blog/claude-code-best-practices) (Apr 2025)

**Project Rules**:
- `.claude/CLAUDE.md` - Rules 3, 4, 4B, 5, 9, 10, 11 (Evidence, RCA, Pareto, Anti-Over-Engineering)
- `.claude/agents/orchestrator.md` - Step 5 (Validation), Step 6 (Final Delivery)

**Related Documents**:
- `.claude/agents/README.md` - Agent guidelines
- `docs/WORKFLOW_META_LEARNING.md` - Meta-learning extraction
