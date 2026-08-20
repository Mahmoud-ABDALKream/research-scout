# Research Scout

A personal AI agent that pre-qualifies product roles for **Mahmoud ABD ELKream** — junior Front-End Developer & Product Designer in Alexandria, Egypt. Capstone for the [AI Fluency](https://general-ai-fluency.netlify.app/study-4d) track (FL-06 → FL-10).

> One job done well: surface 3–5 pre-qualified healthcare / e-commerce / React roles so I stop scanning LinkedIn, Wuzzuf, and Upwork by hand. **The agent never auto-applies.** I click Apply.

**Live app:** [research-scout-swart.vercel.app/scout](https://research-scout-swart.vercel.app/scout)  
**Portfolio (proof site):** [mahmoud-ahmed-abdelkream.vercel.app](https://mahmoud-ahmed-abdelkream.vercel.app)  
**Repo:** [github.com/Mahmoud-ABDALKream/research-scout](https://github.com/Mahmoud-ABDALKream/research-scout)  
**Capstone index (every track deliverable):** [`agent_mvp/DELIVERABLES_INDEX.md`](agent_mvp/DELIVERABLES_INDEX.md)

---

## What it does, and for whom

Research Scout is for Mahmoud (IT student, ~3 years freelance, React / Next.js / TypeScript / Tailwind / Figma). Each run:

1. **GATHER** — pulls listings in parallel from ~26 boards (Egypt/MENA + freelance + remote APIs).
2. **READ** — fetches the job page (or scores from the snippet if the board blocks).
3. **SCORE** — 4-criteria match out of 9, then Groq (`openai/gpt-oss-120b`) writes a specific why-fit. Heuristic scores still run if Groq is offline.
4. **FILTER** — drops anything below **5/9**. Multi-signal seniority penalty (−2 to −4, cap −4) for senior / 6+ years / lead-principal titles.
5. **FORMAT** — digest + apply kit (English pitch, Arabic why, talking points). You still submit the application.

Upload a **CV** (PDF / DOCX / TXT) and the search + score use *your* skills, not a hard-coded profile.

---

## Setup a stranger can follow

### Prerequisites

- Node.js 20+
- npm (or bun)
- Optional: a [Groq](https://console.groq.com) API key for stronger CV parse, scoring, and apply kits

### Install and run

```bash
git clone https://github.com/Mahmoud-ABDALKream/research-scout.git
cd research-scout
npm install
copy .env.example .env.local
```

On macOS/Linux use `cp .env.example .env.local`.

Edit `.env.local` if you have a Groq key:

```
GROQ_API_KEY=gsk_your_key_here
GROQ_MODEL=openai/gpt-oss-120b
```

Leave `GROQ_API_KEY` empty to run heuristic scoring only (eval still works).

```bash
npm run dev
```

Open:

| URL | What you should see |
|-----|---------------------|
| http://localhost:3000 | Portfolio home |
| http://localhost:3000/scout | Scout dashboard |
| http://localhost:3000/api/scout/eval | E3 eval JSON — expect `"passed": 6, "total": 6` |

### Usage examples

**1. Default run (Mahmoud profile)**  
Open `/scout` → **Run Scout**. Watch GATHER → READ → SCORE → FILTER → FORMAT in the log. Open a role → **Apply kit** → copy the pitch → click the listing yourself.

**2. CV-matched run**  
Upload a PDF/Word/TXT (or paste 40+ characters of CV text) → skills chips appear → **Run Scout**. Queries and scores follow that CV.

**3. Reproduce the v2 eval (no network jobs required)**

```bash
curl http://localhost:3000/api/scout/eval
```

Or open `/scout` and read the E3 panel. All six seniority-penalty cases must pass.

**4. Original Python MVP (optional)**

```bash
python agent_mvp/scout.py
python agent_mvp/test_eval_e3.py
```

That path still uses the z-ai CLI. The **supported** product is the Next.js app above.

---

## Architecture sketch

```
CV / default profile
        │
        ▼
┌──────────────────────────────────────────────────────────┐
│  /scout  (Arabic-first dashboard, never auto-applies)    │
└──────────────────────────────────────────────────────────┘
        │ POST /api/scout/run  (SSE)
        ▼
┌─────────┐   ┌─────────┐   ┌──────────────┐   ┌─────────┐   ┌─────────┐
│ GATHER  │──▶│  READ   │──▶│ SCORE        │──▶│ FILTER  │──▶│ FORMAT  │
│ 26 src  │   │ JD page │   │ heuristic/9  │   │ ≥ 5/9   │   │ digest  │
│ Wuzzuf, │   │ or snip │   │ + Groq why   │   │ skip    │   │ apply   │
│ LinkedIn│   │         │   │ + E3 penalty │   │ list    │   │ kit     │
│ APIs…   │   │         │   │              │   │         │   │         │
└─────────┘   └─────────┘   └──────────────┘   └─────────┘   └─────────┘
        │
        ▼
  agent_mvp/  last_result.json · history.jsonl · audit_log.json · tracker.json
```

**Design decision that stays:** ranking is allowed; submitting applications is not. Guardrail is in the product copy, the apply kit, and the code path — there is no “apply” HTTP call to a board.

---

## V2 eval results (E3 seniority penalty)

Recorded against `GET /api/scout/eval` (same logic as `agent_mvp/test_eval_e3.py`).

| Case | Expected | Actual | Penalty | Pass |
|------|----------|--------|---------|------|
| LLM `"too senior"` flag only | 3 | 3 | −2 | yes |
| `"Senior"` in title (no LLM flag) | 3 | 3 | −2 | yes |
| 6+ years required | 5 | 5 | −1 | yes |
| Lead / staff title extra penalty | 5 | 5 | −2 | yes |
| Junior role — no penalty | 7 | 7 | 0 | yes |
| Penalty cap at −4 | 5 | 5 | −4 | yes |

**6 / 6 pass.** A 5/9 senior role with a “too senior” flag drops to 3/9 (below threshold). A perfect 9/9 with every senior signal still lands at 5/9, not zero — the cap is intentional so domain-perfect senior roles stay visible in the audit log.

| Eval | What we test | Result |
|------|----------------|--------|
| **E1** Standard day | Mix of fits; nothing below 5/9 in the digest | Digest is filtered; audit keeps the rest |
| **E2** Quiet day | Fewer than 3 above threshold | Honest “thin day” line; no padding |
| **E3** Senior + high domain | Multi-signal penalty | **6/6 tests pass** (table above) |
| **E4** US/EU on-site, no visa | Location 0 + `visa issue` flag | Filtered or ranked last |
| **E5** Thin / collection page | `low-signal` or `listing-page` | Dropped unless the remaining score is still high |

---

## Limitations (not hidden)

1. **Job boards block scrapers.** LinkedIn, Upwork, Wuzzuf, and others often return Cloudflare / login walls. Those URLs score from a snippet or 0/9 and are logged, not guessed. This is the limitation to name on camera in the demo.
2. **Groq is optional and rate-limited.** Without `GROQ_API_KEY`, scoring is keyword/heuristic only. With a key, batches can fail; the run keeps heuristic scores.
3. **Search coverage is uneven.** Remote APIs (RemoteOK, Remotive, Jobicy, Arbeitnow, The Muse) are structured. Egypt boards are DuckDuckGo `site:` queries — noisier, fewer deep JDs.
4. **PDF text extraction is brittle.** Scanned CVs and some layouts yield too little text. Paste or DOCX is the reliable fallback. (`pdf-parse` v2 is a class, not a function — that bug is fixed, but scans still fail.)
5. **LLM scoring can overfit wording.** Groq must quote the JD; the seniority penalty still runs as a mechanical check so a fluent “great junior role” cannot hide an 8-year title.
6. **No email send from the contact form.** The portfolio form validates and returns a mailto-style next step; it does not call Resend.
7. **Not a production crawler.** No residential proxies, no official LinkedIn API, no auto-apply. That is the product boundary, not a missing checkbox.

---

## Demo (FL-09)

Live run, no slides, 3–5 minutes. Narration script: [`agent_mvp/DEMO_SCRIPT.md`](agent_mvp/DEMO_SCRIPT.md).

**Video link (showcase thread):** add the public Loom / YouTube URL here after recording.

Must include on camera: **one design decision** (never auto-apply + seniority penalty) and **one limitation** (boards that block the reader).

---

## What I built with AI, and how (transparency)

I used **Cursor (Grok) as a build partner** and **Groq at runtime**.

- **I specified:** the 5-step job, the /9 rubric, the never-auto-apply rule, Egypt-first ranking, CV-driven search, and the E3 penalty table.
- **AI drafted:** the TypeScript port (`src/lib/scout/`), the `/scout` dashboard, Groq JSON prompts, and PDF/DOCX upload glue.
- **I checked myself:** every eval case (6/6), the `pdfParse is not a function` break on pdf-parse v2, that `.env.local` is gitignored, that no code path posts an application, and that Groq’s older Llama IDs 404 — we switched to `openai/gpt-oss-120b` after listing models for this key.
- **Runtime AI:** Groq enriches CV parse, why-fit, digest, and apply kits. If Groq is down, the pipeline still finishes.

This is the [AI Fluency transparency](https://general-ai-fluency.netlify.app/study-4d) line: AI wrote a lot of the code; I verified the agent still does *one job* and does not pretend it applied for me.

---

## Project layout

```
src/lib/scout/          # gather, read, score, groq, eval, persist
src/app/scout/          # dashboard UI
src/app/api/scout/      # run (SSE), cv, eval, tracker, history, export
agent_mvp/              # Python MVP + FL-09/FL-10 docs + run artifacts (gitignored)
```

Portfolio pages (`/`, `/about`, `/work`, `/contact`) live in the same Next.js 16 app.

---

## License

MIT — fork and change the match criteria. Do not commit API keys.
