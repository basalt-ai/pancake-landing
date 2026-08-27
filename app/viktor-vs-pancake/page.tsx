import type { Metadata } from "next";

import { GtmComparisonPage, type GtmComparisonConfig } from "@/components/sections/comparison/GtmComparisonPage";

const title = "Viktor vs Pancake: General AI Employee vs AI GTM Team";
const description = "Compare Viktor and Pancake: a broad AI employee in Slack and Teams versus a focused AI GTM team for buying signals, outreach, and AI-search publishing.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "https://getpancake.ai/viktor-vs-pancake" },
  openGraph: { type: "website", url: "https://getpancake.ai/viktor-vs-pancake", title, description, images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Viktor vs Pancake" }], siteName: "Pancake" },
  twitter: { card: "summary_large_image", title, description, images: ["/og-image.png"] },
};

const config: GtmComparisonConfig = {
  slug: "viktor-vs-pancake",
  competitor: "Viktor",
  competitorInitial: "V",
  heroLede: "A general AI employee versus a focused AI GTM team.",
  heroSummary: "Viktor works across many company functions from Slack or Microsoft Teams and connects to thousands of tools. Pancake focuses on bringing customers through buying signals, warm leads, outreach, and AI-search content coordinated by one GTM Brain.",
  competitorBody: "A shared AI employee that lives in Slack and Microsoft Teams. Viktor completes broad tasks across reporting, campaigns, operations, engineering, finance, and internal tools, with 3,200+ advertised integrations and scheduled workflows.",
  competitorChoose: "Choose it when one generalist should work across the company.",
  pancakeBody: "A focused AI GTM team for small companies. Its agents monitor market signals, find qualified leads, run personalized outreach, publish content for Google and AI search, and write results back into one shared GTM Brain.",
  pancakeChoose: "Choose it when customer acquisition is the job to own end to end.",
  verdictTitle: "Choose Viktor for breadth. Choose Pancake for GTM depth.",
  verdictLede: "Both products do real work and can run recurring workflows. The decision is whether you need a general AI employee or a coordinated team built specifically to bring customers.",
  competitorBestFit: "Viktor is the stronger fit when a team wants one shared AI employee inside Slack or Teams to handle varied work across finance, engineering, operations, reporting, and marketing through a broad integration catalog.",
  differencesLede: "The v2 comparison is no longer one agent versus many agents. It is broad cross-company execution versus a focused, compounding GTM system.",
  differences: [
    { n: "01", title: "Generalist breadth versus GTM specialization", body: "Viktor accepts a wide range of assignments across the company. Pancake is narrower by design: every agent and workflow is built around signals, leads, outreach, content, and AI-search visibility.", angle: "Pick the surface area you need, not the largest feature list." },
    { n: "02", title: "Shared workspace memory versus a structured GTM Brain", body: "Viktor remembers company context and prior work. Pancake structures market, ICP, positioning, voice, keywords, competitors, feedback, and results specifically so every GTM agent can reuse them.", angle: "Pancake's memory is the operating system for one function." },
    { n: "03", title: "Tasks across tools versus a closed acquisition loop", body: "Viktor can build reports, update tools, create apps, and schedule recurring work. Pancake follows one loop from market signal to qualified person, outreach or published content, measured response, and an improved Brain.", angle: "Breadth of tasks versus depth of outcome." },
    { n: "04", title: "Viktor wins on interface and integration breadth", body: "Viktor's Slack and Teams presence, fast install, and 3,200+ advertised integrations make it compelling for organizations that want a shared employee in their existing communication layer. Pancake uses its own product surface and Claude or Codex connection around a focused GTM workflow.", angle: "Choose Viktor when the collaboration surface matters most." },
    { n: "05", title: "Different entry prices", body: "Viktor publicly starts at $50 per month after free credits. Pancake is $99 per month with every GTM agent included. Compare the recurring job and the operating capacity each subscription supplies.", angle: "A lower generalist entry price versus a complete GTM agent suite." },
  ],
  rows: [
    { feature: "Core job", competitor: { text: "General AI employee across company functions", mark: "yes" }, pancake: { text: "AI GTM team that brings customers", mark: "yes" } },
    { feature: "Primary interface", competitor: { text: "Slack and Microsoft Teams", mark: "yes" }, pancake: { text: "Pancake app plus Claude and Codex connection" } },
    { feature: "Tool breadth", competitor: { text: "3,200+ advertised integrations", mark: "yes" }, pancake: { text: "Focused integrations for GTM execution" } },
    { feature: "Recurring work", competitor: { text: "Scheduled tasks and proactive suggestions", mark: "yes" }, pancake: { text: "Signal and schedule-driven GTM agents", mark: "yes" } },
    { feature: "GTM Brain", competitor: { text: "Shared company memory" }, pancake: { text: "Structured ICP, positioning, voice, keywords, feedback, and results", mark: "yes" } },
    { feature: "AI-search publishing", competitor: { text: "Can complete broad content tasks" }, pancake: { text: "Plans, writes, publishes, and measures articles", mark: "yes" } },
    { feature: "Outreach", competitor: { text: "Can manage workflows across connected tools" }, pancake: { text: "Purpose-built signals, qualification, and outreach agents", mark: "yes" } },
    { feature: "Public starting price", competitor: { text: "$50/month after free credits", mark: "yes" }, pancake: { text: "$99/month, every GTM agent included", mark: "yes" } },
    { feature: "Best for", competitor: { text: "Teams wanting one broad shared AI employee" }, pancake: { text: "Small companies without a GTM team" } },
  ],
  closingTitle: "Hire the system built to bring customers.",
  closingLede: "Let one GTM Brain coordinate the signals, outreach, content, and learning that move acquisition forward.",
  faqs: [
    { q: "What is the main difference between Viktor and Pancake?", a: "Viktor is a broad AI employee that works across company functions from Slack or Teams. Pancake v2 is a focused AI GTM team that monitors signals, finds leads, runs outreach, publishes AI-search content, and learns through one GTM Brain." },
    { q: "Does Viktor work without prompting?", a: "Yes. Viktor supports scheduled tasks and proactive automations, so the old comparison that described it as prompt-only is no longer accurate. Pancake also runs recurring work, but within a narrower GTM scope." },
    { q: "Which product has more integrations?", a: "Viktor advertises more than 3,200 integrations and wins on breadth. Pancake focuses its integrations on completing customer-acquisition workflows and sharing the results across GTM agents." },
    { q: "Which is better for outreach and AI search?", a: "Pancake is the more focused choice because outreach and AI-search publishing are core product motions connected by the GTM Brain. Viktor may be better when those tasks are only part of a much broader company-wide workload." },
    { q: "How does pricing compare?", a: "At the time of review, Viktor advertised paid plans from $50 per month after free credits. Pancake was $99 per month with every GTM agent included. Confirm current limits before buying." },
  ],
  related: [{ href: "/claude-tag-vs-pancake", label: "Claude Tag vs Pancake" }, { href: "/openclaw-vs-pancake", label: "OpenClaw vs Pancake" }, { href: "/", label: "how Pancake works" }],
  sources: [{ href: "https://viktor.com/", label: "Viktor product page" }, { href: "https://viktor.com/docs/getting-started", label: "Viktor documentation" }, { href: "https://getpancake.ai/", label: "Pancake product page" }],
};

export default function ViktorVsPancakePage() { return <GtmComparisonPage config={config} />; }
