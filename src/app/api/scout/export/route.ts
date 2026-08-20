import { loadHistory } from "@/lib/scout/history";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "json";
  const history = await loadHistory();
  const latest = history[history.length - 1];
  if (!latest) {
    return NextResponse.json({ ok: false, error: "No digest yet" }, { status: 404 });
  }
  if (format === "txt") {
    return new Response(latest.digest, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="scout-digest-${latest.date}.txt"`,
      },
    });
  }
  return NextResponse.json({
    date: latest.date,
    digest: latest.digest,
    qualified: latest.qualified_roles,
  });
}
