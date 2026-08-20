# Research Scout — 7-Day Tracking Log

Track the agent's daily runs for one week. Goal: **2–3 applications/week** (vs. current 0–1 from manual scanning).

## How to Use

1. Each morning, run the agent: `python3 agent_mvp/scout.py`
2. Review the digest (printed to terminal, also saved to `digest_email.txt`)
3. Click apply on any role that fits (manually — never auto-apply)
4. Log the results below
5. Check `history.jsonl` for the machine-readable archive of all runs

## Tracking Table

| Day | Date | Roles in Digest | Roles Applied To | Time Spent | Notes |
|-----|------|-----------------|------------------|------------|-------|
| 1   | Aug 18, 2026 | 2 (thin day) | _pending_ | ~5 min | FronTend Dev Intern @ Icura (5/9), Frontend Dev @ Halian (6/9). Both React+junior. Acoer/Valleysoft correctly filtered (senior penalty). |
| 2   |      |                 |                  |            |       |
| 3   |      |                 |                  |            |       |
| 4   |      |                 |                  |            |       |
| 5   |      |                 |                  |            |       |
| 6   |      |                 |                  |            |       |
| 7   |      |                 |                  |            |       |

## Week Summary (fill after Day 7)

- **Total roles surfaced:** ___
- **Total applications submitted:** ___
- **Target met (2–3 applications)?** ___
- **Time saved vs manual scanning:** ~___ min/day × 7 = ___ min
- **Best role found this week:** ___
- **Worst false positive (low-fit role that passed):** ___
- **Scoring adjustments needed:** ___

## Day 1 Notes (Aug 18, 2026)

**Run timestamp:** 2026-08-18T18:34:03
**Candidates fetched:** 15 (5 each from LinkedIn, Upwork, Wuzzuf)
**Candidates read:** 8 (deduped)
**Candidates qualified (score ≥ 5/9):** 2

### Qualified roles:
1. **Frontend Developer @ Halian** — 6/9
   - Match: React + React Native, responsive web/mobile
   - URL: https://www.linkedin.com/jobs/view/frontend-developer-at-halian-managed-services-recruitment-agency-contract-staffing-4319329198
2. **FronTend Development Intern (React Js) @ Icura** — 5/9
   - Match: React skill match, junior status, but domain unclear
   - URL: https://www.linkedin.com/jobs/view/4400030043

### Filtered out (below threshold):
- Acoer Senior Front-End Developer — raw 5/9, penalized to 2/9 (too senior) ✅ fix works
- Valleysoft Senior Frontend Engineer — raw 5/9, penalized to 3/9 (too senior) ✅
- Flatgiggs Mobile Developer — 3/9 (mobile, not front-end focus)
- 4 Cloudflare blocks on Upwork — 0/9 (expected, known limitation)

### Action items:
- [ ] Apply to Halian (stronger match — React + responsive web/mobile)
- [ ] Review Icura posting (internship — check if fits timeline)
- [ ] Skip the senior roles (correctly filtered)

## Known Issues to Watch

1. **Cloudflare blocks on Upwork** — some URLs return verification pages, scored 0/9. Expected.
2. **"Thin day" warnings** — some days will have <3 qualified roles. This is honest, not a bug.
3. **Senior roles still appearing** — if a role scores 7+/9 despite "too senior" flag, it still qualifies (penalty is -2, not auto-reject). Review manually.
4. **Invented details** — if the LLM states salary or seniority not in the JD, flag it. Guardrail violation.
5. **Location field** — sometimes shows `<Location>` as placeholder when JD doesn't state location clearly. Acceptable for MVP.

## Eval Cases to Run Mid-Week

After Day 3, run these eval cases to verify the agent is still healthy:

```bash
# E3: Seniority filter test
python3 agent_mvp/test_eval_e3.py

# E1: Standard day (just run the agent and check the digest has 3-5 roles)
python3 agent_mvp/scout.py
```

## How to Run Daily

### Option A: Manual (local)
```bash
cd /home/z/my-project
python3 agent_mvp/scout.py
# Review terminal output + digest_email.txt
```

### Option B: GitHub Actions (automatic, 9 AM EET daily)
1. Ensure `ZAI_API_KEY` secret is set (see below)
2. The workflow at `.github/workflows/daily-scout.yml` runs automatically
3. Run artifacts (output + audit log) are uploaded as GitHub Actions artifacts

## Setting up the GitHub Secret (ZAI_API_KEY)

1. Go to: https://github.com/Mahmoud-ABDALKream/research-scout/settings/secrets/actions
2. Click **"New repository secret"**
3. Name: `ZAI_API_KEY`
4. Value: _your z-ai API key_ (contact z.ai for a key, or use the sandbox key if available)
5. Click **"Add secret"**
6. The daily cron workflow will now run automatically at 9 AM EET (7 AM UTC)

To trigger manually: go to https://github.com/Mahmoud-ABDALKream/research-scout/actions → "Research Scout Daily Run" → "Run workflow"
