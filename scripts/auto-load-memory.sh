#!/bin/bash
#
# auto-load-memory.sh - Intelligent Memory Loader
# Version: 2.0.0
#
# Analisa arquivos modificados na feature e auto-carrega memórias relevantes.
# Substitui o sistema hardcoded por detecção dinâmica baseada em conteúdo.
#
# Uso:
#   ./scripts/auto-load-memory.sh                      # Analisa git diff e carrega
#   ./scripts/auto-load-memory.sh --from-context       # Analisa spec.md + decisions.md (WF1) 🆕
#   ./scripts/auto-load-memory.sh --dry-run            # Preview sem carregar
#   ./scripts/auto-load-memory.sh --verbose            # Output detalhado
#   ./scripts/auto-load-memory.sh --from-context --dry-run  # Preview baseado em contexto
#
# Output:
#   .context/{branch}_auto-loaded-memory.md    # Memórias concatenadas
#   .context/{branch}_memory-analysis.md       # Relatório de análise
#

set -eo pipefail

# ==============================================================================
# CONFIGURATION
# ==============================================================================

MEMORY_DIR="${HOME}/.claude/memory"
CONTEXT_DIR=".context"
DRY_RUN=false
VERBOSE=false
FROM_CONTEXT=false

# Minimum relevance score to auto-load (0-100)
MIN_RELEVANCE_SCORE=30

# Weight multiplier for spec.md/decisions.md patterns (2x priority)
CONTEXT_WEIGHT_MULTIPLIER=2

# Temporary file for scores
SCORES_FILE=$(mktemp)
trap "rm -f $SCORES_FILE" EXIT

# ==============================================================================
# DOMAIN PATTERNS
# Format: pattern|memory_file|weight
# ==============================================================================

PATTERNS="
uazapi|uazapi.md|100
whatsapp|uazapi.md|90
webhook|uazapi.md|70
UAZAPI|uazapi.md|100
send_message|uazapi.md|60
wpp|uazapi.md|80
gemini|gemini.md|100
generateContent|gemini.md|90
tool_call|gemini.md|85
functionDeclarations|gemini.md|90
GEMINI_API|gemini.md|100
thinkingConfig|gemini.md|80
temperature|gemini.md|40
systemInstruction|gemini.md|70
supabase|supabase.md|90
migration|supabase.md|80
RLS|supabase.md|95
CREATE POLICY|supabase.md|90
lifetracker_|supabase.md|70
createClient|supabase.md|50
Deno.serve|edge-functions.md|100
edge-runtime|edge-functions.md|90
supabase/functions|edge-functions.md|85
no-verify-jwt|edge-functions.md|80
corsHeaders|edge-functions.md|60
docker|deployment.md|80
Dockerfile|deployment.md|90
swarm|deployment.md|85
traefik|deployment.md|80
rsync|deployment.md|70
VPS|deployment.md|75
git push|git.md|70
git merge|git.md|70
worktree|git.md|90
useState|frontend.md|50
useEffect|frontend.md|50
React.memo|frontend.md|70
useMemo|frontend.md|60
useCallback|frontend.md|60
tailwind|frontend.md|40
shadcn|frontend.md|50
vite|frontend.md|60
auth.uid|security.md|80
JWT|security.md|70
secret|security.md|90
password|security.md|80
OWASP|security.md|100
console.log|debugging.md|30
RCA|debugging.md|90
root cause|debugging.md|70
GATE|workflow.md|80
workflow|workflow.md|60
validation|workflow.md|40
system prompt|prompt.md|80
few-shot|prompt.md|90
PTCF|prompt.md|100
meta-framework|prompt.md|90
"

# ==============================================================================
# FUNCTIONS
# ==============================================================================

log() {
    echo -e "$1"
}

log_verbose() {
    if [[ "$VERBOSE" == "true" ]]; then
        echo -e "  $1"
    fi
}

get_branch_prefix() {
    local branch=$(git branch --show-current 2>/dev/null || echo "main")
    echo "${branch//\//-}"
}

