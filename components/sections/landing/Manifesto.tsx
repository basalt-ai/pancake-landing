"use client";

/**
 * The manifesto — the page's dark chapter, now a free-scrolling editorial
 * argument (v3, "The Distance"). Three beats, all readable at a glance:
 *
 *   1. The claim (H2) with the founder's three reasons ruled beside it.
 *   2. ONE diagram that literalises the H2 by length: Building is a short
 *      solid mint row (Idea → a few prompts → ✓ Live); Selling is a long
 *      dashed row of five open jobs (You reach them / They find you) that only
 *      ends at Customers, with a mint bracket underneath: "Pancake runs this."
 *   3. The turn (Pancake does the selling, end to end, and buyers answer) with
 *      the three quality rules as a ruled definition list.
 *
 * No pin, no scrub. Text reveals once on enter (CSS transitions gated on
 * html.lv2-anim, IntersectionObserver). The diagram plays ONE GSAP timeline
 * on enter: the four old build steps fold into the single prompt card, the
 * mint row completes, then the long selling row draws out and stays long.
 * Afterwards only the pink live dots breathe, the dashed rail creeps and the
 * caret blinks. The CSS default IS the resolved end state, so no-JS, reduced-
 * motion and pre-hydration visitors get the complete still.
 */

import { useEffect, useRef } from "react";

import { gsap, useGSAP } from "@/lib/gsap";

const REASONS = [
  {
    title: "Crowded from day one.",
    body: "Launching takes a weekend now. So everyone launched. Getting noticed is the hard part.",
  },
  {
    title: "There is no prompt for selling.",
    body: "It still runs on tools glued together by hand. Or on nothing at all.",
  },
  {
    title: "Buyers stopped answering.",
    body: "Years of mass mail taught people to skip anything that reads like a template. A reply now takes a real reason.",
  },
] as const;

/** The five open selling jobs, grouped by lane (index 3 starts "They find you"). */
const JOBS = ["Find buyers", "Write outreach", "Follow up", "Publish articles", "Get found on ChatGPT"] as const;

/** The four build steps that fold into "A few prompts" — JS-only props. */
const GHOSTS = ["Design", "Code", "Test", "Launch"] as const;

const RULES = [
  {
    label: "Precision",
    body: "Every person Pancake contacts has a real reason to hear from you. So they have a reason to answer.",
  },
  {
    label: "Taste",
    body: "What Pancake writes in your name matches your standards.",
  },
  {
    label: "Continuous improvement",
    body: (
      <>
        Each correction improves your agents, not everyone&rsquo;s. Your data stays yours.
      </>
    ),
  },
] as const;

const ART_LABEL =
  "Diagram. Building: from idea, a few prompts, then live. Selling: from live, five open jobs before the first customers. You reach them: find buyers, write outreach, follow up. They find you: publish articles, get found on ChatGPT. Pancake runs the whole selling row.";

