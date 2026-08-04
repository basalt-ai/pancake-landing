/**
 * Wire contract for the /report scan. The API route emits these over SSE and
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

export type ScanEvent =
  | { type: "status"; label: string }
  | { type: "meta"; title?: string; ogImage?: string; favicon?: string }
  | { type: "check"; id: CheckId; pass: boolean; detail: string }
  | { type: "brain"; company: string; icp: string; prompts: string[] }
  | {
      type: "citation";
      index: number;
      cited: boolean;
      detail: string;
      estimated?: boolean;
    }
  | {
      type: "google";
      rows: GoogleRow[];
      toWin: number;
      estimated?: boolean;
      commentary?: string;
    }
  | { type: "opportunities"; count: number; items: OpportunityItem[] }
  | { type: "score"; value: number }
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
  /** Exact keyword strings selected from the real page-2 table (empty when no table given). */
  relevant_page2_keywords: string[];
  google_commentary: string;
  opportunities: OpportunityItem[];
  content_readiness: number;
};

export type RankedKeywords = {
  totalKeywords: number;
  top10: number;
  page2: { keyword: string; position: number; volume: number }[];
};
