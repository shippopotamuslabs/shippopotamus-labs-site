#!/usr/bin/env bash
# Scan web source and build output for secret-like patterns. Prints file:line
# and pattern name only — never the matched value.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SCAN_DIRS=("$ROOT/src")
if [[ -d "$ROOT/dist" ]]; then
  SCAN_DIRS+=("$ROOT/dist")
fi

PATTERNS=(
  "sk_live"
  "sk_test"
  "whsec_"
  "BEGIN PRIVATE"
  "firebase-admin"
)

found=0

for pattern in "${PATTERNS[@]}"; do
  while IFS= read -r file; do
    [[ -z "$file" ]] && continue
    while IFS= read -r lineno; do
      [[ -z "$lineno" ]] && continue
      echo "${file}:${lineno}: ${pattern}"
      found=1
    done < <(grep -n -F "$pattern" "$file" 2>/dev/null | cut -d: -f1 || true)
  done < <(grep -l -R -F "$pattern" "${SCAN_DIRS[@]}" 2>/dev/null || true)
done

if [[ "$found" -ne 0 ]]; then
  echo "secret-scan: found forbidden pattern(s) above" >&2
  exit 1
fi

echo "secret-scan: clean"
