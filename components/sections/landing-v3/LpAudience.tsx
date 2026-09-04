"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";

import { useSearchParams } from "next/navigation";

export type Audience = "humans" | "agents";
type AudienceUpdate = Audience | ((current: Audience) => Audience);
const AudienceContext = createContext<{ audience: Audience; setAudience: (value: AudienceUpdate) => void }>({
  audience: "humans",
  setAudience: () => {},
});
export const useAudience = () => useContext(AudienceContext);

export function AudienceHeadline() {
  const { audience } = useAudience();
  return <>
    <span className="lp-hero-title__copy" aria-hidden={audience === "agents"}>
      You run your company<br />We bring you customers
    </span>
    <span className="lp-hero-title__copy" aria-hidden={audience === "humans"}>
      Give your human<br />GTM superpowers
    </span>
  </>;
}

/** A real URL for sharing/back/forward, without navigation or remounting art. */
export function LpAudience({ initialAudience, children }: { initialAudience: Audience; children: ReactNode }) {
  const searchParams = useSearchParams();
  const urlAudience: Audience = searchParams ? (searchParams.get("audience") === "agents" ? "agents" : "humans") : initialAudience;
  const [audience, setRenderedAudience] = useState(urlAudience);
  const desiredAudience = useRef(urlAudience);
  const committedAudience = useRef(urlAudience);
  const activeTransition = useRef<ViewTransition | null>(null);
  const request = useRef(0);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    // Browser history still drives the view. Ignore a stale router restore
    // when another toggle has already moved the URL forward.
    const current: Audience = new URL(window.location.href).searchParams.get("audience") === "agents" ? "agents" : "humans";
    if (urlAudience !== current || current === committedAudience.current) return;
    request.current += 1;
    activeTransition.current?.skipTransition();
    committedAudience.current = current;
    desiredAudience.current = current;
    setRenderedAudience(current);
  }, [urlAudience]);

  useEffect(() => {
    const onPopState = () => {
      request.current += 1;
      activeTransition.current?.skipTransition();
      const current: Audience = new URL(window.location.href).searchParams.get("audience") === "agents" ? "agents" : "humans";
      committedAudience.current = desiredAudience.current = current;
      setRenderedAudience(current);
    };
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
      request.current += 1;
      activeTransition.current?.skipTransition();
    };
  }, []);

  const setAudience = useCallback((update: AudienceUpdate) => {
    const value = typeof update === "function" ? update(desiredAudience.current) : update;
    desiredAudience.current = value;
    const id = ++request.current;
    activeTransition.current?.skipTransition();
    const url = new URL(window.location.href);
    if (value === "agents") url.searchParams.set("audience", "agents");
    else url.searchParams.delete("audience");
    const commit = () => {
      if (request.current !== id) return;
      committedAudience.current = value;
      flushSync(() => {
        setRenderedAudience(value);
        if (url.href !== window.location.href) window.history.pushState(null, "", url);
        setAnnouncement(value === "agents" ? "For agents selected." : "For humans selected.");
      });
    };
    if (!document.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      commit();
      return;
    }
    // Commit in the capture callback without waiting for animation frames.
    // View Transitions suppress rendering during capture, so waiting for a
    // redraw here postponed the response until the old 80ms timeout expired.
    const transition = document.startViewTransition(commit);
    activeTransition.current = transition;
    const clear = () => { if (activeTransition.current === transition) activeTransition.current = null; };
    void transition.ready.catch(() => {}); // A rapid toggle may skip its predecessor.
    void transition.finished.then(clear, clear);
  }, []);
  return (
    <AudienceContext.Provider value={{ audience, setAudience }}>
      <main id="main-content" className="lp lp-audience-page" data-audience={audience}>
        <span className="lp-sr-only" role="status">{announcement}</span>
        {children}
      </main>
    </AudienceContext.Provider>
  );
}

export function AudienceSelector() {
  const { audience, setAudience } = useAudience();
  const selectorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const selector = selectorRef.current;
    const placement = selector?.parentElement;
    const inner = placement?.closest<HTMLElement>(".lp-hero-inner");
    const heading = inner?.querySelector<HTMLElement>(".lp-hero-title");
    if (!selector || !placement || !inner || !heading) return;
    // Anchor to the original headline without changing its markup or flow.
    // Divide out the hero's existing short-window scale so both stay aligned.
    const position = () => {
      const box = inner.getBoundingClientRect();
      const title = heading.getBoundingClientRect();
      const scale = box.width / inner.offsetWidth || 1;
      const gutter = parseFloat(getComputedStyle(inner).getPropertyValue("--lp-space-8"));
      const gap = parseFloat(getComputedStyle(inner).getPropertyValue("--lp-space-4"));
      const half = selector.offsetWidth / 2;
      const edge = Math.min(gutter, Math.max(0, inner.offsetWidth / 2 - half));
      const center = Math.max(half + edge, Math.min((title.right - box.left) / scale - gap, inner.offsetWidth - half - edge));
      placement.style.setProperty("--lp-audience-center", `${center}px`);
      placement.style.setProperty("--lp-audience-top", `${(title.top - box.top) / scale}px`);
      placement.dataset.ready = "true";
    };
    const observer = new ResizeObserver(position);
    observer.observe(inner);
    observer.observe(heading);
    observer.observe(selector);
    position();
    return () => observer.disconnect();
  }, []);
  return <div ref={selectorRef} className="lp-audience-selector">
    <span className="lp-audience-selector__label" data-active={audience === "humans"}>For humans</span>
    <button
      type="button"
      className="lp-audience-switch"
      role="switch"
      aria-label="For agents"
      aria-checked={audience === "agents"}
      onClick={() => setAudience(current => current === "agents" ? "humans" : "agents")}
    >
      <span className="lp-audience-switch__track" aria-hidden="true">
        <span className="lp-audience-switch__thumb" />
      </span>
    </button>
    <span className="lp-audience-selector__label" data-active={audience === "agents"}>For agents</span>
  </div>;
}
