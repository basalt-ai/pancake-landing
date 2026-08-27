import type { Metadata } from "next";

import { GtmComparisonPage, type GtmComparisonConfig } from "@/components/sections/comparison/GtmComparisonPage";

const title = "Gojiberry vs Pancake: Outreach Agent vs a GTM Brain";
const description = "Compare Gojiberry and Pancake: focused AI prospecting and outreach versus a shared GTM Brain that powers buying-signal, outreach, and AI-search agents.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "https://getpancake.ai/gojiberry-vs-pancake" },
  openGraph: {
    type: "website",
    url: "https://getpancake.ai/gojiberry-vs-pancake",
    title,
    description,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Gojiberry vs Pancake" }],
    siteName: "Pancake",
  },
  twitter: { card: "summary_large_image", title, description, images: ["/og-image.png"] },
};

const config: GtmComparisonConfig = {
  slug: "gojiberry-vs-pancake",
  competitor: "Gojiberry",
  competitorInitial: "G",
  heroLede: "A focused outreach agent versus a GTM system that compounds.",
  heroSummary: "Gojiberry finds high-intent prospects and automates email and social outreach. Pancake builds a living GTM Brain that gives every agent—buying signals, outreach, content, and AI search—the same ICP, positioning, feedback, and results.",
  competitorBody: "An AI prospecting product focused on identifying high-intent leads, scoring them, and running multichannel email and social outreach. It offers approval controls, a unified inbox, and agents that adapt campaigns over time.",
  competitorChoose: "Choose it when your main job is outbound prospecting.",
  pancakeBody: "An autonomous GTM system organized around one continuously improving Brain. Every GTM agent works from the same customer evidence and positioning, then acts across buying signals, outreach, content creation, publication, and AI-search visibility.",
  pancakeChoose: "Choose it when every GTM motion should learn and operate together.",
  verdictTitle: "Choose Gojiberry for focused outbound. Choose Pancake for a shared GTM Brain.",
  verdictLede: "Both can help a lean team reach prospects. The deciding question is whether you need an outreach specialist or the operating system for every GTM agent.",
  competitorBestFit: "Gojiberry is the cleaner fit if your immediate bottleneck is prospecting and personalized email or social outreach, and you want an inbox and approval controls built around that workflow.",
  differencesLede: "The products overlap in outbound. They differ in what learns, what executes, and how far the system carries your GTM.",
  differences: [
    {
      n: "01",
      title: "One Brain for every GTM agent",
      body: "Gojiberry learns from prospecting and outreach activity. Pancake's core is a persistent GTM Brain: ICP, positioning, objections, campaign results, and customer feedback become shared context for every agent—not just the agent sending messages.",
      angle: "Outreach learns a campaign. Pancake's whole GTM learns the market.",
    },
    {
      n: "02",
      title: "Multiple motions, one strategy",
      body: "Gojiberry concentrates on finding prospects and contacting them. Pancake coordinates buying-signal monitoring, warm-lead discovery, outreach, and content built for Google and AI answers from the same strategy.",
      angle: "One outbound lane versus a connected GTM system.",
    },
    {
      n: "03",
      title: "From insight through publication",
      body: "Pancake does not stop at recommending a content opportunity. Its agents research, write, and publish articles, then use the response to improve the GTM Brain. Gojiberry is not positioned as an AI-search publishing platform.",
      angle: "The Brain turns what sales learns into content the market can find.",
    },
    {
      n: "04",
      title: "Focused workflow versus compounding context",
      body: "Gojiberry's unified inbox and approval modes make outbound execution easy to supervise. Pancake is designed so a signal discovered by one agent can change the copy, targeting, and content produced by the others.",
      angle: "Every result makes the next GTM action smarter.",
    },
    {
      n: "05",
      title: "Similar entry price, different scope",
      body: "Both products publicly list a $99 monthly starting point. Gojiberry packages focused prospecting capacity and outreach agents. Pancake packages a broader autonomous GTM system, including the shared Brain and AI-search publishing.",
      angle: "Compare the motion you automate, not only the monthly price.",
    },
  ],
  rows: [
    { feature: "Core job", competitor: { text: "Prospecting and multichannel outreach", mark: "yes" }, pancake: { text: "Run connected GTM motions on autopilot", mark: "yes" } },
    { feature: "Shared GTM Brain", competitor: { text: "Campaign learning centered on outreach" }, pancake: { text: "ICP, positioning, feedback, and results shared by every agent", mark: "yes" } },
    { feature: "High-intent leads", competitor: { text: "Finds and scores high-intent prospects", mark: "yes" }, pancake: { text: "Monitors buying signals and finds warm leads", mark: "yes" } },
    { feature: "Outbound", competitor: { text: "Email and social outreach with approval controls", mark: "yes" }, pancake: { text: "Personalized outreach in your voice", mark: "yes" } },
    { feature: "Unified inbox", competitor: { text: "Built in", mark: "yes" }, pancake: { text: "Not the core product surface" } },
    { feature: "AI-search content", competitor: { text: "Not positioned as a publishing product", mark: "no" }, pancake: { text: "Researches and writes citation-ready articles", mark: "yes" } },
    { feature: "Publishes content", competitor: { text: "Not advertised" }, pancake: { text: "Publishes articles as part of the workflow", mark: "yes" } },
    { feature: "Public starting price", competitor: { text: "$99/month", mark: "yes" }, pancake: { text: "$99/month", mark: "yes" } },
    { feature: "Best for", competitor: { text: "Teams that want a focused outbound agent" }, pancake: { text: "Founders who want all GTM agents working from one Brain" } },
  ],
  closingTitle: "Give every GTM agent the same perfect Brain.",
  closingLede: "Let signals, outreach, content, and AI search compound instead of running as separate workflows.",
  faqs: [
    { q: "What is the main difference between Gojiberry and Pancake?", a: "Gojiberry is focused on AI prospecting and multichannel outreach. Pancake is organized around a shared GTM Brain that powers multiple agents across buying signals, outreach, content publication, and AI-search visibility." },
    { q: "Do both products find high-intent leads?", a: "Yes. Gojiberry describes high-intent lead discovery and scoring as a core part of its prospecting agent. Pancake monitors buying signals and finds warm leads, then connects that evidence to outreach and the wider GTM Brain." },
    { q: "Which product is better for a pure outbound motion?", a: "Gojiberry may be the better fit when you mainly need outbound prospecting, an integrated inbox, and explicit approval controls. Pancake is the better fit when outbound must share context and feedback with other GTM agents and content motions." },
    { q: "Do Gojiberry and Pancake cost the same?", a: "At the time of review, both products publicly listed a $99 monthly starting point. Plans and allowances can change, so check each product's current pricing before buying." },
    { q: "Can Pancake publish content as well as run outreach?", a: "Yes. Pancake's agents can research, write, and publish articles designed to rank in search and be cited in AI answers, while its other agents monitor signals and run outreach from the same GTM Brain." },
    { q: "Can I use Gojiberry and Pancake together?", a: "Potentially. A team could keep Gojiberry as a specialized outbound workflow and use Pancake for the broader GTM Brain and other agents. Most teams should first decide whether they want one integrated system or separate specialist tools." },
  ],
  related: [
    { href: "/lemlist-vs-pancake", label: "Lemlist vs Pancake" },
    { href: "/origami-vs-pancake", label: "Origami vs Pancake" },
    { href: "/", label: "how Pancake works" },
  ],
  sources: [
    { href: "https://gojiberry.ai/", label: "Gojiberry product page" },
    { href: "https://getpancake.ai/", label: "Pancake product page" },
  ],
};

export default function GojiberryVsPancakePage() {
  return <GtmComparisonPage config={config} />;
}
