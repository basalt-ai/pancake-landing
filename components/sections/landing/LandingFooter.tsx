import Link from "next/link";

/**
 * Landing footer — rime.ai-style plum band: link columns up top, the vector
 * wordmark blown up to full container width below (painted via CSS mask so it
 * stays crisp and recolorable), the pancake mark hovering over the "P" the way
 * rime's pink dot sits over the "i", and a mono legal bar at the bottom.
 *
 * Server component on purpose: every target is a real href (anchors into the
 * landing sections, routes, or external links) — no modal triggers, so the
 * footer behaves identically on /, /pricing, and the legal pages.
 */

type FooterLink = { href: string; label: string; external?: boolean };

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Product",
    links: [
      { href: "/#how-it-works", label: "How it works" },
      { href: "/pricing", label: "Pricing" },
      { href: "/open-roadmap", label: "Roadmap" },
      { href: "https://app.getpancake.ai", label: "Open the app", external: true },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/#why", label: "About" },
      { href: "/blog", label: "Blog" },
      { href: "https://zcal.co/i/ZEHl48rv", label: "Book a call", external: true },
      { href: "mailto:hey@pancake.ai", label: "Contact" },
    ],
  },
  {
    title: "Compare",
    links: [
      { href: "/viktor-vs-pancake", label: "vs Viktor" },
      { href: "/claude-tag-vs-pancake", label: "vs Claude Tag" },
      { href: "/openclaw-vs-pancake", label: "vs OpenClaw" },
      { href: "/pancake-vs-paperclips", label: "vs Paperclips" },
    ],
  },
  {
    title: "Social",
    links: [
      { href: "https://x.com/getpancake_ai", label: "X", external: true },
      { href: "https://www.linkedin.com/company/get-pancake", label: "LinkedIn", external: true },
      { href: "https://discord.gg/brJ99Up6ym", label: "Discord", external: true },
      { href: "https://www.youtube.com/@trypancake", label: "YouTube", external: true },
      { href: "https://www.tiktok.com/@getpancake", label: "TikTok", external: true },
      { href: "https://www.instagram.com/get.pancake", label: "Instagram", external: true },
    ],
  },
];

function FooterLinkItem({ href, label, external }: FooterLink) {
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {label}
      </a>
    );
  }
  if (href.startsWith("mailto:")) {
    return <a href={href}>{label}</a>;
  }
  return (
    <Link href={href} prefetch={false}>
      {label}
    </Link>
  );
}

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="lv2-footer">
      <div className="lv2-footer-inner">
        <nav className="lv2-footer-cols" aria-label="Footer">
          {COLUMNS.map((col) => (
            <div key={col.title} className="lv2-footer-col">
              <span className="lv2-footer-eyebrow">{col.title}</span>
              <ul>
                {col.links.map((link) => (
                  <li key={link.href}>
                    <FooterLinkItem {...link} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <a href="/" className="lv2-footer-brand" aria-label="Pancake — home">
          {/* eslint-disable-next-line @next/next/no-img-element -- fixed brand asset, decorative */}
          <img
            src="/pancake-mark.png"
            alt=""
            className="lv2-footer-brand-mark"
            loading="lazy"
            width={160}
            height={166}
          />
          <span className="lv2-footer-wordmark" aria-hidden="true" />
        </a>

        <div className="lv2-footer-legal">
          <span>
            © {year} Pancake · San Francisco, CA
          </span>
          <nav aria-label="Legal">
            <Link href="/privacy" prefetch={false}>
              Privacy
            </Link>
            <Link href="/terms" prefetch={false}>
              Terms
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
