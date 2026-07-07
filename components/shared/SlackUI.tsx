"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { slack } from "@/lib/copy";

const SLACK_PURPLE = "#4A154B";
const SLACK_MUTED = "rgba(255,255,255,0.55)";
const SLACK_TEXT = "#1d1c1d";

const AGENT_DISPLAY_NAME = "Pancake";

type Channel = (typeof slack.channels)[number];

type PreviewRow = { lead: string; body: string };

type NotionLinkPreviewSpec = {
  pageTitle: string;
  metaLines: readonly [string, string, string];
};

type AgentMessage = {
  id: string;
  kind: "agent";
  agentHandle: string;
  time: string;
  text: string;
  actions?: string[];
  taskTag?: string;
  actionLink?: { label: string; notionPreview?: NotionLinkPreviewSpec };
  previewBlock?: { rows: PreviewRow[]; moreLabel: string };
  /** Decorative Slack-style reactions (non-interactive) */
  reactions?: readonly { emoji: string; count: number }[];
};

type UserMessage = {
  id: string;
  kind: "user";
  time: string;
  text: string;
};

type SlackMsg = AgentMessage | UserMessage;

const CHANNEL_MESSAGES: Record<Channel, SlackMsg[]> = {
  "#briefing": [
    {
      id: "b1",
      kind: "agent",
      agentHandle: "aria",
      time: "8:00 AM",
      text: `Good morning. Here's Your Company overnight:

· MRR: $4,280 → $4,620 (+$340, 2 new customers from LinkedIn outbound)
· Outbound: 131 connection requests sent Monday → 34 accepted → 6 demo calls booked this week
· Content: Your X thread hit 847K impressions. +1,200 followers in 48h
· Product: 0 incidents. Hotfix PR #294 auto-shipped at 3AM. Webhook error rate → 0%

One thing needs you today:
Demo call with Ramp (Series B fintech, $80K potential ACV) at 2pm.
Prep doc ready →`,
      actionLink: {
        label: "Open prep doc in Notion →",
        notionPreview: {
          pageTitle: "Prep: Ramp Demo Call",
          metaLines: [
            "Company: Ramp (Series B)",
            "ACV: $80K",
            "Contact: Lisa Park, VP Eng",
          ],
        },
      },
    },
  ],
  "#outbound": [
    {
      id: "o1",
      kind: "agent",
      agentHandle: "scout",
      time: "9:15 AM",
      text: `Signal: 23 ICP companies posted "Senior AI Engineer" on LinkedIn in 72h. 19 are net-new. 147 decision-makers listed, each with a personalized invite:

Preview cards:`,
      previewBlock: {
        rows: [
          {
            lead: "→ Sarah Chen, VP Eng @ Raycast",
            body: `"Saw your post on scaling reviews across 12 repos. We built an API for that. 2-min demo?"`,
          },
          {
            lead: "→ Priya Sharma, Head of Platform @ Vercel",
            body: `"Loved your Next.js Conf talk on CI. We cut review time by 60%. Worth a look?"`,
          },
        ],
        moreLabel: "⋯ 145 more",
      },
      actions: ["Send 147 invites", "Edit list", "Skip"],
    },
    {
      id: "o2",
      kind: "user",
      time: "9:18 AM",
      text: "Send. Skip under Series A.",
    },
    {
      id: "o3",
      kind: "agent",
      agentHandle: "scout",
      time: "9:18 AM",
      text: `Done. 131 sent, 16 pre-seed removed. Follow-ups drip over 5 days.`,
      taskTag: "✅ Task completed · outbound pipeline",
      reactions: [{ emoji: "🚀", count: 1 }],
    },
  ],
  "#content": [
    {
      id: "c1",
      kind: "agent",
      agentHandle: "ghostwriter",
      time: "7:45 AM",
      text: `Your X thread just crossed 847K impressions in 48 hours.
Here's the breakdown:

📊 2,340 likes · 412 reposts · 89 replies · 4.2x your avg engagement

Notable replies:
  · @guillaumepalayer (22K followers): "This is the future of code review"
  · @swyx (178K followers) quoted your thread with "underrated tool"
  · 2 partners at a16z liked it

I already replied to the top 8 high-follower accounts to keep
momentum going. Also:

→ Repurposed the thread into a LinkedIn post (scheduled tomorrow 8AM EST)
→ Extracted 3 pull-quotes for your landing page testimonials section
→ Added 14 new followers who match your ICP to the outbound list in #outbound`,
    },
  ],
  "#product": [
    {
      id: "p1",
      kind: "agent",
      agentHandle: "shipwright",
      time: "3:47 AM",
      text: `🔴 Incident auto-resolved.

3:12 AM: Sentry flagged 340 TypeError on /api/v2/webhooks. Root cause: PR #291, payload.metadata is null when source is Stripe.

1. Fixed in webhook_handler.ts:L142 → PR #294 (null coalescing + fallback)
2. 14/14 tests passing, new edge case covered
3. Deployed to staging → errors dropped to 0 → shipped to prod at 3:41 AM

23 affected webhook deliveries auto-retried. All succeeded.`,
      reactions: [{ emoji: "🫡", count: 1 }],
    },
    {
      id: "p2",
      kind: "agent",
      agentHandle: "shipwright",
      time: "3:48 AM",
      text: `Postmortem drafted in Notion. Added a pre-merge check for nullable fields from payment providers.`,
      taskTag: "✅ Incident resolved · 28 min from detection to fix",
    },
    {
      id: "p3",
      kind: "user",
      time: "9:30 AM",
      text: "Good bot.",
    },
  ],
};

