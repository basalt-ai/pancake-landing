import { LpFxLink } from "@/components/sections/landing-v3/LpFxButton";

// Landing v3 — Hero (Figma node 4257:4906, 1654×758).
// The rainbow art is one pre-composited grouped SVG anchored at PAGE top-left
// (it covers the nav band + hero); the section overflows it above via top:-120px.
export function LpHero() {
  return (
    <section className="lp-hero" aria-labelledby="lp-hero-title">
      <img
        className="lp-hero-art"
        src="/lp/lp-pancakes-hero.svg"
        alt=""
        width={1654}
        height={1417}
      />
      <div className="lp-hero-inner">
        <h1 id="lp-hero-title" className="lp-hero-title lp-display">
          You run your company
          <br />
          We bring you customers
        </h1>
        <div className="lp-hero-col">
          <p className="lp-hero-lede">
            Pancake’s AI agents monitor buying signals, find warm leads, grow
            your AI search visibility, and learn from every interaction.
          </p>
          <LpFxLink href="https://app.getpancake.ai" data-analytics-id="app_hero">
            Get started
          </LpFxLink>
        </div>
      </div>
    </section>
  );
}
