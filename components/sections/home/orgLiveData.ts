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
 * LABEL CONVENTION — task-shaped, not title-shaped. Every row reads as work
 * actually happening ("Booked: Acme demo", "Shipped SEO brief"), never a job
 * title ("Lead Researcher"). Verb-first, concrete believable numbers, a mix
 * of done-form ("Closed 8 stale") and in-progress ("Scoring 120 ICPs").
 * HARD LIMIT: ≤ 17 characters — rows must stay one-line on the 232px cards.
 * Seed rows are the first 3 entries of their squad's ROLE_POOLS pool so the
 * ticker's visible-label filter treats them like any other pool entry.
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
      { label: "Scoring 120 ICPs", dot: "positive" },
      { label: "Booked: Acme demo", dot: "positive" },
      { label: "Warming 3 domains", dot: "warning" },
    ],
  },
  {
    title: "AI SEO",
    surface: "seo",
    rows: [
      { label: "Shipped SEO brief", dot: "positive" },
      { label: "Drafted 4 posts", dot: "positive" },
      { label: "Fixing 12 links", dot: "warning" },
    ],
  },
  {
    title: "GitHub Triage",
    surface: "triage",
    rows: [
      { label: "Labeled #4021", dot: "positive" },
      { label: "Repro'd crash", dot: "warning" },
      { label: "Closed 8 stale", dot: "positive" },
    ],
  },
  {
    title: "Google Ads",
    surface: "ads",
    rows: [
      { label: "Paused 3 low ads", dot: "positive" },
      { label: "Cut CPA to $41", dot: "positive" },
      { label: "Capping spend +9%", dot: "warning" },
    ],
  },
  {
    title: "Reddit",
    surface: "reddit",
    rows: [
      { label: "Drafted 5 replies", dot: "positive" },
      { label: "Found hot thread", dot: "positive" },
      { label: "Flagged mod risk", dot: "warning" },
    ],
  },
  {
    title: "Meta Ads",
    surface: "meta",
    rows: [
      { label: "Tested 8 hooks", dot: "positive" },
      { label: "Cut CPM 12%", dot: "positive" },
      { label: "Caught ad fatigue", dot: "warning" },
    ],
  },
  {
    title: "Posthog",
    surface: "posthog",
    rows: [
      { label: "Built cohort Q3", dot: "positive" },
      { label: "Flagged churn +3%", dot: "warning" },
      { label: "Mapped funnel v2", dot: "positive" },
    ],
  },
] as const;

/**
 * Task pools per squad — what the ticker draws from when it adds a row.
 * Same convention as above: task-shaped, verb-first, ≤ 17 chars, unique
 * within each pool. First 3 entries of each pool = that squad's seed rows.
 */
export const ROLE_POOLS: Record<OrgSurface, readonly string[]> = {
  outreach: [
    "Scoring 120 ICPs",
    "Booked: Acme demo",
    "Warming 3 domains",
    "Drafted 42 emails",
    "Sourcing 80 leads",
    "Replied: 6 leads",
    "Chasing 9 replies",
    "Cleaned CRM dupes",
    "Queued follow-ups",
  ],
  seo: [
    "Shipped SEO brief",
    "Drafted 4 posts",
    "Fixing 12 links",
    "Mapped 60 queries",
    "Audited citations",
    "Patched schema",
    "Tracking 45 SERPs",
    "Linked 8 orphans",
    "Won snippet spot",
  ],
  triage: [
    "Labeled #4021",
    "Repro'd crash",
    "Closed 8 stale",
    "Deduped 5 issues",
    "Linked PR #892",
    "Flagged 2 flakes",
    "Wrote changelog",
    "Answered 11 new",
    "Bisected #3977",
  ],
  ads: [
    "Paused 3 low ads",
    "Cut CPA to $41",
    "Capping spend +9%",
    "Pruned 40 kws",
    "Testing 6 copies",
    "Split 2 audiences",
    "Raised 5 bids",
    "Fixed ad quality",
    "Graded landers",
  ],
  reddit: [
    "Drafted 5 replies",
    "Found hot thread",
    "Flagged mod risk",
    "Logged 9 mentions",
    "Scanning 12 subs",
    "Posted AMA recap",
    "Scored sentiment",
    "Queued 3 posts",
    "Spotted trend +2x",
  ],
  meta: [
    "Tested 8 hooks",
    "Cut CPM 12%",
    "Caught ad fatigue",
    "Built lookalike",
    "Fixed pixel event",
    "Tuned placements",
    "ROAS up to 3.1x",
    "Swapped creative",
    "Paced $2k budget",
  ],
  posthog: [
    "Built cohort Q3",
    "Flagged churn +3%",
    "Mapped funnel v2",
    "Cleaned 6 flags",
    "Audited events",
    "Logged DAU +4%",
    "Viewed 20 replays",
    "Wrote insight doc",
    "Traced drop-off",
  ],
};
