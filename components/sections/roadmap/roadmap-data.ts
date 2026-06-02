/**
 * Open roadmap — seed data + shared types.
 *
 * This is a public, read-mostly community board. There is no backend on the
 * marketing site, so ideas are seeded statically here and upvotes are tracked
 * optimistically in the browser (localStorage). Real submission happens in the
 * community Discord — the board links there rather than faking a POST.
 *
 * Modelled on PRD-Fider-Rebuild: tabs-as-tags (All / Squads / Core Features /
 * Integrations), status workflow, upvotes, comment counts.
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

export type RoadmapIdea = {
  id: string;
  title: string;
  description: string;
  tag: RoadmapTag;
  status: RoadmapStatus;
  upvotes: number;
  comments: number;
  author: string;
};

/** Top-level tabs, in display order. Drives nav + filtering. */
export const ROADMAP_TABS: { id: RoadmapTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "squads", label: "Squads" },
  { id: "core-features", label: "Core features" },
  { id: "integrations", label: "Integrations" },
];

/** Per-tag display label, used on cards and the tag pill. */
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

/**
 * Seed ideas. Ordered roughly by upvotes; the board re-sorts client-side so
 * this order is just a sensible default.
 */
export const ROADMAP_IDEAS: RoadmapIdea[] = [
  {
    id: "ux-research-squad",
    title: "UX research squad",
    description:
      "A dedicated squad that runs user interviews, synthesises transcripts, and ships a prioritised insights doc every week — so product decisions stop being vibes.",
    tag: "squads",
    status: "planned",
    upvotes: 142,
    comments: 18,
    author: "Camille",
  },
  {
    id: "email-agent-squad",
    title: "Email agent squad",
    description:
      "An always-on squad that triages the shared inbox, drafts replies in your voice, and escalates only the threads that actually need a human.",
    tag: "squads",
    status: "in-progress",
    upvotes: 118,
    comments: 24,
    author: "Tristan",
  },
  {
    id: "linear-two-way-sync",
    title: "Two-way Linear sync",
    description:
      "Let a squad open, update, and close Linear issues — and reflect status changes back on the roadmap automatically. No more copy-pasting between tools.",
    tag: "integrations",
    status: "planned",
    upvotes: 97,
    comments: 12,
    author: "Anonymous",
  },
  {
    id: "voice-briefings",
    title: "Voice briefings",
    description:
      "A spoken daily standup from your cofounder — what shipped overnight, what's blocked, what needs a decision — playable from your phone before you open the laptop.",
    tag: "core-features",
    status: "open",
    upvotes: 86,
    comments: 9,
    author: "Guillaume",
  },
  {
    id: "slack-thread-actions",
    title: "Slack thread → action",
    description:
      "React to any Slack message with an emoji to hand it to a squad as a task. The agent picks it up, does the work, and replies in-thread when it's done.",
    tag: "integrations",
    status: "shipped",
    upvotes: 73,
    comments: 15,
    author: "Léa",
  },
  {
    id: "growth-squad",
    title: "Growth squad",
    description:
      "Runs paid + organic experiments end to end: writes the variants, ships the landing pages, watches the dashboards, and kills the losers without being asked.",
    tag: "squads",
    status: "open",
    upvotes: 64,
    comments: 7,
    author: "Anonymous",
  },
  {
    id: "shared-company-memory",
    title: "Shared company memory",
    description:
      "One memory every squad reads from and writes to — decisions, brand voice, customer facts — so the engineering agent knows what the growth agent just learned.",
    tag: "core-features",
    status: "in-progress",
    upvotes: 58,
    comments: 11,
    author: "François",
  },
  {
    id: "notion-knowledge-base",
    title: "Notion knowledge base import",
    description:
      "Point Pancake at a Notion workspace and have it ingest the docs into company memory, then keep them in sync as pages change.",
    tag: "integrations",
    status: "open",
    upvotes: 41,
    comments: 5,
    author: "Anonymous",
  },
  {
    id: "kanban-roadmap-view",
    title: "Kanban roadmap view",
    description:
      "A board grouped by status (Open → Planned → In progress → Shipped) so anyone can see what the company is building at a glance.",
    tag: "core-features",
    status: "planned",
    upvotes: 37,
    comments: 4,
    author: "Camille",
  },
  {
    id: "downvotes",
    title: "Downvotes on ideas",
    description:
      "Let people downvote ideas they disagree with, not just upvote the ones they like.",
    tag: "core-features",
    status: "wont-do",
    upvotes: 12,
    comments: 6,
    author: "Anonymous",
  },
];