get_changed_files() {
    local base_branch="main"

    # Try to find the base branch
    if git rev-parse --verify origin/main &>/dev/null; then
        base_branch="origin/main"
    elif git rev-parse --verify main &>/dev/null; then
        base_branch="main"
    elif git rev-parse --verify master &>/dev/null; then
        base_branch="master"
    fi

    # Get changed files (staged + unstaged + committed in branch)
    {
        git diff --name-only "$base_branch"...HEAD 2>/dev/null || true
        git diff --name-only --cached 2>/dev/null || true
        git diff --name-only 2>/dev/null || true
    } | sort -u | grep -E '\.(ts|tsx|js|jsx|sql|md|sh)$' || true
}

add_score() {
    local memory_file="$1"
    local score="$2"

    # Read current score
    local current=$(grep "^$memory_file:" "$SCORES_FILE" 2>/dev/null | cut -d: -f2 || echo 0)
    current=${current:-0}

    # Remove old entry and add new
    grep -v "^$memory_file:" "$SCORES_FILE" > "${SCORES_FILE}.tmp" 2>/dev/null || true
    mv "${SCORES_FILE}.tmp" "$SCORES_FILE"
    echo "$memory_file:$((current + score))" >> "$SCORES_FILE"
}

get_score() {
    local memory_file="$1"
    grep "^$memory_file:" "$SCORES_FILE" 2>/dev/null | cut -d: -f2 || echo 0
}

analyze_file_content() {
    local file="$1"

    if [[ ! -f "$file" ]]; then
        return
    fi

    local content=$(cat "$file" 2>/dev/null || echo "")

    echo "$PATTERNS" | while IFS='|' read -r pattern memory_file weight; do
        [[ -z "$pattern" ]] && continue

        # Count occurrences (case-sensitive)
        local count=$(echo "$content" | grep -o "$pattern" 2>/dev/null | wc -l | tr -d ' ')

        if [[ "$count" -gt 0 ]]; then
            # Cap count at 10 for scoring
            local effective_count=$((count > 10 ? 10 : count))
            local score=$((weight * effective_count / 10))
            score=$((score < weight ? score : weight))

            add_score "$memory_file" "$score"
            log_verbose "Found '$pattern' x$count in $file → $memory_file (+$score)"
        fi
    done
}

analyze_branch_name() {
    local branch="$1"

    echo "$PATTERNS" | while IFS='|' read -r pattern memory_file weight; do
        [[ -z "$pattern" ]] && continue

        # Check if pattern is in branch name (case-insensitive)
        if echo "$branch" | grep -qi "$pattern" 2>/dev/null; then
            add_score "$memory_file" "$weight"
            log_verbose "Branch match: '$pattern' → $memory_file (+$weight)"
        fi
    done
}

analyze_context_files() {
    local branch_prefix="$1"

    # Files to analyze from WF1 context
    local spec_file="${CONTEXT_DIR}/${branch_prefix}_spec.md"
    local decisions_file="${CONTEXT_DIR}/${branch_prefix}_decisions.md"

    log ""
    log "📋 Analyzing WF1 context files (2x weight)..."

    # Analyze spec.md if exists
    if [[ -f "$spec_file" ]]; then
        log "   📄 spec.md found"
        local content=$(cat "$spec_file" 2>/dev/null || echo "")

        echo "$PATTERNS" | while IFS='|' read -r pattern memory_file weight; do
            [[ -z "$pattern" ]] && continue

            local count=$(echo "$content" | grep -oi "$pattern" 2>/dev/null | wc -l | tr -d ' ')
            if [[ "$count" -gt 0 ]]; then
                # Apply 2x multiplier for context files
                local weighted_score=$((weight * CONTEXT_WEIGHT_MULTIPLIER))
                local effective_count=$((count > 10 ? 10 : count))
                local score=$((weighted_score * effective_count / 10))
                score=$((score < weighted_score ? score : weighted_score))

                add_score "$memory_file" "$score"
                log_verbose "spec.md: '$pattern' x$count → $memory_file (+$score, 2x weight)"
            fi
        done
    else
        log "   ⚠️ spec.md not found: $spec_file"
    fi

    # Analyze decisions.md if exists
    if [[ -f "$decisions_file" ]]; then
        log "   📄 decisions.md found"
        local content=$(cat "$decisions_file" 2>/dev/null || echo "")

        echo "$PATTERNS" | while IFS='|' read -r pattern memory_file weight; do
            [[ -z "$pattern" ]] && continue

            local count=$(echo "$content" | grep -oi "$pattern" 2>/dev/null | wc -l | tr -d ' ')
            if [[ "$count" -gt 0 ]]; then
                # Apply 2x multiplier for context files
                local weighted_score=$((weight * CONTEXT_WEIGHT_MULTIPLIER))
                local effective_count=$((count > 10 ? 10 : count))
                local score=$((weighted_score * effective_count / 10))
                score=$((score < weighted_score ? score : weighted_score))

                add_score "$memory_file" "$score"
                log_verbose "decisions.md: '$pattern' x$count → $memory_file (+$score, 2x weight)"
            fi
        done
    else
        log "   ⚠️ decisions.md not found: $decisions_file"
    fi
}

