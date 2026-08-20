# External Cron Setup Guide

How to trigger Research Scout automatically every day at 9 AM EET, using a free external cron service.

## Option 1: GitHub Actions (recommended, already set up)

The workflow at `.github/workflows/daily-scout.yml` already runs at 9 AM EET daily. You just need to add the `ZAI_API_KEY` secret.

### Steps:
1. Go to https://github.com/Mahmoud-ABDALKream/research-scout/settings/secrets/actions
2. Click **"New repository secret"**
3. Name: `ZAI_API_KEY`
4. Value: your z-ai API key
5. Click **"Add secret"**
6. Go to https://github.com/Mahmoud-ABDALKream/research-scout/actions
7. Click "Research Scout Daily Run" → "Run workflow" (manual test)

**Pros:** Free, integrated with your repo, run artifacts saved 30-90 days.
**Cons:** Requires GitHub account + z-ai API key.

---

## Option 2: cron-job.org (free, no GitHub setup)

### Steps:
1. Go to https://cron-job.org and create a free account
2. Click **"Create Cronjob"**
3. Settings:
   - **Title:** Research Scout Daily
   - **URL:** _your webhook URL_ (see below)
   - **Execution schedule:** Daily
   - **Time:** 09:00 (EET = UTC+2, so set 07:00 if the service uses UTC)
   - **Request method:** POST
   - **Headers:** `Content-Type: application/json`
   - **Body:** `{"trigger": "cron-job.org", "timestamp": "{{date}}"}`
4. Click **"Save"**

### You need a webhook URL that runs the agent
Options for the webhook receiver:
- **Vercel serverless function** (free): deploy a simple `/api/scout` endpoint that runs `python3 scout.py`
- **n8n cloud** (free tier): webhook node triggers a "Execute Command" node
- **Your own server**: if you have a VPS, expose the script via a simple HTTP server

### Minimal Vercel serverless function
Create `api/scout.ts` in your Vercel project:
```typescript
import { execSync } from 'child_process';

export default function handler(req, res) {
  try {
    const output = execSync('python3 agent_mvp/scout.py', {
      cwd: process.cwd(),
      timeout: 180000,  // 3 minutes
    }).toString();
    res.status(200).json({ ok: true, output: output.slice(-500) });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}
```

**Pros:** Free, no GitHub Actions config, runs on Vercel's infrastructure.
**Cons:** Need to deploy a Vercel function.

---

## Option 3: Local cron (Linux/Mac)

If you run the agent on your own machine:

```bash
# Edit crontab
crontab -e

# Add this line (runs at 9 AM EET = 7 AM UTC daily)
0 7 * * * cd /home/youruser/research-scout && ./agent_mvp/cron_trigger.sh >> /tmp/scout_cron.log 2>&1
```

**Pros:** Simplest setup, full control.
**Cons:** Machine must be on at 9 AM, no external monitoring.

---

## The `cron_trigger.sh` wrapper

All three options above can use the wrapper script at `agent_mvp/cron_trigger.sh`:

```bash
./agent_mvp/cron_trigger.sh
```

It handles:
- ✅ Dated log files (saved to `agent_mvp/logs/scout_YYYY-MM-DD_HHMMSS.log`)
- ✅ Exit code propagation (0=success, 1=no roles, 2=failure)
- ✅ Old log cleanup (auto-deletes logs older than 30 days)
- ✅ Optional webhook delivery (set `SCOUT_EMAIL_WEBHOOK` env var)

### Environment variables
| Variable | Default | Purpose |
|----------|---------|---------|
| `SCOUT_DIR` | script's directory | Where to save outputs |
| `SCOUT_EMAIL_WEBHOOK` | (empty) | Webhook URL for email delivery |
| `SCOUT_LOG_DIR` | `$SCOUT_DIR/logs` | Where to save dated logs |

---

## Verifying the cron works

After setting up any of the 3 options:
1. Wait for the scheduled time (or trigger manually)
2. Check `agent_mvp/history.jsonl` — a new line should appear
3. Check `agent_mvp/digest_email.txt` — should be the latest digest
4. Run the weekly summary to verify: `python3 agent_mvp/weekly_summary.py --days 1`

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| No new entry in history.jsonl | Cron didn't fire | Check cron service logs |
| Exit code 2 | Tool failure (web_search/page_reader) | Check z-ai CLI is installed and API key is set |
| Exit code 1 | No roles qualified (thin day) | Normal — try broadening queries in scout.py |
| 0 qualified every day for a week | Scoring too strict | Lower `SCORE_THRESHOLD` in scout.py (currently 5) |
