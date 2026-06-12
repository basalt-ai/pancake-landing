/**
 * Customer logo marquee below the demo video (à la exa.ai's logo strip).
 * Official monochrome wordmarks live in `public/logos/`; each is painted
 * solid ink by using the asset as a CSS alpha mask over `currentColor`, so
 * future drop-ins stay on-palette whatever their source colors. The track
 * renders the set four times and a pure-CSS animation translates it by one
 * set width for a seamless infinite loop (no JS; static under
 * `prefers-reduced-motion`). Sizing is per-mark optical height, not uniform.
 */

import type { CSSProperties } from "react";

type CustomerLogo = {
  name: string;
  src: string;
  /** width / height of the artwork's viewBox — sizes the mask box. */
  ratio: number;
  /** Optical height in px at desktop scale — tuned per mark. */
  heightPx: number;
};

const LOGOS: CustomerLogo[] = [
  { name: "PromptLayer", src: "/logos/promptlayer.svg", ratio: 138.224 / 20.808, heightPx: 22 },
  { name: "FullEnrich", src: "/logos/fullenrich.svg", ratio: 131.165 / 24, heightPx: 32 },
  { name: "AgentMail", src: "/logos/agentmail.svg", ratio: 1986 / 363, heightPx: 30 },
  { name: "Hexa", src: "/logos/hexa.svg", ratio: 117.345 / 39.468, heightPx: 34 },
];

/** Four copies: (copies − 1) × set width must cover the widest viewports. */
const SET_COPIES = 4;

function logoStyle(logo: CustomerLogo): CSSProperties {
  return {
    WebkitMaskImage: `url(${logo.src})`,
    maskImage: `url(${logo.src})`,
    width: `calc(var(--home-logo-marquee-scale) * ${Math.round(logo.heightPx * logo.ratio)}px)`,
    height: `calc(var(--home-logo-marquee-scale) * ${logo.heightPx}px)`,
  };
}

export function HomeLogoMarquee() {
  return (
    <section className="home-logo-marquee" aria-label="Companies running on Pancake">
      <div className="home-logo-marquee__band">
        <div className="home-logo-marquee__track">
          {Array.from({ length: SET_COPIES }, (_, copy) => (
            <ul
              key={copy}
              className="home-logo-marquee__set"
              {...(copy > 0 ? { "aria-hidden": true } : {})}
            >
              {LOGOS.map((logo) => (
                <li key={logo.name} className="home-logo-marquee__item">
                  <span
                    className="home-logo-marquee__logo"
                    {...(copy === 0 ? { role: "img", "aria-label": logo.name } : {})}
                    style={logoStyle(logo)}
                  />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
