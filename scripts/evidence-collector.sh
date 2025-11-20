#!/bin/bash

# evidence-collector.sh
# Automated evidence collection for Edge Function deploys
# Collects git diffs, commits, validation results, metrics, logs, and prompts for screenshots

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default values
FUNCTION_NAME=""
PREVIOUS_SHA=""
CURRENT_SHA=""
OUTPUT_DIR=""
SCREENSHOTS=false
TIMEZONE="America/Sao_Paulo"

# Helper: Print colored message
print_msg() {
    local color=$1
    shift
    echo -e "${color}$*${NC}"
}

# Helper: Print header
print_header() {
    echo ""
    print_msg "$CYAN" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    print_msg "$CYAN" "  $1"
    print_msg "$CYAN" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# Helper: Confirm action
confirm() {
    local prompt=$1
    local response
    echo ""
    print_msg "$YELLOW" "$prompt (yes/no): "
    read -r response
    [[ "$response" =~ ^(yes|y|YES|Y)$ ]]
}

# Usage
usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Collect deployment evidence artifacts for Edge Functions.

OPTIONS:
    --function <name>       Function name (required)
    --previous-sha <sha>    Previous commit SHA (required)
    --current-sha <sha>     Current commit SHA (required)
    --output-dir <dir>      Output directory (default: auto-generated)
    --screenshots           Prompt for screenshots (interactive)
    --help                  Show this help message

EXAMPLE:
    $0 \\
      --function gemini-chat-handler-v2 \\
      --previous-sha def456 \\
      --current-sha abc123 \\
      --screenshots

EOF
    exit 1
}

# Parse arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --function)
                FUNCTION_NAME="$2"
                shift 2
                ;;
            --previous-sha)
                PREVIOUS_SHA="$2"
                shift 2
                ;;
            --current-sha)
                CURRENT_SHA="$2"
                shift 2
                ;;
            --output-dir)
                OUTPUT_DIR="$2"
                shift 2
                ;;
            --screenshots)
                SCREENSHOTS=true
                shift
                ;;
            --help)
                usage
                ;;
            *)
                print_msg "$RED" "Unknown option: $1"
                usage
                ;;
        esac
    done

    # Validate required arguments
    if [[ -z "$FUNCTION_NAME" ]] || [[ -z "$PREVIOUS_SHA" ]] || [[ -z "$CURRENT_SHA" ]]; then
        print_msg "$RED" "Error: Missing required arguments"
        usage
    fi
}

# Initialize output directory
init_output_dir() {
    if [[ -z "$OUTPUT_DIR" ]]; then
        # Auto-generate directory name with timezone-aware timestamp
        local timestamp
        timestamp=$(TZ="$TIMEZONE" date +"%Y%m%d-%H%M%S")
        OUTPUT_DIR="./evidence/${timestamp}"
    fi

    print_header "Initializing Evidence Directory"
    print_msg "$BLUE" "Output: $OUTPUT_DIR"

    # Create directory structure
    mkdir -p "$OUTPUT_DIR/screenshots"

    print_msg "$GREEN" "✅ Directory structure created"
}

# Collect git diff
collect_git_diff() {
    print_header "Collecting Git Diff"

    local diff_file="$OUTPUT_DIR/git-diff.txt"
    local function_path="supabase/functions/$FUNCTION_NAME"

    print_msg "$BLUE" "Comparing: $PREVIOUS_SHA → $CURRENT_SHA"
    print_msg "$BLUE" "Path: $function_path"

    # Generate git diff
    if git diff "$PREVIOUS_SHA" "$CURRENT_SHA" -- "$function_path" > "$diff_file"; then
        local line_count
        line_count=$(wc -l < "$diff_file" | tr -d ' ')
        print_msg "$GREEN" "✅ Git diff collected ($line_count lines)"
        echo "$line_count"
    else
        print_msg "$YELLOW" "⚠️  No changes detected (empty diff)"
        echo "0"
    fi
}

# Collect commit log
collect_commit_log() {
    print_header "Collecting Commit Log"

    local commit_file="$OUTPUT_DIR/commit-log.txt"
    local function_path="supabase/functions/$FUNCTION_NAME"

    print_msg "$BLUE" "Extracting commits: $PREVIOUS_SHA → $CURRENT_SHA"

    # Generate commit log (detailed)
    {
        echo "Commits affecting $FUNCTION_NAME:"
        echo ""
        git log "$PREVIOUS_SHA..$CURRENT_SHA" --pretty=format:"%h - %an, %ar : %s" -- "$function_path"
        echo ""
        echo ""
        echo "Full commit details:"
        echo ""
        git log "$PREVIOUS_SHA..$CURRENT_SHA" --stat -- "$function_path"
    } > "$commit_file"

    local commit_count
    commit_count=$(git rev-list "$PREVIOUS_SHA..$CURRENT_SHA" -- "$function_path" | wc -l | tr -d ' ')

    print_msg "$GREEN" "✅ Commit log collected ($commit_count commits)"
    echo "$commit_count"
}

