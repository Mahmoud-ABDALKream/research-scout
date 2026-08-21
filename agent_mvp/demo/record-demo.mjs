/**
 * Records a live /scout run (no slides) while AI narration plays conceptually
 * in a later mux step. Timing is aligned to narration.txt (~4 min).
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "out");
const BASE = process.env.SCOUT_DEMO_URL || "http://localhost:3000/scout";

fs.mkdirSync(OUT_DIR, { recursive: true });

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

const browser = await chromium.launch({
  headless: true,
  args: ["--window-size=1440,900"],
});

const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  recordVideo: { dir: OUT_DIR, size: { width: 1440, height: 900 } },
  locale: "en-US",
});

const page = await context.newPage();
console.log("Opening", BASE);
const started = Date.now();
await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 90000 });
await sleep(2500);

// Switch to English so reviewers can read the UI with the English voiceover
const enBtn = page.getByRole("button", { name: /^EN$/i });
if (await enBtn.count()) {
  await enBtn.first().click();
  await sleep(800);
}

await page.evaluate(() => window.scrollTo(0, 0));
await sleep(4000);

const runBtn = page.getByRole("button", { name: /Run Scout|شغّل الكشّاف/i });
await runBtn.first().click();
console.log("Run Scout clicked");

// GATHER / READ / SCORE — let the live log scroll
const deadline = Date.now() + 110000;
while (Date.now() < deadline) {
  const done = await page.evaluate(() => {
    const t = document.body?.innerText || "";
    return /DAILY DIGEST|Above threshold|No candidates found|Scout run failed/i.test(t);
  });
  if (done) break;
  await sleep(2000);
}

await sleep(4000);

// Design decision: E3 panel
await page.evaluate(() => {
  const nodes = [...document.querySelectorAll("div, h2, p, span")];
  const hit = nodes.find((el) => /E3/i.test(el.textContent || "") && (el.textContent || "").length < 40);
  hit?.scrollIntoView({ behavior: "smooth", block: "center" });
});
await sleep(14000);

// Limitation: source health
await page.evaluate(() => {
  const nodes = [...document.querySelectorAll("div, h2, p")];
  const hit = nodes.find((el) => /Source health|صحة المصادر/i.test(el.textContent || ""));
  hit?.scrollIntoView({ behavior: "smooth", block: "center" });
});
await sleep(14000);

// Digest + apply kit
await page.evaluate(() => window.scrollTo({ top: 700, behavior: "smooth" }));
await sleep(2500);

const digestTab = page.getByRole("button", { name: /digest|دايجست/i });
if (await digestTab.count()) {
  await digestTab.first().click();
  await sleep(1500);
}

const kitBtn = page.getByRole("button", { name: /Apply kit|عدة التقديم/i });
if (await kitBtn.count()) {
  await kitBtn.first().click();
  await sleep(8000);
  await page.keyboard.press("Escape");
} else {
  const openBtn = page.getByRole("button", { name: /Open listing|فتح الإعلان|Details|تفاصيل/i });
  if (await openBtn.count()) await openBtn.first().click();
  await sleep(6000);
}

await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
const elapsed = Date.now() - started;
const pad = Math.max(8000, 210000 - elapsed);
console.log("padding", pad, "ms");
await sleep(pad);

const videoPath = await page.video()?.path();
await context.close();
await browser.close();
console.log("VIDEO", videoPath);
