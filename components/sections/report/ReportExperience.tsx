"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

import { ChecklistCard, GoogleCard, OpportunitiesCard, PromptsCard } from "./cards";
import { EmailGate } from "./EmailGate";
import { useReport } from "./useReport";

/** Count-up used by the score block: 0 → target over ~1.2s, ease-out. */
function useCountUp(target: number | null): number {
  const [value, setValue] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    if (target === null) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }
    const startAt = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - startAt) / 1200);
      setValue(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target]);
  return value;
}

const SNAKE_COLORS = [
  "var(--palette-yellow-30)",
  "var(--palette-purple-30)",
  "var(--palette-green-20)",
];

/** The landing's 13-circle snake, tamed into a progress row. */
function SnakeProgress({ progress }: { progress: number }) {
  return (
    <div className="rpt-snake" role="progressbar" aria-valuemin={0} aria-valuemax={13} aria-valuenow={progress}>
      {Array.from({ length: 13 }, (_, i) => (
        <span
          key={i}
          data-lit={i < progress}
          data-active={i === progress - 1}
          style={{ background: SNAKE_COLORS[i % 3] }}
        />
      ))}
    </div>
  );
}

function SiteChip({
  domain,
  favicon,
  ogImage,
  title,
}: {
  domain: string;
  favicon?: string;
  ogImage?: string;
  title?: string;
}) {
  return (
    <div className="rpt-chip">
      {favicon ? (
        // eslint-disable-next-line @next/next/no-img-element -- external favicon, unknown host
        <img src={favicon} alt="" width={28} height={28} />
      ) : (
        <span className="rpt-chip-dot" aria-hidden />
      )}
      <div>
        <strong>{domain}</strong>
        {title && <span>{title}</span>}
      </div>
      {ogImage && (
        // eslint-disable-next-line @next/next/no-img-element -- the visitor's own og:image
        <img className="rpt-chip-og" src={ogImage} alt={`Preview of ${domain}`} />
      )}
    </div>
  );
}

const VERDICTS: [number, string][] = [
  [40, "Invisible to the machines. All of it is fixable."],
  [70, "You show up. You don't get picked. That's the gap to close."],
  [101, "Strong footing. Now compound it."],
];

function ScoreBlock({ score, domain }: { score: number | null; domain: string }) {
  const shown = useCountUp(score);
  if (score === null) return null;
  const verdict = VERDICTS.find(([cap]) => score < cap)?.[1] ?? "";
  return (
    <Card variant="brand-alt-1" className="rpt-card rpt-score">
      <p className="rpt-eyebrow">AI GTM score</p>
      <div className="rpt-score-num" aria-label={`AI GTM score for ${domain}: ${score} out of 100`}>
        {shown}
        <span>/100</span>
      </div>
      <p>{verdict}</p>
    </Card>
  );
}

export function ReportExperience() {
  const { state, start, startDemo, unlock } = useReport();
  const [url, setUrl] = useState("");

  // Entrance styles are gated on this class so nothing hides without JS.
  useEffect(() => {
    document.documentElement.classList.add("rpt-anim");
    return () => document.documentElement.classList.remove("rpt-anim");
  }, []);

  const scanning = state.phase === "scanning";
  const showBoard = state.phase === "scanning" || state.phase === "report";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) start(url);
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
          <p className="rpt-eyebrow">Free AI GTM report</p>
          <h1>Would ChatGPT recommend&nbsp;you?</h1>
          <p className="rpt-sub">
            Drop your domain. We{"’"}ll build a mini Brain for your company, ask ChatGPT
            the questions your buyers ask, and check the Google searches with real buying
            intent. Takes under a minute.
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
            <Button type="submit" size="lg">
              Get my AI GTM report
            </Button>
          </form>
          <button type="button" className="rpt-demo-link" onClick={startDemo}>
            No site handy? Watch the doctolib.fr demo
          </button>
        </section>
      )}

      {showBoard && (
        <section className="rpt-board">
          <header className="rpt-board-head">
            <SiteChip
              domain={state.domain}
              favicon={state.meta?.favicon}
              ogImage={state.meta?.ogImage}
              title={state.meta?.title}
            />
            <div className="rpt-board-foot">
              <SnakeProgress progress={state.progress} />
              {scanning && (
                <p className="rpt-status" aria-live="polite">
                  {state.statusLine || "Warming up…"}
                </p>
              )}
              {state.demo && <p className="rpt-demo-tag">demo scan · sample data</p>}
            </div>
          </header>

          <div className="rpt-cards">
            <ChecklistCard state={state} />
            <PromptsCard state={state} />
            <GoogleCard state={state} />
            <OpportunitiesCard state={state} />
            <ScoreBlock score={state.score} domain={state.domain} />
            {state.phase === "report" && (
              <EmailGate unlocked={state.unlocked} onUnlock={unlock} />
            )}
          </div>
        </section>
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
            <Button type="submit" size="lg">
              Try again
            </Button>
          </form>
          <button type="button" className="rpt-demo-link" onClick={startDemo}>
            Scan doctolib.fr instead
          </button>
        </section>
      )}
    </main>
  );
}
