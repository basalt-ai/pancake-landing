import { LpFxLink } from "@/components/sections/landing-v3/LpFxButton";
import { LpPancakes } from "@/components/sections/landing-v3/LpPancakes";

// Landing v3 — Hero (Figma node 4257:4906, 1654×758).
// The rainbow art (animated per-arc pancakes group, anim.css) lives in a
// 1654×1417 canvas anchored at PAGE top-left (it covers the nav band + hero);
// the section overflows it above via top:-120px. The 2622×1478 pancakes
// container sits at (-435, -61.65) in that canvas (hero-frame center
// (876, 557.35) per Figma node 4257:4907, +120px nav offset). hero.css keeps
// sizing/clip on .lp-hero-art exactly as it did for the old <img>.
export function LpHero() {
  return (
    <section className="lp-hero" aria-labelledby="lp-hero-title">
      <div className="lp-hero-art" aria-hidden="true">
        <div className="lp-anim-canvas lp-anim-canvas--hero">
          <LpPancakes variant="hero" />
        </div>
      </div>
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
