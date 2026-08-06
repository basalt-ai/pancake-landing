import { LoopVideo } from "./LoopVideo";

/**
 * How it works — three numbered steps, each pairing a studio motion loop with
 * the step's verbatim copy. The loops (pancake-studio shorts: gtm-brain-loop,
 * agents-loop, feedback-loop) were authored as a trio for this exact section —
 * 1080x1080 seamless loops on the same cream canvas as the page, so they blend
 * without a frame. Goal of the section: Pancake's time-to-value is the
 * shortest on the market — website in, agents working, improving from there.
 */

type Step = {
  num: string;
  title: string;
  body: React.ReactNode;
  video: string;
  /** What the loop shows — read to screen readers in place of the video. */
  alt: string;
};

const STEPS: Step[] = [
  {
    num: "01",
    title: "Add your website. Pancake creates the Brain.",
    body: (
      <>
        Pancake turns your data into a living GTM strategy.
        <br />
        ICP, positioning, keywords and target accounts, always up to date.
      </>
    ),
    video: "/how/brain-loop.mp4",
    alt: "Animation: from a single node, Pancake's Brain researches your company and grows into a full GTM knowledge graph — market profile, ICP, keywords, personas and market references.",
  },
  {
    num: "02",
    title: "Agents start working.",
    body: "Pancake autonomously launches outreach campaigns on hot leads and gets you ranked on Google and AI search.",
    video: "/how/agents-loop.mp4",
    alt: "Animation: the Pancake app finds ICP-checked leads and contacts them, then switches to the AI SEO planner publishing articles — with 'Recommended on Google' and 'Recommended by ChatGPT' chips.",
  },
  {
    num: "03",
    title: "Give feedback. Pancake self-improves.",
    body: "Pancake learns from every correction and gets better every day.",
    video: "/how/feedback-loop.mp4",
    alt: "Animation: you reply 'too formal, we're playful' to a draft; the feedback flows into the Brain, the voice updates, and the next draft comes back on-tone and approved.",
  },
];

export function HowItWorks() {
  return (
    <section className="lv2s lv2-how" id="how-it-works" aria-labelledby="lv2-how-title">
      <div className="lv2-container">
        <header className="lv2-section-header">
          <h2 id="lv2-how-title" className="lv2-section-title">
            AI agents that handle your go-to-market
          </h2>
          <p className="lv2-section-lede">
            Not a tool you learn, not a person you hire. A new kind of AI that does your GTM start
            to finish using tools built specifically for the job.
          </p>
        </header>

        <ol className="lv2-steps">
          {STEPS.map((step) => (
            <li key={step.num} className="lv2-step">
              <div className="lv2-step-copy">
                <span className="lv2-step-num" aria-hidden="true">
                  {step.num}
                </span>
                <h3 className="lv2-step-title">{step.title}</h3>
                <p className="lv2-step-body">{step.body}</p>
              </div>
              <LoopVideo src={step.video} alt={step.alt} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
