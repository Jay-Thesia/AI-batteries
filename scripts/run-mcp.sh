#!/usr/bin/env bash
# Shared MCP launcher for this repo.
# Loads nvm so Cursor does not use its broken bundled Node/npx.
#
# Usage (from project root, in .cursor/mcp.json):
#   "command": "bash",
#   "args": ["./scripts/run-mcp.sh", "MCP/Code/src/index.ts"]
#
# Add more servers by pointing at each entry file — no new script needed.
set -euo pipefail

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  # shellcheck disable=SC1091
  . "$NVM_DIR/nvm.sh"
fi

if [ $# -lt 1 ]; then
  echo "Usage: $0 <path-to-entry.ts> [extra args...]" >&2
  exit 1
fi

ENTRY="$1"
shift

if [ ! -f "$ENTRY" ]; then
  echo "MCP entry not found: $ENTRY" >&2
  exit 1
fi

ENTRY_DIR="$(cd "$(dirname "$ENTRY")" && pwd)"
ENTRY_FILE="$(basename "$ENTRY")"
ENTRY_ABS="$ENTRY_DIR/$ENTRY_FILE"

# Walk up to the nearest package.json so node_modules resolves correctly.
PKG_ROOT="$ENTRY_DIR"
while [ "$PKG_ROOT" != "/" ] && [ ! -f "$PKG_ROOT/package.json" ]; do
  PKG_ROOT="$(dirname "$PKG_ROOT")"
done

if [ ! -f "$PKG_ROOT/package.json" ]; then
  echo "No package.json found above: $ENTRY" >&2
  exit 1
fi

cd "$PKG_ROOT"
REL="${ENTRY_ABS#"$PKG_ROOT"/}"
exec npx tsx "$REL" "$@"
