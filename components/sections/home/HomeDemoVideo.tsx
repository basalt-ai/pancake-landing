"use client";

/**
 * "Meet Pancake" film band, v4.4 split layout (founder feedback on v4.3:
 * the chapter list read sloppy and low-value — chapters belong on demo
 * pages, not on a 51-second homepage film).
 *
 * LAYOUT — copy column LEFT (the claim), film RIGHT (the proof): the
 * pattern all leaders use for the first media+copy row (Linear, Stripe,
 * Attio, Clay, Loom, Figma, Notion — NN/g F-pattern: the left edge gets
 * the text). Column stack: benefit heading one tier below H2 → one short
 * body line → text CTA (primary buttons stay reserved for hero + closing
 * band). No eyebrow — no other section on the page uses a kicker.
 *
 * AMBIENT: 12s silent teaser (6s–18s of the master) as the living poster —
 * IntersectionObserver lazy-load + play/pause, skipped under
 * prefers-reduced-motion / Save-Data. Frame scale-reveals 0.94 → 1 on
 * scroll (transform-only, no pin).
 *
 * FILM: click (frame or watch link) swaps IN PLACE to the 51s master
 * with sound; master is preload="none" until hover intent; Escape
 * or film end returns to ambient. VideoObject JSON-LD lives in
 * `app/page.tsx`; the film's typography is mirrored in a visually-hidden
 * transcript (WCAG 1.2.1 + GEO).
 */

import { useEffect, useRef, useState } from "react";

import { HOME_PAGE_CONTAINER_CLASS } from "@/components/sections/home/home-layout";
import { gsap, useGSAP } from "@/lib/gsap";

import "@/app/_styles/home-film.css";

const POSTER_SRC = "/demo-video-poster-live.jpg"; // frame at 6s = teaser's first frame (seamless swap)
const TEASER_SRC = "/demo-video-teaser.mp4"; // 12s, 720p, audio stripped, ~680 KB
const FILM_SRC = "/demo-video.mp4"; // 51s master

/** Faithful mirror of the film's on-screen typography + UI beats. */
const FILM_TRANSCRIPT = [
  "Meet Pancake. The OpenClaw cofounder that makes your company autonomous. Lives with you in Slack, Messages, Mail.",
  "Pancake: “Hey hey! 👋 I'm Pancake, I'm here to help make your company more autonomous. I already went through all the material you provided about your company. Adding to company brain.”",
  "Mike: “I suck at GTM, can you run it for me?” Pancake spins up a LinkedIn outreach agent, a content skill, a lead magnet agent, and hires a Reddit squad. Autonomy level: 24.28%.",
  "Mike: “What would I do without you.” Pancake: “Probably miss your 2pm.” Mike: “What squads do you think I should hire next?” The squad store: AI SEO squad, Outreach squad, Reddit squad.",
  "Daily digest delivered, blog post live, weekly citation audit complete, PR merged. Autonomy level: 79.00%… 99.86%.",
  "Stop hiring agents. Pancake handles. getpancake.ai",
].join(" ");