get_sorted_scores() {
    sort -t: -k2 -rn "$SCORES_FILE" 2>/dev/null || true
}

generate_analysis_report() {
    local branch_prefix="$1"
    local output_file="${CONTEXT_DIR}/${branch_prefix}_memory-analysis.md"

    cat > "$output_file" << EOF
# Memory Analysis Report

**Branch**: $(git branch --show-current 2>/dev/null || echo "unknown")
**Generated**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M:%S BRT')
**Script**: auto-load-memory.sh v1.0.0

## Relevance Scores

| Memory File | Score | Status |
|-------------|-------|--------|
EOF

    get_sorted_scores | while IFS=: read -r memory_file score; do
        [[ -z "$memory_file" ]] && continue
        local status="❌ Skipped"
        if [[ "$score" -ge "$MIN_RELEVANCE_SCORE" ]]; then
            status="✅ Loaded"
        fi
        echo "| $memory_file | $score | $status |" >> "$output_file"
    done

    cat >> "$output_file" << EOF

## Detection Criteria

- **Minimum Score**: $MIN_RELEVANCE_SCORE
- **Method**: Content analysis of modified files + branch name
- **Patterns**: $(echo "$PATTERNS" | grep -c '|' || echo 0) domain patterns

## Files Analyzed

EOF

    get_changed_files | while read -r file; do
        [[ -n "$file" ]] && echo "- \`$file\`" >> "$output_file"
    done

    echo "" >> "$output_file"
    echo "---" >> "$output_file"
    echo "*Auto-generated by auto-load-memory.sh*" >> "$output_file"
}

load_memories() {
    local branch_prefix="$1"
    local output_file="${CONTEXT_DIR}/${branch_prefix}_auto-loaded-memory.md"
    local loaded_count=0

    cat > "$output_file" << EOF
# Auto-Loaded Memories

**Branch**: $(git branch --show-current 2>/dev/null || echo "unknown")
**Generated**: $(TZ='America/Sao_Paulo' date '+%Y-%m-%d %H:%M:%S BRT')

> These memories were automatically loaded based on content analysis of your feature.
> Relevance threshold: $MIN_RELEVANCE_SCORE

---

EOF

    get_sorted_scores | while IFS=: read -r memory_file score; do
        [[ -z "$memory_file" ]] && continue

        if [[ "$score" -ge "$MIN_RELEVANCE_SCORE" ]]; then
            local full_path="${MEMORY_DIR}/${memory_file}"

            if [[ -f "$full_path" ]]; then
                log "  ✅ Loading $memory_file (score: $score)"

                echo "" >> "$output_file"
                echo "## 📚 $memory_file (Relevance: $score)" >> "$output_file"
                echo "" >> "$output_file"

                # Load first 300 lines (summary) or full file if smaller
                local line_count=$(wc -l < "$full_path" | tr -d ' ')
                if [[ "$line_count" -gt 300 ]]; then
                    head -300 "$full_path" >> "$output_file"
                    echo "" >> "$output_file"
                    echo "*[Truncated - showing first 300 of $line_count lines. Read full file if needed.]*" >> "$output_file"
                else
                    cat "$full_path" >> "$output_file"
                fi

                echo "" >> "$output_file"
                echo "---" >> "$output_file"

                echo "$memory_file" # Output for counting
            fi
        fi
    done
}

