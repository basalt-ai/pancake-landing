/**
 * Home — "Take it from them" section (Figma `428:15175`).
 *
 * Infinite, slow horizontal carousel of REAL X posts (June 2026 wave). Quotes
 * are verbatim; long-form posts carry the same preview cut X itself shows
 * (ellipsis), and every card links to the full post. Spanish posts are shown
 * in English with a "Translated from Spanish" note. Post media is never
 * included — text only. Avatars are local copies in `public/testimonials/`.
 *
 * The track holds each post twice; a manual `gsap.ticker` tick translates it
 * left at a constant px/s. When `offset` crosses one full stride (width of
 * the un-duplicated set including gaps), it wraps back by `+stride` —
 * visually seamless because the duplicated cards sit exactly where the
 * originals were. The outer band breaks out of the page container
 * (`width: 100vw`); the soft mask gradient feathers the sides.
 */
"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { gsap } from "@/lib/gsap";

const CARD_GAP_PX = 16;
const CAROUSEL_SPEED_PX_PER_S = 36;

type Testimonial = {
  id: string;
  name: string;
  /** Handle + short date, e.g. "@nicos_ai · Jun 9". */
  handle: string;
  avatar: string;
  /** Full permalink to the post on X. */
  url: string;
  quote: string;
  /** Set when the original post is in another language and shown in English. */
  translatedFrom?: string;
};

/** Highlights Pancake mentions in the deep brand purple from Figma. */
function withPancakeMention(text: string): ReactNode {
  const parts = text.split(/(@getpancake_ai|@pancake\b)/g);
  return parts.map((part, i) =>
    part === "@getpancake_ai" || part === "@pancake" ? (
      <span key={i} className="home-landing-testimonial__mention">
        {part}
      </span>
    ) : (
      part
    )
  );
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: "wesley",
    name: "Wesley",
    handle: "@Ambani_Wessley · Jun 9",
    avatar: "/testimonials/ambani_wessley.jpg",
    url: "https://x.com/Ambani_Wessley/status/2064410998925296059",
    quote:
      "Just spent way too long staring at X analytics, scrolling my own profile like a detective trying to remember which tweets actually hit, comparing nothing, and posting on pure vibes again.\n\nAsked Pancake: “analyze my last 30 tweets — what landed, what flopped, the pattern”\n\nGot a…",
  },
  {
    id: "somitra",
    name: "SomitraSR",
    handle: "@TheSomitraSR · Jun 9",
    avatar: "/testimonials/thesomitrasr.jpg",
    url: "https://x.com/TheSomitraSR/status/2064404783604343269",
    quote:
      "As a founder, I used to spend hours jumping between CRM, spreadsheets, email, and analytics just to figure out what needed attention.\n\nThen I’d still miss follow-ups.\n\nLast week I just asked @getpancake_ai:\n\n“Monitor new leads, prioritize the hot ones, and draft follow-ups.”…",
  },
  {
    id: "nico",
    name: "Nico",
    handle: "@nicos_ai · Jun 9",
    avatar: "/testimonials/nicos_ai.jpg",
    url: "https://x.com/nicos_ai/status/2064423456171565490",
    quote:
      "NOW YOU CAN GO TO BED WITH A BUG AND WAKE UP WITHOUT IT\n\nBefore: you read the stack trace, reproduce it locally, find the line, write the fix, open the PR at 2AM\n\nNow: you tell Pancake “fix the checkout crash”, go to sleep, and the PR is already open by morning",
    translatedFrom: "Spanish",
  },
  {
    id: "kaitee",
    name: "Kaitee",
    handle: "@KaiteeShiks · Jun 9",
    avatar: "/testimonials/kaiteeshiks.jpg",
    url: "https://x.com/KaiteeShiks/status/2064404901762068535",
    quote:
      "One of the most annoying parts of being a creator isn't making content.\n\nIt's keeping up with sponsor emails.\n\nNormally I'd dig through my inbox, forget to reply to someone for days, hunt for old rate cards, then wonder which invoices were actually paid.\n\nWith Pancake I can just…",
  },
  {
    id: "andrew",
    name: "Andrew Carr 🤸",
    handle: "@andrew_n_carr · Jun 9",
    avatar: "/testimonials/andrew_n_carr.jpg",
    url: "https://x.com/andrew_n_carr/status/2064403828791968173",
    quote:
      "Usually, I would have like 10 gemini or chatgpt tabs open brainstorming cold emails or hooks for some animated outreach.\n\nit's kinda sweet to just \"ask pancake\" to go off and run autonomously. The little fella is pretty darn smart.\n\nAnyway, I've had substantially better…",
  },
  {
    id: "gus",
    name: "gus",
    handle: "@igus_ai · Jun 9",
    avatar: "/testimonials/igus_ai.jpg",
    url: "https://x.com/igus_ai/status/2064418742575022274",
    quote:
      "NOW YOU CAN RUN A 100% AUTOMATED CLIPPING BUSINESS\n\nYou hand Pancake the episode and it generates upload-ready clips, the show notes, and the chapters\n\nIt used to be 3 days of post-production per episode: reviews, timestamps, an editor, waiting\n\nTurn that into a service…",
    translatedFrom: "Spanish",
  },
  {
    id: "leonardo",
    name: "Leonardo",
    handle: "@MrOnsase · Jun 9",
    avatar: "/testimonials/mronsase.jpg",
    url: "https://x.com/MrOnsase/status/2064406486336315409",
    quote:
      "I wanted to turn every new feature I ship into content without spending 2 hours rewriting it.\n\nNormally I’d stare at the changelog, open a blank tweet, rewrite it 6 different ways, overthink the hook, get stuck, and end up posting nothing.\n\nSo I just asked Pancake: “turn my last…",
  },
  {
    id: "jakes",
    name: "Jakes",
    handle: "@JakesBiko · Jun 9",
    avatar: "/testimonials/jakesbiko.jpg",
    url: "https://x.com/JakesBiko/status/2064406616028639431",
    quote:
      "I wanted to stop answering the same support question 10 times a day and actually ship features instead.\n\nNormally I’d open each ticket, search docs, dig into the codebase to double-check, write a careful reply, paste links, repeat until my whole day was gone.\n\nSo I just asked…",
  },
];

