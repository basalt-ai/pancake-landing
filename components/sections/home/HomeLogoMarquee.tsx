/**
 * Logo marquees below the demo video (à la exa.ai's logo strip) — two labeled
 * groups side by side: "Trusted by" (customers) and "Powered by" (partners).
 * Official monochrome wordmarks live in `public/logos/`; each is painted
 * solid ink by using the asset as a CSS alpha mask over `currentColor`, so
 * future drop-ins stay on-palette whatever their source colors. Every track
 * renders its set four times and a pure-CSS animation translates it by one
 * set width for a seamless infinite loop (no JS; static under
 * `prefers-reduced-motion`, paused on hover/focus). Sizing is per-mark
 * optical height, not uniform.
 */

import type { CSSProperties } from "react";

type MarqueeLogo = {
  name: string;
  src: string;
  /** width / height of the artwork's viewBox — sizes the mask box. */
  ratio: number;
  /** Optical height in px at desktop scale — tuned per mark. */
  heightPx: number;
};

const TRUSTED_BY: MarqueeLogo[] = [
  { name: "PromptLayer", src: "/logos/promptlayer.svg", ratio: 138.224 / 20.808, heightPx: 22 },
  { name: "FullEnrich", src: "/logos/fullenrich.svg", ratio: 131.165 / 24, heightPx: 32 },
  { name: "Hexa", src: "/logos/hexa.svg", ratio: 117.345 / 39.468, heightPx: 34 },
  { name: "Kinro", src: "/logos/kinro.svg", ratio: 550.16 / 134.94, heightPx: 30 },
];

const POWERED_BY: MarqueeLogo[] = [
  { name: "Exa", src: "/logos/exa.svg", ratio: 277.273 / 100, heightPx: 32 },
  { name: "Anchor Browser", src: "/logos/anchorbrowser.svg", ratio: 115.674 / 20, heightPx: 27 },
  { name: "AgentMail", src: "/logos/agentmail.svg", ratio: 1986 / 363, heightPx: 30 },
  { name: "LiteLLM", src: "/logos/litellm.svg", ratio: 3538 / 735, heightPx: 24 },
];

/** Four copies: (copies − 1) × set width must cover the widest bands. */
const SET_COPIES = 4;

function logoStyle(logo: MarqueeLogo): CSSProperties {
  return {
    WebkitMaskImage: `url(${logo.src})`,
    maskImage: `url(${logo.src})`,
    width: `calc(var(--home-logo-marquee-scale) * ${Math.round(logo.heightPx * logo.ratio)}px)`,
    height: `calc(var(--home-logo-marquee-scale) * ${logo.heightPx}px)`,
  };
}

function MarqueeGroup({
  label,
  logos,
  trackModifier,
}: {
  label: string;
  logos: MarqueeLogo[];
  trackModifier?: string;
}) {
  return (
    <div className="home-logo-marquee__group">
      <p className="home-logo-marquee__label">{label}</p>
      <div className="home-logo-marquee__band">
        <div className={`home-logo-marquee__track${trackModifier ? ` ${trackModifier}` : ""}`}>
          {Array.from({ length: SET_COPIES }, (_, copy) => (
            <ul
              key={copy}
              className="home-logo-marquee__set"
              {...(copy > 0 ? { "aria-hidden": true } : {})}
            >
              {logos.map((logo) => (
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
    </div>
  );
}

export function HomeLogoMarquee() {
  return (
    <section className="home-logo-marquee" aria-label="Customers and partners">
      <div className="home-logo-marquee__row">
        <MarqueeGroup label="Trusted by" logos={TRUSTED_BY} />
        <MarqueeGroup
          label="Powered by"
          logos={POWERED_BY}
          trackModifier="home-logo-marquee__track--powered"
        />
      </div>
    </section>
  );
}