export function Manifesto() {
  const sectionRef = useRef<HTMLElement>(null);
  const artRef = useRef<HTMLDivElement>(null);

  // ── Text reveals: one observer, add .is-in once, unobserve ──
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const items = Array.from(section.querySelectorAll<HTMLElement>(".lv2-mf-reveal"));
    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // ── The diagram: one paused timeline, played once on enter ──
  useGSAP(
    () => {
      const art = artRef.current;
      if (!art) return;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(art);
        const buildLabel = q('[data-row="build"] .lv2-mf-rowlabel');
        const sellLabel = q('[data-row="sell"] .lv2-mf-rowlabel');
        const beads = q(".lv2-mf-bead");
        const originText = q(".lv2-mf-origin b");
        const solid = q('.lv2-mf-line[data-kind="solid"]');
        const dashed = q('.lv2-mf-line[data-kind="dashed"]');
        const prompt = q(".lv2-mf-prompt");
        const done = q(".lv2-mf-done");
        const ping = q(".lv2-mf-ping");
        const chips = q(".lv2-mf-chip");
        const lanes = q(".lv2-mf-lane");
        const dest = q(".lv2-mf-dest");
        const bracket = q(".lv2-mf-bracket");
        const cap = q(".lv2-mf-cap");
        const ghosts = q(".lv2-mf-ghost");
        const ghostBox = q(".lv2-mf-ghosts");
        const ghostLine = q(".lv2-mf-ghostline");

        // Orientation: rows are horizontal tracks on wide screens, vertical
        // columns below (see landing-v2.css). Read it from the ghost box shape.
        const isVertical = () => {
          const el = ghostBox[0] as HTMLElement | undefined;
          return !!el && el.offsetHeight > el.offsetWidth;
        };
        const hidden = (vertical: boolean) => (vertical ? "inset(0 0 100% 0)" : "inset(0 100% 0 0)");

        // Rewind the resolved CSS scene into its opening state (JS-only).
        art.classList.remove("is-live");
        gsap.set([buildLabel, sellLabel, originText, prompt, done, chips, lanes, dest, cap], { autoAlpha: 0 });
        gsap.set(beads, { scale: 0, transformOrigin: "50% 50%" });
        gsap.set([solid, dashed, bracket], { clipPath: hidden(isVertical()) });
        gsap.set(ghostBox, { visibility: "visible" });
        gsap.set(ghosts, { autoAlpha: 0, x: 0, y: 0 });
        gsap.set(ghostLine, { visibility: "visible", clipPath: hidden(isVertical()) });

        const tl = gsap.timeline({
          paused: true,
          defaults: { ease: "power3.out" },
          onComplete: () => {
            art.classList.add("is-live");
            gsap.set([ghostBox, ghostLine], { visibility: "hidden" });
          },
        });

        // Beat 1 — the build row, the long way (Idea … Design · Code · Test · Launch).
        tl.fromTo(buildLabel, { y: 6 }, { autoAlpha: 1, y: 0, duration: 0.3 }, 0);
        tl.to(beads[0], { scale: 1, duration: 0.35, ease: "back.out(2)" }, 0);
        tl.to(originText[0], { autoAlpha: 1, duration: 0.3 }, 0.05);
        tl.to(ghostLine, { clipPath: "inset(0 0 0 0)", duration: 0.5 }, 0.05);
        tl.fromTo(
          ghosts,
          { autoAlpha: 0, scale: 0.96, y: () => (isVertical() ? 0 : 10), x: () => (isVertical() ? -10 : 0) },
          { autoAlpha: 1, scale: 1, x: 0, y: 0, duration: 0.4, ease: "back.out(1.8)", stagger: 0.06 },
          0.15
        );

        // Beat 2 — THE FOLD: four steps collapse into one prompt card.
        const delta = (axis: "x" | "y") => (i: number, target: Element) => {
          const to = (prompt[0] as HTMLElement).getBoundingClientRect();
          const from = (target as HTMLElement).getBoundingClientRect();
          return axis === "x" ? to.left - from.left : to.top - from.top;
        };
        tl.to(
          ghosts,
          { x: delta("x"), y: delta("y"), duration: 0.45, ease: "power2.in", stagger: { each: 0.05, from: "end" } },
          0.75
        );
        tl.to(ghosts, { autoAlpha: 0, duration: 0.15, stagger: { each: 0.05, from: "end" } }, 1.05);
        tl.to(ghostLine, { clipPath: () => hidden(isVertical()), duration: 0.45, ease: "power2.in" }, 0.75);

        // Beat 3 — the short mint row completes: prompt card, ✓ Live, aura.
        tl.to(solid, { clipPath: "inset(0 0 0 0)", duration: 0.35 }, 1.1);
        tl.fromTo(prompt, { y: 10, scale: 0.85 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, ease: "back.out(2)" }, 1.1);
        tl.fromTo(done, { scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.45, ease: "back.out(2.4)" }, 1.42);
        tl.fromTo(
          ping,
          { scale: 0.45, opacity: 0.6 },
          { scale: 1.5, opacity: 0, duration: 0.6, ease: "power2.out", immediateRender: false },
          1.52
        );

        // Beat 4 — the long selling row draws out, one open job at a time.
        tl.fromTo(sellLabel, { y: 6 }, { autoAlpha: 1, y: 0, duration: 0.3 }, 1.55);
        tl.to(beads[1], { scale: 1, duration: 0.35, ease: "back.out(2)" }, 1.55);
        tl.to(originText[1], { autoAlpha: 1, duration: 0.3 }, 1.6);
        tl.to(dashed, { clipPath: "inset(0 0 0 0)", duration: 1.1 }, 1.55);
        tl.fromTo(
          chips,
          { scale: 0.9, y: () => (isVertical() ? 0 : 12), x: () => (isVertical() ? -12 : 0) },
          { autoAlpha: 1, scale: 1, x: 0, y: 0, duration: 0.45, ease: "back.out(2)", stagger: 0.11 },
          1.68
        );
        tl.to(lanes[0], { autoAlpha: 1, duration: 0.3 }, 1.68);
        tl.to(lanes[1], { autoAlpha: 1, duration: 0.3 }, 2.01);
        tl.fromTo(dest, { scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.4, ease: "back.out(2)" }, 2.45);

        // Beat 5 — Pancake's bracket spans the whole row.
        tl.to(bracket, { clipPath: "inset(0 0 0 0)", duration: 0.55 }, 2.65);
        tl.fromTo(cap, { y: 6 }, { autoAlpha: 1, y: 0, duration: 0.35 }, 2.95);

        // Play once when the diagram enters (fires immediately for deep links).
        let played = false;
        const play = () => {
          if (played) return;
          played = true;
          tl.play(0);
        };
        // The story starts at the panel's top edge (the Building row), so it
        // may start as soon as that edge is ~48px into the viewport.
        const io = new IntersectionObserver(
          (entries) => {
            if (entries.some((e) => e.isIntersecting)) {
              play();
              io.disconnect();
            }
          },
          { threshold: 0, rootMargin: "0px 0px -48px 0px" }
        );
        io.observe(art);

        // Ambient loops pause while the diagram is off screen.
        const ioOff = new IntersectionObserver(
          (entries) => {
            art.classList.toggle("is-off", !entries.some((e) => e.isIntersecting));
          },
          { threshold: 0.05 }
        );
        ioOff.observe(art);

        return () => {
          io.disconnect();
          ioOff.disconnect();
          tl.kill();
          art.classList.remove("is-off");
          art.classList.add("is-live");
          gsap.set([ghostBox, ghostLine], { visibility: "hidden" });
        };
      });

      // Reduced motion: the CSS end state, ambient off (CSS), nothing to run.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        art.classList.add("is-live");
      });
    },
    { scope: artRef }
  );

  return (
    <section
      ref={sectionRef}
      id="why"
      className="lv2s lv2-manifesto"
      aria-labelledby="lv2-manifesto-title"
    >
      <div className="lv2-container">
        {/* ── Beat 1: the claim, the three reasons ── */}
        <div className="lv2-mf-grid lv2-mf-top">
          <div className="lv2-mf-head">
            <span className="badge lv2-mf-badge lv2-mf-badge--cream lv2-mf-reveal">Why Pancake exists</span>
            <h2 id="lv2-manifesto-title" className="lv2-manifesto-title lv2-mf-reveal" style={{ "--d": "60ms" } as React.CSSProperties}>
              <span className="ln">
                Building got <span className="nb">10x easier.</span>
              </span>
              <br />
              <span className="ln">Selling didn&rsquo;t.</span>
            </h2>
            <p className="lv2-mf-lede lv2-mf-reveal" style={{ "--d": "120ms" } as React.CSSProperties}>
              A working product is a few prompts away. Getting it in front of the people who&rsquo;ll buy
              it is still five jobs, all of them on you.
            </p>
          </div>
          <ol className="lv2-mf-reasons">
            {REASONS.map((r, i) => (
              <li
                key={r.title}
                className="lv2-mf-reason lv2-mf-reveal"
                style={{ "--d": `${150 + i * 90}ms` } as React.CSSProperties}
              >
                <h3 className="lv2-mf-rtitle">{r.title}</h3>
                <p className="lv2-mf-rbody">{r.body}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* ── Beat 2: the diagram ── */}
        <div ref={artRef} className="lv2-mf-art" role="img" aria-label={ART_LABEL}>
          <div className="lv2-mf-row" data-row="build" aria-hidden="true">
            <span className="badge lv2-mf-badge lv2-mf-badge--cream lv2-mf-rowlabel">Building</span>
            <div className="lv2-mf-track">
              <i className="lv2-mf-line" data-kind="solid" />
              <span className="lv2-mf-origin">
                <i className="lv2-mf-bead" data-tone="yellow" />
                <b>Idea</b>
              </span>
              <span className="lv2-mf-prompt">
                A few prompts
                <i className="lv2-mf-caret" />
              </span>
              <span className="lv2-mf-done">
                <b className="lv2-mf-check">&#10003;</b>
                Live
                <i className="lv2-mf-ping" />
              </span>
            </div>
            <i className="lv2-mf-ghostline" />
            <div className="lv2-mf-ghosts">
              {GHOSTS.map((g) => (
                <span key={g} className="lv2-mf-ghost">
                  {g}
                </span>
              ))}
            </div>
          </div>

          <div className="lv2-mf-row" data-row="sell" aria-hidden="true">
            <span className="badge lv2-mf-badge lv2-mf-badge--cream lv2-mf-rowlabel">Selling</span>
            <div className="lv2-mf-track">
              <i className="lv2-mf-line" data-kind="dashed" />
              <span className="lv2-mf-origin">
                <i className="lv2-mf-bead" data-tone="purple" />
                <b>Live</b>
              </span>
              {JOBS.map((job, i) => (
                <span
                  key={job}
                  className={
                    i === 0
                      ? "lv2-mf-chip lv2-mf-chip--lane1"
                      : i === 3
                        ? "lv2-mf-chip lv2-mf-chip--lane2"
                        : "lv2-mf-chip"
                  }
                  style={{ "--i": i } as React.CSSProperties}
                >
                  {i === 0 && <i className="lv2-mf-lane">You reach them</i>}
                  {i === 3 && <i className="lv2-mf-lane">They find you</i>}
                  <i className="lv2-mf-dot" />
                  {job}
                </span>
              ))}
              <span className="lv2-mf-dest">
                <i className="lv2-mf-ring" />
                <b>Customers</b>
              </span>
            </div>
            <i className="lv2-mf-bracket" />
            <p className="lv2-mf-cap">Pancake runs this.</p>
          </div>
        </div>

        {/* ── Beat 3: the turn, the three rules ── */}
        <div className="lv2-mf-grid lv2-mf-turn">
          <div className="lv2-mf-turncopy">
            <h3 className="lv2-mf-turn-title lv2-mf-reveal">
              So Pancake does the selling.
              <br />
              End to end.
              <br />
              <span className="lv2-mf-payoff">And buyers answer.</span>
            </h3>
            <p className="lv2-mf-turn-body lv2-mf-reveal" style={{ "--d": "80ms" } as React.CSSProperties}>
              The team of agents behind it reaches the people ready to buy and gets you found when
              they look. Never by volume. Three rules instead.
            </p>
            <a href="#lead-finding" className="lv2-mf-link lv2-mf-reveal" style={{ "--d": "160ms" } as React.CSSProperties}>
              How Pancake finds your next customers
              <span className="lv2-mf-arrow" aria-hidden="true">
                &rarr;
              </span>
            </a>
          </div>
          <dl className="lv2-mf-rules">
            {RULES.map((rule, i) => (
              <div
                key={rule.label}
                className="lv2-mf-rule lv2-mf-reveal"
                style={{ "--d": `${120 + i * 90}ms` } as React.CSSProperties}
              >
                <dt>
                  <span className="badge lv2-mf-badge" data-variant="success">
                    {rule.label}
                  </span>
                </dt>
                <dd>{rule.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
