"use client";

import { useEffect, useRef, useState } from "react";

import { MarkIcon } from "./MarkIcon";
import type { ReportState } from "./useReport";

/**
 * Owner.com-style scan cinematic. The rail narrates, the stage plays one
 * scene per step — and a SCHEDULER, not data arrival, drives the sequence:
 * every scene gets a minimum dwell so nothing flashes past or is skipped,
 * and a step only completes once its data actually exists. The ~35s Claude
 * analysis is absorbed by the ICP steps, which think out loud instead of
 * showing dead air.
 */

type StepDef = {
  key: string;
  label: string;
  minMs: number;
  ready: (s: ReportState) => boolean;
  /** Rotating "agent thinking" lines shown when the dwell is over but data isn't. */
  waitLines?: string[];
};

function stepDefs(domain: string): StepDef[] {
  return [
    {
      key: "site",
      label: `Reading ${domain}`,
      minMs: 6000,
      ready: (s) => s.meta !== null,
    },
    {
      key: "access",
      label: "Checking AI access",
      minMs: 7500,
      // Fallback on brain: if a scan ever emits fewer than 4 checks, the rail
      // must not hang here while later data lands invisibly.
      ready: (s) => s.checks.length >= 4 || s.brain !== null,
    },
    {
      key: "icp",
      label: "Finding your ICP",
      minMs: 11000,
      ready: (s) => s.brain !== null,
      waitLines: [
        "Reading every page the way a buyer would…",
        "Looking for who signs off on this…",
        "Naming your ideal customer…",
      ],
    },
    {
      key: "prompts",
      label: "What your ICP asks AI",
      minMs: 9000,
      ready: (s) => s.brain !== null,
      waitLines: [
        "Standing in your buyer's shoes…",
        "Writing the questions they'd ask an AI…",
        "Keeping only the ones with buying intent…",
      ],
    },
    {
      key: "chatgpt",
      label: "Asking ChatGPT, live",
      minMs: 10000,
      ready: (s) =>
        s.prompts.length > 0 &&
        (s.prompts.every((p) => p.status === "done") || s.score !== null),
      waitLines: ["Waiting on ChatGPT's answers…"],
    },
    {
      key: "google",
      label: "Checking Google money searches",
      minMs: 8000,
      ready: (s) => s.google !== null,
      waitLines: ["Pulling your real rankings…"],
    },
    {
      key: "tally",
      label: "Scoring it",
      minMs: 3500,
      ready: (s) => s.score !== null,
    },
  ];
}

export type TheaterSchedule = {
  index: number;
  done: boolean;
  remainingSec: number;
  /** Dwell served but data still pending — the scene is thinking out loud. */
  waiting: boolean;
  stepElapsedMs: number;
  progress: number;
};

/**
 * Drives the scene sequence. Lives in ReportExperience so the dashboard can
 * wait for the cinematic to finish even after the stream already delivered
 * everything. When every event is in, remaining scenes play at triple speed
 * (cache replays stay snappy); a hidden tab skips the theater entirely.
 */
export function useTheaterSchedule(state: ReportState): TheaterSchedule {
  const defs = stepDefs(state.domain || "your site");
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [, setTick] = useState(0);
  const stepStartRef = useRef(Date.now());
  const activeRef = useRef(false);

  // Cache replays burst everything at once — play those at triple speed. The
  // demo is a showpiece: it keeps the full cinematic even though its data is
  // instant.
  const allDataIn = state.score !== null && !state.demo;
  const running = (state.phase === "scanning" || state.phase === "report") && !done;

  // New scan → restart the schedule; leaving the funnel → reset.
  useEffect(() => {
    if (state.phase === "scanning" && !activeRef.current) {
      activeRef.current = true;
      setIndex(0);
      setDone(false);
      stepStartRef.current = Date.now();
    }
    if (state.phase === "idle" || state.phase === "error") {
      activeRef.current = false;
      setIndex(0);
      setDone(false);
    }
  }, [state.phase]);

  // Nobody watches a hidden tab's cinematic — hand the report over directly.
  useEffect(() => {
    const skipIfHidden = () => {
      if (document.hidden && activeRef.current) setDone(true);
    };
    document.addEventListener("visibilitychange", skipIfHidden);
    return () => document.removeEventListener("visibilitychange", skipIfHidden);
  }, []);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setTick((n) => n + 1), 250);
    return () => clearInterval(t);
  }, [running]);

  const effMin = (d: StepDef) => (allDataIn ? d.minMs / 3 : d.minMs);

  useEffect(() => {
    if (!activeRef.current || done) return;
    if (document.hidden && state.phase === "report") {
      setDone(true);
      return;
    }
    const def = defs[index]!;
    const elapsed = Date.now() - stepStartRef.current;
    if (elapsed >= effMin(def) && def.ready(state)) {
      if (index === defs.length - 1) {
        setDone(true);
      } else {
        setIndex(index + 1);
        stepStartRef.current = Date.now();
      }
    }
  });

  const stepElapsedMs = Date.now() - stepStartRef.current;
  let remainingMs = Math.max(0, effMin(defs[index]!) - stepElapsedMs);
  for (let i = index + 1; i < defs.length; i++) remainingMs += effMin(defs[i]!);
  const totalMs = defs.reduce((a, d) => a + d.minMs, 0);
  return {
    index,
    done,
    remainingSec: Math.max(1, Math.ceil(remainingMs / 1000)),
    waiting: stepElapsedMs >= effMin(defs[index]!) && !defs[index]!.ready(state),
    stepElapsedMs,
    progress: Math.min(0.97, 1 - remainingMs / totalMs),
  };
}

