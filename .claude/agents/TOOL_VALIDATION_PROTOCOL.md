# Tool Call Reliability Assurance Protocol

**Version**: 1.0
**Created**: 2025-11-08
**Purpose**: Prevent false action claims via systematic tool validation
**Applies to**: ALL 12 agents in `.claude/agents/`

---

## 🚨 CRITICAL RULE

**NEVER claim an action was performed without validation evidence.**

**Examples of VIOLATIONS**:
- ❌ "Updated reset-whatsapp-test.md with cleanup"
- ❌ "Deployed to VPS successfully"
- ❌ "Migration applied"
- ❌ "File created at path/to/file.ts"

**Examples of COMPLIANCE**:
- ✅ "Updated reset-whatsapp-test.md. Evidence: Lines 30-35 now show conversation cleanup SQL: [paste lines]"
- ✅ "Deployed to VPS. Evidence: `docker ps` output shows container 'lifetracker_app' STATUS=running"
- ✅ "Migration applied. Evidence: `supabase migration list` shows '042_add_cleanup.sql' as 'Applied'"
- ✅ "Created file. Evidence: Read shows lines 1-10 contain expected imports and types"

---

## 📋 Critical Tools (Require Validation)

### High-Risk Tools
- **Edit** - File modifications
- **Write** - File creation
- **Bash** - System commands with side effects

### When to Validate
- ✅ ALWAYS - for Edit, Write, Bash with side effects
- ✅ ALWAYS - when claiming success to user
- ❌ OPTIONAL - for Read, Grep, Glob (read-only, no side effects)

---

## ✅ Validation Checklist

### For Edit/Write Tools

**Mandatory 5-Step Process**:

1. **Execute** tool (Edit or Write)
2. **Read** file immediately after (SAME response, do NOT defer)
3. **Verify** content matches intended change
4. **Extract** 2-5 lines showing change (evidence)
5. **Report** to user with evidence

**Template Response**:
```markdown
Updated [file_path] with [change_description].

**Evidence** (lines X-Y):
```
[paste 2-5 lines showing the actual change]
```

**Validation**: Read confirms change applied successfully.
```

**Example**:
```markdown
Updated `.claude/commands/reset-whatsapp-test.md` with conversation history cleanup.

**Evidence** (lines 28-33):
```sql
-- Cleanup conversation history
DELETE FROM lifetracker_coach_messages
WHERE user_id = 'dce0a800-6e9f-4ffd-9364-8e9ae8e7237c';
```

**Validation**: Read confirms SQL block added after metadata reset.
```

---

### For Bash Tools

**Mandatory 4-Step Process**:

1. **Execute** command
2. **Capture** exit code ($?), stdout, stderr
3. **Check** exit code:
   - If `!= 0`: Report error, do NOT claim success
   - If `= 0`: Proceed to step 4
4. **Report** output as evidence

**Template Response (Success)**:
```markdown
Executed `[command]` successfully.

**Exit Code**: 0

**Output**:
```
[paste stdout/stderr - first 10-20 lines if long]
```

**Validation**: Command completed without errors.
```

**Template Response (Failure)**:
```markdown
Attempted `[command]` but encountered error.

**Exit Code**: [non-zero code]

**Error Output**:
```
[paste stderr]
```

**Next Steps**: [explain what went wrong and how to fix]
```

---

### For Read/Grep/Glob Tools

**Validation NOT Required** (read-only operations).

**BUT**: If claiming "file contains X", cite specific lines:
- ✅ "File contains pattern. Evidence: Line 42 shows `import { handler } from './lib'`"
- ❌ "File contains import statements" (too vague)

---

## 🔍 Evidence Standards

### What Counts as Evidence?

**✅ VALID Evidence**:
- Specific line numbers + content (Read tool output)
- Bash command output (stdout/stderr)
- Exit codes (0 vs non-zero)
- File paths from Glob results
- Grep matches with line numbers + context

**❌ INVALID Evidence**:
- "I updated the file" (no proof)
- "The command worked" (no output shown)
- "File looks correct" (subjective, no specifics)
- "Tool call succeeded" (assumed, not verified)

---

### How Much Evidence to Show?

**File Changes (Edit/Write)**:
- Small change (1-5 lines): Show ALL changed lines
- Large change (6-20 lines): Show first 5 + last 2 lines + "..." for middle
- Massive change (20+ lines): Show first 5 + last 2 + total line count

**Bash Output**:
- Short output (< 20 lines): Show ALL
- Long output (20-100 lines): Show first 15-20 lines + "... [truncated]"
- Very long (100+ lines): Show first 10 + last 5 + total line count

**Grep Results**:
- Few matches (< 10): Show ALL with context (-C 2)
- Many matches (10-50): Show first 10 + total count
- Massive matches (50+): Show first 5 + total count + suggest refinement

---

## 🛡️ Common Failure Scenarios

### Scenario 1: Edit Tool Silently Fails

**Problem**: Edit tool rejected due to old_string mismatch, but agent claims success.

**Prevention**:
```markdown
1. Execute Edit tool
2. Read file immediately
3. Search for new_string in Read output
4. If NOT found: Report "Edit failed - old_string not found in file"
5. If found: Report success with evidence
```

---

### Scenario 2: Bash Command Fails but Agent Assumes Success

**Problem**: Command exits with code 1 (error), but agent says "Deployed successfully".

**Prevention**:
```markdown
1. Execute Bash command
2. Check exit code in response metadata
3. If exit != 0: Parse stderr for error message
4. Report error to user, do NOT claim success
5. If exit = 0: Show stdout as evidence
```

