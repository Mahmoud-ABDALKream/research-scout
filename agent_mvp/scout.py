#!/usr/bin/env python3
"""
Research Scout — Capstone MVP Agent (enhanced)
====================================
A working personal AI agent that pre-qualifies healthcare/e-commerce product
roles and freelance gigs matching Mahmoud's profile.

Built per the FL-06 spec:
  - 5-step workflow: GATHER → READ → SCORE → FILTER → FORMAT
  - Live tool connections: web_search + page_reader + LLM (z-ai SDK)
  - Guardrails: MUST NEVER auto-apply, MUST cite JD URLs, MUST log audit trail

Enhancements over the base MVP:
  - Daily history log (each run appended to history.jsonl)
  - Email-ready digest output (digest_email.txt, paste into any email client)
  - Environment-variable config (for cron / GitHub Actions)
  - Exit codes: 0 = success, 1 = no candidates, 2 = tool failure
"""
import json
import os
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path

# ─── Config (env vars for production, defaults for local dev) ──────────
AGENT_DIR = Path(os.environ.get('SCOUT_DIR', '/home/z/my-project/agent_mvp'))
AUDIT_LOG = AGENT_DIR / 'audit_log.json'
RUN_CAPTURE = AGENT_DIR / 'run_capture.txt'
DAILY_HISTORY = AGENT_DIR / 'history.jsonl'
EMAIL_DIGEST = AGENT_DIR / 'digest_email.txt'
# Optional: webhook URL for email delivery (e.g. https://your-webhook.com/scout)
EMAIL_WEBHOOK = os.environ.get('SCOUT_EMAIL_WEBHOOK', '')

# Mahmoud's profile (from FL-06 spec, hardcoded — no DB needed)
USER_PROFILE = {
    'name': 'Mahmoud ABD ELKream',
    'skills': ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Node.js',
               'Laravel', 'Figma', 'UI/UX design'],
    'domains': ['healthcare', 'e-commerce', 'Arabic RTL', 'IoT', 'streaming UI'],
    'seniority': 'junior (IT student, ~3 yrs freelance)',
    'seniority_max_years': 5,  # filter OUT roles requiring 6+ years
    'location': 'Alexandria, Egypt',
    'accept_locations': ['remote-egypt', 'remote-mena', 'on-site egypt', 'remote-global'],
    'reject_locations': ['us on-site no visa', 'eu on-site no visa'],
}

# Search queries (3 sources × 1 query each = 3 web_search calls, per guardrail)
QUERIES = [
    ('LinkedIn Jobs', 'site:linkedin.com/jobs React front-end developer healthcare Egypt remote'),
    ('Upwork', 'site:upwork.com React UI/UX designer e-commerce freelance'),
    ('Wuzzuf', 'site:wuzzuf.net React front-end developer Egypt'),
]

SCORE_THRESHOLD = 5  # /9 — drop anything below this


# ─── Tool wrappers (live tool connections via z-ai SDK) ──────────────
def web_search(query, num=5):
    """Live tool #1: web_search via z-ai-web-dev-sdk."""
    out = '/tmp/_scout_search.json'
    cmd = ['z-ai', 'function', '-n', 'web_search',
           '-a', json.dumps({'query': query, 'num': num}),
           '-o', out]
    subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    if os.path.exists(out):
        data = json.load(open(out))
        os.unlink(out)
        if isinstance(data, list):
            return data[:num]
        if isinstance(data, dict) and 'data' in data:
            return data['data'][:num]
    return []


def page_reader(url):
    """Live tool #2: page_reader via z-ai-web-dev-sdk."""
    out = '/tmp/_scout_page.json'
    cmd = ['z-ai', 'function', '-n', 'page_reader',
           '-a', json.dumps({'url': url}),
           '-o', out]
    subprocess.run(cmd, capture_output=True, text=True, timeout=90)
    if os.path.exists(out):
        data = json.load(open(out))
        os.unlink(out)
        import re
        html = data.get('data', {}).get('html', '')
        text = re.sub(r'<script[^>]*>[\s\S]*?</script>', ' ', html)
        text = re.sub(r'<style[^>]*>[\s\S]*?</style>', ' ', text)
        text = re.sub(r'<[^>]+>', ' ', text)
        text = re.sub(r'\s+', ' ', text).strip()
        return {
            'title': data.get('data', {}).get('title', ''),
            'text': text[:3000],  # truncate to keep LLM context manageable
            'url': url,
        }
    return {'title': '', 'text': '', 'url': url}


def llm_call(system_prompt, user_prompt):
    """Live tool #3: LLM via z-ai-web-dev-sdk chat completions."""
    out = '/tmp/_scout_llm.json'
    cmd = ['z-ai', 'chat', '-s', system_prompt, '-p', user_prompt, '-o', out]
    subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    if os.path.exists(out):
        data = json.load(open(out))
        os.unlink(out)
        return data.get('choices', [{}])[0].get('message', {}).get('content', '')
    return ''


