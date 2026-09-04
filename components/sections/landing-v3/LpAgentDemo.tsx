"use client";

import { useEffect, useRef, useState } from "react";

import { gsap } from "@/lib/gsap";
import { AudienceCopy } from "./LpAudience";

type Workflow = "outreach" | "search";

const EXAMPLES = {
  outreach: {
    label: "Outreach",
    prompt: "Read my GTM Brain and latest leads. Show me who to contact first, why now, and a first message in my voice.",
    inputLabel: "From Pancake’s leads",
    inputTitle: "A launch in 21 days.",
    inputBody: "Sarah is launching her B2B SaaS on Product Hunt. She needs a clear way to show what it does.",
    resultLabel: "Your agent’s opening",
    resultTitle: "Start with her launch.",
    result: "Hey Sarah, saw you’re launching on Product Hunt in 21 days. We make SaaS launch videos people understand in seconds. Want an idea for yours?",
    takeaway: "Right buyer. Relevant timing. A specific offer.",
    ready: "Draft ready",
    icon: "↗",
  },
  search: {
    label: "Search",
    prompt: "Read my GTM Brain and SEO calendar. Suggest the next article to help my ideal buyers find me, with an outline in my voice.",
    inputLabel: "A next step for the SEO calendar",
    inputTitle: "What should a launch video show?",
    inputBody: "A B2B SaaS founder is preparing a Product Hunt launch. They want a video that explains the product fast.",
    resultLabel: "Your agent’s article brief",
    resultTitle: "Help them picture the result.",
    result: "A SaaS launch video in 60 seconds: show the buyer’s problem, one useful workflow, and the result. Finish with a shot list founders can use for their launch.",
    takeaway: "A buyer question. A useful answer. A reason to find you.",
    ready: "Brief ready",
    icon: "⌕",
  },
} satisfies Record<Workflow, {
  label: string; prompt: string; inputLabel: string; inputTitle: string;
  inputBody: string; resultLabel: string; resultTitle: string; result: string;
  takeaway: string; ready: string; icon: string;
}>;

const CONTEXT = [
  { label: "The offer", value: "SaaS launch videos", color: "peach" },
  { label: "The buyer", value: "B2B SaaS teams", color: "green" },
  { label: "The voice", value: "Short. Direct. Human.", color: "purple" },
];

/** A real-text clip reveal. The browser measures the actual text run, so
 * kerning survives and wrapping stays natural on phones. No character-span
 * reconstruction; the complete paragraph stays in the accessibility tree. */
function revealText(paragraph: HTMLElement, caret: HTMLElement, count: number) {
  const text = paragraph.firstChild;
  if (!text || text.nodeType !== Node.TEXT_NODE) return;
  const length = text.textContent?.length ?? 0;
  const visible = Math.min(length, Math.max(0, Math.floor(count)));
  if (visible >= length) {
    paragraph.style.clipPath = "none";
    caret.style.opacity = "0";
    return;
  }
  if (!visible) {
    paragraph.style.clipPath = "inset(0 0 100% 0)";
    caret.style.opacity = "0";
    return;
  }
  const range = document.createRange();
  range.setStart(text, visible - 1);
  range.setEnd(text, visible);
  const glyph = range.getBoundingClientRect();
  const box = paragraph.getBoundingClientRect();
  const x = Math.max(0, glyph.right - box.left);
  const top = Math.max(0, glyph.top - box.top);
  const bottom = Math.max(0, glyph.bottom - box.top);
  paragraph.style.clipPath = `polygon(0 0, 100% 0, 100% ${top}px, ${x}px ${top}px, ${x}px ${bottom}px, 0 ${bottom}px)`;
  caret.style.transform = `translate(${x}px, ${top}px)`;
  caret.style.height = `${Math.max(0, bottom - top)}px`;
  caret.style.opacity = "1";
}

