"use client";

/**
 * "Meet Pancake" film band, v4.2 "living film" treatment (validated by the
 * founder; pattern = Screen Studio's dual-video + Monaco's affordance
 * anatomy + Clay's scroll reveal):
 *
 *   AMBIENT: a 12s silent teaser cut of the film (6s–18s of the master)
 *   autoplays muted/loop inline as the living poster. It lazy-loads via
 *   IntersectionObserver (zero teaser bytes until the band approaches),
 *   pauses off-screen, and is skipped entirely under prefers-reduced-motion
 *   or Save-Data (static poster remains). The frame scale-reveals 0.92 → 1
 *   on scroll (transform-only, no pin — CLS-exempt).
 *
 *   FILM: click anywhere swaps IN PLACE (no lightbox) to the full 51s
 *   master with sound + native controls from 0:00. The master is
 *   preload="none" — zero bytes until intent; hovering the band upgrades it
 *   to preload="metadata" so playback starts instantly. Escape (or the film
 *   ending) returns to the ambient state.
 *
 * The VideoObject JSON-LD for this film lives in `app/page.tsx`; the
 * on-screen typography is mirrored below as a crawlable transcript
 * (WCAG 1.2.1 media alternative + GEO).
 */

import { useEffect, useRef, useState } from "react";

import { gsap, useGSAP } from "@/lib/gsap";

import "@/app/_styles/home-film.css";

const POSTER_SRC = "/demo-video-poster-live.jpg"; // frame at 6s = teaser's first frame (seamless swap)
const TEASER_SRC = "/demo-video-teaser.mp4"; // 12s, 720p, audio stripped, ~680 KB
const FILM_SRC = "/demo-video.mp4"; // 51s master

/** Faithful mirror of the film's on-screen typography + UI beats. */
const FILM_TRANSCRIPT = [
  "Meet Pancake. The OpenClaw cofounder that makes your company autonomous. Lives with you in Slack, Messages, Mail.",
  "Pancake: “Hey hey! 👋 I'm Pancake, I'm here to make your company more autonomous. I already went through all the material you provided about your company. Adding to company brain.”",
  "Mike: “I suck at GTM, can you run it for me?” — Pancake spins up a LinkedIn outreach agent, a content skill, a lead magnet agent, and hires a Reddit squad. Autonomy level: 24.28%.",
  "Mike: “What would I do without you.” Pancake: “Probably miss your 2pm.” — “What squads do you think I should hire next?” The squad store: AI SEO squad, Outreach squad, Reddit squad.",
  "Daily digest delivered, blog post live, weekly citation audit complete, PR merged. Autonomy level: 79.00%… 99.86%.",
  "Stop hiring agents — Pancake handles. getpancake.ai",
].join(" ");

export function HomeDemoVideo() {
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const teaserRef = useRef<HTMLVideoElement>(null);
  const filmRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  // Ambient teaser: lazy-load near viewport, play/pause on visibility.
  // Skipped under reduced-motion / Save-Data — the static poster remains
  // and the play chrome is the only affordance (as before v4.2).
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

  // Scroll-scale entrance: frame grows 0.92 → 1 while its radius relaxes.
  // Transform-only (CLS-exempt), scrub with catch-up smoothing, NO pin —
  // the Slack simulation below must stay freely reachable.
  useGSAP(
    () => {
      const frame = frameRef.current;
      const section = sectionRef.current;
      if (!frame || !section) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          frame,
          { scale: 0.92, borderRadius: 32 },
          {
            scale: 1,
            borderRadius: 16,
            ease: "none",
            scrollTrigger: { trigger: section, start: "top 85%", end: "top 30%", scrub: 0.8 },
          },
        );
      });
    },
    { scope: sectionRef },
  );

  // Escape returns to the ambient state (fullscreen Esc exits fullscreen
  // first — the second press lands here).
  useEffect(() => {
    if (!started) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") backToAmbient();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const startFilm = () => {
    const film = filmRef.current;
    if (!film) return;
    teaserRef.current?.pause();
    setStarted(true);
    // Always from the head, with sound — the teaser is a re-cut, not the
    // film's opening, so resuming from its loop position would be nonsense.
    film.muted = false;
    film.currentTime = 0;
    void film.play();
  };

  const backToAmbient = () => {
    const film = filmRef.current;
    film?.pause();
    setStarted(false);
    void teaserRef.current?.play().catch(() => {});
  };

  /** Hover intent → warm the master's metadata so click-to-play is instant. */
  const warmFilm = () => {
    const film = filmRef.current;
    if (film && film.preload === "none") film.preload = "metadata";
  };

  return (
    <section ref={sectionRef} className="home-demo-video" aria-label="Meet Pancake — the film">
      <div className="home-demo-video__wrap home-film__wrap" onPointerEnter={warmFilm}>
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative mascot peek */}
        <img className="home-film__mascot" src="/pancake-monster.png" alt="" width={76} height={76} loading="lazy" decoding="async" />

        <div ref={frameRef} className={`home-demo-video__frame home-film__frame${started ? " home-film__frame--playing" : ""}`}>
          {/* Ambient teaser — silent 12s loop, src promoted by the observer. */}
          <video
            ref={teaserRef}
            className="home-demo-video__player home-film__teaser"
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
            className="home-demo-video__player home-film__film"
            playsInline
            preload="none"
            poster={POSTER_SRC}
            controls={started}
            onEnded={backToAmbient}
          >
            <source src={FILM_SRC} type="video/mp4" />
          </video>

          {!started && (
            <button
              type="button"
              className="home-film__cta"
              onClick={startFilm}
              aria-label="Play the Pancake film — 51 seconds, with sound"
            >
              <span className="home-film__play" aria-hidden>
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M8 5.14v13.72a1 1 0 0 0 1.54.84l10.79-6.86a1 1 0 0 0 0-1.68L9.54 4.3A1 1 0 0 0 8 5.14Z" />
                </svg>
              </span>
              <span className="home-film__chip" aria-hidden>
                Watch with sound · 0:51
              </span>
            </button>
          )}
        </div>

        {/* Film-as-text: WCAG 1.2.1 media alternative + crawlable GEO copy. */}
        <details className="home-film__transcript">
          <summary>Read the film as text</summary>
          <p>{FILM_TRANSCRIPT}</p>
        </details>
      </div>
    </section>
  );
}
