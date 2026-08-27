import type { Metadata } from "next";

import { GtmComparisonPage, type GtmComparisonConfig } from "@/components/sections/comparison/GtmComparisonPage";

const title = "Claude Tag vs Pancake: AI Teammate vs AI GTM Team";
const description = "Compare Claude Tag and Pancake: a shared Claude teammate in Slack versus a focused AI GTM team that runs outreach and publishes AI-search content.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "https://getpancake.ai/claude-tag-vs-pancake" },
  openGraph: { type: "website", url: "https://getpancake.ai/claude-tag-vs-pancake", title, description, images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Claude Tag vs Pancake" }], siteName: "Pancake" },
  twitter: { card: "summary_large_image", title, description, images: ["/og-image.png"] },
};

const config: GtmComparisonConfig = {
  slug: "claude-tag-vs-pancake",
  competitor: "Claude Tag",
  competitorInitial: "C",
  heroLede: "A shared AI teammate versus a focused AI GTM team.",
  heroSummary: "Claude Tag lets a team delegate broad work to Claude inside Slack, with channel context, connected tools, asynchronous tasks, and optional ambient initiative. Pancake gives small companies GTM agents that find demand, run outreach, publish content, and improve one shared GTM Brain.",
  competitorBody: "Anthropic's shared Claude teammate in Slack. Team members tag Claude into work, grant selected channel and tool access, and let it complete asynchronous tasks. Ambient behavior can surface updates and follow up proactively.",
  competitorChoose: "Choose it when your team wants Claude across many collaborative jobs.",
  pancakeBody: "A packaged AI GTM team rather than a general teammate. Buying-signal, outreach, and AI-search agents work from the same ICP, positioning, voice, evidence, and feedback, then execute recurring customer-acquisition work.",
  pancakeChoose: "Choose it when you want a GTM function, not another teammate to delegate to.",
  verdictTitle: "Choose Claude Tag for flexible team delegation. Choose Pancake for autonomous GTM.",
  verdictLede: "Claude Tag is broader and deeply native to Claude and Slack. Pancake is narrower, opinionated, and designed to complete the recurring work that brings customers.",
  competitorBestFit: "Claude Tag is the better fit for Enterprise or Team customers that already work in Slack and want one governed Claude teammate across engineering, support, analytics, and other collaborative tasks.",
  differencesLede: "The old price-and-prompt comparison is obsolete. Claude Tag now takes initiative; Pancake's differentiation is GTM specialization, shared market context, and complete acquisition workflows.",
  differences: [
    { n: "01", title: "General delegation versus packaged GTM expertise", body: "Claude Tag can plan and complete many kinds of work from a channel request. Pancake starts with packaged GTM jobs, rules, and evidence, so a founder does not need to design every workflow from scratch.", angle: "A capable teammate versus a function already assembled." },
    { n: "02", title: "Channel context versus a GTM Brain", body: "Claude learns from the channels and data sources an administrator permits. Pancake structures market, ICP, positioning, voice, keywords, competitors, objections, and results for reuse by every GTM agent.", angle: "Workplace context versus purpose-built market memory." },
    { n: "03", title: "Delegated tasks versus a recurring acquisition loop", body: "Claude Tag handles tagged and planned tasks and can proactively follow up. Pancake continuously connects signals, lead qualification, outreach, publication, performance, and Brain updates around one outcome: customers.", angle: "The unit of work is a task. The unit of value is the GTM loop." },
    { n: "04", title: "Claude Tag wins on collaborative breadth", body: "Claude Tag is strong when many team members need the same Claude across coding, support, metrics, research, and internal work, with administrator permissions and spend controls. Pancake does not try to replace that broad collaboration layer.", angle: "Choose the general teammate when the whole team shares the workload." },
    { n: "05", title: "Different buying models", body: "Claude Tag is available in beta to eligible Claude Enterprise and Team customers and uses organization spend controls. Pancake is a standalone $99 monthly GTM product with every agent included.", angle: "An extension of a Claude workspace versus a complete GTM subscription." },
  ],
  rows: [
    { feature: "Core job", competitor: { text: "Shared Claude teammate for broad work", mark: "yes" }, pancake: { text: "AI GTM team for customer acquisition", mark: "yes" } },
    { feature: "Interface", competitor: { text: "Slack", mark: "yes" }, pancake: { text: "Pancake app plus Claude and Codex connection" } },
    { feature: "Initiative", competitor: { text: "Ambient updates and follow-up when enabled", mark: "yes" }, pancake: { text: "Recurring signal and schedule-driven GTM work", mark: "yes" } },
    { feature: "Memory", competitor: { text: "Permitted channel and tool context", mark: "yes" }, pancake: { text: "Structured GTM Brain shared by every agent", mark: "yes" } },
    { feature: "Breadth", competitor: { text: "Engineering, support, analytics, research, and more", mark: "yes" }, pancake: { text: "Signals, outreach, content, and AI search" } },
    { feature: "Publishes AI-search content", competitor: { text: "Can assist through connected tools" }, pancake: { text: "Purpose-built planning, writing, publication, and measurement", mark: "yes" } },
    { feature: "Outbound system", competitor: { text: "Can complete delegated workflows" }, pancake: { text: "Purpose-built signal, lead, and outreach agents", mark: "yes" } },
    { feature: "Availability", competitor: { text: "Beta for eligible Enterprise and Team customers" }, pancake: { text: "$99/month standalone product", mark: "yes" } },
    { feature: "Best for", competitor: { text: "Teams that want Claude across many jobs" }, pancake: { text: "Small companies that need a GTM function" } },
  ],
  closingTitle: "Give the whole GTM function a Brain and a mandate.",
  closingLede: "Let specialized agents find demand, act on it, publish the work, and learn from every result.",
  faqs: [
    { q: "What is the main difference between Claude Tag and Pancake?", a: "Claude Tag is a shared Claude teammate in Slack for broad collaborative work. Pancake v2 is a focused AI GTM team whose agents monitor buying signals, find leads, run outreach, publish AI-search content, and learn through one GTM Brain." },
    { q: "Does Claude Tag work proactively?", a: "Yes. Anthropic says ambient behavior can proactively surface relevant information and follow up on unresolved work. The old claim that Claude Tag only works when tagged is no longer accurate." },
    { q: "Is Pancake cheaper than Claude Tag?", a: "They are sold differently, so a percentage comparison would be misleading. Claude Tag is attached to eligible Claude Enterprise and Team plans with spend controls. Pancake is a standalone $99 monthly product with every GTM agent included." },
    { q: "Which is better for a small company without a GTM team?", a: "Pancake is the more focused fit because the workflows and shared Brain are already built around customer acquisition. Claude Tag is stronger when an existing team wants a flexible Claude collaborator across many functions." },
    { q: "Can I use both?", a: "Yes. Claude Tag can be a broad teammate for internal work while Pancake owns recurring GTM execution. The overlap should be evaluated against the cost of operating two systems." },
  ],
  related: [{ href: "/viktor-vs-pancake", label: "Viktor vs Pancake" }, { href: "/openclaw-vs-pancake", label: "OpenClaw vs Pancake" }, { href: "/", label: "how Pancake works" }],
  sources: [{ href: "https://www.anthropic.com/news/introducing-claude-tag", label: "Anthropic's Claude Tag announcement" }, { href: "https://getpancake.ai/", label: "Pancake product page" }],
};

export default function ClaudeTagVsPancakePage() { return <GtmComparisonPage config={config} />; }
