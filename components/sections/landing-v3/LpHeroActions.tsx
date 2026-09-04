"use client";

import { LpFxLink, LpFxPill } from "./LpFxButton";
import { useAudience } from "./LpAudience";

export function LpHeroActions() {
  const { audience } = useAudience();
  return <div className="lp-hero-btns">
    {audience === "humans" ? <>
      <LpFxLink href="https://app.getpancake.ai" data-analytics-id="app_hero">Start free</LpFxLink>
      <LpFxPill className="lp-btn--tinted lp-btn--demo lp-hero-call" data-lv2-open="call" data-analytics-id="call_hero">Book a demo</LpFxPill>
    </> : <>
      <LpFxLink href="#agent-setup">Get setup</LpFxLink>
      <LpFxLink href="/agents" className="lp-btn--tinted">Read guide</LpFxLink>
    </>}
  </div>;
}
