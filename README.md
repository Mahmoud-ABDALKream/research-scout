# Research Scout

Research Scout is a personal job-prequalification agent for **Mahmoud ABD ELKream**, a junior Front-End Developer and Product Designer in Alexandria, Egypt.

It finds React / healthcare / e-commerce roles, scores each listing against a CV, and returns a short digest. **It never submits an application.** You click Apply.

Live dashboard: [research-scout-swart.vercel.app/scout](https://research-scout-swart.vercel.app/scout)  
Source: [github.com/Mahmoud-ABDALKream/research-scout](https://github.com/Mahmoud-ABDALKream/research-scout)

**Demo video (unlisted YouTube):** _paste after upload_  
Local file already recorded with AI voice: `agent_mvp/demo/out/research-scout-demo.mp4` (also copied to Desktop). Upload that file to YouTube as **Unlisted**, then paste the URL here.

---

## Description

**Who it is for.** Mahmoud (IT student, ~3 years freelance: React, Next.js, TypeScript, Tailwind, Figma). Anyone who forks it can upload their own CV.

**What it does each run**

1. **GATHER** — search ~26 boards in parallel (Wuzzuf, LinkedIn, Indeed, Bayt, Upwork, مستقل, RemoteOK, Remotive, The Muse, and others).
2. **READ** — fetch the job page, or score from the snippet if the board blocks the request.
3. **SCORE** — four criteria, total **/9** (skills 0–3, domain 0–2, seniority 0–2, location 0–2). Optional Groq why-fit.
4. **FILTER** — drop scores below **5/9**. Senior / 6+ years / lead-principal titles get a −2 to −4 penalty (cap −4).
5. **FORMAT** — numbered digest plus an apply kit (English pitch, Arabic why). You still apply by hand.

**Guardrail.** Ranking is allowed. Auto-apply is not. There is no HTTP call that submits an application to a board.

---

## Installation

A stranger with Node.js 20+ can reproduce this on Windows, macOS, or Linux.

```bash
git clone https://github.com/Mahmoud-ABDALKream/research-scout.git
cd research-scout
npm install
```

Copy the env template:

```bash
# Windows (PowerShell)
copy .env.example .env.local

# macOS / Linux
cp .env.example .env.local
```

`.env.local` (Groq is optional — eval and heuristic scoring work without it):

```
GROQ_API_KEY=
GROQ_MODEL=openai/gpt-oss-120b
```

Start the app:

```bash
npm run dev
```

Then open:

| URL | Expected |
|-----|----------|
| http://localhost:3000/scout | Scout dashboard |
| http://localhost:3000/api/scout/eval | JSON `"passed": 6, "total": 6` |

Vercel: add `GROQ_API_KEY` under Project Settings → Environment Variables, then Redeploy. Local `.env.local` is gitignored and does not deploy.

---

## Usage

**Default run (built-in Mahmoud profile)**

1. Open `/scout`.
2. Click **Run Scout** (or **شغّل الكشّاف**).
3. Watch GATHER → READ → SCORE → FILTER → FORMAT in the log.
4. Open a qualified role → **Apply kit** → copy the pitch → open the listing yourself.

**CV-matched run**

1. Upload PDF, Word, or TXT, or paste at least 40 characters of CV text.
2. Confirm the skill chips look right.
3. Click **Run Scout**. Search queries and scores follow that CV.

**Reproduce the v2 eval (no job-board network required)**

```bash
curl http://localhost:3000/api/scout/eval
```

Expected: six seniority-penalty cases, all `pass: true`.

**Expected digest shape**

```
[1] Junior React Developer @ Example (Remote-Egypt) [NEW] [EGYPT]
    Score: 7/9 | Skills 3/3 · Domain 2/2 · Seniority 2/2 · Location 2/2
    Why: Stack and healthcare overlap; junior-friendly title.
    Apply: https://…
Guardrail: agent never auto-applies. You click Apply.
```

---

## Architecture

```
CV upload or default profile
        │
        ▼
   /scout dashboard
        │  POST /api/scout/run (SSE)
        ▼
 GATHER ──▶ READ ──▶ SCORE ──▶ FILTER ──▶ FORMAT
  ~26 src    JD/snip   /9 + Groq    ≥ 5/9     digest
                       + E3 penalty  skip     apply kit
        │
        ▼
  /tmp on Vercel, or agent_mvp/ locally
```

| Piece | Path |
|-------|------|
| Pipeline | `src/lib/scout/` |
| UI | `src/app/scout/` |
| APIs | `src/app/api/scout/` |
| E3 tests | `src/lib/scout/eval-e3.ts`, `agent_mvp/test_eval_e3.py` |
| Original Python MVP | `agent_mvp/scout.py` |

The supported product is the Next.js app. The Python script is the FL-07 artifact.

---

## V2 eval results

Recorded from `GET /api/scout/eval` (same rules as `python agent_mvp/test_eval_e3.py`).

### E3 — seniority penalty (6/6 pass)

| Case | Expected | Actual | Penalty | Pass |
|------|----------|--------|---------|------|
| LLM `"too senior"` flag only | 3 | 3 | −2 | yes |
| `"Senior"` in title, no LLM flag | 3 | 3 | −2 | yes |
| 6+ years required in JD | 5 | 5 | −1 | yes |
| Lead / staff title | 5 | 5 | −2 | yes |
| Junior role — no penalty | 7 | 7 | 0 | yes |
| Penalty cap at −4 | 5 | 5 | −4 | yes |

A 5/9 senior role with a “too senior” flag drops to **3/9** (below threshold). A 9/9 listing that hits every senior signal lands at **5/9**, not 0 — the cap keeps extreme senior roles in the audit log.

### Full eval set

| ID | Scenario | Result |
|----|----------|--------|
| E1 | Mix of fits | Digest contains only scores ≥ 5/9 |
| E2 | Quiet day | “Thin day” note; no padding with weak jobs |
| E3 | Senior + high domain match | **6/6 tests pass** |
| E4 | US/EU on-site, no visa | `visa issue` flag; filtered or ranked last |
| E5 | Thin JD / collection page | `low-signal` or `listing-page`; dropped unless remaining score is high |

---

## Limitations

1. **Boards block the reader.** LinkedIn, Upwork, and similar often return Cloudflare or a login wall. Those URLs score from a snippet or 0/9. The agent does not invent a job description it could not read. **Name this on camera.**
2. **Groq is optional.** Without `GROQ_API_KEY`, scoring is heuristic. Failed Groq batches keep the heuristic score.
3. **Egypt coverage is noisier than remote APIs.** Wuzzuf/LinkedIn come through DuckDuckGo `site:` queries, not official APIs.
4. **Scanned PDFs extract poorly.** Paste text or upload DOCX if the PDF is an image.
5. **Serverless storage is ephemeral.** On Vercel, files go to `/tmp`. The browser keeps the uploaded CV and sends it with each run.
6. **Not a crawler product.** No proxies, no LinkedIn official API, no auto-apply.

---

## Demo

Record a **live** end-to-end run, **3–5 minutes**, **no slides**, with voice narration.

On camera you must explain:

- **One design decision:** the agent must not auto-apply; seniority penalty (E3 6/6) exists so a Senior React role cannot pass on stack match alone.
- **One limitation / guardrail:** blocked job boards (Cloudflare / login walls).

How to record: [OBS Studio](https://obsproject.com/) (no watermark) or Loom. Upload as an **unlisted YouTube** video. Paste the URL at the top of this README and in the internship portal.

Word-for-word script: [`agent_mvp/DEMO_SCRIPT.md`](agent_mvp/DEMO_SCRIPT.md).

---

## Built with AI (transparency)

Cursor drafted much of `src/lib/scout/` and the `/scout` UI. I specified the five-step job, the /9 rubric, never-auto-apply, and the E3 table. I checked: eval 6/6, no apply HTTP path, Groq model IDs that 404, Vercel read-only disk, and PDF parsing on serverless. Groq is optional at runtime for why-fit and apply kits.

---

## Contributing

Pull requests are welcome for extra **public** job APIs and eval cases. Open an issue first for large changes. Do not add auto-apply. Do not commit API keys. Run `npm run build` and open `/api/scout/eval` (expect 6/6) before you send a PR.

---

## License

[MIT](LICENSE). Fork and change the match criteria for your own CV.

---

## Authors

Mahmoud ABD ELKream — Alexandria, Egypt — mahmoudabdelkreambusiness@gmail.com
