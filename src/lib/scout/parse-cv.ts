import { USER_PROFILE } from "./config";
import { CvProfile } from "./types";

const SKILL_LEXICON: { name: string; keys: string[] }[] = [
  { name: "React", keys: ["react", "رياكت"] },
  { name: "Next.js", keys: ["next.js", "nextjs", "next js"] },
  { name: "TypeScript", keys: ["typescript"] },
  { name: "JavaScript", keys: ["javascript", "es6"] },
  { name: "Tailwind CSS", keys: ["tailwind"] },
  { name: "Node.js", keys: ["node.js", "nodejs", "node js"] },
  { name: "Laravel", keys: ["laravel"] },
  { name: "PHP", keys: ["php"] },
  { name: "Figma", keys: ["figma"] },
  { name: "UI/UX", keys: ["ui/ux", "ui ux", "user experience", "user interface"] },
  { name: "Vue", keys: ["vue.js", "vuejs", "vue"] },
  { name: "Angular", keys: ["angular"] },
  { name: "React Native", keys: ["react native"] },
  { name: "Flutter", keys: ["flutter", "dart"] },
  { name: "Python", keys: ["python"] },
  { name: "Django", keys: ["django"] },
  { name: "FastAPI", keys: ["fastapi"] },
  { name: "Java", keys: ["java"] },
  { name: "Spring", keys: ["spring boot", "spring"] },
  { name: "C#", keys: ["c#", ".net", "dotnet"] },
  { name: "Go", keys: ["golang"] },
  { name: "SQL", keys: ["sql", "mysql", "postgres", "postgresql"] },
  { name: "MongoDB", keys: ["mongodb"] },
  { name: "AWS", keys: ["aws", "amazon web services"] },
  { name: "Docker", keys: ["docker"] },
  { name: "GraphQL", keys: ["graphql"] },
  { name: "Redux", keys: ["redux"] },
  { name: "HTML", keys: ["html"] },
  { name: "CSS", keys: ["css"] },
  { name: "Sass", keys: ["sass", "scss"] },
  { name: "WordPress", keys: ["wordpress"] },
  { name: "Shopify", keys: ["shopify"] },
  { name: "Firebase", keys: ["firebase"] },
  { name: "Git", keys: ["git", "github"] },
  { name: "REST", keys: ["rest api", "restful"] },
];

const DOMAIN_LEXICON: { name: string; keys: string[] }[] = [
  { name: "healthcare", keys: ["healthcare", "health", "medical", "hospital", "clinic", "صحة"] },
  { name: "e-commerce", keys: ["e-commerce", "ecommerce", "shopify", "store", "تجارة"] },
  { name: "Arabic RTL", keys: ["arabic", "rtl", "عربي"] },
  { name: "IoT", keys: ["iot", "internet of things"] },
  { name: "fintech", keys: ["fintech", "bank", "payment"] },
  { name: "education", keys: ["education", "edtech", "تعليم"] },
  { name: "streaming UI", keys: ["streaming", "ott", "netflix"] },
];

export function parseCvText(raw: string, fileName = "pasted.txt"): CvProfile {
  const text = raw.replace(/\s+/g, " ").trim();
  const lower = text.toLowerCase();

  const skills = SKILL_LEXICON.filter((s) =>
    s.keys.some((k) => lower.includes(k))
  ).map((s) => s.name);

  const domains = DOMAIN_LEXICON.filter((d) =>
    d.keys.some((k) => lower.includes(k))
  ).map((d) => d.name);

  const locMatch = text.match(
    /(alexandria|cairo|giza|egypt|alex|القاهرة|الاسكندرية|الإسكندرية|مصر|remote)/i
  );
  const location = locMatch
    ? /egypt|مصر|cairo|giza|alexandria|alex|القاهرة|الاسكندرية|الإسكندرية/i.test(locMatch[0])
      ? `${locMatch[0]}`.replace(/alex\b/i, "Alexandria") +
        (/egypt|مصر/i.test(text) || /cairo|alexandria|giza/i.test(text) ? ", Egypt" : "")
      : "Remote"
    : USER_PROFILE.location;

  const years = [...lower.matchAll(/(\d+)\+?\s*(?:\+)?\s*(?:years|yrs|سنوات|سنة)/g)].map((m) =>
    parseInt(m[1], 10)
  );
  const maxYears = years.length ? Math.max(...years.filter((n) => n < 40)) : 3;
  const junior = /(junior|intern|student|fresh|graduate|طالب|حديث تخرج)/i.test(text);
  const seniority = junior
    ? "junior"
    : maxYears >= 6
      ? "mid-senior"
      : maxYears >= 4
        ? "mid"
        : "junior";

  const nameLine =
    raw
      .split(/\n+/)
      .map((l) => l.trim())
      .find((l) => l.length > 3 && l.length < 60 && !/@/.test(l) && /[A-Za-zء-ي]/.test(l)) ||
    USER_PROFILE.name;

  const headline = skills.slice(0, 4).join(" · ") || USER_PROFILE.skills.slice(0, 3).join(" · ");

  return {
    source: "cv",
    fileName,
    uploadedAt: new Date().toISOString(),
    name: nameLine.slice(0, 80),
    skills: skills.length ? skills : [...USER_PROFILE.skills],
    domains: domains.length ? domains : [...USER_PROFILE.domains],
    location: location.replace(/, Egypt, Egypt/, ", Egypt"),
    seniority,
    seniorityMaxYears: junior ? 5 : Math.min(8, Math.max(3, maxYears + 1)),
    headline,
    preview: text.slice(0, 400),
  };
}

export function defaultProfile(): CvProfile {
  return {
    source: "default",
    name: USER_PROFILE.name,
    skills: [...USER_PROFILE.skills],
    domains: [...USER_PROFILE.domains],
    location: USER_PROFILE.location,
    seniority: USER_PROFILE.seniority,
    seniorityMaxYears: USER_PROFILE.seniorityMaxYears,
    headline: USER_PROFILE.skills.slice(0, 4).join(" · "),
  };
}

export function skillQuery(profile: CvProfile) {
  const core = profile.skills.slice(0, 3).join(" ");
  return core || "React frontend";
}

export function groupsFromProfile(profile: CvProfile) {
  return profile.skills.map((s) => ({
    name: s.toLowerCase(),
    keys: [s.toLowerCase(), s.toLowerCase().replace(/\./g, "")],
  }));
}

function uniqNames(values: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of values) {
    const v = raw.trim();
    if (!v) continue;
    const key = v.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(v);
  }
  return out;
}

export function mergeCvProfiles(base: CvProfile, extra: Partial<CvProfile> | null): CvProfile {
  if (!extra) return base;
  const name = extra.name?.trim() || "";
  return {
    ...base,
    name: name.length > 2 && name.length < 80 ? name : base.name,
    skills: uniqNames([...(extra.skills || []), ...base.skills]).slice(0, 16),
    domains: uniqNames([...(extra.domains || []), ...base.domains]).slice(0, 10),
    location: extra.location?.trim() || base.location,
    seniority: extra.seniority?.trim() || base.seniority,
    seniorityMaxYears: extra.seniorityMaxYears || base.seniorityMaxYears,
    headline: extra.headline?.trim() || base.headline,
  };
}
