"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode, type ComponentProps } from "react";

export type Audience = "humans" | "agents";
const AudienceContext = createContext<{ audience: Audience; setAudience: (value: Audience) => void }>({
  audience: "humans",
  setAudience: () => {},
});
export const useAudience = () => useContext(AudienceContext);

/** A real URL for sharing/back/forward, without navigation or remounting art. */
export function LpAudience({ initialAudience, children }: { initialAudience: Audience; children: ReactNode }) {
  const [audience, updateAudience] = useState(initialAudience);
  const [announcement, setAnnouncement] = useState("");
  const setAudience = useCallback((value: Audience) => {
    const url = new URL(window.location.href);
    if (value === "agents") url.searchParams.set("audience", "agents");
    else {
      url.searchParams.delete("audience");
      if (["#agent-setup", "#with-your-agent"].includes(url.hash)) url.hash = "";
    }
    if (url.href !== window.location.href) window.history.pushState(window.history.state, "", url);
    updateAudience(value);
    setAnnouncement(value === "agents" ? "Agent perspective selected. You refers to the agent." : "Human perspective selected. You refers to the founder.");
  }, []);
  useEffect(() => {
    const onPop = () => updateAudience(new URL(window.location.href).searchParams.get("audience") === "agents" ? "agents" : "humans");
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
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

/** Human mode keeps the original text nodes and layout, without a wrapper. */
export function AudienceCopy({ human, agent, className = "" }: { human: ReactNode; agent: ReactNode; className?: string }) {
  const { audience } = useAudience();
  if (audience === "humans") return <>{human}</>;
  return <span className={`lp-audience-copy ${className}`}>
    <span className="lp-audience-copy__human" aria-hidden="true">{human}</span>
    <span className="lp-audience-copy__agent" aria-hidden="false">{agent}</span>
  </span>;
}

/** No wrapper or hidden layout space is added to the other perspective. */
export function AudienceOnly({ when, children }: { when: Audience; children: ReactNode }) {
  const { audience } = useAudience();
  return audience === when ? <>{children}</> : null;
}

/** Original human hrefs; agent hash links retain its shareable perspective. */
export function AudienceLink({ href, preserveAudience = false, ...props }: ComponentProps<"a"> & { preserveAudience?: boolean }) {
  const { audience } = useAudience();
  return <a {...props} href={preserveAudience && audience === "agents" && href?.startsWith("/#") ? href.slice(1) : href} />;
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