# Collect deploy log (simulate or capture real output)
collect_deploy_log() {
    print_header "Collecting Deploy Log"

    local deploy_file="$OUTPUT_DIR/deploy.log"

    print_msg "$BLUE" "Capturing Supabase deploy output..."

    # Check if deploy log exists (from previous deploy)
    if [[ -f "/tmp/supabase-deploy-${FUNCTION_NAME}.log" ]]; then
        cp "/tmp/supabase-deploy-${FUNCTION_NAME}.log" "$deploy_file"
        print_msg "$GREEN" "✅ Deploy log captured from /tmp"
    else
        # Generate placeholder (user should have run deploy-with-evidence.sh)
        {
            echo "Deploy log for $FUNCTION_NAME"
            echo "Timestamp: $(TZ="$TIMEZONE" date)"
            echo ""
            echo "⚠️  No deploy log found in /tmp"
            echo "Expected: /tmp/supabase-deploy-${FUNCTION_NAME}.log"
            echo ""
            echo "To capture deploy logs automatically, use:"
            echo "  ./scripts/deploy-with-evidence.sh --function $FUNCTION_NAME"
        } > "$deploy_file"
        print_msg "$YELLOW" "⚠️  Deploy log not found (placeholder created)"
    fi
}

# Collect validation results
collect_validation_results() {
    print_header "Collecting Validation Results"

    local validation_file="$OUTPUT_DIR/validation.log"

    print_msg "$BLUE" "Running validation script..."

    # Run validation script (if exists)
    if [[ -f "./scripts/validate-edge-function-deploy.sh" ]]; then
        if ./scripts/validate-edge-function-deploy.sh --function "$FUNCTION_NAME" > "$validation_file" 2>&1; then
            print_msg "$GREEN" "✅ Validation passed"
            echo "true"
        else
            print_msg "$RED" "❌ Validation failed (check validation.log)"
            echo "false"
        fi
    else
        {
            echo "Validation script not found"
            echo "Expected: ./scripts/validate-edge-function-deploy.sh"
            echo ""
            echo "Skipping validation..."
        } > "$validation_file"
        print_msg "$YELLOW" "⚠️  Validation script not found"
        echo "unknown"
    fi
}

