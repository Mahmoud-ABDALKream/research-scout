import { ScoutCandidate } from "./types";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 ResearchScout/1.0";

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
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

function looksBlocked(text: string) {
  return /cloudflare|attention required|verify you are (a )?human|just a moment|enable javascript|captcha/i.test(
    text
  );
}

export async function readPage(url: string): Promise<{ title: string; text: string; blocked: boolean }> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml" },
      signal: AbortSignal.timeout(10000),
      redirect: "follow",
      cache: "no-store",
    });
    if (!res.ok) return { title: "", text: "", blocked: res.status === 403 || res.status === 429 };
    const html = await res.text();
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? stripHtml(titleMatch[1]) : "";
    const text = stripHtml(html).slice(0, 3000);
    return { title, text, blocked: looksBlocked(`${title} ${text}`) };
  } catch {
    return { title: "", text: "", blocked: true };
  }
}

async function mapPool<T, R>(items: T[], limit: number, fn: (item: T, i: number) => Promise<R>) {
  const out: R[] = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

export async function readCandidates(
  candidates: ScoutCandidate[],
  onLog?: (msg: string) => void
): Promise<ScoutCandidate[]> {
  return mapPool(candidates, 4, async (orig, i) => {
    const c = { ...orig };
    onLog?.(`  [${i + 1}/${candidates.length}] ${c.title.slice(0, 60)}`);
    if (c.fullText && c.fullText.length > 120) return c;
    if (!c.url) {
      c.fullText = c.snippet;
      return c;
    }
    const page = await readPage(c.url);
    c.pageTitle = page.title || c.pageTitle;
    c.fullText = page.text || c.snippet;
    c.blocked = page.blocked;
    if (page.blocked) onLog?.(`      blocked/empty page — scoring from snippet`);
    return c;
  });
}
