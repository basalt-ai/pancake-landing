"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";

import type { GoogleRow, OpportunityItem, ScanEvent } from "@/lib/scan/types";
import { DEMO_DOMAIN, DEMO_EVENTS } from "./demo-data";

/**
 * One hook, one reducer, one drip queue. Events from the SSE stream (or the
 * demo script) are enqueued and released one at a time on a short interval, so
 * the scan always *reads* as agents working — even when the server answers in
 * a burst (cache replays, batched checks).
 */

export type PromptRow = {
  prompt: string;
  status: "checking" | "done";
  cited?: boolean;
  detail?: string;
  estimated?: boolean;
  citedDomains?: string[];
};

export type ScoreBreakdown = {
  ai: { score: number; max: number };
  google: { score: number; max: number };
  readiness: { score: number; max: number };
};

export type ReportState = {
  phase: "idle" | "scanning" | "report" | "error";
  domain: string;
  demo: boolean;
  statusLine: string;
  meta: { title?: string; ogImage?: string; favicon?: string } | null;
  checks: { id: string; pass: boolean; detail: string }[];
  brain: { company: string; icp: string } | null;
  prompts: PromptRow[];
  google: { rows: GoogleRow[]; toWin: number; estimated?: boolean; commentary?: string } | null;
  opportunities: { count: number; items: OpportunityItem[] } | null;
  score: number | null;
  /** Score recomputed as if the surfaced gaps were closed — the teaser. */
  potentialScore: number | null;
  breakdown: ScoreBreakdown | null;
  unlocked: boolean;
  /** 0..13 — lights the snake progress circles. */
  progress: number;
  error: { code: string; message: string } | null;
};

const INITIAL: ReportState = {
  phase: "idle",
  domain: "",
  demo: false,
  statusLine: "",
  meta: null,
  checks: [],
  brain: null,
  prompts: [],
  google: null,
  opportunities: null,
  score: null,
  potentialScore: null,
  breakdown: null,
  unlocked: false,
  progress: 0,
  error: null,
};

type Action =
  | { type: "start"; domain: string; demo: boolean }
  | { type: "event"; event: ScanEvent }
  | { type: "unlocked" }
  | { type: "reset" };

const PROGRESS_STEPS = 13;

function reducer(state: ReportState, action: Action): ReportState {
  switch (action.type) {
    case "start":
      return { ...INITIAL, phase: "scanning", domain: action.domain, demo: action.demo };
    case "reset":
      return INITIAL;
    case "unlocked":
      return { ...state, unlocked: true };
    case "event": {
      const ev = action.event;
      const bump = (s: ReportState): ReportState => ({
        ...s,
        progress: Math.min(PROGRESS_STEPS, s.progress + 1),
      });
      switch (ev.type) {
        case "status":
          return { ...state, statusLine: ev.label };
        case "meta":
          return bump({ ...state, meta: { title: ev.title, ogImage: ev.ogImage, favicon: ev.favicon } });
        case "check":
          return bump({
            ...state,
            checks: [...state.checks, { id: ev.id, pass: ev.pass, detail: ev.detail }],
          });
        case "brain":
          return bump({
            ...state,
            brain: { company: ev.company, icp: ev.icp },
            prompts: ev.prompts.map((prompt) => ({ prompt, status: "checking" as const })),
          });
        case "citation": {
          const prompts = state.prompts.slice();
          if (prompts[ev.index]) {
            prompts[ev.index] = {
              ...prompts[ev.index]!,
              status: "done",
              cited: ev.cited,
              detail: ev.detail,
              estimated: ev.estimated,
              citedDomains: ev.citedDomains,
            };
          }
          return bump({ ...state, prompts });
        }
        case "google":
          return bump({
            ...state,
            google: { rows: ev.rows, toWin: ev.toWin, estimated: ev.estimated, commentary: ev.commentary },
          });
        case "opportunities":
          return bump({ ...state, opportunities: { count: ev.count, items: ev.items } });
        case "score":
          return bump({
            ...state,
            score: ev.value,
            potentialScore: ev.potential ?? null,
            breakdown: ev.breakdown ?? null,
          });
        case "done":
          return {
            ...state,
            phase: "report",
            progress: PROGRESS_STEPS,
            statusLine: "",
            // A cut stream can leave checks unresolved — close them out as
            // neutral so nothing spins forever.
            prompts: state.prompts.map((p) =>
              p.status === "checking"
                ? { ...p, status: "done" as const, detail: "This check didn't finish." }
                : p,
            ),
          };
        case "error":
          return { ...state, phase: "error", error: { code: ev.code, message: ev.message } };
        default:
          return state;
      }
    }
    default:
      return state;
  }
}

function displayDomain(raw: string): string {
  return raw
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/.*$/, "")
    .toLowerCase();
}

