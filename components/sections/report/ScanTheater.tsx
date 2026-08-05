"use client";

import { useEffect, useRef, useState } from "react";

import { MarkIcon } from "./MarkIcon";
import type { PromptRow, ReportState } from "./useReport";

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
  /** Once data is in, hold the revealed result at least this long — the find
   *  is what the visitor came to see, not the loading. */
  revealMs?: number;
  /** Sequential deep-dive statements — a progression, never a loop. */
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
      revealMs: 4500,
      ready: (s) => s.brain !== null,
      waitLines: [
        "Reading every page the way a buyer would",
        "Collecting what the site promises",
        "Looking for who signs off on this",
        "Naming your ideal customer",
      ],
    },
    {
      key: "prompts",
      label: "What your ICP asks AI",
      minMs: 9000,
      revealMs: 4000,
      ready: (s) => s.brain !== null,
      waitLines: [
        "Standing in your buyer's shoes",
        "Writing the questions they'd ask an AI",
        "Keeping only the ones with buying intent",
      ],
    },
    {
      key: "chatgpt",
      label: "Asking ChatGPT, live",
      minMs: 10000,
      revealMs: 2500,
      ready: (s) =>
        s.prompts.length > 0 &&
        (s.prompts.every((p) => p.status === "done") || s.score !== null),
      waitLines: ["Waiting on ChatGPT's answers…"],
    },
    {
      key: "google",
      label: "Checking Google money searches",
      minMs: 8000,
      revealMs: 4500,
      ready: (s) => s.google !== null,
      waitLines: ["Pulling your real rankings", "Sorting by buying intent"],
    },
    {
      key: "tally",
      label: "Scoring it",
      // Count-up (2.4s) + a real hold on the landed number — the finale.
      minMs: 6000,
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
  /** 1 = full cinematic, 3 = cache-replay fast-forward. Scene-level gates
   *  (like the ICP dive beat) must divide by this too. */
  speed: number;
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
  const readyAtRef = useRef(0);
  const activeRef = useRef(false);
  const scoreAtIndexRef = useRef<number | null>(null);

  // Cache replays burst everything within the first scenes — only THOSE play
  // at triple speed. A live scan's score lands near the end; accelerating
  // there would speedrun the last steps, so it keeps the full cinematic.
  // The demo is a showpiece: full cinematic even though its data is instant.
  useEffect(() => {
    if (state.score !== null && scoreAtIndexRef.current === null) {
      scoreAtIndexRef.current = index;
    }
  }, [state.score, index]);
  const allDataIn =
    scoreAtIndexRef.current !== null && scoreAtIndexRef.current <= 1 && !state.demo;
  const running = (state.phase === "scanning" || state.phase === "report") && !done;

  // New scan → restart the schedule; leaving the funnel → reset.
  useEffect(() => {
    if (state.phase === "scanning" && !activeRef.current) {
      activeRef.current = true;
      setIndex(0);
      setDone(false);
      stepStartRef.current = Date.now();
      scoreAtIndexRef.current = null;
    }
    if (state.phase === "idle" || state.phase === "error") {
      activeRef.current = false;
      setIndex(0);
      setDone(false);
      scoreAtIndexRef.current = null;
    }
  }, [state.phase]);

  // Nobody watches a hidden tab's cinematic — hand the report over directly.
  // ONLY once the report is deliverable: hiding mid-scan must not kill the
  // schedule, or returning users find a frozen theater that never finishes.
  useEffect(() => {
    const skipIfHidden = () => {
      if (document.hidden && activeRef.current && state.phase === "report") setDone(true);
    };
    document.addEventListener("visibilitychange", skipIfHidden);
    return () => document.removeEventListener("visibilitychange", skipIfHidden);
  }, [state.phase]);

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
    const isReady = def.ready(state);
    if (isReady && readyAtRef.current === 0) readyAtRef.current = Date.now();
    const revealHeld =
      !def.revealMs ||
      (readyAtRef.current > 0 &&
        Date.now() - readyAtRef.current >= def.revealMs / (allDataIn ? 3 : 1));
    if (elapsed >= effMin(def) && isReady && revealHeld) {
      if (index === defs.length - 1) {
        setDone(true);
      } else {
        setIndex(index + 1);
        stepStartRef.current = Date.now();
        readyAtRef.current = 0;
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
    speed: allDataIn ? 3 : 1,
  };
}

function Countdown({ schedule }: { schedule: TheaterSchedule }) {
  // A timer the visitor can trust: the number never climbs back up, never
  // freezes (while the scan waits on slow data it keeps easing down toward a
  // floor), and once the closing line shows it sticks until the end.
  const shownRef = useRef(Number.POSITIVE_INFINITY);
  const lastDropRef = useRef(0);
  const closingRef = useRef(false);
  const now = Date.now();
  if (schedule.remainingSec < shownRef.current) {
    shownRef.current = schedule.remainingSec;
    lastDropRef.current = now;
  } else if (shownRef.current > 6 && now - lastDropRef.current > 3500) {
    shownRef.current -= 1;
    lastDropRef.current = now;
  }
  if (shownRef.current <= 4) closingRef.current = true;
  return (
    <div className="rpt-countdown">
      <span className="rpt-countdown-bar" aria-hidden>
        <span style={{ transform: `scaleX(${schedule.progress})` }} />
      </span>
      <p>{closingRef.current ? "A few more seconds…" : `${shownRef.current} seconds left`}</p>
    </div>
  );
}

/* ── Stage scenes — every one renders the real data of its step ── */

/**
 * Accumulating deep-dive: statements appear one after another and stay,
 * earlier ones check off — a progression you can follow, never a loop.
 */
function SceneDeepDive({
  lines,
  elapsedMs,
  speed = 1,
}: {
  lines: string[];
  elapsedMs: number;
  speed?: number;
}) {
  const visible = Math.min(lines.length, Math.floor(elapsedMs / (2000 / speed)) + 1);
  return (
    <div className="rpt-scene-card rpt-scene-deepdive">
      <ol>
        {lines.slice(0, visible).map((line, i) => {
          const current = i === visible - 1;
          return (
            <li key={line} data-current={current}>
              <span className="rpt-dd-dot" aria-hidden>
                {!current && <MarkIcon ok size={7} />}
              </span>
              {line}
              {current ? "…" : ""}
            </li>
          );
        })}
      </ol>
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

function SceneAccess({ state, schedule }: { state: ReportState; schedule: TheaterSchedule }) {
  // Verdicts land one at a time through the step — never a pre-resolved wall.
  const visible = Math.max(1, Math.floor(schedule.stepElapsedMs / (1200 / schedule.speed)) + 1);
  return (
    <div className="rpt-scene-list rpt-scene-access">
      {state.checks.slice(0, visible).map((check) => (
        <div className="rpt-scene-row" data-pass={check.pass} key={check.id}>
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

/** The visitor's own artifacts, popping in around the stage as the agents
 *  register them — screenshot, search snippet, verbatim homepage lines.
 *  Anchored to the STAGE, not the scene card, so they spread wide. */
function EvidenceBoard({
  state,
  elapsedMs,
  dimmed,
  leaving,
  speed = 1,
}: {
  state: ReportState;
  elapsedMs: number;
  dimmed: boolean;
  leaving: boolean;
  speed?: number;
}) {
  const meta = state.meta;
  const snippets = meta?.snippets ?? [];
  const cards: { at: number; cls: string; node: React.ReactNode }[] = [];
  cards.push({
    at: 900,
    cls: "rpt-ev-shot",
    node: (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element -- live capture of the visitor's site */}
        <img
          src={`https://image.thum.io/get/width/600/crop/420/noanimate/https://${state.domain}`}
          alt=""
          onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
        />
        <span>{state.domain}</span>
      </>
    ),
  });
  if (meta?.title || meta?.description) {
    cards.push({
      at: 2600,
      cls: "rpt-ev-serp",
      node: (
        <>
          <strong>{meta?.title}</strong>
          {meta?.description && <p>{meta.description}</p>}
        </>
      ),
    });
  }
  if (snippets[0]) {
    cards.push({ at: 4300, cls: "rpt-ev-quote", node: <p>“{snippets[0]}”</p> });
  }
  if (meta?.schemaTypes?.length) {
    cards.push({
      at: 6000,
      cls: "rpt-ev-schema",
      node: (
        <>
          {meta.schemaTypes.slice(0, 4).map((t) => (
            <i key={t}>{t}</i>
          ))}
        </>
      ),
    });
  } else if (snippets[1]) {
    cards.push({ at: 6000, cls: "rpt-ev-quote2", node: <p>“{snippets[1]}”</p> });
  }
  if (snippets[2] ?? snippets[1]) {
    cards.push({ at: 7700, cls: "rpt-ev-quote3", node: <p>“{snippets[2] ?? snippets[1]}”</p> });
  }
  return (
    <div className="rpt-evidence" data-dimmed={dimmed} data-leaving={leaving} aria-hidden>
      {cards
        .filter((c) => elapsedMs >= c.at / speed)
        .map((c) => (
          <div className={`rpt-ev ${c.cls}`} key={c.cls}>
            {c.node}
          </div>
        ))}
    </div>
  );
}

/** "Result found" stamp — the eye-catcher that lands on every reveal.
 *  `above` floats it clear of scenes that have their own caption line.
 *  `tone="warn"` is for finds that are gaps, not wins — amber, no check. */
function FoundChip({
  children,
  above,
  tone = "ok",
}: {
  children: React.ReactNode;
  above?: boolean;
  tone?: "ok" | "warn";
}) {
  return (
    <span
      className={`rpt-found-chip${above ? " rpt-found-chip-above" : ""}`}
      data-tone={tone}
    >
      {tone === "ok" && <MarkIcon ok size={8} />}
      {children}
    </span>
  );
}

/** True once the ICP result should own the stage for this step. */
function icpRevealed(state: ReportState, schedule: TheaterSchedule): boolean {
  // Even when the analysis is already in (demo, cache), play the dive first:
  // evidence popping crisp + statements accumulating IS the magic beat.
  return state.brain !== null && schedule.stepElapsedMs >= 6500 / schedule.speed;
}

function SceneICP({ state, schedule }: { state: ReportState; schedule: TheaterSchedule }) {
  if (!icpRevealed(state, schedule)) {
    return (
      <SceneDeepDive
        lines={stepDefs(state.domain)[2]!.waitLines!}
        elapsedMs={schedule.stepElapsedMs}
        speed={schedule.speed}
      />
    );
  }
  return (
    <div className="rpt-reveal rpt-reveal-pop" data-found="true">
      <FoundChip>ICP found</FoundChip>
      <div className="rpt-scene-card rpt-scene-icp">
        <span className="rpt-scene-eyebrow">Your ICP, as the agents read it</span>
        <p className="rpt-scene-icp-text">{state.brain!.icp}</p>
        <span className="rpt-scene-icp-co">
          {state.brain!.company} · {state.domain}
        </span>
      </div>
    </div>
  );
}

function ScenePrompts({ state, schedule }: { state: ReportState; schedule: TheaterSchedule }) {
  if (!state.brain) {
    return (
      <SceneDeepDive
        lines={stepDefs(state.domain)[3]!.waitLines!}
        elapsedMs={schedule.stepElapsedMs}
        speed={schedule.speed}
      />
    );
  }
  // One question lands at a time — motion carries the whole step.
  const visible = Math.max(1, Math.floor(schedule.stepElapsedMs / (1100 / schedule.speed)) + 1);
  return (
    <div className="rpt-reveal" data-found="true">
      <div className="rpt-scene-brain">
        <p className="rpt-scene-caption">The questions your ICP asks AI</p>
        <div className="rpt-scene-qgrid">
          {state.prompts.slice(0, Math.min(6, visible)).map((p, i) => (
            <div className="rpt-scene-card rpt-scene-q" key={i}>
              <p>{p.prompt}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SceneChatGPT({ state, schedule }: { state: ReportState; schedule: TheaterSchedule }) {
  const shown = state.prompts.slice(0, 6);
  // Answers resolve one at a time even when the data is already in — the
  // "asking live" feel is sequential verdicts, not a pre-resolved wall.
  const settleCount = Math.floor(schedule.stepElapsedMs / (850 / schedule.speed));
  const isShown = (p: PromptRow, i: number) =>
    p.status === "done" && p.cited !== undefined && i < settleCount;
  const allShown = shown.length > 0 && shown.every(isShown);
  const cited = state.prompts.filter((p) => p.cited).length;
  return (
    <div className="rpt-reveal" data-found={allShown}>
      {allShown && (
        <FoundChip above>
          Cited in {cited} of {state.prompts.length} answers
        </FoundChip>
      )}
      <div className="rpt-scene-brain">
        <p className="rpt-scene-caption">Does ChatGPT recommend you? Asking for real.</p>
        <div className="rpt-scene-qgrid">
          {shown.map((p, i) => {
            const settled = isShown(p, i);
            return (
              <div
                className="rpt-scene-card rpt-scene-q"
                data-cited={settled ? p.cited : undefined}
                key={i}
              >
                <p>{p.prompt}</p>
                <span className="rpt-scene-q-mark" data-state={settled ? "done" : "checking"}>
                  {settled ? (
                    <>
                      <i className="rpt-mini-mark" data-ok={p.cited}>
                        <MarkIcon ok={p.cited === true} size={8} />
                      </i>
                      {p.cited ? "Recommended" : "Not mentioned"}
                    </>
                  ) : (
                    "Asking…"
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SceneGoogle({ state, schedule }: { state: ReportState; schedule: TheaterSchedule }) {
  const rows = state.google?.rows ?? [];
  if (!rows.length) {
    return (
      <SceneDeepDive
        lines={stepDefs(state.domain)[5]!.waitLines!}
        elapsedMs={schedule.stepElapsedMs}
        speed={schedule.speed}
      />
    );
  }
  // Rankings land row by row; the stamp only once the board is complete.
  const shown = rows.slice(0, 5);
  const visible = Math.max(1, Math.floor(schedule.stepElapsedMs / (900 / schedule.speed)) + 1);
  const complete = visible >= shown.length + 1;
  const ranking = shown.some((r) => r.position !== null && r.position <= 10);
  return (
    <div className="rpt-reveal rpt-reveal-pop" data-found={complete}>
      {complete &&
        (ranking ? (
          <FoundChip above>Your real rankings</FoundChip>
        ) : (
          <FoundChip above tone="warn">
            Your Google gap
          </FoundChip>
        ))}
      <div className="rpt-scene-brain">
        <p className="rpt-scene-caption">Searches with money behind them.</p>
        <div className="rpt-scene-list rpt-scene-serp">
          {shown.slice(0, visible).map((row) => (
            <div className="rpt-scene-row" key={row.term}>
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
    </div>
  );
}

const BAND_COLORS: [number, string][] = [
  [39, "var(--negative-stroke)"],
  [69, "var(--palette-yellow-30)"],
  [100, "var(--palette-green-20)"],
];

/** The drum roll: the score ring draws and counts up right before the reveal. */
function SceneTally({ state, speed = 1 }: { state: ReportState; speed?: number }) {
  const target = state.score ?? 0;
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const duration = 2400 / speed;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setShown(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, speed]);
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

function renderScene(key: string, state: ReportState, schedule: TheaterSchedule) {
  switch (key) {
    case "site":
      return <SceneSite state={state} />;
    case "access":
      return <SceneAccess state={state} schedule={schedule} />;
    case "icp":
      return <SceneICP state={state} schedule={schedule} />;
    case "prompts":
      return <ScenePrompts state={state} schedule={schedule} />;
    case "chatgpt":
      return <SceneChatGPT state={state} schedule={schedule} />;
    case "google":
      return <SceneGoogle state={state} schedule={schedule} />;
    case "tally":
      return <SceneTally state={state} speed={schedule.speed} />;
    default:
      return null;
  }
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

  // Exit crossfade: when the schedule advances, the outgoing scene lingers for
  // one beat and fades out while the next one rises — no hard cuts.
  const [leaving, setLeaving] = useState<string | null>(null);
  const prevKeyRef = useRef(active.key);
  useEffect(() => {
    if (prevKeyRef.current === active.key) return;
    const old = prevKeyRef.current;
    prevKeyRef.current = active.key;
    setLeaving(old);
    // Longer than every exit transition (scene 0.42s, evidence fade 0.7s) so
    // nothing pops out mid-fade when the leaving copy unmounts.
    const t = setTimeout(() => setLeaving(null), 720);
    return () => clearTimeout(t);
  }, [active.key]);

  // A leaving scene re-renders with its dwell "served" so it exits in its
  // final (revealed) form, never snapping back to a loading state.
  const settledSchedule: TheaterSchedule = { ...schedule, stepElapsedMs: 1e9 };
  const evidenceOn = active.key === "icp" || leaving === "icp";

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
        {evidenceOn && (
          <EvidenceBoard
            state={state}
            elapsedMs={active.key === "icp" ? schedule.stepElapsedMs : 1e9}
            dimmed={active.key === "icp" && icpRevealed(state, schedule)}
            leaving={active.key !== "icp"}
            speed={schedule.speed}
          />
        )}
        {leaving && leaving !== active.key && (
          <div className="rpt-scene rpt-scene-leaving" aria-hidden>
            {renderScene(leaving, state, settledSchedule)}
          </div>
        )}
        <div className="rpt-scene" key={active.key}>
          {renderScene(active.key, state, schedule)}
        </div>
        <span className="rpt-stage-horizon" aria-hidden />
      </div>
    </section>
  );
}