# ==============================================================================
# MAIN
# ==============================================================================

main() {
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --verbose|-v)
                VERBOSE=true
                shift
                ;;
            --from-context)
                FROM_CONTEXT=true
                shift
                ;;
            *)
                shift
                ;;
        esac
    done

    log "🧠 Auto-Load Memory v2.0.0"
    if [[ "$FROM_CONTEXT" == "true" ]]; then
        log "   Mode: --from-context (analyzing spec.md + decisions.md with 2x weight)"
    fi
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # Ensure we're in a git repo
    if ! git rev-parse --git-dir &>/dev/null; then
        log "❌ Not a git repository"
        exit 1
    fi

    # Ensure context directory exists
    mkdir -p "$CONTEXT_DIR"

    # Get branch prefix
    local branch_prefix=$(get_branch_prefix)
    log "📍 Branch: $branch_prefix"

    # Get changed files
    log ""
    log "📁 Analyzing changed files..."
    local changed_files=$(get_changed_files)
    local file_count=$(echo "$changed_files" | grep -c . || echo 0)
    log "   Found $file_count files to analyze"

    # Analyze branch name first
    local branch=$(git branch --show-current 2>/dev/null || echo "")
    analyze_branch_name "$branch"

    # Analyze WF1 context files if --from-context flag is set (2x priority)
    if [[ "$FROM_CONTEXT" == "true" ]]; then
        analyze_context_files "$branch_prefix"
    fi

    # Analyze each changed file
    if [[ "$file_count" -gt 0 ]]; then
        echo "$changed_files" | while IFS= read -r file; do
            [[ -z "$file" ]] && continue
            log_verbose "Analyzing: $file"
            analyze_file_content "$file"
        done
    fi

    # Show results
    log ""
    log "📊 Relevance Scores:"
    log "   (Minimum to load: $MIN_RELEVANCE_SCORE)"
    log ""

    local has_relevant=false
    get_sorted_scores | while IFS=: read -r memory_file score; do
        [[ -z "$memory_file" ]] && continue
        local icon="⬚"
        if [[ "$score" -ge "$MIN_RELEVANCE_SCORE" ]]; then
            icon="✅"
            has_relevant=true
        fi
        printf "   %s %-25s %4s\n" "$icon" "$memory_file" "$score"
    done

    # Check if any relevant
    local total_relevant=$(get_sorted_scores | while IFS=: read -r mf sc; do
        [[ "$sc" -ge "$MIN_RELEVANCE_SCORE" ]] && echo "1"
    done | wc -l | tr -d ' ')

    if [[ "$total_relevant" -eq 0 ]]; then
        log ""
        log "⚠️  No memories reached minimum relevance score ($MIN_RELEVANCE_SCORE)"
        log "   This may be a simple feature or patterns not yet mapped."

        # Generate report anyway
        generate_analysis_report "$branch_prefix"
        log ""
        log "📄 Analysis report: ${CONTEXT_DIR}/${branch_prefix}_memory-analysis.md"
        exit 0
    fi

    # Generate analysis report
    generate_analysis_report "$branch_prefix"

    if [[ "$DRY_RUN" == "true" ]]; then
        log ""
        log "🔸 DRY RUN - No memories loaded"
        log "   Run without --dry-run to load memories"
        exit 0
    fi

    # Load memories
    log ""
    log "📥 Loading relevant memories..."
    local loaded_files=$(load_memories "$branch_prefix")
    local loaded_count=$(echo "$loaded_files" | grep -c . || echo 0)

    log ""
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log "✅ Complete!"
    log ""
    log "   📚 Memories loaded: $loaded_count"
    log "   📄 Memory file: ${CONTEXT_DIR}/${branch_prefix}_auto-loaded-memory.md"
    log "   📊 Analysis: ${CONTEXT_DIR}/${branch_prefix}_memory-analysis.md"
    log ""
    log "💡 Tip: Read the auto-loaded memory before implementing!"
}

main "$@"
