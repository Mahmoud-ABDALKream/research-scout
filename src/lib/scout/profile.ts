import fs from "fs/promises";
import path from "path";
import { scoutDir } from "./config";
import { groqExtractCv } from "./groq";
import { defaultProfile, mergeCvProfiles, parseCvText } from "./parse-cv";
import { CvProfile } from "./types";

const FILE = () => path.join(scoutDir(), "cv_profile.json");

export async function loadActiveProfile(): Promise<CvProfile> {
  try {
    const raw = await fs.readFile(FILE(), "utf8");
    const data = JSON.parse(raw) as CvProfile;
    if (data?.skills?.length) return data;
  } catch {
    /* no custom cv */
  }
  return defaultProfile();
}

export async function saveProfile(profile: CvProfile) {
  await fs.mkdir(scoutDir(), { recursive: true });
  await fs.writeFile(FILE(), JSON.stringify(profile, null, 2));
  return profile;
}

export async function resetProfile() {
  try {
    await fs.unlink(FILE());
  } catch {
    /* already default */
  }
  return defaultProfile();
}

export async function profileFromUpload(buffer: Buffer, fileName: string, mime = "") {
  const ext = fileName.toLowerCase();
  let text = "";

  if (ext.endsWith(".txt") || mime.includes("text/plain")) {
    text = buffer.toString("utf8");
  } else if (ext.endsWith(".docx") || mime.includes("wordprocessingml")) {
    const mammoth = await import("mammoth");
    const out = await mammoth.extractRawText({ buffer });
    text = out.value || "";
  } else if (ext.endsWith(".pdf") || mime.includes("pdf")) {
    text = await extractPdfText(buffer);
  } else {
    text = buffer.toString("utf8");
  }

  if (text.trim().length < 40) {
    throw new Error("Could not read enough text from this file. Try PDF, DOCX, TXT, or paste the CV.");
  }
  return enrichCvProfile(parseCvText(text, fileName), text);
}

export async function enrichCvProfile(base: CvProfile, rawText: string) {
  const llm = await groqExtractCv(rawText);
  return mergeCvProfiles(base, llm);
}

type PdfParser = {
  getText: () => Promise<{ text?: string }>;
  destroy?: () => Promise<void>;
};

async function extractPdfText(buffer: Buffer): Promise<string> {
  const mod = (await import("pdf-parse")) as {
    PDFParse?: new (opts: { data: Uint8Array }) => PdfParser;
    default?: { PDFParse?: new (opts: { data: Uint8Array }) => PdfParser };
  };
  const PDFParse = mod.PDFParse || mod.default?.PDFParse;
  if (!PDFParse) {
    throw new Error("PDF parser failed to load. Paste the CV text, or upload DOCX/TXT.");
  }

  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    const out = await parser.getText();
    return out.text || "";
  } finally {
    await parser.destroy?.();
  }
}
