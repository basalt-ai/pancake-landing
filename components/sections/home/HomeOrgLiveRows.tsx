"use client";

import type { Dispatch, RefObject, SetStateAction } from "react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { flushSync } from "react-dom";

import { gsap } from "@/lib/gsap";

import {
  LIVE_INITIAL_DEPTS,
  ROLE_POOLS,
  type OrgDotTone,
  type OrgSurface,
} from "@/components/sections/home/orgLiveData";

type LivePhase = "pending" | "active";

type LiveRow = {
  id: string;
  label: string;
  phase: LivePhase;
  /** Preserves original Figma dot for seeded rows; recruited rows omit this. */
  baseDot?: OrgDotTone;
};

/** Derived from the data file so it stays the single source of truth for surfaces. */
const SURFACES: OrgSurface[] = LIVE_INITIAL_DEPTS.map((d) => d.surface);

function makeSurfaceRecord<T>(value: T): Record<OrgSurface, T> {
  return Object.fromEntries(SURFACES.map((s) => [s, value])) as Record<OrgSurface, T>;
}

/** 4 (was 6) — squad cards are narrow columns and must stay inside the 706-tall stage at cap. */
const ROW_CAP = 4;
const ROW_FLOOR = 2;
/**
 * Per-block only — each surface draws a fresh delay in this range every cycle (no master tick).
 * The 3-surface original ran 880–1800ms; the range scales with surface count so total section
 * activity stays flat as squads are added — capped at 5/3 because only ~5 of the 7 cards are
 * visible at typical widths (uncapped 7/3 made each card feel sleepy).
 */
const DELAY_SCALE = Math.min(SURFACES.length, 5) / 3;
const BLOCK_DELAY_MIN_MS = Math.round(880 * DELAY_SCALE);
const BLOCK_DELAY_MAX_MS = Math.round(1800 * DELAY_SCALE);
const PENDING_TO_ACTIVE_S = 0.8;
const ADD_IN_DURATION = 0.58;
const ADD_SLIDE_MAX_PX = 168;
const REMOVE_SHAKE_S = 0.24;
const REMOVE_OUT_DURATION = 0.72;

