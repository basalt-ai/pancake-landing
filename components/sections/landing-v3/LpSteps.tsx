// Steps — "Pancake Sells it" (Figma 4257:4926). Heading block + 3 checkerboard
// rows: 656px text card + 464×426 empty cream card (phase-2 media placeholder).
// Copy is verbatim from the artboard (lowercase "it", trailing space after
// "feedback." — do not fix). \n line breaks render via white-space: pre-line.

type Step = {
  num: string;
  title: string;
  body: string;
};

const STEPS: Step[] = [
  {
    num: "01",
    title: "Add your website.\nPancake builds your GTM Brain.",
    body: "Pancake turns your website into a living plan.\nWho buys from you, what to say to them, and where to show up. Always up to date.",
  },
  {
    num: "02",
    title: "Agents start working.",
    body: "Pancake reaches out to the people ready to buy and gets you found on Google and ChatGPT.",
  },
  {
    num: "03",
    title: "Give feedback. \nPancake self-improves.",
    body: "Pancake learns from every correction and gets better every day.",
  },
];

export function LpSteps() {
  return (
    <section className="lp-steps" id="how-it-works">
      <div className="lp-steps__org">
        <header className="lp-steps__head">
          <p className="lp-steps__kicker">While You Run your Business,</p>
          <h2 className="lp-steps__title lp-title-section">Pancake Sells it</h2>
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
              <div className="lp-steps__media" aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