export function HomeDemoVideo() {
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const teaserRef = useRef<HTMLVideoElement>(null);
  const filmRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  // Ambient teaser: lazy-load near viewport, play/pause on visibility.
  useEffect(() => {
    const teaser = teaserRef.current;
    if (!teaser) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    type NetInfo = { saveData?: boolean };
    const connection = (navigator as Navigator & { connection?: NetInfo }).connection;
    if (connection?.saveData) return;

    let loaded = false;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (!loaded) {
              teaser.src = TEASER_SRC;
              teaser.load();
              loaded = true;
            }
            void teaser.play().catch(() => {});
          } else {
            teaser.pause();
          }
        }
      },
      { rootMargin: "200px", threshold: 0.15 },
    );
    io.observe(teaser);
    return () => io.disconnect();
  }, []);

  // Scroll-scale entrance: transform-only, no pin, reduced-motion guarded.
  useGSAP(
    () => {
      const frame = frameRef.current;
      const section = sectionRef.current;
      if (!frame || !section) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          frame,
          { scale: 0.94, borderRadius: 32 },
          {
            scale: 1,
            borderRadius: 16,
            ease: "none",
            scrollTrigger: { trigger: section, start: "top 85%", end: "top 35%", scrub: 0.8 },
          },
        );
      });
    },
    { scope: sectionRef },
  );

  // Escape returns to the ambient state.
  useEffect(() => {
    if (!started) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") backToAmbient();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // Scrolling away ends the screening (founder: sound must never keep
  // playing from off-screen) — same exit path as Escape, so the muted
  // ambient teaser takes back over.
  useEffect(() => {
    if (!started) return;
    const section = sectionRef.current;
    if (!section) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) backToAmbient();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(section);
    return () => io.disconnect();
  });

  /** Start the film from the top, with sound. */
  const startFilm = () => {
    const film = filmRef.current;
    if (!film) return;
    teaserRef.current?.pause();
    setStarted(true);
    film.muted = false;
    film.currentTime = 0;
    void film.play();
  };

  const backToAmbient = () => {
    filmRef.current?.pause();
    setStarted(false);
    void teaserRef.current?.play().catch(() => {});
  };

  /** Hover intent → warm the master's metadata so click-to-play is instant. */
  const warmFilm = () => {
    const film = filmRef.current;
    if (film && film.preload === "none") film.preload = "metadata";
  };

  return (
    <section ref={sectionRef} className="home-demo-video" aria-label="Meet Pancake: the film">
      <div className={`home-demo-video__wrap ${HOME_PAGE_CONTAINER_CLASS}`} onPointerEnter={warmFilm}>
        <div className="home-film">
          <div className="home-film__intro">
            <h2 className="heading home-film__heading">Meet Pancake in 51 seconds</h2>
            <p className="home-film__body">
              One coworker in Slack. A whole team behind it. Watch the autonomy level climb to
              99.86%.
            </p>
            <button type="button" className="home-film__watch" onClick={startFilm}>
              Watch with sound
              <span className="home-film__watch-arrow" aria-hidden>
                →
              </span>
            </button>
          </div>

          <div className="home-film__media">
            {/* eslint-disable-next-line @next/next/no-img-element -- decorative mascot peek */}
            <img className="home-film__mascot" src="/pancake-monster.png" alt="" width={68} height={68} loading="lazy" decoding="async" />

            <div ref={frameRef} className={`home-film__frame${started ? " home-film__frame--playing" : ""}`}>
              {/* Ambient teaser — silent 12s loop, src promoted by the observer. */}
              <video
                ref={teaserRef}
                className="home-film__player home-film__teaser"
                muted
                loop
                playsInline
                preload="none"
                poster={POSTER_SRC}
                width={1280}
                height={720}
                aria-hidden
                tabIndex={-1}
              />

              {/* The full film — zero bytes until intent. */}
              <video
                ref={filmRef}
                className="home-film__player home-film__film"
                playsInline
                preload="none"
                poster={POSTER_SRC}
                controls={started}
                onEnded={backToAmbient}
              >
                <source src={FILM_SRC} type="video/mp4" />
              </video>

              {!started && (
                <>
                  {/* Whole-frame click target — no play chip: the ambient
                      teaser already signals video, and the "Watch with
                      sound" link carries the visible affordance. */}
                  <button
                    type="button"
                    className="home-film__cta"
                    onClick={startFilm}
                    aria-label="Play the Pancake film, 51 seconds, with sound"
                  />
                  <span className="home-film__duration" aria-hidden>
                    0:51
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Film-as-text: kept in the DOM for WCAG 1.2.1 + GEO crawlers,
            visually hidden (the visible disclosure read as clutter). */}
        <p className="home-film__transcript">{FILM_TRANSCRIPT}</p>
      </div>
    </section>
  );
}
