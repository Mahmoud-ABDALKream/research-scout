#!/usr/bin/env python3
"""
E3 Eval Case Test — Enhanced Seniority Scoring
================================================
Tests the enhanced multi-signal seniority penalty:
  - Signal 1: LLM "too senior" red flag → -2
  - Signal 2: "senior" keyword in title/JD → -2
  - Signal 3: 6+ years required → -1
  - Signal 4: lead/principal/staff title → -2
  - Cap: -4 max

Run: python3 agent_mvp/test_eval_e3.py
"""
import re
import json

print('=' * 64)
print('E3 EVAL TEST — Enhanced Seniority Scoring')
print('=' * 64)
print()

THRESHOLD = 5


def apply_seniority_penalty(score_json, title='', jd_text=''):
    """Replicate the enhanced penalty logic from scout.py."""
    red_flags = [str(f).lower() for f in score_json.get('red_flags', [])]
    jd_lower = jd_text.lower()[:2000]
    title_lower = title.lower()
    raw_total = score_json.get('total', 0)
    penalty = 0
    reason = ''

    # Signal 1: LLM flag
    if any('too senior' in f for f in red_flags):
        penalty += 2
        reason += 'too senior (LLM); '

    # Signal 2: "senior" keyword
    if 'senior' in title_lower or 'senior' in jd_lower[:500]:
        if not penalty:
            penalty += 2
            reason += 'senior keyword; '

    # Signal 3: years required
    years_match = re.search(r'(\d+)\+?\s*(?:years|yrs)\s*(?:of\s*)?(?:experience|exp)', jd_lower)
    if years_match:
        years = int(years_match.group(1))
        if years >= 6:
            penalty += 1
            reason += f'{years}+ years; '

    # Signal 4: lead/principal
    lead_kw = ['lead ', 'principal', 'staff ', 'head of']
    if any(kw in title_lower for kw in lead_kw):
        penalty += 2
        reason += 'lead/principal; '

    penalty = min(penalty, 4)
    score_json['total'] = max(0, raw_total - penalty)
    if penalty:
        score_json['penalty_applied'] = f'-{penalty} ({reason.strip("; ")})'
    return score_json, penalty


# ── Test 1: LLM flag only (original E3) ──
print('── Test 1: LLM "too senior" flag only ──')
mock = {'total': 5, 'red_flags': ['too senior']}
result, pen = apply_seniority_penalty(mock.copy())
print(f'  Raw: 5/9 → Final: {result["total"]}/9 (penalty: -{pen})')
assert result['total'] == 3, f'Expected 3, got {result["total"]}'
assert result['total'] < THRESHOLD
print('  ✅ PASSED — filtered out (3 < 5)')
print()

# ── Test 2: "Senior" in title (no LLM flag) ──
print('── Test 2: "Senior" in title (no LLM flag) ──')
mock = {'total': 5, 'red_flags': []}
result, pen = apply_seniority_penalty(mock.copy(), title='Senior Frontend Developer')
print(f'  Raw: 5/9 → Final: {result["total"]}/9 (penalty: -{pen})')
assert result['total'] == 3, f'Expected 3, got {result["total"]}'
print('  ✅ PASSED — senior in title caught without LLM flag')
print()

# ── Test 3: 8 years required (signal 3) ──
print('── Test 3: 8+ years required (with senior keyword) ──')
mock = {'total': 7, 'red_flags': []}
jd = 'Requires 8+ years of experience in React development.'
result, pen = apply_seniority_penalty(mock.copy(), title='Senior Engineer', jd_text=jd)
print(f'  Raw: 7/9 → Final: {result["total"]}/9 (penalty: -{pen})')
# senior keyword (-2) + 8 years (+1) = -3 → 7-3 = 4
assert result['total'] == 4, f'Expected 4, got {result["total"]}'
assert result['total'] < THRESHOLD
print('  ✅ PASSED — multi-signal: senior + 8 years → 4/9 (filtered)')
print()

# ── Test 4: Lead title (signal 4) ──
print('── Test 4: "Lead" in title ──')
mock = {'total': 8, 'red_flags': []}
result, pen = apply_seniority_penalty(mock.copy(), title='Lead Frontend Developer')
print(f'  Raw: 8/9 → Final: {result["total"]}/9 (penalty: -{pen})')
assert result['total'] == 6, f'Expected 6, got {result["total"]}'
# lead (-2) only = -2 → 8-2 = 6 (still qualifies but flagged)
print('  ✅ PASSED — lead title → -2, still qualifies at 6/9 but flagged')
print()

# ── Test 5: Junior role (no penalty) ──
print('── Test 5: Junior role (no penalty) ──')
mock = {'total': 7, 'red_flags': []}
result, pen = apply_seniority_penalty(mock.copy(), title='Junior Frontend Developer',
                                       jd_text='Entry-level position, 1 year experience.')
print(f'  Raw: 7/9 → Final: {result["total"]}/9 (penalty: -{pen})')
assert result['total'] == 7, f'Expected 7, got {result["total"]}'
assert pen == 0
print('  ✅ PASSED — junior role, no penalty applied')
print()

# ── Test 6: Penalty cap (max -4) ──
print('── Test 6: Penalty cap at -4 ──')
mock = {'total': 9, 'red_flags': ['too senior']}
# LLM flag (-2) + senior in title (-0, already counted) + 10 years (-1) + lead (-2) = -5, capped at -4
result, pen = apply_seniority_penalty(mock.copy(),
                                       title='Lead Senior Principal Engineer',
                                       jd_text='Requires 10+ years of experience.')
print(f'  Raw: 9/9 → Final: {result["total"]}/9 (penalty: -{pen})')
assert pen == 4, f'Expected penalty 4 (capped), got {pen}'
assert result['total'] == 5, f'Expected 5, got {result["total"]}'
print('  ✅ PASSED — penalty capped at -4, 9/9 → 5/9')
print()

print('=' * 64)
print('✅ ALL 6 TESTS PASSED — enhanced seniority scoring works')
print('   Multi-signal: LLM flag + keyword + years + lead title')
print('   Penalty cap: -4 max (perfect 9 stays at 5)')
print('=' * 64)
