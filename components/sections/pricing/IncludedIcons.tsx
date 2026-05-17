/**
 * Inline icons for the "Everything your $49 buys" section.
 *
 * Sourcing strategy:
 *   • simple-icons (via `react-icons/si`) — for single-color brand
 *     silhouettes (Tux for Linux, Claude wheat). Coloured per brand.
 *   • lucide (via `react-icons/lu`) — for generic stroke icons (CPU,
 *     phone, mail, padlock, globe, branch, credit card). Shared
 *     1.5-stroke language, consistent visual family.
 *   • Hand-rolled inline SVG — for marks where the brand identity
 *     REQUIRES multi-colour or a specific composition: Slack 4-color
 *     hashtag, Chrome 4-color wheel, iOS Messages app icon, Exa
 *     bracket mark.
 */
import { SiClaude, SiLinux } from "react-icons/si";
import {
  LuCreditCard,
  LuGitBranch,
  LuGlobe,
  LuLock,
  LuMail,
  LuPhone,
} from "react-icons/lu";

const ICON_SIZE = 22;

export function IncludedIcon({ name }: { name: string }) {
  switch (name) {
    case "linux":
      // Tux. The Linux mascot, in pure black for crisp legibility on
      // light surfaces.
      return <SiLinux color="#000000" size={ICON_SIZE} />;

    case "slack":
      return <SlackMark />;

    case "imessage":
      return <MessagesAppMark />;

    case "phone":
      return <LuPhone size={ICON_SIZE} />;

    case "mail":
      return <LuMail size={ICON_SIZE} />;

    case "vault":
      // Padlock. "Vault" is the metaphor; the lock is the universal
      // visual for "secrets stored, encrypted at rest".
      return <LuLock size={ICON_SIZE} />;

    case "harness":
      // Claude wheat mark in Anthropic orange — the harness is built
      // around Claude; the detail line names GPT + Gemini in writing.
      return <SiClaude color="#D97757" size={ICON_SIZE} />;

    case "browser":
      return <ChromeMark />;

    case "globe":
      // Generic globe — live web access, distinct from headed browsing.
      return <LuGlobe size={ICON_SIZE} />;

    case "search":
      // Exa.ai bracket mark in their brand blue — search is powered
      // by Exa, so the icon credits the provider directly.
      return <ExaMark />;

    case "subagents":
      // Git-branch — "one parent process branches into many",
      // exactly what sub-agent spawning does.
      return <LuGitBranch size={ICON_SIZE} />;

    case "creditcard":
      return <LuCreditCard size={ICON_SIZE} />;

    default:
      return <span style={{ width: ICON_SIZE, height: ICON_SIZE }} />;
  }
}

/* ─── multi-colour brand marks (kept inline) ────────────────────── */

/**
 * Slack — official 4-colour hashtag. Paths from Slack's brand press
 * kit, split across four <path>s so each segment carries its own
 * brand colour.
 */
function SlackMark() {
  return (
    <svg
      width={ICON_SIZE}
      height={ICON_SIZE}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        fill="#E01E5A"
        d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z"
      />
      <path
        fill="#36C5F0"
        d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z"
      />
      <path
        fill="#2EB67D"
        d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z"
      />
      <path
        fill="#ECB22E"
        d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"
      />
    </svg>
  );
}

/**
 * Google Chrome — canonical 4-colour wheel. Three gradient arcs
 * (red, yellow, green), white inner ring, blue centre disc.
 * Sourced from the Wikimedia Commons "Google Chrome icon
 * (February 2022)" file. Gradient ids are namespaced (chrome-a/b/c)
 * to avoid collisions when multiple SVGs render on the same page.
 */