---

### Scenario 3: Write Tool Creates File but Agent Doesn't Verify

**Problem**: Write succeeds but file path typo means file created in wrong location.

**Prevention**:
```markdown
1. Execute Write tool with intended path
2. Read file at EXACT path specified
3. Verify Read returns content (not "file not found")
4. Show first 5-10 lines as evidence
5. Confirm path to user
```

---

## 🟣 Orchestrator Enforcement

**Orchestrator MUST reject subagent responses if**:

### Rejection Criteria

- ❌ Claims Edit/Write without subsequent Read
- ❌ Claims Bash execution without showing output/exit code
- ❌ Says "Updated X" without evidence (lines showing change)
- ❌ Says "Executed Y" without stdout/stderr
- ❌ Says "Created Z" without Read validation
- ❌ Vague claims ("file looks good", "command worked")

---

### Approval Criteria

- ✅ Read-After-Write evidence for Edit/Write
- ✅ Command output + exit code for Bash
- ✅ Specific lines/numbers cited (not vague)
- ✅ Evidence matches claimed action
- ✅ Clear "Evidence:" section in response

---

### Orchestrator Response Template

**When REJECTING subagent**:
```markdown
**REJECTED**: [Agent Name] response lacks tool validation.

**Violation**: Claimed "[action]" without evidence.

**Required**:
1. Read file after Edit/Write
2. Show lines X-Y confirming change
3. Cite specific evidence (not vague claims)

**Resubmit** with validation evidence.
```

**When APPROVING subagent**:
```markdown
**APPROVED**: [Agent Name] response meets validation standards.

**Evidence Provided**:
- Read-After-Write: Lines X-Y show [change]
- Bash output: Exit code 0, [output summary]
- Validation: [confirmation statement]

**Proceeding** with next step.
```

---

## 📚 External Best Practices (Sources)

### LangChain - Tool Validation
**Source**: https://python.langchain.com/docs/modules/agents/agent_types/

**Key Point**: "Always validate tool outputs before using them in subsequent steps."

**Application**: After Edit/Write, Read file to confirm change applied.

---

### Anthropic Computer Use - Action Verification
**Source**: https://docs.anthropic.com/en/docs/build-with-claude/computer-use

**Key Point**: "Verify critical actions via screenshot or read operations."

**Application**: Edit is critical action → Read is verification mechanism.

---

### OpenAI Function Calling - Error Handling
**Source**: https://platform.openai.com/docs/guides/function-calling

**Key Point**: "Check function_call.error field and handle failures gracefully."

**Application**: Check Bash exit codes, Edit success flags before claiming completion.

---

## 🎯 Implementation Checklist

### For Agent Prompt Authors

**When creating/updating agent prompts**:

- [ ] Add "Tool Call Validation" section to prompt
- [ ] Reference this protocol: "Read TOOL_VALIDATION_PROTOCOL.md"
- [ ] Include quick checklist for Edit/Write/Bash
- [ ] Add example of compliant vs non-compliant responses
- [ ] Specify "NEVER claim without evidence"

---

### For Agent Users (Claude Code)

**When using Edit/Write/Bash tools**:

- [ ] Execute tool
- [ ] Validate via Read/output capture
- [ ] Extract evidence (lines, output, exit code)
- [ ] Report to user with evidence cited
- [ ] If validation fails, report error (not success)

---

### For Orchestrator

**When reviewing subagent responses**:

- [ ] Check for "Evidence:" section
- [ ] Verify Read-After-Write for Edit/Write
- [ ] Verify output shown for Bash
- [ ] Reject if evidence missing
- [ ] Approve if validation standards met

---

## 📊 Success Metrics

**How to Measure Protocol Effectiveness**:

### Metric 1: False Claim Rate
- **Before**: User reports "Claude claimed X but X didn't happen"
- **Target**: ZERO false claims per 100 tool calls
- **Measurement**: User feedback + manual spot checks

---

### Metric 2: Evidence Citation Rate
- **Before**: 30-40% of tool claims lack evidence
- **Target**: 100% of Edit/Write/Bash claims have evidence
- **Measurement**: Sample 20 responses, count evidence citations

---

### Metric 3: Orchestrator Rejection Rate
- **Before**: Orchestrator doesn't check validation
- **Target**: Reject 100% of non-compliant subagent responses
- **Measurement**: Track rejections in orchestrator logs

---

## 🔄 Protocol Updates

**This protocol is LIVING DOCUMENT**.

**When to Update**:
- New tool added to Claude Code (e.g., Database tool)
- Validation failure pattern discovered
- User reports new type of false claim
- External best practices updated (LangChain, Anthropic, OpenAI docs)

**Update Process**:
1. Identify gap in current protocol
2. Research best practice (cite source)
3. Update protocol with new rule
4. Notify all agents (via orchestrator)
5. Update version number + changelog

---

**Version History**:
- **v1.0** (2025-11-08): Initial protocol created after Debugging Case 004

---

## 🆘 Quick Reference

### Edit/Write Tools
```
Execute → Read → Verify → Extract → Report with Evidence
```

### Bash Tools
```
Execute → Capture Output → Check Exit Code → Report Output/Error
```

### NEVER Say
```
❌ "Updated X"
❌ "Executed Y"
❌ "Created Z"
```

### ALWAYS Say
```
✅ "Updated X. Evidence: Lines A-B show [change]"
✅ "Executed Y. Exit code: 0. Output: [first 10 lines]"
✅ "Created Z. Evidence: Read confirms file contains [expected content]"
```

---

**END OF PROTOCOL**
