# CLAUDE.md — Pancake Landing

Project rules, stack, and hard constraints live in `AGENTS.md` — read it before any task.
This file routes the design & copy tooling installed for this project: what each tool is for
and when to reach for it. The Pancake design kit (`app/_styles/`, `_design-kit/`), the Figma
design system, and `AGENTS.md` always win over any tool's suggestions — these tools advise,
they don't decide.

## MCP servers (`.mcp.json`, project scope)

### refero — real-product design references
HTTP MCP at `https://api.refero.design/mcp`. Library of 135k+ real product screens, 2,000+
curated style systems, and 6,000+ user flows (Stripe, Linear, Notion tier).

- **When**: FIRST step of any section design/redesign (hero, pricing, FAQ, testimonials,
  comparison pages) or funnel work — search real references and lock a direction *before*
  writing JSX/CSS.
- **How**: `refero_search_styles` / `refero_get_style` for visual systems;
  `refero_search_screens` + `refero_get_screen_image` for concrete screens;
  `refero_get_similar_screens` to widen a moodboard; `refero_search_flows` for
  signup/onboarding journeys.
- **Setup**: needs a Refero Pro account — authorize once via `/mcp` in an interactive
  session (OAuth). Reference material is copyrighted product UI: inspiration only, never
  copy assets.

### magic — 21st.dev component generator
Stdio MCP (`npx @21st-dev/magic`). Generates/refines single React+Tailwind components from
the 21st.dev community library; also `logo_search` for brand logos as SVG/TSX.

- **When**: scaffolding one new component or section variant (pricing cards, marquee, FAQ
  accordion) to cherry-pick structure from, or grabbing a brand logo SVG. Component-scale
  only — never whole pages.
- **Caveat**: output is shadcn/framer-motion-flavored. Always re-skin to the Pancake kit
  (tokens, `.badge`, equal card heights, no hover dim) — never drop in as-is or add its
  dependencies.
- **Setup**: export `TWENTYFIRST_API_KEY` in your shell (key from https://21st.dev/magic/console);
  `.mcp.json` expands it at launch. Without it, the magic server just fails to connect —
  everything else keeps working.

## Skills (installed in `~/.claude/skills/`)

### /impeccable — design review, polish, and anti-slop detection
One skill, 23 subcommands: `audit` (a11y/perf/responsive), `critique` (hierarchy/UX),
`polish`, `typeset`, `layout`, `animate`, `harden` (overflow/edge cases), `clarify` (UX
copy), `bolder`/`quieter`, `live` (in-browser variant iteration)…

- **When**: reviewing or polishing any landing UI — run the subcommand matching the task.
  Before shipping visual work, `npx impeccable detect <dir>` runs 45 deterministic
  AI-design-tell rules (no LLM) — cheap pre-ship gate.
- **Note**: `/impeccable init` (writes PRODUCT.md/DESIGN.md design context) has NOT been
  run — decide with Tristan before adding those files to the repo.

### /design-taste-frontend — anti-slop build skill (taste-skill v2)
Opinionated implementation skill for building landing sections that don't look templated:
design-direction dials, strict typography/layout/motion directives, 50+ item pre-flight
checklist of banned AI tells.

- **When**: building a NEW section or page from scratch.
- **Caveat**: its hard bans (em dashes, centered heroes, eyebrow limits) can clash with
  established Pancake copy/design decisions — brand rules win.

### /redesign-existing-projects — audit-first premium upgrade (taste-skill)
Sibling skill: audits existing UI for generic AI patterns, then upgrades within the current
stack without breaking functionality, IA, copy, or SEO.

- **When**: improving an EXISTING section rather than building new — the safer entry point
  of the two taste skills.

### /ui-ux-pro-max — offline design-knowledge database
BM25 search over 67 UI styles, 161 palettes, 57 font pairings, 161 product types, 99 UX
guidelines, landing-page patterns, GSAP skeletons. Needs `python3` (present).

- **When**: choosing/validating a direction — style, palette, font pairing, section
  structure, UX checklist — look it up instead of picking from memory:
  `python3 ~/.claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --domain landing|style|typography|ux|gsap`
- **Caveat**: never let a generated "design system" override the Pancake brand tokens.
  Don't use `--persist` (writes design-system/ files into the cwd).

### /humanizer — strip AI-writing tells from copy
Detects and rewrites 33 AI-writing patterns (Wikipedia "Signs of AI writing"): promotional
language, rule-of-three, vague attributions, em-dash overuse, filler, hedging, AI vocabulary.

- **When**: final pass on ANY user-facing copy before it lands — landing sections, FAQ,
  blog/GEO posts, tweets. Tristan explicitly wants copy that doesn't "sound AI".
- **Caveat**: it strips ALL em/en dashes; existing Pancake copy uses them deliberately, so
  review its diff instead of auto-accepting. It doesn't know brand rules (capital-P
  Pancake, banned identity terms) — apply those separately.

## Not installed (available on demand)

The taste-skill repo has 10 more skills (minimalist/brutalist/soft styles, image-gen
reference boards, image-to-code); ui-ux-pro-max ships 6 more (banner-design, brand, slides,
design-system, ui-styling, design). Flagships only were installed to keep session context
lean — copy others from the repos into `~/.claude/skills/` if a task calls for one.
