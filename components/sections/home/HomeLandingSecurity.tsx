/**
 * Home — “Secure by design” section (replaces the former “Naturally works
 * as you'd expect” features section; same card skeleton).
 *
 * Three cards, each with a 96×96 layered pancake icon (a "side" SVG + a
 * smaller "top" SVG stacked on top, with a glyph overlay):
 *  - lock   — purple pancake, data stays in your pod
 *  - shield — pink pancake, least-privilege + approval gates
 *  - key    — peach pancake, secrets live in the vault
 *
 * Pancake side/top paths are the original Figma exports in `public/features/`;
 * the lock/shield/key glyphs are hand-drawn in the same stroke idiom as
 * `feature-network.svg`. CSS classes keep the `home-landing-features` block
 * name — the styles are content-agnostic and renaming ~15 selectors would be
 * churn for no reader value.
 */

type SecurityCard = {
  id: string;
  pancakeSide: string;
  pancakeTop: string;
  /** Glyph overlaid on the pancake. */
  overlay: { kind: "icon"; src: string; w: number; h: number; left: number; top: number };
  title: string;
  body: string;
};

const SECURITY_CARDS: SecurityCard[] = [
  {
    id: "pod",
    pancakeSide: "/features/feature-ctx-side.svg",
    pancakeTop: "/features/feature-ctx-top.svg",
    overlay: { kind: "icon", src: "/features/feature-lock.svg", w: 34, h: 40, left: 31, top: 22 },
    title: "Nothing leaves your pod",
    body: "Your data runs in your own sandbox and never phones home. Memory is scoped to your workspace, controlled by you.",
  },
  {
    id: "privilege",
    pancakeSide: "/features/feature-md-side.svg",
    pancakeTop: "/features/feature-md-top.svg",
    overlay: { kind: "icon", src: "/features/feature-shield.svg", w: 34, h: 40, left: 31, top: 22 },
    title: "Least privilege by default",
    body: "Agents only reach the tools you’ve connected. Anything destructive stops and waits for your explicit approval.",
  },
  {
    id: "vault",
    pancakeSide: "/features/feature-247-side.svg",
    pancakeTop: "/features/feature-247-top.svg",
    overlay: { kind: "icon", src: "/features/feature-key.svg", w: 40, h: 40, left: 28, top: 22 },
    title: "Secrets stay sealed",
    body: "Credentials live in an encrypted vault, referenced by path, never by value. Nothing sensitive ever touches the chat.",
  },
];

export function HomeLandingSecurity() {
  return (
    <div className="home-landing-features">
      {SECURITY_CARDS.map((card) => (
        <article key={card.id} className="home-landing-feature-card">
          <div
            className="home-landing-feature-card__pancake"
            data-feature={card.id}
            aria-hidden
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- Figma SVG export */}
            <img
              className="home-landing-feature-card__pancake-side"
              src={card.pancakeSide}
              alt=""
              width={96}
              height={96}
            />
            {/* eslint-disable-next-line @next/next/no-img-element -- Figma SVG export */}
            <img
              className="home-landing-feature-card__pancake-top"
              src={card.pancakeTop}
              alt=""
              width={92}
              height={88}
            />
            {/* eslint-disable-next-line @next/next/no-img-element -- local SVG glyph */}
            <img
              className="home-landing-feature-card__pancake-icon"
              src={card.overlay.src}
              alt=""
              width={card.overlay.w}
              height={card.overlay.h}
              style={{ left: `${card.overlay.left}px`, top: `${card.overlay.top}px` }}
            />
          </div>
          <div className="home-landing-feature-card__copy">
            <h3 className="home-landing-feature-card__title">{card.title}</h3>
            <p className="home-landing-feature-card__body">{card.body}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
