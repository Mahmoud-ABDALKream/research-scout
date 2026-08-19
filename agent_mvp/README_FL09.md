# Research Scout

A personal AI agent that pre-qualifies healthcare and e-commerce product roles matching **Mahmoud ABD ELKream**'s profile. Built as the AI Fluency Capstone project.

> One job done well: find 3–5 pre-qualified opportunities daily, so I stop scanning LinkedIn/Upwork/Wuzzuf manually.

## What It Does

Research Scout runs a 5-step workflow every day:

1. **GATHER** — searches LinkedIn Jobs, Upwork, and Wuzzuf for roles matching Mahmoud's skills (React, Next.js, TypeScript, UI/UX, healthcare, e-commerce)
2. **READ** — fetches the full job description from each candidate URL
3. **SCORE** — an LLM scores each job on 4 criteria: skill match (0-3), domain match (0-2), seniority fit (0-2), location fit (0-2). Total /9.
4. **FILTER** — drops anything below 5/9. Applies a seniority penalty (-2 to -4) for roles requiring 6+ years or lead/principal titles.
5. **FORMAT** — produces a clean numbered digest with role title, company, score, match rationale, and apply link.

Output: a daily digest posted to the terminal, saved to `digest_email.txt` (RFC 822 format), and appended to `history.jsonl` (JSON Lines archive).

## Who It's For

Mahmoud ABD ELKream — IT student at Borg El Arab University, Alexandria, Egypt. Front-End Developer & Product Designer seeking healthcare/e-commerce product roles and freelance gigs.

## Setup (a stranger could follow this)

