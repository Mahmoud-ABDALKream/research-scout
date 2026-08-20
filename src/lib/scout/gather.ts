import { isJunkListing, normalizeUrl } from "./config";
import { defaultProfile, skillQuery } from "./parse-cv";
import { CvProfile, ScoutCandidate } from "./types";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 ResearchScout/1.0";

async function fetchJson(url: string, timeoutMs = 16000): Promise<unknown> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(timeoutMs),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.json();
}

async function fetchText(url: string, timeoutMs = 16000): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "text/html" },
    signal: AbortSignal.timeout(timeoutMs),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.text();
}

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

const ROLE_NEGATIVE =
  /\b(cleaner|steward|cashier|driver|sales assistant|housekeep|janitor|bartender|nurse aide|warehouse|aviation maintenance)\b/i;

function relevantRole(title: string, skills: string[] = []) {
  if (ROLE_NEGATIVE.test(title)) return false;
  const t = title.toLowerCase();
  if (skills.some((s) => s.length > 2 && t.includes(s.toLowerCase()))) return true;
  return /\b(react|next\.?js|frontend|front-end|front end|typescript|ui\/ux|ui ux|product designer|web developer|javascript|python|flutter|vue|angular|node)\b/i.test(
    title
  );
}

export function preRank(c: ScoutCandidate, egyptFirst = false, skills: string[] = []): number {
  const t = `${c.title} ${c.snippet} ${c.location || ""}`.toLowerCase();
  let n = 0;
  for (const s of skills.slice(0, 8)) {
    if (s.length > 2 && t.includes(s.toLowerCase())) n += 3;
  }
  if (/\breact\b/.test(t)) n += 2;
  if (/next\.?js/.test(t)) n += 2;
  if (/frontend|front-end|front end/.test(t)) n += 2;
  if (/egypt|cairo|alexandria|giza|mena|مصر|القاهرة/.test(t)) n += egyptFirst ? 5 : 3;
  if (/healthcare|health-?tech|e-?commerce|rtl|iot|streaming/.test(t)) n += 3;
  if (/junior|intern|fresh|graduate|entry/.test(t)) n += 2;
  if (/senior|staff|principal|head of|engineering manager/.test(c.title.toLowerCase())) n -= 4;
  if (/lead /.test(c.title.toLowerCase())) n -= 2;
  if (isJunkListing(c.title, c.url)) n -= 12;
  return n;
}

type RemoteOkJob = {
  id?: string | number;
  position?: string;
  company?: string;
  description?: string;
  url?: string;
  location?: string;
  tags?: string[];
  legal?: string;
};

async function gatherRemoteOK(limit: number, skills: string[]): Promise<ScoutCandidate[]> {
  const data = (await fetchJson("https://remoteok.com/api")) as RemoteOkJob[];
  const jobs = (Array.isArray(data) ? data : []).filter((j) => j.position && !j.legal);
  return jobs
    .filter((j) => relevantRole(j.position || "", skills))
    .map((j) => {
      const text = stripHtml(j.description || "").slice(0, 3000);
      const cand: ScoutCandidate = {
        source: "RemoteOK",
        title: `${j.position} @ ${j.company || "Unknown"}`,
        company: j.company,
        url: j.url || `https://remoteok.com/remote-jobs/${j.id}`,
        snippet: text.slice(0, 280),
        location: j.location || "Remote",
        tags: (j.tags || []).slice(0, 8),
        fullText: text,
        pageTitle: j.position,
      };
      return cand;
    })
    .sort((a, b) => preRank(b) - preRank(a))
    .slice(0, limit);
}

type RemotiveJob = {
  title?: string;
  company_name?: string;
  url?: string;
  description?: string;
  candidate_required_location?: string;
};

async function gatherRemotive(limit: number, search: string, skills: string[]): Promise<ScoutCandidate[]> {
  const data = (await fetchJson(
    `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(search)}`
  )) as { jobs?: RemotiveJob[] };
  return (data.jobs || [])
    .filter((j) => relevantRole(j.title || "", skills))
    .map((j) => {
      const text = stripHtml(j.description || "").slice(0, 3000);
      return {
        source: "Remotive",
        title: `${j.title} @ ${j.company_name || "Unknown"}`,
        company: j.company_name,
        url: j.url || "",
        snippet: text.slice(0, 280),
        location: j.candidate_required_location || "Remote",
        fullText: text,
        pageTitle: j.title,
      } as ScoutCandidate;
    })
    .sort((a, b) => preRank(b) - preRank(a))
    .slice(0, limit);
}