function makeRowId(): string {
  return `org-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Initial row ids + labels.
 * Seed ids MUST be deterministic — `makeRowId()` uses `Date.now()`/`Math.random()` and produced
 * different ids on the server vs client, triggering a `data-org-live-row` hydration mismatch.
 * In production that left the DOM with server ids and React state with client ids, so
 * `findRowEl(victim.id)` returned null on every initial-row removal and the column froze.
 */
export function getInitialDeptMap(): Record<OrgSurface, LiveRow[]> {
  const m = {} as Record<OrgSurface, LiveRow[]>;
  for (const d of LIVE_INITIAL_DEPTS) {
    m[d.surface] = d.rows.map((r, i) => ({
      id: `seed-${d.surface}-${i}`,
      label: r.label,
      phase: "active",
      baseDot: r.dot,
    }));
  }
  return m;
}

function dotClassForLiveRow(row: LiveRow): OrgDotTone {
  if (row.baseDot !== undefined) return row.baseDot;
  return row.phase === "active" ? "positive" : "negative";
}

function visibleLabels(rows: LiveRow[]): Set<string> {
  return new Set(rows.map((r) => r.label));
}

/**
 * Capture each row's `top` measured relative to the article — NOT viewport coordinates.
 * Viewport-relative `getBoundingClientRect().top` would change as the user scrolls; if a state
 * mutation fired while the article was scrolling through the viewport, the FLIP delta
 * `prev.top - next.top` would equal the scroll distance and every row in the column would
 * tween in from off-screen on return. Article-relative coordinates are scroll-invariant.
 */
function captureDeptRowRects(article: Element): Map<string, { top: number }> {
  const aTop = article.getBoundingClientRect().top;
  const map = new Map<string, { top: number }>();
  article.querySelectorAll<HTMLElement>("[data-org-live-row]").forEach((el) => {
    const id = el.dataset.orgLiveRow;
    if (id) map.set(id, { top: el.getBoundingClientRect().top - aTop });
  });
  return map;
}

function flipReflowRows(
  article: Element,
  before: Map<string, { top: number }>,
  duration = 0.32,
  ease: string = "power2.out",
): void {
  const aTop = article.getBoundingClientRect().top;
  article.querySelectorAll<HTMLElement>("[data-org-live-row]").forEach((el) => {
    const id = el.dataset.orgLiveRow;
    if (!id) return;
    const prev = before.get(id);
    if (!prev) return;
    const nextTop = el.getBoundingClientRect().top - aTop;
    const dy = prev.top - nextTop;
    if (Math.abs(dy) < 0.75) return;
    /** `false` — avoid killing concurrent transform tweens on the same row (e.g. exit x while reflow y). */
    gsap.fromTo(el, { y: dy }, { y: 0, duration, ease, overwrite: false });
  });
}

/**
 * Smoothly resize the dept article between two heights.
 * Call AFTER React commits the row count change but BEFORE the next paint:
 * - `beforeH` is the article's offsetHeight captured before the state mutation
 * - the article's current `offsetHeight` is treated as the new natural target
 * Locks an inline pixel height, tweens to the target, then clears `style.height`
 * so CSS `height: auto` / `min-height` rules take over again.
 */
function flipReflowArticleHeight(
  article: HTMLElement,
  beforeH: number,
  duration = 0.42,
  ease: string = "power3.out",
): void {
  const naturalH = article.offsetHeight;
  if (Math.abs(beforeH - naturalH) < 0.5) return;
  gsap.killTweensOf(article, "height");
  gsap.fromTo(
    article,
    { height: beforeH },
    {
      height: naturalH,
      duration,
      ease,
      overwrite: "auto",
      onComplete: () => {
        article.style.height = "";
      },
      onInterrupt: () => {
        article.style.height = "";
      },
    },
  );
}

function findRowElInArticle(article: HTMLElement | null, id: string): HTMLElement | null {
  if (!article) return null;
  const nodes = article.querySelectorAll<HTMLElement>("[data-org-live-row]");
  for (let i = 0; i < nodes.length; i++) {
    const el = nodes[i]!;
    if (el.getAttribute("data-org-live-row") === id) return el;
  }
  return null;
}

/** Fallback when per-surface refs are not set yet (should be rare). */
function findDeptArticle(
  root: HTMLElement | null,
  surface: OrgSurface,
  selector: (s: OrgSurface) => string,
): HTMLElement | null {
  if (!root) return null;
  return root.querySelector<HTMLElement>(selector(surface));
}

const DEFAULT_DEPT_SELECTOR = (surface: OrgSurface) =>
  `article.home-org-diagram__dept--${surface}`;

type HomeOrgLiveRowsProps = {
  scrollRootRef: RefObject<HTMLElement | null>;
  deptRows: Record<OrgSurface, LiveRow[]>;
  setDeptRows: Dispatch<SetStateAction<Record<OrgSurface, LiveRow[]>>>;
};

/**
 * Live add/remove ticker shared between the desktop org diagram and the
 * mobile carousel. The hook owns all timers, refs, and FLIP transitions; the
 * caller only renders the article shells (so desktop's absolute layout and
 * mobile's snap-scroll cards can each style their own way).
 *
 * Caller contract:
 *  - Each dept's article element MUST be attached via `registerArticle(surface)`.
 *  - Each row inside MUST carry `data-org-live-row={row.id}` so the ticker
 *    can find/animate/remove it. Class names don't matter; the ticker uses
 *    the data-attr for lookup and `clearProps`-style transforms for motion.
 *  - The optional `articleSelector` is the fallback used if the ref isn't
 *    set yet (rare race during HMR / first paint). Pass a selector that
 *    matches your article markup.
 */
export type UseOrgLiveTickerOptions = {
  scrollRootRef: RefObject<HTMLElement | null>;
  deptRows: Record<OrgSurface, LiveRow[]>;
  setDeptRows: Dispatch<SetStateAction<Record<OrgSurface, LiveRow[]>>>;
  /** Fallback selector when ref-based article lookup misses. */
  articleSelector?: (surface: OrgSurface) => string;
};

export function useOrgLiveTicker({
  scrollRootRef,
  deptRows,
  setDeptRows,
  articleSelector = DEFAULT_DEPT_SELECTOR,
}: UseOrgLiveTickerOptions) {
  return useOrgLiveTickerImpl({ scrollRootRef, deptRows, setDeptRows, articleSelector });
}

function useOrgLiveTickerImpl({
  scrollRootRef,
  deptRows,
  setDeptRows,
  articleSelector,
}: Required<UseOrgLiveTickerOptions>) {
  const reducedMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  /** Direct article nodes — avoids `querySelector` matching the wrong subtree if markup/order changes. */
  const deptArticleBySurfaceRef = useRef<Partial<Record<OrgSurface, HTMLElement>>>({});

  const deptRowsRef = useRef(deptRows);
  useLayoutEffect(() => {
    deptRowsRef.current = deptRows;
  }, [deptRows]);

  const liveEnabledRef = useRef(false);
  /** True after this mount's effect cleanup — blocks stray timers/GSAP from a prior Strict/HMR instance. */
  const disposedRef = useRef(false);
  const timerBySurfaceRef = useRef<Record<OrgSurface, ReturnType<typeof setTimeout> | null>>(
    makeSurfaceRecord<ReturnType<typeof setTimeout> | null>(null),
  );
  /** pending→active — plain timeouts (browser number handles) so GSAP never drops promotions. */
  const pendingPromoteTimersRef = useRef<Map<string, number>>(new Map());

  const runBlockRef = useRef<(surface: OrgSurface) => void>(() => {});
  const scheduleSurfaceNextRef = useRef<(surface: OrgSurface) => void>(() => {});
  const armBlockRef = useRef<(surface: OrgSurface) => void>(() => {});

  const clearBlockTimer = useCallback((surface: OrgSurface) => {
    const t = timerBySurfaceRef.current[surface];
    if (t != null) {
      clearTimeout(t);
      timerBySurfaceRef.current[surface] = null;
    }
  }, []);

  const clearAllBlockTimers = useCallback(() => {
    for (const s of SURFACES) clearBlockTimer(s);
  }, [clearBlockTimer]);

  const clearAllPendingPromoteTimers = useCallback(() => {
    pendingPromoteTimersRef.current.forEach((t) => clearTimeout(t));
    pendingPromoteTimersRef.current.clear();
  }, []);

  /** If exit GSAP never reaches onComplete, that surface would stop scheduling forever — force finish. */
  const removeFailsafeBySurfaceRef = useRef<Record<OrgSurface, number | null>>(
    makeSurfaceRecord<number | null>(null),
  );

  const clearRemoveFailsafe = useCallback((surface: OrgSurface) => {
    const t = removeFailsafeBySurfaceRef.current[surface];
    if (t != null) {
      clearTimeout(t);
      removeFailsafeBySurfaceRef.current[surface] = null;
    }
  }, []);

  const clearAllRemoveFailsafes = useCallback(() => {
    for (const s of SURFACES) clearRemoveFailsafe(s);
  }, [clearRemoveFailsafe]);

  const resolveDeptArticle = useCallback(
    (surface: OrgSurface): HTMLElement | null => {
      const fromRef = deptArticleBySurfaceRef.current[surface];
      if (fromRef?.isConnected) return fromRef;
      return findDeptArticle(scrollRootRef.current, surface, articleSelector);
    },
    [scrollRootRef, articleSelector],
  );

  /**
   * Schedule the next tick for one surface. Never chain from runBlock via try/finally: remove
   * timelines are async (~0.85s+); re-arming immediately caused overlapping ticks, overwrite kills,
   * and stuck “at cap” states.
   */
  const scheduleSurfaceNext = useCallback(
    (surface: OrgSurface) => {
      if (disposedRef.current) return;
      clearBlockTimer(surface);
      if (!liveEnabledRef.current) return;
      const delay =
        BLOCK_DELAY_MIN_MS + Math.random() * (BLOCK_DELAY_MAX_MS - BLOCK_DELAY_MIN_MS);
      timerBySurfaceRef.current[surface] = setTimeout(() => {
        timerBySurfaceRef.current[surface] = null;
        if (disposedRef.current) return;
        runBlockRef.current(surface);
      }, delay);
    },
    [clearBlockTimer],
  );

  const runBlock = useCallback(
    (surface: OrgSurface) => {
      if (disposedRef.current) return;
      const root = scrollRootRef.current;
      if (!liveEnabledRef.current) return;

      if (!root) {
        scheduleSurfaceNextRef.current(surface);
        return;
      }

      const rows = deptRowsRef.current[surface];

      const vis = visibleLabels(rows);
      const pool = ROLE_POOLS[surface].filter((l) => !vis.has(l));
      const addOk = rows.length < ROW_CAP && pool.length > 0;
      /** Anything not explicitly pending counts as “active” for removal priority (avoids empty targetPool). */
      const actives = rows.filter((r) => r.phase !== "pending");
      const pendings = rows.filter((r) => r.phase === "pending");
      const removeOk = rows.length > ROW_FLOOR;
      let targetPool =
        actives.length > 0 ? actives : pendings.length > 0 ? pendings : rows.length > ROW_FLOOR ? rows : [];
      const atCap = rows.length >= ROW_CAP;

      let doAdd: boolean;
      if (atCap && removeOk) doAdd = false;
      else if (addOk && removeOk) doAdd = Math.random() < 0.5;
      else if (addOk) doAdd = true;
      else if (removeOk) doAdd = false;
      else {
        scheduleSurfaceNextRef.current(surface);
        return;
      }

      if (doAdd && pool.length === 0) {
        if (!removeOk) {
          scheduleSurfaceNextRef.current(surface);
          return;
        }
        doAdd = false;
      }
      if (!doAdd && targetPool.length === 0) {
        if (rows.length > ROW_FLOOR) {
          targetPool = rows;
        } else if (!addOk) {
          scheduleSurfaceNextRef.current(surface);
          return;
        } else {
          doAdd = true;
        }
      }

      if (doAdd) {
        const article = resolveDeptArticle(surface);
        const beforeRects = article ? captureDeptRowRects(article) : new Map<string, { top: number }>();
        /** Article height before the new row commits — used to FLIP the dept block height. */
        const beforeArticleH = article ? article.offsetHeight : 0;
        const sampleRow = article?.querySelector<HTMLElement>(".home-org-diagram__row");
        const rowH = sampleRow ? Math.max(20, sampleRow.getBoundingClientRect().height) : 28;
        const deptH = article ? article.getBoundingClientRect().height : rowH * 4;
        const enterY = -Math.min(
          ADD_SLIDE_MAX_PX,
          Math.max(rowH * 2.2 + 10, deptH * 0.38),
        );

        const label = pool[Math.floor(Math.random() * pool.length)]!;
        const id = makeRowId();

        setDeptRows((prev) => ({
          ...prev,
          [surface]: [{ id, label, phase: "pending" }, ...prev[surface]],
        }));

        /**
         * `requestAnimationFrame`, not `queueMicrotask` — React 18 commits via the scheduler
         * (MessageChannel), which runs AFTER microtasks. A microtask here would query the DOM
         * before the new row was committed, `findRowElInArticle` would return null, and the entry
         * tween + promote setTimeout would never fire (rows would pop in red and never turn green).
         */
        requestAnimationFrame(() => {
          if (disposedRef.current) return;
          const art = resolveDeptArticle(surface);
          if (!art) return;
          flipReflowRows(art, beforeRects, ADD_IN_DURATION, "power3.out");
          flipReflowArticleHeight(art, beforeArticleH, ADD_IN_DURATION, "power3.out");
          const el = findRowElInArticle(art, id);
          if (!el) return;
          gsap.fromTo(
            el,
            { y: enterY, opacity: 0.08 },
            {
              y: 0,
              opacity: 1,
              duration: ADD_IN_DURATION,
              ease: "power3.out",
              overwrite: "auto",
            },
          );
          const prevT = pendingPromoteTimersRef.current.get(id);
          if (prevT != null) clearTimeout(prevT);
          const t = window.setTimeout(() => {
            if (disposedRef.current) return;
            pendingPromoteTimersRef.current.delete(id);
            const promoteEl = findRowElInArticle(resolveDeptArticle(surface), id);
            const promoteDot = promoteEl?.querySelector<HTMLElement>(".home-org-diagram__dot");
            if (promoteDot) {
              /** Bounce-pulse: makes the red→green flip feel earned instead of an instant swap. */
              gsap.fromTo(
                promoteDot,
                { scale: 0.45 },
                { scale: 1, duration: 0.42, ease: "back.out(2.6)", overwrite: "auto" },
              );
            }
            setDeptRows((prev) => ({
              ...prev,
              [surface]: prev[surface].map((r) =>
                r.id === id && r.phase === "pending" ? { ...r, phase: "active" } : r,
              ),
            }));
          }, PENDING_TO_ACTIVE_S * 1000);
          pendingPromoteTimersRef.current.set(id, t);
        });
        scheduleSurfaceNextRef.current(surface);
        return;
      }

      const victim = targetPool[Math.floor(Math.random() * targetPool.length)]!;
      const article = resolveDeptArticle(surface);
      const rowEl = findRowElInArticle(article, victim.id);
      if (!article || !rowEl) {
        if (deptRowsRef.current[surface].some((r) => r.id === victim.id)) {
          setDeptRows((prev) => ({
            ...prev,
            [surface]: prev[surface].filter((r) => r.id !== victim.id),
          }));
        }
        scheduleSurfaceNextRef.current(surface);
        return;
      }

      const beforeRects = captureDeptRowRects(article);
      /** Article height before the slide-out — used to FLIP the dept block back to its new natural height. */
      const beforeArticleH = article.offsetHeight;
      const dot = rowEl.querySelector<HTMLElement>(".home-org-diagram__dot");
      const slideX = Math.max(56, article.getBoundingClientRect().width * 0.28);

      gsap.set(rowEl, { willChange: "transform, opacity" });

      clearRemoveFailsafe(surface);
      removeFailsafeBySurfaceRef.current[surface] = window.setTimeout(() => {
        removeFailsafeBySurfaceRef.current[surface] = null;
        if (disposedRef.current || !liveEnabledRef.current) return;
        const stillThere = deptRowsRef.current[surface].some((r) => r.id === victim.id);
        if (stillThere) {
          gsap.killTweensOf(rowEl);
          if (dot) gsap.killTweensOf(dot);
          /**
           * Lock invisible synchronously — the React commit unmounting this row is async,
           * and we don't want any paint between now and unmount to show the row.
           */
          rowEl.style.visibility = "hidden";
          rowEl.style.opacity = "0";
          /** Same flushSync trick as the onComplete path — see comment there. */
          flushSync(() => {
            setDeptRows((prev) => ({
              ...prev,
              [surface]: prev[surface].filter((r) => r.id !== victim.id),
            }));
          });
          flipReflowRows(article, beforeRects, 0.42, "power3.out");
          flipReflowArticleHeight(article, beforeArticleH, 0.42, "power3.out");
        }
        scheduleSurfaceNextRef.current(surface);
      }, 2400);

      const tl = gsap.timeline({
        defaults: { overwrite: false },
        onInterrupt: () => {
          if (disposedRef.current) return;
          clearRemoveFailsafe(surface);
          /** Interrupted — the row is staying in state, so revert visuals to make it visible again. */
          gsap.set(rowEl, { clearProps: "transform,opacity,visibility,willChange" });
          if (dot) gsap.set(dot, { clearProps: "transform" });
          scheduleSurfaceNextRef.current(surface);
        },
        onComplete: () => {
          if (disposedRef.current) return;
          clearRemoveFailsafe(surface);
          /**
           * Lock the row invisible *synchronously* before any paint can happen.
           * GSAP demotes `translate3d` → `translate` on the final frame as part of its
           * tween cleanup, which can churn the GPU compositor layer. Even though our
           * tween ends at `opacity: 0`, that compositor reshuffle can briefly drop the
           * cached invisible-state paint and flash the row back at its slid position
           * before React's async commit unmounts it. `visibility: hidden` removes it
           * from paint regardless of any downstream layer churn.
           */
          rowEl.style.visibility = "hidden";
          rowEl.style.opacity = "0";
          /**
           * `flushSync` + same-task FLIP — fixes the remove-blink.
           *
           * Previously this was `setDeptRows(...)` (async commit) followed by
           * `requestAnimationFrame × 2` to apply the inverse-FLIP transforms on
           * the rows that just shifted up. React 18 commits state via the
           * scheduler (MessageChannel), which can land BEFORE the first rAF
           * fires. That meant: React removes row A from the DOM → row B
           * reflows up to A's slot → browser paints (B sits at A's spot with
           * no transform — the blink) → rAF fires → FLIP applies +dy to B
           * (snaps it back to its old spot) → tween animates B from old to
           * new. Two visible jumps for one logical move.
           *
           * `flushSync` makes the commit synchronous: by the time it returns
           * the DOM is mutated, but the browser hasn't painted yet. Applying
           * `flipReflowRows` immediately in the same task installs the
           * inverse transform before the next paint, so the very first frame
           * after removal already shows B at its old position about to slide.
           * No blink.
           */
          flushSync(() => {
            setDeptRows((prev) => ({
              ...prev,
              [surface]: prev[surface].filter((r) => r.id !== victim.id),
            }));
          });
          flipReflowRows(article, beforeRects, 0.42, "power3.out");
          flipReflowArticleHeight(article, beforeArticleH, 0.42, "power3.out");
          scheduleSurfaceNextRef.current(surface);
        },
      });

      tl.to(rowEl, { x: 5, duration: 0.04, ease: "none", repeat: 5, yoyo: true }, 0);

      if (dot) {
        /**
         * Scale-pulse the dot via GSAP only. The previous flicker mutated `dot.className`
         * directly, which bypassed React: if the timeline was interrupted mid-flicker the dot
         * stayed at whatever class GSAP last wrote (often "--negative"), and React never
         * reconciled it back because its virtual-DOM diff still matched the original render.
         * Animating `scale` keeps everything inside GSAP and is reverted by `clearProps` in
         * `onComplete`/`onInterrupt`.
         */
        tl.to(dot, { scale: 1.45, duration: REMOVE_SHAKE_S * 0.45, ease: "power2.out" }, 0)
          .to(dot, { scale: 0.55, duration: REMOVE_SHAKE_S * 0.55, ease: "power2.in" }, REMOVE_SHAKE_S * 0.45);
      }

      /**
       * Slide right + fade. Previously used `autoAlpha: 0` with `force3D: true` — but
       * `force3D` makes GSAP write transforms via the separated `translate`/`rotate`/`scale`
       * properties, and in that path `autoAlpha`/`opacity` was silently NOT being applied
       * (only `will-change: transform, opacity` was set; the actual `opacity` value never
       * appeared in inline style). The row reached `translate3d(slideX, 0, 0)` still fully
       * opaque and got unmounted from there — that's the blink: a clearly visible row at
       * the end of its slide for one paint before React removes it.
       *
       * Explicit `opacity: 0` (no `force3D`) reliably fades the row to invisible by the
       * time the tween completes.
       */
      tl.to(
        rowEl,
        {
          x: slideX,
          opacity: 0,
          duration: REMOVE_OUT_DURATION,
          ease: "power2.inOut",
        },
        REMOVE_SHAKE_S * 0.55,
      );
    },
    [scrollRootRef, clearRemoveFailsafe, setDeptRows, resolveDeptArticle],
  );

  scheduleSurfaceNextRef.current = scheduleSurfaceNext;
  runBlockRef.current = runBlock;
  armBlockRef.current = scheduleSurfaceNext;

  useEffect(() => {
    if (reducedMotion) return;

    disposedRef.current = false;
    let cancelled = false;

    /** Only arm timers once per “live” session — avoids IO/scroll churn clearing random delays every frame. */
    const startLive = () => {
      if (cancelled || disposedRef.current) return;
      if (liveEnabledRef.current) return;
      liveEnabledRef.current = true;
      /**
       * Promote rows stranded in "pending": `pauseLive()` (tab hidden) clears
       * every promote timer, so a row recruited just before the tab went to
       * background would otherwise stay red forever after resume. Resume-time
       * is the natural reconciliation point — sweep any pending row whose
       * timer no longer exists (the `has(id)` guard can't race a live timer,
       * and a later-firing timer is a no-op thanks to its own phase guard).
       */
      setDeptRows((prev) => {
        let changed = false;
        const next = {} as typeof prev;
        for (const s of SURFACES) {
          next[s] = prev[s].map((r) => {
            if (r.phase === "pending" && !pendingPromoteTimersRef.current.has(r.id)) {
              changed = true;
              return { ...r, phase: "active" as const };
            }
            return r;
          });
        }
        return changed ? next : prev;
      });
      for (const s of SURFACES) {
        armBlockRef.current(s);
      }
    };

    const pauseLive = () => {
      if (!liveEnabledRef.current) return;
      liveEnabledRef.current = false;
      clearAllBlockTimers();
      clearAllPendingPromoteTimers();
      clearAllRemoveFailsafes();
    };

    const onVisibility = () => {
      if (cancelled) return;
      if (document.visibilityState === "hidden") pauseLive();
      else startLive();
    };

    /**
     * Do NOT gate on viewport intersection for this block.
     * The diagram uses absolutely positioned dept cards; IO / bbox checks on the wrapper can read
     * “out of view” after rows grow even while the org is still on screen — that paused timers and
     * looked like a freeze right after ~6 arrivals.
     */
    if (typeof document !== "undefined") {
      if (document.visibilityState !== "hidden") startLive();
      document.addEventListener("visibilitychange", onVisibility);
    }

    return () => {
      disposedRef.current = true;
      cancelled = true;
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVisibility);
      }
      liveEnabledRef.current = false;
      clearAllBlockTimers();
      clearAllPendingPromoteTimers();
      clearAllRemoveFailsafes();
    };
  }, [reducedMotion, clearAllBlockTimers, clearAllPendingPromoteTimers, clearAllRemoveFailsafes, setDeptRows]);

  /**
   * Caller attaches each surface's article element via this callback. The
   * ticker stores the live element so it can find rows / measure heights
   * without depending on a CSS selector that might match the wrong subtree.
   */
  const registerArticle = useCallback(
    (surface: OrgSurface) => (el: HTMLElement | null) => {
      if (el) deptArticleBySurfaceRef.current[surface] = el;
      else delete deptArticleBySurfaceRef.current[surface];
    },
    [],
  );

  return { registerArticle, reducedMotion };
}

export function HomeOrgLiveRows({ scrollRootRef, deptRows, setDeptRows }: HomeOrgLiveRowsProps) {
  const { registerArticle, reducedMotion } = useOrgLiveTicker({
    scrollRootRef,
    deptRows,
    setDeptRows,
  });

  if (reducedMotion) {
    return (
      <>
        {LIVE_INITIAL_DEPTS.map((dept) => (
          <article
            key={dept.title}
            className={`home-org-diagram__dept home-org-diagram__dept--${dept.surface} home-org-diagram__abs`}
          >
            <h3 className="home-org-diagram__dept-title">{dept.title}</h3>
            <div className="home-org-diagram__rows">
              {dept.rows.map((row) => (
                <div key={row.label} className="home-org-diagram__row">
                  <span className={`home-org-diagram__dot home-org-diagram__dot--${row.dot}`} aria-hidden />
                  <span className="home-org-diagram__row-label">{row.label}</span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </>
    );
  }

  return (
    <>
      {LIVE_INITIAL_DEPTS.map((dept) => (
        <article
          key={dept.title}
          ref={registerArticle(dept.surface)}
          className={`home-org-diagram__dept home-org-diagram__dept--${dept.surface} home-org-diagram__abs`}
        >
          <h3 className="home-org-diagram__dept-title">{dept.title}</h3>
          {/* No aria-live: the row churn is decorative texture, not information —
              announcing every add/remove would spam screen readers forever. */}
          <div className="home-org-diagram__rows">
            {deptRows[dept.surface].map((row) => (
              <div key={row.id} className="home-org-diagram__row" data-org-live-row={row.id}>
                <span
                  className={`home-org-diagram__dot home-org-diagram__dot--${dotClassForLiveRow(row)}`}
                  aria-hidden
                />
                <span className="home-org-diagram__row-label">{row.label}</span>
              </div>
            ))}
          </div>
        </article>
      ))}
    </>
  );
}

/** Re-export a useful type for other live-ticker consumers. */
export type { LiveRow };
