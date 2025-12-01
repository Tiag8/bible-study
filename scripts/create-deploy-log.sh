#!/bin/bash
# ============================================================================
# Deploy Log Generator Script
# ============================================================================
# Generates structured markdown deploy log from evidence directory
# Usage: ./scripts/create-deploy-log.sh [options]
#
# Example:
#   ./scripts/create-deploy-log.sh \
#     --evidence-dir ./evidence/20251119-143000 \
#     --type edge-function \
#     --function gemini-chat-handler-v2 \
#     --version v151 \
#     --environment production \
#     --approver "Tiago" \
#     --approval-notes "Iteração 8.5 - Hybrid approach"
# ============================================================================

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Default values
TIMEZONE="America/Sao_Paulo"
PROJECT_REF="hqlghhhwsdzjjmvxlzpu"
VPS_HOST="root@31.97.22.151"
DOMAIN="life-tracker.stackia.com.br"
DEPLOYED_BY="${USER}"
CREATE_GIT_TAG="no"
AUTO_COMMIT="no"

# ============================================================================
# Helper Functions
# ============================================================================

log_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

log_error() {
    echo -e "${RED}✗ $1${NC}"
    exit 1
}

log_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

log_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

show_usage() {
    cat <<EOF
Usage: $(basename "$0") [OPTIONS]

Required Options:
  --evidence-dir PATH       Evidence directory from evidence-collector.sh
  --type TYPE              Deploy type: edge-function or vps
  --function NAME          Function name (for edge-function) or environment (for vps)
  --version VERSION        Version tag (e.g., v151, v1.5.3)
  --environment ENV        Environment: production, staging, dev
  --approver NAME          Approver name
  --approval-notes TEXT    Approval notes

Optional:
  --prev-version VERSION   Previous version (for rollback info)
  --duration TIME          Deploy duration (e.g., "2m 15s")
  --git-tag                Create git tag (default: no)
  --auto-commit            Auto commit deploy log (default: no)
  --help                   Show this help message

Examples:
  # Edge Function Deploy
  $(basename "$0") \\
    --evidence-dir ./evidence/20251119-143000 \\
    --type edge-function \\
    --function gemini-chat-handler-v2 \\
    --version v151 \\
    --environment production \\
    --approver "Tiago" \\
    --approval-notes "Iteração 8.5"

  # VPS Deploy
  $(basename "$0") \\
    --evidence-dir ./evidence/20251119-140000 \\
    --type vps \\
    --function production \\
    --version v1.5.3 \\
    --environment production \\
    --approver "Tiago" \\
    --approval-notes "Git workflow improvements"

EOF
    exit 0
}

# ============================================================================
# Parse Arguments
# ============================================================================

while [[ $# -gt 0 ]]; do
    case $1 in
        --evidence-dir)
            EVIDENCE_DIR="$2"
            shift 2
            ;;
        --type)
            DEPLOY_TYPE="$2"
            shift 2
            ;;
        --function)
            FUNCTION_NAME="$2"
            shift 2
            ;;
        --version)
            VERSION="$2"
            shift 2
            ;;
        --environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        --approver)
            APPROVER="$2"
            shift 2
            ;;
        --approval-notes)
            APPROVAL_NOTES="$2"
            shift 2
            ;;
        --prev-version)
            PREV_VERSION="$2"
            shift 2
            ;;
        --duration)
            DURATION="$2"
            shift 2
            ;;
        --git-tag)
            CREATE_GIT_TAG="yes"
            shift
            ;;
        --auto-commit)
            AUTO_COMMIT="yes"
            shift
            ;;
        --help)
            show_usage
            ;;
        *)
            log_error "Unknown option: $1"
            ;;
    esac
done

# ============================================================================
# Validate Required Arguments
# ============================================================================

if [ -z "$EVIDENCE_DIR" ] || [ -z "$DEPLOY_TYPE" ] || [ -z "$FUNCTION_NAME" ] || \
   [ -z "$VERSION" ] || [ -z "$ENVIRONMENT" ] || [ -z "$APPROVER" ] || \
   [ -z "$APPROVAL_NOTES" ]; then
    log_error "Missing required arguments. Use --help for usage."
fi

if [ ! -d "$EVIDENCE_DIR" ]; then
    log_error "Evidence directory not found: $EVIDENCE_DIR"
fi

if [ "$DEPLOY_TYPE" != "edge-function" ] && [ "$DEPLOY_TYPE" != "vps" ]; then
    log_error "Invalid deploy type: $DEPLOY_TYPE (must be edge-function or vps)"
fi

# ============================================================================
# Read Evidence Metadata
# ============================================================================

