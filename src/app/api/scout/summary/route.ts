import { loadHistory, weeklySummary } from "@/lib/scout/history";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const days = Number(searchParams.get("days") || 7);
  const history = await loadHistory();
  return NextResponse.json({
    days,
    runs: history.length,
    summary: weeklySummary(history, Number.isFinite(days) ? days : 7),
  });
}
