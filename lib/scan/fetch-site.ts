import "server-only";

import type { CheckId, SiteSnapshot } from "./types";

/**
 * Free deterministic pass: fetch the visitor's homepage plus the three files
 * that decide whether AI systems can read them at all, and extract everything
 * the report needs without any paid API. Regex parsing on purpose — no new
 * dependency for four well-formed lookups.
 */

const FETCH_TIMEOUT_MS = 6000;
const BODY_CAP = 512 * 1024;
const TEXT_EXTRACT_CAP = 24_000;

// A browser-like UA: too many company sites 403 unknown agents at the CDN,
// which would fail the scan before it starts. The scan runs at the visitor's
// own request, against their own site.
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36 PancakeScan/1.0";

export const AI_CRAWLERS = ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended"] as const;

async function fetchCapped(url: string): Promise<{ status: number; body: string } | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml,text/plain,*/*" },
      redirect: "follow",
      signal: ctrl.signal,
      cache: "no-store",
    });
    const body = (await res.text()).slice(0, BODY_CAP);
    return { status: res.status, body };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function metaContent(html: string, key: string): string {
  // Matches <meta property="og:image" content="..."> and name= variants, any attribute order.
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${key}["'][^>]*content=["']([^"']*)["']|<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${key}["']`,
    "i",
  );
  const m = html.match(re);
  return (m?.[1] ?? m?.[2] ?? "").trim();
}

function extractSchemaTypes(html: string): string[] {
  const types = new Set<string>();
  const blocks = html.match(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi) ?? [];
  for (const block of blocks) {
    Array.from(block.matchAll(/"@type"\s*:\s*"([^"]+)"/g)).forEach((m) => types.add(m[1]!));
  }
  return Array.from(types).slice(0, 8);
}

/**
 * Minimal robots.txt evaluation: for each AI crawler, use its own user-agent
 * section when one exists, otherwise the `*` section; blocked means a bare
 * `Disallow: /` in the governing section.
 */
function crawlerAccess(robotsTxt: string | null): Record<string, boolean> {
  const access: Record<string, boolean> = {};
  if (!robotsTxt) {
    for (const bot of AI_CRAWLERS) access[bot] = true;
    return access;
  }
  type Section = { agents: string[]; disallowAll: boolean };
  const sections: Section[] = [];
  let current: Section | null = null;
  for (const rawLine of robotsTxt.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, "").trim();
    const [field, ...rest] = line.split(":");
    if (!field || rest.length === 0) continue;
    const value = rest.join(":").trim();
    if (/^user-agent$/i.test(field.trim())) {
      if (!current || current.disallowAll || sections[sections.length - 1] !== current) {
        current = { agents: [], disallowAll: false };
        sections.push(current);
      }
      current.agents.push(value.toLowerCase());
    } else if (/^disallow$/i.test(field.trim()) && current) {
      if (value === "/") current.disallowAll = true;
    }
  }
  for (const bot of AI_CRAWLERS) {
    const specific = sections.find((s) => s.agents.includes(bot.toLowerCase()));
    const fallback = sections.find((s) => s.agents.includes("*"));
    access[bot] = !(specific ?? fallback)?.disallowAll;
  }
  return access;
}

function stripToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, TEXT_EXTRACT_CAP);
}

/** Returns null when the homepage itself is unreachable. */
export async function fetchSite(url: string, host: string): Promise<SiteSnapshot | null> {
  const origin = new URL(url).origin;
  const [home, robots, llms, sitemap] = await Promise.all([
    fetchCapped(url),
    fetchCapped(`${origin}/robots.txt`),
    fetchCapped(`${origin}/llms.txt`),
    fetchCapped(`${origin}/sitemap.xml`),
  ]);

  if (!home || home.status >= 400 || !home.body) return null;
  const html = home.body;

  const looksLikeText = (r: { status: number; body: string } | null) =>
    !!r && r.status === 200 && r.body.length > 0 && !r.body.trimStart().startsWith("<");

  const ogImage = metaContent(html, "og:image");
  return {
    url,
    host,
    title: (html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? "").trim().slice(0, 200),
    metaDescription: metaContent(html, "description").slice(0, 300),
    ogImage: /^https?:\/\//.test(ogImage) ? ogImage : "",
    favicon: `https://www.google.com/s2/favicons?domain=${host}&sz=64`,
    schemaTypes: extractSchemaTypes(html),
    crawlers: crawlerAccess(robots && robots.status === 200 ? robots.body : null),
    hasLlmsTxt: looksLikeText(llms),
    hasSitemap: !!sitemap && sitemap.status === 200 && sitemap.body.includes("<"),
    textExtract: stripToText(html),
  };
}

/** Fold the snapshot into the four readiness checks the UI flips through. */
export function deriveChecks(site: SiteSnapshot): { id: CheckId; pass: boolean; detail: string }[] {
  const blocked = AI_CRAWLERS.filter((b) => !site.crawlers[b]);
  const titleOk = site.title.length >= 15 && site.title.length <= 70;
  const descOk = site.metaDescription.length >= 50 && site.metaDescription.length <= 170;
  return [
    {
      id: "crawlers",
      pass: blocked.length === 0,
      detail:
        blocked.length === 0
          ? "AI crawlers get in. GPTBot and ClaudeBot can read you."
          : `${blocked.join(" and ")} blocked at the door. ChatGPT can't cite what it can't read.`,
    },
    {
      id: "llms",
      pass: site.hasLlmsTxt,
      detail: site.hasLlmsTxt
        ? "llms.txt found. You're ahead of most."
        : "No llms.txt. Easy win, 20 minutes of work.",
    },
    {
      id: "schema",
      pass: site.schemaTypes.length > 0,
      detail:
        site.schemaTypes.length > 0
          ? `schema.org markup in place (${site.schemaTypes.slice(0, 3).join(", ")}).`
          : "No structured data. Google is guessing what you sell.",
    },
    {
      id: "meta_quality",
      pass: titleOk && descOk,
      detail:
        titleOk && descOk
          ? "Titles and descriptions pull their weight."
          : !titleOk
            ? "Your title tag isn't selling anything."
            : "Your meta description is off-spec. Rewrite it for the click.",
    },
  ];
}