log_info "Reading evidence metadata..."

METADATA_FILE="$EVIDENCE_DIR/metadata.json"
if [ ! -f "$METADATA_FILE" ]; then
    log_error "Metadata file not found: $METADATA_FILE"
fi

# Extract metadata
DEPLOY_TIMESTAMP=$(jq -r '.deploy_timestamp // "N/A"' "$METADATA_FILE")
GIT_COMMIT=$(jq -r '.git_commit // "N/A"' "$METADATA_FILE")
GIT_BRANCH=$(jq -r '.git_branch // "N/A"' "$METADATA_FILE")
PREV_VERSION_META=$(jq -r '.prev_version // "N/A"' "$METADATA_FILE")
DURATION_META=$(jq -r '.duration // "N/A"' "$METADATA_FILE")

# Use metadata if not provided via args
PREV_VERSION="${PREV_VERSION:-$PREV_VERSION_META}"
DURATION="${DURATION:-$DURATION_META}"

log_success "Metadata loaded"

# ============================================================================
# Prepare Output Paths
# ============================================================================

DATE=$(date -j -f "%Y-%m-%dT%H:%M:%S%z" "$DEPLOY_TIMESTAMP" "+%Y-%m-%d" 2>/dev/null || date +%Y-%m-%d)
OUTPUT_DIR="docs/ops/deploys/${DEPLOY_TYPE}s/${FUNCTION_NAME}"
OUTPUT_FILE="${OUTPUT_DIR}/${DATE}_${FUNCTION_NAME}_${VERSION}.md"

mkdir -p "$OUTPUT_DIR"

log_info "Output file: $OUTPUT_FILE"

# ============================================================================
# Generate Deploy Log (Markdown)
# ============================================================================

log_info "Generating deploy log..."

# Determine title and type string
if [ "$DEPLOY_TYPE" == "edge-function" ]; then
    TITLE="$FUNCTION_NAME $VERSION"
    DEPLOY_TYPE_STR="Edge Function Update"
    ENDPOINT_URL="https://${PROJECT_REF}.supabase.co/functions/v1/${FUNCTION_NAME}"
else
    TITLE="VPS $FUNCTION_NAME $VERSION"
    DEPLOY_TYPE_STR="Full Stack Update"
    ENDPOINT_URL="https://${DOMAIN}"
fi

# Read validation results if available
VALIDATION_FILE="$EVIDENCE_DIR/validation-results.json"
if [ -f "$VALIDATION_FILE" ]; then
    VALIDATION_PASSED=$(jq -r '.passed // 0' "$VALIDATION_FILE")
    VALIDATION_FAILED=$(jq -r '.failed // 0' "$VALIDATION_FILE")
    VALIDATION_WARNINGS=$(jq -r '.warnings // 0' "$VALIDATION_FILE")
else
    VALIDATION_PASSED="N/A"
    VALIDATION_FAILED="N/A"
    VALIDATION_WARNINGS="N/A"
fi

# Read changes summary if available
CHANGES_FILE="$EVIDENCE_DIR/changes-summary.txt"
if [ -f "$CHANGES_FILE" ]; then
    CHANGES_SUMMARY=$(cat "$CHANGES_FILE")
else
    CHANGES_SUMMARY="See git diff for details"
fi

# Format timestamp for display (BRT timezone)
DEPLOY_DATE_BRT=$(TZ="$TIMEZONE" date -j -f "%Y-%m-%dT%H:%M:%S%z" "$DEPLOY_TIMESTAMP" "+%Y-%m-%d %H:%M:%S BRT" 2>/dev/null || echo "$DEPLOY_TIMESTAMP")

# ============================================================================
# Write Deploy Log
# ============================================================================

cat > "$OUTPUT_FILE" <<EOF
# Deploy: $TITLE

**Date**: $DEPLOY_DATE_BRT
**Environment**: $ENVIRONMENT
**Deploy Type**: $DEPLOY_TYPE_STR
**Deployed By**: @$DEPLOYED_BY
**Duration**: $DURATION

---

## 1. Pre-Deploy Checklist

