import { MAX_QUALIFIED, MAX_READ, SCORE_THRESHOLD, normalizeUrl } from "./config";
import { formatDigest, filterQualified, toQualifiedRoles } from "./format";
import { gatherAll, preRank } from "./gather";
import { groqApplyKits, groqDigest, groqEnabled, groqModelName, refineScoresWithGroq } from "./groq";
import { persistRun, seenUrls } from "./history";
import { loadActiveProfile } from "./profile";
import { readCandidates } from "./read";
import { scoreAll } from "./score";
import { loadTracker } from "./tracker";
import { AuditEntry, ScoutEvent, ScoutRunOptions, ScoutRunResult } from "./types";

export async function runScout(
  emit: (event: ScoutEvent) => void,
  options: ScoutRunOptions = {}
): Promise<ScoutRunResult> {
  const threshold = options.threshold ?? SCORE_THRESHOLD;
  const maxRead = options.maxRead ?? MAX_READ;
  const maxQualified = options.maxQualified ?? MAX_QUALIFIED;
  const egyptFirst = options.egyptFirst ?? true;

  const profile = options.profile?.skills?.length ? options.profile : await loadActiveProfile();
  const started = Date.now();
  const log: string[] = [];
  const say = (message: string) => {
    log.push(message);
    emit({ type: "log", message });
  };

  say("=".repeat(64));
  say("RESEARCH SCOUT — ENHANCED RUN");
  say(`Timestamp: ${new Date().toISOString()}`);
  say(`User: ${profile.name} [${profile.source}${profile.fileName ? ` · ${profile.fileName}` : ""}]`);
  say(`Skills: ${profile.skills.join(", ")}`);
  say(`Location: ${profile.location}`);
  say(
    groqEnabled()
      ? `LLM: Groq ${groqModelName()} — deeper CV match, scoring, and apply kits`
      : "LLM: heuristic only (set GROQ_API_KEY in Vercel env, then redeploy)"
  );
  say(`Options: threshold ${threshold}/9 · read ${maxRead} · cap ${maxQualified} · egyptFirst ${egyptFirst}`);
  say("=".repeat(64));

  emit({ type: "step", step: "gather", status: "running" });
  say("\n── STEP 1: GATHER (parallel live sources) ──");
  const { candidates: allCandidates, sources } = await gatherAll(say, egyptFirst, profile);
  say(`\n  Total candidates gathered: ${allCandidates.length}`);
  emit({
    type: "step",
    step: "gather",
    status: allCandidates.length ? "done" : "error",
    detail: `${allCandidates.length} candidates`,
  });

  if (!allCandidates.length) {
    say("\nNo candidates found. Agent cannot proceed.");
    const empty: ScoutRunResult = {
      timestamp: new Date().toISOString(),
      digest: "No candidates found. Sources may be blocked or offline.",
      candidatesFetched: 0,
      candidatesRead: 0,
      candidatesQualified: 0,
      newRoles: 0,
      threshold,
      thinDay: true,
      qualified: [],
      audit: [],
      sources,
      log,
      durationMs: Date.now() - started,
    };
    emit({ type: "done", result: empty });
    return empty;
  }

  const previouslySeen = await seenUrls();
  const skipped = new Set(
    (await loadTracker()).filter((t) => t.status === "skipped").map((t) => normalizeUrl(t.url))
  );

  const ranked = [...allCandidates]
    .filter((c) => !skipped.has(normalizeUrl(c.url)))
    .sort((a, b) => preRank(b, egyptFirst, profile.skills) - preRank(a, egyptFirst, profile.skills));

  emit({ type: "step", step: "read", status: "running" });
  say("\n── STEP 2: READ (page_reader on top ranked URLs) ──");
  const top = ranked.slice(0, maxRead);
  say(`  Reading ${top.length} URLs (ranked from ${allCandidates.length}, skipped hidden)…`);
  const read = await readCandidates(top, say);
  emit({
    type: "step",
    step: "read",
    status: "done",
    detail: `${read.length} JDs`,
  });

  emit({ type: "step", step: "score", status: "running" });
  say("\n── STEP 3: SCORE (4-criteria match /9 + Groq why-fit) ──");
  const heuristic = scoreAll(read, say, profile);
  const scored = (await refineScoresWithGroq(heuristic, profile, say)).map((c) => ({
    ...c,
    isNew: !previouslySeen.has(c.url),
  }));
  for (const c of scored) emit({ type: "candidate", candidate: c });
  emit({ type: "step", step: "score", status: "done" });

  emit({ type: "step", step: "filter", status: "running" });
  say("\n── STEP 4: FILTER (drop below threshold) ──");
  const qualified = filterQualified(scored, threshold, maxQualified);
  say(`  Threshold: ${threshold}/9`);
  say(`  Above threshold: ${qualified.length}`);
  say(`  Below threshold (filtered): ${scored.length - qualified.length}`);
  const newCount = qualified.filter((c) => c.isNew).length;
  say(`  New vs previous runs: ${newCount}/${qualified.length}`);
  const thinDay = qualified.length < 3;
  if (thinDay) say(`  Thin day — only ${qualified.length} roles above threshold`);
  emit({
    type: "step",
    step: "filter",
    status: "done",
    detail: `${qualified.length} qualified`,
  });

  emit({ type: "step", step: "format", status: "running" });
  say("\n── STEP 5: FORMAT (final digest) ──");
  const kits = await groqApplyKits(qualified, profile, say);
  const digest = (await groqDigest(qualified, profile, thinDay)) || formatDigest(qualified);
  say("\n" + "=".repeat(64));
  say("DAILY DIGEST");
  say("=".repeat(64));
  say("\n" + digest);
  say("\n" + "=".repeat(64));

  const audit: AuditEntry[] = scored.map((c) => ({
    url: c.url,
    title: c.title,
    source: c.source,
    score_total: c.score?.total || 0,
    rationale: c.score?.rationale || "",
    red_flags: c.score?.red_flags || [],
    fetched_at: new Date().toISOString(),
    isNew: c.isNew,
  }));

  const result: ScoutRunResult = {
    timestamp: new Date().toISOString(),
    digest,
    candidatesFetched: allCandidates.length,
    candidatesRead: read.length,
    candidatesQualified: qualified.length,
    newRoles: newCount,
    threshold,
    thinDay,
    qualified: toQualifiedRoles(qualified, kits),
    audit,
    sources,
    log,
    durationMs: Date.now() - started,
    llm: groqEnabled() ? { provider: "groq", model: groqModelName() } : { provider: "heuristic" },
  };

  try {
    await persistRun(result);
    say("  History + audit log saved to agent_mvp/");
  } catch (err) {
    say(`  Could not persist files: ${err instanceof Error ? err.message : err}`);
  }

  emit({ type: "step", step: "format", status: "done" });
  emit({ type: "done", result });
  return result;
}