export function useReport() {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const queueRef = useRef<ScanEvent[]>([]);
  const pumpingRef = useRef(false);
  const doneRef = useRef(false);
  const scoreSeenRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const reducedRef = useRef(false);

  /** Dispatch everything queued, now. Used when pacing has no audience. */
  const flushAll = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    let next: ScanEvent | undefined;
    while ((next = queueRef.current.shift())) {
      dispatch({ type: "event", event: next });
    }
    pumpingRef.current = false;
  }, []);

  useEffect(() => {
    reducedRef.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Hidden tabs throttle setTimeout chains to as little as once a minute —
    // the drip would strand the report half-rendered. Nobody sees the theater
    // in a background tab anyway, so just flush.
    const onVisibility = () => {
      if (document.hidden) flushAll();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      abortRef.current?.abort();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [flushAll]);

  const pump = useCallback(() => {
    if (pumpingRef.current) return;
    pumpingRef.current = true;
    const step = () => {
      if (reducedRef.current || document.hidden) {
        flushAll();
        return;
      }
      const next = queueRef.current.shift();
      if (!next) {
        pumpingRef.current = false;
        return;
      }
      dispatch({ type: "event", event: next });
      // status events are narration state only (the theater narrates itself) —
      // they must not consume a full drip slot.
      const gap =
        next.type === "status" ? 40 : doneRef.current ? 120 : next.type === "citation" ? 480 : 380;
      timerRef.current = setTimeout(step, gap);
    };
    step();
  }, [flushAll]);

  const enqueue = useCallback(
    (ev: ScanEvent) => {
      if (ev.type === "done" || ev.type === "error") doneRef.current = true;
      if (ev.type === "score") scoreSeenRef.current = true;
      queueRef.current.push(ev);
      pump();
    },
    [pump],
  );

  const start = useCallback(
    async (rawUrl: string, opts?: { demo?: boolean }) => {
      const domain = displayDomain(rawUrl);
      if (!domain) return;
      abortRef.current?.abort();
      queueRef.current = [];
      doneRef.current = false;
      scoreSeenRef.current = false;
      dispatch({ type: "start", domain, demo: !!opts?.demo });

      if (opts?.demo) {
        for (const ev of DEMO_EVENTS) enqueue(ev);
        return;
      }

      const ctrl = new AbortController();
      abortRef.current = ctrl;
      // The server pings every 8s during long ops. If nothing at all arrives
      // for this long, the function is dead — stop waiting and resolve the UI.
      const STALL_MS = 25_000;
      let stallTimer: ReturnType<typeof setTimeout> | null = null;
      const settle = () => {
        if (doneRef.current) return;
        if (scoreSeenRef.current) {
          enqueue({ type: "done", domain, mode: "estimated" });
        } else {
          enqueue({
            type: "error",
            code: "failed",
            message: "The scan got cut off mid-run. Run it again — it usually completes.",
          });
        }
      };
      const armStall = () => {
        if (stallTimer) clearTimeout(stallTimer);
        stallTimer = setTimeout(() => {
          ctrl.abort();
          settle();
        }, STALL_MS);
      };
      try {
        const res = await fetch("/api/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: rawUrl }),
          signal: ctrl.signal,
        });
        if (!res.ok || !res.body) {
          const data = (await res.json().catch(() => null)) as { error?: string } | null;
          enqueue({
            type: "error",
            code: res.status === 429 ? "rate_limited" : "invalid",
            message: data?.error ?? "The scan tripped on our side. Run it again.",
          });
          return;
        }
        armStall();
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          armStall();
          buffer += decoder.decode(value, { stream: true });
          const frames = buffer.split("\n\n");
          buffer = frames.pop() ?? "";
          for (const frame of frames) {
            const line = frame.trim();
            if (!line.startsWith("data:")) continue;
            try {
              const ev = JSON.parse(line.slice(5)) as ScanEvent;
              if (ev.type === "ping") continue; // liveness only, never rendered
              enqueue(ev);
            } catch {
              /* skip malformed frame */
            }
          }
        }
        // Stream closed without a terminal event (server hit its time limit,
        // proxy dropped the connection): finish gracefully instead of spinning.
        settle();
      } catch {
        if (!ctrl.signal.aborted) {
          enqueue({
            type: "error",
            code: "failed",
            message: "The scan tripped on our side. Your site is fine. Run it again.",
          });
        }
      } finally {
        if (stallTimer) clearTimeout(stallTimer);
      }
    },
    [enqueue],
  );

  const startDemo = useCallback(() => start(DEMO_DOMAIN, { demo: true }), [start]);

  /** Email gate → the existing waitlist endpoint (Airtable + Slack #signups). */
  const unlock = useCallback(
    async (email: string): Promise<{ ok: boolean; message?: string }> => {
      try {
        const res = await fetch("/api/waitlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            companyUrl: state.domain,
            about: `Ran the free AI GTM report on ${state.domain}`,
            source: "gtm-report",
            website: "",
          }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as { error?: string } | null;
          return { ok: false, message: data?.error ?? "That didn't save. Try again." };
        }
        dispatch({ type: "unlocked" });
        return { ok: true };
      } catch {
        return { ok: false, message: "That didn't save. Try again." };
      }
    },
    [state.domain],
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    queueRef.current = [];
    dispatch({ type: "reset" });
  }, []);

  return { state, start, startDemo, unlock, reset };
}
