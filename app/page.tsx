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
    "Pancake is the AI coworker that does the work for you — one coworker in Slack, backed by squads of agents (growth, engineering, operations) that run 24/7. Built for solo and multiplayer founding teams going from $1 to $1M without hiring.",
  offers: {
    "@type": "Offer",
    url: "https://getpancake.ai/pricing",
    price: "49",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
  },
  publisher: {
    "@type": "Organization",
    name: "Pancake",
    url: "https://getpancake.ai",
  },
};

// VideoObject JSON-LD — the "Meet Pancake" film band (HomeDemoVideo). Google
// requires name/description/thumbnailUrl/uploadDate + contentUrl; uploadDate
// is the film's first commit date. The on-page transcript lives inside the
// HomeDemoVideo component as a <details> block.
const videoObjectJsonLd = {
  "@context": "https://schema.org",
  "@type": "VideoObject",
  name: "Meet Pancake — the film",
  description:
    "A 51-second film introducing Pancake, the AI coworker that lives in your Slack, staffs squads of agents, and pushes your company's autonomy level toward 99%.",
  thumbnailUrl: "https://getpancake.ai/demo-video-poster-live.jpg",
  uploadDate: "2026-06-02",
  duration: "PT51S",
  contentUrl: "https://getpancake.ai/demo-video.mp4",
};

export default function Home() {
  return (
    <main id="main-content" className="min-h-screen">
      {/* SoftwareApplication JSON-LD — homepage only */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationJsonLd) }}
      />
      {/* VideoObject JSON-LD — the "Meet Pancake" film band */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoObjectJsonLd) }}
      />
      <HomeNav />
      <HomeHero />
      <HomeDemoVideo />
      <HomeLandingBody />
      <Footer />
    </main>
  );
}
