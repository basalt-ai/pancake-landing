import type { Metadata } from "next";

import { GtmComparisonPage, type GtmComparisonConfig } from "@/components/sections/comparison/GtmComparisonPage";

const title = "OpenClaw vs Pancake: Agent Runtime vs Managed AI GTM Team";
const description = "Compare OpenClaw and Pancake: an open-source agent runtime you configure versus a managed AI GTM team that finds leads, runs outreach, and publishes content.";

export const metadata: Metadata = {
  title, description,
  alternates: { canonical: "https://getpancake.ai/openclaw-vs-pancake" },
  openGraph: { type: "website", url: "https://getpancake.ai/openclaw-vs-pancake", title, description, images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "OpenClaw vs Pancake" }], siteName: "Pancake" },
  twitter: { card: "summary_large_image", title, description, images: ["/og-image.png"] },
};

const config: GtmComparisonConfig = {
  slug: "openclaw-vs-pancake", competitor: "OpenClaw", competitorInitial: "O",
  heroLede: "An agent runtime you assemble versus a GTM team you hire.",
  heroSummary: "OpenClaw is open-source infrastructure for configuring agents, models, tools, channels, memory, and schedules. Pancake is a managed GTM product with packaged agents that monitor signals, find leads, run outreach, publish AI-search content, and learn through one GTM Brain.",
  competitorBody: "An open-source agent runtime for technical users who want control over providers, models, channels, tools, skills, workspaces, schedules, and deployment. You decide what the agent should do and maintain the system that does it.",
  competitorChoose: "Choose it when you want to build and own the agent stack.",
  pancakeBody: "A finished AI GTM team for small companies. Pancake supplies the Brain, workflows, agents, product UI, recurring execution, and evidence around customer acquisition rather than asking you to assemble an agent runtime.",
  pancakeChoose: "Choose it when you want customer acquisition running, not an agent project.",
  verdictTitle: "Choose OpenClaw to build. Choose Pancake to run GTM.",
  verdictLede: "OpenClaw offers flexibility and infrastructure ownership. Pancake trades that flexibility for packaged expertise, managed execution, and a specific business outcome.",
  competitorBestFit: "OpenClaw is the better fit for developers who want to self-host, select models and runtimes, create custom skills, control channels, and maintain an agent system for use cases beyond GTM.",
  differencesLede: "The useful comparison is infrastructure versus application, not two versions of the same product.",
  differences: [
    { n: "01", title: "Runtime versus finished job", body: "OpenClaw supplies primitives for an agent loop and its environment. Pancake supplies a GTM Brain and packaged acquisition workflows with a clear definition of done.", angle: "The engine versus the GTM vehicle." },
    { n: "02", title: "You configure the expertise", body: "With OpenClaw, you write or install the instructions, skills, schedules, integrations, and policies. Pancake encodes the research, qualification, outreach, and AI-search workflows for you.", angle: "Maximum control versus an opinionated operating system." },
    { n: "03", title: "General memory versus a GTM Brain", body: "OpenClaw workspaces can persist instructions and memory files. Pancake structures market, ICP, positioning, voice, competitors, keywords, feedback, and results so specialized GTM agents can share them.", angle: "A flexible workspace versus a purpose-built knowledge graph." },
    { n: "04", title: "OpenClaw wins on extensibility", body: "OpenClaw supports multiple model providers, agent runtimes, messaging channels, plugins, and custom code. Pancake deliberately limits the surface to managed customer-acquisition workflows.", angle: "Choose OpenClaw when the unique workflow is the point." },
    { n: "05", title: "Free software still has an operating cost", body: "OpenClaw is open source, but hosting, model usage, data providers, maintenance, debugging, and your time remain. Pancake is $99 per month with every GTM agent included.", angle: "Compare total ownership cost with the cost of a finished outcome." },
  ],
  rows: [
    { feature: "Product layer", competitor: { text: "Open-source agent runtime", mark: "yes" }, pancake: { text: "Managed AI GTM application", mark: "yes" } },
    { feature: "Setup", competitor: { text: "Install, configure, connect, and maintain" }, pancake: { text: "Build the Brain and hire packaged agents", mark: "yes" } },
    { feature: "Customization", competitor: { text: "Models, runtimes, channels, skills, and code", mark: "yes" }, pancake: { text: "Focused configuration through GTM context and feedback" } },
    { feature: "GTM Brain", competitor: { text: "General workspace instructions and memory" }, pancake: { text: "Structured market context shared across GTM agents", mark: "yes" } },
    { feature: "Outbound", competitor: { text: "You build or install the workflow" }, pancake: { text: "Packaged signal, lead, and outreach agents", mark: "yes" } },
    { feature: "AI-search publishing", competitor: { text: "You build or install the workflow" }, pancake: { text: "Plans, writes, publishes, and measures content", mark: "yes" } },
    { feature: "Infrastructure ownership", competitor: { text: "Self-hosted and developer-controlled", mark: "yes" }, pancake: { text: "Managed by Pancake" } },
    { feature: "Pricing", competitor: { text: "Open source plus hosting, models, data, and labor" }, pancake: { text: "$99/month, every GTM agent included", mark: "yes" } },
    { feature: "Best for", competitor: { text: "Developers building custom agent systems" }, pancake: { text: "Small companies that need customers without a GTM team" } },
  ],
  closingTitle: "Skip the agent infrastructure project.",
  closingLede: "Start with the GTM Brain, agents, and recurring workflows already assembled around bringing customers.",
  faqs: [
    { q: "What is the main difference between OpenClaw and Pancake?", a: "OpenClaw is open-source agent infrastructure that a technical user configures and maintains. Pancake v2 is a managed AI GTM team with packaged workflows for signals, leads, outreach, and AI-search publishing." },
    { q: "Is Pancake still built on OpenClaw?", a: "Pancake v1 was marketed around its OpenClaw runtime. Pancake v2 is sold as a focused GTM product, not as managed OpenClaw hosting. Buyers should evaluate the GTM outcome rather than the underlying runtime." },
    { q: "Is OpenClaw free?", a: "The software is open source. Running it still creates hosting, model, data-provider, maintenance, and engineering costs. Pancake charges $99 per month for the managed GTM product." },
    { q: "Which gives me more control?", a: "OpenClaw. It is the better choice when you need to select runtimes, modify agent code, self-host, or build use cases outside GTM. Pancake gives up that flexibility to provide a finished acquisition system." },
    { q: "Can I use both?", a: "Yes. A developer can run custom internal agents on OpenClaw while using Pancake for managed GTM. The systems solve different layers of the problem." },
  ],
  related: [{ href: "/viktor-vs-pancake", label: "Viktor vs Pancake" }, { href: "/pancake-vs-paperclips", label: "Paperclip vs Pancake" }, { href: "/", label: "how Pancake works" }],
  sources: [{ href: "https://github.com/openclaw/openclaw", label: "OpenClaw repository" }, { href: "https://github.com/openclaw/openclaw/blob/main/docs/concepts/agent-runtimes.md", label: "OpenClaw runtime documentation" }, { href: "https://getpancake.ai/", label: "Pancake product page" }],
};

export default function OpenClawVsPancakePage() { return <GtmComparisonPage config={config} />; }
