/**
 * Home — "three real jobs" use-case triptych (between the demo video and the
 * squads org chart). Headerless cards: a faux-Slack mini exchange on top,
 * kicker + headline + body below. The chat grammar (Lato, square avatars,
 * APP badge, 15px/1.46668 rhythm) mirrors pricing's `TokensBuyCards` and
 * `components/shared/SlackUI.tsx` so the visual language stays consistent —
 * copied locally rather than abstracted because the pricing variants are
 * typed against pricing copy.
 */

type UseCase = {
  id: string;
  kicker: string;
  headline: string;
  body: string;
  user: {
    name: string;
    initial: string;
    accent: string;
    accentInk: string;
    time: string;
    text: string;
  };
  agent: { time: string; text: string };
  artifact: { icon: "pr" | "leads" | "pdf"; title: string; meta: string };
};

const USE_CASES: UseCase[] = [
  {
    id: "engineering",
    kicker: "Engineering",
    headline: "Ships while you sleep.",
    body: "Report the bug on your way to bed. Wake up to a tested fix and an open pull request — not a ticket.",
    user: {
      name: "Sam",
      initial: "S",
      accent: "#E8E0F2",
      accentInk: "#4A3C7B",
      time: "11:48 PM",
      text: "@pancake checkout's crashing on prod. I'm going to bed — take it.",
    },
    agent: {
      time: "7:02 AM",
      text: "Found it — guest carts hit a null session on the new flow. Fixed, tested, PR open for your review.",
    },
    artifact: {
      icon: "pr",
      title: "fix: guest checkout crash",
      meta: "Pull request #214 · 2 files changed",
    },
  },
  {
    id: "outbound",
    kicker: "Outbound",
    headline: "One ask, every tool.",
    body: "It works across your CRM, inbox, and analytics in a single run. You ask once; it does the legwork.",
    user: {
      name: "Mara",
      initial: "M",
      accent: "#D5E4EB",
      accentInk: "#1F4660",
      time: "9:14 AM",
      text: "@pancake watch new signups, flag the hot ones, draft follow-ups.",
    },
    agent: {
      time: "9:21 AM",
      text: "12 new leads since yesterday — cross-checked CRM, inbox, and analytics. 3 are hot. Drafts ready for your send.",
    },
    artifact: {
      icon: "leads",
      title: "Hot leads — follow-ups",
      meta: "3 drafts · CRM + email + analytics",
    },
  },
  {
    id: "content",
    kicker: "Support & content",
    headline: "Real work, attached.",
    body: "Answers come with the work attached — posts, PDFs, pull requests. Grounded in your docs and your codebase.",
    user: {
      name: "Leo",
      initial: "L",
      accent: "#EAE2D2",
      accentInk: "#6E5520",
      time: "4:32 PM",
      text: "@pancake turn this week's changelog into a launch post.",
    },
    agent: {
      time: "4:41 PM",
      text: "Drafted from the changelog and the docs — blog post, X thread, and a one-pager attached.",
    },
    artifact: {
      icon: "pdf",
      title: "launch-week-onepager.pdf",
      meta: "PDF · 1 page",
    },
  },
];

export function HomeUseCases() {
  return (
    <div className="home-use-cases">
      {USE_CASES.map((useCase) => (
        <article key={useCase.id} className="home-use-case-card">
          <div className="home-use-case-card__chat">
            <UserMessage user={useCase.user} />
            <AgentMessage agent={useCase.agent} artifact={useCase.artifact} />
          </div>
          <div className="home-use-case-card__copy">
            <p className="home-use-case-card__kicker">{useCase.kicker}</p>
            <h3 className="home-use-case-card__headline">{useCase.headline}</h3>
            <p className="home-use-case-card__body">{useCase.body}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

function UserMessage({ user }: { user: UseCase["user"] }) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[6px] shadow-[inset_0_-1px_0_rgba(0,0,0,0.10),inset_0_0_0_1px_rgba(0,0,0,0.06)]"
        aria-hidden
        style={{ backgroundColor: user.accent }}
      >
        <span className="text-[15px] font-bold leading-none" style={{ color: user.accentInk }}>
          {user.initial}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-[15px] font-bold text-[#1d1c1d]">{user.name}</span>
          <span className="text-[12px] font-normal text-[#616061]">{user.time}</span>
        </div>
        <p className="mt-1 whitespace-pre-line text-[15px] font-normal leading-[1.46668] text-[#1d1c1d]">
          {user.text}
        </p>
      </div>
    </div>
  );
}

function AgentMessage({
  agent,
  artifact,
}: {
  agent: UseCase["agent"];
  artifact: UseCase["artifact"];
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[6px] bg-[#FFF1DA] shadow-[inset_0_-1px_0_rgba(0,0,0,0.10),inset_0_0_0_1px_rgba(0,0,0,0.06)]"
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
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-[15px] font-bold text-[#1d1c1d]">pancake</span>
          <span className="rounded-[3px] bg-[#e8e8e8] px-1 py-px text-[10px] font-bold uppercase tracking-wide text-[#616061]">
            APP
          </span>
          <span className="text-[12px] font-normal text-[#616061]">{agent.time}</span>
        </div>
        <p className="mt-1 whitespace-pre-line text-[15px] font-normal leading-[1.46668] text-[#1d1c1d]">
          {agent.text}
        </p>
        <ArtifactChip artifact={artifact} />
      </div>
    </div>
  );
}

/** Slack-attachment-style chip — the proof the reply shipped real work. */
function ArtifactChip({ artifact }: { artifact: UseCase["artifact"] }) {
  return (
    <figure className="home-use-case-artifact" aria-label={artifact.title}>
      <span className="home-use-case-artifact__icon" data-icon={artifact.icon} aria-hidden>
        <ArtifactGlyph icon={artifact.icon} />
      </span>
      <span className="home-use-case-artifact__text">
        <span className="home-use-case-artifact__title">{artifact.title}</span>
        <span className="home-use-case-artifact__meta">{artifact.meta}</span>
      </span>
    </figure>
  );
}

function ArtifactGlyph({ icon }: { icon: UseCase["artifact"]["icon"] }) {
  if (icon === "pr") {
    // Git pull-request glyph.
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
        <circle cx="4.5" cy="4.5" r="2" stroke="currentColor" strokeWidth="2" />
        <circle cx="4.5" cy="13.5" r="2" stroke="currentColor" strokeWidth="2" />
        <circle cx="13.5" cy="13.5" r="2" stroke="currentColor" strokeWidth="2" />
        <path d="M4.5 6.5V11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path
          d="M9 4.5H11A2.5 2.5 0 0 1 13.5 7V11.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (icon === "leads") {
    // Target glyph — qualified leads in the crosshairs.
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
        <circle cx="9" cy="9" r="6.75" stroke="currentColor" strokeWidth="2" />
        <circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="2" />
        <circle cx="9" cy="9" r="0.9" fill="currentColor" />
      </svg>
    );
  }
  // Document glyph with a folded corner.
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d="M10.5 1.5H5.5A1.5 1.5 0 0 0 4 3V15A1.5 1.5 0 0 0 5.5 16.5H12.5A1.5 1.5 0 0 0 14 15V5L10.5 1.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M10.5 1.5V5H14" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M7 9.5H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 12H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
