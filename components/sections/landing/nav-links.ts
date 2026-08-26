/** The nav map — one source of truth for the desktop link row and the
 *  mobile menu sheet (LandingNav + LandingNavMenu). */
export const NAV_LINKS: { href: string; label: string; external?: boolean }[] = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/careers", label: "Careers" },
  { href: "https://app.getpancake.ai", label: "Log in", external: true },
];
