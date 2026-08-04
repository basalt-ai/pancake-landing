import { NextResponse } from "next/server";

import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { getCachedScan, setCachedScan } from "@/lib/scan/cache";
import { checkPromptOnChatGPT, isConfigured, rankedKeywords } from "@/lib/scan/dataforseo";
import { deriveChecks, fetchSite } from "@/lib/scan/fetch-site";
import { analyzeSite } from "@/lib/scan/analyze";
import { validateScanTarget } from "@/lib/scan/validate";
import type { Analysis, GoogleRow, RankedKeywords, ScanEvent } from "@/lib/scan/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 90;

/**
 * The free AI GTM report scan. One POST, one SSE stream: deterministic site
 * checks land in ~2s, the Claude "Brain" pass lands under 15s, real ChatGPT
 * citation checks trickle in behind (when DataForSEO is configured). Spend is
 * bounded by a per-IP limit, a global daily cap, a per-domain 24h cache, and
 * fixed per-scan API budgets — nothing loops, nothing retries a paid call.
 */

const RACE_KEYWORDS_MS = 8000;

function sseHeaders() {
  return {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  };
}

function computeScore(
  checks: { pass: boolean }[],
  citedCount: number,
  citationTotal: number,
  keywords: RankedKeywords | null,
  analysis: Analysis,
): number {
  const checkScore = (checks.filter((c) => c.pass).length / checks.length) * 100;
  const citationScore = citationTotal > 0 ? (citedCount / citationTotal) * 100 : analysis.content_readiness;
  const googleScore = keywords
    ? Math.min(100, keywords.top10 * 9 + (keywords.totalKeywords > 0 ? 15 : 0))
    : analysis.content_readiness;
  const blended = 0.25 * checkScore + 0.4 * citationScore + 0.35 * googleScore;
  return Math.min(97, Math.max(3, Math.round(blended)));
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const target = validateScanTarget(body.url);
  if (!target.ok) {
    return NextResponse.json({ error: target.reason }, { status: 400 });
  }

  const cached = await getCachedScan(target.host);
  const ip = getClientIp(request);

  if (!cached) {
    const perIp = rateLimit(`report:scan:${ip}`, 3, 10 * 60 * 1000);
    if (!perIp.ok) {
      return NextResponse.json(
        { error: "You're scanning fast. Give it a few minutes and try again." },
        { status: 429, headers: { "Retry-After": String(perIp.retryAfter) } },
      );
    }
    const dailyCap = Number(process.env.REPORT_DAILY_SCAN_CAP || 200);
    const daily = rateLimit("report:daily:global", dailyCap, 24 * 60 * 60 * 1000);
    if (!daily.ok) {
      return NextResponse.json(
        { error: "Today's free scans are all used up. Come back tomorrow." },
        { status: 429, headers: { "Retry-After": String(daily.retryAfter) } },
      );
    }
  }

  const encoder = new TextEncoder();
  const collected: ScanEvent[] = [];

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      const send = (ev: ScanEvent) => {
        if (closed) return;
        collected.push(ev);
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(ev)}\n\n`));
        } catch {
          closed = true; // client went away — stop pushing, let the scan wind down
        }
      };
      const finish = () => {
        if (closed) return;
        closed = true;
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      };

      // Cache hit: replay the identical event sequence, marked as cached.
      if (cached) {
        for (const ev of cached) {
          if (ev.type === "done") send({ ...ev, cached: true });
          else send(ev);
        }
        finish();
        return;
      }

      try {
        send({ type: "status", label: `Knocking on ${target.host}…` });

        // Rankings need only the domain — start alongside the site fetch.
        const keywordsPromise: Promise<RankedKeywords | null> = rankedKeywords(target.host);

        const site = await fetchSite(target.url, target.host);
        if (!site) {
          send({
            type: "error",
            code: "unreachable",
            message: `We knocked at ${target.host}. Nobody answered.`,
          });
          finish();
          return;
        }

        send({ type: "meta", title: site.title, ogImage: site.ogImage, favicon: site.favicon });
        send({ type: "status", label: "Checking who gets in: AI crawlers, llms.txt, structured data…" });
        const checks = deriveChecks(site);
        for (const check of checks) send({ type: "check", ...check });

        send({ type: "status", label: `Building a mini Brain for ${target.host}…` });
        const keywordsEarly = await Promise.race([
          keywordsPromise,
          new Promise<null>((r) => setTimeout(() => r(null), RACE_KEYWORDS_MS)),
        ]);

        send({
          type: "status",
          label: `Reading ${target.host}: what you sell, who buys, how they search…`,
        });
        const analysis = await analyzeSite(site, keywordsEarly);
        send({
          type: "brain",
          company: analysis.company.name || target.host,
          icp: analysis.company.icp,
          prompts: analysis.buyer_prompts.map((p) => p.prompt),
        });

        // Google card: real rankings when they arrived, Claude's read otherwise.
        const keywords = keywordsEarly ?? (await keywordsPromise);
        if (keywords) {
          const rows: GoogleRow[] = keywords.page2.map((k) => ({
            term: k.keyword,
            position: k.position,
            volume: k.volume,
            detail: `position ${k.position} · ${k.volume.toLocaleString()} searches/mo`,
          }));
          send({
            type: "google",
            rows,
            toWin: rows.length,
            commentary: `Ranks for ${keywords.totalKeywords.toLocaleString()} keywords, ${keywords.top10} in the top 10.`,
          });
        } else {
          send({
            type: "google",
            rows: analysis.money_keywords.map((k) => ({
              term: k.keyword,
              position: null,
              volume: null,
              detail: k.why_it_matters,
            })),
            toWin: analysis.money_keywords.length,
            estimated: true,
            commentary: analysis.google_commentary,
          });
        }

        send({ type: "status", label: "Asking ChatGPT what your buyers ask…" });

        // Citation checks: real ChatGPT answers when DataForSEO is configured,
        // Claude's per-prompt estimate otherwise. Fixed budget, fully parallel.
        let citedCount = 0;
        let liveCitations = 0;
        const prompts = analysis.buyer_prompts;
        const liveBudget = isConfigured()
          ? Math.min(prompts.length, Number(process.env.REPORT_PROMPTS_TO_CHECK || 10))
          : 0;

        await Promise.all(
          prompts.map(async (p, index) => {
            if (index < liveBudget) {
              const result = await checkPromptOnChatGPT(p.prompt, target.host, analysis.company.name);
              if (result) {
                if (result.cited) citedCount += 1;
                liveCitations += 1;
                send({
                  type: "citation",
                  index,
                  cited: result.cited,
                  detail: result.cited
                    ? "ChatGPT names you in this answer."
                    : result.citedDomains.length
                      ? `Cited instead: ${result.citedDomains.join(", ")}`
                      : "You don't come up in this answer.",
                });
                return;
              }
            }
            if (p.likely_cited) citedCount += 1;
            send({
              type: "citation",
              index,
              cited: p.likely_cited,
              detail: p.reason,
              estimated: true,
            });
          }),
        );

        send({ type: "status", label: "Adding it up…" });
        send({
          type: "opportunities",
          count: analysis.opportunities.length,
          items: analysis.opportunities,
        });
        send({
          type: "score",
          value: computeScore(checks, citedCount, prompts.length, keywords, analysis),
        });
        send({
          type: "done",
          domain: target.host,
          // "live" only when live data actually landed — keys being configured
          // isn't enough (e.g. an unverified DataForSEO account 403s every call).
          mode: keywords || liveCitations > 0 ? "live" : "estimated",
        });

        await setCachedScan(target.host, collected);
      } catch (err) {
        console.error("Report scan failed:", err);
        send({
          type: "error",
          code: "failed",
          message: "The scan tripped on our side. Your site is fine. Run it again.",
        });
      } finally {
        finish();
      }
    },
  });

  return new Response(stream, { headers: sseHeaders() });
}
