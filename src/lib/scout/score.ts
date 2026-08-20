import { DOMAIN_ADJACENT, DOMAIN_DIRECT, SKILL_GROUPS, isJunkListing } from "./config";
import { defaultProfile, groupsFromProfile } from "./parse-cv";
import { CvProfile, ScoutCandidate, ScoreResult } from "./types";

export function applySeniorityPenalty(
  score: ScoreResult,
  title = "",
  jdText = ""
): { score: ScoreResult; penalty: number } {
  const redFlags = (score.red_flags || []).map((f) => String(f).toLowerCase());
  const jdLower = jdText.toLowerCase().slice(0, 2000);
  const titleLower = title.toLowerCase();
  const rawTotal = score.total;
  let penalty = 0;
  let reason = "";

  if (redFlags.some((f) => f.includes("too senior"))) {
    penalty += 2;
    reason += "too senior (LLM flag); ";
  }

  const seniorInTitle = titleLower.includes("senior");
  const seniorInJd = jdLower.slice(0, 500).includes("senior");
  if ((seniorInTitle || seniorInJd) && penalty === 0) {
    penalty += 2;
    reason += "senior keyword in JD/title; ";
  }

  const yearsMatch = jdLower.match(
    /(\d+)\+?\s*(?:years|yrs)\s*(?:of\s*)?(?:experience|exp)/
  );
  if (yearsMatch) {
    const yearsReq = parseInt(yearsMatch[1], 10);
    if (yearsReq >= 6) {
      penalty += 1;
      reason += `${yearsReq}+ years required; `;
    } else if (yearsReq >= 4) {
      reason += `${yearsReq}+ years (stretch, no penalty); `;
    }
  }

  const leadKeywords = ["lead ", "principal", "staff ", "head of"];
  if (leadKeywords.some((kw) => titleLower.includes(kw))) {
    penalty += 2;
    reason += "lead/principal title; ";
  }

  penalty = Math.min(penalty, 4);
  const next: ScoreResult = { ...score };
  if (penalty) {
    next.total = Math.max(0, rawTotal - penalty);
    next.penalty_applied = `-${penalty} (${reason.replace(/; $/, "")}; raw was ${rawTotal})`;
  }
  return { score: next, penalty };
}

function hitGroups(text: string, groups: { name: string; keys: string[] }[]) {
  const t = text.toLowerCase();
  const hits: string[] = [];
  for (const g of groups) {
    if (g.keys.some((k) => t.includes(k))) hits.push(g.name);
  }
  return hits;
}

function uniqueHits(text: string, keywords: string[]) {
  const t = text.toLowerCase().replace(/equal opportunity[\s\S]{0,900}/gi, " ");
  const hits = new Set<string>();
  for (const k of keywords) {
    if (k.length <= 4) {
      const re = new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      if (re.test(t)) hits.add(k);
    } else if (t.includes(k)) {
      hits.add(k);
    }
  }
  return [...hits];
}

function quoteFrom(text: string, keywords: string[]) {
  const lower = text.toLowerCase();
  for (const k of keywords) {
    const idx = lower.indexOf(k);
    if (idx >= 0) {
      const start = Math.max(0, idx - 24);
      const end = Math.min(text.length, idx + k.length + 48);
      return text.slice(start, end).replace(/\s+/g, " ").trim();
    }
  }
  return text.slice(0, 90).replace(/\s+/g, " ").trim();
}

function locationFit(c: ScoutCandidate, jd: string, red_flags: string[]) {
  const loc = `${c.location || ""} ${c.title}`.toLowerCase();
  const body = jd.toLowerCase();
  const egypt = /(egypt|cairo|alexandria|giza|mansoura|tanta)/i.test(`${loc} ${body}`);
  const mena = /(mena|middle east|gcc|dubai|saudi|remote-egypt)/i.test(`${loc} ${body}`);
  const onsite = /(on[- ]?site|in[- ]?office|hybrid)/i.test(`${loc} ${c.location || ""}`);
  const remoteRole =
    /\bremote\b/.test(c.location || "") ||
    /\b(remote-global|worldwide|anywhere|work from home)\b/i.test(`${loc} ${c.title}`);
  const us = /(united states|usa\b|u\.s\.|california|new york|san francisco)/i.test(loc);
  const eu = /(germany|france|netherlands|uk\b|united kingdom|berlin|freiburg|zwickau)/i.test(
    loc
  );

  if (egypt) return 2;
  if (mena) return 2;
  if (remoteRole && !onsite) return 2;
  if ((us || eu) && onsite && !/visa|sponsor/i.test(body)) {
    red_flags.push("visa issue");
    return 0;
  }
  if ((us || eu) && !remoteRole) {
    red_flags.push("visa issue");
    return 0;
  }
  if (remoteRole) return 2;
  return 1;
}

function whyFit(opts: {
  skills: string[];
  domains: string[];
  seniority: number;
  location: number;
  egypt: boolean;
  junior: boolean;
}) {
  const bits: string[] = [];
  if (opts.skills.includes("react") || opts.skills.includes("next.js")) {
    bits.push(`Stack fit: ${opts.skills.slice(0, 4).join(", ")}`);
  } else if (opts.skills.length) {
    bits.push(`Partial stack: ${opts.skills.join(", ")}`);
  } else {
    bits.push("Weak skill overlap with React/Next");
  }
  if (opts.domains.length) bits.push(`Domain: ${opts.domains.slice(0, 2).join(", ")}`);
  else bits.push("Domain is general — still usable if stack is strong");
  if (opts.junior) bits.push("Seniority looks junior-friendly");
  else if (opts.seniority === 0) bits.push("Likely too senior");
  if (opts.egypt) bits.push("Egypt / MENA location is ideal");
  else if (opts.location === 2) bits.push("Remote-friendly");
  else if (opts.location === 0) bits.push("Location probably needs visa");
  return bits.join(". ") + ".";
}

