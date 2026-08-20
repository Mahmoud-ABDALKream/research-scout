"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { kitForRole } from "@/lib/scout/apply-kit";
import type {
  CvProfile,
  HistoryEntry,
  QualifiedRole,
  ScoutCandidate,
  ScoutEvent,
  ScoutRunResult,
  ScoutStep,
  TrackerItem,
  TrackStatus,
} from "@/lib/scout/types";

const STEPS: { id: ScoutStep; ar: string; en: string; hintAr: string; hintEn: string }[] = [
  { id: "gather", ar: "جمع", en: "GATHER", hintAr: "٢٦ مصدر", hintEn: "26 sources" },
  { id: "read", ar: "قراءة", en: "READ", hintAr: "أفضل الإعلانات", hintEn: "top ranked JDs" },
  { id: "score", ar: "تقييم", en: "SCORE", hintAr: "Groq + ٤ معايير", hintEn: "Groq + 4 criteria" },
  { id: "filter", ar: "تصفية", en: "FILTER", hintAr: "حد ٥/٩", hintEn: "threshold + skip list" },
  { id: "format", ar: "ملخص", en: "FORMAT", hintAr: "دايجست جاهز", hintEn: "digest + NEW flag" },
];

type StepState = "idle" | "running" | "done" | "error";
type Lang = "ar" | "en";
type SortKey = "priority" | "score" | "new";

type EvalPayload = {
  passed: number;
  total: number;
  results: { name: string; expected: number; actual: number; penalty: number; pass: boolean }[];
};

const scoreColor = (n: number) =>
  n >= 7 ? "#4ade80" : n >= 5 ? "#4da8da" : n >= 3 ? "#fbbf24" : "#f87171";

