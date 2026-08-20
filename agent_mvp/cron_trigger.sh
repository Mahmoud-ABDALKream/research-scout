#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────
# Research Scout — External Cron Trigger Wrapper
# ──────────────────────────────────────────────────────────────────────
# Use this script when scheduling via an external cron service
# (cron-job.org, GitHub Actions, Vercel Cron, cron-job.debounce, etc.)
#
# It wraps scout.py with:
#   - Logging to a dated file (so you can review past runs)
#   - Exit code handling (so the cron service can detect failure)
#   - Optional email webhook (set SCOUT_EMAIL_WEBHOOK env var)
#
# USAGE:
#   ./agent_mvp/cron_trigger.sh
#
# ENV VARS (all optional):
#   SCOUT_DIR           — output directory (default: script's dir)
#   SCOUT_EMAIL_WEBHOOK — webhook URL for email delivery
#   SCOUT_LOG_DIR       — where to save dated logs (default: SCOUT_DIR/logs)
# ──────────────────────────────────────────────────────────────────────

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SCOUT_DIR="${SCOUT_DIR:-$SCRIPT_DIR}"
SCOUT_LOG_DIR="${SCOUT_LOG_DIR:-$SCOUT_DIR/logs}"
DATE_STR="$(date +%Y-%m-%d_%H%M%S)"
LOG_FILE="$SCOUT_LOG_DIR/scout_$DATE_STR.log"

mkdir -p "$SCOUT_LOG_DIR"

echo "═════════════════════════════════════════════════════"
echo "  Research Scout — Cron Trigger"
echo "  $(date"
echo "  Log: $LOG_FILE"
echo "═════════════════════════════════════════════════════"

# Run the agent, capture all output
cd "$SCOUT_DIR"
if python3 scout.py 2>&1 | tee "$LOG_FILE"; then
    EXIT_CODE=0
    echo "✅ Run succeeded (exit 0)"
elif [ $? -eq 1 ]; then
    EXIT_CODE=1
    echo "⚠️  Run succeeded but no roles qualified (exit 1)"
else
    EXIT_CODE=2
    echo "❌ Run failed (exit 2)"
fi

# Clean up old logs (keep last 30 days)
find "$SCOUT_LOG_DIR" -name "scout_*.log" -mtime +30 -delete 2>/dev/null || true

echo "═════════════════════════════════════════════════════"
echo "  Done. Log saved to: $LOG_FILE"
echo "═════════════════════════════════════════════════════"

exit $EXIT_CODE
