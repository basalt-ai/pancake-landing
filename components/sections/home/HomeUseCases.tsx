"use client";

/**
 * Home — "four real jobs" use-case row (four vertical cards across on
 * desktop), v4.1 "chat theater" redesign (founder feedback on v4.0:
 * "super flat, super not juicy, super fixed"); finance card added on
 * founder request.
 *
 * Composition (see the CSS block in `app/_styles/components.css`):
 *   tinted per-accent mat → floating white Slack panel → sticker kicker,
 *   cards resting at hand-placed offsets/tilts, physical hover + spotlight.
 *
 * Motion: one play-once GSAP timeline per card (ScrollTrigger `once`) —
 *   ask springs in (origin-anchored, iMessage-style) → time-jump divider
 *   ("overnight") → typing dots → reply → the artifact chip STAMPS in like
 *   a receipt and settles at -1deg → a 🥞 reaction pops onto the ask.
 * Chat is temporal media: play once, never scrub. CSS defaults are the
 * FINAL state, so no-JS and prefers-reduced-motion get the finished
 * exchange (the typing pill only ever exists inside the timeline).
 *
 * The chat grammar (Lato, square avatars, APP badge, 15px/1.46668 rhythm)
 * mirrors pricing's `TokensBuyCards` and `components/shared/SlackUI.tsx`.
 */

import { useRef } from "react";

import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";

type UseCase = {
  id: string;
  /** Drives the card's mat/stroke/kicker tint family (see components.css). */
  accent: "purple" | "pink" | "yellow" | "orange";
  kicker: string;
  headline: string;
  body: string;
  /** Time-jump divider label between the ask and the reply. */
  elapsed: string;
  user: {
    name: string;
    initial: string;
    accent: string;
    accentInk: string;
    time: string;
    text: string;
  };
  agent: { time: string; text: string };
  artifact: { icon: "pr" | "leads" | "pdf" | "sheet"; title: string; meta: string };
};

const USE_CASES: UseCase[] = [
  {
    id: "engineering",
    accent: "purple",
    kicker: "Engineering",
    headline: "Ships while you sleep.",
    body: "Report the bug on your way to bed. Wake up to a tested fix and an open pull request — not a ticket.",
    elapsed: "overnight",
    user: {
      name: "Sam",
      initial: "S",
      accent: "#E8E0F2",
      accentInk: "#4A3C7B",
      time: "11:48 PM",
      text: "@pancake checkout's crashing on prod. I'm going to bed — take it.",
    },
    agent: {
      time: "7:02 AM",
      text: "Found it — guest carts hit a null session on the new flow. Fixed, tested, PR open for your review.",
    },
    artifact: {
      icon: "pr",
      title: "fix: guest checkout crash",
      meta: "Pull request #214 · 2 files changed",
    },
  },
  {
    id: "finance",
    accent: "orange",
    kicker: "Finance",
    headline: "It never forgets.",
    body: "Hand off the chasing you keep postponing. It reminds, tracks replies, and keeps nudging until the money lands.",
    elapsed: "5 minutes later",
    user: {
      name: "Priya",
      initial: "P",
      accent: "#D6E9DC",
      accentInk: "#1E5B3C",
      time: "8:12 AM",
      text: "@pancake chase down our overdue invoices? Some are 60+ days out and I keep forgetting.",
    },
    agent: {
      time: "8:17 AM",
      text: "14 overdue, $38,400 outstanding. Reminders sent to every client — 3 are paying today. I'll nudge the rest every 3 days until they clear.",
    },
    artifact: {
      icon: "sheet",
      title: "overdue-invoices.xlsx",
      meta: "Sheet · 14 invoices · live-tracked",
    },
  },
  {
    id: "outbound",
    accent: "pink",
    kicker: "Outbound",
    headline: "One ask, every tool.",
    body: "It works across your CRM, inbox, and analytics in a single run. You ask once; it does the legwork.",
    elapsed: "7 minutes later",
    user: {
      name: "Mara",
      initial: "M",
      accent: "#D5E4EB",
      accentInk: "#1F4660",
      time: "9:14 AM",
      text: "@pancake watch new signups, flag the hot ones, draft follow-ups.",
    },
    agent: {
      time: "9:21 AM",
      text: "12 new leads since yesterday — cross-checked CRM, inbox, and analytics. 3 are hot. Drafts ready for your send.",
    },
    artifact: {
      icon: "leads",
      title: "Hot leads — follow-ups",
      meta: "3 drafts · CRM + email + analytics",
    },
  },
  {
    id: "content",
    accent: "yellow",
    kicker: "Support & content",
    headline: "Real work, attached.",
    body: "Answers come with the work attached — posts, PDFs, pull requests. Grounded in your docs and your codebase.",
    elapsed: "9 minutes later",
    user: {
      name: "Leo",
      initial: "L",
      accent: "#EAE2D2",
      accentInk: "#6E5520",
      time: "4:32 PM",
      text: "@pancake turn this week's changelog into a launch post.",
    },
    agent: {
      time: "4:41 PM",
      text: "Drafted from the changelog and the docs — blog post, X thread, and a one-pager attached.",
    },
    artifact: {
      icon: "pdf",
      title: "launch-week-onepager.pdf",
      meta: "PDF · 1 page",
    },
  },
];

