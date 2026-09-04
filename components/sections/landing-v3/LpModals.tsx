"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { isCallCtaId, pushAcquisitionEvent } from "@/lib/analytics/data-layer";

/**
 * The booking dialog (zcal calendar sheet) ported from landing-v2's
 * LandingModals — same behavior contract, lp-skinned (modal.css):
 * one instance mounts at page level; any element anywhere on the page opens
 * it via `data-lv2-open="call"` (document-level click listener, so server
 * components can be triggers; the attribute name is kept as the site-wide
 * trigger contract). Triggers may carry the zcal URL as an href fallback —
 * they still work as plain links on pages that don't mount this component.
 * v2's snake suspend calls are dropped (no snakes on this page).
 */

const ZCAL_URL = "https://zcal.co/i/ZEHl48rv?embed=1&embedType=iframe";
const SCHEDULER_ID = "ZEHl48rv" as const;

/** Fit the compact 950x610 zcal card while readable, else fall back to zcal's
 *  own tall scrollable layout (what it is designed for on a phone). */
const ZCAL_MIN_SCALE = 0.62;

export function LpModals() {
  const [open, setOpen] = useState(false);
  const [zcalLoud, setZcalLoud] = useState(false);
  /** Mirror of open for the stable open() callback (re-entry guard). */
  const openRef = useRef(false);
  const lastFocus = useRef<Element | null>(null);
  const callRef = useRef<HTMLDivElement>(null);
  const zcalWrapRef = useRef<HTMLDivElement>(null);
  const zcalFrameRef = useRef<HTMLIFrameElement>(null);
  const activeCtaIdRef = useRef<string | null>(null);
  const schedulerLoadedRef = useRef(false);

  const close = useCallback(() => {
    openRef.current = false;
    setOpen(false);
    setZcalLoud(false);
    document.body.classList.remove("modal-open");
    if (lastFocus.current instanceof HTMLElement) lastFocus.current.focus();
    activeCtaIdRef.current = null;
  }, []);

  const openDialog = useCallback((rawCtaId: string | null) => {
    if (openRef.current) return; // the dialog is already up — ignore background triggers

    const ctaId = isCallCtaId(rawCtaId) ? rawCtaId : null;
    activeCtaIdRef.current = ctaId;
    schedulerLoadedRef.current = false;
    openRef.current = true;
    lastFocus.current = document.activeElement;
    setOpen(true);
    document.body.classList.add("modal-open");

    if (isCallCtaId(ctaId)) {
      pushAcquisitionEvent("scheduler_opened", {
        scheduler_id: SCHEDULER_ID,
        cta_id: ctaId,
        presentation: "embed",
      });
    }
  }, []);

  // Unmount with the dialog open (client-side navigation) must not strand the
  // page scroll-locked on the next route.
  useEffect(
    () => () => {
      document.body.classList.remove("modal-open");
    },
    [],
  );

  // Any [data-lv2-open="call"] element on the page is a trigger.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = (e.target as Element | null)?.closest?.("[data-lv2-open]");
      if (!t) return;
      if (t.getAttribute("data-lv2-open") !== "call") return;
      e.preventDefault();
      openDialog(t.getAttribute("data-analytics-id"));
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [openDialog]);

  // Focus management + Escape + tab trap.
  useEffect(() => {
    if (!open) return;
    const scrim = callRef.current;
    if (!scrim) return;
    const first = scrim.querySelector<HTMLElement>("[data-lv2-close]");
    requestAnimationFrame(() => first?.focus());

    const focusables = () =>
      Array.from(
        scrim.querySelectorAll<HTMLElement>(
          'button, input, textarea, a[href], iframe, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute("hidden") && el.offsetParent !== null);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (!items.length) return;
      const firstEl = items[0]!,
        lastEl = items[items.length - 1]!;
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  // zcal sizing: scale the compact card while it stays readable, otherwise
  // hand back to zcal's own tall layout. Re-fit on resize while open.
  const fitZcal = useCallback(() => {
    const wrap = zcalWrapRef.current;
    if (!wrap) return;
    const sheet = wrap.closest<HTMLElement>(".lp-sheet");
    if (!sheet) return;
    const availW = sheet.clientWidth - 32; // sheet side padding
    const availH = window.innerHeight - 40 - (sheet.clientHeight - wrap.clientHeight);
    const s = Math.min(availW / 950, availH / 610, 1);
    if (s >= ZCAL_MIN_SCALE) {
      wrap.style.setProperty("--zs", s.toFixed(4));
      wrap.classList.add("is-fit");
      wrap.classList.remove("is-native");
    } else {
      wrap.style.removeProperty("--zs");
      wrap.classList.add("is-native");
      wrap.classList.remove("is-fit");
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    fitZcal();
    // if the frame is blocked (third-party storage, extension, strict privacy
    // mode) the fallback link is the way through — surface it after a beat
    const t = setTimeout(() => {
      const f = zcalFrameRef.current;
      try {
        if (!f || !f.contentWindow || f.clientHeight < 80) setZcalLoud(true);
      } catch {
        setZcalLoud(true);
      }
    }, 3500);
    let pending = false;
    const onResize = () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        fitZcal();
      });
    };
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", onResize);
    };
  }, [open, fitZcal]);

  return (
    <div
      ref={callRef}
      className={`lp-scrim${open ? " is-open" : ""}`}
      hidden={!open}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="lp-sheet" role="dialog" aria-modal="true" aria-labelledby="lp-call-title">
        <button
          type="button"
          className="lp-sheet-close"
          data-lv2-close=""
          aria-label="Close"
          onClick={close}
        >
          &#10005;
        </button>
        <h3 id="lp-call-title" className="lp-call-title">
          Book a demo
        </h3>
        <div ref={zcalWrapRef} className="lp-zcal-wrap">
          {/* the calendar iframe exists only while the dialog is open */}
          {open && (
            <iframe
              ref={zcalFrameRef}
              className="lp-zcal-frame"
              title="Pick a time with Pancake"
              allow="clipboard-write; camera; microphone"
              referrerPolicy="no-referrer-when-downgrade"
              src={ZCAL_URL}
              onLoad={() => {
                if (schedulerLoadedRef.current) return;
                const ctaId = activeCtaIdRef.current;
                if (!isCallCtaId(ctaId)) return;
                schedulerLoadedRef.current = true;
                pushAcquisitionEvent("scheduler_loaded", {
                  scheduler_id: SCHEDULER_ID,
                  cta_id: ctaId,
                  presentation: "embed",
                });
              }}
            />
          )}
        </div>
        <p className={`lp-sheet-note${zcalLoud ? " is-loud" : ""}`}>
          Pick any slot that works, you will get the invite straight away. Calendar not loading?{" "}
          <a
            href="https://zcal.co/i/ZEHl48rv"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              const ctaId = activeCtaIdRef.current;
              if (!isCallCtaId(ctaId)) return;
              pushAcquisitionEvent("scheduler_fallback_clicked", {
                scheduler_id: SCHEDULER_ID,
                cta_id: ctaId,
              });
            }}
          >
            Open it in a new tab
          </a>
          .
        </p>
      </div>
    </div>
  );
}
