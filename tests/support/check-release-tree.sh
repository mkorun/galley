#!/usr/bin/env bash
# Keep release validation independent of private records and machine-specific paths.
set -euo pipefail
cd "$(dirname "$0")/../.."

records_directory=evidence
machine_directory=work
if [[ -e "$records_directory" || -L "$records_directory" ]]; then
  printf 'Release tree contains %s\n' "$records_directory" >&2
  exit 1
fi

check_absent() {
  local prefix=$1
  shift
  local status=0
  git grep -n -F -e "$prefix" -- . "$@" || status=$?
  case "$status" in
    0) printf 'Release tree contains %s\n' "$prefix" >&2; exit 1 ;;
    1) ;;
    *) printf 'git grep failed (exit %s)\n' "$status" >&2; exit "$status" ;;
  esac
}

check_absent "$records_directory/" ':!CHANGELOG.md'
check_absent "/$machine_directory/"
printf '%s\n' 'Release tree checks passed.'
