import { applySeniorityPenalty } from "./score";
import { ApplyKit, CvProfile, ScoutCandidate, ScoreResult } from "./types";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
export const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
const GROQ_FAST = "openai/gpt-oss-20b";

export function groqEnabled() {
  return Boolean(process.env.GROQ_API_KEY?.trim());
}

export function groqModelName() {
  return GROQ_MODEL;
}

function clamp(n: unknown, min: number, max: number, fallback: number) {
  const x = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(x)) return fallback;
  return Math.max(min, Math.min(max, Math.round(x)));
}

function extractJson(raw: string): unknown {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced ? fenced[1].trim() : trimmed;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("No JSON object in Groq response");
  return JSON.parse(body.slice(start, end + 1));
}

export async function groqChat(
  system: string,
  user: string,
  options: { model?: string; temperature?: number; json?: boolean } = {}
): Promise<string> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY is missing");

  const models = [options.model || GROQ_MODEL, GROQ_FAST];
  let lastErr = "Groq request failed";

  for (const model of models) {
    try {
      const res = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          temperature: options.temperature ?? 0.15,
          max_tokens: 2800,
          response_format: options.json === false ? undefined : { type: "json_object" },
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
        signal: AbortSignal.timeout(45000),
        cache: "no-store",
      });
      const data = (await res.json()) as {
        error?: { message?: string };
        choices?: Array<{ message?: { content?: string } }>;
      };
      if (!res.ok) {
        lastErr = data.error?.message || `Groq ${res.status}`;
        continue;
      }
      const content = data.choices?.[0]?.message?.content || "";
      if (!content.trim()) {
        lastErr = "Empty Groq response";
        continue;
      }
      return content;
    } catch (err) {
      lastErr = err instanceof Error ? err.message : String(err);
    }
  }

  throw new Error(lastErr);
}

export async function groqJson<T>(system: string, user: string): Promise<T> {
  const raw = await groqChat(system, user);
  return extractJson(raw) as T;
}

export async function groqExtractCv(rawText: string): Promise<Partial<CvProfile> | null> {
  if (!groqEnabled()) return null;
  try {
    const data = await groqJson<{
      name?: string;
      skills?: string[];
      domains?: string[];
      location?: string;
      seniority?: string;
      seniorityMaxYears?: number;
      headline?: string;
    }>(
      `Extract a job-search profile from a CV. Return JSON only:
{"name":"","skills":[],"domains":[],"location":"","seniority":"junior|mid|mid-senior|senior","seniorityMaxYears":5,"headline":""}
Rules: skills = concrete tools/languages/frameworks only (max 16). domains = industries (healthcare, e-commerce, fintech, etc). Never invent employers or years not in the CV. Prefer city+country if present.`,
      rawText.slice(0, 8000)
    );
    return {
      name: data.name?.trim(),
      skills: Array.isArray(data.skills) ? data.skills.map(String).slice(0, 16) : [],
      domains: Array.isArray(data.domains) ? data.domains.map(String).slice(0, 10) : [],
      location: data.location?.trim(),
      seniority: data.seniority?.trim(),
      seniorityMaxYears: clamp(data.seniorityMaxYears, 2, 10, 5),
      headline: data.headline?.trim(),
    };
  } catch {
    return null;
  }
}

type LlmJobScore = {
  url?: string;
  skill_match?: number;
  domain_match?: number;
  seniority_fit?: number;
  location_fit?: number;
  skills?: string[];
  domains?: string[];
  red_flags?: string[];
  whyFit?: string;
  rationale?: string;
  salaryQuote?: string | null;
};

function mergeScore(base: ScoreResult, llm: LlmJobScore, title: string, jd: string): ScoreResult {
  const skill_match = clamp(llm.skill_match, 0, 3, base.skill_match);
  const domain_match = clamp(llm.domain_match, 0, 2, base.domain_match);
  const seniority_fit = clamp(llm.seniority_fit, 0, 2, base.seniority_fit);
  const location_fit = clamp(llm.location_fit, 0, 2, base.location_fit);
  const red_flags = [
    ...new Set([
      ...(base.red_flags || []),
      ...(Array.isArray(llm.red_flags) ? llm.red_flags.map(String) : []),
    ]),
  ];
  const merged: ScoreResult = {
    ...base,
    skill_match,
    domain_match,
    seniority_fit,
    location_fit,
    total: skill_match + domain_match + seniority_fit + location_fit,
    rationale: (llm.rationale || base.rationale).slice(0, 280),
    whyFit: (llm.whyFit || base.whyFit).slice(0, 420),
    skills: Array.isArray(llm.skills) && llm.skills.length ? llm.skills.map(String).slice(0, 10) : base.skills,
    domains:
      Array.isArray(llm.domains) && llm.domains.length ? llm.domains.map(String).slice(0, 8) : base.domains,
    red_flags,
    salaryQuote: llm.salaryQuote ? String(llm.salaryQuote) : base.salaryQuote,
  };
  return applySeniorityPenalty(merged, title, jd).score;
}

