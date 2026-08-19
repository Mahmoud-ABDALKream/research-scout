# Build-in-Public Post — Research Scout

*For LinkedIn or the FlyRank showcase thread. ~250 words.*

---

## I built an AI agent that scouts jobs for me. Here's one decision I'd make again, and one limitation I'm honest about.

I just finished building Research Scout — a personal AI agent that pre-qualifies healthcare and e-commerce product roles matching my skills. It runs 5 steps (gather → read → score → filter → format), uses 3 live tool connections, and produces a daily digest in 90 seconds. Zero cost on the free tier.

**One decision I'd make again: the seniority penalty.**

When I first ran the agent, a Senior Front-End Developer role scored 5/9 — above my threshold — even though it requires 8 years of experience and I'm a student. The skill and domain match carried the score. So I added a multi-signal penalty: if the LLM flags "too senior," if the title or JD contains "senior," if 6+ years are required, or if it's a lead/principal role — the score gets penalized -2 to -4. Capped at -4 so a perfect 9/9 stays at 5/9. The Acoer Senior role dropped from 5 to 2 and got filtered out. That's the agent doing the right thing because of a design decision I made, not because of luck.

**One limitation I'm honest about: Cloudflare blocks.**

Upwork blocks my page_reader with Cloudflare verification pages. 3 out of 8 candidates every run score 0/9 because the JD is inaccessible. The agent handles it honestly — scores 0, filters out, logs to the audit trail — but it means I'm losing a third of my freelance candidates. In a future version, I'd use a different source or a paid scraping service. For the MVP, I documented it as a known limitation rather than hiding it.

The code, build log, and eval results are on GitHub: github.com/Mahmoud-ABDALKream/research-scout

Built with AI. Verified by me.

---

*Live site: mahmoud-ahmed-abdelkream.vercel.app*
*GitHub: github.com/Mahmoud-ABDALKream*
