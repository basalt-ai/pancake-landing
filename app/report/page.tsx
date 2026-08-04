import type { Metadata } from "next";

import { ReportExperience } from "@/components/sections/report/ReportExperience";

import "./report.css";

export const metadata: Metadata = {
  title: "Free AI GTM report — would ChatGPT recommend you? | Pancake",
  description:
    "Drop your domain and watch Pancake's agents build a mini Brain for your company: how you show up in ChatGPT answers, where you rank on Google's money searches, and the opportunities to win.",
  alternates: { canonical: "https://getpancake.ai/report" },
  openGraph: {
    type: "website",
    url: "https://getpancake.ai/report",
    title: "Free AI GTM report — would ChatGPT recommend you?",
    description:
      "A 30-second scan: ChatGPT visibility on your buyers' questions, Google money searches, and the opportunities to win.",
    siteName: "Pancake",
  },
};

export default function ReportPage() {
  return <ReportExperience />;
}
