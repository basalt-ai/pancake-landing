import Link from "next/link";
import { FaDiscord, FaInstagram, FaLinkedin, FaTiktok } from "react-icons/fa6";
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
    href: "https://www.tiktok.com/@getpancake",
    label: "Pancake on TikTok",
    Icon: FaTiktok,
  },
  {
    href: "https://www.instagram.com/get.pancake/",
    label: "Pancake on Instagram",
    Icon: FaInstagram,
  },
  {
    href: "https://discord.gg/brJ99Up6ym",
    label: "Pancake on Discord",
    Icon: FaDiscord,
  },
];

type FooterLink = { href: string; label: string; external?: boolean };

/**
 * Footer link columns. The "Compare" column is the home for our comparison
 * content — the dedicated `/claude-tag-vs-pancake` landing page plus the
 * highest-intent competitor write-ups on the blog.
 */
const columns: { heading: string; links: FooterLink[] }[] = [
  {
    heading: "Product",
    links: [
      { href: "/pricing", label: "Pricing" },
      { href: "https://squads.getpancake.ai/", label: "Squads", external: true },
      { href: "/open-roadmap", label: "Roadmap" },
      { href: "https://app.getpancake.ai", label: "Sign in", external: true },
    ],
  },
  {
    heading: "Compare",
    links: [
      { href: "/blog/viktor-vs-pancake", label: "vs Viktor" },
      { href: "/claude-tag-vs-pancake", label: "vs Claude (Tag)" },
      { href: "/blog/openclaw-for-founders-managed-vs-diy", label: "vs OpenClaw" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { href: "/blog", label: "Blog" },
      { href: "/influencers", label: "Influencers" },
      { href: "https://zcal.co/i/4mlnC2bQ", label: "Book a meeting", external: true },
      { href: "https://discord.gg/brJ99Up6ym", label: "Discord", external: true },
    ],
  },
];

const linkClass =
  "text-base transition-colors hover:text-[var(--text-on-inverted-surface,#fff7ec)]";

function FooterNavLink({ link }: { link: FooterLink }) {
  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
        {link.label}
      </a>
    );
  }
  return (
    <Link href={link.href} prefetch={false} className={linkClass}>
      {link.label}
    </Link>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="relative w-full overflow-hidden"
      style={{
        backgroundColor: "var(--inverted-surface)",
        color: "var(--subtle-text-on-inverted-surface, #ddcfcd)",
      }}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-14 sm:px-6 lg:py-20">
        {/* Top: brand block + link columns */}
        <div className="flex flex-col gap-12 lg:flex-row lg:justify-between lg:gap-16">
          {/* Brand */}
          <div className="flex flex-col items-start gap-6 lg:max-w-xs">
            <Link
              href="/"
              aria-label="Pancake home"
              prefetch={false}
              className="text-[var(--text-on-inverted-surface,#fff7ec)]"
            >
              <PancakeLogo variant="inverted" className="h-12 sm:h-14" />
            </Link>
            <p className="text-sm leading-relaxed">
              The superagent that makes your company autonomous.
            </p>
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

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:flex-1 lg:gap-x-16">
            {columns.map((col) => (
              <nav key={col.heading} aria-label={col.heading} className="flex flex-col gap-4">
                <p
                  className="text-sm font-semibold"
                  style={{ color: "var(--text-on-inverted-surface, #fff7ec)" }}
                >
                  {col.heading}
                </p>
                <ul className="flex flex-col gap-3">
                  {col.links.map((link) => (
                    <li key={link.href + link.label}>
                      <FooterNavLink link={link} />
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* Bottom bar: copyright + address + legal */}
        <div
          className="flex flex-col items-center gap-3 border-t pt-8 text-[13px] sm:flex-row sm:items-start sm:justify-between sm:gap-6"
          style={{ borderColor: "color-mix(in srgb, var(--text-on-inverted-surface, #fff7ec) 14%, transparent)" }}
        >
          <span className="whitespace-nowrap">© {year} Pancake. All rights reserved.</span>

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

      {/* Soft brand glow along the bottom edge (Pancake pink → purple), mirroring
          the reference footer's gradient. Decorative only. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
        style={{
          background:
            "radial-gradient(60% 120% at 50% 100%, color-mix(in srgb, var(--strong-branded-surface) 45%, transparent), color-mix(in srgb, var(--alt-strong-branded-surface-01) 28%, transparent) 45%, transparent 75%)",
          opacity: 0.6,
        }}
      />
    </footer>
  );
}