# ─── System prompts ───────────────────────────────────────────────────
SCORE_SYS = """You are a job-match scorer for Mahmoud ABD ELKream.

Mahmoud's profile:
- Skills: React, Next.js, TypeScript, Tailwind CSS, Node.js, Laravel, Figma, UI/UX design
- Domains: healthcare, e-commerce (especially Arabic RTL), IoT, streaming UI
- Seniority: junior (IT student, ~3 yrs freelance). Reject roles requiring 6+ years.
- Location: Alexandria, Egypt. Accept: remote-Egypt, remote-MENA, on-site EGY, remote-global.
- Reject: US/EU on-site without visa sponsorship.

Score each job on 4 criteria (return ONLY a JSON object, no markdown):
{
  "skill_match": 0-3,      // 0=no match, 1=1 skill, 2=2-3 skills, 3=4+ skills
  "domain_match": 0-2,     // 0=unrelated, 1=adjacent, 2=direct match
  "seniority_fit": 0-2,    // 0=too senior (6+ yrs req), 1=stretch, 2=right level
  "location_fit": 0-2,     // 0=reject location, 1=acceptable, 2=ideal
  "total": sum,            // /9
  "rationale": "1-line reason with a short quote from the JD",
  "red_flags": ["list any: visa issue, too senior, thin JD, etc."]
}

Guardrails:
- MUST quote exact text from the JD in the rationale.
- MUST NEVER invent salary or seniority not stated in the JD.
- If JD is thin (<100 words), set red_flags to include "low-signal".
"""

FORMAT_SYS = """You are a digest formatter. Take the scored jobs and produce
a clean numbered digest. Format each item EXACTLY:

[N] <Role title> @ <Company> (<Location>)
    Score: <X/9> | Match: <1-line rationale>
    Apply: <URL>

Rules:
- Max 5 items, ordered by score (highest first).
- If fewer than 3 qualify, say "Thin day — only N roles above threshold" at the top.
- No commentary before or after the digest.
- Plain text, no markdown.
"""


