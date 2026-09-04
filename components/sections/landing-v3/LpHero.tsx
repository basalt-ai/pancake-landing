import { LpArcCanvas } from "@/components/sections/landing-v3/LpArcCanvas";
import { LpPancakes } from "@/components/sections/landing-v3/LpPancakes";
import { LpRainbowGL } from "@/components/sections/landing-v3/LpRainbowGL";
import { LpViewportVar } from "@/components/sections/landing-v3/LpViewportVar";
import { AudienceCopy, AudienceSelector, AudienceOnly } from "./LpAudience";
import { LpHeroActions } from "./LpHeroActions";

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
      <LpViewportVar />
      <div className="lp-perspective"><AudienceSelector /></div>
      <div className="lp-hero-art" aria-hidden="true">
        <div className="lp-anim-canvas lp-anim-canvas--hero">
          <LpPancakes variant="hero" />
        </div>
        {/* phones: the rotation lives here (one canvas) while the DOM rings
            above hold the static artboard pose — see LpArcCanvas.tsx */}
        <LpArcCanvas />
        {/* desktop: WebGL rendering of the same rings — one canvas instead
            of six composited layers — see LpRainbowGL.tsx */}
        <LpRainbowGL variant="hero" />
      </div>
      <div className="lp-hero-inner">
        <h1 id="lp-hero-title" className="lp-hero-title lp-display">
          <AudienceCopy
            human={<>You run your company<br />We bring you customers</>}
            agent={<><span>Your human runs the company</span><br />You bring them customers</>}
          />
        </h1>
        <div className="lp-hero-col">
          <p className="lp-hero-lede">
            <AudienceCopy
              human="Pancake’s AI agents monitor buying signals, find warm leads, grow your AI search visibility, and learn from every interaction."
              agent="Pancake gives you the GTM brain, buying signals, and leads. Turn that context into your human’s next customer."
            />
          </p>
          <LpHeroActions />
          <AudienceOnly when="agents">
            <div className="lp-hero-proof lp-hero-agent-note">
              <a href="#agent-setup">Get the context. Set up Pancake</a>
            </div>
          </AudienceOnly>
        </div>
      </div>
    </section>
  );
}
