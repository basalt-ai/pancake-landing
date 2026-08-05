import type { ScanEvent } from "@/lib/scan/types";

/**
 * Canned scan for the demo path ("Try doctolib.fr") and the unreachable-site
 * fallback. Replays through the same reducer as a live scan, so it doubles as
 * the dev fixture for the whole page — clearly labeled demo data, not claims.
 */
export const DEMO_DOMAIN = "doctolib.fr";

export const DEMO_EVENTS: ScanEvent[] = [
  { type: "status", label: `Knocking on ${DEMO_DOMAIN}…` },
  {
    type: "meta",
    title: "Doctolib — Book your medical appointments online",
    favicon: `https://www.${DEMO_DOMAIN}/favicon.ico`,
    description:
      "Book medical appointments online with practitioners near you. Trusted by 900,000 health professionals across Europe.",
    schemaTypes: ["Organization", "WebSite", "FAQPage"],
    snippets: [
      "Book your next appointment online in a few clicks.",
      "900,000 practitioners trust Doctolib every day.",
      "Video consultations, reminders, and your health history in one place.",
      "Find a GP, dentist or physio near you.",
    ],
  },
  { type: "status", label: "Checking who gets in: AI crawlers, llms.txt, schema…" },
  { type: "check", id: "crawlers", pass: true, detail: "GPTBot and ClaudeBot can read you. The door is open." },
  { type: "check", id: "llms", pass: false, detail: "No llms.txt. Easy win, 20 minutes of work." },
  { type: "check", id: "schema", pass: true, detail: "schema.org markup in place (Organization, WebSite, FAQPage)." },
  { type: "check", id: "meta_quality", pass: true, detail: "Titles and descriptions pull their weight." },
  { type: "status", label: `Building a mini Brain for ${DEMO_DOMAIN}…` },
  {
    type: "brain",
    company: "Doctolib",
    icp: "practice managers and independent practitioners filling their calendars online",
    prompts: [
      "What's the best online booking system for a small medical practice?",
      "How do I reduce no-shows at my clinic?",
      "Best patient scheduling software for physiotherapists",
      "How can patients book appointments with me online?",
      "Doctolib alternatives for a dental office",
      "What software do French GPs use for teleconsultation?",
      "How to digitize appointment management in a clinic",
      "Best tools to manage patient reminders automatically",
      "Online booking platform with insurance card integration",
      "How do I get more patients to find my practice online?",
    ],
  },
  {
    type: "google",
    rows: [
      { term: "prendre rendez-vous médecin", position: 12, volume: 22000, detail: "position 12 · 22,000 searches/mo" },
      { term: "online doctor appointment", position: 14, volume: 9800, detail: "position 14 · 9,800 searches/mo" },
      { term: "teleconsultation platform", position: 11, volume: 5400, detail: "position 11 · 5,400 searches/mo" },
      { term: "patient scheduling software", position: 17, volume: 4300, detail: "position 17 · 4,300 searches/mo" },
      { term: "medical booking app", position: 13, volume: 3900, detail: "position 13 · 3,900 searches/mo" },
    ],
    toWin: 5,
    commentary: "Ranks for 18,400 keywords, 214 in the top 10.",
  },
  { type: "status", label: "Asking ChatGPT what your buyers ask…" },
  { type: "citation", index: 0, cited: true, detail: "ChatGPT names you in this answer." },
  { type: "citation", index: 1, cited: false, detail: "Cited instead: solvhealth.com, zocdoc.com", citedDomains: ["solvhealth.com", "zocdoc.com"] },
  { type: "citation", index: 2, cited: true, detail: "ChatGPT names you in this answer." },
  { type: "citation", index: 3, cited: true, detail: "ChatGPT names you in this answer." },
  { type: "citation", index: 4, cited: false, detail: "Cited instead: calendly.com, acuityscheduling.com", citedDomains: ["calendly.com", "acuityscheduling.com"] },
  { type: "citation", index: 5, cited: true, detail: "ChatGPT names you in this answer." },
  { type: "citation", index: 6, cited: false, detail: "Cited instead: zocdoc.com", citedDomains: ["zocdoc.com"] },
  { type: "citation", index: 7, cited: false, detail: "You don't come up in this answer." },
  { type: "citation", index: 8, cited: true, detail: "ChatGPT names you in this answer." },
  { type: "citation", index: 9, cited: true, detail: "ChatGPT names you in this answer." },
  { type: "status", label: "Adding it up…" },
  {
    type: "opportunities",
    count: 3,
    items: [
      {
        title: "Own the no-show question",
        detail: "Buyers ask about reducing no-shows constantly. One publication answering it puts you in answers where calendly.com sits today.",
      },
      {
        title: "5 page-2 searches within reach",
        detail: "High-intent booking searches sit at positions 11 to 17. That's one focused page each from page 1.",
      },
      {
        title: "Ship an llms.txt",
        detail: "20 minutes of work that tells every AI system exactly what you do and who you serve.",
      },
    ],
  },
  { type: "score", value: 62, potential: 84, breakdown: { ai: { score: 24, max: 40 }, google: { score: 24, max: 35 }, readiness: { score: 14, max: 25 } } },
  { type: "done", domain: DEMO_DOMAIN, mode: "live" },
];
