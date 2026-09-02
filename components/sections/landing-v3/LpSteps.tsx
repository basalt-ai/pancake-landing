// Steps — "Pancake sells it" (Figma 4636:3164, 1622×1741 — the 2026-09-02
// revision: the designer's vector illustrations, each replaced by its storyboard
// loop as the founder approves it — step 01 first). Heading block + 3 checkerboard rows: 656px text card +
// 464×426 media card. Copy follows the artboard except casing: founder rule
// (2026-08-28) — no capitals on common nouns mid-sentence ("sells it", "your
// business", "GTM brain") — and step 03, whose artboard copy the founder
// overrode in the brief (2026-09-02): "Pancake gets you the meeting. / You
// close it." + the follow-up body.

import { LpLoopVideo } from "./LpLoopVideo";

type Step = {
  num: string;
  title: string;
  body: string;
  /** Illustration exported from the Figma media card (464×426, cream canvas,
      text outlined) — the whole card is the picture. Steps still waiting for
      their approved loop. */
  art?: string;
  /** Storyboard loop (pancake-studio shorts/<name>, 1080×1080 30fps, seamless,
      464/426 safe band) — replaces the illustration once the founder approves
      it. The poster is a "full" frame of the loop; playback starts there. */
  video?: string;
  poster?: string;
  posterAt?: number;
  /** What the illustration shows — its text is outlined in the SVG, so this
      is the only copy a screen reader gets. */
  alt: string;
};

const STEPS: Step[] = [
  {
    num: "01",
    title: "Add your website.\nPancake builds your GTM brain.",
    body: "Pancake turns your website into a living plan.\nWho buys from you, what to say to them, and where to show up. Always up to date.",
    video: "/how/brain-research-loop.mp4",
    poster: "/how/brain-research-loop-poster.jpg",
    posterAt: 13.3,
    alt: "Animation: a website address is typed and researched; from the Studio Pelican node a knowledge graph blooms — purple, green, pink, orange and blue branches — then a market profile fills in: Company, Offering, Ideal clients.",
  },
  {
    num: "02",
    title: "Agents start working.",
    body: "Pancake reaches out to the people ready to buy and gets you found on Google and ChatGPT.",
    video: "/how/pipeline-checklist-loop.mp4",
    poster: "/how/pipeline-checklist-loop-poster.jpg",
    posterAt: 9.5,
    alt: "Animation: the Pipeline agent (24 warm leads) opens its checklist by itself and works through it — monitor buying signals, find people ready to buy, enrich every prospect, score leads for ICP fit, write outreach in your voice, follow-up automatically — each item loading, then ticked.",
  },
  {
    num: "03",
    title: "Pancake gets you the meeting.\nYou close it.",
    body: "Pancake handles the follow-up and keeps every warm conversation moving until a qualified meeting lands on your calendar.",
    art: "/how/step-3-calendar.svg",
    alt: "A calendar week in October 2026 filling up with booked meetings: Martin Torres and Studio P, Julien Aubert, Fernhollow Studio, Lumen Collective, a Martin C. follow-up and Samantha M.",
  },
];

export function LpSteps() {
  return (
    <section className="lp-steps" id="how-it-works">
      <div className="lp-steps__org">
        <header className="lp-steps__head">
          <p className="lp-steps__kicker">While you run your business,</p>
          <h2 className="lp-steps__title lp-title-section">Pancake sells it</h2>
        </header>
        <div className="lp-steps__list">
          {STEPS.map((step) => (
            <div className="lp-steps__row" key={step.num}>
              <div className="lp-steps__text">
                <p className="lp-steps__num lp-display">{step.num}</p>
                <span className="lp-steps__spacer" aria-hidden="true" />
                <h3 className="lp-steps__step-title lp-display">{step.title}</h3>
                <p className="lp-steps__body">{step.body}</p>
              </div>
              {step.video ? (
                <LpLoopVideo
                  className="lp-steps__media"
                  src={step.video}
                  poster={step.poster}
                  posterAt={step.posterAt}
                  alt={step.alt}
                />
              ) : (
                <div className="lp-steps__media">
                  <img
                    className="lp-steps__art"
                    src={step.art}
                    alt={step.alt}
                    width={464}
                    height={426}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