# Collect latency metrics
collect_latency_metrics() {
    print_header "Collecting Latency Metrics"

    local metrics_file="$OUTPUT_DIR/latency-metrics.json"

    print_msg "$BLUE" "Measuring latency (100 requests)..."
    print_msg "$YELLOW" "This may take 1-2 minutes..."

    # Get function URL (from Supabase CLI)
    local function_url
    if ! function_url=$(supabase functions list --json 2>/dev/null | jq -r ".[] | select(.name == \"$FUNCTION_NAME\") | .url"); then
        print_msg "$YELLOW" "⚠️  Cannot detect function URL (manual measurement needed)"
        {
            echo "{"
            echo "  \"error\": \"Cannot detect function URL\","
            echo "  \"manual_test_required\": true"
            echo "}"
        } > "$metrics_file"
        return
    fi

    # Measure latency (100 requests)
    local latencies=()
    local error_count=0

    for i in {1..100}; do
        local start
        start=$(date +%s%N)

        if curl -s -o /dev/null -w "%{http_code}" -X POST "$function_url" \
            -H "Content-Type: application/json" \
            -d '{"test": "latency"}' > /dev/null 2>&1; then
            local end
            end=$(date +%s%N)
            local latency_ms=$(( (end - start) / 1000000 ))
            latencies+=("$latency_ms")
        else
            ((error_count++))
        fi

        # Progress indicator
        if (( i % 10 == 0 )); then
            echo -n "."
        fi
    done
    echo ""

    # Calculate percentiles
    if [[ ${#latencies[@]} -gt 0 ]]; then
        local sorted
        sorted=$(printf '%s\n' "${latencies[@]}" | sort -n)
        local p50
        local p95
        local p99
        p50=$(echo "$sorted" | awk "NR==$(( ${#latencies[@]} / 2 ))")
        p95=$(echo "$sorted" | awk "NR==$(( ${#latencies[@]} * 95 / 100 ))")
        p99=$(echo "$sorted" | awk "NR==$(( ${#latencies[@]} * 99 / 100 ))")

        # Write JSON
        {
            echo "{"
            echo "  \"function\": \"$FUNCTION_NAME\","
            echo "  \"timestamp\": \"$(TZ="$TIMEZONE" date -Iseconds)\","
            echo "  \"requests_total\": 100,"
            echo "  \"requests_success\": $((100 - error_count)),"
            echo "  \"requests_failed\": $error_count,"
            echo "  \"error_rate\": $(awk "BEGIN {printf \"%.2f\", $error_count / 100}"),"
            echo "  \"latency_p50_ms\": $p50,"
            echo "  \"latency_p95_ms\": $p95,"
            echo "  \"latency_p99_ms\": $p99"
            echo "}"
        } > "$metrics_file"

        print_msg "$GREEN" "✅ Latency metrics collected (p95: ${p95}ms, errors: $error_count)"
        echo "$p95"
    else
        print_msg "$YELLOW" "⚠️  No successful requests (all failed)"
        echo "null"
    fi
}

# Collect error logs
collect_error_logs() {
    print_header "Collecting Error Logs"

    local error_file="$OUTPUT_DIR/error-logs.txt"

    print_msg "$BLUE" "Fetching Supabase function logs (last 50 lines)..."

    # Get logs from Supabase
    if supabase functions logs "$FUNCTION_NAME" --limit 50 > "$error_file" 2>&1; then
        local error_count
        error_count=$(grep -ci "error" "$error_file" || echo "0")
        print_msg "$GREEN" "✅ Error logs collected ($error_count errors found)"
        echo "$error_count"
    else
        print_msg "$YELLOW" "⚠️  Cannot fetch logs (check Supabase CLI)"
        echo "unknown"
    fi
}

# Collect function metadata
collect_function_metadata() {
    print_header "Collecting Function Metadata"

    local function_path="supabase/functions/$FUNCTION_NAME"

    print_msg "$BLUE" "Analyzing function metadata..."

    # Count files
    local file_count
    file_count=$(find "$function_path" -type f | wc -l | tr -d ' ')

    # Calculate size
    local size_kb
    size_kb=$(du -sk "$function_path" | awk '{print $1}')

    # List dependencies (from import statements)
    local dependencies
    dependencies=$(grep -rh "^import\|^from" "$function_path" 2>/dev/null | \
                   sed 's/.*from //; s/.*import //; s/[";].*//; s/ .*$//' | \
                   sort -u | wc -l | tr -d ' ')

    print_msg "$GREEN" "✅ Metadata: $file_count files, ${size_kb}KB, $dependencies dependencies"

    echo "$file_count|$size_kb|$dependencies"
}

# Prompt for screenshots
prompt_screenshots() {
    print_header "Screenshot Collection (Manual)"

    if ! $SCREENSHOTS; then
        print_msg "$YELLOW" "⚠️  Screenshot collection skipped (use --screenshots to enable)"
        return
    fi

    local screenshots=()

    # Supabase Dashboard
    echo ""
    print_msg "$CYAN" "📸 Screenshot 1: Supabase Dashboard"
    print_msg "$BLUE" "   - Open: https://supabase.com/dashboard/project/_/functions"
    print_msg "$BLUE" "   - Show: $FUNCTION_NAME deployed + status healthy"
    echo ""
    if confirm "Have you taken the screenshot?"; then
        print_msg "$YELLOW" "Enter screenshot filename (in $OUTPUT_DIR/screenshots/):"
        read -r filename
        if [[ -n "$filename" ]]; then
            screenshots+=("screenshots/$filename")
            print_msg "$GREEN" "✅ Added: $filename"
        fi
    fi

    # Smoke Test
    echo ""
    print_msg "$CYAN" "📸 Screenshot 2: Smoke Test Results"
    print_msg "$BLUE" "   - Tool: Postman / curl / browser"
    print_msg "$BLUE" "   - Show: 200 OK response + payload"
    echo ""
    if confirm "Have you taken the screenshot?"; then
        print_msg "$YELLOW" "Enter screenshot filename:"
        read -r filename
        if [[ -n "$filename" ]]; then
            screenshots+=("screenshots/$filename")
            print_msg "$GREEN" "✅ Added: $filename"
        fi
    fi

    # Real-World Test
    echo ""
    print_msg "$CYAN" "📸 Screenshot 3: Real-World Test"
    print_msg "$BLUE" "   - Example: WhatsApp conversation / UI interaction"
    print_msg "$BLUE" "   - Show: Feature working in production"
    echo ""
    if confirm "Have you taken the screenshot?"; then
        print_msg "$YELLOW" "Enter screenshot filename:"
        read -r filename
        if [[ -n "$filename" ]]; then
            screenshots+=("screenshots/$filename")
            print_msg "$GREEN" "✅ Added: $filename"
        fi
    fi

    # Return JSON array
    printf '%s\n' "${screenshots[@]}" | jq -R . | jq -s .
}

# Generate metadata.json
generate_metadata() {
    local git_diff_lines=$1
    local commits_count=$2
    local validation_passed=$3
    local latency_p95=$4
    local error_count=$5
    local function_meta=$6
    local screenshots_json=$7

    print_header "Generating metadata.json"

    local metadata_file="$OUTPUT_DIR/metadata.json"
    local timestamp
    timestamp=$(TZ="$TIMEZONE" date -Iseconds)

    # Parse function metadata
    IFS='|' read -r file_count size_kb dependencies <<< "$function_meta"

    # Determine evidence completeness
    local evidence_complete=true
    if [[ "$validation_passed" == "false" ]] || [[ "$validation_passed" == "unknown" ]]; then
        evidence_complete=false
    fi

    # Write JSON
    cat > "$metadata_file" << EOF
{
  "function": "$FUNCTION_NAME",
  "timestamp": "$timestamp",
  "timezone": "$TIMEZONE",
  "previous_sha": "$PREVIOUS_SHA",
  "current_sha": "$CURRENT_SHA",
  "git_diff_lines": $git_diff_lines,
  "commits_count": $commits_count,
  "validation_passed": $validation_passed,
  "latency_p95_ms": $latency_p95,
  "error_count": $error_count,
  "function_metadata": {
    "file_count": $file_count,
    "size_kb": $size_kb,
    "dependencies_count": $dependencies
  },
  "screenshots": $screenshots_json,
  "evidence_complete": $evidence_complete,
  "evidence_directory": "$OUTPUT_DIR"
}
EOF

    print_msg "$GREEN" "✅ metadata.json generated"
}

# Generate summary report
generate_summary() {
    print_header "Evidence Collection Summary"

    echo ""
    print_msg "$CYAN" "📦 Function: $FUNCTION_NAME"
    print_msg "$CYAN" "📁 Output: $OUTPUT_DIR"
    echo ""

    print_msg "$BLUE" "📋 Collected Evidence:"
    echo "   ✅ git-diff.txt"
    echo "   ✅ commit-log.txt"
    echo "   ✅ deploy.log"
    echo "   ✅ validation.log"
    echo "   ✅ latency-metrics.json"
    echo "   ✅ error-logs.txt"
    echo "   ✅ metadata.json"

    if $SCREENSHOTS; then
        echo "   ✅ screenshots/ (interactive)"
    else
        echo "   ⏭️  screenshots/ (skipped)"
    fi

    echo ""
    print_msg "$GREEN" "🎉 Evidence collection complete!"
    echo ""
    print_msg "$YELLOW" "Next steps:"
    print_msg "$BLUE" "  1. Review metadata.json"
    print_msg "$BLUE" "  2. Verify all evidence files"
    print_msg "$BLUE" "  3. Archive evidence: tar -czf evidence.tar.gz $OUTPUT_DIR"
    print_msg "$BLUE" "  4. Attach to PR or deployment docs"
    echo ""
}

# Main
main() {
    parse_args "$@"

    print_header "Evidence Collection for Edge Function Deploy"
    print_msg "$CYAN" "Function: $FUNCTION_NAME"
    print_msg "$CYAN" "Comparison: $PREVIOUS_SHA → $CURRENT_SHA"

    init_output_dir

    # Collect all evidence
    local git_diff_lines
    git_diff_lines=$(collect_git_diff)

    local commits_count
    commits_count=$(collect_commit_log)

    collect_deploy_log

    local validation_passed
    validation_passed=$(collect_validation_results)

    local latency_p95
    latency_p95=$(collect_latency_metrics)

    local error_count
    error_count=$(collect_error_logs)

    local function_meta
    function_meta=$(collect_function_metadata)

    local screenshots_json
    screenshots_json=$(prompt_screenshots)

    # Generate metadata
    generate_metadata \
        "$git_diff_lines" \
        "$commits_count" \
        "$validation_passed" \
        "${latency_p95:-null}" \
        "${error_count:-0}" \
        "$function_meta" \
        "${screenshots_json:-[]}"

    # Summary
    generate_summary
}

# Run
main "$@"