# ─── The 5-step agent workflow ────────────────────────────────────────
def run_scout():
    """Run the Research Scout agent end-to-end."""
    run_log = []
    audit_entries = []

    def log(msg):
        print(msg)
        run_log.append(msg)

    log('=' * 64)
    log('RESEARCH SCOUT — MVP RUN')
    log(f'Timestamp: {datetime.now().isoformat()}')
    log(f'User: {USER_PROFILE["name"]}')
    log('=' * 64)

    # ─── STEP 1: GATHER ──────────────────────────────────────────────
    log('\n── STEP 1: GATHER (web_search on 3 sources) ──')
    all_candidates = []
    t0 = time.time()
    for source, query in QUERIES:
        log(f'  [{source}] query: "{query[:60]}..."')
        results = web_search(query, num=5)
        log(f'  [{source}] returned {len(results)} results')
        for r in results:
            if isinstance(r, dict):
                all_candidates.append({
                    'source': source,
                    'title': r.get('name', ''),
                    'url': r.get('url', ''),
                    'snippet': r.get('snippet', ''),
                    'host': r.get('host_name', ''),
                })
        time.sleep(1)  # be polite to the search API
    gather_time = round(time.time() - t0, 1)
    log(f'\n  Total candidates gathered: {len(all_candidates)} (in {gather_time}s)')

    if not all_candidates:
        log('\n❌ No candidates found. Agent cannot proceed.')
        return '\n'.join(run_log), audit_entries

    # ─── STEP 2: READ (top 8 by relevance) ──────────────────────────
    log('\n── STEP 2: READ (page_reader on top 8 URLs) ──')
    # Dedupe by URL, take top 8
    seen_urls = set()
    top_candidates = []
    for c in all_candidates:
        if c['url'] not in seen_urls:
            seen_urls.add(c['url'])
            top_candidates.append(c)
        if len(top_candidates) >= 8:
            break

    log(f'  Reading {len(top_candidates)} URLs (deduped from {len(all_candidates)})...')
    t0 = time.time()
    for i, c in enumerate(top_candidates, 1):
        log(f'  [{i}/{len(top_candidates)}] {c["title"][:60]}')
        page = page_reader(c['url'])
        c['full_text'] = page['text']
        c['page_title'] = page['title']
        time.sleep(0.5)
    read_time = round(time.time() - t0, 1)
    log(f'  Read complete in {read_time}s')

    # ─── STEP 3: SCORE (LLM scores each candidate) ──────────────────
    log('\n── STEP 3: SCORE (LLM match scoring) ──')
    t0 = time.time()
    for i, c in enumerate(top_candidates, 1):
        jd_text = c.get('full_text', '')[:1500] or c.get('snippet', '')
        user_prompt = f"""JOB TITLE: {c['title']}
JOB URL: {c['url']}
JOB SOURCE: {c['source']}

JOB DESCRIPTION (first 1500 chars):
{jd_text}

Score this job. Return ONLY the JSON object."""

        score_raw = llm_call(SCORE_SYS, user_prompt)
        # Parse JSON from LLM response (handle markdown code fences)
        score_json = None
        try:
            # Strip markdown code fences if present
            clean = score_raw.strip()
            if clean.startswith('```'):
                clean = clean.split('\n', 1)[1] if '\n' in clean else clean[3:]
                if clean.endswith('```'):
                    clean = clean[:-3]
                clean = clean.strip()
            # Find first { and last }
            start = clean.find('{')
            end = clean.rfind('}')
            if start >= 0 and end > start:
                score_json = json.loads(clean[start:end+1])
        except Exception as e:
            log(f'  [{i}/{len(top_candidates)}] SCORE PARSE ERROR: {e}')

        if score_json:
            # ── Seniority penalty (enhanced, see eval E3) ──
            # Multi-signal detection: checks red_flags + JD text + title for seniority markers.
            # Penalty tiers: -2 for "senior" keyword, -3 for "senior + 8+ years", -4 for "lead/principal".
            red_flags = [str(f).lower() for f in score_json.get('red_flags', [])]
            jd_text_lower = (c.get('full_text', '') or c.get('snippet', '')).lower()[:2000]
            title_lower = c.get('title', '').lower()
            raw_total = score_json.get('total', 0)
            penalty = 0
            penalty_reason = ''

            # Signal 1: LLM flagged "too senior" in red_flags
            if any('too senior' in f for f in red_flags):
                penalty += 2
                penalty_reason += 'too senior (LLM flag); '

            # Signal 2: Title or JD contains "senior" (case-insensitive)
            senior_in_title = 'senior' in title_lower
            senior_in_jd = 'senior' in jd_text_lower[:500]
            if senior_in_title or senior_in_jd:
                if not penalty:  # don't double-count if LLM already flagged
                    penalty += 2
                    penalty_reason += 'senior keyword in JD/title; '

            # Signal 3: Years required > 5 (extract from JD text)
            import re
            years_match = re.search(r'(\d+)\+?\s*(?:years|yrs)\s*(?:of\s*)?(?:experience|exp)', jd_text_lower)
            if years_match:
                years_req = int(years_match.group(1))
                if years_req >= 6:
                    penalty += 1
                    penalty_reason += f'{years_req}+ years required; '
                elif years_req >= 4:
                    penalty_reason += f'{years_req}+ years (stretch, no penalty); '

            # Signal 4: Lead/Principal/Staff (auto-reject tier)
            lead_keywords = ['lead ', 'principal', 'staff ', 'head of']
            if any(kw in title_lower for kw in lead_keywords):
                penalty += 2
                penalty_reason += 'lead/principal title; '

            # Apply penalty (cap at -4 so a perfect 9 doesn't go below 5)
            penalty = min(penalty, 4)
            if penalty:
                score_json['total'] = max(0, raw_total - penalty)
                score_json['penalty_applied'] = f'-{penalty} ({penalty_reason.strip("; ")}; raw was {raw_total})'
            c['score'] = score_json
            total = score_json.get('total', 0)
            penalty_note = f' [penalty: -{penalty}]' if penalty else ''
            log(f'  [{i}/{len(top_candidates)}] score: {total}/9{penalty_note} — {score_json.get("rationale", "")[:70]}')
        else:
            c['score'] = {'total': 0, 'rationale': 'parse error', 'red_flags': ['scoring_failed']}
            log(f'  [{i}/{len(top_candidates)}] score: FAILED')

        # Audit entry (guardrail: MUST log all fetched URLs)
        audit_entries.append({
            'url': c['url'],
            'title': c['title'],
            'source': c['source'],
            'score_total': c['score'].get('total', 0),
            'rationale': c['score'].get('rationale', ''),
            'red_flags': c['score'].get('red_flags', []),
            'fetched_at': datetime.now().isoformat(),
        })

    score_time = round(time.time() - t0, 1)
    log(f'  Scoring complete in {score_time}s')

    # ─── STEP 4: FILTER ─────────────────────────────────────────────
    log('\n── STEP 4: FILTER (drop below threshold) ──')
    qualified = [c for c in top_candidates if c['score'].get('total', 0) >= SCORE_THRESHOLD]
    qualified.sort(key=lambda x: x['score'].get('total', 0), reverse=True)
    qualified = qualified[:5]  # max 5

    log(f'  Threshold: {SCORE_THRESHOLD}/9')
    log(f'  Above threshold: {len(qualified)}')
    log(f'  Below threshold (filtered): {len(top_candidates) - len(qualified)}')

    if len(qualified) < 3:
        log(f'  ⚠️  Thin day — only {len(qualified)} roles above threshold')

    # ─── STEP 5: FORMAT ─────────────────────────────────────────────
    log('\n── STEP 5: FORMAT (final digest) ──')
    if not qualified:
        digest = 'No roles above threshold today. Review audit log for filtered candidates.'
    else:
        # Use LLM to format the digest cleanly
        scored_data = []
        for i, c in enumerate(qualified, 1):
            scored_data.append({
                'n': i,
                'title': c['title'],
                'url': c['url'],
                'source': c['source'],
                'score': c['score'].get('total', 0),
                'rationale': c['score'].get('rationale', ''),
                'red_flags': c['score'].get('red_flags', []),
            })

        if len(qualified) < 3:
            format_prompt = f"Thin day — only {len(qualified)} roles above threshold.\n\nSCORED JOBS:\n{json.dumps(scored_data, indent=2)}\n\nProduce the digest."
        else:
            format_prompt = f'SCORED JOBS:\n{json.dumps(scored_data, indent=2)}\n\nProduce the digest.'

        digest = llm_call(FORMAT_SYS, format_prompt)

    log('\n' + '=' * 64)
    log('DAILY DIGEST')
    log('=' * 64)
    log('\n' + digest)
    log('\n' + '=' * 64)
    log(f'Run complete. Audit log: {AUDIT_LOG}')
    log('=' * 64)

    # Save audit log (guardrail: MUST log all fetched URLs)
    with open(AUDIT_LOG, 'w') as f:
        json.dump({
            'run_timestamp': datetime.now().isoformat(),
            'queries': [q[1] for q in QUERIES],
            'candidates_fetched': len(all_candidates),
            'candidates_read': len(top_candidates),
            'candidates_qualified': len(qualified),
            'threshold': SCORE_THRESHOLD,
            'entries': audit_entries,
        }, f, indent=2)

    # Save full run capture
    full_log = '\n'.join(run_log) + '\n\n--- DIGEST ---\n' + digest
    with open(RUN_CAPTURE, 'w') as f:
        f.write(full_log)

    # ── Enhancement 1: Append to daily history (history.jsonl) ──
    history_entry = {
        'date': datetime.now().strftime('%Y-%m-%d'),
        'timestamp': datetime.now().isoformat(),
        'candidates_fetched': len(all_candidates),
        'candidates_read': len(top_candidates),
        'candidates_qualified': len(qualified),
        'digest': digest,
        'qualified_roles': [
            {
                'title': c['title'],
                'url': c['url'],
                'source': c['source'],
                'score': c['score'].get('total', 0),
                'rationale': c['score'].get('rationale', ''),
            }
            for c in qualified
        ],
    }
    with open(DAILY_HISTORY, 'a') as f:
        f.write(json.dumps(history_entry, ensure_ascii=False) + '\n')
    log(f'\n  📅 History entry appended to {DAILY_HISTORY.name}')

    # ── Enhancement 2: Write email-ready digest ──
    email_subject = f'Research Scout Daily Digest — {datetime.now().strftime("%b %d, %Y")}'
    email_body = f"""Subject: {email_subject}
To: mahmoudabdelkreambusiness@gmail.com
From: Research Scout <scout@agent.local>
Date: {datetime.now().strftime('%a, %d %b %Y %H:%M:%S +0200')}

{digest}

───
This digest was generated by the Research Scout agent.
Audit log: {AUDIT_LOG}
Run timestamp: {datetime.now().isoformat()}
"""
    with open(EMAIL_DIGEST, 'w') as f:
        f.write(email_body)
    log(f'  📧 Email-ready digest saved to {EMAIL_DIGEST.name}')

    # ── Enhancement 3: Optional webhook for email delivery ──
    if EMAIL_WEBHOOK:
        try:
            import urllib.request
            data = json.dumps({
                'subject': email_subject,
                'body': digest,
                'timestamp': datetime.now().isoformat(),
            }).encode()
            req = urllib.request.Request(
                EMAIL_WEBHOOK, data=data,
                headers={'Content-Type': 'application/json'},
                method='POST'
            )
            urllib.request.urlopen(req, timeout=10)
            log(f'  📤 Digest sent to webhook: {EMAIL_WEBHOOK[:40]}...')
        except Exception as e:
            log(f'  ⚠️  Webhook delivery failed: {e}')

    return full_log, audit_entries


if __name__ == '__main__':
    log_text, entries = run_scout()
    # Exit codes: 0 = success, 1 = no candidates, 2 = tool failure
    if not entries:
        sys.exit(2)
    qualified = [e for e in entries if e.get('score_total', 0) >= SCORE_THRESHOLD]
    if not qualified:
        sys.exit(1)
    sys.exit(0)
