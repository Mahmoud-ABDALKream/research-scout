# The Plan to Keep Building

## How to Add the Next Case Study

The portfolio uses the **three-beat shape** from Week 2: **problem → what you did → what came of it**. Every case study follows this structure. Here's exactly where each beat goes and which files to touch.

### The 3-Beat Shape (reuse this every time)

```
1. PROBLEM     — 1 paragraph. Who has what pain? Why does it matter?
                 (e.g., "Families juggle medications across disconnected apps.")

2. WHAT YOU DID — 3-4 sections: Design Process, Engineering, Outcome.
                 Real screenshots. Real numbers. Real quotes from the JD/users.

3. WHAT CAME OF IT — Stats, awards, metrics. What changed because you shipped?
                     (e.g., "iSchool 1st Place + Promising Startup Award 2025")
```

### Files to Edit (3 steps)

**Step 1: Create the case page**
```bash
# Create a new route for the project
mkdir src/app/work/PROJECT-NAME
touch src/app/work/PROJECT-NAME/page.tsx
```
Copy the structure from `src/app/work/medoniq/page.tsx` — it has the 3-beat shape already wired:
- Hero (title + role + award badge)
- Problem section
- Solution section (with screenshot)
- Design Process (4 phases)
- Engineering (with tech stack badges + GitHub link)
- Outcome (stats grid)
- Gallery (2+ screenshots)
- CTA (→ /contact)

Replace the content. Keep the layout.

**Step 2: Add to the Work page grid**
Open `src/app/page.tsx` (Home) and `src/app/work/page.tsx` (Work index).
Add the new project to the featured strip array (Home) or the project grid array (Work).
Each entry is 5 lines: href, img, tag, title, desc.

**Step 3: Add the screenshot**
Drop the real screenshot (Figma export or laptop mockup) into `public/images/`.
Reference it as `/images/FILENAME.png` in the page.

That's it. 3 files. ~30 minutes per case study.

### The Claude Project (already knows your voice)

Your Claude Project has:
- **Your identity kit** (Crystal Blue palette, Playfair Display + Inter typography, the one-line claim)
- **Your stack** (Next.js 16, TypeScript, Tailwind 4, shadcn/ui, Vercel)
- **Your voice** (first-person, honest, no fluff — proven across 19 deliverables)
- **Your content map** (6 pages, CTA ladder, proof statement)
- **Your case study format** (the 3-beat shape, Medoniq as the template)

**Next time you add a case, start a conversation in the Claude Project.** Say:
> "I'm adding a new case study for [PROJECT NAME]. Here's the problem, what I did, and what came of it. Can you write the page following the Medoniq template?"

The Claude Project will produce a draft in your voice, with your identity kit, matching your existing pages. You review, edit, push. That's the whole point of keeping the Project — the next case is a short conversation, not a rebuild.

---

## The Next Real Piece of Work

**Project:** XOperations (co-founded 2025, in progress)

**Why this one:** You're a Co-Founder and UI/UX Designer at XOperations (2025–present). It's listed on your About page experience timeline but has no case study page. It's the most current work on your portfolio — adding it proves you're actively building, not just showcasing old projects.

**3-Beat draft for XOperations:**
1. **Problem:** What problem does XOperations solve? (You know this — you co-founded it.)
2. **What you did:** UI/UX design + front-end decisions. Real screenshots once the product ships.
3. **What came of it:** Current status, users, revenue, or traction. If it's pre-launch, say so honestly — "in development, targeting launch Q1 2026" is more credible than fabricating metrics.

**Reminder:** Add the XOperations case study by **October 15, 2026**. Recurring monthly note: "Check if XOperations has shipped enough to write the case study. If yes, spend 30 minutes with Claude to draft it. If no, push the reminder 30 days."

---

## Build Context Preserved

All 19 deliverables from the AI Fluency track are on GitHub:
- **Portfolio repo:** github.com/Mahmoud-ABDALKream/portfolio (the live site)
- **Research-scout repo:** github.com/Mahmoud-ABDALKream/research-scout (the capstone agent + all PDFs)

The Claude Project should contain:
1. The identity kit (colors, fonts, claim) — encoded in the portfolio repo's `layout.tsx`
2. The content map (6 pages, CTA ladder) — in `DELIVERABLES_INDEX.md` on the research-scout repo
3. The case study template — `src/app/work/medoniq/page.tsx` on the portfolio repo
4. The retrospective — `RETROSPECTIVE.md` on the research-scout repo (your voice, your learnings)

**To set up the Claude Project for future use:**
1. Go to claude.ai/projects → New Project
2. Name it "Portfolio Builder"
3. Upload: README_FL09.md, RETROSPECTIVE.md, DELIVERABLES_INDEX.md
4. Add instructions: "You are my portfolio build partner. My identity kit is Crystal Blue (#0a1628, #4da8da, #e8f0f8). My stack is Next.js 16 + TypeScript + Tailwind + Vercel. My case studies follow the 3-beat shape: problem → what I did → what came of it. Reference the Medoniq case at src/app/work/medoniq/page.tsx as the template."

That's it. The next case study is a conversation, not a rebuild.