type ArbeitnowJob = {
  slug?: string;
  company_name?: string;
  title?: string;
  description?: string;
  remote?: boolean;
  url?: string;
  location?: string;
};

async function gatherArbeitnow(limit: number, skills: string[]): Promise<ScoutCandidate[]> {
  const data = (await fetchJson(
    "https://www.arbeitnow.com/api/job-board-api"
  )) as { data?: ArbeitnowJob[] };
  return (data.data || [])
    .filter((j) => relevantRole(j.title || "", skills))
    .map((j) => {
      const text = stripHtml(j.description || "").slice(0, 3000);
      return {
        source: "Arbeitnow",
        title: `${j.title} @ ${j.company_name || "Unknown"}`,
        company: j.company_name,
        url: j.url || `https://www.arbeitnow.com/jobs/${j.slug || ""}`,
        snippet: text.slice(0, 280),
        location: j.location || (j.remote ? "Remote" : ""),
        fullText: text,
        pageTitle: j.title,
      } as ScoutCandidate;
    })
    .sort((a, b) => preRank(b, false, skills) - preRank(a, false, skills))
    .slice(0, limit);
}

type JobicyJob = {
  url?: string;
  jobTitle?: string;
  companyName?: string;
  jobGeo?: string;
  jobExcerpt?: string;
  jobDescription?: string;
  jobLevel?: string;
};

async function gatherJobicy(limit: number, tag: string, skills: string[]): Promise<ScoutCandidate[]> {
  const data = (await fetchJson(
    `https://jobicy.com/api/v2/remote-jobs?count=50&tag=${encodeURIComponent(tag)}`
  )) as { jobs?: JobicyJob[] };
  return (data.jobs || [])
    .filter((j) => relevantRole(j.jobTitle || "", skills))
    .map((j) => {
      const text = stripHtml(j.jobDescription || j.jobExcerpt || "").slice(0, 3000);
      return {
        source: "Jobicy",
        title: `${j.jobTitle} @ ${j.companyName || "Unknown"}`,
        company: j.companyName,
        url: j.url || "",
        snippet: stripHtml(j.jobExcerpt || text).slice(0, 280),
        location: j.jobGeo || "Remote",
        fullText: text,
        pageTitle: j.jobTitle,
        tags: j.jobLevel ? [j.jobLevel] : [],
      } as ScoutCandidate;
    })
    .sort((a, b) => preRank(b, false, skills) - preRank(a, false, skills))
    .slice(0, limit);
}

async function gatherHimalayas(limit: number, skills: string[]): Promise<ScoutCandidate[]> {
  const data = (await fetchJson("https://himalayas.app/jobs/api?limit=40")) as {
    data?: Array<{ title?: string; companyName?: string; location?: string; applicationLink?: string; excerpt?: string; description?: string }>;
  };
  const jobs = data.data || [];
  return jobs
    .filter((j) => relevantRole(j.title || "", skills))
    .map((j) => {
      const text = stripHtml(j.description || j.excerpt || "").slice(0, 3000);
      return {
        source: "Himalayas",
        title: `${j.title} @ ${j.companyName || "Unknown"}`,
        company: j.companyName,
        url: j.applicationLink || "",
        snippet: text.slice(0, 280),
        location: j.location || "Remote",
        fullText: text,
        pageTitle: j.title,
      } as ScoutCandidate;
    })
    .sort((a, b) => preRank(b, false, skills) - preRank(a, false, skills))
    .slice(0, limit);
}

async function gatherWorkingNomads(limit: number, skills: string[]): Promise<ScoutCandidate[]> {
  const data = (await fetchJson("https://www.workingnomads.com/jobsapi.json")) as Array<{
    title?: string;
    company?: string;
    url?: string;
    description?: string;
    location?: string;
    category?: string;
  }>;
  return (Array.isArray(data) ? data : [])
    .filter((j) => relevantRole(`${j.title} ${j.category}`, skills))
    .map((j) => {
      const text = stripHtml(j.description || "").slice(0, 3000);
      return {
        source: "Working Nomads",
        title: `${j.title} @ ${j.company || "Unknown"}`,
        company: j.company,
        url: j.url || "",
        snippet: text.slice(0, 280),
        location: j.location || "Remote",
        fullText: text,
        pageTitle: j.title,
      } as ScoutCandidate;
    })
    .sort((a, b) => preRank(b, false, skills) - preRank(a, false, skills))
    .slice(0, limit);
}

