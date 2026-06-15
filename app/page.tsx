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
    "Superagent infrastructure. Deploys an org of AI agents — growth, engineering, and operations roles — that run 24/7 in Slack. Built for solo and multiplayer founding teams going from $1 to $1M without hiring.",
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

// FAQPage JSON-LD — targets OpenClaw and autonomous company buyer queries.
const faqPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is OpenClaw and how does Pancake use it?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "OpenClaw is an open-source AI agent runtime that powers multi-agent workflows. Pancake is the product built on top of OpenClaw — it takes that infrastructure and packages it as a fully managed superagent that knows your company, runs inside Slack, and handles 50% of the work by default. You get OpenClaw's agent power without setting up or maintaining the runtime yourself.",
      },
    },
    {
      "@type": "Question",
      name: "What is an autonomous company?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "An autonomous company is one where AI handles 50–70% of recurring work by default — GTM motions, engineering tasks, ops workflows — without a human prompting each step. Humans focus on direction, decisions, and edge cases; a coordinating squad of AI agents handles execution. Pancake is purpose-built for this model: it deploys a squad of AI agents with their own memory, tools, and schedules that work continuously inside your Slack workspace, turning your company into one that runs itself.",
      },
    },
    {
      "@type": "Question",
      name: "How is Pancake different from Viktor?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Viktor is a single AI coworker you prompt — it responds, then waits. Pancake deploys a coordinating squad of agents that work proactively without being asked, each with its own memory, cron schedule, and dedicated infrastructure, so your company runs itself rather than just being assisted.",
      },
    },
    {
      "@type": "Question",
      name: "What does Pancake do for early-stage founders?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Pancake gives early-stage founders an AI cofounder that knows their company — goals, decisions, metrics, customers — and deploys a squad of agents to handle growth, engineering, and operations tasks 24/7 inside Slack. The result: a founding team of two that operates like a team of ten, going from $1 to $1M without traditional hiring.",
      },
    },
    {
      "@type": "Question",
      name: "Does Pancake replace human employees?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Pancake is designed for founders who want to stay lean while moving fast. Its agents handle high-volume, repeatable work — outbound sequences, PR reviews, onboarding ops, weekly reports — so the humans on the team focus on judgment, relationships, and direction. Think of it as replacing your first 5 hires with agents, not your core team.",
      },
    },
  ],
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
