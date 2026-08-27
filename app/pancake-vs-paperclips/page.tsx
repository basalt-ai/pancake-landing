import type { Metadata } from "next";

import { GtmComparisonPage, type GtmComparisonConfig } from "@/components/sections/comparison/GtmComparisonPage";

const title = "Paperclip vs Pancake: AI Company Control Plane vs AI GTM Team";
const description = "Compare Paperclip and Pancake: a self-hosted control plane for AI companies versus a managed AI GTM team that brings customers.";

export const metadata: Metadata = {
  title, description,
  alternates: { canonical: "https://getpancake.ai/pancake-vs-paperclips" },
  openGraph: { type: "website", url: "https://getpancake.ai/pancake-vs-paperclips", title, description, images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Paperclip vs Pancake" }], siteName: "Pancake" },
  twitter: { card: "summary_large_image", title, description, images: ["/og-image.png"] },
};

const config: GtmComparisonConfig = {
  slug: "pancake-vs-paperclips", competitor: "Paperclip", competitorInitial: "P",
  heroLede: "An AI company control plane versus a managed AI GTM team.",
  heroSummary: "Paperclip lets technical founders create a company, set goals, hire AI agents into an org chart, assign budgets, and monitor work. Pancake provides a finished GTM Brain and agents for buying signals, outreach, and AI-search publishing.",
  competitorBody: "An open-source control plane for autonomous AI companies. You create goals, a CEO agent, reporting lines, tasks, heartbeats, budgets, and approvals, then connect and operate the agent runtimes yourself.",
  competitorChoose: "Choose it when you want to design and govern an AI organization.",
  pancakeBody: "A managed customer-acquisition product. Pancake builds the GTM Brain, supplies specialized agents, runs recurring workflows, records outcomes, and improves targeting, outreach, and content from feedback.",
  pancakeChoose: "Choose it when you want GTM work completed without building the org chart.",
  verdictTitle: "Choose Paperclip to orchestrate agents. Choose Pancake to bring customers.",
  verdictLede: "Paperclip is broad infrastructure for a developer-operated AI company. Pancake is a narrow application for a small company that needs a GTM function.",
  competitorBestFit: "Paperclip is the stronger fit for developers who want to self-host a multi-agent organization, choose agent adapters, define a hierarchy, control budgets, and apply the system across functions beyond GTM.",
  differencesLede: "Both use multiple agents and recurring work, but the buyer assembles Paperclip while Pancake arrives with the GTM function assembled.",
  differences: [
    { n: "01", title: "Control plane versus managed function", body: "Paperclip models companies, goals, agents, managers, tasks, and budgets. Pancake models the market, ICP, positioning, voice, signals, leads, outreach, content, and feedback.", angle: "Organize any agents or hire one finished GTM team." },
    { n: "02", title: "You design the organization", body: "Paperclip asks you to create the CEO, reporting tree, adapter configuration, prompts, goals, and budgets. Pancake asks for company context and turns it into a GTM Brain and scheduled work.", angle: "Maximum organizational control versus fast time to outcome." },
    { n: "03", title: "General goals versus market learning", body: "Paperclip traces work through company goals and an org hierarchy. Pancake traces every signal, lead verdict, message, article, and performance result back into shared GTM context.", angle: "A company graph versus a market knowledge graph." },
    { n: "04", title: "Paperclip wins on breadth and governance", body: "Paperclip supports multiple companies, arbitrary agent roles, adapter choices, per-agent budgets, approvals, and board-level control. Pancake deliberately focuses on one managed GTM organization.", angle: "Choose Paperclip when the structure itself is the product." },
    { n: "05", title: "Open source versus subscription", body: "Paperclip is open source and self-hosted, with separate runtime, model, infrastructure, and maintenance costs. Pancake is $99 per month with every managed GTM agent included.", angle: "Build cost and control versus a predictable managed outcome." },
  ],
  rows: [
    { feature: "Core job", competitor: { text: "Control plane for an autonomous AI company", mark: "yes" }, pancake: { text: "Managed AI GTM team", mark: "yes" } },
    { feature: "Primary model", competitor: { text: "Companies, goals, org chart, tasks, and budgets" }, pancake: { text: "GTM Brain, signals, leads, outreach, content, and feedback" } },
    { feature: "Setup", competitor: { text: "Self-host and configure agents and adapters" }, pancake: { text: "Build the Brain and hire packaged agents", mark: "yes" } },
    { feature: "Customization", competitor: { text: "Arbitrary roles, runtimes, hierarchy, and plugins", mark: "yes" }, pancake: { text: "Opinionated GTM workflows" } },
    { feature: "Outbound", competitor: { text: "You create the agents and workflow" }, pancake: { text: "Packaged signal, lead, and outreach agents", mark: "yes" } },
    { feature: "AI-search publishing", competitor: { text: "You create the agents and workflow" }, pancake: { text: "Plans, writes, publishes, and measures articles", mark: "yes" } },
    { feature: "Governance", competitor: { text: "Budgets, approvals, board control, and hierarchy", mark: "yes" }, pancake: { text: "Managed actions, feedback, and GTM evidence" } },
    { feature: "Pricing", competitor: { text: "Open source plus runtime, hosting, models, and labor" }, pancake: { text: "$99/month, every GTM agent included", mark: "yes" } },
    { feature: "Best for", competitor: { text: "Developers building AI organizations" }, pancake: { text: "Small companies that need customer acquisition" } },
  ],
  closingTitle: "Hire the GTM team instead of designing one.",
  closingLede: "Start with the market Brain, agents, workflows, and recurring execution already connected.",
  faqs: [
    { q: "What is the main difference between Paperclip and Pancake?", a: "Paperclip is an open-source control plane for creating and governing AI-agent organizations. Pancake v2 is a managed AI GTM team with packaged workflows for signals, leads, outreach, and AI-search publishing." },
    { q: "Which product is more customizable?", a: "Paperclip. Developers can define companies, roles, hierarchies, adapters, prompts, budgets, and plugins. Pancake is intentionally more opinionated because it sells a finished GTM function." },
    { q: "Is Paperclip free?", a: "Paperclip is open source, but users still pay for hosting, agent runtimes, models, data, and maintenance. Pancake charges $99 per month for the managed GTM product." },
    { q: "Which is faster to deploy for sales and marketing?", a: "Pancake is faster when the goal is customer acquisition because its Brain and agents are already structured around GTM. Paperclip requires the user to design and configure those agents and workflows." },
    { q: "Can I use both?", a: "Yes. A technical team can use Paperclip as a broader company control plane and Pancake as the managed GTM function, though it should evaluate overlapping costs and responsibilities." },
  ],
  related: [{ href: "/openclaw-vs-pancake", label: "OpenClaw vs Pancake" }, { href: "/viktor-vs-pancake", label: "Viktor vs Pancake" }, { href: "/", label: "how Pancake works" }],
  sources: [{ href: "https://docs.paperclip.ing/guides/welcome/what-is-paperclip/", label: "Paperclip documentation" }, { href: "https://github.com/paperclipai/paperclip", label: "Paperclip repository" }, { href: "https://getpancake.ai/", label: "Pancake product page" }],
};

export default function PaperclipVsPancakePage() { return <GtmComparisonPage config={config} />; }
