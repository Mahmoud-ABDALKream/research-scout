export type ScoutEvent =
  | { type: "log"; message: string }
  | { type: "step"; step: ScoutStep; status: "running" | "done" | "error"; detail?: string }
  | { type: "candidate"; candidate: ScoutCandidate }
  | { type: "done"; result: ScoutRunResult }
  | { type: "error"; message: string };

export type ScoutStep = "gather" | "read" | "score" | "filter" | "format";

export type ScoutRunOptions = {
  threshold?: number;
  maxRead?: number;
  maxQualified?: number;
  egyptFirst?: boolean;
};

export type CvProfile = {
  source: "default" | "cv";
  fileName?: string;
  uploadedAt?: string;
  name: string;
  skills: string[];
  domains: string[];
  location: string;
  seniority: string;
  seniorityMaxYears: number;
  headline?: string;
  preview?: string;
};

export type ScoreBreakdown = {
  skill_match: number;
  domain_match: number;
  seniority_fit: number;
  location_fit: number;
};

export type ScoutCandidate = {
  source: string;
  title: string;
  company?: string;
  url: string;
  snippet: string;
  location?: string;
  tags?: string[];
  fullText?: string;
  pageTitle?: string;
  blocked?: boolean;
  isNew?: boolean;
  score?: ScoreResult;
};

export type ApplyKit = {
  pitchEn: string;
  pitchAr: string;
  talkingPoints: string[];
  checklist: string[];
};

export type ScoreResult = {
  skill_match: number;
  domain_match: number;
  seniority_fit: number;
  location_fit: number;
  total: number;
  rationale: string;
  whyFit: string;
  skills: string[];
  domains: string[];
  red_flags: string[];
  penalty_applied?: string;
  salaryQuote?: string;
  yearsHint?: string;
  egyptFit?: boolean;
};

export type QualifiedRole = {
  title: string;
  url: string;
  source: string;
  company?: string;
  location?: string;
  score: number;
  rationale: string;
  whyFit?: string;
  skills?: string[];
  domains?: string[];
  breakdown?: ScoreBreakdown;
  red_flags: string[];
  isNew?: boolean;
  excerpt?: string;
  salaryQuote?: string;
  yearsHint?: string;
  egyptFit?: boolean;
  applyKit?: ApplyKit;
  priority?: number;
};

export type AuditEntry = {
  url: string;
  title: string;
  source: string;
  score_total: number;
  rationale: string;
  red_flags: string[];
  fetched_at: string;
  isNew?: boolean;
};

export type ScoutRunResult = {
  timestamp: string;
  digest: string;
  candidatesFetched: number;
  candidatesRead: number;
  candidatesQualified: number;
  newRoles: number;
  threshold: number;
  thinDay: boolean;
  qualified: QualifiedRole[];
  audit: AuditEntry[];
  sources: { source: string; count: number; error?: string }[];
  log: string[];
  durationMs: number;
  llm?: { provider: "groq" | "heuristic"; model?: string };
};

export type HistoryEntry = {
  date: string;
  timestamp: string;
  candidates_fetched: number;
  candidates_read: number;
  candidates_qualified: number;
  digest: string;
  qualified_roles: QualifiedRole[];
};

export type TrackStatus = "saved" | "applied" | "skipped";

export type TrackerItem = {
  url: string;
  title: string;
  source: string;
  score: number;
  status: TrackStatus;
  note: string;
  updatedAt: string;
};
