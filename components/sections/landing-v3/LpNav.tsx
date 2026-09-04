import { LpFxLink } from "@/components/sections/landing-v3/LpFxButton";
import { LpNavMenu } from "@/components/sections/landing-v3/LpNavMenu";
import { LpNavScroll } from "@/components/sections/landing-v3/LpNavScroll";

/**
 * Landing v3 — Nav (Figma node 4257:4894, 1654×120).
 * Logo left edge 179px, links dead-center, dark CTA right-anchored at the
 * same 179px margin (= the 1296 content grid's side margin at 1654).
 * Link targets are provisional (not specified in Figma) — flagged in the PR.
 * CTA pair (founder 2026-09-03): "Start free" then "Book a demo", the
 * hero's order, on every surface — the artboard bar drew one pill.
 * ≤767px (Figma mobile node 4389:8182): logo + burger only — links and the
 * pill move into LpNavMenu's sheet; the pill keeps its app_nav id there.
 * `inverted` (the /agents negative): the cream wordmark instead of the plum
 * one — the footer's export IS the nav lockup scaled ×2.0849 (same path,
 * fill ink-20), so no new asset. Everything else recolors through tokens.
 */
export function LpNav({ inverted = false }: { inverted?: boolean }) {
  return (
    <header className="lp-nav">
      <a className="lp-nav-logo" href="/" aria-label="Pancake home">
        <img
          alt=""
          src={inverted ? "/lp/lp-footer-logo.svg" : "/lp/lp-nav-logo.svg"}
          width={114.956}
          height={56}
        />
      </a>
      <nav className="lp-nav-links" aria-label="Primary">
        <a href="/#how-it-works">Product</a>
        <a href="/#why">Company</a>
        <a href="/blog">Blog</a>
      </nav>
      <div className="lp-nav-ctas">
        <LpFxLink
          href="https://app.getpancake.ai"
          size="sm"
          data-analytics-id="app_nav"
        >
          Start free
        </LpFxLink>
        {/* Same trigger contract as the sheet's pill: LpModals' document
            listener turns the zcal href into the dialog on pages that mount
            it; elsewhere it opens zcal in a new tab. Hidden ≤767 (nav.css) —
            the bar has room for one pill, the sheet carries both. */}
        <LpFxLink
          href="https://zcal.co/i/ZEHl48rv"
          size="sm"
          className="lp-btn--tinted lp-btn--demo"
          target="_blank"
          rel="noopener noreferrer"
          data-lv2-open="call"
          data-analytics-id="call_nav"
        >
          Book a demo
        </LpFxLink>
      </div>
      <LpNavMenu />
      <LpNavScroll />
    </header>
  );
}
