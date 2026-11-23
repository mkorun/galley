#!/usr/bin/env bash
# The gate before every commit; --release also runs one complete mutation campaign.
set -euo pipefail
cd "$(dirname "$0")"
require_clean_tree() {
  local tree_status dist_status
  tree_status=$(git status --porcelain --untracked-files=all)
  dist_status=$(git status --porcelain --ignored --untracked-files=all -- dist)
  if [[ -n $tree_status || -n $dist_status ]]; then
    echo 'check.sh: --release requires a clean tree (including untracked files and ignored files under dist/)' >&2
    exit 1
  fi
}
release=false
if [[ $# -eq 1 && $1 == --release ]]; then
  require_clean_tree
  if ! command -v gitleaks >/dev/null; then
    echo 'check.sh: --release requires gitleaks on PATH' >&2
    exit 1
  fi
  release=true
elif [[ $# -ne 0 ]]; then
  echo 'usage: ./check.sh [--release]' >&2
  exit 2
fi
bash tests/support/check-release-tree.sh
python3 tests/mutate-context.py --list
bun run typecheck
bun test --coverage
bun run build
git diff --exit-code -- dist
if command -v gitleaks >/dev/null; then
  gitleaks git . --redact --no-banner --log-level warn
else
  echo 'check.sh: gitleaks is left out without it'
fi
if [[ $release == true ]]; then
  python3 tests/mutate-context.py
  require_clean_tree
fi
