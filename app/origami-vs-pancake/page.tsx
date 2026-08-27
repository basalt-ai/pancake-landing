import type { Metadata } from "next";

import { GtmComparisonPage, type GtmComparisonConfig } from "@/components/sections/comparison/GtmComparisonPage";

const title = "Origami vs Pancake: GTM Suggestions vs Autopilot";
const description = "Compare Origami and Pancake: live-web research and content-led GTM suggestions versus agents that publish, run outreach, and operate GTM end to end.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "https://getpancake.ai/origami-vs-pancake" },
  openGraph: {
    type: "website",
    url: "https://getpancake.ai/origami-vs-pancake",
    title,
    description,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Origami vs Pancake" }],
    siteName: "Pancake",
  },
  twitter: { card: "summary_large_image", title, description, images: ["/og-image.png"] },
};

const config: GtmComparisonConfig = {
  slug: "origami-vs-pancake",
  competitor: "Origami",
  competitorInitial: "O",
  heroLede: "Content-led GTM suggestions versus GTM running on autopilot.",
  heroSummary: "Origami searches the live web, identifies prospects, and suggests content-led GTM opportunities. Pancake carries the work through execution: it publishes content, runs outreach, measures the response, updates the GTM Brain, and repeats.",
  competitorBody: "A GTM research and prospecting product that searches live sources, builds lists, enriches contacts, and helps teams turn market information into content-led plays. It also includes multichannel sequencing for outbound follow-up.",
  competitorChoose: "Choose it when you want flexible live-web research and suggestions.",
  pancakeBody: "An autonomous GTM system that goes from signal to published work. Its agents share a persistent Brain, find demand, run personalized outreach, create and publish AI-search content, learn from performance, and continue without a human moving every step forward.",
  pancakeChoose: "Choose it when GTM should run all the way to the outcome.",
  verdictTitle: "Origami suggests the motion. Pancake runs it end to end.",
  verdictLede: "Origami is useful for discovering people and content-led opportunities. Pancake is built for founders who want the system to act, publish, and keep operating on autopilot.",
  competitorBestFit: "Origami is the better fit when your team wants low-cost, natural-language live-web research, prospect lists, contact enrichment, and ideas it will review and carry forward itself.",
  differencesLede: "The meaningful boundary is not idea quality. It is whether the system stops at a recommendation or closes the execution loop.",
  differences: [
    {
      n: "01",
      title: "Suggestions versus published outcomes",
      body: "Origami can surface content-led opportunities and help shape what to do next, but it does not publish that content for you. Pancake's agents research, write, publish, and then measure the result as one continuous workflow.",
      angle: "A recommendation is useful. A live, compounding asset is the outcome.",
    },
    {
      n: "02",
      title: "Content-led motions versus connected GTM",
      body: "Origami's strength is using live-web information to support prospecting and content-based plays. Pancake coordinates multiple motions—buying signals, warm-lead discovery, outreach, publication, and AI-search visibility—from one strategy.",
      angle: "Pancake connects what the market says to everything GTM does next.",
    },
    {
      n: "03",
      title: "A query result versus a persistent GTM Brain",
      body: "Origami makes it easy to search many live sources and enrich the people you find. Pancake turns discoveries, objections, positioning, and campaign results into durable context shared by every GTM agent.",
      angle: "Useful research becomes institutional memory, not another tab.",
    },
    {
      n: "04",
      title: "Origami wins on flexible list research",
      body: "Origami advertises natural-language search across more than 50 live sources, contact-data waterfalls, and an included sequencer. Those are compelling capabilities for a team that wants to investigate a market and operate the resulting lists itself.",
      angle: "Choose the research toolkit when your team wants to drive.",
    },
    {
      n: "05",
      title: "Lower entry price versus broader execution",
      body: "Origami publicly starts at $29 a month and scales with search credits. Pancake is $99 a month and covers a broader autonomous loop, including content publication and a shared GTM Brain. The right comparison is cost per completed motion, not cost per search.",
      angle: "Pay for research capacity or pay for GTM that keeps moving.",
    },
  ],
  rows: [
    { feature: "Core job", competitor: { text: "Live-web GTM research, lists, and suggestions", mark: "yes" }, pancake: { text: "Run GTM end to end on autopilot", mark: "yes" } },
    { feature: "Live-web sources", competitor: { text: "Searches 50+ sources", mark: "yes" }, pancake: { text: "Monitors buying signals and market evidence", mark: "yes" } },
    { feature: "Contact enrichment", competitor: { text: "Contact-data waterfalls", mark: "yes" }, pancake: { text: "Finds and qualifies warm leads" } },
    { feature: "Content opportunities", competitor: { text: "Surfaces and suggests content-led plays", mark: "yes" }, pancake: { text: "Turns market evidence into a content plan", mark: "yes" } },
    { feature: "Publishes content", competitor: { text: "Does not publish the content", mark: "no" }, pancake: { text: "Creates and publishes articles", mark: "yes" } },
    { feature: "Outbound", competitor: { text: "Included multichannel sequencer", mark: "yes" }, pancake: { text: "Agents write and run personalized outreach", mark: "yes" } },
    { feature: "Shared GTM Brain", competitor: { text: "Research and workflow context" }, pancake: { text: "Persistent context shared by every GTM agent", mark: "yes" } },
    { feature: "Public starting price", competitor: { text: "$29/month with credit limits", mark: "yes" }, pancake: { text: "$99/month", mark: "yes" } },
    { feature: "Best for", competitor: { text: "Teams researching and operating content-led motions" }, pancake: { text: "Founders who want the full GTM loop on autopilot" } },
  ],
  closingTitle: "Do not stop at the suggestion. Ship the motion.",
  closingLede: "Let agents find the opportunity, publish the content, run the outreach, and improve the Brain without waiting for the next handoff.",
  faqs: [
    { q: "What is the main difference between Origami and Pancake?", a: "Origami is strong at live-web research, prospect lists, enrichment, and suggesting content-led GTM plays. Pancake is designed to execute the complete loop: it finds demand, runs outreach, publishes content, measures results, and updates a shared GTM Brain." },
    { q: "Does Origami publish content for me?", a: "No. Origami can suggest content-led opportunities and support the research behind them, but the team still has to move that content through production and publication. Pancake's agents create and publish the content as part of the GTM workflow." },
    { q: "Does Origami run outbound?", a: "Origami includes a multichannel sequencer, so it can support outbound execution after a list is created. The distinction is that Pancake connects outreach to a broader autonomous system that also handles signals, published content, AI-search visibility, and shared learning." },
    { q: "Which is better for prospect research?", a: "Origami may be the better fit for teams that primarily want natural-language searches across many live sources, data waterfalls, and flexible list building. Pancake is the better fit when that research should immediately feed autonomous execution across several GTM motions." },
    { q: "How does pricing compare?", a: "At the time of review, Origami publicly started at $29 a month with search-credit limits and higher tiers for more capacity. Pancake publicly listed a $99 monthly plan. Check current pricing and limits before purchasing." },
    { q: "Who should choose Pancake instead of Origami?", a: "Choose Pancake when the bottleneck is not finding another idea or list, but consistently carrying GTM work through outreach, publication, measurement, and learning without hiring a team to operate each handoff." },
  ],
  related: [
    { href: "/gojiberry-vs-pancake", label: "Gojiberry vs Pancake" },
    { href: "/lemlist-vs-pancake", label: "Lemlist vs Pancake" },
    { href: "/", label: "how Pancake works" },
  ],
  sources: [
    { href: "https://origami.chat/", label: "Origami product page" },
    { href: "https://origami.chat/pricing", label: "Origami pricing" },
    { href: "https://getpancake.ai/", label: "Pancake product page" },
  ],
};

export default function OrigamiVsPancakePage() {
  return <GtmComparisonPage config={config} />;
}
