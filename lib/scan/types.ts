/**
 * Wire contract for the /ai-gtm-report scan. The API route emits these over SSE and
 * the client folds them into UI state — keep both sides on this single union.
 */

export type CheckId = "crawlers" | "llms" | "schema" | "meta_quality";

export type GoogleRow = {
  term: string;
  position: number | null;
  volume: number | null;
  detail: string;
};

export type OpportunityItem = { title: string; detail: string };

/** An observable event that predicts a purchase — never a lead list. */
export type SignalItem = { signal: string; why: string; where: string };

/** A real community where the ICP asks for advice. `members` is exact when
 *  verified against Reddit's public API; when Reddit blocks the check it can
 *  carry the model's approximate figure, flagged `membersEstimated` and
 *  always displayed with a ~ prefix. */
export type CommunityItem = {
  name: string;
  why: string;
  members?: number;
  membersEstimated?: boolean;
};

export type ScanEvent =
  | { type: "status"; label: string }
  /** Heartbeat during long server ops — clients use it for liveness, never render it. */
  | { type: "ping" }
  | {
      type: "meta";
      title?: string;
      ogImage?: string;
      favicon?: string;
      description?: string;
      schemaTypes?: string[];
      /** Verbatim fragments of the visitor's homepage — the evidence board's props. */
      snippets?: string[];
    }
  | { type: "check"; id: CheckId; pass: boolean; detail: string }
  | { type: "brain"; company: string; icp: string; prompts: string[] }
  | {
      type: "citation";
      index: number;
      cited: boolean;
      detail: string;
      estimated?: boolean;
      /** Who ChatGPT actually cited for this question — feeds the competitor card. */
      citedDomains?: string[];
    }
  | {
      type: "google";
      rows: GoogleRow[];
      toWin: number;
      estimated?: boolean;
      commentary?: string;
    }
  | { type: "opportunities"; count: number; items: OpportunityItem[] }
  /** The outbound dimension: signals to monitor + communities to watch. */
  | { type: "signals"; signals: SignalItem[]; communities: CommunityItem[] }
  /** potential = the recomputed score if the surfaced gaps were closed. */
  | {
      type: "score";
      value: number;
      potential?: number;
      /** Sub-scores behind the blend — the dashboard's mini-dials. */
      breakdown?: {
        ai: { score: number; max: number };
        google: { score: number; max: number };
        readiness: { score: number; max: number };
      };
    }
  | { type: "done"; domain: string; cached?: boolean; mode: "live" | "estimated" }
  | {
      type: "error";
      code: "unreachable" | "rate_limited" | "failed" | "invalid";
      message: string;
    };

/** Everything the free deterministic pass extracts from the visitor's site. */
export type SiteSnapshot = {
  url: string;
  host: string;
  title: string;
  metaDescription: string;
  ogImage: string;
  favicon: string;
  schemaTypes: string[];
  /** AI crawler name → allowed to read the site root. */
  crawlers: Record<string, boolean>;
  hasLlmsTxt: boolean;
  hasSitemap: boolean;
  /** Visible-text extract of the homepage, capped for the LLM pass. */
  textExtract: string;
};

/** Structured result of the single Claude analysis call. */
export type Analysis = {
  company: { name: string; one_liner: string; icp: string };
  buyer_prompts: { prompt: string; likely_cited: boolean; reason: string }[];
  money_keywords: { keyword: string; why_it_matters: string }[];
  /** Exact keyword strings selected from the real within-reach table (empty when no table given). */
  relevant_keywords: string[];
  google_commentary: string;
  opportunities: OpportunityItem[];
  buying_signals: SignalItem[];
  /** Candidate communities — subreddits get verified before they ship. */
  communities: { name: string; why: string; approx_members: number | null }[];
  content_readiness: number;
};

export type RankedKeywords = {
  totalKeywords: number;
  top10: number;
  /** Real rankings in positions 11-30, by volume — the "within reach" table. */
  withinReach: { keyword: string; position: number; volume: number }[];
};
