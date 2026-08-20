import fs from "fs/promises";
import path from "path";
import { scoutDir } from "./config";
import { TrackerItem, TrackStatus } from "./types";

const FILE = () => path.join(scoutDir(), "tracker.json");

export async function loadTracker(): Promise<TrackerItem[]> {
  try {
    const raw = await fs.readFile(FILE(), "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function upsertTracker(item: {
  url: string;
  title: string;
  source: string;
  score: number;
  status: TrackStatus;
  note?: string;
}): Promise<TrackerItem[]> {
  await fs.mkdir(scoutDir(), { recursive: true });
  const items = await loadTracker();
  const idx = items.findIndex((x) => x.url === item.url);
  const prev = idx >= 0 ? items[idx] : undefined;
  const next: TrackerItem = {
    url: item.url,
    title: item.title || prev?.title || item.url,
    source: item.source || prev?.source || "",
    score: Number.isFinite(item.score) ? item.score : prev?.score || 0,
    status: item.status,
    note: item.note !== undefined ? item.note : prev?.note || "",
    updatedAt: new Date().toISOString(),
  };
  if (idx >= 0) items[idx] = next;
  else items.unshift(next);
  await fs.writeFile(FILE(), JSON.stringify(items, null, 2));
  return items;
}

export async function removeTracker(url: string): Promise<TrackerItem[]> {
  const items = (await loadTracker()).filter((x) => x.url !== url);
  await fs.mkdir(scoutDir(), { recursive: true });
  await fs.writeFile(FILE(), JSON.stringify(items, null, 2));
  return items;
}
