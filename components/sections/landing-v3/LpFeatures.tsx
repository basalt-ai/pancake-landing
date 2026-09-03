import { LpLoopVideo } from "@/components/sections/landing-v3/LpLoopVideo";

/**
 * Landing v3 — section 6 "How Pancake finds customers" (Figma 4257:4976,
 * rev2 artboard 1654×2969). Heading + 4 feature cards (1296×621) + 4 hairline
 * separators. Each card's mock UI is an animation now (founder 2026-09-02:
 * "animate the four buckets, fully derived from the designer's picture, the
 * picture is the final screen"): rendered in pancake-studio shorts/feat-*-anim
 * from the very mock markup/CSS this file used to carry, 1120×1242 = the
 * 560×621 media zone at 2×. LpLoopVideo plays it once when the card comes
 * into view and holds the designer's picture as the last frame; the poster
 * is the animation's first frame.
 */

function FeatureText({ title, body, tag }: { title: string; body: string; tag?: string }) {
  return (
    <div className="lp-feat-text">
      {tag ? <p className="lp-feat-tag">{tag}</p> : null}
      <h3 className="lp-title-card lp-feat-h">{title}</h3>
      <p className="lp-feat-body">{body}</p>
    </div>
  );
}

type Feature = {
  side: "left" | "right";
  tag?: string;
  title: string;
  body: string;
  video: string;
  poster: string;
  alt: string;
};

const FEATURES: Feature[] = [
  {
    side: "left",
    tag: "AGENT Y",
    title: "Tell Pancake \nwhat to watch",
    body: "Choose the keywords, competitors, influencers, hiring activity, and tech stacks that matter. Pancake finds matching buyers and keeps the source attached.",
    video: "/lp/feat-signals.mp4",
    poster: "/lp/feat-signals-poster.jpg",
    alt: "Animation: a Signals panel where keyword mentions, competitor engagement, companies hiring and technologies used switch on one by one (4 active), then a Roles panel where Sales, Marketing and Customer success get checked (3 selected).",
  },
  {
    side: "right",
    title: "Every first message starts warm",
    body: "Pancake visits their profile, likes a recent post, and connects before following up. Every message starts from their activity and sounds like you.",
    video: "/lp/feat-warm-message.mp4",
    poster: "/lp/feat-warm-message-poster.jpg",
    alt: "Animation: a LinkedIn post by Sarah Velasquez about a third no-show this week gets liked, then a draft reply is written inside a rainbow ring — Hey Anna, saw your post on no-shows. Pelican sends reminders patients actually open. Worth a quick look Thursday? — with a Send button.",
  },
  {
    side: "left",
    title: "Show up where \nbuyers search",
    body: "Pancake finds the questions where Google and AI miss you. It drafts the article, waits for your review, and publishes it to your CMS.",
    video: "/lp/feat-ai-search.mp4",
    poster: "/lp/feat-ai-search-poster.jpg",
    alt: "Animation: in an AI chat, the question best online booking tool for a small clinic gets an answer that recommends DeRox, while the ChatGPT, Claude and Gemini logos appear around the chat.",
  },
  {
    side: "right",
    title: "Pancake learns from what wins",
    body: "Pancake compares reply rates and remembers which opening, message length, and ask worked. The next campaign starts there.",
    video: "/lp/feat-learns.mp4",
    poster: "/lp/feat-learns-poster.jpg",
    alt: "Animation: a reply-rate chart grows week by week to 56% up versus last period, a What worked card lists Lead with no-shows, Shorter intros and Ask for Thursdays, and a Brain updated card confirms the winning playbook is ready for the next campaign.",
  },
];

function FeatureCard({ f }: { f: Feature }) {
  return (
    <>
      <article className="lp-feat-card" data-side={f.side}>
        <FeatureText tag={f.tag} title={f.title} body={f.body} />
        <LpLoopVideo className="lp-feat-mockzone" src={f.video} poster={f.poster} alt={f.alt} />
      </article>
      <hr className="lp-feat-sep" />
    </>
  );
}

export function LpFeatures() {
  return (
    <section className="lp-feat" aria-labelledby="lp-feat-heading-title">
      <div className="lp-feat-heading">
        <h2 id="lp-feat-heading-title" className="lp-title-section lp-feat-headline">
          How Pancake finds customers
        </h2>
      </div>
      {FEATURES.map((f) => (
        // rev2 artboard closes the section with a 4th separator (4526:3448)
        <FeatureCard key={f.video} f={f} />
      ))}
    </section>
  );
}
