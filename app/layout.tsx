import type { Metadata } from "next";
import localFont from "next/font/local";
import { Lato } from "next/font/google";
import "./globals.css";
import "./_styles/components.css";
import "./_styles/home-ugc.css";
import { AnalyticsEvents } from "@/components/analytics/AnalyticsEvents";
import { PostHogAttribution } from "@/components/analytics/PostHogAttribution";
import { ProductHuntBadge } from "@/components/shared/ProductHuntBadge";
import { META_BROWSER_PIXEL_ID } from "@/lib/analytics/vendor-config";

/**
 * Lato — Slack's UI typeface (SIL Open Font License, served via next/font/google).
 * Exposed as `--font-lato` and used inline by `<SlackUI />` to keep the fake
 * Slack panel visually faithful without leaking Lato into the rest of the page.
 */
const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-lato",
  display: "swap",
});

const aeonik = localFont({
  src: [
    { path: "./fonts/aeonik/AeonikTRIAL-Air.otf", weight: "100", style: "normal" },
    { path: "./fonts/aeonik/AeonikTRIAL-AirItalic.otf", weight: "100", style: "italic" },
    { path: "./fonts/aeonik/AeonikTRIAL-Thin.otf", weight: "200", style: "normal" },
    { path: "./fonts/aeonik/AeonikTRIAL-ThinItalic.otf", weight: "200", style: "italic" },
    { path: "./fonts/aeonik/AeonikTRIAL-Light.otf", weight: "300", style: "normal" },
    { path: "./fonts/aeonik/AeonikTRIAL-LightItalic.otf", weight: "300", style: "italic" },
    { path: "./fonts/aeonik/AeonikTRIAL-Regular.otf", weight: "400", style: "normal" },
    { path: "./fonts/aeonik/AeonikTRIAL-RegularItalic.otf", weight: "400", style: "italic" },
    { path: "./fonts/aeonik/AeonikTRIAL-Medium.otf", weight: "500", style: "normal" },
    { path: "./fonts/aeonik/AeonikTRIAL-MediumItalic.otf", weight: "500", style: "italic" },
    { path: "./fonts/aeonik/AeonikTRIAL-SemiBold.otf", weight: "600", style: "normal" },
    { path: "./fonts/aeonik/AeonikTRIAL-SemiBoldItalic.otf", weight: "600", style: "italic" },
    { path: "./fonts/aeonik/AeonikTRIAL-Bold.otf", weight: "700", style: "normal" },
    { path: "./fonts/aeonik/AeonikTRIAL-BoldItalic.otf", weight: "700", style: "italic" },
    { path: "./fonts/aeonik/AeonikTRIAL-Black.otf", weight: "900", style: "normal" },
    { path: "./fonts/aeonik/AeonikTRIAL-BlackItalic.otf", weight: "900", style: "italic" },
  ],
  variable: "--font-aeonik",
  display: "swap",
});

const aeonikFono = localFont({
  src: [
    { path: "./fonts/aeonik-fono/AeonikFonoTRIAL-Air.otf", weight: "100", style: "normal" },
    { path: "./fonts/aeonik-fono/AeonikFonoTRIAL-Thin.otf", weight: "200", style: "normal" },
    { path: "./fonts/aeonik-fono/AeonikFonoTRIAL-Light.otf", weight: "300", style: "normal" },
    { path: "./fonts/aeonik-fono/AeonikFonoTRIAL-Regular.otf", weight: "400", style: "normal" },
    { path: "./fonts/aeonik-fono/AeonikFonoTRIAL-Medium.otf", weight: "500", style: "normal" },
    { path: "./fonts/aeonik-fono/AeonikFonoTRIAL-SemiBold.otf", weight: "600", style: "normal" },
    { path: "./fonts/aeonik-fono/AeonikFonoTRIAL-Bold.otf", weight: "700", style: "normal" },
    { path: "./fonts/aeonik-fono/AeonikFonoTRIAL-Black.otf", weight: "900", style: "normal" },
  ],
  variable: "--font-aeonik-fono",
  display: "swap",
});

