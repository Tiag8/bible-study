#!/bin/bash

# deploy-with-evidence.sh
# Deploy Edge Function and automatically collect evidence
# Wrapper around Supabase deploy + evidence-collector.sh

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

FUNCTION_NAME=""
COLLECT_SCREENSHOTS=false

print_msg() {
    local color=$1
    shift
    echo -e "${color}$*${NC}"
}

print_header() {
    echo ""
    print_msg "$CYAN" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    print_msg "$CYAN" "  $1"
    print_msg "$CYAN" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

usage() {
    cat << EOF
Usage: $0 --function <name> [OPTIONS]

Deploy Edge Function and collect evidence artifacts.

OPTIONS:
    --function <name>       Function name (required)
    --screenshots           Prompt for screenshots after deploy
    --help                  Show this help message

EXAMPLE:
    $0 --function gemini-chat-handler-v2 --screenshots

EOF
    exit 1
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --function)
            FUNCTION_NAME="$2"
            shift 2
            ;;
        --screenshots)
            COLLECT_SCREENSHOTS=true
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

if [[ -z "$FUNCTION_NAME" ]]; then
    print_msg "$RED" "Error: --function required"
    usage
fi

# Get current commit SHA (previous state)
PREVIOUS_SHA=$(git rev-parse HEAD)

print_header "Deploy with Evidence Collection"
print_msg "$CYAN" "Function: $FUNCTION_NAME"
print_msg "$CYAN" "Previous SHA: $PREVIOUS_SHA"

# Deploy
print_header "Deploying Function"
print_msg "$BLUE" "Running: supabase functions deploy $FUNCTION_NAME"

DEPLOY_LOG="/tmp/supabase-deploy-${FUNCTION_NAME}.log"

if supabase functions deploy "$FUNCTION_NAME" 2>&1 | tee "$DEPLOY_LOG"; then
    print_msg "$GREEN" "✅ Deploy successful"
else
    print_msg "$RED" "❌ Deploy failed"
    exit 1
fi

# Commit changes (if any)
print_header "Committing Changes"

if git diff --quiet && git diff --cached --quiet; then
    print_msg "$YELLOW" "⚠️  No changes to commit (already committed?)"
    CURRENT_SHA=$PREVIOUS_SHA
else
    print_msg "$BLUE" "Staging changes..."
    git add "supabase/functions/$FUNCTION_NAME/"

    print_msg "$BLUE" "Creating commit..."
    git commit -m "feat(edge): deploy $FUNCTION_NAME

- Function: $FUNCTION_NAME
- Deploy: $(TZ=America/Sao_Paulo date)
- Previous SHA: $PREVIOUS_SHA

Evidence: Collected automatically via deploy-with-evidence.sh"

    CURRENT_SHA=$(git rev-parse HEAD)
    print_msg "$GREEN" "✅ Commit created: $CURRENT_SHA"
fi

# Collect evidence
print_header "Collecting Evidence"

EVIDENCE_ARGS="--function $FUNCTION_NAME --previous-sha $PREVIOUS_SHA --current-sha $CURRENT_SHA"

if $COLLECT_SCREENSHOTS; then
    EVIDENCE_ARGS="$EVIDENCE_ARGS --screenshots"
fi

if ./scripts/evidence-collector.sh $EVIDENCE_ARGS; then
    print_msg "$GREEN" "✅ Evidence collection complete"
else
    print_msg "$RED" "❌ Evidence collection failed"
    exit 1
fi

print_header "Deploy + Evidence Complete"
print_msg "$GREEN" "🎉 Success!"
echo ""
print_msg "$YELLOW" "Next steps:"
print_msg "$BLUE" "  1. Review evidence in ./evidence/"
print_msg "$BLUE" "  2. Push commit: git push origin <branch>"
print_msg "$BLUE" "  3. Create PR with evidence attached"
echo ""