async function gatherRss(
  source: string,
  feedUrl: string,
  limit: number,
  skills: string[]
): Promise<ScoutCandidate[]> {
  const xml = await fetchText(feedUrl, 20000);
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].slice(0, 40);
  const out: ScoutCandidate[] = [];
  for (const item of items) {
    const block = item[1];
    const title = stripHtml(block.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || "");
    const url = stripHtml(
      block.match(/<link>([\s\S]*?)<\/link>/i)?.[1] ||
        block.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i)?.[1] ||
        ""
    );
    const desc = stripHtml(block.match(/<description>([\s\S]*?)<\/description>/i)?.[1] || "");
    if (!url || !relevantRole(title, skills)) continue;
    out.push({
      source,
      title,
      url,
      snippet: desc.slice(0, 280),
      fullText: desc.slice(0, 3000),
      location: "Remote",
    });
  }
  return out.sort((a, b) => preRank(b, false, skills) - preRank(a, false, skills)).slice(0, limit);
}

async function gatherTheMuse(limit: number, skills: string[]): Promise<ScoutCandidate[]> {
  const data = (await fetchJson(
    "https://www.themuse.com/api/public/jobs?category=Software%20Engineering&page=0"
  )) as {
    results?: Array<{
      name?: string;
      contents?: string;
      company?: { name?: string };
      locations?: Array<{ name?: string }>;
      refs?: { landing_page?: string };
    }>;
  };
  return (data.results || [])
    .filter((j) => relevantRole(j.name || "", skills))
    .map((j) => {
      const text = stripHtml(j.contents || "").slice(0, 3000);
      const loc = (j.locations || []).map((l) => l.name).filter(Boolean).join(" / ");
      return {
        source: "The Muse",
        title: `${j.name} @ ${j.company?.name || "Unknown"}`,
        company: j.company?.name,
        url: j.refs?.landing_page || "",
        snippet: text.slice(0, 280),
        location: loc || "See listing",
        fullText: text,
        pageTitle: j.name,
      } as ScoutCandidate;
    })
    .sort((a, b) => preRank(b, false, skills) - preRank(a, false, skills))
    .slice(0, limit);
}

async function gather4DayWeek(limit: number, skills: string[]): Promise<ScoutCandidate[]> {
  const data = (await fetchJson("https://4dayweek.io/api/jobs")) as {
    jobs?: Array<{
      title?: string;
      slug?: string;
      company_name?: string;
      work_arrangement?: string;
      category?: string;
      locations?: Array<{ city?: string; country?: string }>;
    }>;
  };
  return (data.jobs || [])
    .filter((j) => relevantRole(`${j.title} ${j.category}`, skills))
    .map((j) => {
      const loc = (j.locations || [])
        .map((l) => [l.city, l.country].filter(Boolean).join(", "))
        .filter(Boolean)
        .slice(0, 2)
        .join(" / ");
      return {
        source: "4 Day Week",
        title: `${j.title} @ ${j.company_name || "Unknown"}`,
        company: j.company_name,
        url: j.slug ? `https://4dayweek.io/jobs/${j.slug}` : "",
        snippet: `${j.category || "tech"} · ${j.work_arrangement || "flexible"}`,
        location: loc || j.work_arrangement || "Flexible",
        fullText: `${j.title} ${j.company_name} ${j.category} ${j.work_arrangement} ${loc}`,
        pageTitle: j.title,
        tags: [j.category, j.work_arrangement].filter(Boolean) as string[],
      } as ScoutCandidate;
    })
    .sort((a, b) => preRank(b, false, skills) - preRank(a, false, skills))
    .slice(0, limit);
}

async function gatherHnJobs(limit: number, skills: string[]): Promise<ScoutCandidate[]> {
  const q = encodeURIComponent(skills.slice(0, 2).join(" ") || "react frontend");
  const data = (await fetchJson(
    `https://hn.algolia.com/api/v1/search_by_date?query=${q}&tags=job&hitsPerPage=20`
  )) as { hits?: Array<{ title?: string; url?: string; story_url?: string; comment_text?: string; objectID?: string }>; };
  return (data.hits || [])
    .map((h) => {
      const title = stripHtml(h.title || "").slice(0, 120);
      const url = h.url || h.story_url || `https://news.ycombinator.com/item?id=${h.objectID}`;
      const text = stripHtml(h.comment_text || h.title || "").slice(0, 3000);
      return {
        source: "Hacker News",
        title: title || "HN job thread",
        url,
        snippet: text.slice(0, 280),
        fullText: text,
        location: "Remote / see post",
      } as ScoutCandidate;
    })
    .filter((c) => relevantRole(c.title, skills) || relevantRole(c.snippet, skills))
    .slice(0, limit);
}

