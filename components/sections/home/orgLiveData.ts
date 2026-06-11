export type OrgSurface = "outreach" | "seo" | "triage" | "ads";

export type OrgDotTone = "positive" | "warning" | "negative";

/**
 * Seeded squad cards — the four flagship squads from Pancake's squad store
 * (Outreach, AI SEO, GitHub Triage, Google Ads), each staffed by subagents.
 * Seed 3 rows per squad (ROW_CAP is 4 — seeding at cap would force the first
 * tick to be a removal everywhere); one warning dot per card keeps the same
 * mixed-status texture as the original diagram.
 */
export const LIVE_INITIAL_DEPTS: readonly {
  title: string;
  surface: OrgSurface;
  rows: readonly { label: string; dot: OrgDotTone }[];
}[] = [
  {
    title: "Outreach",
    surface: "outreach",
    rows: [
      { label: "Lead Researcher", dot: "positive" },
      { label: "Sequence Writer", dot: "positive" },
      { label: "Reply Handler", dot: "warning" },
    ],
  },
  {
    title: "AI SEO",
    surface: "seo",
    rows: [
      { label: "Keyword Analyst", dot: "positive" },
      { label: "Content Writer", dot: "positive" },
      { label: "Citation Auditor", dot: "warning" },
    ],
  },
  {
    title: "GitHub Triage",
    surface: "triage",
    rows: [
      { label: "Issue Classifier", dot: "positive" },
      { label: "Duplicate Hunter", dot: "warning" },
      { label: "Priority Labeler", dot: "positive" },
    ],
  },
  {
    title: "Google Ads",
    surface: "ads",
    rows: [
      { label: "Budget Optimizer", dot: "positive" },
      { label: "Ad Copy Tester", dot: "positive" },
      { label: "Bid Manager", dot: "warning" },
    ],
  },
] as const;

/** Subagent pools per squad — labels kept ≤ 19 chars so rows stay one-line at 1024px. */
export const ROLE_POOLS: Record<OrgSurface, readonly string[]> = {
  outreach: [
    "Lead Researcher",
    "Sequence Writer",
    "Reply Handler",
    "LinkedIn Prospector",
    "Meeting Booker",
    "ICP Scorer",
    "Follow-up Chaser",
    "Domain Warmer",
    "Objection Handler",
  ],
  seo: [
    "Keyword Analyst",
    "Content Writer",
    "Citation Auditor",
    "Geo Optimizer",
    "Internal Linker",
    "SERP Tracker",
    "Schema Fixer",
    "Brief Builder",
    "Snippet Hunter",
  ],
  triage: [
    "Issue Classifier",
    "Duplicate Hunter",
    "Priority Labeler",
    "Changelog Writer",
    "Repro Checker",
    "Stale Closer",
    "First Responder",
    "PR Linker",
    "Flaky Test Spotter",
  ],
  ads: [
    "Budget Optimizer",
    "Ad Copy Tester",
    "Bid Manager",
    "Performance Auditor",
    "Keyword Pruner",
    "Spend Watchdog",
    "Audience Splitter",
    "Quality Score Fixer",
    "Landing Page Grader",
  ],
};
