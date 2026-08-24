import { FxPillLink } from "./FxPill";

/**
 * Landing nav — wordmark left, one app pill right. Port of the static
 * landing's header (same asset, same 44px wordmark, same primary button).
 * The pill goes straight to the app since launch (waitlist retired 2026-08-24).
 */
export function LandingNav() {
  return (
    <header className="lv2-nav">
      <div className="lv2-nav-inner">
        <a href="https://getpancake.ai/" className="lv2-nav-wordmark" aria-label="Pancake">
          {/* eslint-disable-next-line @next/next/no-img-element -- fixed-size brand asset, same treatment as the static landing */}
          <img src="/pancake-wordmark.png" alt="Pancake" />
        </a>
        <FxPillLink href="https://app.getpancake.ai" data-analytics-id="app_nav">
          Get started
        </FxPillLink>
      </div>
    </header>
  );
}
