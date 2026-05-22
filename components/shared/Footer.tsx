import Link from "next/link";
import { FaDiscord, FaLinkedin } from "react-icons/fa6";
import { SiX, SiYoutube } from "react-icons/si";

import { PancakeLogo } from "./PancakeLogo";

const socials = [
  {
    href: "https://x.com/getpancake_ai",
    label: "Pancake on X",
    Icon: SiX,
  },
  {
    href: "https://www.linkedin.com/company/get-pancake",
    label: "Pancake on LinkedIn",
    Icon: FaLinkedin,
  },
  {
    href: "https://www.youtube.com/@trypancake",
    label: "Pancake on YouTube",
    Icon: SiYoutube,
  },
  {
    href: "https://discord.gg/brJ99Up6ym",
    label: "Pancake on Discord",
    Icon: FaDiscord,
  },
];

const navLinks = [
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
  { href: "/creators", label: "Creators" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="w-full"
      style={{
        backgroundColor: "var(--inverted-surface)",
        color: "var(--subtle-text-on-inverted-surface, #ddcfcd)",
      }}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 lg:py-16">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <Link href="/" aria-label="Pancake home" prefetch={false}>
            <PancakeLogo />
          </Link>

          <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-8">
            <nav aria-label="Footer" className="flex items-center gap-6">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  prefetch={false}
                  className="whitespace-nowrap text-base font-medium transition-colors hover:opacity-80"
                  style={{ color: "var(--text-on-inverted-surface, #fff7ec)" }}
                >
                  {label}
                </Link>
              ))}
            </nav>

            <span
              aria-hidden
              className="hidden sm:inline-block"
              style={{ color: "var(--brand-colors-ink-80, #85687c)" }}
            >
              •
            </span>

            <div className="flex items-center gap-3">
              {socials.map(({ href, label, Icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="transition-opacity hover:opacity-80"
                  style={{ color: "var(--text-on-inverted-surface, #fff7ec)" }}
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 text-[13px] sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <span className="whitespace-nowrap">
            © {year} Pancake. All rights reserved.
          </span>

          <div className="flex flex-col items-center gap-1 sm:items-end">
            <span className="whitespace-nowrap text-center sm:text-right">
              535 Mission St, San Francisco, CA 94105, USA
            </span>
            <nav aria-label="Legal" className="flex items-center gap-4">
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
          </div>
        </div>
      </div>
    </footer>
  );
}
