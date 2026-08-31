import { LpBubbles } from "@/components/sections/landing-v3/LpBubbles";

/**
 * Section 5 — Banner "Building got 10x easier / Selling didn’t"
 * (Figma 4257:4953, 1654×753 wrapper p-16; card 4420:961 1622×721 #ffbd7a r48).
 * Art layers: union (bottle + wave) → animated bubbles (LpBubbles, spins on
 * the 20s master loop) → drop; titles above the art. Geometry lives in
 * app/_styles/landing-v3/banner.css, bubble motion in anim.css.
 *
 * ≤767 (Figma mobile 4389:8243 "Frame 226", card 4389:8244 370×808 #fffbf6
 * r32): tall cream card — slim BLUE bottle (redrawn vector 4389:8246) pours
 * down into an orange dome (4389:8245); the desktop bubble canvas is reused
 * rotated 90° + scaled so the purple cluster lands in the vertical neck
 * (banner.css). The mobile-only nodes below (`lp-banner__m-*`, `__body`,
 * `__br`) are display:none ≥768px — desktop markup/rendering is untouched.
 */
export function LpBanner() {
  return (
    <section id="why" className="lp-banner">
      <div className="lp-banner__card">
        {/* mobile-only art underlay: dome (bottom) then bottle, both under the bubbles */}
        <svg
          className="lp-banner__m-dome"
          viewBox="0 0 370 387"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M-209.848 369.974C-209.848 546.618 -20.4506 783.671 174.526 785.281C385.45 787.022 582.241 630.353 582.241 421.824C582.241 326.61 544.744 224.836 488.874 154.474C422.383 70.7349 346.408 -4.62594e-05 205.563 -5.0748e-05C-22.195 0.000616811 -209.848 171.47 -209.848 369.974Z"
            fill="#FFBD7A"
          />
        </svg>
        <svg className="lp-banner__m-bottle" viewBox="0 0 370 490" aria-hidden="true">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M211.467 426.93C211.467 367.767 276.282 337.36 312.609 288.181C343.527 246.325 370 210.487 370 128.052L370 -413.999L8.68577e-05 -414L-2.36939e-05 128.052C-2.72972e-05 210.487 26.4729 246.325 57.3909 288.181C93.7181 337.36 168.302 367.767 168.302 426.93L168.302 427.033C168.302 431.012 168.318 436.69 168.336 443.112C168.379 458.863 168.436 479.09 168.302 489.703L211.467 489.703C211.334 479.09 211.39 458.862 211.434 443.112C211.452 436.689 211.467 431.011 211.467 427.033L211.467 426.93Z"
            fill="#000000"
          />
        </svg>
        {/* Reusable clip: the mobile bottle silhouette in objectBoundingBox
            units (÷370, ÷490) — referenced by .lp-banner__bubblebox ≤767 so
            bubbles can't drift outside the bottle (founder report
            2026-08-31). Bare 0×0 svg: display:none would break the
            reference in WebKit. */}
        <svg aria-hidden="true" width="0" height="0" style={{ position: "absolute" }}>
          <clipPath id="lp-bottle-clip" clipPathUnits="objectBoundingBox">
            <path
              transform="scale(0.0027027, 0.00204082)"
              d="M211.467 426.93C211.467 367.767 276.282 337.36 312.609 288.181C343.527 246.325 370 210.487 370 128.052L370 -413.999L8.68577e-05 -414L-2.36939e-05 128.052C-2.72972e-05 210.487 26.4729 246.325 57.3909 288.181C93.7181 337.36 168.302 367.767 168.302 426.93L168.302 427.033C168.302 431.012 168.318 436.69 168.336 443.112C168.379 458.863 168.436 479.09 168.302 489.703L211.467 489.703C211.334 479.09 211.39 458.862 211.434 443.112C211.452 436.689 211.467 431.011 211.467 427.033L211.467 426.93Z"
            />
          </clipPath>
        </svg>
        {/* z bottom→top: union (bottle + wave) → bubbles (animated) → drop */}
        <div className="lp-banner__art" aria-hidden="true">
          {/* display:contents everywhere except ≤767, where it becomes the
              bottle-shaped clip frame for the bubble canvas */}
          <div className="lp-banner__bubblebox">
            <div className="lp-banner__canvas">
            {/* The production artboard composition, one founder-directed
                change (2026-08-31): the drop renders FIRST so it passes
                BEHIND the black bottle — its top tucks under the collar and
                the bulb emerges below. */}
            <img
              src="/lp/lp-banner-drop.svg"
              alt=""
              width={49.07}
              height={81.5}
              className="lp-banner__drop"
            />
            <img
              src="/lp/lp-banner-union.svg"
              alt=""
              width={965}
              height={721}
              className="lp-banner__union"
            />
            <LpBubbles />
            </div>
        {/* Mobile-native bubbles: the mobile artboard's own 31 circles
            (group 4389:8247, card coords ÷370/÷490 → %), replacing the
            transformed desktop canvas whose cloud geometry could not match
            the artboard (founder 2026-08-31: positions must be exact).
            Static divs — the desktop bubbles' own-center spin is visually
            null for circles. Clipped by the parent bubblebox. */}
        {[
          { left: "88.892%", top: "30.816%", width: "4.541%", background: "var(--lp-yellow-30)" },
          { left: "37.162%", top: "66.0%", width: "5.676%", background: "var(--lp-pink-30)" },
          { left: "45.649%", top: "67.061%", width: "2.892%", background: "var(--lp-pink-30)" },
          { left: "49.486%", top: "77.735%", width: "6.135%", background: "var(--lp-pink-30)" },
          { left: "51.027%", top: "89.571%", width: "6.135%", background: "var(--lp-purple-30)" },
          { left: "42.865%", top: "71.776%", width: "4.162%", background: "var(--lp-pink-30)" },
          { left: "47.027%", top: "76.49%", width: "1.676%", background: "var(--lp-pink-30)" },
          { left: "53.811%", top: "62.449%", width: "1.676%", background: "var(--lp-pink-30)" },
          { left: "50.892%", top: "94.286%", width: "1.676%", background: "var(--lp-purple-30)" },
          { left: "46.73%", top: "81.51%", width: "2.784%", background: "var(--lp-purple-30)" },
          { left: "87.459%", top: "-22.694%", width: "2.838%", background: "var(--lp-green-20)" },
          { left: "60.135%", top: "68.102%", width: "3.946%", background: "var(--lp-pink-30)" },
          { left: "54.73%", top: "66.0%", width: "3.946%", background: "var(--lp-pink-30)" },
          { left: "37.892%", top: "49.245%", width: "3.973%", background: "var(--lp-yellow-30)" },
          { left: "13.459%", top: "23.388%", width: "3.054%", background: "var(--lp-yellow-30)" },
          { left: "7.108%", top: "30.082%", width: "4.0%", background: "var(--lp-yellow-30)" },
          { left: "7.081%", top: "11.755%", width: "4.054%", background: "var(--lp-green-20)" },
          { left: "46.784%", top: "87.98%", width: "4.243%", background: "var(--lp-purple-30)" },
          { left: "47.27%", top: "91.878%", width: "2.919%", background: "var(--lp-purple-30)" },
          { left: "52.541%", top: "96.061%", width: "2.919%", background: "var(--lp-purple-30)" },
          { left: "49.703%", top: "82.878%", width: "6.459%", background: "var(--lp-purple-30)" },
          { left: "86.189%", top: "47.163%", width: "2.73%", background: "var(--lp-yellow-30)" },
          { left: "85.676%", top: "6.531%", width: "3.27%", background: "var(--lp-green-20)" },
          { left: "92.703%", top: "21.286%", width: "1.486%", background: "var(--lp-yellow-30)" },
          { left: "51.081%", top: "71.551%", width: "7.297%", background: "var(--lp-pink-30)" },
          { left: "15.622%", top: "49.878%", width: "6.0%", background: "var(--lp-yellow-30)" },
          { left: "46.297%", top: "95.857%", width: "4.757%", background: "var(--lp-purple-30)" },
          { left: "61.324%", top: "59.612%", width: "6.081%", background: "var(--lp-yellow-30)" },
          { left: "61.784%", top: "53.184%", width: "2.919%", background: "var(--lp-yellow-30)" },
          { left: "34.27%", top: "60.878%", width: "2.919%", background: "var(--lp-yellow-30)" },
          { left: "23.676%", top: "60.551%", width: "4.892%", background: "var(--lp-pink-30)" },
        ].map((s, i) => (
          <span className="lp-banner__m-bubble" key={i} style={s} />
        ))}
          </div>
        </div>
        {/* mobile-only overlays: static orange dot + the bottle-neck lip cap */}
        <div className="lp-banner__m-dot" aria-hidden="true" />
        <div className="lp-banner__m-lip" aria-hidden="true" />
        <h2 className="lp-title-section lp-banner__title lp-banner__title--left">
          {"Building got "}
          <br className="lp-banner__br" />
          {"10x easier."}
        </h2>
        <p className="lp-title-section lp-banner__title lp-banner__title--right">
          Selling didn’t.
        </p>
        <p className="lp-banner__body">
          Your brain sets the watchlist: the phrases buyers type when they’re
          ready, your competitors’ pages, the voices your market follows. Live
          conversations, not a stale database.
        </p>
      </div>
    </section>
  );
}
