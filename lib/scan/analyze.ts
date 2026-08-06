import "server-only";

import type { Analysis, RankedKeywords, SiteSnapshot } from "./types";

/**
 * The single Claude call of the scan. Plain fetch against the Messages API —
 * no SDK dependency — using structured outputs (output_config.format) so the
 * response is guaranteed-valid JSON, with adaptive thinking at high effort.
 */

const API_URL = "https://api.anthropic.com/v1/messages";
// First attempt gets high effort; a cold serverless instance compiles the
// output schema on top of generation and can blow past one budget, so a
// second, faster attempt backs it up instead of failing the whole scan.
const ATTEMPTS: { effort: "high" | "medium"; timeoutMs: number }[] = [
  { effort: "high", timeoutMs: 55_000 },
  { effort: "medium", timeoutMs: 40_000 },
];

// Structured-outputs schema: no minItems/maxItems/maxLength (unsupported
// constraints there) — item counts live in the descriptions instead.
const REPORT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "company",
    "buyer_prompts",
    "money_keywords",
    "relevant_keywords",
    "google_commentary",
    "opportunities",
    "buying_signals",
    "communities",
    "content_readiness",
  ],
  properties: {
    company: {
      type: "object",
      additionalProperties: false,
      required: ["name", "one_liner", "icp"],
      properties: {
        name: { type: "string" },
        one_liner: { type: "string", description: "What they do, one plain sentence." },
        icp: {
          type: "string",
          description:
            "Their ideal customer in one line, e.g. 'ops leads at 20-200 person logistics companies'.",
        },
      },
    },
    buyer_prompts: {
      type: "array",
      description:
        "Exactly 10 questions this company's ideal buyers genuinely type into ChatGPT when shopping for a solution. Category questions, not brand questions — the buyer doesn't know this company yet. Each prompt under 400 characters.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["prompt", "likely_cited", "reason"],
        properties: {
          prompt: { type: "string" },
          likely_cited: {
            type: "boolean",
            description: "Best estimate: would ChatGPT cite this company today for this question?",
          },
          reason: { type: "string", description: "One short sentence, under 150 characters." },
        },
      },
    },
    money_keywords: {
      type: "array",
      description:
        "3 to 5 Google searches with real buying intent this company should own, in the language its buyers search in.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["keyword", "why_it_matters"],
        properties: {
          keyword: { type: "string" },
          why_it_matters: { type: "string", description: "One short clause, under 120 characters." },
        },
      },
    },
    relevant_keywords: {
      type: "array",
      description:
        "From the real within-reach keyword table you were given (if any): up to 8 EXACT keyword strings, most valuable first, that a real buyer of THIS company's own offer would type. Prefer searches that describe the company's category or service. Never include two variants of the same search (singular/plural, near-identical wording) — keep only the strongest one. Exclude third-party brand names, product names the company doesn't own, people, and unrelated topics — a marketplace ranking for its sellers' brand names must not list those. Empty array when no table was provided or nothing qualifies.",
      items: { type: "string" },
    },
    google_commentary: {
      type: "string",
      description:
        "One punchy sentence, under 110 characters, plain words — what the numbers mean for this company and what's up for grabs. e.g. \"Mostly your sellers' brand names — the wholesale searches that matter are still open.\" No jargon, no position ranges. In English.",
    },
    opportunities: {
      type: "array",
      description: "3 or 4 concrete opportunities, most impactful first.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "detail"],
        properties: {
          title: { type: "string", description: "Under 70 characters." },
          detail: {
            type: "string",
            description:
              "One or two specific sentences naming what to do and why it wins. Under 220 characters.",
          },
        },
      },
    },
    buying_signals: {
      type: "array",
      description:
        "Exactly 4 observable events that mean a specific company or person is about to need THIS product — buying signals to monitor, never a list of leads. Strong-signal bar: each must be a dated, public EVENT (posted a job, raised a round, opened a location, got a review naming the pain, switched tools), never a static attribute (industry, company size). Most predictive first.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["signal", "why", "where"],
        properties: {
          signal: {
            type: "string",
            description:
              "The event, under 75 characters, concrete and monitorable. Starts with a capital. e.g. 'A clinic posts a job for a medical secretary'.",
          },
          why: {
            type: "string",
            description:
              "Why this event predicts a purchase of this company's product, under 130 characters.",
          },
          where: {
            type: "string",
            description:
              "The public place to watch it, under 55 characters. e.g. 'LinkedIn Jobs', 'Crunchbase funding feed', 'Google Maps reviews'.",
          },
        },
      },
    },
    communities: {
      type: "array",
      description:
        "3 to 4 REAL subreddits where this company's ICP asks for advice — Reddit ONLY, exact names ('r/...'), never Facebook groups, forums, Slack or Discord. Pick for the ICP's language and geography when such subreddits exist; otherwise the closest active English ones. ONLY subreddits you are confident actually exist and are active — never invent or guess names. These get teased as 'where your buyers already ask' — AI answers quote Reddit threads heavily, so they are also an AI-visibility surface.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "why", "approx_members"],
        properties: {
          name: { type: "string", description: "Exact community name, e.g. 'r/msp'." },
          why: {
            type: "string",
            description: "What buyers ask there, under 110 characters. Starts with a capital.",
          },
          approx_members: {
            type: ["integer", "null"],
            description:
              "Approximate member count, only for a well-known community whose size you are genuinely confident about (a round number, e.g. 2500000). It is shown to users with a ~ prefix. null when unsure — a wrong figure is worse than none.",
          },
        },
      },
    },
    content_readiness: {
      type: "integer",
      description: "0-100: how well the site's content serves AI and search visibility today.",
    },
  },
} as const;

