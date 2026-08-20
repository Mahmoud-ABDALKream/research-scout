#!/usr/bin/env bash
# ─── Push Portfolio to GitHub ─────────────────────────────────────
# Run this script from the project root after creating a GitHub repo.
#
# PREREQUISITES:
#   1. Create a new repo on GitHub (don't initialize with README):
#      https://github.com/new
#      Name it e.g. "portfolio" or "mahmoud-portfolio"
#
#   2. Have a GitHub Personal Access Token (PAT) ready:
#      https://github.com/settings/tokens
#      (Settings → Developer settings → Personal access tokens → Tokens (classic)
#       → Generate new token → scope: "repo")
#
# USAGE:
#   ./push-to-github.sh <github-username> <repo-name>
#
# EXAMPLE:
#   ./push-to-github.sh mahmoud-abdelkream portfolio
# ────────────────────────────────────────────────────────────────────

set -e

USERNAME="$1"
REPO="$2"

if [ -z "$USERNAME" ] || [ -z "$REPO" ]; then
  echo "Usage: $0 <github-username> <repo-name>"
  echo "Example: $0 mahmoud-abdelkream portfolio"
  exit 1
fi

REMOTE_URL="https://github.com/${USERNAME}/${REPO}.git"

echo "▸ Adding remote origin..."
git remote remove origin 2>/dev/null || true
git remote add origin "$REMOTE_URL"

echo "▸ Pushing to $REMOTE_URL ..."
echo "  (you will be prompted for your GitHub username and Personal Access Token)"
echo ""

git push -u origin main

echo ""
echo "✓ Done! Your portfolio is live at:"
echo "  https://github.com/${USERNAME}/${REPO}"
echo ""
echo "Next: connect the repo to Vercel for auto-deploy:"
echo "  https://vercel.com/new → Import Git Repository → select ${USERNAME}/${REPO}"