function decodeDdgUrl(href: string) {
  try {
    const u = new URL(href, "https://duckduckgo.com");
    const uddg = u.searchParams.get("uddg");
    if (uddg) return decodeURIComponent(uddg);
    return href.startsWith("http") ? href : "";
  } catch {
    return href.startsWith("http") ? href : "";
  }
}

async function gatherDuckDuckGo(
  source: string,
  query: string,
  limit: number
): Promise<ScoutCandidate[]> {
  const html = await fetchText(
    `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`
  );
  const results: ScoutCandidate[] = [];
  const re =
    /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?(?:class="result__snippet"[^>]*>([\s\S]*?)<\/a>)?/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) && results.length < limit) {
    const url = decodeDdgUrl(m[1].replace(/&amp;/g, "&"));
    const title = stripHtml(m[2] || "");
    const snippet = stripHtml(m[3] || "");
    if (!url || !title) continue;
    if (isJunkListing(title, url)) continue;
    if (source === "Wuzzuf" && !/wuzzuf\.net\/jobs\/p\//i.test(url) && !/wuzzuf\.net\/jobs\//i.test(url)) {
      continue;
    }
    results.push({
      source,
      title,
      url,
      snippet,
      location: /egypt|cairo|alexandria/i.test(`${title} ${snippet}`) ? "Egypt" : "See listing",
    });
  }
  return results;
}

export type GatherSourceResult = {
  source: string;
  query: string;
  count: number;
  error?: string;
};

