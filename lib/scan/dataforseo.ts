import "server-only";

import type { RankedKeywords } from "./types";

/**
 * Thin DataForSEO client — two endpoints only, both optional. When the env
 * vars are absent every function degrades to null and the scan runs in
 * "estimated" mode off Claude's own judgment, so the app ships and demos
 * before the DataForSEO account exists.
 */

const BASE = "https://api.dataforseo.com/v3";

export function isConfigured(): boolean {
  return !!(process.env.DATAFORSEO_LOGIN && process.env.DATAFORSEO_PASSWORD);
}

function authHeader(): string {
  const token = Buffer.from(
    `${process.env.DATAFORSEO_LOGIN}:${process.env.DATAFORSEO_PASSWORD}`,
  ).toString("base64");
  return `Basic ${token}`;
}

async function post(path: string, task: Record<string, unknown>, timeoutMs: number) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { Authorization: authHeader(), "Content-Type": "application/json" },
      body: JSON.stringify([task]),
      signal: ctrl.signal,
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      tasks?: { status_code: number; result?: unknown[] }[];
    };
    const t = data.tasks?.[0];
    if (!t || t.status_code >= 40000) return null;
    return t.result?.[0] ?? null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Geo by TLD: a .fr domain's money searches live in Google France in French,
 * not Google US — querying the wrong market returns junk. Default is US.
 */
const GEO: Record<string, { location_code: number; language_name: string }> = {
  fr: { location_code: 2250, language_name: "French" },
  be: { location_code: 2056, language_name: "French" },
  de: { location_code: 2276, language_name: "German" },
  at: { location_code: 2040, language_name: "German" },
  ch: { location_code: 2756, language_name: "German" },
  es: { location_code: 2724, language_name: "Spanish" },
  it: { location_code: 2380, language_name: "Italian" },
  nl: { location_code: 2528, language_name: "Dutch" },
  pt: { location_code: 2620, language_name: "Portuguese" },
  br: { location_code: 2076, language_name: "Portuguese" },
  uk: { location_code: 2826, language_name: "English" },
  au: { location_code: 2036, language_name: "English" },
  ca: { location_code: 2124, language_name: "English" },
};

export function geoForHost(host: string): { location_code: number; language_name: string } {
  const tld = host.endsWith(".co.uk") ? "uk" : (host.split(".").pop() ?? "");
  return GEO[tld] ?? { location_code: 2840, language_name: "English" };
}

/** Keywords the domain already ranks for, ordered by search volume. */
export async function rankedKeywords(host: string): Promise<RankedKeywords | null> {
  if (!isConfigured()) return null;
  const geo = geoForHost(host);
  const result = (await post(
    "/dataforseo_labs/google/ranked_keywords/live",
    {
      target: host,
      language_name: geo.language_name,
      location_code: geo.location_code,
      limit: 100,
      order_by: ["keyword_data.keyword_info.search_volume,desc"],
    },
    9000,
  )) as {
    total_count?: number;
    items?: {
      keyword_data?: { keyword?: string; keyword_info?: { search_volume?: number } };
      ranked_serp_element?: { serp_item?: { rank_absolute?: number } };
    }[];
  } | null;

  if (!result?.items) return null;
  const rows = result.items
    .map((it) => ({
      keyword: it.keyword_data?.keyword ?? "",
      position: it.ranked_serp_element?.serp_item?.rank_absolute ?? 0,
      volume: it.keyword_data?.keyword_info?.search_volume ?? 0,
    }))
    .filter((r) => r.keyword && r.position > 0);

  return {
    totalKeywords: result.total_count ?? rows.length,
    top10: rows.filter((r) => r.position <= 10).length,
    page2: rows.filter((r) => r.position >= 11 && r.position <= 20).slice(0, 25),
  };
}

export type CitationResult = {
  cited: boolean;
  citedDomains: string[];
};

/**
 * Ask a real ChatGPT (via DataForSEO's AI Optimization API) one buyer question
 * and check whether the scanned company shows up in the answer or its sources.
 */
export async function checkPromptOnChatGPT(
  prompt: string,
  host: string,
  brand: string,
): Promise<CitationResult | null> {
  if (!isConfigured()) return null;
  const result = (await post(
    "/ai_optimization/chat_gpt/llm_responses/live",
    {
      user_prompt: prompt.slice(0, 500),
      model_name: process.env.DATAFORSEO_CHATGPT_MODEL || "gpt-4o-mini",
      web_search: true,
      max_output_tokens: 1024,
    },
    30_000,
  )) as {
    items?: {
      sections?: { text?: string; annotations?: { url?: string }[] }[];
    }[];
  } | null;

  const sections = result?.items?.flatMap((i) => i.sections ?? []) ?? [];
  if (!sections.length) return null;

  const text = sections.map((s) => s.text ?? "").join(" ");
  const urls = sections.flatMap((s) => (s.annotations ?? []).map((a) => a.url ?? ""));
  const domains = Array.from(
    new Set(
      urls
        .map((u) => {
          try {
            return new URL(u).hostname.replace(/^www\./, "");
          } catch {
            return "";
          }
        })
        .filter(Boolean),
    ),
  );

  const brandRe = new RegExp(brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  const cited = domains.includes(host) || brandRe.test(text);
  // Search engines and generic platforms aren't competitors — noise in "cited instead".
  const NOISE = new Set(["google.com", "bing.com", "youtube.com", "wikipedia.org", "reddit.com"]);
  return { cited, citedDomains: domains.filter((d) => d !== host && !NOISE.has(d)).slice(0, 3) };
}
