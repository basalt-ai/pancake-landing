// Steps — "Pancake fills your pipeline." (Figma 4636:3164, 1622×1741 — the 2026-09-02
// revision: the designer's vector illustrations, each replaced by its storyboard
// loop as the founder approves it — step 01 first). Heading block + 3 checkerboard rows: 656px text card +
// 464×426 media card. Copy follows the artboard except casing: founder rule
// (2026-08-28) — no capitals on common nouns mid-sentence ("sells it", "your
// business", "GTM brain") — and step 03, whose artboard copy the founder
// overrode in the brief (2026-09-02): "Pancake gets you the meeting. / You
// close it." + the follow-up body. Founder copy pass (2026-09-03): the
// section heading ("Pancake fills your pipeline.", was "Pancake sells it")
// and the step 01 body ("From your website, Pancake learns…") are his words
// verbatim — not the artboard's.

import { LpLoopVideo } from "./LpLoopVideo";
import { AudienceCopy } from "./LpAudience";

type Step = {
  num: string;
  title: string;
  body: string;
  /** Illustration exported from the Figma media card (464×426, cream canvas,
      text outlined) — the whole card is the picture. Steps still waiting for
      their approved loop. */
  art?: string;
  /** Storyboard animation (pancake-studio shorts/<name>, 1080×992 30fps) —
      plays once when the card comes into view and holds its last frame
      (the brain / the Agents view / the filled calendar). The poster is its
      first frame. */
  video?: string;
  poster?: string;
  /** What the illustration shows — its text is outlined in the SVG, so this
      is the only copy a screen reader gets. */
  alt: string;
};

const STEPS: Step[] = [
  {
    num: "01",
    title: "Add your website.\nPancake builds your GTM brain.",
    body: "From your website, Pancake learns who buys from you, what to say, and where to show up. Always up to date.",
    video: "/how/brain-research-loop.mp4",
    poster: "/how/brain-research-loop-poster.jpg",
    alt: "Animation: a website address is typed and researched; from the Studio Pelican node a knowledge graph blooms — purple, green, pink, orange and blue branches — then a market profile fills in: Company, Offering, Ideal clients.",
  },
  {
    num: "02",
    title: "Agents start working.",
    body: "Pancake reaches out to the people ready to buy and gets you found on Google and ChatGPT.",
    video: "/how/pipeline-checklist-loop.mp4",
    poster: "/how/pipeline-checklist-loop-poster.jpg",
    alt: "Animation: the Pipeline agent (24 warm leads) opens its checklist by itself and works through it — monitor buying signals, find people ready to buy, enrich every prospect, score leads for ICP fit, write outreach in your voice, follow-up automatically — each item loading, then ticked.",
  },
  {
    num: "03",
    title: "Pancake gets you the meeting.\nYou close it.",
    body: "Pancake handles the follow-up and keeps every warm conversation moving until a qualified meeting lands on your calendar.",
    video: "/how/meetings-calendar-loop.mp4",
    poster: "/how/meetings-calendar-loop-poster.jpg",
    alt: "Animation: a calendar week in October 2026 fills up day by day with booked meetings — Samantha M., Julien Aubert, Martin Torres and Studio P, Lumen Collective, Fernhollow Studio, a Martin C. follow-up — past meetings marked closed or follow-up as the days go by.",
  },
];

const AGENT_STEPS = [
  { title: "Start with the company.\nPancake builds the GTM brain.", body: "From the company’s website, Pancake learns who buys, what to say, and where to show up. Read that context through your connection." },
  { title: "Pancake’s agents get to work.", body: "Pancake reaches people ready to buy and helps the company get found on Google and ChatGPT. Read the leads and SEO calendar to plan the next move." },
  { title: "Pancake gets the meeting.\nYour human closes it.", body: "Pancake handles the follow-up and keeps warm conversations moving. Your human gets a qualified meeting and the context to walk into it." },
];

export function LpSteps() {
  return (
    <section className="lp-steps" id="how-it-works">
      <div className="lp-steps__org">
        <header className="lp-steps__head">
          <p className="lp-steps__kicker"><AudienceCopy human="While you run your business," agent="While your human runs the business," /></p>
          <h2 className="lp-steps__title lp-title-section"><AudienceCopy human="Pancake fills your pipeline." agent="Pancake fills their pipeline." /></h2>
        </header>
        <div className="lp-steps__list">
          {STEPS.map((step, index) => (
            <div className="lp-steps__row" key={step.num}>
              <div className="lp-steps__text">
                <p className="lp-steps__num lp-display">{step.num}</p>
                <span className="lp-steps__spacer" aria-hidden="true" />
                <h3 className="lp-steps__step-title lp-display"><AudienceCopy human={step.title} agent={AGENT_STEPS[index]!.title} /></h3>
                <p className="lp-steps__body"><AudienceCopy human={step.body} agent={AGENT_STEPS[index]!.body} /></p>
              </div>
              {step.video ? (
                <LpLoopVideo
                  className="lp-steps__media"
                  src={step.video}
                  poster={step.poster}
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
