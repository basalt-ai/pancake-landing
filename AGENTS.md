# Pancake Landing — Agent Project Rules

This file is the cross-tool agent context for the Pancake landing rebuild. Read before every task.

## Mission

Two phases. Nothing else matters until they ship.

1. **Extract the Figma design system** — fonts, logos, colors, spacing, type scale, radii, shadows, components. PERFECTLY matching. Source: the design system page in the `Pancake-Design` Figma file.
2. **Recode the v3 landing pages** using only the extracted design system. Match Figma 1:1.

Refinements (copy, perf, polish) come later. Don't pre-optimize.

---

## Routes (paths stay the same)

- `/`
- `/pricing`
- `/build-in-public`
- `/signup` — visual refresh only, form/submit logic untouched

---

## Stack (confirmed in Phase 1 Stage A)

- **Next.js** `14.2.18` on Vercel (per `package.json`); **App Router** (`app/` present; no `pages/` router directory).
- **Tailwind CSS** `^3.4.15` with `tailwind.config.ts` and PostCSS (`postcss.config.mjs`); **not** v4 (no `@import "tailwindcss"` / `@theme` pipeline).
- **TypeScript** `^5.6.3` with `tsconfig.json` (`strict`, path alias `@/*` → repo root).
- **Package manager:** **npm** (`package-lock.json` at repo root; no `pnpm-lock.yaml` / `yarn.lock` / `bun.lockb`).
- **GSAP:** `gsap` + `@gsap/react` installed; import from `@/lib/gsap` only (see `lib/gsap.ts`).
- **Analytics:** production **Google Tag Manager** container `GTM-P3Z79WKD` plus direct Meta, LinkedIn, and Reddit base pixels in `app/layout.tsx` (inline bootstrap `<script>` + `<noscript>` fallbacks; not `@next/third-parties`, not `next/script`). **Preserve as-is;** do not reinstall or “migrate” unless Tristan asks.

---

## Hard rules

- **Match Figma exactly.** Spacing, type, color, radius — pixel-perfect. Use the design system page as source of truth, never invent values.
- **Never reference values, styles, or assets from the old design system.** If you find a trace of the old system in the codebase (old hex values, old Tailwind classes, old component files, old fonts, old logos), flag it — do not use it. Phase 1 strips them before any new design work begins. The only design source of truth from Phase 2 onward is the Figma v3 design system.
- **Google Analytics is preserved as-is.** Don't modify, reinstall, or "improve" the existing GA setup. Phase 7 verifies it still fires correctly after the rebuild. That's it.
- **Design tokens are sacred.** No hardcoded hex, px, or font weights in components. Always reference `tokens.css` / `@theme` block.
- **Copy comes from Figma verbatim.** Don't rewrite, don't improve, don't add.
- **One phase = one branch + one PR.** No compound changes.
- **No auto-deploy to prod.** Preview deploys only. Tristan promotes to prod manually.
- **Don't touch `/signup` form/submit logic.** Visual refresh only.
- **Don't install packages without flagging first.**
- **If Figma is ambiguous, ask Tristan. Don't guess.**

---

## Communication

Tristan is non-technical. Explain plainly. Lead with preview links over screenshots over prose. Don't dump stack traces — walk through fixes step by step.

---

## Files maintained

- `AGENTS.md` — this file
- `BUILD_SEQUENCE.md` — phase plan with paste-ready prompts
- `AUDIT.md` — output of Phase 1 Stage A (KEEP / DECOMMISSION / REPLACE inventory)
- `tokens.css` / `@theme` block — generated in Phase 2 from Figma
- `PROGRESS.md` — running checklist, created in Phase 1