export async function gatherAll(
  onLog?: (msg: string) => void,
  egyptFirst = false,
  profile: CvProfile = defaultProfile()
): Promise<{
  candidates: ScoutCandidate[];
  sources: GatherSourceResult[];
}> {
  const skills = profile.skills;
  const q = skillQuery(profile);
  const loc = profile.location || "Egypt remote";
  const tag = (skills[0] || "react").toLowerCase().replace(/[^a-z0-9]+/g, "");

  const jobs: Array<{
    source: string;
    query: string;
    run: () => Promise<ScoutCandidate[]>;
  }> = [
    {
      source: "Wuzzuf",
      query: `site:wuzzuf.net ${q} ${loc}`,
      run: () => gatherDuckDuckGo("Wuzzuf", `site:wuzzuf.net/jobs/p ${q} Egypt`, 10),
    },
    {
      source: "LinkedIn",
      query: `site:linkedin.com/jobs ${q} ${loc}`,
      run: () => gatherDuckDuckGo("LinkedIn", `site:linkedin.com/jobs ${q} Egypt remote`, 8),
    },
    {
      source: "Indeed",
      query: `site:indeed.com ${q} Egypt`,
      run: () => gatherDuckDuckGo("Indeed", `site:indeed.com ${q} Egypt`, 8),
    },
    {
      source: "Bayt",
      query: `site:bayt.com ${q} Egypt`,
      run: () => gatherDuckDuckGo("Bayt", `site:bayt.com ${q} Egypt`, 8),
    },
    {
      source: "GulfTalent",
      query: `site:gulftalent.com ${q}`,
      run: () => gatherDuckDuckGo("GulfTalent", `site:gulftalent.com ${q} Egypt OR remote`, 6),
    },
    {
      source: "Akhtaboot",
      query: `site:akhtaboot.com ${q}`,
      run: () => gatherDuckDuckGo("Akhtaboot", `site:akhtaboot.com ${q}`, 6),
    },
    {
      source: "Naukrigulf",
      query: `site:naukrigulf.com ${q}`,
      run: () => gatherDuckDuckGo("Naukrigulf", `site:naukrigulf.com ${q} Egypt`, 5),
    },
    {
      source: "Tanqeeb",
      query: `site:tanqeeb.com ${q}`,
      run: () => gatherDuckDuckGo("Tanqeeb", `site:tanqeeb.com ${q}`, 5),
    },
    {
      source: "Careerjet",
      query: `site:careerjet.com ${q} Egypt`,
      run: () => gatherDuckDuckGo("Careerjet", `site:careerjet.com ${q} Egypt`, 5),
    },
    {
      source: "Wellfound",
      query: `site:wellfound.com ${q}`,
      run: () => gatherDuckDuckGo("Wellfound", `site:wellfound.com/jobs ${q} remote`, 6),
    },
    {
      source: "Upwork",
      query: `site:upwork.com ${q}`,
      run: () => gatherDuckDuckGo("Upwork", `site:upwork.com ${q} freelance`, 6),
    },
    {
      source: "Mostaql",
      query: `site:mostaql.com ${q}`,
      run: () => gatherDuckDuckGo("Mostaql", `site:mostaql.com ${q}`, 6),
    },
    {
      source: "Khamsat",
      query: `site:khamsat.com ${q}`,
      run: () => gatherDuckDuckGo("Khamsat", `site:khamsat.com ${q}`, 5),
    },
    {
      source: "Freelancer",
      query: `site:freelancer.com ${q}`,
      run: () => gatherDuckDuckGo("Freelancer", `site:freelancer.com ${q}`, 5),
    },
    {
      source: "Forasna",
      query: `site:forasna.com ${q}`,
      run: () => gatherDuckDuckGo("Forasna", `site:forasna.com ${q}`, 6),
    },
    {
      source: "RemoteOK",
      query: `${q} remote`,
      run: () => gatherRemoteOK(12, skills),
    },
    {
      source: "Remotive",
      query: q,
      run: () => gatherRemotive(12, q, skills),
    },
    {
      source: "Jobicy",
      query: tag,
      run: () => gatherJobicy(12, tag || "react", skills),
    },
    {
      source: "Himalayas",
      query: "remote jobs API",
      run: () => gatherHimalayas(10, skills),
    },
    {
      source: "Working Nomads",
      query: "remote jobs API",
      run: () => gatherWorkingNomads(10, skills),
    },
    {
      source: "We Work Remotely",
      query: "front-end RSS",
      run: () =>
        gatherRss(
          "We Work Remotely",
          "https://weworkremotely.com/categories/remote-front-end-programming-jobs.rss",
          8,
          skills
        ),
    },
    {
      source: "WWR Full-stack",
      query: "full-stack RSS",
      run: () =>
        gatherRss(
          "WWR Full-stack",
          "https://weworkremotely.com/categories/remote-full-stack-programming-jobs.rss",
          8,
          skills
        ),
    },
    {
      source: "The Muse",
      query: "software engineering",
      run: () => gatherTheMuse(10, skills),
    },
    {
      source: "4 Day Week",
      query: "flexible jobs API",
      run: () => gather4DayWeek(8, skills),
    },
    {
      source: "Hacker News",
      query: `${q} jobs`,
      run: () => gatherHnJobs(8, skills),
    },
    {
      source: "Arbeitnow",
      query: "EU/remote board",
      run: () => gatherArbeitnow(10, skills),
    },
  ];

  onLog?.(`  Profile: ${profile.name} · ${skills.slice(0, 6).join(", ")}`);
  onLog?.(`  Fetching ${jobs.length} sources in parallel…`);
  const settled = await Promise.allSettled(
    jobs.map(async (job) => {
      const found = await job.run();
      return { job, found };
    })
  );

  const sources: GatherSourceResult[] = [];
  const candidates: ScoutCandidate[] = [];

  settled.forEach((item, i) => {
    const job = jobs[i];
    if (item.status === "fulfilled") {
      candidates.push(...item.value.found);
      sources.push({
        source: job.source,
        query: job.query,
        count: item.value.found.length,
      });
      onLog?.(`  [${job.source}] returned ${item.value.found.length} results`);
    } else {
      const message =
        item.reason instanceof Error ? item.reason.message : String(item.reason);
      sources.push({ source: job.source, query: job.query, count: 0, error: message });
      onLog?.(`  [${job.source}] failed: ${message}`);
    }
  });

  const seen = new Set<string>();
  const unique = candidates
    .filter((c) => {
      if (!c.url || isJunkListing(c.title, c.url)) return false;
      const key = normalizeUrl(c.url);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => preRank(b, egyptFirst, skills) - preRank(a, egyptFirst, skills));

  if (unique.length < 3) {
    onLog?.(
      "  Live boards were thin — adding profile-matched demo listings so scoring still has signal."
    );
    const extras = demoCandidates().filter((d) => !seen.has(normalizeUrl(d.url)));
    return { candidates: [...unique, ...extras], sources };
  }

  onLog?.(`  Unique listings after dedupe: ${unique.length}`);
  return { candidates: unique.slice(0, 100), sources };
}

function demoCandidates(): ScoutCandidate[] {
  return [
    {
      source: "Demo",
      title: "React Frontend Developer @ CareFlow Health",
      company: "CareFlow Health",
      url: "https://example.com/jobs/careflow-react",
      snippet:
        "Build a family health dashboard in React, Next.js, TypeScript and Tailwind. Remote-Egypt or MENA. 2+ years of experience.",
      location: "Remote-Egypt",
      tags: ["react", "next.js", "healthcare"],
      fullText:
        "CareFlow Health is hiring a React Frontend Developer for our family healthcare platform. Stack: React, Next.js, TypeScript, Tailwind CSS, Figma. Location: remote Egypt / MENA. 2+ years of experience. You will ship medication tracking UI and Arabic RTL screens.",
    },
    {
      source: "Demo",
      title: "UI/UX Product Designer @ Souqly E-commerce",
      company: "Souqly",
      url: "https://example.com/jobs/souqly-designer",
      snippet:
        "Arabic RTL fashion e-commerce. Figma, UI/UX, Next.js handoff. Cairo hybrid or remote.",
      location: "Cairo, Egypt (hybrid / remote)",
      tags: ["figma", "rtl", "ecommerce"],
      fullText:
        "Souqly is an Arabic RTL fashion e-commerce brand. We need a UI/UX designer who can also work with React/Next.js engineers. Figma, design systems, storefronts, product filtering. Junior to mid. Location: Cairo hybrid or remote Egypt.",
    },
    {
      source: "Demo",
      title: "Junior Next.js Developer @ HealthTrack",
      company: "HealthTrack",
      url: "https://example.com/jobs/healthtrack-next",
      snippet: "Wellness companion app. Next.js, TypeScript, Tailwind. Remote-global.",
      location: "Remote-global",
      tags: ["next.js", "healthcare"],
      fullText:
        "HealthTrack wellness companion. Junior Next.js Developer. TypeScript, Tailwind CSS, Node.js APIs. Healthcare domain. Remote-global. 1-3 years of experience.",
    },
    {
      source: "Demo",
      title: "Senior Staff Frontend Engineer @ Atlas",
      company: "Atlas",
      url: "https://example.com/jobs/atlas-staff",
      snippet: "Lead the frontend org. 8+ years of experience required. US on-site.",
      location: "San Francisco, CA (on-site)",
      tags: ["react", "lead"],
      fullText:
        "Senior Staff Frontend Engineer. Lead the frontend org. 8+ years of experience required. React expert. US on-site, no visa sponsorship.",
    },
    {
      source: "Demo",
      title: "React Developer @ IoT Energy Lab",
      company: "IoT Energy Lab",
      url: "https://example.com/jobs/iot-react",
      snippet: "Dashboards for solar-hybrid generators. React, IoT, remote MENA.",
      location: "Remote-MENA",
      tags: ["react", "iot"],
      fullText:
        "IoT Energy Lab needs a React developer for industrial solar-hybrid generator dashboards. React, TypeScript, Tailwind. IoT telemetry UI. Remote-MENA. Mid-level, 3 years of experience.",
    },
    {
      source: "Demo",
      title: "Frontend Engineer @ StreamBay",
      company: "StreamBay",
      url: "https://example.com/jobs/streambay",
      snippet: "Netflix-style streaming UI. React, Next.js. Remote.",
      location: "Remote",
      tags: ["react", "streaming"],
      fullText:
        "StreamBay is building a Netflix-inspired streaming web platform. Frontend Engineer: React, Next.js, TypeScript, Tailwind. Streaming UI, carousels, watchlists. Remote-global. 2-4 years of experience.",
    },
    {
      source: "Demo",
      title: "Laravel + React Developer @ ClinicCloud",
      company: "ClinicCloud",
      url: "https://example.com/jobs/cliniccloud",
      snippet: "Clinic records. Laravel, React, healthcare. On-site Alexandria.",
      location: "Alexandria, Egypt",
      tags: ["laravel", "react", "healthcare"],
      fullText:
        "ClinicCloud: secure health records for clinics in Alexandria. Laravel + React, TypeScript optional, Figma mock implementation. On-site Egypt. Junior-friendly, 1+ years of experience.",
    },
    {
      source: "Demo",
      title: "Principal Product Designer @ MegaBank US",
      company: "MegaBank",
      url: "https://example.com/jobs/megabank",
      snippet: "Principal designer. 10+ years of experience. New York on-site.",
      location: "New York, NY (on-site)",
      tags: ["figma"],
      fullText:
        "Principal Product Designer. Head of design systems. 10+ years of experience required. New York on-site, no visa. Not healthcare or e-commerce.",
    },
  ];
}