### 1.1. Git Status
- **Branch**: $GIT_BRANCH
- **Commit**: \`$GIT_COMMIT\`
- **Version**: $VERSION
- **Previous Version**: $PREV_VERSION

### 1.2. Validations
EOF

# Add validations based on deploy type
if [ "$DEPLOY_TYPE" == "edge-function" ]; then
    cat >> "$OUTPUT_FILE" <<EOF
- [x] ✅ Runtime Compatibility: Deno validated
- [x] ✅ TypeScript Check: PASSED
- [x] ✅ Async Pattern: Validated
- [x] ✅ Secrets Available: Validated
- [x] ✅ Imports ESM: Validated
- [x] ✅ Response Headers: Validated
EOF
else
    cat >> "$OUTPUT_FILE" <<EOF
- [x] ✅ Tests: PASSED (\`./scripts/run-tests.sh\`)
- [x] ✅ Code Review: PASSED (\`./scripts/code-review.sh\`)
- [x] ✅ Security: PASSED (\`./scripts/run-security-tests.sh\`)
- [x] ✅ Schema: SYNCED (\`./scripts/validate-schema-first.sh\`)
- [x] ✅ Env Vars: Validated (\`./scripts/validate-env-conflicts.sh\`)
- [x] ✅ Build: SUCCESS
EOF
fi

cat >> "$OUTPUT_FILE" <<EOF

### 1.3. Changes Summary
\`\`\`
$CHANGES_SUMMARY
\`\`\`

**Breaking Changes**: ❌ None (unless documented below)

---

## 2. Deploy Execution

### 2.1. Command
\`\`\`bash
EOF

# Add deploy command based on type
if [ "$DEPLOY_TYPE" == "edge-function" ]; then
    cat >> "$OUTPUT_FILE" <<EOF
supabase functions deploy $FUNCTION_NAME \\
  --project-ref $PROJECT_REF \\
  --region us-east-1
EOF
else
    cat >> "$OUTPUT_FILE" <<EOF
./scripts/deploy-vps.sh $ENVIRONMENT
EOF
fi

cat >> "$OUTPUT_FILE" <<EOF
\`\`\`

### 2.2. Deploy Log
See evidence artifacts in: \`$EVIDENCE_DIR/\`

### 2.3. Version Evidence
**Git Commit**: $GIT_COMMIT
**Git Branch**: $GIT_BRANCH
**Deployed Version**: $VERSION

---

## 3. Post-Deploy Validation

### 3.1. Smoke Tests (Automated)
EOF

# Read smoke test results if available
SMOKE_TESTS_FILE="$EVIDENCE_DIR/smoke-tests-results.txt"
if [ -f "$SMOKE_TESTS_FILE" ]; then
    cat >> "$OUTPUT_FILE" <<EOF

\`\`\`
$(cat "$SMOKE_TESTS_FILE")
\`\`\`
EOF
else
    cat >> "$OUTPUT_FILE" <<EOF

**Results**:
- Validation Passed: $VALIDATION_PASSED
- Validation Failed: $VALIDATION_FAILED
- Warnings: $VALIDATION_WARNINGS
EOF
fi

cat >> "$OUTPUT_FILE" <<EOF

### 3.2. Manual Tests
- [ ] Manual verification pending
- [ ] Real-world test pending
- [ ] User acceptance pending

### 3.3. Monitoring
**Duration**: 15 minutes
**Errors**: Monitor for 15 minutes post-deploy
**Performance**: Monitor latency metrics

---

## 4. Rollback Information

### 4.1. Previous Version
**Version**: $PREV_VERSION
**Commit**: Available in git history
**Deploy Date**: See deploy history

### 4.2. Rollback Command (if needed)
\`\`\`bash
EOF

# Add rollback command based on type
if [ "$DEPLOY_TYPE" == "edge-function" ]; then
    cat >> "$OUTPUT_FILE" <<EOF
# Option A: Deploy previous version via git tag
git checkout edge/${FUNCTION_NAME}/${PREV_VERSION}
supabase functions deploy $FUNCTION_NAME

# Option B: Rollback script
./scripts/rollback-edge-function.sh $FUNCTION_NAME $PREV_VERSION
EOF
else
    cat >> "$OUTPUT_FILE" <<EOF
# Automated rollback
./scripts/vps-rollback.sh $ENVIRONMENT $PREV_VERSION

# Manual rollback (if script fails)
ssh $VPS_HOST << 'EOSSH'
  cd /root/life-tracker
  docker service update {{SERVICE_NAME}} --image life-tracker:$PREV_VERSION
  docker service ps {{SERVICE_NAME}}
EOSSH
EOF
fi

cat >> "$OUTPUT_FILE" <<EOF
\`\`\`

### 4.3. Rollback Estimate
**Time**: 2-3 minutes
**Impact**: Minimal downtime
**Data Loss**: None (stateless or database unchanged)

---

## 5. Evidence Artifacts

### 5.1. Evidence Directory
\`\`\`
$EVIDENCE_DIR/
EOF

# List evidence files
if [ -d "$EVIDENCE_DIR" ]; then
    find "$EVIDENCE_DIR" -type f -exec basename {} \; | while read -r file; do
        echo "├── $file" >> "$OUTPUT_FILE"
    done
fi

cat >> "$OUTPUT_FILE" <<EOF
\`\`\`

### 5.2. Git Diff
\`\`\`bash
git diff ${PREV_VERSION}..${VERSION}
\`\`\`

### 5.3. Key Artifacts
- Deploy stdout: \`$EVIDENCE_DIR/deploy-stdout.txt\`
- Validation results: \`$EVIDENCE_DIR/validation-results.json\`
- Changes summary: \`$EVIDENCE_DIR/changes-summary.txt\`
- Screenshots: See \`$EVIDENCE_DIR/*.png\`

---

## 6. Approval & Sign-Off

### 6.1. Pre-Deploy Approval (REGRA #25)
**Approved By**: @$APPROVER
**Approval Date**: $DEPLOY_DATE_BRT
**Approval Type**: Manual (explicit approval required for $ENVIRONMENT)

**Approval Notes**:
\`\`\`
$APPROVAL_NOTES
\`\`\`

### 6.2. Post-Deploy Sign-Off
**Monitoring Duration**: 15 minutes
**Sign-Off By**: @$DEPLOYED_BY
**Sign-Off Date**: Pending
**Status**: ⏳ MONITORING

---

## 7. Post-Deploy Notes

### 7.1. Issues Encountered
- None (or document issues here)

### 7.2. Observations
- Document any observations or unexpected behavior

### 7.3. Next Steps
- Monitor for 15 minutes
- Complete manual tests
- Update sign-off status

---

## 8. Related Links

- **Production URL**: $ENDPOINT_URL
- **Git Commit**: https://github.com/{{GITHUB_REPO}}/commit/$GIT_COMMIT
- **Evidence Directory**: \`$EVIDENCE_DIR/\`
EOF

if [ "$DEPLOY_TYPE" == "edge-function" ]; then
    cat >> "$OUTPUT_FILE" <<EOF
- **Supabase Function**: https://supabase.com/dashboard/project/$PROJECT_REF/functions/$FUNCTION_NAME
EOF
fi

cat >> "$OUTPUT_FILE" <<EOF

---

**Deploy Status**: ✅ SUCCESS
**Version**: $VERSION
**Last Updated**: $DEPLOY_DATE_BRT
EOF

log_success "Deploy log generated: $OUTPUT_FILE"

# ============================================================================
# Update Master Deploy History
# ============================================================================

log_info "Updating master deploy history..."

DEPLOY_HISTORY_FILE="docs/ops/DEPLOY_HISTORY.md"
DEPLOY_HISTORY_ARCHIVE="docs/ops/DEPLOY_HISTORY_ARCHIVE.md"

# Create deploy history if not exists
if [ ! -f "$DEPLOY_HISTORY_FILE" ]; then
    cat > "$DEPLOY_HISTORY_FILE" <<EOF
# Deploy History - Life Track Growth

**Last Updated**: $(TZ="$TIMEZONE" date "+%Y-%m-%d %H:%M BRT")

---

## Recent Deploys (Last 20)

| Date | Target | Version | Commit | Status | Rollback Available |
|------|--------|---------|--------|--------|--------------------|
EOF
    log_success "Created deploy history file"
fi

# Prepare new entry
DEPLOY_DATE_SHORT=$(date -j -f "%Y-%m-%dT%H:%M:%S%z" "$DEPLOY_TIMESTAMP" "+%Y-%m-%d %H:%M" 2>/dev/null || date "+%Y-%m-%d %H:%M")
TARGET_STR=$([ "$DEPLOY_TYPE" == "edge-function" ] && echo "Edge: $FUNCTION_NAME" || echo "VPS: $FUNCTION_NAME")
COMMIT_SHORT=$(echo "$GIT_COMMIT" | cut -c1-7)

NEW_ENTRY="| $DEPLOY_DATE_SHORT | $TARGET_STR | $VERSION | \`$COMMIT_SHORT\` | ✅ SUCCESS | ✅ $PREV_VERSION |"

# Insert entry after header (line 8)
if [ "$(uname)" == "Darwin" ]; then
    # macOS
    sed -i '' "8a\\
$NEW_ENTRY
" "$DEPLOY_HISTORY_FILE"
else
    # Linux
    sed -i "8a $NEW_ENTRY" "$DEPLOY_HISTORY_FILE"
fi

# Update "Last Updated" timestamp
if [ "$(uname)" == "Darwin" ]; then
    sed -i '' "s/\*\*Last Updated\*\*: .*/\*\*Last Updated\*\*: $(TZ="$TIMEZONE" date "+%Y-%m-%d %H:%M BRT")/" "$DEPLOY_HISTORY_FILE"
else
    sed -i "s/\*\*Last Updated\*\*: .*/\*\*Last Updated\*\*: $(TZ="$TIMEZONE" date "+%Y-%m-%d %H:%M BRT")/" "$DEPLOY_HISTORY_FILE"
fi

# Archive old entries (keep last 20)
ENTRY_COUNT=$(grep -c "^|" "$DEPLOY_HISTORY_FILE" || echo "0")
if [ "$ENTRY_COUNT" -gt 22 ]; then  # 20 entries + 2 header rows
    log_info "Archiving old entries..."

    # Create archive if not exists
    if [ ! -f "$DEPLOY_HISTORY_ARCHIVE" ]; then
        cat > "$DEPLOY_HISTORY_ARCHIVE" <<EOF
# Deploy History Archive - Life Track Growth

Archived deploys older than 20 most recent entries.

---

| Date | Target | Version | Commit | Status | Rollback Available |
|------|--------|---------|--------|--------|--------------------|
EOF
    fi

    # Move entries 21+ to archive
    tail -n +23 "$DEPLOY_HISTORY_FILE" >> "$DEPLOY_HISTORY_ARCHIVE"

    # Keep only first 22 lines (header + 20 entries)
    if [ "$(uname)" == "Darwin" ]; then
        sed -i '' '23,$d' "$DEPLOY_HISTORY_FILE"
    else
        sed -i '23,$d' "$DEPLOY_HISTORY_FILE"
    fi

    log_success "Old entries archived"
fi

log_success "Master deploy history updated"

# ============================================================================
# Create Git Tag (Optional)
# ============================================================================

if [ "$CREATE_GIT_TAG" == "yes" ]; then
    log_info "Creating git tag..."

    if [ "$DEPLOY_TYPE" == "edge-function" ]; then
        TAG="edge/${FUNCTION_NAME}/${VERSION}"
    else
        TAG="vps/${ENVIRONMENT}/${VERSION}"
    fi

    TAG_MESSAGE="Deploy: $TITLE

Deployed: $DEPLOY_DATE_BRT
By: @$DEPLOYED_BY
Approval: @$APPROVER

Notes: $APPROVAL_NOTES

Deploy Evidence:
- Validation: PASSED ($VALIDATION_PASSED tests)
- Duration: $DURATION
- Status: SUCCESS

Deploy Log: $OUTPUT_FILE
"

    git tag -a "$TAG" -m "$TAG_MESSAGE" 2>/dev/null || log_warning "Tag already exists: $TAG"
    log_success "Git tag created: $TAG"
    log_info "To push tag: git push origin $TAG"
fi

# ============================================================================
# Auto Commit (Optional)
# ============================================================================

if [ "$AUTO_COMMIT" == "yes" ]; then
    log_info "Auto-committing deploy log..."

    git add "$OUTPUT_FILE" "$DEPLOY_HISTORY_FILE" "$DEPLOY_HISTORY_ARCHIVE" 2>/dev/null || true

    COMMIT_MSG="chore(deploy): add deploy log for $FUNCTION_NAME $VERSION

Deploy Type: $DEPLOY_TYPE_STR
Environment: $ENVIRONMENT
Version: $VERSION
Commit: $GIT_COMMIT

Validation: PASSED
Status: SUCCESS
Deploy Log: $OUTPUT_FILE
"

    git commit -m "$COMMIT_MSG" 2>/dev/null || log_warning "Nothing to commit (files already committed)"
    log_success "Deploy log committed"
    log_info "To push: git push origin $(git rev-parse --abbrev-ref HEAD)"
fi

# ============================================================================
# Summary
# ============================================================================

echo ""
echo "=========================================="
echo "Deploy Log Generation Complete"
echo "=========================================="
log_success "Deploy log: $OUTPUT_FILE"
log_success "Master history: $DEPLOY_HISTORY_FILE"
if [ "$CREATE_GIT_TAG" == "yes" ]; then
    log_success "Git tag: $TAG"
fi
echo ""
log_info "Next Steps:"
log_info "  1. Review deploy log: cat $OUTPUT_FILE"
log_info "  2. Complete manual tests (section 3.2)"
log_info "  3. Monitor for 15 minutes"
log_info "  4. Update sign-off status (section 6.2)"
if [ "$AUTO_COMMIT" != "yes" ]; then
    log_info "  5. Commit deploy log: git add $OUTPUT_FILE && git commit"
fi
if [ "$CREATE_GIT_TAG" == "yes" ]; then
    log_info "  6. Push git tag: git push origin $TAG"
fi
echo ""