export function scoreCandidate(c: ScoutCandidate, profile: CvProfile = defaultProfile()): ScoreResult {
  if (isJunkListing(c.title, c.url)) {
    return {
      skill_match: 0,
      domain_match: 0,
      seniority_fit: 0,
      location_fit: 0,
      total: 0,
      rationale: "Listing/search page, not a job posting",
      whyFit: "Skip — this is a jobs index page, not a single role.",
      skills: [],
      domains: [],
      red_flags: ["listing-page"],
    };
  }

  const jd = `${c.title} ${c.company || ""} ${c.location || ""} ${c.fullText || c.snippet || ""}`;
  const cleaned = jd.replace(/equal opportunity[\s\S]{0,900}/gi, " ");
  const wordCount = (c.fullText || c.snippet || "").split(/\s+/).filter(Boolean).length;
  const red_flags: string[] = [];

  if (c.blocked) red_flags.push("blocked-page");

  const extraGroups = groupsFromProfile(profile);
  const groups = [...SKILL_GROUPS, ...extraGroups];
  const skills = hitGroups(cleaned, groups);
  let skill_match = 0;
  if (skills.length >= 4) skill_match = 3;
  else if (skills.length >= 2) skill_match = 2;
  else if (skills.length >= 1) skill_match = 1;

  const domainDirect = uniqueHits(cleaned, DOMAIN_DIRECT);
  const domainAdj = uniqueHits(cleaned, DOMAIN_ADJACENT);
  let domain_match = 0;
  if (domainDirect.length) domain_match = 2;
  else if (domainAdj.length) domain_match = 1;

  const location_fit = locationFit(c, cleaned, red_flags);

  let seniority_fit = 2;
  const junior = /(intern|junior|entry|graduate|fresh|mid-level|mid level)/i.test(jd);
  if (junior) seniority_fit = 2;
  else if (/(senior|staff|principal|lead |head of|engineering manager)/i.test(c.title)) {
    seniority_fit = 0;
    red_flags.push("too senior");
  }
  const yearsMatch = jd
    .toLowerCase()
    .match(/(\d+)\+?\s*(?:years|yrs)\s*(?:of\s*)?(?:experience|exp)/);
  if (yearsMatch) {
    const years = parseInt(yearsMatch[1], 10);
    if (years >= 6) {
      seniority_fit = 0;
      if (!red_flags.includes("too senior")) red_flags.push("too senior");
    } else if (years >= 4) {
      seniority_fit = Math.min(seniority_fit, 1);
    }
  }

  if (wordCount < 80) red_flags.push("low-signal");

  const total = skill_match + domain_match + seniority_fit + location_fit;
  const quote = quoteFrom(c.fullText || c.snippet || c.title, [
    ...skills.slice(0, 2),
    ...domainDirect.slice(0, 1),
    "react",
    "remote",
  ]);

  const egypt = /(egypt|cairo|alexandria|مصر|القاهرة|الاسكندرية|الإسكندرية)/i.test(
    `${c.location} ${c.title} ${c.snippet} ${c.fullText || ""}`
  );
  const salaryMatch = cleaned.match(
    /((?:EGP|USD|EUR|\$|£|€)\s?\d[\d,]*(?:\s?[-–]\s?(?:EGP|USD|EUR|\$|£|€)?\s?\d[\d,]*)?|\d[\d,]*\s?(?:EGP|USD|EUR)\b)/i
  );
  const salaryQuote = salaryMatch ? salaryMatch[0].replace(/\s+/g, " ").trim() : undefined;
  const yearsHint = yearsMatch ? `${yearsMatch[1]}+ years mentioned in JD` : undefined;

  const why = whyFit({
    skills,
    domains: [...domainDirect, ...domainAdj],
    seniority: seniority_fit,
    location: location_fit,
    egypt,
    junior,
  });

  const raw: ScoreResult = {
    skill_match,
    domain_match,
    seniority_fit,
    location_fit,
    total,
    rationale: `Skills ${skills.slice(0, 3).join("/") || "limited"} · domain ${
      domainDirect[0] || domainAdj[0] || "general"
    } · quote: “${quote}”`,
    whyFit: why,
    skills,
    domains: [...domainDirect, ...domainAdj],
    red_flags,
    salaryQuote,
    yearsHint,
    egyptFit: egypt,
  };

  return applySeniorityPenalty(raw, c.title, c.fullText || c.snippet || "").score;
}

export function scoreAll(
  candidates: ScoutCandidate[],
  onLog?: (msg: string) => void,
  profile: CvProfile = defaultProfile()
): ScoutCandidate[] {
  return candidates.map((c, i) => {
    const score = scoreCandidate(c, profile);
    const penaltyNote = score.penalty_applied
      ? ` [${score.penalty_applied.split("(")[0].trim()}]`
      : "";
    onLog?.(
      `  [${i + 1}/${candidates.length}] score: ${score.total}/9${penaltyNote} — ${score.rationale.slice(0, 70)}`
    );
    return { ...c, score };
  });
}
