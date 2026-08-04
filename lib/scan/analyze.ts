import "server-only";

import type { Analysis, RankedKeywords, SiteSnapshot } from "./types";

/**
 * The single Claude call of the scan. Plain fetch against the Messages API —
 * no SDK dependency — with a forced tool call so the response is guaranteed
 * to be one JSON object matching REPORT_SCHEMA.
 */

const API_URL = "https://api.anthropic.com/v1/messages";
const TIMEOUT_MS = 25_000;

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
          description: "Their ideal customer in one line, e.g. 'ops leads at 20-200 person logistics companies'.",
        },
      },
    },
    buyer_prompts: {
      type: "array",
      minItems: 10,
      maxItems: 10,
      description:
        "Ten questions this company's ideal buyers genuinely type into ChatGPT when shopping for a solution. Category questions, not brand questions — the buyer doesn't know this company yet.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["prompt", "likely_cited", "reason"],
        properties: {
          prompt: { type: "string", maxLength: 450 },
          likely_cited: {
            type: "boolean",
            description: "Best estimate: would ChatGPT cite this company today for this question?",
          },
          reason: { type: "string", maxLength: 200 },
        },
      },
    },
    money_keywords: {
      type: "array",
      minItems: 3,
      maxItems: 5,
      description: "Google searches with real buying intent this company should own.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["keyword", "why_it_matters"],
        properties: {
          keyword: { type: "string" },
          why_it_matters: { type: "string", maxLength: 160 },
        },
      },
    },
    google_commentary: {
      type: "string",
      maxLength: 300,
      description: "One or two sentences on their likely Google position, grounded in the evidence.",
    },
    opportunities: {
      type: "array",
      minItems: 3,
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "detail"],
        properties: {
          title: { type: "string", maxLength: 80 },
          detail: { type: "string", maxLength: 220 },
        },
      },
    },
    content_readiness: {
      type: "integer",
      minimum: 0,
      maximum: 100,
      description: "How well the site's content serves AI and search visibility today.",
    },
  },
} as const;

const SYSTEM = `You are the GTM analyst inside Pancake's free "AI GTM report" scan. A visitor entered their company's domain; you received an extract of their homepage and, sometimes, real Google ranking data.

Write for a founder with no marketing team. Warm, specific, confident, zero hype. Plain sentences. Never use the words revolutionize, unleash, supercharge, game-changer, or 10x. Never promise rankings or results. Every claim must be traceable to the evidence you were given. Buyer prompts must read like real ChatGPT questions from someone who has never heard of this company.`;

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
        model: process.env.ANTHROPIC_MODEL || "claude-haiku-4-5",
        max_tokens: 3000,
        system: SYSTEM,
        messages: [{ role: "user", content: user }],
        tools: [
          {
            name: "deliver_report",
            description: "Deliver the structured GTM report for this company.",
            input_schema: REPORT_SCHEMA,
          },
        ],
        tool_choice: { type: "tool", name: "deliver_report" },
      }),
      signal: ctrl.signal,
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Anthropic API ${res.status}: ${(await res.text()).slice(0, 300)}`);
    }
    const data = (await res.json()) as {
      content: { type: string; input?: unknown }[];
    };
    const block = data.content.find((b) => b.type === "tool_use");
    if (!block?.input) throw new Error("Anthropic response had no tool_use block");
    return block.input as Analysis;
  } finally {
    clearTimeout(timer);
  }
}