function XMark() {
  return (
    <svg
      viewBox="0 0 48 48"
      className="home-landing-testimonial__brand-icon"
      aria-hidden
      focusable="false"
    >
      <path
        d="M29.4793 14.8455H32.5832L25.804 22.6739L33.7798 33.3283H27.5314L22.6416 26.8675L17.041 33.3283H13.9371L21.1886 24.9547L13.5367 14.8455H19.9425L24.3645 20.752L29.4793 14.8455ZM28.3906 31.4519H30.109L19.0068 16.6266H17.1625L28.3906 31.4519Z"
        fill="currentColor"
      />
    </svg>
  );
}

function Card({ t }: { t: Testimonial }) {
  return (
    <a
      className="home-landing-testimonial"
      href={t.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Post by ${t.name} on X`}
    >
      <div className="home-landing-testimonial__header">
        <div className="home-landing-testimonial__avatar">
          <Image src={t.avatar} alt="" width={48} height={48} loading="lazy" />
        </div>
        <div className="home-landing-testimonial__identity">
          <p className="home-landing-testimonial__name">{t.name}</p>
          <p className="home-landing-testimonial__handle">{t.handle}</p>
        </div>
        <div className="home-landing-testimonial__brand">
          <XMark />
        </div>
      </div>
      <p className="home-landing-testimonial__quote">{withPancakeMention(t.quote)}</p>
      {t.translatedFrom ? (
        <p className="home-landing-testimonial__translated">Translated from {t.translatedFrom}</p>
      ) : null}
    </a>
  );
}

export function HomeLandingTestimonials() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const mobileTrackRef = useRef<HTMLDivElement | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReducedMotion(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Track viewport — switch to a snap-scroll mobile carousel below `lg`.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 1023.98px)");
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Desktop only — the infinite GSAP ticker scroll.
  useEffect(() => {
    if (isMobile) return;
    const track = trackRef.current;
    if (!track) return;
    if (reducedMotion) {
      track.style.transform = "translate3d(0,0,0)";
      return;
    }

    let offset = 0;
    let stride = 0;

    const measure = () => {
      const total = track.scrollWidth;
      stride = total / 2 + CARD_GAP_PX / 2;
    };

    measure();

    const tick = (_time: number, deltaTime: number) => {
      if (stride <= 0) return;
      offset -= (deltaTime / 1000) * CAROUSEL_SPEED_PX_PER_S;
      while (offset <= -stride) offset += stride;
      track.style.transform = `translate3d(${offset.toFixed(2)}px, 0, 0)`;
    };

    const handleResize = () => {
      measure();
    };

    gsap.ticker.add(tick);
    window.addEventListener("resize", handleResize);

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("resize", handleResize);
    };
  }, [reducedMotion, isMobile]);

  // Mobile — track which card is centered for the dots indicator.
  useEffect(() => {
    if (!isMobile) return;
    const track = mobileTrackRef.current;
    if (!track) return;
    const update = () => {
      const trackRect = track.getBoundingClientRect();
      const center = trackRect.left + trackRect.width / 2;
      let best = 0;
      let bestDist = Infinity;
      const cards = track.querySelectorAll<HTMLElement>(".home-landing-testimonial");
      cards.forEach((card, i) => {
        const r = card.getBoundingClientRect();
        const c = r.left + r.width / 2;
        const d = Math.abs(c - center);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      setActiveIndex(best);
    };
    track.addEventListener("scroll", update, { passive: true });
    update();
    return () => track.removeEventListener("scroll", update);
  }, [isMobile]);

  function scrollToTestimonial(i: number) {
    const track = mobileTrackRef.current;
    if (!track) return;
    const cards = track.querySelectorAll<HTMLElement>(".home-landing-testimonial");
    const target = cards[i];
    if (!target) return;
    const offset = target.offsetLeft - (track.clientWidth - target.clientWidth) / 2;
    track.scrollTo({ left: offset, behavior: "smooth" });
  }

  // Desktop loop renders cards twice for seamless looping.
  const looped = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <div className="home-landing-testimonials" aria-roledescription="carousel">
      {/* Desktop track — infinite GSAP scroll. */}
      <div
        ref={trackRef}
        className="home-landing-testimonials__track home-landing-testimonials__track--desktop"
      >
        {looped.map((t, i) => (
          <Card key={`${t.id}-${i}`} t={t} />
        ))}
      </div>

      {/* Mobile track — native snap scroll + dot indicator. */}
      <div className="home-landing-testimonials__mobile">
        <div
          ref={mobileTrackRef}
          className="home-landing-testimonials__track home-landing-testimonials__track--mobile"
        >
          {TESTIMONIALS.map((t) => (
            <Card key={`${t.id}-mobile`} t={t} />
          ))}
        </div>
        <div
          className="home-landing-testimonials__dots"
          role="tablist"
          aria-label="Customer stories"
        >
          {TESTIMONIALS.map((t, i) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`Post by ${t.name}`}
              className={`home-landing-testimonials__dot ${i === activeIndex ? "home-landing-testimonials__dot--active" : ""}`}
              onClick={() => scrollToTestimonial(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
