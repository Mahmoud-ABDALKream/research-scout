import { MAX_QUALIFIED, SCORE_THRESHOLD } from "./config";
import { buildApplyKit, rolePriority } from "./apply-kit";
import { ApplyKit, QualifiedRole, ScoutCandidate } from "./types";

function titleKey(c: ScoutCandidate) {
  const company = (c.company || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
  const title = c.title
    .toLowerCase()
    .replace(/@.*$/, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .slice(0, 5)
    .join(" ");
  return `${company}|${title}`;
}

export function dedupeCandidates(candidates: ScoutCandidate[]) {
  const best = new Map<string, ScoutCandidate>();
  for (const c of candidates) {
    const key = titleKey(c);
    const prev = best.get(key);
    if (!prev || (c.score?.total || 0) > (prev.score?.total || 0)) best.set(key, c);
  }
  return [...best.values()];
}

export function filterQualified(
  candidates: ScoutCandidate[],
  threshold = SCORE_THRESHOLD,
  maxQualified = MAX_QUALIFIED
) {
  return dedupeCandidates(candidates)
    .filter((c) => (c.score?.total || 0) >= threshold)
    .sort((a, b) => (b.score?.total || 0) - (a.score?.total || 0))
    .slice(0, maxQualified);
}

export function formatDigest(qualified: ScoutCandidate[]): string {
  if (!qualified.length) {
    return "No roles above threshold today. Review audit log for filtered candidates.";
  }

  const lines: string[] = [];
  if (qualified.length < 3) {
    lines.push(`Thin day — only ${qualified.length} roles above threshold`);
    lines.push("");
  }

  qualified.forEach((c, i) => {
    const loc = c.location || "Remote / unspecified";
    const company = c.company ? `@ ${c.company}` : "";
    const title = c.title.includes("@") ? c.title : `${c.title} ${company}`.trim();
    const newMark = c.isNew ? " [NEW]" : "";
    const egyptMark = c.score?.egyptFit ? " [EGYPT]" : "";
    lines.push(`[${i + 1}] ${title} (${loc})${newMark}${egyptMark}`);
    lines.push(
      `    Score: ${c.score?.total ?? 0}/9 | Skills ${c.score?.skill_match}/3 · Domain ${c.score?.domain_match}/2 · Seniority ${c.score?.seniority_fit}/2 · Location ${c.score?.location_fit}/2`
    );
    lines.push(`    Why: ${c.score?.whyFit || c.score?.rationale || ""}`);
    if (c.score?.salaryQuote) lines.push(`    Salary (quoted in JD): ${c.score.salaryQuote}`);
    lines.push(`    Apply: ${c.url}`);
    if (c.score?.red_flags?.length) {
      lines.push(`    Flags: ${c.score.red_flags.join(", ")}`);
    }
    lines.push("");
  });

  lines.push("Guardrail: agent never auto-applies. You click Apply.");
  return lines.join("\n").trim();
}

export function toQualifiedRoles(
  qualified: ScoutCandidate[],
  kits?: Map<string, ApplyKit>
): QualifiedRole[] {
  return qualified.map((c) => {
    const role: QualifiedRole = {
      title: c.title,
      url: c.url,
      source: c.source,
      company: c.company,
      location: c.location,
      score: c.score?.total || 0,
      rationale: c.score?.rationale || "",
      whyFit: c.score?.whyFit,
      skills: c.score?.skills,
      domains: c.score?.domains,
      breakdown: c.score
        ? {
            skill_match: c.score.skill_match,
            domain_match: c.score.domain_match,
            seniority_fit: c.score.seniority_fit,
            location_fit: c.score.location_fit,
          }
        : undefined,
      red_flags: c.score?.red_flags || [],
      isNew: c.isNew,
      excerpt: (c.fullText || c.snippet || "").slice(0, 420),
      salaryQuote: c.score?.salaryQuote,
      yearsHint: c.score?.yearsHint,
      egyptFit: c.score?.egyptFit,
      applyKit: kits?.get(c.url) || buildApplyKit(c),
    };
    role.priority = rolePriority(role);
    return role;
  });
}
