"use client";

import { useEffect, useRef, useState } from "react";

import { AudienceCopy } from "./LpAudience";

const MCP_URL = "https://app.getpancake.ai/api/mcp";
const CODEX_COMMANDS = `codex mcp add pancake --url ${MCP_URL} --oauth-client-id https://app.getpancake.ai/.well-known/mcp-clients/pancake-cli.json
codex mcp login pancake`;
const CLIENTS = ["Codex", "Claude Code", "ChatGPT"] as const;
type Client = (typeof CLIENTS)[number];
type CopyTarget = "commands" | "endpoint";

function CopyIcon({ copied }: { copied: boolean }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      {copied ? <path d="m4 10 4 4 8-8" /> : <>
        <rect x="7" y="7" width="10" height="10" rx="2" />
        <path d="M13 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      </>}
    </svg>
  );
}

/** Setup remains readable in either perspective and never claims to connect on copy. */
export function LpAgentSetup() {
  const [client, setClient] = useState<Client>("Codex");
  const [copied, setCopied] = useState<CopyTarget | null>(null);
  const [copyStatus, setCopyStatus] = useState("");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const resetCopy = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (resetCopy.current) clearTimeout(resetCopy.current);
  }, []);

  async function copyText(target: CopyTarget) {
    if (resetCopy.current) clearTimeout(resetCopy.current);
    try {
      await navigator.clipboard.writeText(target === "commands" ? CODEX_COMMANDS : MCP_URL);
      setCopied(target);
      setCopyStatus(target === "commands" ? "Commands copied." : "Server URL copied.");
      resetCopy.current = setTimeout(() => setCopied(null), 2400);
    } catch {
      setCopied(null);
      setCopyStatus(target === "commands"
        ? "Copy unavailable. Select and copy the visible commands."
        : "Copy unavailable. Select and copy the visible server URL.");
    }
  }

  return (
    <section id="agent-setup" className="lp-agent-setup" aria-labelledby="lp-agent-setup-title">
      <div className="lp-agent-setup__intro">
        <p className="lp-agent-setup__eyebrow">A shared starting point</p>
        <h2 id="lp-agent-setup-title" className="lp-title-section">
          <AudienceCopy human="Bring your agent." agent="Meet your GTM brain." />
        </h2>
        <p className="lp-agent-setup__lede">
          <AudienceCopy
            human="Sign in and choose your workspace. Give your agent the GTM context to bring you customers."
            agent="Have your human sign in and choose a workspace. You get the GTM context to work from."
          />
        </p>
        <ul className="lp-agent-setup__capabilities" aria-label="Available workspace reads">
          <li><span aria-hidden="true">01</span>Read the GTM Brain</li>
          <li><span aria-hidden="true">02</span>Review existing leads</li>
          <li><span aria-hidden="true">03</span>Read the SEO calendar</li>
        </ul>
        <p className="lp-agent-setup__scope"><AudienceCopy
          human="Your agent uses the context to draft the next move. Sending and publishing are separate actions."
          agent="Use the context to draft the next move. Sending and publishing are separate actions."
        /></p>
        <div className="lp-agent-setup__resources">
          <a href="/agents" className="lp-text-link">Agent guide <span aria-hidden="true">↗</span></a>
          <a href="/llms.txt" className="lp-text-link">llms.txt <span aria-hidden="true">↗</span></a>
        </div>
      </div>

      <div className="lp-agent-setup__card">
        <div className="lp-agent-setup__tabs" role="tablist" aria-label="Connection instructions by client">
          {CLIENTS.map((name, index) => <button
            key={name}
            ref={node => { tabRefs.current[index] = node; }}
            type="button"
            role="tab"
            id={`lp-setup-tab-${index}`}
            aria-controls={`lp-setup-panel-${index}`}
            aria-selected={client === name}
            tabIndex={client === name ? 0 : -1}
            onClick={() => setClient(name)}
            onKeyDown={event => {
              if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
              event.preventDefault();
              const next = event.key === "Home" ? 0
                : event.key === "End" ? CLIENTS.length - 1
                  : (index + (event.key === "ArrowRight" ? 1 : -1) + CLIENTS.length) % CLIENTS.length;
              setClient(CLIENTS[next]);
              tabRefs.current[next]?.focus();
            }}
          >{name}</button>)}
        </div>

        {/* Inert preserves the grid's reserved height while removing inactive
            panel descendants from keyboard navigation and interaction. */}
        <div className="lp-agent-setup__panels">
          <div
            id="lp-setup-panel-0"
            className="lp-agent-setup__panel"
            role="tabpanel"
            aria-labelledby="lp-setup-tab-0"
            aria-hidden={client !== "Codex"}
            data-active={client === "Codex"}
            tabIndex={client === "Codex" ? 0 : -1}
            {...(client !== "Codex" ? { inert: "" as unknown as boolean } : {})}
          >
            <div className="lp-agent-setup__panel-top">
              <span className="lp-agent-setup__version">Codex CLI 0.148.0+</span>
              <button className="lp-agent-setup__copy" type="button" data-copied={copied === "commands"} onClick={() => copyText("commands")}>
                <CopyIcon copied={copied === "commands"} />
                {copied === "commands" ? "Copied" : "Copy commands"}
              </button>
            </div>
            <pre className="lp-agent-setup__code" aria-label="Codex connection commands"><code>{CODEX_COMMANDS}</code></pre>
            <p className="lp-agent-setup__instruction"><AudienceCopy
              human="Run both commands in your terminal. Finish the browser sign-in and choose a Pancake workspace."
              agent="Run both commands in a terminal. Have your human finish the browser sign-in and choose a Pancake workspace."
            /></p>
            <a href="https://app.getpancake.ai" className="lp-action">Open Pancake <span aria-hidden="true">↗</span></a>
          </div>

          <div
            id="lp-setup-panel-1"
            className="lp-agent-setup__panel"
            role="tabpanel"
            aria-labelledby="lp-setup-tab-1"
            aria-hidden={client !== "Claude Code"}
            data-active={client === "Claude Code"}
            tabIndex={client === "Claude Code" ? 0 : -1}
            {...(client !== "Claude Code" ? { inert: "" as unknown as boolean } : {})}
          >
            <p className="lp-agent-setup__client-heading">The context stays with the work.</p>
            <p><AudienceCopy
              human="Use Pancake’s connection instructions in your workspace. Complete the browser sign-in and select the workspace Claude Code can read."
              agent="Follow Pancake’s workspace connection instructions. Have your human complete the browser sign-in and select the workspace you can read."
            /></p>
            <p className="lp-agent-setup__instruction"><AudienceCopy
              human="Ask Claude Code to read your GTM Brain, leads, and SEO calendar. Then ask for a message draft."
              agent="Read the GTM Brain, existing leads, and SEO calendar. Draft a first message from that context."
            /></p>
            <div className="lp-agent-setup__actions">
              <a href="https://app.getpancake.ai" className="lp-action">Open Pancake <span aria-hidden="true">↗</span></a>
              <a href="/support" className="lp-text-link">Connection help</a>
            </div>
          </div>

          <div
            id="lp-setup-panel-2"
            className="lp-agent-setup__panel"
            role="tabpanel"
            aria-labelledby="lp-setup-tab-2"
            aria-hidden={client !== "ChatGPT"}
            data-active={client === "ChatGPT"}
            tabIndex={client === "ChatGPT" ? 0 : -1}
            {...(client !== "ChatGPT" ? { inert: "" as unknown as boolean } : {})}
          >
            <p className="lp-agent-setup__client-heading">Bring Pancake into the conversation.</p>
            <p><AudienceCopy
              human="Follow ChatGPT’s Pancake connection setup. Sign in through the browser, choose one workspace, and approve access."
              agent="Follow ChatGPT’s Pancake connection setup. Have your human sign in through the browser, choose one workspace, and approve access."
            /></p>
            <p className="lp-agent-setup__instruction"><AudienceCopy
              human="Once connected, ask ChatGPT to read your GTM Brain. Pancake supplies the context for your next request."
              agent="Read the GTM Brain once connected. Use Pancake’s context to answer your human’s next request."
            /></p>
            <div className="lp-agent-setup__actions">
              <a href="https://app.getpancake.ai" className="lp-action">Open Pancake <span aria-hidden="true">↗</span></a>
              <a href="/support" className="lp-text-link">Connection help</a>
            </div>
          </div>
        </div>

        <p className="lp-agent-setup__copy-status" role="status" aria-live="polite">{copyStatus}</p>

        <details className="lp-agent-setup__details">
          <summary>Connection details <span aria-hidden="true">+</span></summary>
          <div className="lp-agent-setup__details-body">
            <div className="lp-agent-setup__panel-top">
              <span>MCP server</span>
              <button className="lp-agent-setup__copy" type="button" data-copied={copied === "endpoint"} onClick={() => copyText("endpoint")}>
                <CopyIcon copied={copied === "endpoint"} />
                {copied === "endpoint" ? "Copied" : "Copy URL"}
              </button>
            </div>
            <code className="lp-agent-setup__endpoint">{MCP_URL}</code>
            <p><AudienceCopy
              human="OAuth gives access to one approved workspace. Review or revoke access in Pancake under Settings → MCP → Connected clients."
              agent="OAuth gives access to one approved workspace. Your human can review or revoke access under Settings → MCP → Connected clients."
            /></p>
            <p>Tool availability follows the connection. The <a href="/agents">agent guide</a> covers supported reads and setup details.</p>
          </div>
        </details>
      </div>
    </section>
  );
}