export function LpAgentDemo() {
  const [workflow, setWorkflow] = useState<Workflow>("outreach");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const [paused, setPaused] = useState(false);
  const [finished, setFinished] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [phase, setPhase] = useState(0);
  const hostRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const replayAnimationRef = useRef<(() => void) | null>(null);
  const syncAnimationRef = useRef<(() => void) | null>(null);
  const pausedRef = useRef(false);
  const inViewRef = useRef(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyRequestRef = useRef(0);
  const workflowRef = useRef(workflow);
  workflowRef.current = workflow;
  const example = EXAMPLES[workflow];

  useEffect(() => () => {
    copyRequestRef.current += 1;
    if (copyTimer.current) clearTimeout(copyTimer.current);
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let context: gsap.Context | undefined;
    let observer: IntersectionObserver | undefined;
    let draftObserver: IntersectionObserver | undefined;
    let textObserver: ResizeObserver | undefined;
    let canceled = false;
    let complete = false;
    let draftInView = false;
    let waitingForDraft = false;
    let lastPhase = -1;
    pausedRef.current = false;
    setPaused(false);
    setFinished(false);
    setPhase(0);
    copyRequestRef.current += 1;
    if (copyTimer.current) clearTimeout(copyTimer.current);
    setCopyState("idle");
    setReduced(motion.matches);

    const sync = () => {
      const tl = timelineRef.current;
      if (!tl) return;
      if (motion.matches) {
        tl.progress(1, false).pause();
      } else if (complete || pausedRef.current || !inViewRef.current || (waitingForDraft && !draftInView)) {
        tl.pause();
      } else {
        waitingForDraft = false;
        tl.play();
      }
    };
    syncAnimationRef.current = sync;
    const onMotion = () => {
      setReduced(motion.matches);
      sync();
    };

    const build = () => {
      if (canceled) return;
      context = gsap.context(() => {
        const paragraph = host.querySelector<HTMLElement>(".lp-agent-demo__draft-copy");
        const caret = host.querySelector<HTMLElement>(".lp-agent-demo__caret");
        if (!paragraph || !caret) return;
        const letters = { count: 0 };
        const length = example.result.length;
        const typingAt = 3.7;
        const typingDuration = length * 0.025;
        const readyAt = typingAt + typingDuration + 0.25;
        const tl = gsap.timeline({
          paused: true,
          onUpdate: () => {
            const t = tl.time();
            const next = t < 2.1 ? 0 : t < 3.55 ? 1 : t < readyAt ? 2 : 3;
            if (next !== lastPhase) {
              lastPhase = next;
              setPhase(next);
            }
          },
          onComplete: () => { complete = true; setFinished(true); },
          onStart: () => { complete = false; setFinished(false); },
        });
        timelineRef.current = tl;
        replayAnimationRef.current = () => {
          complete = false;
          waitingForDraft = false;
          tl.pause(0, false);
          sync();
        };
        tl.fromTo(".lp-agent-demo__brain", { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65, ease: "power3.out" }, 0);
        tl.fromTo(".lp-agent-demo__fact", { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, stagger: 0.2, ease: "power3.out" }, 0.45);
        tl.fromTo(".lp-agent-demo__branch", { scaleY: 0 }, { scaleY: 1, duration: 0.8, transformOrigin: "50% 0", ease: "power2.inOut" }, 0.7);
        tl.fromTo(".lp-agent-demo__transfer", { scaleX: 0 }, { scaleX: 1, duration: 0.85, transformOrigin: "0 50%", ease: "power2.inOut" }, 1.65);
        tl.fromTo(".lp-agent-demo__input", { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, 2.1);
        tl.fromTo(".lp-agent-demo__draft", { y: 20, opacity: 0, scale: 0.98 }, { y: 0, opacity: 1, scale: 1, duration: 0.65, ease: "power3.out" }, 3.05);
        // On a phone the reader reaches the context before the result. Hold
        // the handoff until the draft itself is visible, so typing cannot
        // finish further down the page while they are still reading.
        tl.call(() => {
          if (!motion.matches && !draftInView) {
            waitingForDraft = true;
            tl.pause();
          }
        }, [], 3.05);
        tl.fromTo(".lp-agent-demo__draft-heading", { y: 6, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: "power2.out" }, 3.4);
        tl.fromTo(letters, { count: 0 }, {
          count: length,
          duration: typingDuration,
          ease: `steps(${length})`,
          onUpdate: () => revealText(paragraph, caret, letters.count),
        }, typingAt);
        tl.fromTo(".lp-agent-demo__takeaway", { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }, readyAt);
        tl.fromTo(".lp-agent-demo__ready-check", { scale: 0 }, { scale: 1, duration: 0.5, ease: "back.out(1.7)" }, readyAt);
        tl.to({}, { duration: 0.2 }, readyAt + 0.5);
        revealText(paragraph, caret, 0);
        textObserver = new ResizeObserver(() => revealText(paragraph, caret, letters.count));
        textObserver.observe(paragraph);
        host.dataset.motion = "ready";
        observer = new IntersectionObserver(([entry]) => {
          inViewRef.current = entry.isIntersecting && entry.intersectionRatio >= 0.15;
          sync();
        }, { threshold: 0.15 });
        observer.observe(host);
        const draft = host.querySelector<HTMLElement>(".lp-agent-demo__draft");
        if (draft) {
          draftObserver = new IntersectionObserver(([entry]) => {
            draftInView = entry.isIntersecting && entry.intersectionRatio >= 0.2;
            sync();
          }, { threshold: 0.2 });
          draftObserver.observe(draft);
        }
        sync();
      }, host);
    };

    // The measured clip uses the final Aeonik glyph positions.
    if (document.fonts?.ready) void document.fonts.ready.then(build);
    else build();
    motion.addEventListener("change", onMotion);
    return () => {
      canceled = true;
      observer?.disconnect();
      draftObserver?.disconnect();
      textObserver?.disconnect();
      motion.removeEventListener("change", onMotion);
      context?.revert();
      timelineRef.current = null;
      replayAnimationRef.current = null;
      syncAnimationRef.current = null;
      const paragraph = host.querySelector<HTMLElement>(".lp-agent-demo__draft-copy");
      if (paragraph) paragraph.style.clipPath = "";
      delete host.dataset.motion;
    };
  }, [workflow, example.result]);

  const copyPrompt = async () => {
    if (copyTimer.current) clearTimeout(copyTimer.current);
    const request = ++copyRequestRef.current;
    const requestedWorkflow = workflow;
    const isCurrentRequest = () => request === copyRequestRef.current && requestedWorkflow === workflowRef.current;
    try {
      await navigator.clipboard.writeText(example.prompt);
      if (!isCurrentRequest()) return;
      setCopyState("copied");
    } catch {
      if (!isCurrentRequest()) return;
      setCopyState("error");
    }
    copyTimer.current = setTimeout(() => {
      if (isCurrentRequest()) setCopyState("idle");
    }, 5000);
  };

  const replay = () => {
    if (reduced || !timelineRef.current) return;
    pausedRef.current = false;
    setPaused(false);
    setFinished(false);
    // Keep keyboard focus on Replay. The scene moves into view, then its
    // existing intersection gate permits playback; no offscreen restart.
    hostRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    replayAnimationRef.current?.();
  };

  const togglePaused = () => {
    if (reduced || finished || !timelineRef.current) return;
    const next = !pausedRef.current;
    pausedRef.current = next;
    setPaused(next);
    syncAnimationRef.current?.();
  };

  return (
    <section className="lp-agent-demo" id="with-your-agent" aria-labelledby="lp-agent-demo-title">
      <div className="lp-agent-demo__heading">
        <div>
          <p className="lp-agent-demo__eyebrow"><AudienceCopy human="Pancake + your agent" agent="Pancake + you" /></p>
          <h2 className="lp-title-section" id="lp-agent-demo-title">
            <AudienceCopy human="Your agent. Our GTM brain." agent="Our GTM brain. Your next move." />
          </h2>
        </div>
        <p className="lp-agent-demo__lede">
          <AudienceCopy
            human="Your agent reads your offer, your buyers, and your voice from Pancake. Give it the context to make the next move count."
            agent="Read the offer, the buyer, and the voice from Pancake. Use that context to make your human’s next move count."
          />
        </p>
      </div>

      <div className="lp-agent-demo__board">
        <div className="lp-agent-demo__toolbar">
          <p className="lp-agent-demo__company"><span aria-hidden="true">sp.</span> Studio Pelican <span className="lp-agent-demo__example-label">Example</span></p>
          <div className="lp-agent-demo__tabs" role="tablist" aria-label="Example workflow">
            {(Object.keys(EXAMPLES) as Workflow[]).map((key) => (
              <button
                type="button"
                role="tab"
                key={key}
                id={`agent-demo-tab-${key}`}
                aria-selected={workflow === key}
                aria-controls="agent-demo-panel"
                tabIndex={workflow === key ? 0 : -1}
                onClick={() => setWorkflow(key)}
                onKeyDown={(event) => {
                  if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
                    event.preventDefault();
                    const next = event.key === "Home" ? "outreach" : event.key === "End" ? "search" : workflow === "outreach" ? "search" : "outreach";
                    setWorkflow(next);
                    document.getElementById(`agent-demo-tab-${next}`)?.focus();
                  }
                }}
              >
                <span aria-hidden="true">{EXAMPLES[key].icon}</span> {EXAMPLES[key].label}
              </button>
            ))}
          </div>
        </div>

        <div id="agent-demo-panel" role="tabpanel" aria-labelledby={`agent-demo-tab-${workflow}`}>
          <div className="lp-agent-demo__prompt">
            <span className="lp-agent-demo__prompt-symbol" aria-hidden="true">↳</span>
            <p><span className="lp-agent-demo__prompt-label"><AudienceCopy human="Ask your agent" agent="A prompt from your human" /></span>{example.prompt}</p>
            <button type="button" className="lp-agent-demo__copy" onClick={copyPrompt} aria-label="Copy example prompt">
              <span aria-hidden="true">{copyState === "copied" ? "✓" : "⧉"}</span>
              {copyState === "copied" ? "Copied" : "Copy prompt"}
            </button>
          </div>
          <p className="lp-agent-demo__copy-status" role="status">
            {copyState === "copied" ? "Example prompt copied." : copyState === "error" ? "Copy unavailable. Select and copy the prompt above." : ""}
          </p>

          <div className="lp-agent-demo__scene" ref={hostRef}>
            <div className="lp-agent-demo__context">
              <div className="lp-agent-demo__brain">
                <span className="lp-agent-demo__brain-icon" aria-hidden="true"><i /><i /><i /></span>
                <div>
                  <p className="lp-agent-demo__label">Pancake’s GTM brain</p>
                  <h3>The context you share.</h3>
                </div>
              </div>
              <div className="lp-agent-demo__facts">
                <span className="lp-agent-demo__branch" aria-hidden="true" />
                {CONTEXT.map((fact) => (
                  <div className="lp-agent-demo__fact" data-color={fact.color} key={fact.label}>
                    <span className="lp-agent-demo__fact-dot" aria-hidden="true" />
                    <p className="lp-agent-demo__label">{fact.label}</p>
                    <p>{fact.value}</p>
                  </div>
                ))}
              </div>
              <p className="lp-agent-demo__context-note">One company. Shared context.</p>
              <span className="lp-agent-demo__transfer" aria-hidden="true"><i /><b>→</b></span>
            </div>

            <div className="lp-agent-demo__work">
              <div className="lp-agent-demo__input">
                <span className="lp-agent-demo__input-icon" aria-hidden="true">{example.icon}</span>
                <div>
                  <p className="lp-agent-demo__label">{example.inputLabel}</p>
                  <h3>{example.inputTitle}</h3>
                  <p className="lp-agent-demo__input-body">{example.inputBody}</p>
                </div>
              </div>
              <article className="lp-agent-demo__draft">
                <div className="lp-agent-demo__draft-heading">
                  <p className="lp-agent-demo__label"><AudienceCopy human={example.resultLabel} agent={workflow === "outreach" ? "Your opening" : "Your article brief"} /></p>
                  <span className="lp-agent-demo__draft-mark" aria-hidden="true">✳</span>
                  <h3>{example.resultTitle}</h3>
                </div>
                <div className="lp-agent-demo__typing">
                  <p className="lp-agent-demo__draft-copy">{example.result}</p>
                  <i className="lp-agent-demo__caret" aria-hidden="true" />
                </div>
                <p className="lp-agent-demo__takeaway"><span className="lp-agent-demo__ready-check" aria-hidden="true">✓</span>{example.takeaway}</p>
              </article>
            </div>
          </div>

          <div className="lp-agent-demo__playback">
            <div className="lp-agent-demo__progress" aria-label={`Example status: ${phase === 3 ? example.ready : phase === 2 ? "Writing" : phase === 1 ? "Finding the angle" : "Reading context"}`}>
              <span aria-hidden="true" className={phase >= 0 ? "is-active" : ""} />
              <span aria-hidden="true" className={phase >= 1 ? "is-active" : ""} />
              <span aria-hidden="true" className={phase >= 2 ? "is-active" : ""} />
              <span aria-hidden="true" className={phase >= 3 ? "is-active" : ""} />
              <p>{phase === 3 ? example.ready : phase === 2 ? "Writing" : phase === 1 ? "Finding the angle" : "Reading context"}</p>
            </div>
            <div className="lp-agent-demo__playback-controls">
              <button
                type="button"
                onClick={togglePaused}
                aria-disabled={finished || reduced}
                aria-label={reduced ? "Animation disabled for reduced motion" : finished ? "Example animation complete" : paused ? "Play example animation" : "Pause example animation"}
                style={{ minWidth: "6em" }}
              >{reduced ? "Static" : finished ? "Complete" : paused ? "▷ Play" : "Ⅱ Pause"}</button>
              <button type="button" onClick={replay} disabled={reduced} aria-label="Replay example animation">{reduced ? "Motion reduced" : "↻ Replay"}</button>
            </div>
          </div>
        </div>
      </div>
      <p className="lp-agent-demo__caption"><AudienceCopy
        human="Illustrative workflow. Pancake supplies the GTM context. Your connected agent creates the draft."
        agent="Illustrative workflow. Pancake supplies the GTM context. You create the draft for your human."
      /></p>
    </section>
  );
}
