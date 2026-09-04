"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

import { useSearchParams } from "next/navigation";

export type Audience = "humans" | "agents";
const AudienceContext = createContext<{ audience: Audience; setAudience: (value: Audience) => void }>({
  audience: "humans",
  setAudience: () => {},
});
export const useAudience = () => useContext(AudienceContext);

/** A real URL for sharing/back/forward, without navigation or remounting art. */
export function LpAudience({ initialAudience, children }: { initialAudience: Audience; children: ReactNode }) {
  const searchParams = useSearchParams();
  const audience: Audience = searchParams ? (searchParams.get("audience") === "agents" ? "agents" : "humans") : initialAudience;
  const [announcement, setAnnouncement] = useState("");
  const setAudience = useCallback((value: Audience) => {
    const url = new URL(window.location.href);
    if (value === "agents") url.searchParams.set("audience", "agents");
    else {
      url.searchParams.delete("audience");
    }
    if (url.href !== window.location.href) window.history.pushState(null, "", url);
    setAnnouncement(value === "agents" ? "For agents selected." : "For humans selected.");
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
  const refs = useRef<(HTMLAnchorElement | null)[]>([]);
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
  return <div ref={selectorRef} className="lp-audience-selector" role="group" aria-label="Choose your perspective">
    <span className="lp-audience-selector__track" aria-hidden="true" />
    {(["humans", "agents"] as const).map((mode, index) => <a
      key={mode}
      ref={node => { refs.current[index] = node; }}
      href={mode === "agents" ? "/?audience=agents" : "/"}
      aria-current={audience === mode ? "true" : undefined}
      onClick={event => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault(); setAudience(mode);
      }}
      onKeyDown={event => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End", " "].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === "Home" ? 0 : event.key === "End" ? 1 : event.key === " " ? index : 1 - index;
        setAudience(next === 0 ? "humans" : "agents"); refs.current[next]?.focus();
      }}
    >
      <span className={`lp-audience-glyph lp-audience-glyph--${mode}`} aria-hidden="true">{mode === "humans" ? <svg viewBox="0 0 20 20"><circle cx="10" cy="6" r="3" /><path d="M4 17v-2a6 6 0 0 1 12 0v2" /></svg> : <svg viewBox="0 0 20 20"><rect x="3" y="5" width="14" height="12" rx="4" /><path d="M10 2v3M7 10v2m6-2v2" /></svg>}</span>
      For {mode}
    </a>)}
  </div>;
}
