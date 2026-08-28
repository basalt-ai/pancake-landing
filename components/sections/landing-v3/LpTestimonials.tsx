import type { ReactNode } from "react";

// Testimonials — "Take it from them" (Figma node 4257:5006).
// Two identical rows of 4 X-post cards; row width 2284px overflows the 1654px
// artboard and is centered (page-level overflow-x: clip trims both sides).
// Double spaces in the bodies are verbatim from Figma (rendered via pre-wrap).

type Card = {
  avatar: string;
  body: ReactNode;
};

const CARDS: Card[] = [
  {
    avatar: "/lp/lp-t-avatar-1.png",
    body: "Day 14 of the pancake experiment: my engineering agent has shipped 38  PRs, my recruiter agent screened 412 candidates, and my CFO agent is  actually scary good at modeling.",
  },
  {
    avatar: "/lp/lp-t-avatar-2.png",
    body: (
      <>
        {"I asked "}
        <span className="lp-tst-mention">@pancake</span>
        {' to "run my entire content engine" and it just… did. Calendar, briefs, drafts, scheduling, analytics. I am the bottleneck now.'}
      </>
    ),
  },
  {
    avatar: "/lp/lp-t-avatar-3.png",
    body: "Hired 4 pancake agents on Friday. Came back Monday to a launched landing page, 11 closed deals, and an inbox at zero. I genuinely don't know  what to do with my time.",
  },
  {
    avatar: "/lp/lp-t-avatar-4.png",
    body: "The kill switch works. I tested it. My whole org froze mid-sentence,  then resumed exactly where it left off when I un-paused. This is  actually production software.",
  },
];

function TestimonialCard({ card }: { card: Card }) {
  return (
    <article className="lp-tst-card">
      <div className="lp-tst-userrow">
        <img alt="" className="lp-tst-avatar" height={48} src={card.avatar} width={48} />
        <div className="lp-tst-id">
          <p className="lp-tst-name">Jules Reyes</p>
          <p className="lp-tst-handle">@jules · 1d</p>
        </div>
        <img alt="" height={48} src="/lp/lp-t-x-logo.svg" width={48} />
      </div>
      <p className="lp-tst-body">{card.body}</p>
      <div className="lp-tst-div" />
      <div className="lp-tst-meta">
        <span>321 replies</span>
        <span>821 reposts</span>
        <span>2.8k likes</span>
        <span className="lp-tst-spacer" />
        <span className="lp-tst-via">via X</span>
      </div>
    </article>
  );
}

export function LpTestimonials() {
  return (
    <section aria-labelledby="lp-tst-title" className="lp-tst">
      <div className="lp-tst-head">
        <h2 className="lp-title-section lp-tst-title" id="lp-tst-title">
          Take it from them
        </h2>
      </div>
      {([1, 2] as const).map((row) => (
        <div
          aria-hidden={row === 2 ? true : undefined}
          className="lp-tst-strip"
          data-row={row}
          key={row}
        >
          <div className="lp-tst-row">
            {CARDS.map((card, i) => (
              <TestimonialCard card={card} key={i} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
