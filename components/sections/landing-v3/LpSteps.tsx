// Steps — "Pancake sells it" (Figma 4257:4926). Heading block + 3 checkerboard
// rows: 656px text card + 464×426 media card. Copy follows the artboard except
// casing: founder rule (2026-08-28) — no capitals on common nouns mid-sentence
// ("sells it", "your business", "GTM brain"). Trailing space after "feedback."
// is verbatim — do not fix. \n line breaks render via white-space: pre-line.

import { LpLoopVideo } from "./LpLoopVideo";

type Step = {
  num: string;
  title: string;
  body: string;
  /** Studio motion loop (pancake-studio trio — 1080×1080, cream canvas). */
  video: string;
  /** What the loop shows — read to screen readers in place of the video. */
  alt: string;
};

const STEPS: Step[] = [
  {
    num: "01",
    title: "Add your website.\nPancake builds your GTM brain.",
    body: "Pancake turns your website into a living plan.\nWho buys from you, what to say to them, and where to show up. Always up to date.",
    video: "/how/brain-loop.mp4",
    alt: "Animation: from a single node, Pancake's GTM Brain researches your company and grows into a full knowledge graph — market profile, ideal customers, keywords, personas and market references.",
  },
  {
    num: "02",
    title: "Agents start working.",
    body: "Pancake reaches out to the people ready to buy and gets you found on Google and ChatGPT.",
    video: "/how/agents-loop.mp4",
    alt: "Animation: the Pancake app finds people who match your ideal customer and contacts them, then switches to the AI SEO planner publishing articles — with 'Recommended on Google' and 'Recommended by ChatGPT' chips.",
  },
  {
    num: "03",
    title: "Give feedback. \nPancake self-improves.",
    body: "Pancake learns from every correction and gets better every day.",
    video: "/how/feedback-loop.mp4",
    alt: "Animation: you reply 'too formal, we're playful' to a draft; the feedback flows into the Brain, the voice updates, and the next draft comes back on-tone and approved.",
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
              <LpLoopVideo className="lp-steps__media" src={step.video} alt={step.alt} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