export async function refineScoresWithGroq(
  candidates: ScoutCandidate[],
  profile: CvProfile,
  onLog?: (msg: string) => void
): Promise<ScoutCandidate[]> {
  if (!groqEnabled() || !candidates.length) return candidates;

  const scorable = candidates.filter(
    (c) => c.score && !c.score.red_flags.includes("listing-page")
  );
  if (!scorable.length) return candidates;

  onLog?.(`  Groq scoring with ${GROQ_MODEL} (${scorable.length} jobs, batched)…`);
  const chunkSize = 6;
  const byUrl = new Map<string, LlmJobScore>();

  for (let i = 0; i < scorable.length; i += chunkSize) {
    const chunk = scorable.slice(i, i + chunkSize);
    try {
      const data = await groqJson<{ jobs?: LlmJobScore[] }>(
        `You score job listings against ONE candidate. Return JSON:
{"jobs":[{"url":"","skill_match":0,"domain_match":0,"seniority_fit":0,"location_fit":0,"skills":[],"domains":[],"red_flags":[],"whyFit":"","rationale":"","salaryQuote":null}]}
Rubric:
- skill_match 0-3: 0 none, 1 one skill, 2 two-three, 3 four+ from the candidate.
- domain_match 0-2: 0 unrelated, 1 adjacent, 2 direct industry match.
- seniority_fit 0-2: 0 too senior (6+ years / staff-principal-lead), 1 stretch, 2 junior/mid match.
- location_fit 0-2: 2 Egypt/MENA/remote-friendly, 1 maybe, 0 US/EU on-site without visa.
whyFit: 1-2 sentences, specific. rationale: one line WITH a short quote copied from the JD.
Never invent salary or years. If JD < 80 words, add red_flag "low-signal".
If title is a search/collection page, skill_match 0 and red_flags ["listing-page"].`,
        `CANDIDATE
Name: ${profile.name}
Skills: ${profile.skills.join(", ")}
Domains: ${profile.domains.join(", ")}
Seniority: ${profile.seniority} (reject 6+ years / staff / principal)
Location: ${profile.location}

JOBS:
${JSON.stringify(
  chunk.map((c) => ({
    url: c.url,
    title: c.title,
    company: c.company,
    location: c.location,
    source: c.source,
    jd: (c.fullText || c.snippet || "").slice(0, 1800),
  }))
)}`
      );
      for (const job of data.jobs || []) {
        if (job.url) byUrl.set(job.url, job);
      }
      onLog?.(`  Groq batch ${Math.floor(i / chunkSize) + 1}: ${data.jobs?.length || 0} scores`);
    } catch (err) {
      onLog?.(
        `  Groq batch failed (${err instanceof Error ? err.message : "error"}) — keeping heuristic scores`
      );
    }
  }

  return candidates.map((c) => {
    const llm = byUrl.get(c.url);
    if (!llm || !c.score) return c;
    const score = mergeScore(c.score, llm, c.title, c.fullText || c.snippet || "");
    return { ...c, score };
  });
}

export async function groqApplyKits(
  candidates: ScoutCandidate[],
  profile: CvProfile,
  onLog?: (msg: string) => void
): Promise<Map<string, ApplyKit>> {
  const kits = new Map<string, ApplyKit>();
  if (!groqEnabled() || !candidates.length) return kits;

  const top = candidates.slice(0, 8);
  try {
    const data = await groqJson<{ kits?: Array<ApplyKit & { url?: string }> }>(
      `Write honest apply kits. Return JSON:
{"kits":[{"url":"","pitchEn":"","pitchAr":"","talkingPoints":["","",""],"checklist":["","","",""]}]}
Rules: pitchEn is a short recruiter message (max 90 words) in the candidate's voice. pitchAr is 1-2 Arabic sentences why this role fits. talkingPoints are interview bullets grounded in the CV+JD overlap. Never invent salary, years, or companies not in the CV. Never claim the agent will apply. Always tell the user to apply manually.`,
      `CANDIDATE: ${JSON.stringify({
        name: profile.name,
        skills: profile.skills,
        domains: profile.domains,
        location: profile.location,
        seniority: profile.seniority,
        headline: profile.headline,
      })}
ROLES: ${JSON.stringify(
        top.map((c) => ({
          url: c.url,
          title: c.title,
          company: c.company,
          location: c.location,
          why: c.score?.whyFit,
          skills: c.score?.skills,
          excerpt: (c.fullText || c.snippet || "").slice(0, 700),
        }))
      )}`
    );
    for (const kit of data.kits || []) {
      if (!kit.url || !kit.pitchEn) continue;
      kits.set(kit.url, {
        pitchEn: String(kit.pitchEn).slice(0, 900),
        pitchAr: String(kit.pitchAr || "").slice(0, 400),
        talkingPoints: (kit.talkingPoints || []).map(String).slice(0, 6),
        checklist: (kit.checklist || []).map(String).slice(0, 6),
      });
    }
    onLog?.(`  Groq apply kits: ${kits.size}/${top.length}`);
  } catch (err) {
    onLog?.(`  Groq apply kits skipped: ${err instanceof Error ? err.message : "error"}`);
  }
  return kits;
}

export async function groqDigest(
  candidates: ScoutCandidate[],
  profile: CvProfile,
  thinDay: boolean
): Promise<string | null> {
  if (!groqEnabled() || !candidates.length) return null;
  try {
    const data = await groqJson<{ digest?: string }>(
      `Produce a recruiter digest. Return JSON {"digest":"plain text"}.
Format each role:
[N] <title> @ <company> (<location>)
    Score: X/9 | Why: one specific sentence
    Apply: <url>
Order by score. Max 8 roles. If thinDay, first line: "Thin day — only N roles above threshold".
No markdown. No invented salary. End with: Guardrail: agent never auto-applies. You click Apply.`,
      JSON.stringify({
        candidate: profile.name,
        thinDay,
        roles: candidates.slice(0, 8).map((c) => ({
          title: c.title,
          company: c.company,
          location: c.location,
          url: c.url,
          score: c.score?.total,
          why: c.score?.whyFit,
          flags: c.score?.red_flags,
          egypt: c.score?.egyptFit,
          isNew: c.isNew,
        })),
      })
    );
    return data.digest?.trim() || null;
  } catch {
    return null;
  }
}
