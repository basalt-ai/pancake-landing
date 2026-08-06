---
name: landing-voice
description: Pancake landing copy voice — rules distilled from synthetic.ai and greptile.com. Use whenever writing or reviewing ANY user-facing copy for the landing page (headlines, ledes, step bodies, labels, CTAs, guarantees). Rewrites verbose, hedged, or template-sounding copy into the short declarative voice both reference sites share.
---

# Landing voice — how Synthetic and Greptile talk

Distilled 2026-08-06 from the live copy of synthetic.ai and greptile.com (verbatim
corpus at the bottom). Apply to every visible string on the landing page.
Brand rules still apply on top: capital-P Pancake, no banned identity terms
(see CLAUDE.md / memory), left-justified copy.

## The ten rules

1. **Headline = one claim, ≤8 words.** If it's a sentence, end it with a period.
   `The AI Code Reviewer.` · `An AI agent that does your bookkeeping`.
   Two-sentence parallelism is the strongest form: `You run your startup. We run
   your accounting.`

2. **One idea per sentence. Periods beat commas.** Split any sentence carrying
   two facts. Greptile step bodies are ONE sentence: `Builds a graph of your
   repo - files, functions, and dependencies.`

3. **Word budgets — hard ceilings, aim under:**
   - hero/section lede: ≤ 30 words, ≤ 3 sentences
   - step/feature body: ≤ 35 words, ≤ 3 sentences
   - card/list body: 1 sentence
   - label/tag/badge: ≤ 3 words
   - guarantee/bullet: ≤ 12 words

4. **Concrete nouns, real numbers.** `10x easier` · `$30/seat` · `Unbalanced
   CUDA release wipes context`. Name the thing ("clay alternative", `0.95`,
   `$49`), never the category ("relevant keywords", "high scores").

5. **Kill hedges and intensifiers on sight:** actually, really, just, very,
   truly, simply, seamlessly, powerful, robust, comprehensive, high-quality.
   If the sentence survives without the word, the word was noise.

6. **A body never repeats its heading.** The heading claims; the body adds new
   facts. If sentence one restates the title, delete sentence one.

7. **Anaphora is the one allowed flourish — once per page.** Pattern from
   Synthetic: `No learning curve. No monthly call with a bookkeeper who
   doesn't understand your business. No spreadsheet you swore you'd update
   last month.` Short, short, then longest-and-most-specific. The last item
   carries the humor; the humor is dry and specific, never wacky.

8. **Em dashes: at most one per block.** Prefer a period. (Existing Pancake
   copy uses them deliberately — thin them, don't strip them.)

9. **Active voice, present tense, Pancake as actor, reader as "you".**
   `Synthetic goes in, reads the context of your business, reconciles what
   needs reconciling.` Verbs first in step titles: `Indexes your codebase`.

10. **End on the payoff.** The last words of a lede or closer are the reward:
    `…so you can get back to building.` · `…so you can get back to shipping.`
    · `…your first message opens warm.` Never end on a qualifier.

## Review procedure

For each visible string on the page:
1. Measure against the budget (rule 3). Over budget → rewrite, don't trim
   adjectives one by one — restate the idea from scratch in the voice.
2. Scan for rule-5 words and rule-6 repeats. Delete.
3. Read it aloud once. If you breathe twice in one sentence, split it.
4. Locked copy (founder-decided hero H1/H2, verbatim briefs) is flagged, not
   rewritten — list it in the report with the suggested fix.

## Corpus (verbatim, for calibration)

**synthetic.ai:** "You run your startup. We run your accounting." · "Building a
product has never been easier. But running a business is still tedious as hell.
Synthetic handles your bookkeeping start to finish, so you can get back to
building." · "Connect everything, Synthetic does the work" · "That's the entire
experience. No learning curve. No monthly call with a bookkeeper who doesn't
understand your business. No spreadsheet you swore you'd update last month." ·
"Accrual-basis books, done right" · "From side project to real business.
Without the busywork."

**greptile.com:** "The AI Code Reviewer." · "AI agents that review and test
pull requests with full context of the codebase." · "How Greptile reviews every
PR" · "Indexes your codebase" / "Builds a graph of your repo - files,
functions, and dependencies." · "Your house, your rules" · "We're getting to
know each other" · "Catch them all" · "Greptile is building the code validation
layer so you can get back to shipping."