function Countdown({ schedule }: { schedule: TheaterSchedule }) {
  return (
    <div className="rpt-countdown">
      <span className="rpt-countdown-bar" aria-hidden>
        <span style={{ transform: `scaleX(${schedule.progress})` }} />
      </span>
      <p>
        {schedule.waiting || schedule.remainingSec <= 4
          ? "a few more seconds…"
          : `${schedule.remainingSec} seconds left`}
      </p>
    </div>
  );
}

/* ── Stage scenes — every one renders the real data of its step ── */

/** Rotating agent-observation card — the anti-dead-air device. */
function SceneThinking({ lines, elapsedMs }: { lines: string[]; elapsedMs: number }) {
  const line = lines[Math.floor(elapsedMs / 2600) % lines.length]!;
  return (
    <div className="rpt-scene-card rpt-scene-thinking">
      <span className="rpt-scene-dots" aria-hidden>
        <i />
        <i />
        <i />
      </span>
      <p key={line}>{line}</p>
    </div>
  );
}

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
  const [shotReady, setShotReady] = useState(false);
  return (
    <div className="rpt-scene-card rpt-scene-site">
      <div className="rpt-scene-browser-bar" aria-hidden>
        <i />
        <i />
        <i />
        <span>{state.domain}</span>
      </div>
      <div className="rpt-scene-og-wrap">
        {meta?.ogImage ? (
          // eslint-disable-next-line @next/next/no-img-element -- the visitor's own og:image
          <img className="rpt-scene-og" src={meta.ogImage} alt="" />
        ) : (
          <div className="rpt-scene-og rpt-scene-og-empty" aria-hidden />
        )}
        {state.domain && (
          // eslint-disable-next-line @next/next/no-img-element -- live capture of the visitor's site
          <img
            className="rpt-scene-shot"
            data-ready={shotReady}
            src={`https://image.thum.io/get/width/900/crop/620/noanimate/https://${state.domain}`}
            alt=""
            onLoad={() => setShotReady(true)}
          />
        )}
      </div>
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

function SceneAccess({ state }: { state: ReportState }) {
  return (
    <div className="rpt-scene-list">
      {state.checks.map((check, i) => (
        <div
          className="rpt-scene-row"
          data-pass={check.pass}
          key={check.id}
          style={{ animationDelay: `${i * 0.35}s` }}
        >
          <span className="rpt-scene-stamp" aria-hidden>
            <MarkIcon ok={check.pass} />
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

function SceneICP({ state, schedule }: { state: ReportState; schedule: TheaterSchedule }) {
  if (!state.brain) {
    return (
      <SceneThinking
        lines={stepDefs(state.domain)[2]!.waitLines!}
        elapsedMs={schedule.stepElapsedMs}
      />
    );
  }
  return (
    <div className="rpt-scene-card rpt-scene-icp">
      <span className="rpt-scene-eyebrow">Your ICP, as the agents read it</span>
      <p className="rpt-scene-icp-text">{state.brain.icp}</p>
      <span className="rpt-scene-icp-co">
        {state.brain.company} · {state.domain}
      </span>
    </div>
  );
}

function ScenePrompts({ state, schedule }: { state: ReportState; schedule: TheaterSchedule }) {
  if (!state.brain) {
    return (
      <SceneThinking
        lines={stepDefs(state.domain)[3]!.waitLines!}
        elapsedMs={schedule.stepElapsedMs}
      />
    );
  }
  return (
    <div className="rpt-scene-brain">
      <p className="rpt-scene-caption">The questions your ICP asks AI</p>
      <div className="rpt-scene-qgrid">
        {state.prompts.slice(0, 6).map((p, i) => (
          <div className="rpt-scene-card rpt-scene-q" key={i} style={{ animationDelay: `${i * 0.28}s` }}>
            <p>{p.prompt}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SceneChatGPT({ state }: { state: ReportState }) {
  return (
    <div className="rpt-scene-brain">
      <p className="rpt-scene-caption">Does ChatGPT recommend you? Asking for real.</p>
      <div className="rpt-scene-qgrid">
        {state.prompts.slice(0, 6).map((p, i) => {
          const settled = p.status === "done" && p.cited !== undefined;
          return (
            <div
              className="rpt-scene-card rpt-scene-q"
              data-cited={settled ? p.cited : undefined}
              key={i}
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              <p>{p.prompt}</p>
              <span className="rpt-scene-q-mark" data-state={p.status}>
                {settled ? (
                  <>
                    <i className="rpt-mini-mark" data-ok={p.cited}>
                      <MarkIcon ok={p.cited === true} size={8} />
                    </i>
                    {p.cited ? "recommended" : "not you"}
                  </>
                ) : (
                  "asking…"
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SceneGoogle({ state, schedule }: { state: ReportState; schedule: TheaterSchedule }) {
  const rows = state.google?.rows ?? [];
  if (!rows.length) {
    return (
      <SceneThinking
        lines={stepDefs(state.domain)[5]!.waitLines!}
        elapsedMs={schedule.stepElapsedMs}
      />
    );
  }
  return (
    <div className="rpt-scene-brain">
      <p className="rpt-scene-caption">Searches with money behind them.</p>
      <div className="rpt-scene-list rpt-scene-serp">
      {rows.slice(0, 5).map((row, i) => (
        <div className="rpt-scene-row" key={row.term} style={{ animationDelay: `${i * 0.3}s` }}>
          <span className="rpt-scene-pos" data-far={row.position === null || row.position > 10}>
            {row.position ? `#${row.position}` : "—"}
          </span>
          <div>
            <strong>{row.term}</strong>
            <p>{row.detail}</p>
          </div>
        </div>
      ))}
      </div>
    </div>
  );
}

const BAND_COLORS: [number, string][] = [
  [39, "var(--negative-stroke)"],
  [69, "var(--palette-yellow-30)"],
  [100, "var(--palette-green-20)"],
];

/** The drum roll: the score ring draws and counts up right before the reveal. */
function SceneTally({ state }: { state: ReportState }) {
  const target = state.score ?? 0;
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 2400);
      setShown(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  const R = 50;
  const C = 2 * Math.PI * R;
  const color = (BAND_COLORS.find(([cap]) => shown <= cap) ?? BAND_COLORS[2]!)[1];
  return (
    <div className="rpt-scene-adding">
      <div className="rpt-tally-ring">
        <svg viewBox="0 0 120 120" width="120" height="120" aria-hidden>
          <circle cx="60" cy="60" r={R} fill="none" stroke="var(--palette-chrome-30)" strokeWidth="9" />
          <circle
            cx="60"
            cy="60"
            r={R}
            fill="none"
            stroke={color}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - shown / 100)}
            transform="rotate(-90 60 60)"
          />
        </svg>
        <span className="rpt-tally-num">{shown}</span>
      </div>
      <p>Scoring what the agents found…</p>
    </div>
  );
}

export function ScanTheater({
  state,
  schedule,
}: {
  state: ReportState;
  schedule: TheaterSchedule;
}) {
  const defs = stepDefs(state.domain);
  const active = defs[schedule.index]!;

  return (
    <section className="rpt-theater">
      <aside className="rpt-rail">
        <div className="rpt-rail-card">
          <h2>Scanning {state.domain}…</h2>
          <ol className="rpt-rail-steps">
            {defs.map((step, i) => (
              <li
                key={step.key}
                data-done={i < schedule.index}
                data-active={i === schedule.index}
              >
                <span className="rpt-rail-dot" aria-hidden>
                  {i < schedule.index && <MarkIcon ok size={8} />}
                </span>
                {step.label}
              </li>
            ))}
          </ol>
        </div>
        <Countdown schedule={schedule} />
      </aside>

      <div className="rpt-stage">
        <div className="rpt-scene" key={active.key}>
          {active.key === "site" && <SceneSite state={state} />}
          {active.key === "access" && <SceneAccess state={state} />}
          {active.key === "icp" && <SceneICP state={state} schedule={schedule} />}
          {active.key === "prompts" && <ScenePrompts state={state} schedule={schedule} />}
          {active.key === "chatgpt" && <SceneChatGPT state={state} />}
          {active.key === "google" && <SceneGoogle state={state} schedule={schedule} />}
          {active.key === "tally" && <SceneTally state={state} />}
        </div>
        <span className="rpt-stage-horizon" aria-hidden />
      </div>
    </section>
  );
}
