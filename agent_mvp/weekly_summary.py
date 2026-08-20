#!/usr/bin/env python3
"""
Research Scout — Weekly Summary Generator
==========================================
Parses history.jsonl and produces a 7-day summary report.

Usage:
  python3 agent_mvp/weekly_summary.py              # last 7 days
  python3 agent_mvp/weekly_summary.py --days 14   # last 14 days
  python3 agent_mvp/weekly_summary.py --all        # all history

Output: prints to terminal + saves to agent_mvp/weekly_summary_<date>.txt
"""
import json
import argparse
import sys
from datetime import datetime, timedelta
from pathlib import Path
from collections import Counter

HISTORY_FILE = Path(__file__).parent / 'history.jsonl'
OUTPUT_DIR = Path(__file__).parent


def load_history(days=None, all_history=False):
    """Load history entries, optionally filtered to last N days."""
    if not HISTORY_FILE.exists():
        print(f'❌ No history file found at {HISTORY_FILE}')
        print(f'   Run the agent first: python3 agent_mvp/scout.py')
        sys.exit(1)

    entries = []
    with open(HISTORY_FILE) as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                entries.append(json.loads(line))
            except json.JSONDecodeError as e:
                print(f'⚠️  Skipping malformed line: {e}')
                continue

    if all_history or days is None:
        if days is not None:
            cutoff = datetime.now() - timedelta(days=days)
            entries = [e for e in entries
                       if datetime.fromisoformat(e['timestamp']) >= cutoff]
    return entries


def generate_summary(entries):
    """Generate the weekly summary report."""
    if not entries:
        return 'No runs in the specified period.'

    lines = []
    lines.append('=' * 64)
    lines.append('RESEARCH SCOUT — WEEKLY SUMMARY')
    lines.append('=' * 64)
    lines.append(f'Period: {entries[0]["date"]} → {entries[-1]["date"]}')
    lines.append(f'Total runs: {len(entries)}')
    lines.append('')

    # ── Aggregate stats ──
    total_fetched = sum(e.get('candidates_fetched', 0) for e in entries)
    total_read = sum(e.get('candidates_read', 0) for e in entries)
    total_qualified = sum(e.get('candidates_qualified', 0) for e in entries)
    all_roles = []
    for e in entries:
        all_roles.extend(e.get('qualified_roles', []))

    lines.append('── AGGREGATE STATS ──')
    lines.append(f'  Total candidates fetched:  {total_fetched}')
    lines.append(f'  Total candidates read:     {total_read}')
    lines.append(f'  Total candidates qualified: {total_qualified}')
    lines.append(f'  Unique qualified roles:   {len(all_roles)}')
    lines.append('')

    # ── Per-day breakdown ──
    lines.append('── PER-DAY BREAKDOWN ──')
    lines.append(f'  {"Day":<12} {"Fetched":>8} {"Read":>6} {"Qualified":>10}')
    lines.append(f'  {"─"*12} {"─"*8} {"─"*6} {"─"*10}')
    for e in entries:
        lines.append(f'  {e["date"]:<12} {e.get("candidates_fetched",0):>8} '
                     f'{e.get("candidates_read",0):>6} '
                     f'{e.get("candidates_qualified",0):>10}')
    lines.append('')

    # ── Top roles by score ──
    lines.append('── TOP ROLES BY SCORE (across all days) ──')
    sorted_roles = sorted(all_roles, key=lambda r: r.get('score', 0), reverse=True)
    for i, r in enumerate(sorted_roles[:10], 1):
        lines.append(f'  [{i}] {r.get("score",0)}/9 — {r["title"][:60]}')
        lines.append(f'       Source: {r.get("source","?")} | URL: {r["url"][:70]}')
        rationale = r.get('rationale', '')[:90]
        lines.append(f'       Match: {rationale}')
        lines.append('')

    # ── Source distribution ──
    lines.append('── SOURCE DISTRIBUTION (qualified roles) ──')
    source_counts = Counter(r.get('source', '?') for r in all_roles)
    for source, count in source_counts.most_common():
        pct = (count / len(all_roles) * 100) if all_roles else 0
        lines.append(f'  {source:<20} {count:>3} roles ({pct:.0f}%)')
    lines.append('')

    # ── Score distribution ──
    lines.append('── SCORE DISTRIBUTION ──')
    score_counts = Counter(r.get('score', 0) for r in all_roles)
    for score in sorted(score_counts.keys(), reverse=True):
        count = score_counts[score]
        bar = '█' * count
        lines.append(f'  {score}/9: {bar} ({count})')
    lines.append('')

    # ── Goal check ──
    lines.append('── GOAL CHECK ──')
    lines.append(f'  Target: 2-3 applications/week')
    lines.append(f'  Qualified roles this period: {len(all_roles)}')
    lines.append(f'  (Reminder: agent surfaces, YOU apply. '
                 f'Track actual applications in TRACKING.md)')
    if len(all_roles) >= 2:
        lines.append(f'  ✅ Enough qualified roles to hit target '
                     f'(if you applied to all)')
    elif len(all_roles) >= 1:
        lines.append(f'  ⚠️  Below target — thin week. Consider broadening queries.')
    else:
        lines.append(f'  ❌ No qualified roles this period. Check agent health.')
    lines.append('')

    # ── Thin days ──
    thin_days = [e for e in entries if e.get('candidates_qualified', 0) < 3]
    if thin_days:
        lines.append('── THIN DAYS (<3 qualified) ──')
        for e in thin_days:
            lines.append(f'  {e["date"]}: {e.get("candidates_qualified",0)} qualified')
        lines.append(f'  Total thin days: {len(thin_days)}/{len(entries)} '
                     f'({len(thin_days)/len(entries)*100:.0f}%)')
        lines.append('')

    lines.append('=' * 64)
    lines.append(f'Summary generated: {datetime.now().isoformat()}')
    lines.append(f'History file: {HISTORY_FILE.name}')
    lines.append('=' * 64)

    return '\n'.join(lines)


def main():
    parser = argparse.ArgumentParser(
        description='Generate weekly summary from Research Scout history')
    parser.add_argument('--days', type=int, default=7,
                        help='Number of days to summarize (default: 7)')
    parser.add_argument('--all', action='store_true',
                        help='Summarize all history (ignores --days)')
    args = parser.parse_args()

    entries = load_history(days=args.days, all_history=args.all)
    summary = generate_summary(entries)

    print(summary)

    # Save to file
    date_str = datetime.now().strftime('%Y-%m-%d')
    if args.all:
        suffix = 'all'
    else:
        suffix = f'{args.days}d'
    output_file = OUTPUT_DIR / f'weekly_summary_{suffix}_{date_str}.txt'
    with open(output_file, 'w') as f:
        f.write(summary)
    print(f'\n📄 Summary saved to: {output_file.name}')


if __name__ == '__main__':
    main()
