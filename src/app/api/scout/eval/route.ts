import { runEvalE3 } from "@/lib/scout/eval-e3";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(runEvalE3());
}
