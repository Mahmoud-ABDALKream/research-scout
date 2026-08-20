import os from "os";
import path from "path";

export const USER_PROFILE = {
  name: "Mahmoud ABD ELKream",
  skills: [
    "React",
    "Next.js",
    "TypeScript",
    "Tailwind CSS",
    "Node.js",
    "Laravel",
    "Figma",
    "UI/UX design",
  ],
  domains: ["healthcare", "e-commerce", "Arabic RTL", "IoT", "streaming UI"],
  seniority: "junior (IT student, ~3 yrs freelance)",
  seniorityMaxYears: 5,
  location: "Alexandria, Egypt",
  acceptLocations: [
    "remote-egypt",
    "remote-mena",
    "on-site egypt",
    "remote-global",
  ],
  rejectLocations: ["us on-site no visa", "eu on-site no visa"],
};

export const SCORE_THRESHOLD = 5;
export const MAX_READ = 32;
export const MAX_QUALIFIED = 28;

export const SKILL_GROUPS: { name: string; keys: string[] }[] = [
  { name: "react", keys: ["react"] },
  { name: "next.js", keys: ["next.js", "nextjs", "next js"] },
  { name: "typescript", keys: ["typescript"] },
  { name: "tailwind", keys: ["tailwind"] },
  { name: "node.js", keys: ["node.js", "nodejs", "node js"] },
  { name: "laravel", keys: ["laravel"] },
  { name: "figma", keys: ["figma"] },
  { name: "ui/ux", keys: ["ui/ux", "ui ux", "product designer"] },
  { name: "frontend", keys: ["frontend", "front-end", "front end"] },
];

export const DOMAIN_DIRECT = [
  "healthcare",
  "health care",
  "health-tech",
  "healthtech",
  "hospital",
  "clinic",
  "pharma",
  "patient",
  "e-commerce",
  "ecommerce",
  "e commerce",
  "arabic",
  "rtl",
  "iot",
  "streaming",
];

export const DOMAIN_ADJACENT = [
  "saas",
  "fintech",
  "product design",
  "dashboard",
  "marketplace",
  "shopify",
  "storefront",
];

export function scoutDir() {
  if (process.env.SCOUT_DIR) return process.env.SCOUT_DIR;
  // Vercel / Lambda filesystems are read-only except /tmp
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join(os.tmpdir(), "research-scout");
  }
  return path.join(process.cwd(), "agent_mvp");
}

export function normalizeUrl(url: string) {
  try {
    const u = new URL(url);
    u.hash = "";
    u.search = "";
    return u.toString().replace(/\/+$/, "").toLowerCase();
  } catch {
    return url.trim().toLowerCase();
  }
}

export function isJunkListing(title: string, url: string) {
  if (/\d[\d,]+\s+\S+\s+Jobs in/i.test(title)) return true;
  if (/Apply Now!/i.test(title) && /jobs in/i.test(title)) return true;
  if (/\/a\/.*jobs/i.test(url)) return true;
  if (/jobs\/collections/i.test(url)) return true;
  if (/\/jobs\?/.test(url) && /linkedin\.com/i.test(url)) return true;
  return false;
}
