/**
 * Landing v3 — Section 7: CTA "Try Pancake now" (Figma node 4389:4492).
 * Cream 1296px card with two pre-clipped rainbow slivers hugging the card
 * edges behind a centered 464px text column. Static render — the Figma arc
 * motion lands in phase 2.
 */
export function LpCta() {
  return (
    <section className="lp-cta">
      <div className="lp-cta__card">
        <img
          alt=""
          className="lp-cta__art lp-cta__art--left"
          height={432}
          src="/lp/lp-cta-rainbow-left.svg"
          width={560}
        />
        <img
          alt=""
          className="lp-cta__art lp-cta__art--right"
          height={432}
          src="/lp/lp-cta-rainbow-right.svg"
          width={529}
        />
        <div className="lp-cta__content">
          <div className="lp-cta__text">
            <h2 className="lp-title-card lp-cta__title">Try Pancake now</h2>
            <p className="lp-cta__body">
              Pancake can’t overspend.
              <br />
              Every lead arrives with its conversation attached.
            </p>
          </div>
          <a className="lp-btn" href="https://app.getpancake.ai">
            Get started
          </a>
        </div>
      </div>
    </section>
  );
}
