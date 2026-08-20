import { parseCvText } from "@/lib/scout/parse-cv";
import { groqEnabled, groqModelName } from "@/lib/scout/groq";
import { enrichCvProfile, loadActiveProfile, profileFromUpload, resetProfile, saveProfile } from "@/lib/scout/profile";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const profile = await loadActiveProfile();
  return NextResponse.json({
    profile,
    groq: groqEnabled(),
    model: groqEnabled() ? groqModelName() : null,
  });
}

export async function DELETE() {
  const profile = await resetProfile();
  return NextResponse.json({ ok: true, profile });
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await request.json();
      const text = String(body.text || "");
      if (text.trim().length < 40) {
        return NextResponse.json({ ok: false, error: "Paste more CV text." }, { status: 400 });
      }
      const profile = await saveProfile(
        await enrichCvProfile(parseCvText(text, body.fileName || "pasted.txt"), text)
      );
      return NextResponse.json({ ok: true, profile });
    }

    const form = await request.formData();
    const file = form.get("cv");
    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "No file uploaded." }, { status: 400 });
    }
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ ok: false, error: "File too large (max 8MB)." }, { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed = await profileFromUpload(buffer, file.name, file.type);
    const profile = await saveProfile(parsed);
    return NextResponse.json({ ok: true, profile });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Could not read CV" },
      { status: 400 }
    );
  }
}
