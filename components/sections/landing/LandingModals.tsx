"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { suspendAllSnakes } from "./snake";

/**
 * The landing's two dialogs — waitlist form and zcal booking — ported from
 * public/landing-v2.html. One instance mounts at page level; any element
 * anywhere on the page opens them via `data-lv2-open="waitlist" | "call"`
 * (a document-level click listener, so server components can be triggers).
 */

const ZCAL_URL = "https://zcal.co/i/ZEHl48rv?embed=1&embedType=iframe";
const HANDOFF_CHIPS = [
  "Outbound",
  "Content & social",
  "SEO & landing pages",
  "Ads",
  "Lead research",
  "CRM hygiene",
] as const;

/** Fit the compact 950x610 zcal card while readable, else fall back to zcal's
 *  own tall scrollable layout (what it is designed for on a phone). */
const ZCAL_MIN_SCALE = 0.62;

export function LandingModals() {
  const [openName, setOpenName] = useState<"waitlist" | "call" | null>(null);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [chips, setChips] = useState<Set<string>>(new Set());
  const [zcalLoud, setZcalLoud] = useState(false);
  const lastFocus = useRef<Element | null>(null);
  const waitlistRef = useRef<HTMLDivElement>(null);
  const callRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const zcalWrapRef = useRef<HTMLDivElement>(null);
  const zcalFrameRef = useRef<HTMLIFrameElement>(null);

  const close = useCallback(() => {
    setOpenName(null);
    setZcalLoud(false);
    document.body.classList.remove("modal-open");
    suspendAllSnakes(false);
    if (lastFocus.current instanceof HTMLElement) lastFocus.current.focus();
  }, []);

  const open = useCallback((name: "waitlist" | "call") => {
    lastFocus.current = document.activeElement;
    setOpenName(name);
    document.body.classList.add("modal-open");
    suspendAllSnakes(true);
  }, []);

  // Any [data-lv2-open] element on the page is a trigger.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = (e.target as Element | null)?.closest?.("[data-lv2-open]");
      if (!t) return;
      const name = t.getAttribute("data-lv2-open");
      if (name === "waitlist" || name === "call") open(name);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [open]);

  // Focus management + Escape + tab trap, straight from the static page.
  useEffect(() => {
    if (!openName) return;
    const scrim = openName === "waitlist" ? waitlistRef.current : callRef.current;
    if (!scrim) return;
    const first =
      openName === "waitlist"
        ? emailRef.current
        : scrim.querySelector<HTMLElement>("[data-lv2-close]");
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
  }, [openName, close]);

  // zcal sizing: scale the compact card while it stays readable, otherwise
  // hand back to zcal's own tall layout. Re-fit on resize while open.
  const fitZcal = useCallback(() => {
    const wrap = zcalWrapRef.current;
    if (!wrap) return;
    const sheet = wrap.closest<HTMLElement>(".lv2-sheet");
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
    if (openName !== "call") return;
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
  }, [openName, fitZcal]);

  const toggleChip = (chip: string) =>
    setChips((prev) => {
      const next = new Set(prev);
      if (next.has(chip)) next.delete(chip);
      else next.add(chip);
      return next;
    });

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const email = String(data.get("email") || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setError("Enter a valid email address.");
      emailRef.current?.focus();
      return;
    }
    setError("");
    setSending(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          companyUrl: String(data.get("companyUrl") || "").trim(),
          about: String(data.get("about") || "").trim(),
          handoff: Array.from(chips),
          website: String(data.get("website") || ""),
          source: "landing-v2",
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || "Something went wrong.");
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* ---------- waitlist ---------- */}
      <div
        ref={waitlistRef}
        className={`lv2-scrim${openName === "waitlist" ? " is-open" : ""}`}
        hidden={openName !== "waitlist"}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <div className="lv2-sheet" role="dialog" aria-modal="true" aria-labelledby="lv2-wl-title">
          <button
            type="button"
            className="lv2-sheet-close"
            data-lv2-close=""
            aria-label="Close"
            onClick={close}
          >
            &#10005;
          </button>
          {!done ? (
            <div>
              <h3 id="lv2-wl-title">Join the waitlist</h3>
              <p className="lv2-sheet-sub">
                We onboard a handful of teams at a time. Tell us what you are building and we will
                come back to you when it is your turn.
              </p>
              <form onSubmit={submit} noValidate>
                <div className="lv2-field">
                  <label htmlFor="lv2-wl-email">Email address</label>
                  <input
                    ref={emailRef}
                    id="lv2-wl-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@company.com"
                  />
                </div>
                <div className="lv2-field">
                  <label htmlFor="lv2-wl-url">What is your company&rsquo;s URL?</label>
                  <input
                    id="lv2-wl-url"
                    name="companyUrl"
                    type="text"
                    autoComplete="url"
                    placeholder="company.com"
                  />
                </div>
                <div className="lv2-field">
                  <label htmlFor="lv2-wl-about">What does your company do?</label>
                  <textarea
                    id="lv2-wl-about"
                    name="about"
                    rows={2}
                    placeholder="What you sell, and who buys it."
                  />
                </div>
                <div className="lv2-field">
                  <span className="lv2-field-label" id="lv2-wl-handoff-label">
                    What would you hand off first?
                  </span>
                  <div className="lv2-chips" role="group" aria-labelledby="lv2-wl-handoff-label">
                    {HANDOFF_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        className="lv2-chip"
                        aria-pressed={chips.has(chip)}
                        onClick={() => toggleChip(chip)}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="lv2-hp" aria-hidden="true">
                  <label htmlFor="lv2-wl-website">Leave this empty</label>
                  <input
                    id="lv2-wl-website"
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>
                <button type="submit" className="button lv2-sheet-submit" disabled={sending}>
                  {sending ? "Sending..." : "Join waitlist"}
                </button>
                <p className="lv2-form-error" role="alert">
                  {error}
                </p>
              </form>
            </div>
          ) : (
            <div className="lv2-sheet-done">
              <h3>You are on the list.</h3>
              <p className="lv2-sheet-sub">
                We will email you when it is your turn. No spam in between.
              </p>
              <button type="button" className="button" data-variant="outline" onClick={close}>
                Close
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ---------- book a call ---------- */}
      <div
        ref={callRef}
        className={`lv2-scrim${openName === "call" ? " is-open" : ""}`}
        hidden={openName !== "call"}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <div
          className="lv2-sheet is-wide"
          role="dialog"
          aria-modal="true"
          aria-labelledby="lv2-call-title"
        >
          <button
            type="button"
            className="lv2-sheet-close"
            data-lv2-close=""
            aria-label="Close"
            onClick={close}
          >
            &#10005;
          </button>
          <h3 id="lv2-call-title" className="lv2-call-title">
            Book a call
          </h3>
          <div ref={zcalWrapRef} className="lv2-zcal-wrap">
            {/* the calendar iframe exists only while the dialog is open */}
            {openName === "call" && (
              <iframe
                ref={zcalFrameRef}
                className="lv2-zcal-frame"
                title="Pick a time with Pancake"
                allow="clipboard-write; camera; microphone"
                referrerPolicy="no-referrer-when-downgrade"
                src={ZCAL_URL}
              />
            )}
          </div>
          <p className={`lv2-sheet-note${zcalLoud ? " is-loud" : ""}`}>
            Pick any slot that works, you will get the invite straight away. Calendar not loading?{" "}
            <a href="https://zcal.co/i/ZEHl48rv" target="_blank" rel="noopener noreferrer">
              Open it in a new tab
            </a>
            .
          </p>
        </div>
      </div>
    </>
  );
}
