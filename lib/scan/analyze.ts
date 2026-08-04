import "server-only";

import type { Analysis, RankedKeywords, SiteSnapshot } from "./types";

/**
 * The single Claude call of the scan. Plain fetch against the Messages API —
 * no SDK dependency — using structured outputs (output_config.format) so the
 * response is guaranteed-valid JSON, with adaptive thinking at high effort.
 */

const API_URL = "https://api.anthropic.com/v1/messages";
const TIMEOUT_MS = 50_000;

// Structured-outputs schema: no minItems/maxItems/maxLength (unsupported
// constraints there) — item counts live in the descriptions instead.
const REPORT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "company",
    "buyer_prompts",
    "money_keywords",
    "google_commentary",
    "opportunities",
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
    google_commentary: {
      type: "string",
      description:
        "One or two sentences on their likely Google position, grounded in the evidence. Under 250 characters.",
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
    content_readiness: {
      type: "integer",
      description: "0-100: how well the site's content serves AI and search visibility today.",
    },
  },
} as const;

const SYSTEM = `You are the GTM analyst inside Pancake's free "AI GTM report" scan. A visitor entered their company's domain; you received an extract of their homepage and, sometimes, real Google ranking data.

Write for a founder with no marketing team. Warm, specific, confident, zero hype. Plain sentences. Never use the words revolutionize, unleash, supercharge, game-changer, or 10x. Never promise rankings or results. Every claim must be traceable to the evidence you were given.

Buyer prompts must read like real ChatGPT questions from someone who has never heard of this company — the way its actual buyers phrase things, in the language those buyers use (infer it from the site; a French site's buyers ask in French). Mix question types: best-tool-for-X, how-do-I-solve-Y, comparisons, and task-specific asks. money_keywords also go in the buyers' language. Every other field is written in English.

Opportunities must be specific to this company — name the actual gap you saw in the evidence (a missing llms.txt, page-2 keywords within reach, a buyer question no content answers), never generic advice.`;

export async function analyzeSite(
  site: SiteSnapshot,
  keywords: RankedKeywords | null,
): Promise<Analysis> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured");

  const keywordBlock = keywords
    ? `\n\nReal Google data (DataForSEO): ranks for ${keywords.totalKeywords} keywords, ${keywords.top10} in the top 10. Page-2 keywords within reach: ${keywords.page2
        .slice(0, 15)
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

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
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
          effort: "high",
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
    return analysis;
  } finally {
    clearTimeout(timer);
  }
}