/** Muted topic line in the channel header — Slack idiom, and a one-glance
 *  summary of what each channel demos. */
const CHANNEL_TOPICS: Record<Channel, string> = {
  "#briefing": "Daily digest, 8:00 AM",
  "#outbound": "Leads, invites, follow-ups",
  "#content": "Threads, posts, repurposing",
  "#product": "Incidents, PRs, releases",
};

const COMPOSER_TEMPLATE: Record<Channel, string> = {
  "#briefing": "What needs me today?",
  "#outbound": "Send. Skip under Series A.",
  "#content": "Repurpose this into a LinkedIn carousel too.",
  "#product": "Good bot.",
};

const PICKER_EMOJIS = ["🤖", "🫡", "🚀", "👀"] as const;

type ComposerState = { revealed: number; started: boolean; suffix: string };

function emptyComposerState(): Record<Channel, ComposerState> {
  return {
    "#briefing": { revealed: 0, started: false, suffix: "" },
    "#outbound": { revealed: 0, started: false, suffix: "" },
    "#content": { revealed: 0, started: false, suffix: "" },
    "#product": { revealed: 0, started: false, suffix: "" },
  };
}

function SlackComposer({ activeChannel }: { activeChannel: Channel }) {
  const [byChannel, setByChannel] = useState(emptyComposerState);
  const [clipTipVisible, setClipTipVisible] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const clipTipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const clipRef = useRef<HTMLDivElement>(null);
  const linkRef = useRef<HTMLDivElement>(null);

  const template = COMPOSER_TEMPLATE[activeChannel];
  const state = byChannel[activeChannel];
  const fullTemplateLen = template.length;
  const typed = template.slice(0, Math.min(state.revealed, fullTemplateLen));
  const display = typed + state.suffix;
  const templateComplete = state.revealed >= fullTemplateLen;
  const showPlaceholder = !state.started && state.revealed === 0;
  const showCaret = state.started && !templateComplete;

  useEffect(() => {
    if (!state.started || state.revealed >= fullTemplateLen) return;
    const id = window.setTimeout(() => {
      setByChannel((prev) => {
        const s = prev[activeChannel];
        const len = COMPOSER_TEMPLATE[activeChannel].length;
        return {
          ...prev,
          [activeChannel]: {
            ...s,
            revealed: Math.min(s.revealed + 1, len),
          },
        };
      });
    }, 50);
    return () => window.clearTimeout(id);
  }, [activeChannel, state.started, state.revealed, fullTemplateLen]);

  useEffect(() => {
    return () => {
      if (clipTipTimer.current) clearTimeout(clipTipTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!emojiOpen) return;
    const close = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setEmojiOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [emojiOpen]);

  useEffect(() => {
    if (!clipTipVisible) return;
    const close = (e: MouseEvent) => {
      if (clipRef.current && !clipRef.current.contains(e.target as Node)) {
        if (clipTipTimer.current) {
          clearTimeout(clipTipTimer.current);
          clipTipTimer.current = null;
        }
        setClipTipVisible(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [clipTipVisible]);

  useEffect(() => {
    if (!linkPopoverOpen) return;
    const close = (e: MouseEvent) => {
      if (linkRef.current && !linkRef.current.contains(e.target as Node)) {
        setLinkPopoverOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [linkPopoverOpen]);

  const bumpOnKey = useCallback(() => {
    setByChannel((prev) => {
      const s = prev[activeChannel];
      const len = COMPOSER_TEMPLATE[activeChannel].length;
      return {
        ...prev,
        [activeChannel]: {
          ...s,
          started: true,
          revealed: Math.min(s.revealed + 4, len),
        },
      };
    });
  }, [activeChannel]);

  const onComposerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      return;
    }
    if (e.key === "Tab") return;
    e.preventDefault();
    bumpOnKey();
  };

  const onComposerFocus = () => {
    setByChannel((prev) => ({
      ...prev,
      [activeChannel]: { ...prev[activeChannel], started: true },
    }));
  };

  const channelName = activeChannel.replace(/^#/, "");

  /** Shared Slack-style mini tooltip (link + paperclip) */
  const slackTooltipWrap =
    "absolute bottom-full left-1/2 z-30 mb-1.5 flex -translate-x-1/2 flex-col items-center";
  const slackTooltipCard =
    "w-fit max-w-[min(18rem,calc(100vw-2rem))] rounded-lg bg-[#1a1d21] px-2.5 py-1.5 text-center shadow-[0_3px_10px_rgba(0,0,0,0.2)]";
  const slackTooltipCaret =
    "-mt-px h-0 w-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-[#1a1d21]";

  const onPaperclipClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (clipTipTimer.current) {
      clearTimeout(clipTipTimer.current);
      clipTipTimer.current = null;
    }
    if (clipTipVisible) {
      setClipTipVisible(false);
      return;
    }
    setClipTipVisible(true);
    clipTipTimer.current = setTimeout(() => {
      setClipTipVisible(false);
      clipTipTimer.current = null;
    }, 2600);
  };

  const insertEmoji = (ch: string) => {
    setByChannel((prev) => ({
      ...prev,
      [activeChannel]: {
        ...prev[activeChannel],
        started: true,
        revealed: Math.max(prev[activeChannel].revealed, COMPOSER_TEMPLATE[activeChannel].length),
        suffix: prev[activeChannel].suffix + ch,
      },
    }));
    setEmojiOpen(false);
  };

  return (
    <div className="border-t border-[#e8e8e8] bg-white px-4 pb-4 pt-3">
      <div className="rounded-lg border border-[#cccccc] bg-white px-3 py-2 shadow-[inset_0_1px_1px_rgba(0,0,0,0.04)]">
        <div
          role="textbox"
          tabIndex={0}
          aria-label={`Message ${activeChannel}`}
          onFocus={onComposerFocus}
          onKeyDown={onComposerKeyDown}
          /**
           * Fixed `h-[44px]` (two lines at 15 px / 22 px line-height) — NOT
           * `min-h`. Each channel reveals a different `COMPOSER_TEMPLATE`
           * via the typewriter; with `min-h` the contenteditable would grow
           * by 0 / 1 / 2 lines depending on the template's wrap, which
           * pushed the message area up and down on every channel switch.
           * Lock to two lines (the longest template at narrow widths fits
           * in two), `overflow-hidden` to clip any future longer template,
           * `whitespace-pre-wrap break-words` already wraps inside.
           */
          className="h-[44px] cursor-text select-none overflow-hidden text-left text-[15px] leading-normal outline-none ring-0 focus:outline-none"
          style={{ color: showPlaceholder ? "#868686" : SLACK_TEXT }}
        >
          {showPlaceholder ? (
            <span className="text-[#868686]">Message #{channelName}</span>
          ) : (
            <span className="whitespace-pre-wrap break-words">
              {display}
              {showCaret ? (
                <span
                  className="ml-px inline-block w-px animate-pulse bg-[#1d1c1d]"
                  style={{ height: "1.15em", verticalAlign: "text-bottom" }}
                  aria-hidden
                />
              ) : null}
            </span>
          )}
        </div>
        <div className="relative mt-2 flex items-center gap-3 border-t border-[#f0f0f0] pt-2 text-[13px] font-semibold text-[#868686]">
          <button
            type="button"
            title="Bold"
            tabIndex={-1}
            className="-mx-0.5 cursor-pointer select-none rounded px-1.5 py-0.5 font-semibold not-italic text-[#868686] transition-[color,background-color,transform] duration-150 ease-out hover:bg-[#ececec] hover:text-[#1d1c1d] active:scale-[0.96]"
          >
            B
          </button>
          <button
            type="button"
            title="Italic"
            tabIndex={-1}
            className="-mx-0.5 cursor-pointer select-none rounded px-1.5 py-0.5 italic text-[#868686] transition-[color,background-color,transform] duration-150 ease-out hover:bg-[#ececec] hover:text-[#1d1c1d] active:scale-[0.96]"
          >
            I
          </button>
          <div className="relative" ref={linkRef}>
            <button
              type="button"
              title="Link"
              className="cursor-pointer select-none border-0 bg-transparent p-0 text-[inherit]"
              onClick={(e) => {
                e.preventDefault();
                setLinkPopoverOpen((o) => !o);
              }}
            >
              🔗
            </button>
            {linkPopoverOpen ? (
              <div className={slackTooltipWrap} role="dialog" aria-label="flappybird.io">
                <div className={slackTooltipCard}>
                  <a
                    href="https://flappybird.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12px] font-medium leading-tight text-[#36C5F0] underline decoration-[#36C5F0]/70 underline-offset-2 hover:text-[#70d4f7]"
                  >
                    flappybird.io
                  </a>
                </div>
                <div className={slackTooltipCaret} aria-hidden />
              </div>
            ) : null}
          </div>
          <div className="relative" ref={emojiRef}>
            <button
              type="button"
              title="Emoji"
              className="cursor-pointer select-none border-0 bg-transparent p-0 text-[inherit]"
              onClick={(e) => {
                e.preventDefault();
                setEmojiOpen((o) => !o);
              }}
            >
              😊
            </button>
            {emojiOpen ? (
              <div
                className="absolute bottom-full left-1/2 z-30 mb-1 flex -translate-x-1/2 gap-1 rounded-md border border-[#e0e0e0] bg-white px-2 py-1.5 shadow-md"
                role="listbox"
              >
                {PICKER_EMOJIS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    className="rounded px-1.5 py-0.5 text-lg leading-none hover:bg-[#f0f0f0]"
                    onClick={() => insertEmoji(em)}
                  >
                    {em}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <div className="relative" ref={clipRef}>
            <button
              type="button"
              title="Attach"
              className="cursor-pointer select-none border-0 bg-transparent p-0 text-[inherit]"
              onClick={onPaperclipClick}
            >
              📎
            </button>
            {clipTipVisible ? (
              <div className={slackTooltipWrap} role="tooltip">
                <div className={slackTooltipCard}>
                  <p className="whitespace-nowrap text-[12px] font-medium leading-tight text-white/95">
                    Nice try. No upload yet 😅
                  </p>
                </div>
                <div className={slackTooltipCaret} aria-hidden />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Pancake avatar — the project's pancake-monster mascot. Centred in a
 * 36 px disc with cream backing and `object-contain` so the *whole* mascot
 * (face + pancake stack) reads — no awkward face-crop. Same `/pancake-monster.png`
 * the hero and org-chart use so the character stays consistent.
 */
function CeoAgentAvatar() {
  return (
    <div
      className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#FFF1DA] shadow-[inset_0_-1px_0_rgba(0,0,0,0.10),inset_0_0_0_1px_rgba(0,0,0,0.06)]"
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- pancake mascot raster */}
      <img
        src="/pancake-monster.png"
        alt=""
        width={32}
        height={32}
        className="block h-8 w-8 object-contain"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

/**
 * "You" avatar — same purple-silhouette mark used by the org chart's founder
 * chip (`HomeOrgDiagram` Figma `428:14931`). Inline SVG so it scales sharp at
 * 36 px and pulls live colours from the design-system palette tokens.
 */
function YouAvatar() {
  return (
    <div
      className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full shadow-[inset_0_-1px_0_rgba(0,0,0,0.12)]"
      aria-hidden
    >
      <svg
        viewBox="0 0 108 108"
        width={36}
        height={36}
        preserveAspectRatio="xMidYMid meet"
        className="block h-9 w-9"
      >
        <rect width="108" height="108" rx="54" fill="var(--palette-purple-10)" />
        {/* head */}
        <path
          d="M70.7992 43.5975C72.1483 59.1754 65.1894 74.0014 49.5981 75.4872C33.9421 76.979 24.4667 63.8761 23.1042 48.1425C21.7417 32.4089 28.8112 17.7294 44.4672 16.2375C60.0585 14.7517 69.4502 28.0197 70.7992 43.5975Z"
          fill="var(--palette-purple-30)"
        />
        {/* shoulders */}
        <path
          d="M59.8224 148.311C38.4258 154.044 16.024 148.002 10.0967 126.621C4.14489 105.151 20.08 88.6935 41.6905 82.903C63.301 77.1125 85.5258 83.3447 91.4776 104.815C97.4049 126.196 81.2189 142.578 59.8224 148.311Z"
          fill="var(--palette-purple-30)"
        />
        {/* eyes */}
        <path
          d="M47.6222 46.0657C47.9529 49.8841 46.5381 53.4905 43.2713 53.8018C39.991 54.1144 37.9628 50.8745 37.6288 47.018C37.2949 43.1614 38.7333 39.5912 42.0136 39.2786C45.2805 38.9673 47.2916 42.2472 47.6222 46.0657Z"
          fill="var(--palette-chrome-100)"
        />
        <path
          d="M64.9917 43.682C65.2504 46.6698 64.1434 49.4918 61.5872 49.7354C59.0204 49.98 57.4334 47.4449 57.1721 44.4272C56.9107 41.4095 58.0363 38.6159 60.6031 38.3713C63.1593 38.1277 64.7329 40.6942 64.9917 43.682Z"
          fill="var(--palette-chrome-100)"
        />
      </svg>
    </div>
  );
}

function InlineActionRow({ actions }: { actions: string[] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {actions.map((a) => (
        <span
          key={a}
          className="cursor-default select-none rounded border border-[#cccccc] bg-[#f8f8f8] px-2.5 py-1 text-[12px] font-semibold text-[#1d1c1d] shadow-sm"
        >
          {a}
        </span>
      ))}
    </div>
  );
}

function PreviewQuoteBlock({ rows, moreLabel }: { rows: PreviewRow[]; moreLabel: string }) {
  return (
    <div className="mt-3 rounded-md border border-[#e0e0e0] bg-[#fafafa] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
      {rows.map((row, i) => (
        <div
          key={i}
          className={`px-3 py-2.5 ${i > 0 ? "border-t border-[#e8e8e8]" : ""}`}
        >
          <p className="text-[13px] font-semibold leading-snug text-[#1d1c1d]">{row.lead}</p>
          <p className="mt-1 whitespace-pre-line text-[14px] font-normal leading-[1.45] text-[#1d1c1d]">
            {row.body}
          </p>
        </div>
      ))}
      <div className="border-t border-[#e8e8e8] px-3 py-2 text-right text-[13px] text-[#616061]">
        {moreLabel}
      </div>
    </div>
  );
}

function StaticReactions({ reactions }: { reactions: readonly { emoji: string; count: number }[] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5" aria-hidden>
      {reactions.map((r) => (
        <span
          key={`${r.emoji}-${r.count}`}
          className="inline-flex cursor-default items-center gap-1 rounded-full bg-[#f0f0f0] px-2 py-1 text-[13px] leading-none text-[#1d1c1d]"
        >
          <span className="text-[15px] leading-none">{r.emoji}</span>
          <span className="tabular-nums text-[12px] font-normal text-[#1d1c1d]">{r.count}</span>
        </span>
      ))}
    </div>
  );
}

function NotionLinkHoverPreviewCard({ preview }: { preview: NotionLinkPreviewSpec }) {
  const [a, b, c] = preview.metaLines;
  return (
    <div
      className="box-border flex h-[200px] w-[280px] flex-col rounded-md border border-[#e3e3e3] bg-white p-3 shadow-[0_8px_28px_rgba(15,15,15,0.12),0_2px_8px_rgba(15,15,15,0.06)]"
      role="presentation"
    >
      <div className="flex min-h-0 flex-1 flex-col gap-2">
        <div className="flex items-start gap-2">
          <span className="shrink-0 text-[15px] leading-none" aria-hidden>
            📄
          </span>
          <p className="min-w-0 flex-1 text-[13px] font-bold leading-snug text-[#1d1c1d]">{preview.pageTitle}</p>
        </div>
        <div className="space-y-1 text-[11px] leading-snug text-[#37352f]">
          <p>{a}</p>
          <p>{b}</p>
          <p>{c}</p>
        </div>
        <div className="mt-0.5 min-h-0 flex-1">
          <p className="text-[11px] font-bold text-[#1d1c1d]">Agenda</p>
          <div className="mt-2 space-y-1.5">
            <div className="h-2 rounded-full bg-[#e8e8e8]" style={{ width: "96%" }} />
            <div className="h-2 rounded-full bg-[#e8e8e8]" style={{ width: "72%" }} />
            <div className="h-2 rounded-full bg-[#e8e8e8]" style={{ width: "88%" }} />
            <div className="h-2 rounded-full bg-[#e8e8e8]" style={{ width: "64%" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function NotionActionLinkHover({
  label,
  preview,
}: {
  label: string;
  preview: NotionLinkPreviewSpec;
}) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [fixedPos, setFixedPos] = useState<{ top: number; left: number } | null>(null);

  const showPreview = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setFixedPos({ top: r.bottom + 6, left: r.left + 6 });
  }, []);

  const hidePreview = useCallback(() => {
    setFixedPos(null);
  }, []);

  return (
    <>
      <span
        ref={anchorRef}
        className="cursor-default select-none hover:underline"
        onMouseEnter={showPreview}
        onMouseLeave={hidePreview}
      >
        {label}
      </span>
      {fixedPos !== null
        ? createPortal(
            <div
              className="pointer-events-none"
              style={{
                position: "fixed",
                top: fixedPos.top,
                left: fixedPos.left,
                zIndex: 9999,
              }}
            >
              <NotionLinkHoverPreviewCard preview={preview} />
            </div>,
            document.body
          )
        : null}
    </>
  );
}

function SlackMessageBlock({ message }: { message: SlackMsg }) {
  if (message.kind === "user") {
    return (
      <div className="flex gap-3" style={{ gap: 12 }}>
        <YouAvatar />
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
            <span className="text-[15px] font-bold text-[#1d1c1d]">You</span>
            <span className="text-[12px] font-normal text-[#616061]">{message.time}</span>
          </div>
          <p className="mt-1 whitespace-pre-line text-[15px] font-normal leading-[1.46668]" style={{ color: SLACK_TEXT }}>
            {message.text}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3" style={{ gap: 12 }}>
      <CeoAgentAvatar />
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
          <span className="text-[15px] font-bold text-[#1d1c1d]">{AGENT_DISPLAY_NAME}</span>
          <span className="text-[12px] font-normal text-[#616061]">{message.time}</span>
        </div>
        <p className="mt-1 whitespace-pre-line text-[15px] font-normal leading-[1.46668]" style={{ color: SLACK_TEXT }}>
          {message.text}
        </p>
        {message.previewBlock ? (
          <PreviewQuoteBlock rows={message.previewBlock.rows} moreLabel={message.previewBlock.moreLabel} />
        ) : null}
        {message.reactions && message.reactions.length > 0 ? (
          <StaticReactions reactions={message.reactions} />
        ) : null}
        {message.actions && message.actions.length > 0 ? (
          <InlineActionRow actions={message.actions} />
        ) : null}
        {message.actionLink ? (
          <p className="mt-2 text-[13px] font-medium leading-snug text-[#1264A3]">
            {message.actionLink.notionPreview ? (
              <NotionActionLinkHover label={message.actionLink.label} preview={message.actionLink.notionPreview} />
            ) : (
              <span className="cursor-default select-none hover:underline">{message.actionLink.label}</span>
            )}
          </p>
        ) : null}
        {message.taskTag ? (
          <p className="mt-2 text-[13px] font-normal leading-snug text-[#616061]">{message.taskTag}</p>
        ) : null}
      </div>
    </div>
  );
}

export function SlackUI() {
  const [activeChannel, setActiveChannel] = useState<Channel>(slack.defaultChannel);

  const messages = CHANNEL_MESSAGES[activeChannel];

  return (
    /**
     * No internal heading: `HomeLandingBody` already renders the section's
     * `<H2>` + lede in the project's display face for visual parity with
     * other landing-page sections. Rendering them again here in Lato (the
     * scoped Slack font) produced a second, mismatched header. Section
     * vertical padding is also dropped — the parent `home-landing-section`
     * provides the gap to neighbours.
     */
    <section className="px-4 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto w-full max-w-5xl">
          <div className="w-full box-border">
            {/*
             * Hard-locked dimensions — height stays at `h-[720px]` (mobile:
             * tall enough that the #briefing digest's payoff line — "One
             * thing needs you today" — is visible without scrolling the
             * fake window; that line IS the section's proactivity proof.
             * Mobile review 2026-07-07) /
             * `md:h-[620px]` (desktop) and width is pinned to the parent's
             * `max-w-5xl`. Combined with `overflow-hidden` + `min-w-0` on the
             * inner column, switching channels can never push the window's
             * width or height: long messages scroll inside the message
             * column, short ones leave whitespace.
             *
             * Window chrome (founder brief 2026-07-06 premium pass): kit
             * radius + squircle and the film frame's layered shadow replace
             * the legacy `brut-border` + square corners, so the two media
             * windows on the page share one language. The hairline ring
             * reads as the window edge on the cream band.
             */}
            <div
              className="relative box-border flex h-[720px] w-full flex-col overflow-hidden rounded-[var(--radius-xl)] shadow-[0_2px_6px_rgba(44,0,42,0.08),0_32px_72px_-28px_rgba(44,0,42,0.30)] ring-1 ring-black/[0.06] md:h-[620px] md:flex-row"
              style={{
                fontFamily:
                  'var(--font-lato), "Lato", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                cornerShape: "squircle",
              } as React.CSSProperties}
            >
              {/*
               * Sidebar — vertical channel rail at md+ (matches Slack desktop),
               * horizontal channel strip on mobile so the conversation gets
               * the rest of the locked-height window. The strip keeps the
               * channel-switching demo intact; the workspace name collapses
               * to its glyph and "Channels" eyebrow is hidden under md.
               */}
              <aside
                className="flex w-full shrink-0 flex-row items-center gap-2 px-3 py-2 md:w-[240px] md:flex-col md:items-stretch md:gap-0 md:px-3 md:pb-6 md:pt-4"
                style={{ backgroundColor: SLACK_PURPLE }}
              >
                {/* Workspace glyph + name. Hidden on mobile so the channel
                    rail can shift left and recover the ~40 px the glyph + gap
                    used to consume — gives more room for the channel labels
                    and the conversation column. Visible at md+ where there's
                    a vertical sidebar with room for both. */}
                <div className="hidden shrink-0 items-center gap-2 md:mb-4 md:flex md:w-full md:px-2">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/10 text-[15px] text-white ring-1 ring-white/15"
                    aria-hidden
                  >
                    ✦
                  </span>
                  <span className="hidden truncate text-[17px] font-bold tracking-tight text-white md:inline">
                    {slack.workspaceName}
                  </span>
                </div>

                <p
                  className="hidden px-2 pb-2 text-[11px] font-bold uppercase tracking-[0.12em] md:block"
                  style={{ color: SLACK_MUTED }}
                >
                  Channels
                </p>
                <ul
                  className="flex min-w-0 flex-1 flex-row gap-1 overflow-x-auto md:flex-none md:flex-col md:gap-0 md:space-y-0.5 md:overflow-visible"
                  style={{ scrollbarWidth: "none" }}
                >
                  {slack.channels.map((ch) => {
                    const isActive = ch === activeChannel;
                    const unread = slack.channelUnread[ch];
                    return (
                      <li key={ch} className="shrink-0 md:shrink">
                        <button
                          type="button"
                          onClick={() => setActiveChannel(ch)}
                          className={`flex w-full cursor-pointer items-center justify-between gap-2 whitespace-nowrap rounded-md px-3 py-2.5 text-left text-[13px] transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.99] md:px-2 md:py-1.5 md:text-[15px] ${
                            isActive
                              ? "bg-white/[0.14] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:bg-white/[0.2]"
                              : "bg-transparent text-white/95 hover:bg-white/[0.12] hover:text-white hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]"
                          }`}
                        >
                          <span className="min-w-0 truncate">
                            <span className="mr-0.5 font-normal opacity-75">#</span>
                            <span className={isActive ? "font-bold" : "font-normal"}>
                              {ch.replace("#", "")}
                            </span>
                          </span>
                          {unread > 0 ? (
                            <span
                              className="shrink-0 rounded-full bg-[#e01e5a] px-1.5 py-0.5 text-[11px] font-bold tabular-nums leading-none text-white shadow-[0_1px_2px_rgba(0,0,0,0.25)]"
                              aria-label={`${unread} unread`}
                            >
                              {unread}
                            </span>
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>

                {/* Ghost DM group — fills the rail's dead lower half with
                    the idiom real Slack puts there (review 2026-07-06).
                    Decorative only: no handlers, hidden on the mobile
                    strip. Names reuse the page's cast (maya owns Gmail in
                    the trust cards). */}
                <div className="mt-5 hidden w-full md:block" aria-hidden>
                  <p
                    className="px-2 pb-2 text-[11px] font-bold uppercase tracking-[0.12em]"
                    style={{ color: SLACK_MUTED }}
                  >
                    Direct messages
                  </p>
                  <ul className="space-y-0.5">
                    <li className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[15px] text-white/80">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#2BAC76]" />
                      <span className="truncate">maya</span>
                    </li>
                    <li className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[15px] text-white/60">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full border border-white/45" />
                      <span className="truncate">leo</span>
                    </li>
                  </ul>
                </div>
              </aside>

              {/*
               * `min-h-0` is the critical bit on every flex column from here
               * down. In a column flex parent the default min-height of an
               * item is `auto` (= its content's intrinsic size), so a tall
               * message list would push `flex-1` past the locked window
               * height instead of clipping. With `min-h-0` each flex item
               * is allowed to shrink below its content, the scroll column
               * is bounded to the available space, and `overflow-y-auto`
               * actually triggers when content exceeds it.
               */}
              <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-white">
                <header className="flex items-center gap-3 border-b border-[#ececec] bg-white px-5 py-3.5">
                  <div className="flex min-w-0 items-baseline gap-1.5">
                    <span className="text-[20px] font-black leading-none text-[#1d1c1d]">#</span>
                    <h3 className="text-[17px] font-bold leading-tight text-[#1d1c1d]">
                      {activeChannel.replace("#", "")}
                    </h3>
                  </div>
                  {/* Channel topic — the muted line real Slack headers carry;
                      doubles as a one-glance summary of what the channel demos. */}
                  <p className="min-w-0 truncate border-l border-[#e8e8e8] pl-3 text-[13px] font-normal leading-tight text-[#616061]">
                    {CHANNEL_TOPICS[activeChannel]}
                  </p>
                </header>

                <div className="flex min-h-0 flex-1 flex-col">
                  {/* `mt-auto` on the stack bottom-anchors short channels
                      against the composer like real Slack (review: the
                      top-anchored digest left ~150px of dead white);
                      long channels overflow and scroll as before. */}
                  <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-5 sm:px-6">
                    <div className="mt-auto space-y-6">
                      {messages.map((m) => (
                        <SlackMessageBlock key={m.id} message={m} />
                      ))}
                    </div>
                  </div>
                  <SlackComposer activeChannel={activeChannel} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
