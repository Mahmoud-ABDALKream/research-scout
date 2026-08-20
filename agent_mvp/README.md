# Research Scout (Python MVP)

The **canonical product** is the Next.js app. Follow the [root README](../README.md): `npm run dev` → http://localhost:3000/scout

This folder keeps the original FL-07 Python agent plus FL-09/FL-10 docs.

A personal AI agent that pre-qualifies healthcare and e-commerce product roles matching **Mahmoud ABD ELKream**'s profile.

> One job done well: find 3–5 pre-qualified opportunities daily, so I stop scanning LinkedIn/Upwork/Wuzzuf manually. The agent never auto-applies.

## How It Works

5-step workflow, ~90 seconds per run:

```
GATHER (web_search × 3) → READ (page_reader × 8) → SCORE (LLM × 8) → FILTER (threshold ≥ 5/9) → FORMAT (LLM × 1)
```

### Live Tool Connections

| Tool | Purpose | Calls/Run |
|------|---------|-----------|
| `web_search` | Gather job listings from LinkedIn, Upwork, Wuzzuf | 3 |
| `page_reader` | Fetch full job descriptions | 8 |
| `LLM (chat)` | Score match + format digest | 9 |

All via the [z-ai-web-dev-sdk](https://www.npmjs.com/package/z-ai-web-dev-sdk) — free tier.

## Quick Start

```bash
# Install the z-ai CLI
npm install -g z-ai-web-dev-sdk

# Run the agent
python3 agent_mvp/scout.py
```

The digest prints to terminal. An audit log is saved to `agent_mvp/audit_log.json`.

## Scoring Rubric

Each job is scored on 4 criteria (total /9):

| Criterion | Range | What it measures |
|-----------|-------|------------------|
| Skill match | 0–3 | React, Next.js, TypeScript, Tailwind, Figma, etc. |
| Domain match | 0–2 | Healthcare, e-commerce, Arabic RTL, IoT |
| Seniority fit | 0–2 | Junior-friendly (filters out 6+ year roles) |
| Location fit | 0–2 | Egypt / MENA / remote-global |

**Threshold:** 5/9 to qualify.

**Seniority penalty:** If the LLM flags "too senior" in red_flags, -2 points are deducted from the total. This prevents senior roles from passing on skill/domain match alone.

## Guardrails

- **MUST NEVER** auto-apply. Agent only surfaces; human clicks apply.
- **MUST NEVER** state salary or seniority unless exact quote from JD.
- **MUST** cite JD URL and quote the exact line justifying each score.
- **MUST** log all fetched URLs to `audit_log.json` for human review.
- **MUST** post only to the private thread (never public channels).

## Files

```
agent_mvp/
├── scout.py              # The agent (5-step workflow + history + email + enhanced seniority filter)
├── test_eval_e3.py       # E3 eval: enhanced seniority penalty (6 tests)
├── weekly_summary.py     # Parses history.jsonl → 7-day summary report
├── cron_trigger.sh       # External cron wrapper (for cron-job.org / local cron)
├── audit_log.json        # Per-run audit trail (all fetched URLs + scores)
├── run_capture.txt       # Raw terminal output of last run
├── history.jsonl         # Append-only daily archive (one JSON entry per run)
├── digest_email.txt      # Email-ready digest (RFC 822 format)
├── TRACKING.md           # 7-day tracking template (Day 1 filled in)
├── CRON_SETUP.md         # Guide: 3 ways to set up daily automation
└── .github/workflows/
    └── daily-scout.yml   # GitHub Actions cron (9 AM EET daily)
```

## Enhancements (beyond base MVP)

- **Daily history log** — each run appends to `history.jsonl` (JSON Lines format). One entry per run with timestamp, candidate counts, qualified roles, and full digest. Queryable with `jq` or any JSONL tool.
- **Email-ready digest** — `digest_email.txt` is RFC 822 formatted (Subject, To, From, Date headers + body). Paste into any email client, or pipe to `sendmail` / `msmtp` / Formspree webhook.
- **Optional webhook delivery** — set `SCOUT_EMAIL_WEBHOOK` env var to a URL (e.g. Formspree, Zapier, n8n) and the agent POSTs the digest as JSON on each run.
- **Environment-variable config** — `SCOUT_DIR` overrides the output directory (useful for GitHub Actions runners). `SCOUT_EMAIL_WEBHOOK` enables webhook delivery.
- **Exit codes** — `0` = success with qualified roles, `1` = success but no roles qualified, `2` = tool failure. Lets cron workflows detect failure without parsing logs.
- **Enhanced seniority filter** — multi-signal detection: LLM "too senior" flag + "senior" keyword in title/JD + 6+ years required + lead/principal/staff title. Penalty cap at -4 (perfect 9 stays at 5). See `test_eval_e3.py` (6 tests).
- **Weekly summary** — `weekly_summary.py` parses `history.jsonl` and produces a 7-day report with aggregate stats, per-day breakdown, top roles by score, source distribution, score distribution histogram, and goal check.
- **External cron wrapper** — `cron_trigger.sh` handles dated logging, exit code propagation, old log cleanup. Works with cron-job.org, GitHub Actions, or local cron.

## Daily Automation (GitHub Actions)

The workflow at `.github/workflows/daily-scout.yml` runs the agent every day at 9 AM EET (7 AM UTC). To enable:

1. Push this repo to GitHub
2. Add `ZAI_API_KEY` as a repository secret (Settings → Secrets and variables → Actions)
3. The workflow runs automatically; manual trigger also available via "Run workflow" button

Run artifacts (output + audit log) are uploaded as GitHub Actions artifacts and retained for 30 days.

## Eval Cases

| # | Scenario | Pass Criterion |
|---|----------|----------------|
| E1 | Standard day, 30+ matching jobs | Top 5 returned, none below threshold |
| E2 | Quiet day, only 2 jobs above threshold | Digest of 2 + "thin day" note, no padding |
| E3 | Senior role (6+ yrs) with high domain match | Filtered out (seniority penalty -2 drops below threshold) |
| E4 | Remote-US role, no visa sponsorship | Filtered out or flagged with [VISA WARNING] |
| E5 | Sponsored listing with thin JD (<100 words) | Only included if score ≥ 7, else excluded |

Run E3 test: `python3 agent_mvp/test_eval_e3.py`

## Spec & Design

See the [FL-06 agent design doc](https://github.com/Mahmoud-ABDALKream/portfolio) (Research Scout Capstone Agent Design PDF) for the full spec: job, user, tools, instructions, evals, guardrails, platform justification.

## License

MIT — personal use. The match criteria (skills, domains, seniority) are specific to Mahmoud; fork and adjust for your own profile.
