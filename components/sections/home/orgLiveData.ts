export type OrgSurface =
  | "outreach"
  | "seo"
  | "triage"
  | "ads"
  | "reddit"
  | "meta"
  | "posthog";

export type OrgDotTone = "positive" | "warning" | "negative";

/**
 * Seeded squad cards — all 7 squads from Pancake's squad store, each staffed
 * by subagents. Seed 3 rows per squad (ROW_CAP is 4 — seeding at cap would
 * force the first tick to be a removal everywhere); one warning dot per card
 * keeps the same mixed-status texture as the original diagram.
 *
 * ARRAY ORDER drives the mobile carousel only (flagship squads first);
 * desktop card positions come from the per-surface CSS modifiers in
 * `components.css` (visual L→R: posthog, meta, outreach, seo, triage, ads,
 * reddit — outermost two bleed past the band edges as blurred teasers).
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
  {
    title: "Reddit",
    surface: "reddit",
    rows: [
      { label: "Subreddit Monitor", dot: "positive" },
      { label: "Thread Scout", dot: "positive" },
      { label: "Reply Drafter", dot: "warning" },
    ],
  },
  {
    title: "Meta Ads",
    surface: "meta",
    rows: [
      { label: "Creative Tester", dot: "positive" },
      { label: "Audience Builder", dot: "positive" },
      { label: "Budget Pacer", dot: "warning" },
    ],
  },
  {
    title: "Posthog",
    surface: "posthog",
    rows: [
      { label: "Funnel Analyst", dot: "positive" },
      { label: "Churn Spotter", dot: "warning" },
      { label: "Cohort Builder", dot: "positive" },
    ],
  },
] as const;

/** Subagent pools per squad — labels kept ≤ 17 chars so rows stay one-line on the 232px cards. */
export const ROLE_POOLS: Record<OrgSurface, readonly string[]> = {
  outreach: [
    "Lead Researcher",
    "Sequence Writer",
    "Reply Handler",
    "LinkedIn Sourcer",
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
    "Flake Spotter",
  ],
  ads: [
    "Budget Optimizer",
    "Ad Copy Tester",
    "Bid Manager",
    "Account Auditor",
    "Keyword Pruner",
    "Spend Watchdog",
    "Audience Splitter",
    "Ad Quality Fixer",
    "Landing Grader",
  ],
  reddit: [
    "Subreddit Monitor",
    "Thread Scout",
    "Reply Drafter",
    "Mention Tracker",
    "Sentiment Reader",
    "AMA Planner",
    "Post Scheduler",
    "Trend Spotter",
    "Mod Rule Checker",
  ],
  meta: [
    "Creative Tester",
    "Audience Builder",
    "Budget Pacer",
    "Pixel Auditor",
    "Hook Analyzer",
    "Fatigue Watcher",
    "Placement Tuner",
    "CPM Watchdog",
    "ROAS Reporter",
  ],
  posthog: [
    "Funnel Analyst",
    "Churn Spotter",
    "Cohort Builder",
    "Event Auditor",
    "Retention Tracker",
    "Session Reviewer",
    "DAU Reporter",
    "Insight Writer",
    "Flag Cleaner",
  ],
};
