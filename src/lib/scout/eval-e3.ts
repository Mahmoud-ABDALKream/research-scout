import { applySeniorityPenalty } from "./score";
import { ScoreResult } from "./types";

type EvalCase = {
  name: string;
  score: ScoreResult;
  title?: string;
  jd?: string;
  expectedTotal: number;
  mustBeBelowThreshold?: boolean;
};

const THRESHOLD = 5;

function base(total: number, red_flags: string[] = []): ScoreResult {
  return {
    skill_match: 0,
    domain_match: 0,
    seniority_fit: 0,
    location_fit: 0,
    total,
    rationale: "eval",
    whyFit: "eval",
    skills: [],
    domains: [],
    red_flags,
  };
}

export function runEvalE3() {
  const cases: EvalCase[] = [
    {
      name: 'LLM "too senior" flag only',
      score: base(5, ["too senior"]),
      expectedTotal: 3,
      mustBeBelowThreshold: true,
    },
    {
      name: '"Senior" in title (no LLM flag)',
      score: base(5, []),
      title: "Senior Frontend Developer",
      expectedTotal: 3,
      mustBeBelowThreshold: true,
    },
    {
      name: "6+ years required",
      score: base(6, []),
      jd: "We need 8 years of experience in React.",
      expectedTotal: 5,
    },
    {
      name: "Lead title extra penalty",
      score: base(7, []),
      title: "Staff Engineer, Frontend",
      expectedTotal: 5,
    },
    {
      name: "Junior role — no penalty",
      score: base(7, []),
      title: "Junior React Developer",
      jd: "1-2 years of experience welcome.",
      expectedTotal: 7,
    },
    {
      name: "Penalty cap at -4",
      score: base(9, ["too senior"]),
      title: "Lead Principal Staff Engineer",
      jd: "10+ years of experience required. Senior leader.",
      expectedTotal: 5,
    },
  ];

  const results = cases.map((c) => {
    const { score, penalty } = applySeniorityPenalty(
      { ...c.score, red_flags: [...c.score.red_flags] },
      c.title || "",
      c.jd || ""
    );
    const pass =
      score.total === c.expectedTotal &&
      (!c.mustBeBelowThreshold || score.total < THRESHOLD);
    return {
      name: c.name,
      expected: c.expectedTotal,
      actual: score.total,
      penalty,
      pass,
    };
  });

  return {
    passed: results.filter((r) => r.pass).length,
    total: results.length,
    results,
  };
}
