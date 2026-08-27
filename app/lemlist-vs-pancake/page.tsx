import type { Metadata } from "next";

import { GtmComparisonPage, type GtmComparisonConfig } from "@/components/sections/comparison/GtmComparisonPage";

const title = "Lemlist vs Pancake: Outbound Platform vs Autonomous GTM";
const description = "Compare Lemlist and Pancake: a mature multichannel sales-engagement platform your team operates versus autonomous agents that run GTM for you.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "https://getpancake.ai/lemlist-vs-pancake" },
  openGraph: {
    type: "website",
    url: "https://getpancake.ai/lemlist-vs-pancake",
    title,
    description,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Lemlist vs Pancake" }],
    siteName: "Pancake",
  },
  twitter: { card: "summary_large_image", title, description, images: ["/og-image.png"] },
};

const config: GtmComparisonConfig = {
  slug: "lemlist-vs-pancake",
  competitor: "Lemlist",
  competitorInitial: "L",
  heroLede: "A sales platform your team operates versus agents that operate for you.",
  heroSummary: "Lemlist gives sales teams a large lead database, multichannel campaign controls, enrichment, and deliverability tooling. Pancake gives founders autonomous GTM agents that monitor signals, run outreach, publish content, and learn through one GTM Brain.",
  competitorBody: "A mature sales-engagement platform for building and managing outbound campaigns. Teams use its lead database, enrichment, sequencing, multichannel steps, deliverability tools, and integrations to control the sales workflow.",
  competitorChoose: "Choose it when a sales team wants deep campaign control.",
  pancakeBody: "An autonomous GTM system for founders who want the work operated for them. Its agents share a persistent GTM Brain, find warm leads, write outreach, publish AI-search content, and improve from the results.",
  pancakeChoose: "Choose it when you want GTM outcomes without staffing the platform.",
  verdictTitle: "Choose Lemlist to equip a sales team. Choose Pancake to avoid building one.",
  verdictLede: "Lemlist is the stronger operator's toolkit. Pancake is designed for a founder who wants agents to own and run the motion.",
  competitorBestFit: "Lemlist is the better fit when SDRs or sales operators need granular sequences, channel breadth, email deliverability controls, a prospect database, and integrations around an established outbound process.",
  differencesLede: "This is less about which product can send an email and more about who must design, operate, and improve the system.",
  differences: [
    {
      n: "01",
      title: "A platform to operate versus agents that operate",
      body: "Lemlist gives a sales team the data and controls to build outbound campaigns. Pancake's agents take ownership of the recurring work: monitor signals, select opportunities, write the outreach, execute, report back, and keep going.",
      angle: "Your team runs Lemlist. Pancake runs GTM for your team.",
    },
    {
      n: "02",
      title: "Campaign context versus a persistent GTM Brain",
      body: "Lemlist organizes leads, sequences, variables, and campaign performance. Pancake maintains a living Brain of ICP, positioning, objections, customer evidence, and results that every GTM agent uses and updates.",
      angle: "Not just campaign history—shared institutional GTM knowledge.",
    },
    {
      n: "03",
      title: "Outbound depth versus GTM breadth",
      body: "Lemlist goes deep on sales engagement across email, LinkedIn, calls, WhatsApp, and SMS. Pancake connects outbound with buying signals and content that it researches, writes, and publishes for Google and AI-search visibility.",
      angle: "Lemlist covers more outbound channels. Pancake covers more of GTM.",
    },
    {
      n: "04",
      title: "Lemlist wins on deliverability control",
      body: "Lemlist has dedicated deliverability products and operating controls, including lemwarm and a deliverability hub. That depth matters to teams managing significant outbound volume. Pancake's advantage is autonomous execution across motions, not a deeper email-operations console.",
      angle: "Pick the specialist when deliverability operations are the job.",
    },
    {
      n: "05",
      title: "Different teams by design",
      body: "Lemlist is built for sales organizations and agencies that want users inside a campaign platform. Pancake is built for founders and lean teams that want agents to supply the GTM capacity they would otherwise hire for.",
      angle: "More leverage for an existing team versus GTM without the team.",
    },
  ],
  rows: [
    { feature: "Core job", competitor: { text: "Equip teams to build and manage outbound", mark: "yes" }, pancake: { text: "Operate connected GTM motions autonomously", mark: "yes" } },
    { feature: "Operating model", competitor: { text: "Sales reps or operators run campaigns" }, pancake: { text: "Agents own recurring execution", mark: "yes" } },
    { feature: "Prospect data", competitor: { text: "Large B2B database and enrichment", mark: "yes" }, pancake: { text: "Warm-lead discovery from buying signals", mark: "yes" } },
    { feature: "Outbound channels", competitor: { text: "Email, LinkedIn, calls, WhatsApp, and SMS", mark: "yes" }, pancake: { text: "Personalized outreach focused on qualified demand" } },
    { feature: "Deliverability tooling", competitor: { text: "Dedicated hub and lemwarm", mark: "yes" }, pancake: { text: "Not positioned as a deliverability console" } },
    { feature: "Shared GTM Brain", competitor: { text: "Campaign and lead context" }, pancake: { text: "ICP, positioning, evidence, and results shared by every agent", mark: "yes" } },
    { feature: "AI-search content", competitor: { text: "Not the core product", mark: "no" }, pancake: { text: "Researches, writes, and publishes articles", mark: "yes" } },
    { feature: "Pricing model", competitor: { text: "Tiered plans; cost depends on plan and team needs" }, pancake: { text: "$99/month", mark: "yes" } },
    { feature: "Best for", competitor: { text: "Sales teams and agencies wanting control" }, pancake: { text: "Founders wanting GTM operated for them" } },
  ],
  closingTitle: "Stop staffing the platform. Start running GTM.",
  closingLede: "Give autonomous agents the Brain and the mandate to find demand, act on it, and learn from every result.",
  faqs: [
    { q: "What is the main difference between Lemlist and Pancake?", a: "Lemlist is a sales-engagement platform that gives sales teams data, sequencing, multichannel controls, deliverability tools, and integrations. Pancake is an autonomous GTM system whose agents run recurring work across signals, outreach, content publication, and AI search using one shared GTM Brain." },
    { q: "Is Lemlist better for email deliverability?", a: "Lemlist has the more specialized deliverability toolkit, including lemwarm and a dedicated deliverability hub. It is the stronger choice when a team needs hands-on control over high-volume outbound infrastructure." },
    { q: "Which product supports more outbound channels?", a: "Lemlist publicly supports a broader set of outbound channels, including email, LinkedIn, calls, WhatsApp, and SMS. Pancake's differentiation is not maximum channel count; it is autonomous execution across outreach, buying signals, and published AI-search content." },
    { q: "Does Pancake replace a sales team?", a: "Pancake is designed to let founders and lean teams run more GTM without hiring a traditional SDR or sales-operations team. Humans still set goals, review strategy, and handle judgment-heavy conversations, while agents own the recurring execution." },
    { q: "How does pricing compare?", a: "Lemlist uses tiered plans whose current price and included channels depend on the package and team needs. Pancake publicly lists a $99 monthly plan. Check both pricing pages for current limits before deciding." },
    { q: "Can Lemlist and Pancake work together?", a: "Potentially. A sales team could retain Lemlist for granular sequencing and deliverability operations while using Pancake for the GTM Brain, buying-signal work, and content publishing. Lean teams may prefer one system to reduce operating overhead." },
  ],
  related: [
    { href: "/gojiberry-vs-pancake", label: "Gojiberry vs Pancake" },
    { href: "/origami-vs-pancake", label: "Origami vs Pancake" },
    { href: "/", label: "how Pancake works" },
  ],
  sources: [
    { href: "https://www.lemlist.com/", label: "Lemlist product page" },
    { href: "https://www.lemlist.com/pricing", label: "Lemlist pricing" },
    { href: "https://getpancake.ai/", label: "Pancake product page" },
  ],
};

export default function LemlistVsPancakePage() {
  return <GtmComparisonPage config={config} />;
}
