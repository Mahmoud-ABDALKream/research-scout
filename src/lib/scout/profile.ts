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
  try {
    await fs.mkdir(scoutDir(), { recursive: true });
    await fs.writeFile(FILE(), JSON.stringify(profile, null, 2));
  } catch (err) {
    const code = (err as NodeJS.ErrnoException)?.code;
    if (code !== "EROFS" && code !== "EACCES") throw err;
  }
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

async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    const { extractText } = await import("unpdf");
    const out = await extractText(new Uint8Array(buffer), { mergePages: true });
    const text = typeof out.text === "string" ? out.text : out.text.join("\n");
    if (text.trim().length >= 40) return text;
  } catch {
    /* serverless runtimes lack DOMMatrix; fall back to literal PDF strings */
  }
  return extractPdfLiterals(buffer);
}

function extractPdfLiterals(buffer: Buffer): string {
  const raw = buffer.toString("latin1");
  const chunks: string[] = [];
  const tj = /\(((?:\\.|[^\\)])*)\)\s*Tj/g;
  const tjArray = /\[((?:(?!\])[\s\S])*)\]\s*TJ/g;
  let m: RegExpExecArray | null;
  while ((m = tj.exec(raw))) chunks.push(unescapePdfString(m[1]));
  while ((m = tjArray.exec(raw))) {
    const inner = m[1].match(/\(((?:\\.|[^\\)])*)\)/g) || [];
    chunks.push(inner.map((s) => unescapePdfString(s.slice(1, -1))).join(""));
  }
  return chunks.join(" ").replace(/\s+/g, " ").trim();
}

function unescapePdfString(value: string) {
  return value
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\\\/g, "\\");
}
