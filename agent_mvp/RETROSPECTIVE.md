# Retrospective — written for the person I was in Week 1

*Mahmoud — read this before you treat “I use ChatGPT” as fluency.*

---

You will start the track thinking a portfolio is a gallery and AI is a faster intern. By Week 10 you will have a URL, a working agent, and a different way of working. The change is not “I prompt better.” It is that you now sort, chain, and refuse.

## What you set out to do

Week 1 had one job: prove you are a Front-End Developer and Product Designer, not a student with a Figma file. The line you sharpened — “From Figma to shipped React — award-winning product design for healthcare and e-commerce” — became the spine of the site and of Research Scout. The agent exists because the portfolio claim is healthcare and e-commerce UI, and you were wasting evenings on LinkedIn for junior React roles in Egypt.

## What specifically changed in how you work

**You learned to sort, not generate.** Week 3 (Curate Your Images) was the break. AI gave ten claim lines in seconds; the work was picking one and cutting the rest. AI gave a hundred heroes; you rejected the magenta one because it broke Crystal Blue. That is the same muscle as scoring jobs: the model can praise every listing; your rubric drops anything under 5/9.

**You stopped living in single prompts.** The Workflow Audit forced a five-step pipeline with named failure points. Research Scout is that pipeline with tools attached: GATHER → READ → SCORE → FILTER → FORMAT. The LLM does not choose the next step. Your code does. When a tutor called that an agent, you kept the honest version: the control flow is yours; the model is a tool inside SCORE and FORMAT.

**You put the agent where a stranger can press it.** The Python MVP proved the loop. The thing you actually demo is `/scout` in the Next.js app: CV upload, twenty-six sources, Groq why-fit, apply kit, tracker. That was not in the Week 1 plan. What changed: you stopped treating the capstone as a script reviewers must run in a terminal, and you stopped treating the portfolio as a separate object from the agent.

**You learned a penalty is a product decision.** The first live run let a Senior Front-End role through at 5/9 because React and healthcare matched. You are a student. The multi-signal seniority penalty (LLM flag, title keyword, years regex, lead/staff title, cap −4) is the first time you designed against your own model instead of decorating its output. E3 is 6/6. That test is how you work now: if the model can be fluent and wrong, add a check you can run without the model.

**You shipped, then broke your own site.** Empty-but-live, six pages, contact API, twelve edge cases, XSS and 404 and OG tags. The same honesty landed in Scout: Cloudflare blocks are a limitation in the README, not a silent zero in a screenshot.

## What you’d build next

Wire Scout to a daily GitHub Action with `GROQ_API_KEY` as a secret so the digest exists before you open the laptop. Prefer official or RSS sources over DuckDuckGo `site:` queries for Egypt boards. Send the contact form through Resend. Deploy Medoniq / WEflex / Serinia so “shipped React” is a URL, not only a case study. None of that is the capstone. The capstone is one job, never auto-apply, eval in the repo.

## The three most transferable things

1. **Judgment over generation.** AI will always produce more than you need. The skill is a threshold, a skip list, and the nerve to publish a “thin day” instead of padding.

2. **Workflows over prompts.** A prompt saves a minute. A named pipeline with logs, an audit file, and a test table saves the week you would have spent re-litigating the same senior role.

3. **Honesty as the interface.** “The agent applied for me” would have been a better demo sentence and a worse product. Naming the blocked boards, the Groq optional path, and what you checked yourself is how a reviewer decides you can be trusted with a real pipeline.

---

*You arrived thinking fluency was access to models. You leave knowing it is the habit of deciding what the model is for, what it must not do, and what you still owe the human who will click Apply.*
