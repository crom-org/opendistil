#!/usr/bin/env bash
set -euo pipefail

echo "=== Lint ==="
npm run lint

echo "=== Typecheck ==="
npm run typecheck

echo "=== Format Check ==="
npm run format:check

echo "=== All checks passed ==="
