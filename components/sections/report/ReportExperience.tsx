"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/Input";

import { FxButton } from "./FxButton";
import { ReportDashboard } from "./ReportDashboard";
import { ScanTheater, useTheaterSchedule } from "./ScanTheater";
import { useReport } from "./useReport";

export function ReportExperience() {
  const { state, start, startDemo, unlock } = useReport();
  const [url, setUrl] = useState("");
  const scanStartRef = useRef(0);
  const dashRef = useRef<HTMLDivElement>(null);
  // The cinematic outlives the stream: the dashboard waits for the last scene.
  const schedule = useTheaterSchedule(state);
  const showDash = state.phase === "report" && schedule.done;

  // Entrance styles are gated on this class so nothing hides without JS.
  useEffect(() => {
    document.documentElement.classList.add("rpt-anim");
    return () => document.documentElement.classList.remove("rpt-anim");
  }, []);

  // Landing-hero handoff: /ai-gtm-report?url=acme.com starts the scan on
  // arrival. Plain location.search (not useSearchParams) so the route keeps
  // static rendering; the once-ref guards Strict Mode double-invocation.
  const autoStartedRef = useRef(false);
  useEffect(() => {
    if (autoStartedRef.current) return;
    const q = new URLSearchParams(window.location.search).get("url");
    if (!q || !q.trim()) return;
    autoStartedRef.current = true;
    setUrl(q.trim());
    scanStartRef.current = Date.now();
    start(q.trim());
  }, [start]);

  // Hand-off must land ON the report — wherever the page was scrolled during
  // the theater, the score and locked cards start in view.
  useEffect(() => {
    if (!showDash) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const raf = requestAnimationFrame(() => {
      dashRef.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(raf);
  }, [showDash]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      scanStartRef.current = Date.now();
      start(url);
    }
  };

  const demo = () => {
    scanStartRef.current = Date.now();
    startDemo();
  };

  return (
    <main className="rpt" data-phase={state.phase}>
      <nav className="rpt-nav">
        <Link href="/" className="rpt-wordmark" aria-label="Pancake">
          {/* eslint-disable-next-line @next/next/no-img-element -- same asset + treatment as the live landing nav */}
          <img src="/pancake-wordmark.png" alt="Pancake" />
        </Link>
      </nav>

      {state.phase === "idle" && (
        <section className="rpt-hero">
          <h1>
            Your buyers ask AI&nbsp;first.
            <br />
            Do you come&nbsp;up?
          </h1>
          <p className="rpt-sub">
            Pancake is a team of AI agents that run your GTM. This free scan shows how
            ChatGPT and Google see you — and what to fix first. One minute.
          </p>
          <form className="rpt-pill" onSubmit={submit}>
            <Input
              size="lg"
              placeholder="yourcompany.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              aria-label="Your company's domain"
              autoFocus
            />
            <FxButton type="submit" size="lg">
              Get my AI GTM report
            </FxButton>
          </form>
        </section>
      )}

      {(state.phase === "scanning" || (state.phase === "report" && !schedule.done)) && (
        <ScanTheater state={state} schedule={schedule} />
      )}

      {showDash && (
        <div ref={dashRef} className="rpt-dash-anchor">
          <ReportDashboard state={state} onUnlock={unlock} />
        </div>
      )}

      {state.phase === "error" && (
        <section className="rpt-hero">
          <h1 className="rpt-error-title">{state.error?.message}</h1>
          {state.error?.code === "unreachable" && (
            <p className="rpt-sub">
              Could be a typo, could be a firewall with opinions. Check the spelling, or watch
              the scan run on our demo company.
            </p>
          )}
          <form className="rpt-pill" onSubmit={submit}>
            <Input
              size="lg"
              placeholder="yourcompany.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              aria-label="Your company's domain"
            />
            <FxButton type="submit" size="lg">
              Try again
            </FxButton>
          </form>
          <button type="button" className="rpt-demo-link" onClick={demo}>
            Scan doctolib.fr instead
          </button>
        </section>
      )}
    </main>
  );
}
