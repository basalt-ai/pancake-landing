"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

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
  return <div className="lp-audience-selector" role="group" aria-label="Choose your perspective">
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