const SYSTEM = `You are the GTM analyst inside Pancake's free "AI GTM report" scan. A visitor entered their company's domain; you received an extract of their homepage and, sometimes, real Google ranking data.

Write for a founder with no marketing team. Warm, specific, confident, zero hype. Plain sentences. Never use the words revolutionize, unleash, supercharge, game-changer, or 10x. Never promise rankings or results. Every claim must be traceable to the evidence you were given.

Buyer prompts must read like real ChatGPT questions from someone who has never heard of this company — the way its actual buyers phrase things, in the language those buyers use (infer it from the site; a French site's buyers ask in French). Mix question types: best-tool-for-X, how-do-I-solve-Y, comparisons, and task-specific asks. money_keywords also go in the buyers' language. Every other field is written in English.

Opportunities must be specific to this company — name the actual gap you saw in the evidence (a missing llms.txt, page-2 keywords within reach, a buyer question no content answers), never generic advice.

Buying signals are the outbound dimension of the report: observable public events someone could genuinely monitor this week, tied to THIS company's offer. Think like a GTM engineer: what happens in the world right before someone needs this product? Communities are subreddits only, real and specific to the ICP — a niche subreddit the buyers actually read beats a giant generic one.`;

export async function analyzeSite(
  site: SiteSnapshot,
  keywords: RankedKeywords | null,
): Promise<Analysis> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured");

  const keywordBlock = keywords
    ? `\n\nReal Google data (DataForSEO): ranks for ${keywords.totalKeywords} keywords, ${keywords.top10} in the top 10. Within-reach keywords (positions 11-30, by volume): ${keywords.withinReach
        .slice(0, 40)
        .map((k) => `"${k.keyword}" (pos ${k.position}, ${k.volume}/mo)`)
        .join(", ")}`
    : "\n\nNo Google ranking data available — estimate from the site content alone.";

  const user = `Domain: ${site.host}
Title tag: ${site.title || "(none)"}
Meta description: ${site.metaDescription || "(none)"}
schema.org types: ${site.schemaTypes.join(", ") || "(none)"}
AI crawler access: ${Object.entries(site.crawlers)
    .map(([k, v]) => `${k}=${v ? "allowed" : "blocked"}`)
    .join(", ")}
llms.txt: ${site.hasLlmsTxt ? "present" : "missing"} · sitemap.xml: ${site.hasSitemap ? "present" : "missing"}

Homepage text extract:
${site.textExtract}${keywordBlock}`;

  let lastError: unknown;
  for (const attempt of ATTEMPTS) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), attempt.timeoutMs);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5",
          max_tokens: 16000,
          system: SYSTEM,
          messages: [{ role: "user", content: user }],
          output_config: {
            effort: attempt.effort,
            format: { type: "json_schema", schema: REPORT_SCHEMA },
          },
        }),
        signal: ctrl.signal,
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error(`Anthropic API ${res.status}: ${(await res.text()).slice(0, 300)}`);
      }
      const data = (await res.json()) as {
        content: { type: string; text?: string }[];
        stop_reason?: string;
      };
      if (data.stop_reason === "refusal") {
        throw new Error("Anthropic response was a refusal");
      }
      const block = data.content.find((b) => b.type === "text" && b.text);
      if (!block?.text) throw new Error("Anthropic response had no text block");
      const analysis = JSON.parse(block.text) as Analysis;
      // Structured outputs guarantee shape, not counts — enforce the budget here.
      analysis.buyer_prompts = analysis.buyer_prompts.slice(0, 10);
      analysis.money_keywords = analysis.money_keywords.slice(0, 5);
      analysis.opportunities = analysis.opportunities.slice(0, 4);
      analysis.relevant_keywords = (analysis.relevant_keywords ?? []).slice(0, 8);
      analysis.buying_signals = (analysis.buying_signals ?? []).slice(0, 4);
      analysis.communities = (analysis.communities ?? []).slice(0, 4);
      return analysis;
    } catch (err) {
      lastError = err;
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError;
}