/** Fan slot geometry — d ∈ [-1, 1] from center; outer cards rotate, dip,
 *  and shrink the most (quadratic falloff, 21st.dev card-fan pattern). */
function fanSlot(slot: number, count: number, spread: number) {
  const half = (count - 1) / 2;
  const d = half > 0 ? (slot - half) / half : 0;
  return {
    x: d * spread,
    y: Math.abs(d) ** 2 * 40,
    rot: d * 7,
    scale: 1 - 0.08 * Math.abs(d) ** 2,
    z: count - Math.ceil(Math.abs(slot - half)),
  };
}

export function HomeUseCases() {
  const rootRef = useRef<HTMLDivElement>(null);

  // Fan mode (desktop + motion allowed): the row becomes a stage, the four
  // cards an overlapping hand. Hover lifts a card to the front (rotation
  // zeroed for reading) and elastically pushes the others aside — founder-
  // picked 21st.dev card-fan pattern, card innards unchanged. The CSS grid
  // remains the no-JS / reduced-motion / mobile layout.
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const cards = gsap.utils.toArray<HTMLElement>(root.querySelectorAll(".home-use-case-card"));
        if (cards.length < 2) return;
        root.classList.add("home-use-cases--fan");

        const count = cards.length;
        const half = (count - 1) / 2;

        // Outer card centers sit near the row edges; overlap is the point.
        const getSpread = () =>
          Math.max(0, root.clientWidth / 2 - cards[0].offsetWidth / 2 - 8);

        // The stage is fixed-height (cards are absolute): tallest card +
        // outer-slot dip + hover-lift headroom.
        const sizeStage = () => {
          const maxH = Math.max(...cards.map((c) => c.offsetHeight));
          root.style.height = `${maxH + 72}px`;
        };
        sizeStage();
        if (typeof document !== "undefined" && "fonts" in document) {
          document.fonts.ready.then(sizeStage).catch(() => {});
        }

        let entering = true;
        let hovered: number | null = null;
        let leaveTimer: ReturnType<typeof setTimeout> | null = null;

        const layout = (hoveredSlot: number | null, duration = 0.55) => {
          const spread = getSpread();
          cards.forEach((card, slot) => {
            const base = fanSlot(slot, count, spread);
            let { x, y, rot, scale } = base;
            let delay = 0;
            if (hoveredSlot !== null) {
              const dist = Math.abs(slot - hoveredSlot);
              delay = dist * 0.02;
              if (slot === hoveredSlot) {
                // Lift, straighten, come to front — the card becomes readable.
                y -= 28;
                rot = 0;
                scale = Math.min(1, scale * 1.06);
              } else {
                const push = 110 / dist;
                x += slot < hoveredSlot ? -push : push;
                rot += (slot < hoveredSlot ? -3 : 3) / dist;
              }
            } else {
              delay = Math.abs(slot - half) * 0.02;
            }
            gsap.to(card, {
              x,
              y,
              rotation: rot,
              scale,
              duration,
              delay,
              ease: "elastic.out(1, 0.75)",
              overwrite: "auto",
            });
            gsap.set(card, { zIndex: slot === hoveredSlot ? count + 6 : base.z });
          });
        };

        // Elastic entry from below, staggered left→right, plays once.
        const spread = getSpread();
        cards.forEach((card, slot) => {
          const t = fanSlot(slot, count, spread);
          gsap.set(card, {
            x: t.x * 0.4,
            y: t.y + 140,
            rotation: 0,
            scale: 0.6,
            autoAlpha: 0,
            zIndex: t.z,
          });
        });
        ScrollTrigger.create({
          trigger: root,
          start: "top 80%",
          once: true,
          onEnter: () => {
            cards.forEach((card, slot) => {
              const t = fanSlot(slot, count, spread);
              gsap.to(card, {
                x: t.x,
                y: t.y,
                rotation: t.rot,
                scale: t.scale,
                autoAlpha: 1,
                duration: 1.1,
                ease: "elastic.out(1.05, 0.78)",
                delay: slot * 0.08,
                onComplete: slot === count - 1 ? () => { entering = false; } : undefined,
              });
            });
          },
        });

        const enterHandlers = cards.map((card, slot) => {
          const onEnter = () => {
            if (entering) return;
            if (leaveTimer) {
              clearTimeout(leaveTimer);
              leaveTimer = null;
            }
            if (hovered !== slot) {
              hovered = slot;
              layout(slot);
            }
          };
          card.addEventListener("mouseenter", onEnter);
          return onEnter;
        });

        const onLeave = () => {
          if (entering) return;
          if (leaveTimer) clearTimeout(leaveTimer);
          leaveTimer = setTimeout(() => {
            hovered = null;
            layout(null);
          }, 60);
        };
        root.addEventListener("mouseleave", onLeave);

        const onResize = () => {
          if (entering) return;
          sizeStage();
          layout(hovered, 0.3);
        };
        window.addEventListener("resize", onResize);

        return () => {
          cards.forEach((card, slot) => card.removeEventListener("mouseenter", enterHandlers[slot]));
          root.removeEventListener("mouseleave", onLeave);
          window.removeEventListener("resize", onResize);
          if (leaveTimer) clearTimeout(leaveTimer);
          root.classList.remove("home-use-cases--fan");
          root.style.height = "";
          gsap.set(cards, { clearProps: "transform,opacity,visibility,zIndex" });
        };
      });
    },
    { scope: rootRef },
  );

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const mm = gsap.matchMedia();
      // Motion only when the visitor allows it — otherwise the CSS resting
      // state (finished conversation, reaction visible) is what renders.
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const cards = gsap.utils.toArray<HTMLElement>(root.querySelectorAll(".home-use-case-card"));

        cards.forEach((card, i) => {
          const q = gsap.utils.selector(card);
          const typing = q('[data-uc="typing"]')[0] as HTMLElement | undefined;

          // Initial states (from-values) — set imperatively so SSR/no-JS
          // markup stays final-state.
          gsap.set(q('[data-uc="user"]'), {
            autoAlpha: 0,
            y: 10,
            scale: 0.92,
            transformOrigin: "bottom left",
          });
          gsap.set(q('[data-uc="divider"]'), { autoAlpha: 0 });
          gsap.set(q('[data-uc="agent"]'), {
            autoAlpha: 0,
            y: 10,
            scale: 0.92,
            transformOrigin: "bottom left",
          });
          gsap.set(q('[data-uc="reply-text"]'), { autoAlpha: 0 });
          gsap.set(q('[data-uc="artifact"]'), { autoAlpha: 0 });
          gsap.set(q('[data-uc="reaction"]'), { scale: 0, transformOrigin: "bottom left" });
          gsap.set(q(".home-use-case-card__copy > *"), { autoAlpha: 0, y: 12, filter: "blur(6px)" });

          const tl = gsap.timeline({
            delay: i * 0.18, // ripple left→right when cards in a row enter together
            scrollTrigger: { trigger: card, start: "top 78%", once: true },
            onComplete: () => {
              // Post-play ambient life: the receipt gently floats. ±2px,
              // felt-not-watched; killed with the gsap context on unmount.
              gsap.to(q('[data-uc="artifact"]'), {
                y: "-=2",
                duration: 3,
                ease: "sine.inOut",
                yoyo: true,
                repeat: -1,
              });
            },
          });

          // Copy layer — blur-up editorial voice (distinct from the chat's
          // spring voice so the section doesn't read as a clown car).
          tl.to(q(".home-use-case-card__copy > *"), {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.55,
            ease: "expo.out",
            stagger: 0.09,
          });

          // The ask — origin-anchored spring (overshoot on scale/y only).
          tl.to(
            q('[data-uc="user"]'),
            { autoAlpha: 1, y: 0, scale: 1, duration: 0.42, ease: "back.out(1.7)" },
            "<0.1",
          );

          // Time passes — the dead air IS the story.
          tl.to(
            q('[data-uc="divider"]'),
            { autoAlpha: 0.75, duration: 0.4, ease: "power2.out" },
            "+=0.35",
          );

          // Pancake starts "typing"…
          tl.to(
            q('[data-uc="agent"]'),
            { autoAlpha: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.5)" },
            "+=0.25",
          );
          if (typing) {
            tl.set(typing, { display: "inline-flex" });
            tl.to(q('[data-uc="typing"] i'), {
              y: -3,
              duration: 0.26,
              ease: "sine.inOut",
              stagger: 0.12,
              yoyo: true,
              repeat: 3,
            });
            tl.set(typing, { display: "none" });
          }

          // …and delivers.
          tl.to(q('[data-uc="reply-text"]'), { autoAlpha: 1, duration: 0.3, ease: "power2.out" });

          // Receipt stamp — arrives from above the plane, settles at -1deg.
          tl.fromTo(
            q('[data-uc="artifact"]'),
            { autoAlpha: 0, scale: 1.3, rotate: -5, filter: "blur(2px)" },
            {
              autoAlpha: 1,
              scale: 1,
              rotate: -1,
              filter: "blur(0px)",
              duration: 0.32,
              ease: "power4.out",
            },
            "+=0.35",
          );
          // Fake haptic: the card takes the hit.
          tl.to(card, { y: "+=2", duration: 0.06, yoyo: true, repeat: 1 }, "<0.1");

          // Delight payoff: the founder reacts to done work.
          tl.to(
            q('[data-uc="reaction"]'),
            { scale: 1, duration: 0.35, ease: "back.out(2.5)" },
            "+=0.5",
          );
        });

        ScrollTrigger.refresh();
      });
    },
    { scope: rootRef },
  );

  return (
    <div className="home-use-cases" ref={rootRef}>
      {USE_CASES.map((useCase) => (
        <article key={useCase.id} className="home-use-case-card" data-accent={useCase.accent}>
          <div className="home-use-case-card__chat">
            <UserMessage user={useCase.user} />
            <TimeJumpDivider label={useCase.elapsed} />
            <AgentMessage agent={useCase.agent} artifact={useCase.artifact} />
          </div>
          <div className="home-use-case-card__copy">
            <p className="home-use-case-card__kicker">{useCase.kicker}</p>
            <h3 className="home-use-case-card__headline">{useCase.headline}</h3>
            <p className="home-use-case-card__body">{useCase.body}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

/** Slack date-divider grammar carrying the elapsed time between ask and reply. */
function TimeJumpDivider({ label }: { label: string }) {
  return (
    <div className="home-use-case-divider" data-uc="divider">
      <span className="home-use-case-divider__line" aria-hidden />
      <span>{label}</span>
      <span className="home-use-case-divider__line" aria-hidden />
    </div>
  );
}

function UserMessage({ user }: { user: UseCase["user"] }) {
  return (
    <div className="flex items-start gap-3" data-uc="user">
      <div
        className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[6px] shadow-[inset_0_-1px_0_rgba(0,0,0,0.10),inset_0_0_0_1px_rgba(0,0,0,0.06)]"
        aria-hidden
        style={{ backgroundColor: user.accent }}
      >
        <span className="text-[15px] font-bold leading-none" style={{ color: user.accentInk }}>
          {user.initial}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-[15px] font-bold text-[#1d1c1d]">{user.name}</span>
          <span className="text-[12px] font-normal text-[#616061]">{user.time}</span>
        </div>
        <p className="mt-1 whitespace-pre-line text-[15px] font-normal leading-[1.46668] text-[#1d1c1d]">
          {user.text}
        </p>
        {/* Pops in after the artifact lands; static without JS/motion. */}
        <span className="home-use-case-reaction" data-uc="reaction" aria-hidden>
          🥞 1
        </span>
      </div>
    </div>
  );
}

function AgentMessage({
  agent,
  artifact,
}: {
  agent: UseCase["agent"];
  artifact: UseCase["artifact"];
}) {
  return (
    <div className="flex items-start gap-3" data-uc="agent">
      <div
        className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[6px] bg-[#FFF1DA] shadow-[inset_0_-1px_0_rgba(0,0,0,0.10),inset_0_0_0_1px_rgba(0,0,0,0.06)]"
        aria-hidden
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- pancake mascot raster */}
        <img
          src="/pancake-monster.png"
          alt=""
          width={32}
          height={32}
          className="block h-8 w-8 object-contain"
          loading="lazy"
          decoding="async"
        />
      </div>
      {/* `relative` anchors the absolutely-positioned typing pill. */}
      <div className="relative min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-[15px] font-bold text-[#1d1c1d]">pancake</span>
          <span className="rounded-[3px] bg-[#e8e8e8] px-1 py-px text-[10px] font-bold uppercase tracking-wide text-[#616061]">
            APP
          </span>
          <span className="text-[12px] font-normal text-[#616061]">{agent.time}</span>
        </div>
        {/* Typing beat — display flipped by the timeline only. */}
        <span className="home-use-case-typing" data-uc="typing" aria-hidden>
          <i />
          <i />
          <i />
        </span>
        <p
          className="mt-1 whitespace-pre-line text-[15px] font-normal leading-[1.46668] text-[#1d1c1d]"
          data-uc="reply-text"
        >
          {agent.text}
        </p>
        <ArtifactChip artifact={artifact} />
      </div>
    </div>
  );
}

/** Slack-attachment-style chip — the proof the reply shipped real work. */
function ArtifactChip({ artifact }: { artifact: UseCase["artifact"] }) {
  return (
    <figure className="home-use-case-artifact" data-uc="artifact" aria-label={artifact.title}>
      <span className="home-use-case-artifact__icon" data-icon={artifact.icon} aria-hidden>
        <ArtifactGlyph icon={artifact.icon} />
      </span>
      <span className="home-use-case-artifact__text">
        <span className="home-use-case-artifact__title">{artifact.title}</span>
        <span className="home-use-case-artifact__meta">{artifact.meta}</span>
      </span>
    </figure>
  );
}

function ArtifactGlyph({ icon }: { icon: UseCase["artifact"]["icon"] }) {
  if (icon === "pr") {
    // Git pull-request glyph.
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
        <circle cx="4.5" cy="4.5" r="2" stroke="currentColor" strokeWidth="2" />
        <circle cx="4.5" cy="13.5" r="2" stroke="currentColor" strokeWidth="2" />
        <circle cx="13.5" cy="13.5" r="2" stroke="currentColor" strokeWidth="2" />
        <path d="M4.5 6.5V11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path
          d="M9 4.5H11A2.5 2.5 0 0 1 13.5 7V11.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (icon === "sheet") {
    // Spreadsheet glyph — table with a header row and column split.
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
        <rect x="2.5" y="2.5" width="13" height="13" rx="1.5" stroke="currentColor" strokeWidth="2" />
        <path d="M2.5 7H15.5" stroke="currentColor" strokeWidth="2" />
        <path d="M7.5 7V15.5" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }
  if (icon === "leads") {
    // Target glyph — qualified leads in the crosshairs.
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
        <circle cx="9" cy="9" r="6.75" stroke="currentColor" strokeWidth="2" />
        <circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="2" />
        <circle cx="9" cy="9" r="0.9" fill="currentColor" />
      </svg>
    );
  }
  // Document glyph with a folded corner.
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d="M10.5 1.5H5.5A1.5 1.5 0 0 0 4 3V15A1.5 1.5 0 0 0 5.5 16.5H12.5A1.5 1.5 0 0 0 14 15V5L10.5 1.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M10.5 1.5V5H14" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M7 9.5H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 12H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
