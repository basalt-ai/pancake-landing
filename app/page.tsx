import { HomeDemoVideo } from "@/components/sections/home/HomeDemoVideo";
import { HomeHero } from "@/components/sections/home/HomeHero";
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
    "AI co-founder infrastructure. Deploys an org of AI agents — growth, engineering, and operations roles — that run 24/7 in Slack. Built for solo and multiplayer founding teams going from $1 to $1M without hiring.",
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

export default function Home() {
  return (
    <main id="main-content" className="min-h-screen">
      {/* SoftwareApplication JSON-LD — homepage only */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationJsonLd) }}
      />
      <HomeNav />
      <HomeHero />
      <HomeDemoVideo />
      <HomeLandingBody />
      <Footer />
    </main>
  );
}
