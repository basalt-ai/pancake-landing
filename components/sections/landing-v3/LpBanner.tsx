/**
 * Section 5 — Banner "Building got 10x easier / Selling didn’t"
 * (Figma 4257:4953, 1654×753 wrapper p-16; card 4420:961 1622×721 #ffbd7a r48).
 * Static art: grouped SVG exports layered union → bubbles → extra bubble → drop,
 * titles above the art. Geometry lives in app/_styles/landing-v3/banner.css.
 */
export function LpBanner() {
  return (
    <section id="why" className="lp-banner">
      <div className="lp-banner__card">
        {/* z bottom→top: union (bottle + wave) → bubbles → extra bubble → drop */}
        <div className="lp-banner__art" aria-hidden="true">
          <div className="lp-banner__canvas">
            <img
              src="/lp/lp-banner-union.svg"
              alt=""
              width={965}
              height={721}
              className="lp-banner__union"
            />
            <img
              src="/lp/lp-banner-bubbles.svg"
              alt=""
              width={958}
              height={671}
              className="lp-banner__bubbles"
            />
            <img
              src="/lp/lp-banner-bubble-extra.svg"
              alt=""
              width={32.86}
              height={32.86}
              className="lp-banner__bubble-extra"
            />
            <img
              src="/lp/lp-banner-drop.svg"
              alt=""
              width={49.07}
              height={81.5}
              className="lp-banner__drop"
            />
          </div>
        </div>
        <h2 className="lp-title-section lp-banner__title lp-banner__title--left">
          Building got 10x easier.
        </h2>
        <p className="lp-title-section lp-banner__title lp-banner__title--right">
          Selling didn’t.
        </p>
      </div>
    </section>
  );
}
