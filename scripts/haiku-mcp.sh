#!/bin/zsh
set -euo pipefail

SCRIPT_DIR="${0:A:h}"
REPO_ROOT="${SCRIPT_DIR:h}"
BINARY="${REPO_ROOT}/tools/haiku-method/plugin/bin/haiku"

if [[ ! -x "${BINARY}" ]]; then
  echo "Haiku binary not found or not executable: ${BINARY}" >&2
  exit 1
fi

cd "${REPO_ROOT}"
exec "${BINARY}" mcp --harness cursor
