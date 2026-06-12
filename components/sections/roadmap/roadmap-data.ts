/**
 * Open roadmap — shared types, labels, and fallback seed.
 *
 * When Supabase is configured the board renders live rows; when it isn't
 * (local dev / preview without env), the page falls back to SEED_IDEAS so it
 * still renders read-only. The seed mirrors supabase/migrations/0001_roadmap.sql.
 *
 * This module is import-safe from both server and client code (no secrets,
 * no server-only imports).
 */
import type { BadgeVariant } from "@/components/ui/Badge";

export type RoadmapStatus =
  | "open"
  | "planned"
  | "in-progress"
  | "shipped"
  | "wont-do";

/** Tab = tag. `all` is the catch-all view, not a real tag on an idea. */
export type RoadmapTag = "squads" | "core-features" | "integrations";

export type RoadmapTab = "all" | RoadmapTag;

/** Shape used throughout the UI — mirrors a row of the `ideas` table. */
export type RoadmapIdea = {
  id: string;
  title: string;
  description: string;
  tag: RoadmapTag;
  status: RoadmapStatus;
  authorName: string | null;
  voteCount: number;
  commentCount: number;
};

/** A comment on an idea — mirrors a row of the `comments` table. */
export type RoadmapComment = {
  id: string;
  ideaId: string;
  authorName: string | null;
  body: string;
  createdAt: string;
};

export const TAGS: RoadmapTag[] = ["squads", "core-features", "integrations"];
export const STATUSES: RoadmapStatus[] = [
  "open",
  "planned",
  "in-progress",
  "shipped",
  "wont-do",
];

/** Top-level tabs, in display order. Drives nav + filtering. */
export const ROADMAP_TABS: { id: RoadmapTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "squads", label: "Squads" },
  { id: "core-features", label: "Core features" },
  { id: "integrations", label: "Integrations" },
];

/** Per-tag display label, used on cards, the tag pill, and the create form. */
export const TAG_LABELS: Record<RoadmapTag, string> = {
  squads: "Squads",
  "core-features": "Core features",
  integrations: "Integrations",
};

/**
 * Status → label + Badge variant. The design system has no blue, so "planned"
 * maps to the purple brand accent (closest to the PRD's blue); the rest follow
 * the PRD's gray / yellow / green / red.
 */
export const STATUS_META: Record<
  RoadmapStatus,
  { label: string; variant: BadgeVariant }
> = {
  open: { label: "Open", variant: "neutral" },
  planned: { label: "Planned", variant: "brand-alt-1" },
  "in-progress": { label: "In progress", variant: "brand-alt-2" },
  shipped: { label: "Shipped", variant: "success" },
  "wont-do": { label: "Won't do", variant: "negative" },
};

/** Type guards for validating untrusted input on the server. */
export function isRoadmapTag(value: unknown): value is RoadmapTag {
  return typeof value === "string" && (TAGS as string[]).includes(value);
}
export function isRoadmapStatus(value: unknown): value is RoadmapStatus {
  return typeof value === "string" && (STATUSES as string[]).includes(value);
}

/**
 * Fallback seed (used only when Supabase isn't configured). Ordered by votes;
 * the board re-sorts client-side so this order is just a sensible default.
 */
const SEED_IDEAS_RAW: Omit<RoadmapIdea, "commentCount">[] = [
  {
    id: "seed-ux-research-squad",
    title: "UX research squad",
    description:
      "A dedicated squad that runs user interviews, synthesises transcripts, and ships a prioritised insights doc every week — so product decisions stop being vibes.",
    tag: "squads",
    status: "planned",
    authorName: "Camille",
    voteCount: 142,
  },
  {
    id: "seed-email-agent-squad",
    title: "Email agent squad",
    description:
      "An always-on squad that triages the shared inbox, drafts replies in your voice, and escalates only the threads that actually need a human.",
    tag: "squads",
    status: "in-progress",
    authorName: "Tristan",
    voteCount: 118,
  },
  {
    id: "seed-linear-two-way-sync",
    title: "Two-way Linear sync",
    description:
      "Let a squad open, update, and close Linear issues — and reflect status changes back on the roadmap automatically. No more copy-pasting between tools.",
    tag: "integrations",
    status: "planned",
    authorName: null,
    voteCount: 97,
  },
  {
    id: "seed-voice-briefings",
    title: "Voice briefings",
    description:
      "A spoken daily standup from Pancake — what shipped overnight, what's blocked, what needs a decision — playable from your phone before you open the laptop.",
    tag: "core-features",
    status: "open",
    authorName: "Guillaume",
    voteCount: 86,
  },
  {
    id: "seed-slack-thread-actions",
    title: "Slack thread → action",
    description:
      "React to any Slack message with an emoji to hand it to a squad as a task. The agent picks it up, does the work, and replies in-thread when it's done.",
    tag: "integrations",
    status: "shipped",
    authorName: "Léa",
    voteCount: 73,
  },
  {
    id: "seed-growth-squad",
    title: "Growth squad",
    description:
      "Runs paid + organic experiments end to end: writes the variants, ships the landing pages, watches the dashboards, and kills the losers without being asked.",
    tag: "squads",
    status: "open",
    authorName: null,
    voteCount: 64,
  },
  {
    id: "seed-shared-company-memory",
    title: "Shared company memory",
    description:
      "One memory every squad reads from and writes to — decisions, brand voice, customer facts — so the engineering agent knows what the growth agent just learned.",
    tag: "core-features",
    status: "in-progress",
    authorName: "François",
    voteCount: 58,
  },
  {
    id: "seed-notion-knowledge-base",
    title: "Notion knowledge base import",
    description:
      "Point Pancake at a Notion workspace and have it ingest the docs into company memory, then keep them in sync as pages change.",
    tag: "integrations",
    status: "open",
    authorName: null,
    voteCount: 41,
  },
  {
    id: "seed-kanban-roadmap-view",
    title: "Kanban roadmap view",
    description:
      "A board grouped by status (Open → Planned → In progress → Shipped) so anyone can see what the company is building at a glance.",
    tag: "core-features",
    status: "planned",
    authorName: "Camille",
    voteCount: 37,
  },
  {
    id: "seed-downvotes",
    title: "Downvotes on ideas",
    description:
      "Let people downvote ideas they disagree with, not just upvote the ones they like.",
    tag: "core-features",
    status: "wont-do",
    authorName: null,
    voteCount: 12,
  },
];

/** Preview-mode fallback has no real comments, so every seed gets count 0. */
export const SEED_IDEAS: RoadmapIdea[] = SEED_IDEAS_RAW.map((idea) => ({
  ...idea,
  commentCount: 0,
}));