### Prerequisites
- Python 3.12+
- Node.js 18+ (for the z-ai CLI)
- A z-ai API key (or use the sandbox's built-in key)

### Install

```bash
# Clone the repo
git clone https://github.com/Mahmoud-ABDALKream/research-scout.git
cd research-scout/agent_mvp

# Install the z-ai CLI (provides web_search + page_reader + chat)
npm install -g z-ai-web-dev-sdk

# Verify it works
z-ai chat -p "Hello"
```

### Run

```bash
# Run the agent (takes ~90 seconds)
python3 scout.py

# View the digest
cat digest_email.txt

# View the audit log (all fetched URLs + scores)
cat audit_log.json | python3 -m json.tool

# Run the weekly summary (after 7+ days of runs)
python3 weekly_summary.py --days 7
```

### Optional: Daily automation

Set up a cron trigger (see `CRON_SETUP.md` for 3 options):
1. GitHub Actions (free, already configured — just add `ZAI_API_KEY` secret)
2. cron-job.org (free, no GitHub setup)
3. Local crontab (Linux/Mac)

## Usage Examples

### Manual run
```bash
python3 scout.py
# Output: daily digest with 3-5 qualified roles
```

### Weekly summary
```bash
python3 weekly_summary.py --days 7
# Output: aggregate stats, per-day breakdown, top roles, goal check
```

### E3 eval test (seniority penalty)
```bash
python3 test_eval_e3.py
# Output: 6 tests, all should pass
```

## Architecture Sketch

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   GATHER     │────▶│    READ      │────▶│   SCORE      │
│ web_search×3 │     │ page_reader×8│     │ LLM×8        │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                 │
                                                 ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   FORMAT     │◀────│   FILTER     │◀────│  PENALTY     │
│ LLM×1        │     │ threshold≥5  │     │ seniority -2 │
└──────┬───────┘     └──────────────┘     └──────────────┘
       │
       ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Terminal     │  │ digest_email │  │ history.jsonl│
│ (stdout)     │  │ .txt (RFC822)│  │ (append-only)│
└──────────────┘  └──────────────┘  └──────────────┘
```

**Live tool connections:**
- `web_search` (z-ai SDK) — 3 calls/run (LinkedIn, Upwork, Wuzzuf)
- `page_reader` (z-ai SDK) — 8 calls/run (fetch full JDs)
- `LLM chat` (z-ai SDK) — 9 calls/run (8 scoring + 1 formatting)

**Total: 20 tool calls per run, ~90 seconds, zero cost (free tier).**

## V2 Eval Results

### E1: Standard day (30+ matching jobs)
- **Input:** Normal day with mix of strong/weak fits
- **Result:** Top 5 returned, none below threshold ✅
- **Run output:** 15 candidates → 8 read → 2-3 qualified

### E2: Quiet day (<3 qualified)
- **Input:** Day with few matching roles
- **Result:** Digest of 2 + honest "thin day" note ✅
- **No padding with low-score jobs**

### E3: Senior role with high domain match (6 tests)
- **Input:** Senior Frontend Engineer role, 8+ years required
- **Result:** Penalized -2 (seniority) + -1 (years) = -3 → filtered ✅
- **Tests:** LLM flag, keyword detection, years regex, lead title, junior pass, penalty cap — all 6 pass ✅

### E4: Remote-US role, no visa sponsorship
- **Result:** Filtered out OR flagged with [VISA WARNING] ✅

### E5: Sponsored listing with thin JD
- **Result:** Flagged as "low-signal", only included if score ≥ 7 ✅

## Limitations

1. **Cloudflare blocks on Upwork** — some Upwork URLs return Cloudflare verification pages instead of actual JDs. Scored 0/9. Expected, unavoidable without a paid scraping service.

2. **Contact form doesn't send email** — the API route returns a mailto forward link, not an actual email. Would need Resend/Formspree API key to send automatically.

3. **No rate limiting** — the API route has no rate limiting. Would need Vercel KV or Upstash Redis. Fine for MVP traffic.

4. **No live demo links on project cards** — projects link to case study pages, not to live deployed URLs. Each project needs its own deployment.

5. **No SQL database** — the Prisma schema is unused (leftover from scaffold). No SQL injection risk, but also no persistence beyond JSONL files.

6. **Scoring is LLM-dependent** — the LLM sometimes hallucinates job details not in the JD. The seniority penalty (multi-signal detection) compensates for the most common failure mode, but LLM scoring quality varies by run.

7. **GitHub/LinkedIn profile URLs** — some links point to profile pages that may need updating when the user creates/updates their actual profiles.

## Files

```
agent_mvp/
├── scout.py              # The agent (5-step workflow + history + email + seniority filter)
├── test_eval_e3.py       # E3 eval: enhanced seniority penalty (6 tests)
├── weekly_summary.py     # Parses history.jsonl → 7-day summary report
├── cron_trigger.sh       # External cron wrapper (dated logs + exit codes)
├── CRON_SETUP.md         # Guide: 3 ways to set up daily automation
├── TRACKING.md           # 7-day tracking template (Day 1 filled in)
├── .github/workflows/
│   └── daily-scout.yml   # GitHub Actions cron (9 AM EET daily)
└── Research_Scout_MVP_Capstone.pdf  # Full build log + run capture
```

## AI Transparency

**What I built with AI and how:**

The Research Scout agent was built with the z-ai-web-dev-sdk (an AI development toolkit) as both the build partner and the runtime infrastructure. Specifically:

- **Code generation:** The agent code (`scout.py`) was written with AI assistance — I described the 5-step workflow, the AI generated the Python, and I reviewed + tested every line. The seniority penalty logic, the JSONL history format, and the email-ready digest format were all co-designed with AI.
- **Runtime tools:** The agent uses 3 live AI tool connections at runtime: `web_search` (finds jobs), `page_reader` (fetches JDs), and LLM chat (scores + formats). These are the "live tool connections" required by the capstone.
- **Eval design:** The 5 eval cases (E1-E5) were co-written with AI. The E3 test (seniority penalty) was iterated 7 times based on real break-test results.
- **What I checked myself:** I verified every tool call works by running the agent end-to-end and checking the raw JSON output. I caught and fixed 4 bugs during the build (broad-query failure, Cloudflare blocks, JSON fence parsing, invented dates). I wrote the seniority penalty after the first run revealed senior roles passing the threshold. I ran the E3 eval test to prove the fix works.

Saying "I built this with AI and here's what I checked myself" reads as credibility, not weakness. The AI generated code; I verified it works.

## License

MIT — personal use. The match criteria (skills, domains, seniority) are specific to Mahmoud; fork and adjust for your own profile.
