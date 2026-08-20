import { loadTracker, removeTracker, upsertTracker } from "@/lib/scout/tracker";
import { TrackStatus } from "@/lib/scout/types";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ tracker: await loadTracker() });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { url, title, source, score, status, note, remove } = body as {
    url?: string;
    title?: string;
    source?: string;
    score?: number;
    status?: TrackStatus;
    note?: string;
    remove?: boolean;
  };
  if (!url) {
    return NextResponse.json({ ok: false, error: "url required" }, { status: 400 });
  }
  if (remove) {
    return NextResponse.json({ ok: true, tracker: await removeTracker(url) });
  }
  if (!status || !["saved", "applied", "skipped"].includes(status)) {
    return NextResponse.json({ ok: false, error: "invalid status" }, { status: 400 });
  }
  const tracker = await upsertTracker({
    url,
    title: title || url,
    source: source || "",
    score: Number(score) || 0,
    status,
    note,
  });
  return NextResponse.json({ ok: true, tracker });
}
