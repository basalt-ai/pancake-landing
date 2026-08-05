"use client";

import { useEffect, useState } from "react";

import type { ReportState } from "./useReport";

/**
 * Owner.com-style scan: a fixed left rail (checklist + countdown) narrates
 * while the right stage plays one visual scene per step, each built from the
 * real data streaming in — nothing is decorative-only.
 */

const EXPECTED_SECONDS = 60;

type Step = { key: string; label: string; done: boolean };

function deriveSteps(state: ReportState, domain: string): Step[] {
  const promptsDone =
    state.prompts.length > 0 && state.prompts.every((p) => p.status === "done");
  return [
    { key: "site", label: `${domain} & how machines read it`, done: state.meta !== null },
    { key: "crawlers", label: "AI crawler access", done: state.checks.length >= 4 },
    { key: "brain", label: "Building your mini Brain", done: state.brain !== null },
    { key: "chatgpt", label: "Asking ChatGPT your buyers' questions", done: promptsDone },
    { key: "google", label: "Google money searches", done: state.google !== null },
    { key: "score", label: "Adding it up", done: state.score !== null },
  ];
}

function Countdown({ startedAt }: { startedAt: number }) {
  const [now, setNow] = useState(startedAt);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const elapsed = Math.floor((now - startedAt) / 1000);
  const remaining = EXPECTED_SECONDS - elapsed;
  const pct = Math.min(95, (elapsed / EXPECTED_SECONDS) * 100);
  return (
    <div className="rpt-countdown">
      <span className="rpt-countdown-bar" aria-hidden>
        <span style={{ transform: `scaleX(${pct / 100})` }} />
      </span>
      <p>{remaining > 4 ? `${remaining} seconds remaining` : "a few more seconds…"}</p>
    </div>
  );
}

/* ── Stage scenes — each renders the real data of its step ── */

/** Site icon with the fallback chain: declared icon → DuckDuckGo → nothing. */
function Favicon({ domain, favicon }: { domain: string; favicon?: string }) {
  const [step, setStep] = useState(0);
  useEffect(() => setStep(0), [domain, favicon]);
  const icons = [
    ...(favicon ? [favicon] : []),
    ...(domain ? [`https://icons.duckduckgo.com/ip3/${domain}.ico`] : []),
  ];
  const src = icons[step];
  if (!src) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- external favicon, unknown host
    <img src={src} alt="" width={28} height={28} onError={() => setStep((s) => s + 1)} />
  );
}

function SceneSite({ state }: { state: ReportState }) {
  const meta = state.meta;
  return (
    <div className="rpt-scene-card rpt-scene-site">
      {meta?.ogImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- the visitor's own og:image
        <img className="rpt-scene-og" src={meta.ogImage} alt="" />
      ) : (
        <div className="rpt-scene-og rpt-scene-og-empty" aria-hidden />
      )}
      <div className="rpt-scene-site-id">
        <Favicon domain={state.domain} favicon={meta?.favicon} />
        <div>
          <strong>{state.domain}</strong>
          {meta?.title && <span>{meta.title}</span>}
        </div>
      </div>
    </div>
  );
}

const CHECK_LABELS: Record<string, string> = {
  crawlers: "AI crawler access",
  llms: "llms.txt",
  schema: "Structured data",
  meta_quality: "Titles & descriptions",
};

function SceneCrawlers({ state }: { state: ReportState }) {
  return (
    <div className="rpt-scene-list">
      {state.checks.map((check, i) => (
        <div
          className="rpt-scene-row"
          data-pass={check.pass}
          key={check.id}
          style={{ animationDelay: `${i * 0.12}s` }}
        >
          <span className="rpt-scene-stamp" aria-hidden>
            {check.pass ? "✓" : "✕"}
          </span>
          <div>
            <strong>{CHECK_LABELS[check.id] ?? check.id}</strong>
            <p>{check.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function SceneBrain({ state }: { state: ReportState }) {
  return (
    <div className="rpt-scene-brain">
      {state.brain && (
        <div className="rpt-scene-card rpt-scene-icp">
          <span>Your ICP, as we read it</span>
          <p>{state.brain.icp}</p>
        </div>
      )}
      <div className="rpt-scene-fan">
        {state.prompts.slice(0, 4).map((p, i) => (
          <div className="rpt-scene-card rpt-scene-q" key={i} style={{ animationDelay: `${i * 0.15}s` }}>
            <p>{p.prompt}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SceneChatGPT({ state }: { state: ReportState }) {
  return (
    <div className="rpt-scene-qgrid">
      {state.prompts.slice(0, 6).map((p, i) => (
        <div
          className="rpt-scene-card rpt-scene-q"
          data-cited={p.status === "done" ? p.cited : undefined}
          key={i}
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          <p>{p.prompt}</p>
          <span className="rpt-scene-q-mark" data-state={p.status}>
            {p.status === "done" ? (p.cited ? "✓ cited" : "✕ not you") : "asking…"}
          </span>
        </div>
      ))}
    </div>
  );
}

function SceneGoogle({ state }: { state: ReportState }) {
  const rows = state.google?.rows ?? [];
  return (
    <div className="rpt-scene-list rpt-scene-serp">
      {rows.slice(0, 5).map((row, i) => (
        <div className="rpt-scene-row" key={row.term} style={{ animationDelay: `${i * 0.12}s` }}>
          <span className="rpt-scene-pos" data-far={row.position === null || row.position > 20}>
            {row.position ? `#${row.position}` : "—"}
          </span>
          <div>
            <strong>{row.term}</strong>
            <p>{row.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function SceneScore() {
  return (
    <div className="rpt-scene-adding">
      <span className="rpt-scene-dots" aria-hidden>
        <i />
        <i />
        <i />
      </span>
      <p>Adding it up…</p>
    </div>
  );
}

export function ScanTheater({ state, startedAt }: { state: ReportState; startedAt: number }) {
  const steps = deriveSteps(state, state.domain);
  const activeIndex = steps.findIndex((s) => !s.done);
  const active = steps[activeIndex === -1 ? steps.length - 1 : activeIndex]!;

  return (
    <section className="rpt-theater">
      <aside className="rpt-rail">
        <div className="rpt-rail-card">
          <h2>Scanning…</h2>
          <ol className="rpt-rail-steps">
            {steps.map((step, i) => (
              <li
                key={step.key}
                data-done={step.done}
                data-active={i === activeIndex}
              >
                <span className="rpt-rail-dot" aria-hidden />
                {step.label}
              </li>
            ))}
          </ol>
        </div>
        <Countdown startedAt={startedAt} />
      </aside>

      <div className="rpt-stage">
        <div className="rpt-scene" key={active.key}>
          {active.key === "site" && <SceneSite state={state} />}
          {active.key === "crawlers" && <SceneCrawlers state={state} />}
          {active.key === "brain" && <SceneBrain state={state} />}
          {active.key === "chatgpt" && <SceneChatGPT state={state} />}
          {active.key === "google" && <SceneGoogle state={state} />}
          {active.key === "score" && <SceneScore />}
        </div>
        <span className="rpt-stage-horizon" aria-hidden />
      </div>
    </section>
  );
}