export default function ScoutDashboard() {
  const [lang, setLang] = useState<Lang>("ar");
  const ar = lang === "ar";
  const t = (a: string, e: string) => (ar ? a : e);

  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [steps, setSteps] = useState<Record<ScoutStep, StepState>>({
    gather: "idle",
    read: "idle",
    score: "idle",
    filter: "idle",
    format: "idle",
  });
  const [result, setResult] = useState<ScoutRunResult | null>(null);
  const [candidates, setCandidates] = useState<ScoutCandidate[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [summary, setSummary] = useState("");
  const [evalData, setEvalData] = useState<EvalPayload | null>(null);
  const [tracker, setTracker] = useState<TrackerItem[]>([]);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"digest" | "audit" | "log" | "help">("help");
  const [query, setQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [newOnly, setNewOnly] = useState(false);
  const [hideSkipped, setHideSkipped] = useState(true);
  const [hideVisa, setHideVisa] = useState(true);
  const [egyptOnly, setEgyptOnly] = useState(false);
  const [egyptFirst, setEgyptFirst] = useState(true);
  const [threshold, setThreshold] = useState(5);
  const [sortKey, setSortKey] = useState<SortKey>("priority");
  const [copied, setCopied] = useState("");
  const [selected, setSelected] = useState<QualifiedRole | null>(null);
  const [compare, setCompare] = useState<string[]>([]);
  const [noteDraft, setNoteDraft] = useState("");
  const [cvProfile, setCvProfile] = useState<CvProfile | null>(null);
  const [cvBusy, setCvBusy] = useState(false);
  const [cvError, setCvError] = useState("");
  const [cvPaste, setCvPaste] = useState("");
  const [groqOn, setGroqOn] = useState(false);
  const [groqModel, setGroqModel] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLPreElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const loadMeta = useCallback(async () => {
    try {
      const [h, s, e, cv] = await Promise.all([
        fetch("/api/scout/history").then((r) => r.json()),
        fetch("/api/scout/summary").then((r) => r.json()),
        fetch("/api/scout/eval").then((r) => r.json()),
        fetch("/api/scout/cv").then((r) => r.json()),
      ]);
      setHistory(h.history || []);
      setTracker(h.tracker || []);
      setSummary(s.summary || "");
      setEvalData(e);
      if (cv.profile?.source === "cv") setCvProfile(cv.profile);
      else {
        try {
          const local = localStorage.getItem("scout-cv");
          if (local) setCvProfile(JSON.parse(local));
          else if (cv.profile) setCvProfile(cv.profile);
        } catch {
          if (cv.profile) setCvProfile(cv.profile);
        }
      }
      setGroqOn(Boolean(cv.groq));
      setGroqModel(cv.model || "");
      if (h.lastResult) {
        setResult(h.lastResult);
        setTab((prev) => (prev === "help" ? "digest" : prev));
      }
    } catch {
      /* first load without history is fine */
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("scout-lang") as Lang | null;
    if (saved === "en" || saved === "ar") setLang(saved);
    loadMeta();
  }, [loadMeta]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  const run = useCallback(async () => {
    setRunning(true);
    setError("");
    setLogs([ar ? "جاري تشغيل الوكيل…" : "Starting Research Scout…"]);
    setCandidates([]);
    setResult(null);
    setTab("log");
    setSteps({ gather: "idle", read: "idle", score: "idle", filter: "idle", format: "idle" });

    try {
      const res = await fetch("/api/scout/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threshold,
          egyptFirst,
          maxRead: 32,
          maxQualified: 28,
          profile: cvProfile || undefined,
        }),
      });
      if (!res.ok || !res.body) throw new Error(`Run failed (${res.status})`);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() || "";
        for (const chunk of chunks) {
          const line = chunk
            .split("\n")
            .filter((l) => l.startsWith("data: "))
            .map((l) => l.slice(6))
            .join("");
          if (!line) continue;
          const event = JSON.parse(line) as ScoutEvent;
          if (event.type === "log") setLogs((prev) => [...prev, event.message]);
          else if (event.type === "step") setSteps((prev) => ({ ...prev, [event.step]: event.status }));
          else if (event.type === "candidate") setCandidates((prev) => [...prev, event.candidate]);
          else if (event.type === "done") {
            setResult(event.result);
            setTab("digest");
          } else if (event.type === "error") setError(event.message);
        }
      }
      await loadMeta();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scout run failed");
    } finally {
      setRunning(false);
    }
  }, [ar, cvProfile, egyptFirst, loadMeta, threshold]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "/" ) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if ((e.key === "r" || e.key === "R") && !running) run();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [run, running]);

  const track = async (role: QualifiedRole, status: TrackStatus, note?: string) => {
    const res = await fetch("/api/scout/tracker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: role.url,
        title: role.title,
        source: role.source,
        score: role.score,
        status,
        note,
      }),
    });
    const data = await res.json();
    if (data.tracker) setTracker(data.tracker);
  };

  const uploadCv = async (file: File) => {
    setCvBusy(true);
    setCvError("");
    try {
      const form = new FormData();
      form.append("cv", file);
      const res = await fetch("/api/scout/cv", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "CV upload failed");
      setCvProfile(data.profile);
      try {
        localStorage.setItem("scout-cv", JSON.stringify(data.profile));
      } catch {
        /* private mode */
      }
    } catch (err) {
      setCvError(err instanceof Error ? err.message : "CV upload failed");
    } finally {
      setCvBusy(false);
    }
  };

  const pasteCv = async () => {
    setCvBusy(true);
    setCvError("");
    try {
      const res = await fetch("/api/scout/cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cvPaste, fileName: "pasted.txt" }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Could not read CV text");
      setCvProfile(data.profile);
      setCvPaste("");
      try {
        localStorage.setItem("scout-cv", JSON.stringify(data.profile));
      } catch {
        /* private mode */
      }
    } catch (err) {
      setCvError(err instanceof Error ? err.message : "Could not read CV text");
    } finally {
      setCvBusy(false);
    }
  };

  const clearCv = async () => {
    setCvBusy(true);
    try {
      localStorage.removeItem("scout-cv");
      const res = await fetch("/api/scout/cv", { method: "DELETE" });
      const data = await res.json();
      setCvProfile(data.profile);
    } finally {
      setCvBusy(false);
    }
  };

  const qualified: QualifiedRole[] = result?.qualified || history[0]?.qualified_roles || [];
  const skipped = useMemo(
    () => new Set(tracker.filter((t) => t.status === "skipped").map((t) => t.url)),
    [tracker]
  );
  const trackerByUrl = useMemo(() => {
    const m = new Map<string, TrackerItem>();
    tracker.forEach((t) => m.set(t.url, t));
    return m;
  }, [tracker]);

  const sources = useMemo(() => ["all", ...Array.from(new Set(qualified.map((r) => r.source)))], [qualified]);

  const filtered = useMemo(() => {
    const list = qualified.filter((r) => {
      if (sourceFilter !== "all" && r.source !== sourceFilter) return false;
      if (newOnly && !r.isNew) return false;
      if (hideSkipped && skipped.has(r.url)) return false;
      if (hideVisa && r.red_flags?.includes("visa issue")) return false;
      if (egyptOnly && !r.egyptFit) return false;
      if (query) {
        const blob = `${r.title} ${r.company || ""} ${r.location || ""} ${r.whyFit || ""}`.toLowerCase();
        if (!blob.includes(query.toLowerCase())) return false;
      }
      return true;
    });
    return list.sort((a, b) => {
      if (sortKey === "score") return b.score - a.score;
      if (sortKey === "new") return Number(b.isNew) - Number(a.isNew) || b.score - a.score;
      return (b.priority || b.score) - (a.priority || a.score);
    });
  }, [egyptOnly, hideSkipped, hideVisa, newOnly, qualified, query, skipped, sortKey, sourceFilter]);

  const pick = filtered[0];
  const compareRoles = qualified.filter((r) => compare.includes(r.url));
  const appliedThisWeek = tracker.filter((t) => {
    if (t.status !== "applied") return false;
    const tms = Date.parse(t.updatedAt);
    return Number.isFinite(tms) && Date.now() - tms < 7 * 24 * 60 * 60 * 1000;
  }).length;
  const duration = result ? `${(result.durationMs / 1000).toFixed(1)}s` : "—";
  const lastAgo = result?.timestamp ? timeAgo(result.timestamp, ar) : t("لا يوجد تشغيل بعد", "No run yet");

  const copyText = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 1600);
  };

  const digestText = result?.digest || history[0]?.digest || "";
  const mailto = `mailto:mahmoudabdelkreambusiness@gmail.com?subject=${encodeURIComponent("Research Scout Digest")}&body=${encodeURIComponent(digestText)}`;

  const switchLang = (next: Lang) => {
    setLang(next);
    localStorage.setItem("scout-lang", next);
  };

  return (
    <div
      dir={ar ? "rtl" : "ltr"}
      style={{
        background: "#0a1628",
        minHeight: "100%",
        fontFamily: ar ? 'Tahoma, "Segoe UI", system-ui, sans-serif' : undefined,
      }}
    >
      <section
        style={{
          padding: "2.2rem 1.5rem 1.4rem",
          borderBottom: "1px solid rgba(77,168,218,0.2)",
          background: "radial-gradient(1200px 400px at 50% -10%, rgba(77,168,218,0.18), transparent)",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <p style={{ fontSize: "0.72rem", color: "#4da8da", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600 }}>
              {t("وكيل شخصي · لا يقدّم عنك أبدًا", "Personal AI agent · never auto-applies")}
              {groqOn ? ` · Groq ${groqModel.replace("llama-", "L")}` : ""}
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" onClick={() => switchLang("ar")} style={langBtn(ar)}>عربي</button>
              <button type="button" onClick={() => switchLang("en")} style={langBtn(!ar)}>EN</button>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "1.5rem", flexWrap: "wrap", alignItems: "flex-end", marginTop: 8 }}>
            <div>
              <h1 style={{ fontSize: "clamp(1.7rem, 4vw, 2.6rem)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>
                {t("كشّاف الفرص", "Research Scout")}
              </h1>
              <p style={{ color: "#a0bcd4", maxWidth: 720, lineHeight: 1.7 }}>
                {t(
                  "ارفع الـ CV وهيدور على شغل مطابق لمهاراتك من ٢٦ موقع: وظف، LinkedIn، Indeed، بيت.كوم، GulfTalent، مستقل، خمسات، Upwork، RemoteOK، والمزيد. أنت اللي تقدّم.",
                  "Upload your CV and it searches matching jobs across 26 boards. You still click Apply."
                )}
              </p>
              <p style={{ color: "#7a9bb8", fontSize: "0.82rem", marginTop: 8 }}>
                {t("آخر تشغيل:", "Last run:")} {lastAgo} · {t("اختصار", "shortcut")} R
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <label style={{ fontSize: "0.8rem", color: "#a0bcd4" }}>
                {t("الحد", "Threshold")}
                <input type="number" min={3} max={9} value={threshold} onChange={(e) => setThreshold(Number(e.target.value) || 5)} style={inputStyle} />
              </label>
              <label style={checkLabel}>
                <input type="checkbox" checked={egyptFirst} onChange={(e) => setEgyptFirst(e.target.checked)} />
                {t("مصر أولًا", "Egypt first")}
              </label>
              <button type="button" onClick={run} disabled={running} style={primaryBtn(running)}>
                {running ? t("بيشتغل…", "Running…") : t("شغّل الكشّاف", "Run Scout")}
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(118px, 1fr))", gap: "0.75rem", marginTop: "1.6rem" }}>
            {[
              { k: t("اتجمع", "Fetched"), v: result?.candidatesFetched ?? "—" },
              { k: t("اتقرأ", "Read"), v: result?.candidatesRead ?? "—" },
              { k: t("مؤهل", "Qualified"), v: result?.candidatesQualified ?? qualified.length },
              { k: t("جديد", "New"), v: result?.newRoles ?? "—" },
              { k: t("تقديم / أسبوع", "Applied / 7d"), v: `${appliedThisWeek}/3` },
              { k: t("المدة", "Duration"), v: duration },
            ].map((s) => (
              <div key={s.k} style={statCard}>
                <div style={{ fontSize: "0.7rem", color: "#7a9bb8" }}>{s.k}</div>
                <div style={{ fontSize: "1.25rem", fontWeight: 800, marginTop: 4 }}>{s.v}</div>
              </div>
            ))}
          </div>

          <div style={{ ...card, marginTop: "1.25rem", background: "rgba(77,168,218,0.07)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
              <div>
                <h2 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#4da8da", marginBottom: 6 }}>
                  {t("الـ CV بتاعك", "Your CV")}
                </h2>
                <p style={{ color: "#a0bcd4", fontSize: "0.85rem", lineHeight: 1.55 }}>
                  {cvProfile?.source === "cv"
                    ? t(
                        `هيدور حسب: ${cvProfile.name} · ${cvProfile.skills.slice(0, 8).join("، ")}`,
                        `Matching: ${cvProfile.name} · ${cvProfile.skills.slice(0, 8).join(", ")}`
                      )
                    : t(
                        "ارفع PDF / Word / TXT أو الصق النص. من غير CV هيستخدم بروفايل محمود الافتراضي.",
                        "Upload PDF, Word, or TXT — or paste text. Without a CV it uses the default Mahmoud profile."
                      )}
                </p>
                <p style={{ color: groqOn ? "#4ade80" : "#fbbf24", fontSize: "0.78rem", marginTop: 6 }}>
                  {groqOn
                    ? t(
                        "Groq شغال: هيقرأ الـ CV ويقيم الوظائف ويكتب رسائل التقديم بدقة أعلى.",
                        "Groq is on: smarter CV parsing, scoring, and apply kits."
                      )
                    : t(
                        "Groq مش متصل. على Vercel: Settings → Environment Variables → GROQ_API_KEY ثم Redeploy.",
                        "Groq is offline. On Vercel add GROQ_API_KEY under Environment Variables, then Redeploy."
                      )}
                </p>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,application/pdf"
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadCv(f);
                    e.target.value = "";
                  }}
                />
                <button type="button" style={ghostBtn} disabled={cvBusy} onClick={() => fileRef.current?.click()}>
                  {cvBusy ? t("بيقرأ…", "Reading…") : t("رفع ملف CV", "Upload CV")}
                </button>
                {cvProfile?.source === "cv" ? (
                  <button type="button" style={ghostBtn} onClick={clearCv}>
                    {t("رجوع للافتراضي", "Reset default")}
                  </button>
                ) : null}
              </div>
            </div>
            {cvProfile?.skills?.length ? (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                {cvProfile.skills.map((s) => (
                  <span key={s} style={{ fontSize: "0.75rem", padding: "0.2rem 0.55rem", borderRadius: 99, border: "1px solid rgba(77,168,218,0.4)", color: "#c5d8ea" }}>
                    {s}
                  </span>
                ))}
              </div>
            ) : null}
            <textarea
              value={cvPaste}
              onChange={(e) => setCvPaste(e.target.value)}
              placeholder={t("أو الصق نص الـ CV هنا…", "Or paste CV text here…")}
              rows={3}
              style={{ width: "100%", marginTop: 10, background: "#07101c", color: "#e8f0f8", border: "1px solid rgba(77,168,218,0.35)", borderRadius: 8, padding: 8 }}
            />
            <button type="button" style={{ ...ghostBtn, marginTop: 8 }} disabled={cvBusy || cvPaste.trim().length < 40} onClick={pasteCv}>
              {t("استخدم النص ده", "Use pasted CV")}
            </button>
            {cvError ? <p style={{ color: "#f87171", fontSize: "0.82rem", marginTop: 8 }}>{cvError}</p> : null}
            <p style={{ color: "#7a9bb8", fontSize: "0.75rem", marginTop: 12, marginBottom: 6 }}>
              {t("بيدور في:", "Searches:")}
            </p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[
                "Wuzzuf",
                "LinkedIn",
                "Indeed",
                "Bayt",
                "GulfTalent",
                "Akhtaboot",
                "Naukrigulf",
                "Tanqeeb",
                "Careerjet",
                "Wellfound",
                "Upwork",
                "Mostaql",
                "Khamsat",
                "Freelancer",
                "Forasna",
                "RemoteOK",
                "Remotive",
                "Jobicy",
                "Himalayas",
                "Working Nomads",
                "We Work Remotely",
                "WWR Full-stack",
                "The Muse",
                "4 Day Week",
                "Hacker News",
                "Arbeitnow",
              ].map((name) => (
                <span
                  key={name}
                  style={{
                    fontSize: "0.68rem",
                    padding: "0.15rem 0.45rem",
                    borderRadius: 99,
                    background: "rgba(7,16,28,0.7)",
                    color: "#7a9bb8",
                    border: "1px solid rgba(77,168,218,0.22)",
                  }}
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.7rem", marginBottom: "1.25rem" }}>
          {STEPS.map((s, i) => {
            const st = steps[s.id];
            const color = st === "running" ? "#4da8da" : st === "done" ? "#4ade80" : st === "error" ? "#f87171" : "#7a9bb8";
            return (
              <div key={s.id} style={{ border: `1px solid ${st === "idle" ? "rgba(77,168,218,0.2)" : color}`, background: st === "running" ? "rgba(77,168,218,0.08)" : "rgba(20,40,64,0.4)", borderRadius: 10, padding: "0.85rem 1rem" }}>
                <div style={{ fontSize: "0.68rem", color: "#7a9bb8" }}>{t("خطوة", "STEP")} {i + 1}</div>
                <div style={{ fontWeight: 800, color }}>{ar ? s.ar : s.en}</div>
                <div style={{ fontSize: "0.78rem", color: "#a0bcd4", marginTop: 2 }}>{ar ? s.hintAr : s.hintEn}</div>
              </div>
            );
          })}
        </div>

        {error ? <div style={{ background: "rgba(248,113,113,0.12)", border: "1px solid #f87171", color: "#fca5a5", padding: "0.85rem 1rem", borderRadius: 8, marginBottom: "1rem" }}>{error}</div> : null}

        <div className="scout-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.45fr) minmax(280px, 0.75fr)", gap: "1.25rem", alignItems: "start" }}>
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              {(["help", "digest", "audit", "log"] as const).map((tb) => (
                <button key={tb} type="button" onClick={() => setTab(tb)} style={tabBtn(tab === tb)}>
                  {tb === "help" ? t("إزاي تستخدمه", "How to use") : tb === "digest" ? t("النتائج", "Digest") : tb === "audit" ? t("السجل", "Audit") : t("اللوج", "Log")}
                </button>
              ))}
              <button type="button" onClick={() => copyText(digestText, "digest")} style={ghostBtn}>{copied === "digest" ? t("تم النسخ", "Copied") : t("نسخ الملخص", "Copy digest")}</button>
              <a href={mailto} style={{ ...ghostBtn, textDecoration: "none" }}>{t("إرسال للإيميل", "Email digest")}</a>
              <a href="/api/scout/export?format=txt" style={{ ...ghostBtn, textDecoration: "none" }}>{t("تحميل", "Download")}</a>
            </div>

            {tab === "help" && (
              <div style={{ ...card, lineHeight: 1.8, color: "#c5d8ea" }}>
                <h2 style={{ marginBottom: 10 }}>{t("المفروض بيعمل إيه؟", "What does it do?")}</h2>
                <p style={{ color: "#a0bcd4" }}>
                  {t(
                    "بدل ما تقعد تمسح LinkedIn وWuzzuf كل يوم، الوكيل يجيب وظائف React/Frontend، يقرأ الوصف، يدي درجة من ٩، ويطلّعلك أفضل ٣–٥. مش بيقدّم. أنت تفتح اللينك وتقدّم.",
                    "Instead of scanning boards daily, the agent gathers React/frontend jobs, reads the JD, scores /9, and shows the best 3–8. It never applies. You open the link."
                  )}
                </p>
                <ol style={{ paddingInlineStart: "1.2rem", color: "#a0bcd4", marginTop: 12 }}>
                  <li>{t("اضغط «شغّل الكشّاف» (أو حرف R).", "Click Run Scout (or press R).")}</li>
                  <li>{t("راجع الكروت. مصر والـ Junior والـ NEW في الأول.", "Review cards. Egypt, junior, and NEW rise first.")}</li>
                  <li>{t("افتح «حزمة التقديم»: رسالة جاهزة بالإنجليزي + نقاط تتكلم بيها.", "Open Apply kit: English pitch + talking points.")}</li>
                  <li>{t("قدّم بنفسك. بعدين علّم Applied. اللي مش مناسب: Skip.", "Apply yourself. Then mark Applied. Skip the rest.")}</li>
                  <li>{t("الهدف: ٢–٣ تقديمات في الأسبوع.", "Goal: 2–3 applications per week.")}</li>
                </ol>
                <p style={{ marginTop: 12, color: "#fbbf24", fontSize: "0.9rem" }}>
                  {t("اتجاهل Senior / ٦ سنين+ / أمريكا أو أوروبا أون سايت من غير فيزا.", "Skip Senior / 6+ years / US-EU on-site without visa.")}
                </p>
              </div>
            )}

            {tab === "digest" && (
              <div>
                {pick ? (
                  <div style={{ ...card, borderColor: "#4da8da", marginBottom: 14, background: "rgba(77,168,218,0.08)" }}>
                    <div style={{ fontSize: "0.72rem", color: "#4da8da", letterSpacing: "0.12em", marginBottom: 6 }}>{t("اختيار اليوم", "TODAY'S PICK")}</div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>{pick.title}</h3>
                    <p style={{ color: "#a0bcd4", marginTop: 6 }}>{pick.whyFit}</p>
                    <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                      <button type="button" style={primaryBtn(false)} onClick={() => { setSelected(pick); setNoteDraft(trackerByUrl.get(pick.url)?.note || ""); }}>{t("حزمة التقديم", "Apply kit")}</button>
                      <a href={pick.url} target="_blank" rel="noopener noreferrer" style={{ ...ghostBtn, textDecoration: "none" }}>{t("افتح الإعلان", "Open listing")}</a>
                    </div>
                  </div>
                ) : null}

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                  <input ref={searchRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("ابحث…  (/)", "Search…  (/)") } style={{ ...inputStyle, width: 210 }} />
                  <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} style={{ ...inputStyle, width: "auto", minWidth: 130 }}>
                    {sources.map((s) => <option key={s} value={s}>{s === "all" ? t("كل المصادر", "All sources") : s}</option>)}
                  </select>
                  <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} style={{ ...inputStyle, width: "auto" }}>
                    <option value="priority">{t("الأولوية", "Priority")}</option>
                    <option value="score">{t("الدرجة", "Score")}</option>
                    <option value="new">{t("الأحدث", "Newest")}</option>
                  </select>
                  <label style={checkLabel}><input type="checkbox" checked={newOnly} onChange={(e) => setNewOnly(e.target.checked)} />{t("جديد فقط", "New only")}</label>
                  <label style={checkLabel}><input type="checkbox" checked={egyptOnly} onChange={(e) => setEgyptOnly(e.target.checked)} />{t("مصر فقط", "Egypt only")}</label>
                  <label style={checkLabel}><input type="checkbox" checked={hideVisa} onChange={(e) => setHideVisa(e.target.checked)} />{t("اخفي فيزا", "Hide visa")}</label>
                  <label style={checkLabel}><input type="checkbox" checked={hideSkipped} onChange={(e) => setHideSkipped(e.target.checked)} />{t("اخفي المتخطّى", "Hide skipped")}</label>
                </div>

                {filtered.length === 0 ? (
                  <EmptyState title={t("مفيش نتائج بالفلاتر دي", "No matching roles")} body={t("شغّل الكشّاف أو خفّف الفلاتر.", "Run Scout or loosen filters.")} />
                ) : (
                  <div style={{ display: "grid", gap: "0.85rem" }}>
                    {filtered.map((role, i) => {
                      const tracked = trackerByUrl.get(role.url);
                      const inCompare = compare.includes(role.url);
                      return (
                        <article key={`${role.url}-${i}`} style={{ ...card, opacity: tracked?.status === "skipped" ? 0.55 : 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                            <div>
                              <div style={{ fontSize: "0.72rem", color: "#4da8da" }}>
                                [{i + 1}] {role.source}
                                {role.location ? ` · ${role.location}` : ""}
                                {role.isNew ? ` · ${t("جديد", "NEW")}` : ""}
                                {role.egyptFit ? ` · ${t("مصر", "EGYPT")}` : ""}
                                {tracked ? ` · ${tracked.status}` : ""}
                              </div>
                              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0.35rem 0 0.45rem" }}>{role.title}</h3>
                            </div>
                            <div style={{ fontWeight: 800, color: scoreColor(role.score), fontSize: "1.15rem" }}>{role.score}/9</div>
                          </div>
                          {role.breakdown ? (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, margin: "8px 0 10px" }}>
                              <Bar label={t("مهارات", "Skills")} value={role.breakdown.skill_match} max={3} />
                              <Bar label={t("مجال", "Domain")} value={role.breakdown.domain_match} max={2} />
                              <Bar label={t("مستوى", "Seniority")} value={role.breakdown.seniority_fit} max={2} />
                              <Bar label={t("مكان", "Location")} value={role.breakdown.location_fit} max={2} />
                            </div>
                          ) : null}
                          <p style={{ color: "#a0bcd4", fontSize: "0.88rem", lineHeight: 1.55 }}>{role.whyFit || role.rationale}</p>
                          {role.salaryQuote ? <p style={{ color: "#4ade80", fontSize: "0.78rem", marginTop: 6 }}>{t("مرتب مذكور في الإعلان:", "Salary quoted in JD:")} {role.salaryQuote}</p> : null}
                          {role.red_flags?.length ? <p style={{ color: "#fbbf24", fontSize: "0.78rem", marginTop: 6 }}>{role.red_flags.join(", ")}</p> : null}
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                            <button type="button" style={ghostBtn} onClick={() => { setSelected(role); setNoteDraft(tracked?.note || ""); }}>{t("التفاصيل + الرسالة", "Details + kit")}</button>
                            <a href={role.url} target="_blank" rel="noopener noreferrer" style={{ ...ghostBtn, color: "#4da8da", fontWeight: 700, textDecoration: "none" }}>{t("افتح", "Open")} →</a>
                            <button type="button" style={ghostBtn} onClick={() => track(role, "saved")}>{t("حفظ", "Save")}</button>
                            <button type="button" style={ghostBtn} onClick={() => track(role, "applied")}>{t("قدّمت", "Applied")}</button>
                            <button type="button" style={ghostBtn} onClick={() => track(role, "skipped")}>{t("تخطّي", "Skip")}</button>
                            <button type="button" style={ghostBtn} onClick={() => setCompare((prev) => prev.includes(role.url) ? prev.filter((u) => u !== role.url) : prev.length >= 2 ? [prev[1], role.url] : [...prev, role.url])}>
                              {inCompare ? t("إلغاء المقارنة", "Uncompare") : t("قارن", "Compare")}
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}

                {compareRoles.length === 2 ? (
                  <div style={{ ...card, marginTop: 16 }}>
                    <h3 style={{ marginBottom: 10 }}>{t("مقارنة", "Compare")}</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      {compareRoles.map((r) => (
                        <div key={r.url}>
                          <strong>{r.title}</strong>
                          <p style={{ color: "#4da8da", margin: "6px 0" }}>{r.score}/9</p>
                          <p style={{ color: "#a0bcd4", fontSize: "0.85rem" }}>{r.whyFit}</p>
                          <p style={{ color: "#7a9bb8", fontSize: "0.8rem", marginTop: 6 }}>{r.location} · {r.source}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {tab === "audit" && (
              (result?.audit || []).length === 0 ? (
                <EmptyState title={t("مفيش سجل بعد", "No audit yet")} body={t("كل تشغيل بيسجّل اللينكات والدرجات.", "Every run writes a URL audit trail.")} />
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                  <thead>
                    <tr style={{ color: "#7a9bb8", textAlign: "start" }}>
                      <th style={th}>{t("درجة", "Score")}</th>
                      <th style={th}>{t("المسمى", "Title")}</th>
                      <th style={th}>{t("مصدر", "Source")}</th>
                      <th style={th}>{t("أعلام", "Flags")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result!.audit.map((row) => (
                      <tr key={row.url} style={{ borderTop: "1px solid rgba(77,168,218,0.15)" }}>
                        <td style={td}><span style={{ color: scoreColor(row.score_total), fontWeight: 800 }}>{row.score_total}</span></td>
                        <td style={td}><a href={row.url} target="_blank" rel="noopener noreferrer" style={{ color: "#e8f0f8" }}>{row.title}</a></td>
                        <td style={td}>{row.source}</td>
                        <td style={{ ...td, color: "#fbbf24" }}>{row.red_flags.join(", ") || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}

            {tab === "log" && (
              <pre ref={logRef} style={{ background: "#07101c", border: "1px solid rgba(77,168,218,0.2)", borderRadius: 12, padding: "1rem", minHeight: 360, maxHeight: 520, overflow: "auto", color: "#b7d0e6", fontSize: "0.78rem", lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
                {logs.join("\n") || t("واقف. اضغط شغّل الكشّاف.", "Idle. Click Run Scout.")}
              </pre>
            )}
          </div>

          <aside style={{ display: "grid", gap: "1rem" }}>
            <Panel title={t("هدف الأسبوع", "Weekly goal")}>
              <p style={{ fontSize: "0.9rem", marginBottom: 8 }}>{appliedThisWeek} / 3 {t("تقديمات", "applications")}</p>
              <div style={{ height: 8, background: "#142840", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ width: `${Math.min(100, (appliedThisWeek / 3) * 100)}%`, height: "100%", background: appliedThisWeek >= 2 ? "#4ade80" : "#4da8da" }} />
              </div>
            </Panel>
            <Panel title={t("خط الأنابيب", "Pipeline")}>
              {["saved", "applied", "skipped"].map((st) => (
                <div key={st} style={{ fontSize: "0.85rem", color: "#a0bcd4", marginBottom: 6 }}>
                  {st}: {tracker.filter((x) => x.status === st).length}
                </div>
              ))}
            </Panel>
            <Panel title={t("المحفوظات", "Tracker")}>
              {tracker.length === 0 ? (
                <p style={{ color: "#7a9bb8", fontSize: "0.85rem" }}>{t("احفظ أو قدّم أو تخطّى عشان يتبني سجل.", "Save, apply, or skip to build a pipeline.")}</p>
              ) : (
                tracker.slice(0, 8).map((item) => (
                  <div key={item.url} style={{ fontSize: "0.8rem", color: "#a0bcd4", marginBottom: 8 }}>
                    <span style={{ color: item.status === "applied" ? "#4ade80" : "#4da8da", fontWeight: 700 }}>{item.status}</span>{" "}
                    {item.title.slice(0, 46)}
                    {item.note ? <div style={{ color: "#7a9bb8" }}>{item.note.slice(0, 80)}</div> : null}
                  </div>
                ))
              )}
            </Panel>
            <Panel title={t("صحة المصادر", "Source health")}>
              {(result?.sources || []).length === 0 ? (
                <p style={{ color: "#7a9bb8", fontSize: "0.85rem" }}>{t("شغّل الكشّاف.", "Run Scout.")}</p>
              ) : result!.sources.map((s) => (
                <div key={s.source} style={{ fontSize: "0.8rem", color: s.error ? "#f87171" : "#a0bcd4" }}>
                  {s.source}: {s.error ? t("فشل", "fail") : `${s.count}`}
                </div>
              ))}
            </Panel>
            <Panel title={`E3 ${evalData ? `${evalData.passed}/${evalData.total}` : ""}`}>
              {evalData?.results.map((r) => (
                <div key={r.name} style={{ fontSize: "0.78rem", color: r.pass ? "#4ade80" : "#f87171" }}>
                  {r.pass ? "PASS" : "FAIL"} · {r.name}
                </div>
              ))}
            </Panel>
            {candidates.length > 0 && running ? (
              <Panel title={t("تقييم مباشر", "Live scoring")}>
                {candidates.map((c) => (
                  <div key={c.url} style={{ fontSize: "0.78rem", color: "#a0bcd4" }}>
                    <span style={{ color: scoreColor(c.score?.total || 0), fontWeight: 700 }}>{c.score?.total ?? "…"}/9</span> {c.title.slice(0, 48)}
                  </div>
                ))}
              </Panel>
            ) : null}
            <Panel title={t("ملخص أسبوعي", "Weekly summary")}>
              <pre style={{ color: "#a0bcd4", fontSize: "0.7rem", whiteSpace: "pre-wrap", maxHeight: 180, overflow: "auto" }}>{summary || "—"}</pre>
            </Panel>
          </aside>
        </div>
      </div>

      {selected ? (
        <div style={overlay} onClick={() => setSelected(null)}>
          <div style={drawer} onClick={(e) => e.stopPropagation()} dir={ar ? "rtl" : "ltr"}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 800, lineHeight: 1.4 }}>{selected.title}</h2>
              <button type="button" style={ghostBtn} onClick={() => setSelected(null)}>✕</button>
            </div>
            <p style={{ color: "#4da8da", margin: "8px 0 12px" }}>{selected.score}/9 · {selected.source} · {selected.location}</p>
            <p style={{ color: "#a0bcd4", lineHeight: 1.6 }}>{selected.whyFit}</p>
            {selected.excerpt ? <p style={{ color: "#7a9bb8", fontSize: "0.85rem", marginTop: 10, lineHeight: 1.55 }}>{selected.excerpt}…</p> : null}
            {selected.yearsHint ? <p style={{ color: "#fbbf24", fontSize: "0.82rem", marginTop: 8 }}>{selected.yearsHint}</p> : null}

            <h3 style={{ margin: "18px 0 8px", color: "#4da8da" }}>{t("حزمة التقديم", "Apply kit")}</h3>
            <p style={{ color: "#c5d8ea", fontSize: "0.88rem", lineHeight: 1.65 }}>{kitForRole(selected).pitchAr}</p>
            <pre style={{ background: "#07101c", padding: "0.9rem", borderRadius: 8, whiteSpace: "pre-wrap", fontSize: "0.8rem", color: "#d5e6f4", marginTop: 8 }}>{kitForRole(selected).pitchEn}</pre>
            <button type="button" style={{ ...ghostBtn, marginTop: 8 }} onClick={() => copyText(kitForRole(selected).pitchEn, "pitch")}>
              {copied === "pitch" ? t("اتنسخت الرسالة", "Pitch copied") : t("انسخ الرسالة الإنجليزية", "Copy English pitch")}
            </button>
            <ul style={{ color: "#a0bcd4", marginTop: 12, paddingInlineStart: "1.1rem", lineHeight: 1.6 }}>
              {kitForRole(selected).talkingPoints.map((p) => <li key={p}>{p}</li>)}
            </ul>
            <p style={{ color: "#7a9bb8", fontSize: "0.8rem", marginTop: 8 }}>{t("قبل ما تقدّم", "Checklist")}: {kitForRole(selected).checklist.join(" · ")}</p>

            <h3 style={{ margin: "18px 0 8px", color: "#4da8da" }}>{t("ملاحظتك", "Your note")}</h3>
            <textarea value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} rows={3} style={{ width: "100%", background: "#07101c", color: "#e8f0f8", border: "1px solid rgba(77,168,218,0.35)", borderRadius: 8, padding: 8 }} />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
              <button type="button" style={primaryBtn(false)} onClick={() => { track(selected, trackerByUrl.get(selected.url)?.status || "saved", noteDraft); }}>{t("حفظ الملاحظة", "Save note")}</button>
              <a href={selected.url} target="_blank" rel="noopener noreferrer" style={{ ...ghostBtn, textDecoration: "none" }}>{t("قدّم على الموقع", "Apply on site")}</a>
              <button type="button" style={ghostBtn} onClick={() => track(selected, "applied", noteDraft)}>{t("علّم قدّمت", "Mark applied")}</button>
            </div>
            <p style={{ color: "#5a7a96", fontSize: "0.75rem", marginTop: 14 }}>{t("الوكيل لا يرسل التقديم. اللينك بيفتح الموقع الأصلي.", "The agent does not submit. The link opens the original listing.")}</p>
          </div>
        </div>
      ) : null}

      <style>{`@media (max-width: 900px) { .scout-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

function timeAgo(iso: string, ar: boolean) {
  const ms = Date.now() - Date.parse(iso);
  if (!Number.isFinite(ms) || ms < 0) return iso.slice(0, 16).replace("T", " ");
  const m = Math.floor(ms / 60000);
  if (m < 1) return ar ? "الآن" : "just now";
  if (m < 60) return ar ? `منذ ${m} د` : `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return ar ? `منذ ${h} س` : `${h}h ago`;
  return ar ? `منذ ${Math.floor(h / 24)} يوم` : `${Math.floor(h / 24)}d ago`;
}

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "#7a9bb8" }}>
        <span>{label}</span><span>{value}/{max}</span>
      </div>
      <div style={{ height: 6, background: "#142840", borderRadius: 99, overflow: "hidden", marginTop: 3 }}>
        <div style={{ width: `${(value / max) * 100}%`, height: "100%", background: "#4da8da" }} />
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ background: "rgba(20,40,64,0.45)", border: "1px solid rgba(77,168,218,0.2)", borderRadius: 12, padding: "1rem 1.1rem" }}>
      <h2 style={{ fontSize: "0.82rem", letterSpacing: "0.06em", color: "#4da8da", marginBottom: 8 }}>{title}</h2>
      {children}
    </section>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div style={{ border: "1px dashed rgba(77,168,218,0.35)", borderRadius: 12, padding: "2rem 1.25rem", color: "#7a9bb8" }}>
      <h3 style={{ color: "#e8f0f8", marginBottom: 8 }}>{title}</h3>
      <p style={{ lineHeight: 1.55 }}>{body}</p>
    </div>
  );
}

const th: CSSProperties = { padding: "0.55rem 0.4rem", fontWeight: 600 };
const td: CSSProperties = { padding: "0.65rem 0.4rem", verticalAlign: "top" };
const statCard: CSSProperties = { background: "rgba(228,236,245,0.05)", border: "1px solid rgba(77,168,218,0.2)", borderRadius: 10, padding: "0.85rem 0.95rem" };
const inputStyle: CSSProperties = { marginInlineStart: 8, background: "#07101c", color: "#e8f0f8", border: "1px solid rgba(77,168,218,0.35)", borderRadius: 6, padding: "0.35rem 0.55rem", width: 64 };
const ghostBtn: CSSProperties = { background: "transparent", color: "#a0bcd4", border: "1px solid rgba(77,168,218,0.35)", borderRadius: 6, padding: "0.4rem 0.75rem", fontSize: "0.8rem", cursor: "pointer" };
const checkLabel: CSSProperties = { fontSize: "0.8rem", color: "#a0bcd4", display: "flex", gap: 6, alignItems: "center" };
const card: CSSProperties = { background: "rgba(228,236,245,0.05)", border: "1px solid rgba(77,168,218,0.22)", borderRadius: 12, padding: "1.1rem 1.2rem" };
const overlay: CSSProperties = { position: "fixed", inset: 0, background: "rgba(4,10,18,0.72)", zIndex: 80, display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "4vh 1rem", overflow: "auto" };
const drawer: CSSProperties = { width: "min(720px, 100%)", background: "#0c1c30", border: "1px solid rgba(77,168,218,0.35)", borderRadius: 14, padding: "1.25rem 1.3rem 1.5rem" };

function tabBtn(active: boolean): CSSProperties {
  return { background: active ? "#4da8da" : "transparent", color: active ? "#0a1628" : "#a0bcd4", border: "1px solid rgba(77,168,218,0.35)", borderRadius: 6, padding: "0.4rem 0.85rem", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" };
}
function langBtn(active: boolean): CSSProperties {
  return { background: active ? "#4da8da" : "transparent", color: active ? "#0a1628" : "#a0bcd4", border: "1px solid rgba(77,168,218,0.35)", borderRadius: 6, padding: "0.25rem 0.7rem", fontWeight: 700, cursor: "pointer" };
}
function primaryBtn(running: boolean): CSSProperties {
  return { padding: "0.85rem 1.4rem", background: running ? "#1b3a55" : "#4da8da", color: running ? "#7a9bb8" : "#0a1628", fontWeight: 800, border: 0, borderRadius: 8, cursor: running ? "wait" : "pointer", fontSize: "0.95rem" };
}
