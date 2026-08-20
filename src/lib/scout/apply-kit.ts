import { USER_PROFILE } from "./config";
import { ApplyKit, QualifiedRole, ScoutCandidate } from "./types";

export function buildApplyKit(c: ScoutCandidate): ApplyKit {
  const skills = c.score?.skills?.length
    ? c.score.skills.slice(0, 4).join(", ")
    : USER_PROFILE.skills.slice(0, 4).join(", ");
  const loc = c.location || "remote / Egypt";
  const company = c.company || "your team";
  const domains = c.score?.domains?.length
    ? c.score.domains.slice(0, 2).join(" and ")
    : "product UI";

  const pitchEn = `Hi ${company.split(" ")[0]}, I'm Mahmoud ABD ELKream, a Front-End Developer & Product Designer in Alexandria, Egypt. I ship React / Next.js / TypeScript / Tailwind interfaces (healthcare and e-commerce, including Arabic RTL). ${c.title.split("@")[0].trim()} matches my stack (${skills}) and I can start as a junior/mid contributor. Portfolio: Medoniq (iSchool 1st Place 2025). Happy to share work samples.`;

  const pitchAr = `الوظيفة مناسبة لأن الستاك (${skills}) قريب من بروفايلك، والمكان ${loc}. قدّم يدويًا برسالة قصيرة بالإنجليزي — الوكيل مش بيقدّم عنك.`;

  const talkingPoints = [
    `React / Next.js work: Medoniq healthcare platform and shipped UI for ${domains}.`,
    `Based in ${USER_PROFILE.location} — ${c.score?.egyptFit ? "this location is a strong fit" : "open to remote if visa is not required"}.`,
    c.score?.domains?.length
      ? `Domain overlap: ${c.score.domains.join(", ")}.`
      : "If the product is general, emphasize UI craft, Figma-to-React handoff, and speed.",
    "Do not invent salary or seniority. Quote only what is in the listing.",
  ];

  const checklist = [
    "Open the listing and confirm it is a single job (not a search page).",
    "If the role is Senior / 6+ years / US-EU on-site without visa — skip.",
    "Paste the English pitch, then attach 1–2 relevant case links (Medoniq / Serinia).",
    "After you apply, mark Applied in Scout so the weekly goal updates.",
  ];

  return { pitchEn, pitchAr, talkingPoints, checklist };
}

export function rolePriority(role: Pick<QualifiedRole, "score" | "egyptFit" | "isNew" | "red_flags" | "title">) {
  let n = role.score;
  if (role.egyptFit) n += 3;
  if (role.isNew) n += 1;
  if (/(junior|intern|fresh|graduate)/i.test(role.title)) n += 2;
  if (role.red_flags?.includes("visa issue")) n -= 4;
  if (role.red_flags?.includes("too senior")) n -= 3;
  return n;
}

export function kitForRole(role: QualifiedRole): ApplyKit {
  if (role.applyKit?.pitchEn) return role.applyKit;
  return buildApplyKit({
    source: role.source,
    title: role.title,
    company: role.company,
    url: role.url,
    snippet: role.excerpt || role.whyFit || "",
    location: role.location,
    score: {
      skill_match: role.breakdown?.skill_match || 0,
      domain_match: role.breakdown?.domain_match || 0,
      seniority_fit: role.breakdown?.seniority_fit || 0,
      location_fit: role.breakdown?.location_fit || 0,
      total: role.score,
      rationale: role.rationale,
      whyFit: role.whyFit || "",
      skills: role.skills || [],
      domains: role.domains || [],
      red_flags: role.red_flags || [],
      egyptFit: role.egyptFit,
    },
  });
}