function ChromeMark() {
  return (
    <svg
      width={ICON_SIZE}
      height={ICON_SIZE}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden
    >
      <defs>
        <linearGradient
          id="chrome-a"
          x1="3.2173"
          y1="15"
          x2="44.7812"
          y2="15"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#d93025" />
          <stop offset="1" stopColor="#ea4335" />
        </linearGradient>
        <linearGradient
          id="chrome-b"
          x1="20.7219"
          y1="47.6791"
          x2="41.5039"
          y2="11.6837"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#fcc934" />
          <stop offset="1" stopColor="#fbbc04" />
        </linearGradient>
        <linearGradient
          id="chrome-c"
          x1="26.5981"
          y1="46.5015"
          x2="5.8161"
          y2="10.506"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#1e8e3e" />
          <stop offset="1" stopColor="#34a853" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="23.9947" r="12" fill="#fff" />
      <path
        d="M24,12H44.7812a23.9939,23.9939,0,0,0-41.5639.0029L13.6079,30l.0093-.0024A11.9852,11.9852,0,0,1,24,12Z"
        fill="url(#chrome-a)"
      />
      <circle cx="24" cy="24" r="9.5" fill="#1a73e8" />
      <path
        d="M34.3913,30.0029,24.0007,48A23.994,23.994,0,0,0,44.78,12.0031H23.9989l-.0025.0093A11.985,11.985,0,0,1,34.3913,30.0029Z"
        fill="url(#chrome-b)"
      />
      <path
        d="M13.6086,30.0031,3.218,12.006A23.994,23.994,0,0,0,24.0025,48L34.3931,30.0029l-.0067-.0068a11.9852,11.9852,0,0,1-20.7778.007Z"
        fill="url(#chrome-c)"
      />
    </svg>
  );
}

/**
 * iOS Messages — the actual app icon as it ships on iPhones: green
 * gradient rounded square + white speech bubble glyph. Sourced from
 * Wikimedia Commons' IMessage_logo.svg, simplified to clean userSpace
 * coords. This is intentionally a "filled tile" while the surrounding
 * icons are silhouettes — that's exactly how Apple presents Messages,
 * and using it whole keeps the brand instantly recognisable.
 */
function MessagesAppMark() {
  return (
    <svg
      width={ICON_SIZE}
      height={ICON_SIZE}
      viewBox="0 0 66.145836 66.145836"
      fill="none"
      aria-hidden
    >
      <defs>
        <linearGradient
          id="imessage-grad"
          x1="33.0729"
          y1="0"
          x2="33.0729"
          y2="66.145836"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#5bf675" />
          <stop offset="1" stopColor="#0cbd2a" />
        </linearGradient>
      </defs>
      <rect
        x="0"
        y="0"
        width="66.145836"
        height="66.145836"
        rx="14.567832"
        ry="14.567832"
        fill="url(#imessage-grad)"
      />
      <path
        d="m 33.072918,11.45046 a 24.278298,20.222157 0 0 0 -24.2781055,20.22202 24.278298,20.222157 0 0 0 11.7946305,17.31574 27.365264,20.222157 0 0 1 -4.245218,5.94228 23.85735,20.222157 0 0 0 9.86038,-3.87367 24.278298,20.222157 0 0 0 6.868313,0.83768 24.278298,20.222157 0 0 0 24.278106,-20.22203 24.278298,20.222157 0 0 0 -24.278106,-20.22202 z"
        fill="#ffffff"
      />
    </svg>
  );
}

/**
 * Exa.ai — bracket mark in their brand blue (#1F40ED). Extracted
 * directly from the inline SVG on exa.ai's navbar. The 78×100 path
 * is centred horizontally inside a 100×100 viewBox so it sits
 * proportionally inside the square icon slot.
 */
function ExaMark() {
  return (
    <svg
      width={ICON_SIZE}
      height={ICON_SIZE}
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden
    >
      <g transform="translate(11, 0)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 0H78.1818V7.46269L44.8165 50L78.1818 92.5373V100H0V0ZM39.5825 43.1172L66.6956 7.46269H12.4695L39.5825 43.1172ZM8.79612 16.3977V46.2687H31.5111L8.79612 16.3977ZM31.5111 53.7313H8.79612V83.6023L31.5111 53.7313ZM12.4695 92.5373L39.5825 56.8828L66.6956 92.5373H12.4695Z"
          fill="#1F40ED"
        />
      </g>
    </svg>
  );
}
