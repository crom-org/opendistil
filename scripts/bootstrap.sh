#!/usr/bin/env bash
set -euo pipefail

echo "=== OpenDistil Bootstrap ==="

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "Error: Node.js >= 18 required (found $(node -v))"
  exit 1
fi

echo "Node.js $(node -v) detected"

# Install dependencies
echo "Installing dependencies..."
npm install

# Build all packages
echo "Building all packages..."
npm run build

# Verify
echo "Verifying build..."
npm run typecheck

echo ""
echo "=== Bootstrap complete ==="
echo "Run 'opendistil --help' to get started"
