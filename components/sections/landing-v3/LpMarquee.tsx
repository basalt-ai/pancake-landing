/**
 * Landing v3 — Logo strip marquee (Figma node 4257:4924, 1654×106).
 * The designer PNG (/lp/lp-logo-strip.png, 2180×118 native) repeats every
 * 1424px; /lp/lp-logo-strip-tile.png is one exact period cropped mid-gap
 * (x=649..2073), so tile edges sit in whitespace. Six copies scroll left by
 * exactly one tile per loop (marquee.css) — the wrap is invisible. Static
 * under prefers-reduced-motion. Decorative: empty alt + aria-hidden track.
 */
const TILE_COUNT = 6; // keep in sync with --lp-marquee-tiles in marquee.css

export function LpMarquee() {
  return (
    <section className="lp-marquee">
      <div aria-hidden="true" className="lp-marquee__track">
        {Array.from({ length: TILE_COUNT }, (_, i) => (
          <img
            alt=""
            height={118}
            key={i}
            src="/lp/lp-logo-strip-tile.png"
            width={1424}
          />
        ))}
      </div>
    </section>
  );
}
