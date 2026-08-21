# Demo script — Research Scout (3–5 min, live, no slides)

This is the FL-09 video. Reviewers must see the **real dashboard running**, hear **your voice**, and hear **one design decision** and **one limitation** out loud.

## Record with OBS (recommended)

1. Install [OBS Studio](https://obsproject.com/) (free, no watermark, no time cap).
2. Sources → **Display Capture** or **Window Capture** (Chrome only).
3. Audio → your microphone. Do a 5-second test.
4. Close extra tabs. Font size comfortable. Do not open PowerPoint or a slide deck.
5. Before you hit Start:
   - `npm run dev`
   - Chrome: [http://localhost:3000/scout](http://localhost:3000/scout)  
     (or the live site: https://research-scout-swart.vercel.app/scout)
   - English or Arabic UI is fine; **narrate in English** unless the portal says otherwise.
6. Record **3:00–5:00**. Stop. Do not edit in a title-card slideshow.
7. Upload to YouTube → **Unlisted** → copy the link into `README.md` and the portal.

Loom’s free tier is also allowed.

---

## Teleprompter (read this while you click)

Keep this file beside the browser. Click as the script says. If a source fails in the log, **that is the limitation** — point at it; do not restart.

### 0:00–0:25 — What it is

> This is Research Scout, my AI Fluency capstone. It is a personal agent that pre-qualifies React and product roles for me: healthcare, e-commerce, junior-friendly, Egypt or remote. I used to spend half an hour a day on LinkedIn and Wuzzuf. The agent gathers, reads, scores, and filters. I still click Apply. It never submits an application.

### 0:25–1:10 — Live GATHER

*[Click **Run Scout** / **شغّل الكشّاف**. Stay on the log.]*

> Step one is gather. About twenty-six sources in parallel: Wuzzuf, LinkedIn, Indeed, Bayt, Upwork, Mostaql, RemoteOK, Remotive, The Muse, and others. Some sources return jobs. Some fail. That is expected. We do not fake listings when a board is down.

### 1:10–2:00 — READ + SCORE

> Step two reads the job pages. Step three scores each one out of nine: skills, domain, seniority, location. Watch the live scores. A junior React role in Egypt should sit at five or above. A Staff Engineer in San Francisco should not.

### 2:00–3:00 — Design decision (required)

*[Scroll to the E3 panel — it should say 6/6.]*

> One design decision I would make again: the agent is not allowed to apply. Ranking is the job. Submitting is mine. The other half of that decision is the seniority penalty. On the first run, a Senior Front-End role scored five out of nine because React matched. I am a student. So I added four signals: an LLM too-senior flag, the word senior in the title, six-plus years in the JD, and lead or staff in the title. Penalty two to four points, capped at minus four. Here is the eval: six tests, six pass. That is mechanical, not a vibe.

### 3:00–3:50 — Limitation / guardrail (required)

*[Point at a failed source, blocked page, or a 0/9 in the log if you have one. If this run is clean, still say the words and show Source health.]*

> Honest limitation: a lot of boards block the reader. LinkedIn and Upwork often return Cloudflare or a login wall. Those jobs get a low-signal flag or a zero. I do not invent a job description I could not read. The cost is coverage, especially freelance gigs. The next version would use official APIs, not a stealth scraper.

### 3:50–4:30 — Apply kit + close

*[Open one qualified role → Apply kit.]*

> Here is an apply kit: an English pitch and an Arabic why. I copy it, open the listing, and apply myself. The guardrail is still on screen: the agent never auto-applies. Code and eval: github.com/Mahmoud-ABDALKream/research-scout.

---

**Target length: ~4:20.** If you run long, cut the apply-kit section, not the decision or the limitation.

After upload, replace the demo line at the top of [`README.md`](../README.md) with the unlisted YouTube URL.
