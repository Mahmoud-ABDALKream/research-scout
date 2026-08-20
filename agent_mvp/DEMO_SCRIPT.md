# Demo script — Research Scout (3–5 minutes, live, no slides)

**Before record:** `npm run dev` · browser at [http://localhost:3000/scout](http://localhost:3000/scout) · Groq badge visible if the key is loaded · close extra tabs.

**After record:** paste the public video URL into the root `README.md` (“Video link”) and the showcase thread.

---

## [0:00] What it is (25s)

> “This is Research Scout, my AI Fluency capstone. It’s a personal agent that pre-qualifies React and product roles for me — healthcare, e-commerce, junior-friendly, Egypt or remote. I used to spend half an hour a day on LinkedIn and Wuzzuf. The agent gathers, reads, scores, and filters. I still click Apply. It never submits an application.”

## [0:25] Live run — GATHER (40s)

*[Click **شغّل الكشّاف / Run Scout**. Stay on the Log tab.]*

> “Step one is GATHER. Twenty-six sources in parallel: Wuzzuf, LinkedIn, Indeed, Bayt, GulfTalent, Upwork, مستقل, RemoteOK, Remotive, The Muse, and the rest. You’ll see some sources return jobs and some fail — that’s expected. We don’t fake listings when a board is down.”

## [1:05] READ + SCORE (50s)

> “Step two reads the actual job pages. Step three scores each one out of nine: skills, domain, seniority, location. Groq writes a specific why-fit instead of a keyword dump. Watch the live scores on the right — a junior React role in Egypt should sit at five or above. A Staff Engineer in San Francisco should not.”

## [1:55] Design decision on camera (55s)

> “One design decision I would make again: the agent is not allowed to apply. Ranking is the job. Submitting is mine. The second half of that decision is the seniority penalty. On the first Python run, a Senior Front-End role scored five out of nine because React and healthcare matched. I’m a student. So I added four signals — LLM ‘too senior’ flag, the word senior in the title, six-plus years in the JD, lead or staff in the title — penalty two to four points, capped at minus four. Open the E3 panel: six tests, six pass. That’s mechanical, not a vibe.”

*[Point at the E3 6/6 panel on `/scout`.]*

## [2:50] Limitation on camera (45s)

> “Honest limitation: a lot of boards block the reader. LinkedIn and Upwork often return Cloudflare or a login wall. Those jobs get a low-signal flag or a zero, and they fall out of the digest. I’m not guessing a JD I couldn’t read. The cost is coverage — especially freelance gigs. The next version would use official APIs or fewer blocked sources, not a stealth scraper.”

*[If the log shows `[LinkedIn] failed` or `blocked/empty page`, point at it.]*

## [3:35] CV + apply kit (40s)

> “If I upload my CV, search and scoring follow those skills. Here’s an apply kit: English pitch, Arabic why, talking points. I copy it, open the listing, and apply myself. Guardrail is still on screen: the agent never auto-applies.”

## [4:15] Close (20s)

> “That’s the live run. Code and eval results: github.com/Mahmoud-ABDALKream/research-scout. Built with Cursor and Groq. Checked by me.”

---

**Total ~4:30.** No slides. One decision (never auto-apply + E3 penalty). One limitation (blocked boards).
