import { HomeDemoVideo } from "@/components/sections/home/HomeDemoVideo";
import { HomeHero } from "@/components/sections/home/HomeHero";
import { FAQ_ITEMS } from "@/components/sections/home/HomeFaq";
import { HomeLandingBody } from "@/components/sections/home/HomeLandingBody";
import { HomeNav } from "@/components/sections/home/HomeNav";
import { Footer } from "@/components/shared/Footer";

// SoftwareApplication JSON-LD — homepage only (Organization is in root layout).
const softwareApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Pancake",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: "https://getpancake.ai",
  description:
    "Pancake is the AI coworker that does the work for you — one coworker in Slack, backed by squads of agents (growth, engineering, operations) that run 24/7. Built for solo and multiplayer founding teams going from $1 to $1M without hiring.",
  offers: {
    "@type": "Offer",
    url: "https://getpancake.ai/pricing",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
  },
  publisher: {
    "@type": "Organization",
    name: "Pancake",
    url: "https://getpancake.ai",
  },
};

// FAQPage JSON-LD — generated from the visible FAQ accordion (HomeFaq) so the
// schema and the on-page content can never drift again (Google requires FAQ
// rich-result content to be visible to users). FAQ_ITEMS keeps the OpenClaw /
// autonomous-company / Viktor-comparison questions the GEO strategy targets.
const faqPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

export default function Home() {
  return (
    <main id="main-content" className="min-h-screen">
      {/* SoftwareApplication JSON-LD — homepage only */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationJsonLd) }}
      />
      {/* FAQPage JSON-LD — OpenClaw, autonomous company, and Viktor comparison queries */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd) }}
      />
      <HomeNav />
      <HomeHero />
      <HomeDemoVideo />
      <HomeLandingBody />
      <Footer />
    </main>
  );
}
