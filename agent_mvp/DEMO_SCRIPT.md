# Demo Script — Research Scout (3-5 minutes)

**Setup before recording:**
- Open terminal at `~/research-scout/agent_mvp`
- Have `scout.py` ready to run
- Have `test_eval_e3.py` ready to run
- Close all other tabs — show only the real thing

---

## [0:00] Introduction (30 seconds)

> "This is Research Scout, my AI Fluency capstone agent. It's a personal job-scouting agent that pre-qualifies healthcare and e-commerce product roles matching my skills. Instead of scanning LinkedIn and Upwork manually for 30 minutes a day, the agent does it in 90 seconds and gives me a clean digest of 3-5 qualified roles."

## [0:30] Live Run — Step 1: GATHER (20 seconds)

> "Let me run it. Step 1 is GATHER — the agent calls web_search three times: once for LinkedIn Jobs, once for Upwork, once for Wuzzuf. That's 15 candidates gathered in about 7 seconds."

*[Run: python3 scout.py — let the audience see the terminal output scrolling]*

## [0:50] Live Run — Steps 2-3: READ + SCORE (60 seconds)

> "Step 2 is READ — the agent fetches the full job description from each of the top 8 URLs using page_reader. Step 3 is SCORE — an LLM scores each job on 4 criteria: skill match, domain match, seniority fit, and location fit. Total out of 9."

*[Let the terminal show the scoring output — audience sees scores like "6/9" and "2/9 [penalty: -2]"]*

## [1:50] Design Decision — Seniority Penalty (60 seconds)

> "Here's a design decision I want to explain. When I first ran the agent, a Senior Front-End Developer role scored 5 out of 9 — above my threshold — even though it requires 8 years of experience and I'm a student. The skill and domain match carried the score above the threshold.

> So I added a multi-signal seniority penalty. It checks four things: does the LLM flag 'too senior'? Does the title or JD contain the word 'senior'? Does the JD require 6+ years? Is it a lead or principal role? If any of these fire, the score gets penalized by 2 to 4 points, capped at -4.

> You can see it working right here — the Acoer Senior role got penalized -2 and dropped from 5 to 2, which is below the threshold. The Valleysoft role got the same treatment. Both correctly filtered out."

## [2:50] Limitation — Cloudflare Blocks (45 seconds)

> "Now let me be honest about a limitation. If you look at the Upwork results, 3 of them scored 0 out of 9. That's because Upwork blocks page_reader with a Cloudflare verification page — the agent can't read the actual job description.

> This is a known limitation. The agent handles it honestly — it scores those URLs 0 and filters them out, rather than guessing. But it means I'm losing 3 out of 8 candidates every run. In a future version, I'd use a different source for freelance gigs, or a paid scraping service that can bypass Cloudflare."

## [3:35] E3 Eval Test (30 seconds)

> "Let me prove the seniority fix works. This is the E3 eval test — 6 test cases covering all four signals."

*[Run: python3 test_eval_e3.py — show all 6 tests passing]*

> "All 6 pass. The penalty cap at -4 works — a perfect 9/9 with all four signals stays at 5/9, not lower."

## [4:05] Final Digest (30 seconds)

> "And here's the final digest. Today's run found 2 qualified roles — Frontend Developer at Halian, 6 out of 9, and Frontend Development Intern at Icura, 5 out of 9. Both are React roles at junior level, which is exactly what I'm looking for. The audit log records every URL fetched and scored, so I can review what was filtered out."

*[Show the digest output + audit_log.json]*

## [4:35] Wrap-up (25 seconds)

> "That's Research Scout. 5 steps, 3 live tool connections, 20 tool calls per run, 90 seconds, zero cost on the free tier. The code, the build log, and the eval results are all on GitHub at Mahmoud-ABDALKream/research-scout."

---

**Total: ~5 minutes. No slides. The real thing running live. One design decision (seniority penalty) and one limitation (Cloudflare blocks) explained on camera.**
