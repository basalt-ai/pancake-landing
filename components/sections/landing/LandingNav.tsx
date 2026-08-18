import { FxPill } from "./FxPill";

/**
 * Landing nav — wordmark left, one waitlist pill right. Port of the static
 * landing's header (same asset, same 44px wordmark, same primary button).
 */
export function LandingNav() {
  return (
    <header className="lv2-nav">
      <div className="lv2-nav-inner">
        <a href="https://getpancake.ai/" className="lv2-nav-wordmark" aria-label="Pancake">
          {/* eslint-disable-next-line @next/next/no-img-element -- fixed-size brand asset, same treatment as the static landing */}
          <img src="/pancake-wordmark.png" alt="Pancake" />
        </a>
        <FxPill data-lv2-open="waitlist" data-analytics-id="waitlist_nav">
          Join waitlist
        </FxPill>
      </div>
    </header>
  );
}
