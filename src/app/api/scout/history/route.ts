import { loadHistory, loadLastAudit, loadLastDigest, loadLastResult } from "@/lib/scout/history";
import { loadTracker } from "@/lib/scout/tracker";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const [history, audit, digest, tracker, lastResult] = await Promise.all([
    loadHistory(),
    loadLastAudit(),
    loadLastDigest(),
    loadTracker(),
    loadLastResult(),
  ]);
  return NextResponse.json({
    history: history.slice(-30).reverse(),
    lastAudit: audit,
    lastDigest: digest,
    lastResult,
    tracker,
  });
}
