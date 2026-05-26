#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

log() {
  printf '\n==> %s\n' "$1"
}

has_command() {
  command -v "$1" >/dev/null 2>&1
}

has_package_script() {
  local script_name="$1"
  bun -e "const pkg = require('./package.json'); process.exit(pkg.scripts && pkg.scripts['$script_name'] ? 0 : 1)" >/dev/null 2>&1
}

run_package_script_if_found() {
  local script_name="$1"

  if has_package_script "$script_name"; then
    log "Running bun run $script_name"
    bun run "$script_name"
  else
    log "Skipping $script_name because it was not found in package.json"
  fi
}

if ! has_command bun; then
  echo "bun is required but was not found in PATH." >&2
  exit 1
fi

if ! has_command vercel; then
  echo "vercel CLI is required but was not found in PATH. Install it with: bun add -g vercel" >&2
  exit 1
fi

if [[ "${SKIP_DB:-0}" != "1" ]]; then
  run_package_script_if_found "db:generate"
  run_package_script_if_found "db:push"
  run_package_script_if_found "db:seed"
else
  log "Skipping database steps because SKIP_DB=1"
fi

log "Deploying to Vercel production"
vercel --prod --local-config vercel.json "$@"
