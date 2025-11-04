#!/bin/sh

# Get the current branch name
branch_name=$(git symbolic-ref --short HEAD 2>/dev/null)

# Skip validation for main branches
if [ "$branch_name" = "main" ] || [ "$branch_name" = "master" ] || [ "$branch_name" = "development" ] || [ "$branch_name" = "staging" ]; then
  exit 0
fi

# Branch name pattern: type/description-in-kebab-case
# Valid types: feature, fix, chore, docs, refactor, perf, test, build, ci, revert
branch_pattern="^(feature|fix|chore|docs|refactor|perf|test|build|ci|revert)\/[a-z0-9-]+$"

if ! echo "$branch_name" | grep -qE "$branch_pattern"; then
  echo ""
  echo "❌ Invalid branch name: '$branch_name'"
  echo ""
  echo "Branch names must follow the pattern: <type>/<description-in-kebab-case>"
  echo ""
  echo "Valid types:"
  echo "  • feature/   - New features"
  echo "  • fix/       - Bug fixes"
  echo "  • chore/     - Maintenance tasks"
  echo "  • docs/      - Documentation changes"
  echo "  • refactor/  - Code refactoring"
  echo "  • perf/      - Performance improvements"
  echo "  • test/      - Adding/updating tests"
  echo "  • build/     - Build system changes"
  echo "  • ci/        - CI/CD changes"
  echo "  • revert/    - Reverting changes"
  echo ""
  echo "Examples:"
  echo "  ✅ feature/user-authentication"
  echo "  ✅ fix/login-redirect-issue"
  echo "  ✅ docs/setup-instructions"
  echo "  ✅ refactor/api-calls"
  echo ""
  exit 1
fi

exit 0

