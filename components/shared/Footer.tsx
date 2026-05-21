import Link from "next/link";
import { FaLinkedin } from "react-icons/fa6";
import { SiX, SiYoutube } from "react-icons/si";

const socials = [
  {
    href: "https://x.com/getpancake_ai",
    label: "Pancake on X",
    Icon: SiX,
  },
  {
    href: "https://www.youtube.com/@trypancake",
    label: "Pancake on YouTube",
    Icon: SiYoutube,
  },
  {
    href: "https://www.linkedin.com/company/get-pancake",
    label: "Pancake on LinkedIn",
    Icon: FaLinkedin,
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="w-full border-t border-[var(--subtle-stroke)]"
      style={{
        backgroundColor: "var(--inverted-surface)",
        color: "var(--subtle-text)",
      }}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-4 text-[11px] sm:flex-row sm:gap-0 sm:px-6 sm:text-xs">
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:gap-0">
          <span className="whitespace-nowrap">
            © {year} Pancake. All rights reserved.
          </span>
          <span
            aria-hidden
            className="hidden sm:inline-block"
            style={{
              width: 1,
              height: 14,
              backgroundColor: "var(--stroke)",
              margin: "0 1.25rem",
            }}
          />
          <span className="whitespace-nowrap text-center sm:text-left">
            535 Mission St, San Francisco, CA 94105, USA
          </span>
        </div>

        <nav
          aria-label="Legal"
          className="flex items-center gap-4 sm:ml-auto"
        >
          <Link
            href="/blog"
            prefetch={false}
            className="whitespace-nowrap transition-colors hover:text-[var(--text-on-inverted-surface)]"
          >
            Blog
          </Link>
          <Link
            href="/creators"
            prefetch={false}
            className="whitespace-nowrap transition-colors hover:text-[var(--text-on-inverted-surface)]"
          >
            Creators
          </Link>
          <Link
            href="/privacy"
            prefetch={false}
            className="whitespace-nowrap transition-colors hover:text-[var(--text-on-inverted-surface)]"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            prefetch={false}
            className="whitespace-nowrap transition-colors hover:text-[var(--text-on-inverted-surface)]"
          >
            Terms of Service
          </Link>
        </nav>

        <div className="flex items-center gap-4 sm:ml-4">
          {socials.map(({ href, label, Icon }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="transition-colors hover:text-[var(--text-on-inverted-surface)]"
              style={{ color: "var(--disabled-text)" }}
            >
              <Icon size={14} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
