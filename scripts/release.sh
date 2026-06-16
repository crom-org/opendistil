#!/usr/bin/env bash
set -euo pipefail

VERSION="${1:-}"
if [ -z "$VERSION" ]; then
  CURRENT=$(node -p "require('./package.json').version")
  echo "Current version: $CURRENT"
  echo "Usage: $0 <new-version>"
  exit 1
fi

echo "=== Releasing OpenDistil v$VERSION ==="

# Update version in root package.json
npm version "$VERSION" --no-git-tag-version

# Update all workspace packages
for pkg in packages/*/; do
  (cd "$pkg" && npm version "$VERSION" --no-git-tag-version)
done
(cd apps/cli && npm version "$VERSION" --no-git-tag-version)

# Build
npm run build

# Commit and tag
git add -A
git commit -m "chore: release v$VERSION"
git tag "v$VERSION"

echo ""
echo "=== Release v$VERSION prepared ==="
echo "Run 'git push && git push --tags' to publish"