// Canonical host is the apex domain: https://getpancake.ai serves 200 directly,
// and the www host 308-redirects to it (verified via curl -sI).
// Every absolute URL below (canonical, og:url, JSON-LD) uses the apex host.
export const metadata: Metadata = {
  metadataBase: new URL("https://getpancake.ai"),
  title: "Pancake: The AI employee that does the work for you",
  description:
    "Pancake connects to your tools and does the work for you. Autonomously. One AI coworker in Slack, a whole team of agents behind it. $49/month, no tiers.",
  alternates: {
    canonical: "https://getpancake.ai",
  },
  openGraph: {
    type: "website",
    url: "https://getpancake.ai",
    title: "Pancake: The AI employee that does the work for you",
    description:
      "Pancake connects to your tools and does the work for you. Autonomously. One AI coworker in Slack, a whole team of agents behind it. $49/month, no tiers.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Pancake, the AI coworker" }],
    siteName: "Pancake",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pancake: The AI employee that does the work for you",
    description:
      "Pancake connects to your tools and does the work for you. Autonomously. One AI coworker in Slack, a whole team of agents behind it. $49/month, no tiers.",
    images: ["/og-image.png"],
  },
};

// Organization JSON-LD — injected on every page via root layout.
// Helps search engines and AI crawlers understand what Pancake is.
// This is the SINGLE Organization schema for the site (a second, conflicting
// copy used to live in <body> — merged here so crawlers see one story).
// sameAs = union of the two former lists, minus the stale trypancake.ai
// domain; LinkedIn slug matches what the Footer actually links to (get-pancake).
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Pancake",
  alternateName: "Pancake AI",
  url: "https://getpancake.ai",
  logo: "https://getpancake.ai/pancake-mark.png",
  description:
    "Pancake is the AI employee that does the work for you. It connects to your tools and works autonomously. One AI employee in Slack, a whole team of agents behind it.",
  foundingDate: "2024",
  address: {
    "@type": "PostalAddress",
    streetAddress: "535 Mission St",
    addressLocality: "San Francisco",
    addressRegion: "CA",
    postalCode: "94105",
    addressCountry: "US",
  },
  sameAs: [
    "https://x.com/getpancake_ai",
    "https://www.youtube.com/@trypancake",
    "https://www.linkedin.com/company/get-pancake",
    "https://www.tiktok.com/@getpancake",
    "https://www.instagram.com/get.pancake/",
  ],
};

// WebSite JSON-LD — no SearchAction: the site has no /search route, and a
// SearchAction pointing at a 404 hurts more than it helps.
const webSiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Pancake",
  url: "https://getpancake.ai",
};

const googleTagManagerId = "GTM-P3Z79WKD";
const metaPixelId = META_BROWSER_PIXEL_ID;
// Vercel exposes VERCEL_ENV at build and runtime. Advertising and product
// analytics run only in production. GTM alone can be explicitly enabled on a
// preview for Tag Assistant; paid tags must still carry their production-host
// conditions inside the container.
const productionVendorTrackingEnabled =
  process.env.NODE_ENV === "production" && process.env.VERCEL_ENV === "production";
const tagManagerDebugEnabled =
  !productionVendorTrackingEnabled && process.env.PANCAKE_ANALYTICS_DEBUG === "1";
const tagManagerEnabled = productionVendorTrackingEnabled || tagManagerDebugEnabled;
const productionHostnameGuard =
  "var h=window.location.hostname.toLowerCase();if(h!=='getpancake.ai'&&h!=='www.getpancake.ai'){return;}";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${aeonik.variable} ${aeonikFono.variable} ${lato.variable}`}>
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts -- Attribution must run before a bounce. */}
        <script src="/pancake-attribution.min.js"></script>
        {tagManagerEnabled ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){${tagManagerDebugEnabled ? "" : productionHostnameGuard}(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${googleTagManagerId}');})();`,
            }}
          />
        ) : null}
        {productionVendorTrackingEnabled ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){${productionHostnameGuard}!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${metaPixelId}');
fbq('track', 'PageView');})();`,
            }}
          />
        ) : null}
        {/* Organization + WebSite JSON-LD — present on every page */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
        />
      </head>
      {/* Body styles (margin: 0; background-color: var(--surface); color:
          var(--text)) live in app/_styles/reset.css to avoid a React 18
          hydration mismatch caused by SSR vs client-side serialization
          of inline JSX `style` props. */}
      <body>
        {/* This React funnel cannot be used without JavaScript. Omitting the
            GTM/Meta noscript fallbacks avoids unguarded requests from a
            production deployment's generated Vercel hostname. */}
        {productionVendorTrackingEnabled ? <PostHogAttribution /> : null}
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        {children}
        <AnalyticsEvents />
        <ProductHuntBadge />
      </body>
    </html>
  );
}
